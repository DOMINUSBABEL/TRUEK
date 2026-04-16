## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.
## 2024-05-24 - [Firestore N+1 Query Batching]
**Learning:** Sequential `getDoc` calls within `Promise.all` loops for retrieving related entities (like items or users associated with trades) cause severe N+1 query proliferation.
**Action:** Extract unique document IDs, use a `Set` to deduplicate, split them into chunks of up to 30 (due to Firestore limits), and use `where(documentId(), 'in', chunk)` with `getDocs` to batch fetch related data into lookup maps.
