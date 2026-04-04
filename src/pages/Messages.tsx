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
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mensajes</h2>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center p-4 bg-gray-100 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 max-w-xs">
            Aún no tienes mensajes. Los chats aparecerán aquí cuando inicies un trueque.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map(chat => (
            <Link 
              key={chat.id} 
              to={`/chat/${chat.id}`}
              className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
            >
              <img 
                src={chat.otherUser.photoURL || `https://ui-avatars.com/api/?name=${chat.otherUser.displayName}`} 
                alt={chat.otherUser.displayName} 
                className="w-12 h-12 rounded-full mr-4"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">{chat.otherUser.displayName}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {chat.updatedAt ? formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: es }) : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage || 'Nuevo chat'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 ml-2" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
