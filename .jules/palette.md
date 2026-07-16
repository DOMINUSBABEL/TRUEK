
## 2025-03-09 - Accessible Filter and Search Controls
**Learning:** Common utility UI elements like `<select>` dropdowns for filtering and `<input>` fields for searching often rely solely on placeholders or implicit context rather than visible `<label>` text. This makes them inaccessible to screen readers. Furthermore, accompanying decorative icons (like a `Search` icon inside an input wrapper) can create clutter or confusing announcements if not hidden.
**Action:** When adding or auditing search inputs or filter selects that lack visible text labels, always ensure an `aria-label` is applied describing their function (e.g., `"Search by item title"`, `"Filter by category"`). Accompanying decorative icons should explicitly be given `aria-hidden="true"`.
