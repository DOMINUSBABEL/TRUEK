import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Messages() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Fetch other user's details
        let otherUser = { displayName: 'Usuario Desconocido', photoURL: '' };
        if (otherUserId) {
          const userDocs = await getDocs(query(collection(db, 'users'), where('uid', '==', otherUserId)));
          if (!userDocs.empty) {
            otherUser = userDocs.docs[0].data() as any;
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
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <p className="text-gray-400 font-medium max-w-xs">
            No messages yet. Chats will appear here when you start a trade.
          </p>
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
