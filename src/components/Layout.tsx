import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, MessageCircle, User, ArrowLeftRight, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Explorar' },
    { path: '/challenge', icon: Trophy, label: 'Reto' },
    { path: '/add', icon: PlusSquare, label: 'Publicar' },
    { path: '/messages', icon: MessageCircle, label: 'Mensajes' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <ArrowLeftRight className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
            <span>Truekio</span>
          </Link>
          {user && (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {user.displayName?.split(' ')[0]}
              </span>
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                alt="Avatar"
                className="w-9 h-9 rounded-full ring-2 ring-indigo-100 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full bg-gray-50 shadow-sm pb-24">
        <Outlet />
      </main>

      {user && (
        <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                    isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
