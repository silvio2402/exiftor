import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useMediaQuery } from 'react-responsive';
import handleError from 'renderer/errorhandling';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout, Result, Button, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import Home from 'renderer/pages/Home';
import Browse from 'renderer/pages/Browse';
import Menu from 'renderer/components/Menu';

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
  const prefersDarkMode = useMediaQuery({
    query: '(prefers-color-scheme: dark)',
  });

  return (
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
              {/* <PropertySider /> */}
              {/* <Layout.Footer>Footer</Layout.Footer> */}
            </Layout>
          </ErrorBoundary>
        </Layout>
      </ConfigProvider>
    </Router>
  );
}
