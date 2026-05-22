## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2026-05-22 - Route-Based Code Splitting
**Learning:** Standard static imports for route components in React Router cause the entire application to be bundled into a single large JavaScript file, slowing down initial page load time.
**Action:** Implemented route-based code splitting using `React.lazy()` and `<Suspense>` boundaries in `App.tsx` and `Layout.tsx`. This allows Webpack/Vite to split each route into its own chunk, loaded on-demand, reducing the initial bundle size.
