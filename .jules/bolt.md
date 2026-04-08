## 2024-05-18 - Route-based Code Splitting

**Learning:** The initial bundle size of the application was large (>880KB) due to static imports of all page components in `App.tsx`, causing a monolithic JS file and triggering Vite's chunk size warning.
**Action:** Always implement route-based code splitting using `React.lazy` and `Suspense` when adding new page components in `src/App.tsx` to keep the main bundle size small and optimize initial load times.
