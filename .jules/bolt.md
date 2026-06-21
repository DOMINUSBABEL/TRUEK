## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2025-03-10 - O(1) Local Caching with Firestore 'in' queries
**Learning:** Firestore N+1 queries during mapping operations (e.g. mapping over trade documents to fetch target and offered item docs via `getDoc`) lead to severe latency, with 2N+1 round trips. Firestore supports 'in' queries, but limits them to 30 elements.
**Action:** Extract distinct item IDs into a `Set`, chunk them to arrays of max 30 length, fetch concurrently with `Promise.all` and `where(documentId(), 'in', chunk)`, and map results to a local dictionary (`Record<string, any>`) to reconstruct component state in `O(1)` operations.

## 2024-06-21 - Optimize overlapping trades check
**Learning:** Checking for related overlapping documents (e.g., rejecting other pending trades involving the same items) using a generic status query (e.g., fetching all 'pending' trades) causes a full collection scan and scales poorly as the application grows ($O(N)$ data transfer).
**Action:** Replace generic queries with specific, concurrent queries scoped by related entity IDs using `in` operator and `Promise.all()`, fetching only the subset of documents actually needed and filtering them locally to avoid large N+1 payload transfers.
