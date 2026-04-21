## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2026-04-21 - [Firestore N+1 Queries in Map Iterators]
**Learning:** In Trades.tsx, performing individual `getDoc` calls for each relationship inside a mapping loop creates a severe N+1 bottleneck, causing slower rendering and dramatically increasing Firestore read counts.
**Action:** Always extract related document IDs into a Set, then use a chunked batch approach (`where(documentId(), 'in', chunk)`) maxing out at 30 items per query. Store results in a dictionary (`Record<string, any>`) for O(1) state reconstruction instead of using `Promise.all` inside loops.
