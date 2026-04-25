## 2024-05-17 - Firebase N+1 getDoc queries inside loops
**Learning:** Found instances of N+1 database calls (e.g. `Promise.all(docs.map(doc => getDoc(...)))`) when mapping related Firestore records in Trades and ItemDetail components. This kills performance and wastes Firebase reads.
**Action:** Replace `getDoc` calls in loops with batched `where(documentId(), 'in', chunk)` queries. Remember to chunk the target IDs array into sizes of 30, since Firestore places a hard limit of 30 elements on `in` clauses, and map results to a local dictionary (O(1) lookup) to assign back to the entities.
