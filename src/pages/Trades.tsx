import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, or, doc, setDoc, getDoc, updateDoc, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowRightLeft, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Trades() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'trades'),
        or(
          where('offererId', '==', user.uid),
          where('targetOwnerId', '==', user.uid)
        )
      );
      const snapshot = await getDocs(q);
      
      const tradesWithDetails = await Promise.all(snapshot.docs.map(async (tradeDoc) => {
        const data = tradeDoc.data();
        const targetItemDoc = await getDoc(doc(db, 'items', data.targetItemId));
        const offeredItemDoc = await getDoc(doc(db, 'items', data.offeredItemId));
        return {
          id: tradeDoc.id,
          ...data,
          targetItem: targetItemDoc.exists() ? targetItemDoc.data() : null,
          offeredItem: offeredItemDoc.exists() ? offeredItemDoc.data() : null
        };
      }));
      
      setTrades(tradesWithDetails.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

  const startChat = async (otherUserId: string) => {
    if (!user) return;
    
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    const snapshot = await getDocs(q);
    
    let existingChatId = null;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(otherUserId)) {
        existingChatId = doc.id;
      }
    });

    if (existingChatId) {
      navigate(`/chat/${existingChatId}`);
    } else {
      const newChatRef = doc(collection(db, 'chats'));
      await setDoc(newChatRef, {
        id: newChatRef.id,
        participants: [user.uid, otherUserId],
        updatedAt: new Date().toISOString()
      });
      navigate(`/chat/${newChatRef.id}`);
    }
  };

  const updateChallengeIfActive = async (userId: string, oldItemId: string, newItemId: string) => {
    const q = query(collection(db, 'challenges'), where('userId', '==', userId), where('status', '==', 'active'), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const challengeDoc = snap.docs[0];
      const challengeData = challengeDoc.data();
      const history = challengeData.history || [];
      // If the old item is the last one in the history, append the new item
      if (history.length > 0 && history[history.length - 1] === oldItemId) {
        await updateDoc(doc(db, 'challenges', challengeDoc.id), {
          history: [...history, newItemId]
        });
        
        // Update user's tradeScore
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentScore = userSnap.data().tradeScore || 0;
          await updateDoc(userRef, { tradeScore: currentScore + 10 });
        }
      }
    }
  };

  const handleAccept = async (trade: any) => {
    try {
      // Update trade status
      await updateDoc(doc(db, 'trades', trade.id), { status: 'accepted' });
      
      // Update items status
      await updateDoc(doc(db, 'items', trade.targetItemId), { status: 'traded' });
      await updateDoc(doc(db, 'items', trade.offeredItemId), { status: 'traded' });

      // Reject other pending trades for these items
      const q = query(collection(db, 'trades'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      for (const tDoc of snapshot.docs) {
        const tData = tDoc.data();
        if (tData.id !== trade.id && (tData.targetItemId === trade.targetItemId || tData.offeredItemId === trade.offeredItemId || tData.targetItemId === trade.offeredItemId || tData.offeredItemId === trade.targetItemId)) {
          await updateDoc(doc(db, 'trades', tData.id), { status: 'rejected' });
        }
      }

      // Update challenges
      await updateChallengeIfActive(trade.targetOwnerId, trade.targetItemId, trade.offeredItemId);
      await updateChallengeIfActive(trade.offererId, trade.offeredItemId, trade.targetItemId);

      toast.success('¡Trueque aceptado!');
      fetchTrades();
    } catch (error) {
      console.error("Error accepting trade:", error);
      toast.error('Error al aceptar el trueque');
    }
  };

  const handleReject = async (tradeId: string) => {
    try {
      await updateDoc(doc(db, 'trades', tradeId), { status: 'rejected' });
      toast.success('Trueque rechazado');
      fetchTrades();
    } catch (error) {
      console.error("Error rejecting trade:", error);
      toast.error('Error al rechazar el trueque');
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 pb-32 bg-neutral min-h-screen">
      <h2 className="text-3xl font-heading font-bold text-white mb-8">My Trades</h2>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : trades.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-[2rem] border border-white/5 shadow-lg">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeft className="w-8 h-8 text-primary" />
          </div>
          <p className="text-gray-400 font-medium">No active trades.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {trades.map(trade => {
            const isMyOffer = trade.offererId === user.uid;
            const otherUserId = isMyOffer ? trade.targetOwnerId : trade.offererId;
            
            return (
              <div key={trade.id} className="bg-surface p-5 rounded-[2rem] border border-white/5 shadow-lg">
                <div className="flex justify-between items-center mb-5">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                    trade.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    trade.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    trade.status === 'completed' ? 'bg-primary/10 text-primary border-primary/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {trade.status === 'pending' ? 'Pending' : trade.status === 'accepted' ? 'Accepted' : trade.status === 'completed' ? 'Completed' : 'Rejected'}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
                      {isMyOffer ? 'You offered' : 'They offered'}
                    </span>
                    <button 
                      onClick={() => startChat(otherUserId)}
                      className="p-2.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
                      title="Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 flex flex-col items-center text-center">
                    <img src={isMyOffer ? trade.offeredItem?.imageUrl : trade.targetItem?.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover mb-3 border border-white/10 shadow-md" />
                    <span className="text-sm font-heading font-bold text-white line-clamp-1">{isMyOffer ? trade.offeredItem?.title : trade.targetItem?.title}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-tertiary mt-1">Your Asset</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral flex items-center justify-center mx-2 border border-white/5 flex-shrink-0">
                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 flex flex-col items-center text-center">
                    <img src={isMyOffer ? trade.targetItem?.imageUrl : trade.offeredItem?.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover mb-3 border border-white/10 shadow-md" />
                    <span className="text-sm font-heading font-bold text-white line-clamp-1">{isMyOffer ? trade.targetItem?.title : trade.offeredItem?.title}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mt-1">Their Asset</span>
                  </div>
                </div>

                {!isMyOffer && trade.status === 'pending' && (
                  <div className="flex space-x-3 mt-6 pt-5 border-t border-white/5">
                    <button 
                      onClick={() => handleReject(trade.id)}
                      className="flex-1 py-3.5 bg-red-500/10 text-red-500 text-xs font-bold tracking-widest uppercase rounded-full hover:bg-red-500/20 transition-colors flex items-center justify-center border border-red-500/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                    <button 
                      onClick={() => handleAccept(trade)}
                      className="flex-1 py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-full hover:bg-primary-hover transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(124,77,255,0.3)]"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
