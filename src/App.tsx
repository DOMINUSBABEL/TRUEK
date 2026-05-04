/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

// Route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const AddItem = lazy(() => import('./pages/AddItem'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Trades = lazy(() => import('./pages/Trades'));
const Messages = lazy(() => import('./pages/Messages'));
const Challenge = lazy(() => import('./pages/Challenge'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));

// Simple fallback component for generic Suspense (e.g. ChatRoom outside Layout)
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
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
          <Route path="/chat/:id" element={
            <Suspense fallback={<PageLoader />}>
              <ChatRoom />
            </Suspense>
          } />
        </Routes>
        <Toaster position="top-center" />
      </HashRouter>
    </AuthProvider>
  );
}
