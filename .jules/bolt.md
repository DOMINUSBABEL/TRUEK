## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-05-25 - [Firestore Global Query Anti-pattern]
**Learning:** Found an `O(N)` query on the `trades` collection filtering purely by `status == 'pending'` when accepting a trade, to find other trades for the same items to reject. In a large database, this reads the entire global pending trade pool, causing enormous unnecessary reads and N+1 client-side processing latency.
**Action:** Always constrain Firestore queries for relationships first (e.g. `where('itemId', 'in', itemsToReject)`), using an `or()` clause if needed for two-way bindings (offerer/target), and then filter by generic attributes (`status == 'pending'`) either in query or client-side to minimize document reads to only `O(1)` directly affected records.
