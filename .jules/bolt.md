## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-05-24 - [Trades Firestore N+1 Optimization]
**Learning:** In the `Trades.tsx` component, iterating through a list of fetched trades and performing independent `getDoc()` calls for `targetItem` and `offeredItem` results in a severe O(N) read operation (an N+1 bottleneck), causing heavy latency and blocking execution.
**Action:** Extract all unique document references into a `Set`, convert it to an array, and chunk it up to a maximum of 30 items per batch. Run a single Firestore batched `where(documentId(), 'in', chunk)` query instead, map the resulting snapshots into a `Record<string, any>` dictionary, and hydrate the trades using this local cache lookup.
