## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-06-25 - [Firestore batched documentId 'in' queries]
**Learning:** When fetching related documents mapped in a one-to-many relationship inside a component (e.g. trades and their offered/target items), a `Promise.all` wrapping individual `getDoc` calls results in severe N+1 request waterfalls that lock up the frontend.
**Action:** Extract all required unique IDs into a `Set`, convert to an array, and use batched `getDocs(query(collection, where(documentId(), 'in', chunk)))` requests, being sure to slice chunks to a maximum of 30 elements to respect Firestore query limits. Build a temporary `Map` to assign the fetched relationships back onto the original dataset in O(1) time.
