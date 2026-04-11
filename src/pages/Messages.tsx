import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronRight, MailOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cache to prevent N+1 queries when snapshot updates
  const userCache = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatPromises = snapshot.docs.map(async (chatDoc) => {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find((id: string) => id !== user.uid);
        
        // Fetch other user's details with caching and direct doc lookup
        let otherUser = { displayName: 'Usuario Desconocido', photoURL: '' };
        if (otherUserId) {
          if (userCache.current[otherUserId]) {
            otherUser = userCache.current[otherUserId];
          } else {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              otherUser = userDoc.data() as any;
              userCache.current[otherUserId] = otherUser;
            }
          }
        }

        return {
          id: chatDoc.id,
          ...chatData,
          otherUser
        };
      });

      const resolvedChats = await Promise.all(chatPromises);
      setChats(resolvedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-6 pb-32 bg-neutral min-h-screen">
      <h2 className="text-3xl font-heading font-bold text-white mb-8">Messages</h2>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center p-5 bg-surface rounded-[2rem] border border-white/5">
              <div className="w-14 h-14 bg-white/5 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/5 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-white/5 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-surface rounded-[2rem] border border-white/5 shadow-lg">
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-full h-full bg-surface-light rounded-full border border-white/10 flex items-center justify-center shadow-xl">
              <MailOpen className="w-12 h-12 text-primary/80" />
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-neutral rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                <MessageCircle className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-heading font-bold text-white mb-2">Your inbox is quiet</h3>
          <p className="text-gray-400 font-medium max-w-xs mb-8">
            Start a trade to open a direct channel with other curators.
          </p>
          <button 
            onClick={() => navigate('/trades')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold tracking-widest uppercase py-3.5 px-8 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(124,77,255,0.3)]"
          >
            View Trades
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map(chat => (
            <Link 
              key={chat.id} 
              to={`/chat/${chat.id}`}
              className="flex items-center p-5 bg-surface border border-white/5 rounded-[2rem] shadow-lg hover:bg-white/5 transition-colors group"
            >
              <img 
                src={chat.otherUser.photoURL || `https://ui-avatars.com/api/?name=${chat.otherUser.displayName}&background=7C4DFF&color=fff`} 
                alt={chat.otherUser.displayName} 
                className="w-14 h-14 rounded-full mr-4 border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-heading font-bold text-white truncate pr-2">{chat.otherUser.displayName}</h3>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 whitespace-nowrap">
                    {chat.updatedAt ? formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: es }) : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage || 'New chat'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors ml-3" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
