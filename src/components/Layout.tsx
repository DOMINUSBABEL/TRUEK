import React, { Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, MessageCircle, User, Trophy, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

// Simple fallback component for Suspense inside Layout
const PageLoader = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'VAULT' },
    { path: '/trades', icon: Trophy, label: 'HISTORY' }, // Reusing Trophy for now, or maybe ArrowLeftRight
    { path: '/add', icon: PlusSquare, label: 'EXCHANGE' },
    { path: '/messages', icon: MessageCircle, label: 'MESSAGES' },
    { path: '/profile', icon: User, label: 'CURATOR' },
  ];

  return (
    <div className="min-h-screen bg-neutral flex flex-col font-sans text-gray-100">
      <header className="bg-neutral/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary tracking-widest uppercase font-heading">
            Truekio
          </Link>
          {user && (
            <div className="flex items-center space-x-4">
              <button
                aria-label="Notificaciones"
                className="text-gray-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-full p-1"
              >
                <Bell className="w-5 h-5" />
              </button>
              <Link
                to="/profile"
                aria-label="Perfil de usuario"
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-full block"
              >
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=7C4DFF&color=fff`}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full border-2 border-surface-light object-cover"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full pb-28">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      {user && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-50">
          <div className="bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-[2rem] flex justify-around items-center p-2 shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-label={item.label}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    isActive 
                      ? "bg-primary/20 text-primary" 
                      : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
