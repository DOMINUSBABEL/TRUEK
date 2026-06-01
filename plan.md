1. Modify `src/pages/ItemDetail.tsx` to prevent N+1 queries when fetching auction offers.
   - Import `documentId` from `firebase/firestore`.
   - Replace the `Promise.all` with `getDoc` inside a `map` loop, with a batched approach using `documentId(), 'in', chunk` for items and users.
   - Use chunks of 30 to comply with Firestore's `in` query limits.
   - Map the results into dictionaries to reconstruct the offers list in O(1) time.
2. Verify changes.
   - Run `pnpm lint && pnpm build`.
   - Run tests if applicable.
3. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
4. Submit PR.
