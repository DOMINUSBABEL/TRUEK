## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2024-05-16 - Vite Config Modification Dangers
**Learning:** Overwriting `vite.config.ts` entirely to add Rollup manual chunking is highly dangerous, as it destroys environment variables (like API keys) and critical dev server settings (like custom HMR disabling).
**Action:** Always extract and append to the existing Vite config rather than completely replacing it when adding build optimizations.

## 2024-05-16 - Suspense Placement on Routes
**Learning:** Wrapping the entire `<Routes>` element in a single `<Suspense>` boundary causes the core `<Layout>` shell to unmount and flash a spinner during route transitions.
**Action:** When implementing route-based code splitting, wrap each individual `<Route element={<Suspense>...}>` rather than the parent router to preserve persistent layout components.
