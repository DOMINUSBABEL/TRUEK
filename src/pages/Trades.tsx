import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, or, doc, setDoc, getDoc, updateDoc, limit, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowRightLeft, MessageCircle, CheckCircle, XCircle, Search, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Trades() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      
      // ⚡ Bolt: Fixed N+1 query problem by batching item document fetches.
      // Expected impact: Drastically reduces Firestore reads (from 2 * N to roughly 1 + N/30 reads) and improves loading speed significantly.

      const tradeDocs = snapshot.docs;
      const itemIdsToFetch = new Set<string>();

      tradeDocs.forEach(doc => {
        const data = doc.data();
        if (data.targetItemId) itemIdsToFetch.add(data.targetItemId);
        if (data.offeredItemId) itemIdsToFetch.add(data.offeredItemId);
      });

      const uniqueItemIds = Array.from(itemIdsToFetch);
      const itemsMap: Record<string, any> = {};

      // Firestore limits 'in' queries to 30 elements
      for (let i = 0; i < uniqueItemIds.length; i += 30) {
        const chunk = uniqueItemIds.slice(i, i + 30);
        if (chunk.length > 0) {
          const itemsQuery = query(collection(db, 'items'), where(documentId(), 'in', chunk));
          const itemsSnapshot = await getDocs(itemsQuery);
          itemsSnapshot.forEach(itemDoc => {
            itemsMap[itemDoc.id] = itemDoc.data();
          });
        }
      }

      const tradesWithDetails = tradeDocs.map((tradeDoc) => {
        const data = tradeDoc.data();
        return {
          id: tradeDoc.id,
          ...data,
          targetItem: itemsMap[data.targetItemId] || null,
          offeredItem: itemsMap[data.offeredItemId] || null
        };
      });
      
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

  const filteredTrades = trades.filter(trade => {
    const query = searchQuery.toLowerCase();
    const isMyOffer = trade.offererId === user.uid;
    const myItemTitle = (isMyOffer ? trade.offeredItem?.title : trade.targetItem?.title) || '';
    const theirItemTitle = (isMyOffer ? trade.targetItem?.title : trade.offeredItem?.title) || '';
    
    return myItemTitle.toLowerCase().includes(query) || 
           theirItemTitle.toLowerCase().includes(query) ||
           trade.status.toLowerCase().includes(query);
  });

  return (
    <div className="p-6 pb-32 bg-neutral min-h-screen">
      <h2 className="text-3xl font-heading font-bold text-white mb-6">My Trades</h2>
      
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by item title or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-surface border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-[2rem] border border-white/5 shadow-lg flex flex-col items-center">
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-full h-full bg-surface-light rounded-full border border-white/10 flex items-center justify-center shadow-xl">
              <Inbox className="w-12 h-12 text-primary/80" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-neutral rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-heading font-bold text-white mb-2">No trades found</h3>
          <p className="text-gray-400 font-medium max-w-xs mb-8">
            {searchQuery ? "We couldn't find any trades matching your search." : "You haven't made or received any trade offers yet."}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold tracking-widest uppercase py-3.5 px-8 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(124,77,255,0.3)]"
            >
              Explore Items
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrades.map(trade => {
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
