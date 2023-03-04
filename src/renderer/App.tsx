import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import handleError from 'renderer/errorhandling';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Typography, ConfigProvider, Layout, theme } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import enUS from 'antd/locale/en_US';
import Home from 'renderer/pages/Home';
import Browse from 'renderer/pages/Browse';
import Menu from 'renderer/components/Menu';

const FallbackComponent = ({ error }: FallbackProps) => (
  <div
    style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ExclamationCircleOutlined color="red" />
      <Typography.Title>Oops! Something went wrong.</Typography.Title>
      <Typography.Text>An error has occurred: {String(error)}</Typography.Text>
    </div>
  </div>
);

export default function App() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Router>
      <ConfigProvider locale={enUS}>
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onError={handleError}
        >
          <Layout style={{ height: '100vh' }}>
            <Layout.Sider>
              <Menu />
            </Layout.Sider>
            <Layout>
              {/* <Layout.Header>Header</Layout.Header> */}
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
              {/* <PropertySider /> */}
              {/* <Layout.Footer>Footer</Layout.Footer> */}
            </Layout>
          </Layout>
        </ErrorBoundary>
      </ConfigProvider>
    </Router>
  );
}
