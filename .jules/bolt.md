## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2024-05-16 - Route-based Code Splitting
**Learning:** The monolithic bundle size exceeded 880kB gzipped because all page components were statically imported in `App.tsx`.
**Action:** Implemented React.lazy and Suspense boundaries (wrapping `<Outlet />` and top-level independent routes) to defer loading non-critical page components, reducing the initial chunk size by over 80% (to ~209kB).
