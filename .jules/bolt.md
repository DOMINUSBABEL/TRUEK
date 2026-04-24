## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2023-10-24 - Firestore N+1 Batch Fetching
**Learning:** Firestore `in` queries with `documentId()` are a highly effective way to resolve N+1 query problems in React loops/maps, but Firestore limits `in` queries to 30 elements.
**Action:** When batching Firestore document lookups, always chunk the ID array to a max size of 30, and map the fetched results to an `O(1)` dictionary (`Record<string, any>`) to efficiently preserve the original order during reconstruction.
