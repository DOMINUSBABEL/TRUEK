## 2025-02-28 - ItemDetail.tsx N+1 Offers Issue

**Learning:** We identified a severe N+1 query issue in the `ItemDetail` component when auction owners view their item. The app was performing an individual `getDoc` read for every offered item and offerer user for each pending trade proposal.
**Action:** Implemented the concurrent `in` chunking optimization pattern using `Map`s for O(1) dictionary lookups to fetch batches of missing entity data in large concurrent chunks (30 doc limit) instead of sequentially per offer.
