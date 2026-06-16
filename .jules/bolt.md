## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2025-03-10 - O(1) Local Caching with Firestore 'in' queries
**Learning:** Firestore N+1 queries during mapping operations (e.g. mapping over trade documents to fetch target and offered item docs via `getDoc`) lead to severe latency, with 2N+1 round trips. Firestore supports 'in' queries, but limits them to 30 elements.
**Action:** Extract distinct item IDs into a `Set`, chunk them to arrays of max 30 length, fetch concurrently with `Promise.all` and `where(documentId(), 'in', chunk)`, and map results to a local dictionary (`Record<string, any>`) to reconstruct component state in `O(1)` operations.

## 2026-06-16 - Firestore Chunked Query Optimization in Challenge History
**Learning:** The user's challenge history previously used an inefficient mapping operation calling `getDoc` inside a loop, resulting in an O(N) N+1 query problem.
**Action:** Replaced the loop with a batch fetching strategy. We used a `Set` to collect unique IDs, chunked them into groups of up to 30 elements to respect Firestore limits, fetched the chunks concurrently using `where(documentId(), 'in', chunk)`, and finally mapped the results to a dictionary for O(1) state reconstruction.
