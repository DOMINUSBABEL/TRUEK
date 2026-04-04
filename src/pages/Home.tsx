import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Home() {
  const { user, signInWithGoogle } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'items'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Sorting
    if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'newest') {
      // Already sorted by newest from Firestore, but re-sort just in case
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [items, searchTerm, selectedCategory, sortBy]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-24 h-24 bg-white shadow-xl rounded-3xl flex items-center justify-center mb-6 transform rotate-3">
          <span className="text-5xl">🔄</span>
        </div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Truekio</h1>
        <p className="text-gray-600 mb-10 text-lg max-w-xs font-medium leading-relaxed">Tus cosas son tu moneda.<br/>Intercambia sin usar dinero.</p>
        <button
          onClick={signInWithGoogle}
          className="w-full max-w-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all active:scale-95 text-lg"
        >
          Entrar con Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50">
      <div className="mb-6 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Descubre</h2>
        <p className="text-gray-500 text-sm mb-5">Encuentra tu próximo trueque cerca de ti</p>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            <input 
              type="text" 
              placeholder="Buscar objetos..." 
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl transition-all outline-none font-medium placeholder:text-gray-400 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <select 
              className="bg-gray-50 border border-gray-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-gray-700 whitespace-nowrap shadow-sm cursor-pointer hover:bg-gray-100 transition-colors appearance-none pr-8 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              <option value="electronics">💻 Electrónica</option>
              <option value="fashion">👕 Moda</option>
              <option value="home">🏠 Hogar</option>
              <option value="sports">⚽ Deportes</option>
              <option value="gaming">🎮 Videojuegos</option>
              <option value="other">📦 Otro</option>
            </select>
            
            <select 
              className="bg-gray-50 border border-gray-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-gray-700 whitespace-nowrap shadow-sm cursor-pointer hover:bg-gray-100 transition-colors appearance-none pr-8 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl aspect-[3/4]"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron artículos.</p>
          {searchTerm || selectedCategory !== 'all' ? (
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="text-indigo-600 font-medium mt-2 inline-block"
            >
              Limpiar filtros
            </button>
          ) : (
            <Link to="/add" className="text-indigo-600 font-medium mt-2 inline-block">
              ¡Sé el primero en publicar!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-4">
          {filteredItems.map(item => (
            <Link key={item.id} to={`/item/${item.id}`} className="group block bg-white rounded-3xl p-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-inner">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {item.isAuction && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Subasta
                  </div>
                )}
              </div>
              <div className="px-1 pb-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{item.title}</h3>
                <div className="flex items-center text-[11px] text-gray-500 space-x-2">
                  <span className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded-md">
                    <MapPin className="w-3 h-3 mr-1 text-indigo-400" />
                    <span className="truncate max-w-[60px]">{item.location || 'Local'}</span>
                  </span>
                  <span className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 mr-1 text-indigo-400" />
                    <span className="truncate max-w-[60px]">
                      {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es }).replace('hace ', '') : ''}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
