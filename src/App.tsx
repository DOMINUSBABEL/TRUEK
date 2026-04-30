/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const AddItem = lazy(() => import('./pages/AddItem'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Trades = lazy(() => import('./pages/Trades'));
const Messages = lazy(() => import('./pages/Messages'));
const Challenge = lazy(() => import('./pages/Challenge'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));

// A simple loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="add" element={<AddItem />} />
              <Route path="item/:id" element={<ItemDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="trades" element={<Trades />} />
              <Route path="messages" element={<Messages />} />
              <Route path="challenge" element={<Challenge />} />
            </Route>
            <Route path="/chat/:id" element={<ChatRoom />} />
          </Routes>
        </Suspense>
        <Toaster position="top-center" />
      </HashRouter>
    </AuthProvider>
  );
}
