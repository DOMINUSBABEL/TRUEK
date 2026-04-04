import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where, doc, setDoc, getDoc } from 'firebase/firestore';
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
            
            // Fetch history items
            const historyItems = await Promise.all(
              challengeData.history.map(async (itemId: string) => {
                const itemDoc = await getDoc(doc(db, 'items', itemId));
                return itemDoc.exists() ? { id: itemDoc.id, ...itemDoc.data() } : null;
              })
            );
            setChallengeHistory(historyItems.filter(Boolean));
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
    <div className="p-4 pb-24">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">El Reto del Trueque</h2>
          <Trophy className="w-8 h-8 text-yellow-300" />
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
          Inspirado en el reto del clip rojo. Empieza con algo pequeño y haz trueques hasta conseguir algo de gran valor. ¡Sube en la tabla de posiciones!
        </p>
        
        {user && !activeChallenge && !loading && (
          <button 
            onClick={handleStartClick}
            className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl text-sm w-full shadow-sm flex justify-center items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Iniciar mi Reto
          </button>
        )}
      </div>

      {activeChallenge && challengeHistory.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Tu Evolución
          </h3>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide items-center">
            {challengeHistory.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="flex-shrink-0 w-32">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2 border-2 border-indigo-100">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-semibold text-center text-gray-900 line-clamp-1">{item.title}</p>
                </div>
                {index < challengeHistory.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-300 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Medal className="w-5 h-5 mr-2 text-amber-500" />
          Top Truequeros
        </h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center p-4 bg-gray-100 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aún no hay líderes. ¡Sé el primero en hacer un trueque!
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((leader, index) => (
            <div key={leader.id} className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm relative overflow-hidden">
              {index < 3 && (
                <div className={`absolute top-0 left-0 w-1 h-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-amber-600'}`}></div>
              )}
              
              <div className="w-8 font-bold text-gray-400 flex justify-center">
                {index === 0 ? <Medal className="w-6 h-6 text-yellow-400" /> : 
                 index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> : 
                 index === 2 ? <Medal className="w-6 h-6 text-amber-600" /> : 
                 `#${index + 1}`}
              </div>
              
              <img 
                src={leader.photoURL || `https://ui-avatars.com/api/?name=${leader.displayName}`} 
                alt={leader.displayName} 
                className="w-12 h-12 rounded-full border-2 border-gray-50 mx-3"
                referrerPolicy="no-referrer"
              />
              
              <div className="flex-1">
                <p className="font-bold text-gray-900">{leader.displayName}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  ⭐ {leader.reputation || 5.0}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-black text-indigo-600">{leader.tradeScore || 0}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Puntos</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Challenge Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Elige tu objeto inicial</h3>
              <button onClick={() => setShowStartModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {myItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tienes artículos publicados para empezar el reto.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto mb-6">
                {myItems.map(myItem => (
                  <label 
                    key={myItem.id} 
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedItem === myItem.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input 
                      type="radio" 
                      name="myItem" 
                      value={myItem.id} 
                      checked={selectedItem === myItem.id}
                      onChange={() => setSelectedItem(myItem.id)}
                      className="sr-only"
                    />
                    <img src={myItem.imageUrl} alt={myItem.title} className="w-12 h-12 rounded-lg object-cover mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{myItem.title}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedItem === myItem.id ? 'border-indigo-600' : 'border-gray-300'}`}>
                      {selectedItem === myItem.id && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {myItems.length > 0 && (
              <button
                onClick={startChallenge}
                disabled={!selectedItem}
                className="w-full bg-indigo-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Comenzar Reto
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
