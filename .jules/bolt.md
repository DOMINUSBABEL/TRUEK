## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-05-24 - Dynamic imports with React.lazy
**Learning:** Using `React.lazy()` for route-level code splitting significantly improves the initial bundle size. I implemented route-based code splitting using `React.lazy` and `Suspense` for all pages in `src/App.tsx`. The initial chunk `index.js` was reduced, and each route was separated into its own chunk (e.g. `Home`, `Profile`, `ItemDetail`, etc.).
**Action:** When working on React applications using React Router, consider implementing dynamic imports for route components to speed up the initial load time.
