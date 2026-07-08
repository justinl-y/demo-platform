import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { App as AntApp, ConfigProvider } from 'antd';
import { render } from '@testing-library/react';

import { routeTree } from '../../src/app/router.ts';

// Renders the real app (router + query cache + providers) starting at `initialPath`, so tests
// exercise routing, guards, and pages together while MSW mocks the API. Fresh QueryClient + router
// per call for isolation between tests.
export function renderApp(initialPath = '/login') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },
    history: createMemoryHistory({
      initialEntries: [initialPath],
    }),
  });

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>,
  );

  return {
    ...utils,
    router,
    queryClient,
  };
}
