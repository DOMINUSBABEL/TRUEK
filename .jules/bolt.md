## 2024-04-05 - Vite Build Overwriting
**Learning:** Overwriting `vite.config.ts` entirely removes critical pre-existing environment configurations (like `process.env.GEMINI_API_KEY`, path aliases, and HMR settings).
**Action:** When updating build config, always patch the existing config rather than completely replacing it.
