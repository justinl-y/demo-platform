import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

import { server } from '../mocks/server.ts';

// jsdom lacks these; antd's rc-* components reference them at render time.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

// jsdom doesn't implement scrollTo; TanStack Router calls it on navigation (scroll restoration),
// which otherwise logs a noisy "Not implemented: Window's scrollTo()" to the test output.
window.scrollTo = (() => {}) as typeof window.scrollTo;

// jsdom doesn't implement getComputedStyle for pseudo-elements; antd (tooltips, popovers, waves)
// calls getComputedStyle(el, '::before'), which otherwise logs a noisy stack-traced "Not implemented"
// warning per call. Drop the pseudo-element argument so the base style is returned.
const nativeGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((element: Element) =>
  nativeGetComputedStyle(element)) as typeof window.getComputedStyle;

// MSW lifecycle: fail on any request without a matching handler so a missing/renamed endpoint is
// caught rather than silently hanging. Reset handler overrides + auth state between tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
