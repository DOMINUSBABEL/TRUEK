import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { LogOut, ShieldCheck, Star, Sparkles, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, userData, logout } = useAuth();
  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyItems = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'items'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        setMyItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching my items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [user]);

  if (!user || !userData) return null;

  return (
    <div className="min-h-screen bg-neutral px-6 py-8">
      {/* Logout Button */}
      <div className="flex justify-end mb-4">
        <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors flex items-center text-xs font-bold tracking-widest uppercase">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-110"></div>
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=7C4DFF&color=fff`} 
            alt={user.displayName || 'User'} 
            className="w-32 h-32 rounded-full border-2 border-primary/50 relative z-10 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <h1 className="text-3xl font-heading font-bold text-white text-center mb-3 leading-tight">
          {user.displayName}
        </h1>
        
        <div className="flex items-center space-x-2 mb-8">
          <div className="flex text-tertiary">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Reputation Score {userData.reputation || '9.8'}
          </span>
        </div>

        {/* Stats Pill */}
        <div className="bg-surface rounded-full px-8 py-5 flex items-center justify-center space-x-8 border border-white/5 w-full max-w-sm">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-white mb-1">{myItems.length}</p>
            <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Published</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-white mb-1">{userData.tradeScore || 0}</p>
            <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Exchanges</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-white mb-1">0</p>
            <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Reviews</p>
          </div>
        </div>
      </div>

      {/* My Items Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold tracking-widest text-white uppercase">My Items</h2>
          <button className="text-[10px] font-bold tracking-widest text-primary uppercase hover:text-primary-hover transition-colors">
            Filters
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : myItems.length === 0 ? (
          <div className="bg-surface rounded-[2rem] p-10 text-center border border-white/5 flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mb-6">
              <LayoutGrid className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-xl font-heading font-medium text-white mb-3 italic">
              Your vault awaits its first treasure
            </h3>
            <p className="text-sm text-gray-400 mb-8 max-w-[250px] leading-relaxed">
              Curate your collection of digital assets and witness the expansion of your legacy.
            </p>
            <button 
              onClick={() => navigate('/add')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold tracking-widest uppercase py-4 px-8 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(124,77,255,0.3)]"
            >
              Initiate Curator
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {myItems.map(item => (
              <div key={item.id} className="bg-surface rounded-2xl overflow-hidden border border-white/5">
                <div className="aspect-square relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-neutral/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-gray-300">
                    {item.status === 'available' ? 'Available' : item.status === 'trading' ? 'Trading' : 'Traded'}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white text-sm line-clamp-1">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        {/* Verified Identity Badge */}
        <div className="bg-surface rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <ShieldCheck className="w-6 h-6 text-white" />
            <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Verified Identity</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-heading text-white mb-1">Tier III Professional</h3>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Active Since 2021</p>
          </div>
        </div>

        {/* Legacy Status Badge */}
        <div className="bg-surface rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <Sparkles className="w-6 h-6 text-tertiary" />
            <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Legacy Status</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-heading text-white mb-1">Golden Curator</h3>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Top 1% Global Reputation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
