import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where, doc, setDoc, getDoc, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, TrendingUp, Medal, ArrowRight, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Challenge() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [challengeHistory, setChallengeHistory] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Leaderboard
        const q = query(
          collection(db, 'users'),
          orderBy('tradeScore', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch User's Active Challenge
        if (user) {
          const challengeQ = query(
            collection(db, 'challenges'),
            where('userId', '==', user.uid),
            where('status', '==', 'active'),
            limit(1)
          );
          const challengeSnap = await getDocs(challengeQ);
          if (!challengeSnap.empty) {
            const challengeData = challengeSnap.docs[0].data();
            setActiveChallenge({ id: challengeSnap.docs[0].id, ...challengeData });
            
            // Fetch history items - Optimization: Batch fetch items to avoid N+1 query problem
            const historyItemIds = challengeData.history || [];
            if (historyItemIds.length > 0) {
              const itemDocsRecord: Record<string, any> = {};
              // Firestore limits 'in' queries to 30 elements
              const chunkSize = 30;
              for (let i = 0; i < historyItemIds.length; i += chunkSize) {
                const chunk = historyItemIds.slice(i, i + chunkSize);
                const itemsQuery = query(collection(db, 'items'), where(documentId(), 'in', chunk));
                const itemsSnap = await getDocs(itemsQuery);
                itemsSnap.docs.forEach(docSnap => {
                  itemDocsRecord[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
                });
              }

              // Reconstruct in original order
              const historyItems = historyItemIds
                .map((id: string) => itemDocsRecord[id])
                .filter(Boolean);

              setChallengeHistory(historyItems);
            } else {
              setChallengeHistory([]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fetchMyItems = async () => {
    if (!user) return;
    const q = query(collection(db, 'items'), where('ownerId', '==', user.uid), where('status', '==', 'available'));
    const snapshot = await getDocs(q);
    setMyItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleStartClick = () => {
    fetchMyItems();
    setShowStartModal(true);
  };

  const startChallenge = async () => {
    if (!user || !selectedItem) return;
    try {
      const challengeRef = doc(collection(db, 'challenges'));
      await setDoc(challengeRef, {
        id: challengeRef.id,
        userId: user.uid,
        history: [selectedItem],
        status: 'active',
        createdAt: new Date().toISOString()
      });
      toast.success('¡Reto iniciado!');
      setShowStartModal(false);
      window.location.reload(); // Simple reload to fetch new state
    } catch (error) {
      console.error("Error starting challenge:", error);
      toast.error('Error al iniciar el reto');
    }
  };

  return (
    <div className="p-6 pb-32 bg-neutral min-h-screen">
      <div className="bg-gradient-to-br from-primary to-tertiary rounded-[2rem] p-8 text-white mb-8 shadow-[0_0_30px_rgba(124,77,255,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-3xl font-heading font-bold">Truekio Challenge</h2>
          <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
        </div>
        <p className="text-white/80 text-sm leading-relaxed mb-6 relative z-10 font-medium">
          Inspired by the red paperclip challenge. Start small and trade your way up to something of great value. Climb the leaderboard!
        </p>
        
        {user && !activeChallenge && !loading && (
          <button 
            onClick={handleStartClick}
            className="bg-white text-primary font-bold tracking-widest uppercase text-xs py-4 px-6 rounded-full w-full shadow-lg flex justify-center items-center hover:bg-gray-100 transition-colors relative z-10"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Start My Challenge
          </button>
        )}
      </div>

      {activeChallenge && challengeHistory.length > 0 && (
        <div className="mb-10">
          <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-primary" />
            Your Evolution
          </h3>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide items-center">
            {challengeHistory.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="flex-shrink-0 w-32">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-surface mb-3 border border-white/10 shadow-lg">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-center text-gray-300 line-clamp-1">{item.title}</p>
                </div>
                {index < challengeHistory.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-heading font-bold text-white flex items-center">
          <Medal className="w-6 h-6 mr-3 text-yellow-500" />
          Top Traders
        </h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center p-5 bg-surface rounded-[2rem] border border-white/5">
              <div className="w-14 h-14 bg-white/5 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/5 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-white/5 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-surface rounded-[2rem] border border-white/5">
          No leaders yet. Be the first to make a trade!
        </div>
      ) : (
        <div className="space-y-4">
          {leaders.map((leader, index) => (
            <div key={leader.id} className="flex items-center p-5 bg-surface border border-white/5 rounded-[2rem] shadow-lg relative overflow-hidden group hover:bg-white/5 transition-colors">
              {index < 3 && (
                <div className={`absolute top-0 left-0 w-1.5 h-full ${index === 0 ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : index === 1 ? 'bg-gray-300' : 'bg-amber-600'}`}></div>
              )}
              
              <div className="w-10 font-heading font-bold text-gray-500 flex justify-center text-lg">
                {index === 0 ? <Medal className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" /> : 
                 index === 1 ? <Medal className="w-7 h-7 text-gray-300" /> : 
                 index === 2 ? <Medal className="w-7 h-7 text-amber-600" /> : 
                 `#${index + 1}`}
              </div>
              
              <img 
                src={leader.photoURL || `https://ui-avatars.com/api/?name=${leader.displayName}&background=7C4DFF&color=fff`} 
                alt={leader.displayName} 
                className="w-14 h-14 rounded-full border-2 border-white/10 mx-4"
                referrerPolicy="no-referrer"
              />
              
              <div className="flex-1">
                <p className="font-heading font-bold text-white text-lg">{leader.displayName}</p>
                <p className="text-xs text-yellow-500 flex items-center font-bold mt-1">
                  ⭐ {leader.reputation || 5.0}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-black text-primary drop-shadow-[0_0_10px_rgba(124,77,255,0.3)]">{leader.tradeScore || 0}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Points</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Challenge Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface border border-white/10 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-8 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-heading font-bold text-white">Choose your starting item</h3>
              <button onClick={() => setShowStartModal(false)} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">✕</button>
            </div>
            
            {myItems.length === 0 ? (
              <div className="text-center py-12 bg-neutral rounded-2xl border border-white/5">
                <p className="text-gray-400 mb-4 font-medium">You don't have any published items to start the challenge.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {myItems.map(myItem => (
                  <label 
                    key={myItem.id} 
                    className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${selectedItem === myItem.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(124,77,255,0.1)]' : 'border-white/10 bg-neutral hover:bg-white/5'}`}
                  >
                    <input 
                      type="radio" 
                      name="myItem" 
                      value={myItem.id} 
                      checked={selectedItem === myItem.id}
                      onChange={() => setSelectedItem(myItem.id)}
                      className="sr-only"
                    />
                    <img src={myItem.imageUrl} alt={myItem.title} className="w-14 h-14 rounded-xl object-cover mr-4 border border-white/10" />
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{myItem.title}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedItem === myItem.id ? 'border-primary' : 'border-gray-600'}`}>
                      {selectedItem === myItem.id && <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(124,77,255,0.8)]" />}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {myItems.length > 0 && (
              <button
                onClick={startChallenge}
                disabled={!selectedItem}
                className="w-full bg-primary disabled:bg-surface-light disabled:text-gray-500 text-white font-bold tracking-widest uppercase text-xs py-4 rounded-full transition-all shadow-[0_0_20px_rgba(124,77,255,0.3)] disabled:shadow-none hover:bg-primary-hover"
              >
                Start Challenge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
