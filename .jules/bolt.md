## 2024-05-24 - [Firestore onSnapshot N+1 Optimization]
**Learning:** In React components listening to Firestore `onSnapshot` queries with related entity joins (e.g., chats with participant IDs), a state change or snapshot update triggers refetching of all related entities in a map/promise array, causing severe N+1 query proliferation and unnecessary database reads.
**Action:** Use a `useRef` as a local dictionary to cache related entity documents (like users) across snapshot updates. Also, swap O(N) queries (`getDocs(query(collection, where('uid', '==', id)))`) for O(1) document lookups (`getDoc(doc(db, 'users', id))`) if the UID acts as the document ID.

## 2024-05-24 - [Avoid nested await N+1 queries when mapping Firestore Results]
**Learning:** Sequential DB fetches inside a `.map` array callback or loop (e.g., `Promise.all(snapshot.docs.map(async doc => { await getDoc(...) }))`) will cause severe N+1 query patterns. This cascades into latency spikes and unneeded DB reads since related docs (like users or items) might be repeatedly requested.
**Action:** Always extract distinct entity IDs into a `Set` first. Then use `Promise.all` to fetch those unique docs concurrently and store them in a local dictionary (`itemsMap[doc.id] = doc.data()`). Finally, map the original results using this dictionary for `O(1)` local lookups.
