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
      console.error("Error sending message:", error);
      toast.error("Error al enviar mensaje");
    }
  };

  const startVideoCall = () => {
    toast('Función de videollamada en desarrollo', { icon: '🎥' });
    // Here we would navigate to a VideoCall component passing the chatId
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-neutral">
      {/* Header */}
      <div className="bg-surface/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-16 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          {otherUser && (
            <div className="flex items-center">
              <img 
                src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.displayName}&background=7C4DFF&color=fff`} 
                alt={otherUser.displayName} 
                className="w-10 h-10 rounded-full mr-3 border border-white/10"
                referrerPolicy="no-referrer"
              />
              <h2 className="font-heading font-bold text-white">{otherUser.displayName}</h2>
            </div>
          )}
        </div>
        <button onClick={startVideoCall} className="p-2.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors border border-primary/20">
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
                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                  isMine 
                    ? 'bg-primary text-white rounded-br-sm shadow-[0_0_15px_rgba(124,77,255,0.2)]' 
                    : 'bg-surface border border-white/5 text-gray-100 rounded-bl-sm shadow-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] font-bold tracking-widest uppercase mt-2 text-right ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-surface border-t border-white/5 p-4 pb-safe">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-neutral border border-white/10 focus:bg-surface-light focus:border-primary focus:ring-1 focus:ring-primary rounded-full px-5 py-3.5 text-white placeholder-gray-500 outline-none transition-all text-sm"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3.5 bg-primary text-white rounded-full disabled:bg-surface-light disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(124,77,255,0.3)] disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
