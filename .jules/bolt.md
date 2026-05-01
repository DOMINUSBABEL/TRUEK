## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2024-05-24 - [Firestore static N+1 Query Optimization]
**Learning:** Mapping over Firestore document references with sequential `getDoc` inside `Promise.all(snapshot.docs.map(...))` causes severe N+1 query latency and redundant network reads when multiple documents reference the same foreign keys.
**Action:** Extract distinct foreign keys into a `Set`, fetch unique documents concurrently with `Promise.all`, and construct a local lookup dictionary (`Record<string, any>`) to map the original snapshot with O(1) local lookups.
