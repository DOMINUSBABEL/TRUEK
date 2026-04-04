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
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Trueques</h2>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : trades.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
          <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes trueques activos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map(trade => {
            const isMyOffer = trade.offererId === user.uid;
            const otherUserId = isMyOffer ? trade.targetOwnerId : trade.offererId;
            
            return (
              <div key={trade.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    trade.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    trade.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    trade.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {trade.status === 'pending' ? 'Pendiente' : trade.status === 'accepted' ? 'Aceptado' : trade.status === 'completed' ? 'Completado' : 'Rechazado'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {isMyOffer ? 'Tú ofreciste' : 'Te ofrecieron'}
                    </span>
                    <button 
                      onClick={() => startChat(otherUserId)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
                      title="Chatear"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 flex flex-col items-center text-center">
                    <img src={isMyOffer ? trade.offeredItem?.imageUrl : trade.targetItem?.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover mb-2 border border-gray-200" />
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">{isMyOffer ? trade.offeredItem?.title : trade.targetItem?.title}</span>
                    <span className="text-xs text-gray-500">Tu artículo</span>
                  </div>
                  <ArrowRightLeft className="w-5 h-5 text-gray-400 mx-4 flex-shrink-0" />
                  <div className="flex-1 flex flex-col items-center text-center">
                    <img src={isMyOffer ? trade.targetItem?.imageUrl : trade.offeredItem?.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover mb-2 border border-gray-200" />
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">{isMyOffer ? trade.targetItem?.title : trade.offeredItem?.title}</span>
                    <span className="text-xs text-gray-500">Su artículo</span>
                  </div>
                </div>

                {!isMyOffer && trade.status === 'pending' && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleReject(trade.id)}
                      className="flex-1 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Rechazar
                    </button>
                    <button 
                      onClick={() => handleAccept(trade)}
                      className="flex-1 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Aceptar
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
