## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-10-27 - [Firestore Array Mapping N+1 Optimization]
**Learning:** Mapping over Firestore query results to fetch related documents (e.g., mapping trades to fetch `targetItem` and `offeredItem`) causes 2 * N database queries. Since multiple trades often reference the same items, many of these are duplicate reads.
**Action:** Extract distinct related entity IDs into a `Set`, use `Promise.all` to fetch the unique documents concurrently, store them in a local cache dictionary (`Record<string, any>`), and then map the original results using `O(1)` dictionary lookups.
