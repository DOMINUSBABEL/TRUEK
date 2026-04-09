## 2024-04-09 - Suspense Fallback Circular Dependencies
**Learning:** When adding route-based code splitting using `React.lazy` and `Suspense`, placing the fallback UI component directly within structural boundaries (like `Layout.tsx` or `App.tsx` inline) can lead to circular dependencies or unmounting issues during route transitions in React Router.
**Action:** Always extract the `Suspense` fallback UI into a dedicated, standalone component (e.g., `src/components/LoadingFallback.tsx`) to keep routing configurations clean and prevent dependency cycles.
