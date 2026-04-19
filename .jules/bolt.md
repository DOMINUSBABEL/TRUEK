## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-05-24 - [Firestore N+1 Query Batch Fetching Optimization]
**Learning:** When fetching collections of documents (like Trades) where each document references multiple related entities (like items), performing individual `getDoc` calls for each reference results in massive N+1 query bottlenecks. Firestore `where('id', 'in', [...])` queries scale infinitely better.
**Action:** Always collect unique entity IDs across the entire list first, then batch fetch them in O(1) query complexity using chunked `in` queries (due to Firestore's 30-element limit on `in` clauses). Reconstruct relationships using a local dictionary map for O(1) assignment.
