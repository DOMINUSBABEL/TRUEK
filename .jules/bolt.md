## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-05-12 - Concurrent getDoc inside Array mapping
**Learning:** Found an N+1-like asynchronous sequence pattern inside an already-asynchronous Promise.all loop (e.g., in `Trades.tsx` and `ItemDetail.tsx`). Sequential `getDoc` calls for distinct documents (like `targetItemDoc` and `offeredItemDoc`) effectively doubled the latency of resolving the mapped elements.
**Action:** Always wrap multiple independent `getDoc` calls inside a map loop with a nested `Promise.all` to fetch those related documents concurrently, halving the network round-trip penalty.
