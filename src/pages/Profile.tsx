import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { LogOut, ShieldCheck, Trophy, Settings } from 'lucide-react';

export default function Profile() {
  const { user, userData, logout } = useAuth();
  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'items'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        setMyItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error("Error al cargar mis artículos");
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [user]);

  if (!user || !userData) return null;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-8rem)]">
      {/* Header Profile */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            alt={user.displayName || 'User'} 
            className="w-20 h-20 rounded-full border-4 border-white shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              {user.displayName}
              {userData.verified && <ShieldCheck className="w-5 h-5 text-green-500 ml-1" />}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center mt-1 text-sm font-medium text-amber-600">
              <Trophy className="w-4 h-4 mr-1" />
              {userData.reputation || 5.0} Reputación
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-gray-200 border-b border-gray-200">
        <div className="bg-white p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{myItems.length}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Publicados</p>
        </div>
        <div className="bg-white p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">0</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Trueques</p>
        </div>
        <div className="bg-white p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">0</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Reseñas</p>
        </div>
      </div>

      {/* My Items */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Mis Artículos</h3>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Cargando...</div>
        ) : myItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <p className="text-gray-500 mb-2">Aún no has publicado nada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {myItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="aspect-square relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-gray-700">
                    {item.status === 'available' ? 'Disponible' : item.status === 'trading' ? 'En proceso' : 'Cambiado'}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
