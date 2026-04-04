import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
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
      toast.error("Error al cargar los artículos");
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🔄</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Truekio</h1>
        <p className="text-gray-600 mb-8 text-lg">Tus cosas son tu moneda. Intercambia sin dinero.</p>
        <button
          onClick={signInWithGoogle}
          className="w-full max-w-sm bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors active:scale-95"
        >
          Entrar con Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Descubre</h2>
        <p className="text-gray-500 text-sm mb-4">Encuentra tu próximo trueque cerca de ti</p>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar objetos..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <select 
              className="bg-gray-100 text-sm px-3 py-2 rounded-lg border-none outline-none focus:ring-2 focus:ring-indigo-200"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              <option value="electronics">Electrónica</option>
              <option value="fashion">Moda</option>
              <option value="home">Hogar</option>
              <option value="sports">Deportes</option>
              <option value="gaming">Videojuegos</option>
              <option value="other">Otro</option>
            </select>
            
            <select 
              className="bg-gray-100 text-sm px-3 py-2 rounded-lg border-none outline-none focus:ring-2 focus:ring-indigo-200"
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
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <Link key={item.id} to={`/item/${item.id}`} className="group block">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 mb-2">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {item.isAuction && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Subasta
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-0.5" />
                  {item.location || 'Local'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-0.5" />
                  {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es }) : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
