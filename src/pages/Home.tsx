import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Search, Filter, ArrowRightLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Home() {
  const { user, signInWithGoogle, signInAsGuest } = useAuth();
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

  const auctions = useMemo(() => filteredItems.filter(item => item.isAuction), [filteredItems]);
  const regularItems = useMemo(() => filteredItems.filter(item => !item.isAuction), [filteredItems]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral p-6 text-center">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(124,77,255,0.2)]">
          <ArrowRightLeft className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-white mb-3 tracking-widest uppercase">Truekio</h1>
        <p className="text-gray-400 mb-10 text-sm max-w-[250px] leading-relaxed">Curate your collection. Exchange without money.</p>
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full bg-primary text-white text-xs font-bold tracking-widest uppercase py-4 px-8 rounded-full shadow-[0_0_20px_rgba(124,77,255,0.3)] hover:bg-primary-hover transition-all active:scale-95"
          >
            Enter Vault
          </button>
          <button
            onClick={signInAsGuest}
            className="w-full bg-surface-light text-gray-300 text-xs font-bold tracking-widest uppercase py-4 px-8 rounded-full border border-white/10 hover:bg-surface transition-all active:scale-95"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-white mb-1">Discover</h2>
        <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-6">Find your next treasure</p>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="w-full pl-12 pr-4 py-3.5 bg-surface border border-white/5 focus:bg-surface-light focus:border-primary/50 rounded-full transition-all outline-none text-sm text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <select 
              className="bg-surface text-gray-300 text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-full border border-white/5 outline-none focus:border-primary/50 appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home</option>
              <option value="sports">Sports</option>
              <option value="gaming">Gaming</option>
              <option value="other">Other</option>
            </select>
            
            <select 
              className="bg-surface text-gray-300 text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-full border border-white/5 outline-none focus:border-primary/50 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-surface rounded-[2rem] aspect-[3/4] border border-white/5"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-[2rem] border border-white/5">
          <p className="text-gray-400 text-sm mb-4">No assets found.</p>
          {searchTerm || selectedCategory !== 'all' ? (
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="text-primary text-xs font-bold tracking-widest uppercase hover:text-primary-hover transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/add" className="text-primary text-xs font-bold tracking-widest uppercase hover:text-primary-hover transition-colors">
              Be the first to publish
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {auctions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold tracking-widest text-tertiary uppercase mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Active Auctions
              </h3>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {auctions.map(item => (
                  <Link key={item.id} to={`/item/${item.id}`} className="group block w-48 flex-shrink-0">
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-surface mb-3 border border-tertiary/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-tertiary text-neutral text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        Auction
                      </div>
                    </div>
                    <h3 className="font-heading font-semibold text-white line-clamp-1 text-sm px-1">{item.title}</h3>
                    <div className="flex items-center text-[10px] font-bold tracking-widest uppercase text-gray-500 mt-1.5 space-x-2 px-1">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.location || 'Local'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            {auctions.length > 0 && <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-4">All Assets</h3>}
            <div className="grid grid-cols-2 gap-4">
              {regularItems.map(item => (
                <Link key={item.id} to={`/item/${item.id}`} className="group block">
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface mb-3 border border-white/5">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-white line-clamp-1 text-sm px-1">{item.title}</h3>
                  <div className="flex flex-col text-[9px] font-bold tracking-widest uppercase text-gray-500 mt-1.5 space-y-1 px-1">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location || 'Local'}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es }) : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
