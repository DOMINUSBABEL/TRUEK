## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2024-05-24 - [React.lazy for Route Chunking]
**Learning:** Initial application bundle was extremely large (800KB+ minified). The core Vite + React + Router architecture loaded all routes simultaneously. Code-splitting via `React.lazy()` combined with `<Suspense>` directly resolves this by splitting each route component into its own lazy-loaded chunk, dramatically reducing the initial load size.
**Action:** Always prefer route-based code splitting using `React.lazy` for top-level pages.
