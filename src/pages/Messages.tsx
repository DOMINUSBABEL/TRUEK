import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function Messages() {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
      <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Mensajes</h2>
      <p className="text-gray-500 text-center max-w-xs">
        Aquí aparecerán tus chats cuando inicies un trueque con otro usuario.
      </p>
    </div>
  );
}
