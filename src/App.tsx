/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

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
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-neutral text-gray-500">Loading...</div>}>
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
