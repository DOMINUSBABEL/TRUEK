/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// ⚡ Bolt: Route-based Code Splitting Optimization
// 💡 What: Replaced static imports with React.lazy for all page components.
// 🎯 Why: Solves the Vite warning "Some chunks are larger than 500 kB" by breaking
//         the large monolithic bundle into smaller, route-specific chunks.
// 📊 Impact: Significantly reduces initial load time and Main Thread blocking.
//            The browser only downloads the JS needed for the current route.
const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const AddItem = lazy(() => import('./pages/AddItem'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Trades = lazy(() => import('./pages/Trades'));
const Messages = lazy(() => import('./pages/Messages'));
const Challenge = lazy(() => import('./pages/Challenge'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));

// Simple loading fallback for Suspense boundary, styled consistently with the app
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-neutral text-primary">
    Cargando...
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
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
