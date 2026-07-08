import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { App as AntApp, Button, ConfigProvider, Result } from 'antd';
import * as Sentry from '@sentry/react';

import { initSentry } from './lib/sentry.ts';
import { queryClient } from './app/query-client.ts';
import { router } from './app/router.ts';

// Before render, so page-load/navigation instrumentation and error capture cover the whole app.
initSentry(router);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AntApp>
          <Sentry.ErrorBoundary
            fallback={({
              resetError,
            }) => (
              <Result
                status='error'
                title='Something went wrong'
                extra={(
                  <Button type='primary' onClick={resetError}>
                    Try again
                  </Button>
                )}
              />
            )}
          >
            <RouterProvider router={router} />
          </Sentry.ErrorBoundary>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
);
