import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Challenge() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('tradeScore', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error("Error al cargar la clasificación");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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
        <button className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl text-sm w-full shadow-sm">
          Ver mi progreso
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
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
    </div>
  );
}
