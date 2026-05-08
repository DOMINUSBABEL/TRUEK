## 2024-05-08 - Optimize N+1 queries using Firestore 'in'
**Learning:** Firestore `in` queries have a limit of 30 items per query. When optimizing N+1 query patterns by deduplicating IDs into a Set and doing a bulk fetch instead, it's crucial to chunk the unique IDs into groups of 30 or fewer.
**Action:** Use a helper function `chunkArray(array, 30)` and `Promise.all(chunks.map(...))` to safely execute batched document fetches and store them in an `O(1)` lookup dictionary without hitting Firestore limits.
