## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2025-03-10 - O(1) Local Caching with Firestore 'in' queries
**Learning:** Firestore N+1 queries during mapping operations (e.g. mapping over trade documents to fetch target and offered item docs via `getDoc`) lead to severe latency, with 2N+1 round trips. Firestore supports 'in' queries, but limits them to 30 elements.
**Action:** Extract distinct item IDs into a `Set`, chunk them to arrays of max 30 length, fetch concurrently with `Promise.all` and `where(documentId(), 'in', chunk)`, and map results to a local dictionary (`Record<string, any>`) to reconstruct component state in `O(1)` operations.
## 2024-05-18 - Atomic Trade Acceptance
**Learning:** Sequential `updateDoc` calls for rejecting counter-offers during a trade acceptance creates an N+1 write bottleneck, which can lead to partial state (inconsistent DB) if one write fails.
**Action:** Use Firestore's `writeBatch` to bundle all item status updates, the accepted trade update, and all rejected trade updates into a single atomic O(1) network request, significantly improving consistency and speed.
