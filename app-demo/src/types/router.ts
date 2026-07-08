import type { router } from '../app/router.ts';

// Registers the app's router instance with TanStack Router so `Link` targets, `useNavigate`, route
// params, and loader/beforeLoad context are fully typed across the app. Colocated here (mirroring
// api-demo's src/types) rather than in app/router.ts to keep module augmentations in one place.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export {};
