import React, { useState } from 'react';
import { ipcLink } from 'electron-trpc/renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
// import { useMediaQuery } from 'react-responsive';
import handleError from 'renderer/errorhandling';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout, Result, Button, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import Home from 'renderer/pages/Home';
import Browse from 'renderer/pages/Browse';
import Menu from 'renderer/components/Menu';
import superjson from 'common/superjson';
import { trpc } from './trpc';

const FallbackComponent = ({ error }: FallbackProps) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout.Content
      style={{
        padding: 24,
        background: colorBgContainer,
        overflow: 'auto',
      }}
    >
      <Result
        status="error"
        title="Whoops! An error occurred"
        subTitle={String(error)}
        extra={
          <Button
            type="primary"
            key="refresh"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        }
      />
    </Layout.Content>
  );
};
export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [ipcLink()],
      transformer: superjson,
    })
  );

  // TODO: Enable dark mode (adjust theme and icons)
  const prefersDarkMode = false; /* useMediaQuery({
    query: '(prefers-color-scheme: dark)',
  }); */

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ConfigProvider
            theme={{
              algorithm: prefersDarkMode
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
            }}
            locale={enUS}
          >
            <Layout style={{ height: '100vh' }}>
              <ErrorBoundary
                FallbackComponent={FallbackComponent}
                onError={handleError}
              >
                <Layout.Sider>
                  <Menu />
                </Layout.Sider>
                <Layout>
                  {/* <Layout.Header>Header</Layout.Header> */}
                  {React.createElement(() => {
                    const {
                      token: { colorBgContainer },
                    } = theme.useToken();

                    return (
                      <Layout.Content
                        style={{
                          padding: 24,
                          background: colorBgContainer,
                          overflow: 'auto',
                        }}
                      >
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/browse" element={<Browse />} />
                        </Routes>
                      </Layout.Content>
                    );
                  })}
                  {/* <Layout.Footer>Footer</Layout.Footer> */}
                </Layout>
              </ErrorBoundary>
            </Layout>
          </ConfigProvider>
        </Router>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
