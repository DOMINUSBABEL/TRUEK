/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

// ⚡ Bolt Performance Optimization: Route-based code splitting
// Lazy load page components to significantly reduce the initial JavaScript bundle size.
// This improves Time to Interactive (TTI) by only loading the code required for the current route.
const Home = React.lazy(() => import('./pages/Home'));
const AddItem = React.lazy(() => import('./pages/AddItem'));
const ItemDetail = React.lazy(() => import('./pages/ItemDetail'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Trades = React.lazy(() => import('./pages/Trades'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Challenge = React.lazy(() => import('./pages/Challenge'));
const ChatRoom = React.lazy(() => import('./pages/ChatRoom'));

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
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen bg-neutral">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <ChatRoom />
            </Suspense>
          } />
        </Routes>
        <Toaster position="top-center" />
      </HashRouter>
    </AuthProvider>
  );
}
