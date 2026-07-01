## 2024-03-24 - Firestore N+1 Optimization for related collections
**Learning:** In Trades.tsx, we optimized an N+1 query issue where related items were fetched one by one using a local dictionary. We can apply a similar pattern for `Messages.tsx` or `Home.tsx` to optimize multiple nested snapshot fetching or prevent repeated lookups of user profiles.
**Action:** When a snapshot returns multiple items, chunk queries to other collections by unique IDs using Firestore `in` clauses rather than making single `getDoc` calls per item in a loop.
## 2024-03-24 - Journaling Process Note
**Learning:** Overwriting the AI tracking journal `.jules/bolt.md` using `>` destroys previous learnings.
**Action:** Always use the `>>` append operator when adding new entries to AI tracking files like `.jules/bolt.md` to preserve historical learnings.
