import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchChatDetails = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', id));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find((pId: string) => pId !== user.uid);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            setOtherUser(userDoc.data());
          }
        }
      }
    };

    fetchChatDetails();

    const q = query(
      collection(db, 'chats', id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [id, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messageRef = doc(collection(db, 'chats', id, 'messages'));
      await setDoc(messageRef, {
        id: messageRef.id,
        chatId: id,
        senderId: user.uid,
        text: messageText,
        createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'chats', id), {
        lastMessage: messageText,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      toast.error("Error al enviar mensaje");
    }
  };

  const startVideoCall = () => {
    toast('Función de videollamada en desarrollo', { icon: '🎥' });
    // Here we would navigate to a VideoCall component passing the chatId
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-16 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          {otherUser && (
            <div className="flex items-center">
              <img 
                src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.displayName}`} 
                alt={otherUser.displayName} 
                className="w-10 h-10 rounded-full mr-3"
                referrerPolicy="no-referrer"
              />
              <h2 className="font-bold text-gray-900">{otherUser.displayName}</h2>
            </div>
          )}
        </div>
        <button onClick={startVideoCall} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
          <Video className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === user.uid;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMine 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 pb-safe">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full px-4 py-2.5 outline-none transition-all"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
