## 2024-05-24 - [Vite Bundling Optimization]
**Learning:** The initial Vite configuration was producing a monolithic main chunk (> 500kB warning). Route-based code splitting using React.lazy() and Suspense works effectively out of the box with the default Vite setup to break this chunk down.
**Action:** When adding new pages/routes in App.tsx, always use `lazy(() => import('./pages/NewPage'))` instead of static imports to maintain optimal bundle sizes.
