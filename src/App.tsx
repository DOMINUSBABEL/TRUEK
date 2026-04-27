/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

// ⚡ Bolt Performance Optimization:
// Use route-based code splitting to reduce the initial bundle size.
// Only loads the JavaScript for the specific page being visited.
const Home = lazy(() => import('./pages/Home'));
const AddItem = lazy(() => import('./pages/AddItem'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Trades = lazy(() => import('./pages/Trades'));
const Messages = lazy(() => import('./pages/Messages'));
const Challenge = lazy(() => import('./pages/Challenge'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));

function SuspenseFallback() {
  return (
    <div className="flex justify-center items-center h-full min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Suspense fallback={<SuspenseFallback />}><Home /></Suspense>} />
            <Route path="add" element={<Suspense fallback={<SuspenseFallback />}><AddItem /></Suspense>} />
            <Route path="item/:id" element={<Suspense fallback={<SuspenseFallback />}><ItemDetail /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={<SuspenseFallback />}><Profile /></Suspense>} />
            <Route path="trades" element={<Suspense fallback={<SuspenseFallback />}><Trades /></Suspense>} />
            <Route path="messages" element={<Suspense fallback={<SuspenseFallback />}><Messages /></Suspense>} />
            <Route path="challenge" element={<Suspense fallback={<SuspenseFallback />}><Challenge /></Suspense>} />
          </Route>
          <Route path="/chat/:id" element={<Suspense fallback={<SuspenseFallback />}><ChatRoom /></Suspense>} />
        </Routes>
        <Toaster position="top-center" />
      </HashRouter>
    </AuthProvider>
  );
}
