import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Typography, Menu, theme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const Home = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout>
      <Layout.Sider>
        <Menu
          items={[
            {
              key: 1,
              icon: <HomeOutlined />,
              label: 'Home',
            },
          ]}
        />
      </Layout.Sider>
      <Layout>
        {/* <Layout.Header>Header</Layout.Header> */}
        <Layout.Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <Typography.Title>Home</Typography.Title>
          <Typography.Paragraph>
            Lorem ipsum dolor sit amet
          </Typography.Paragraph>
        </Layout.Content>
        {/* <Layout.Footer>Footer</Layout.Footer> */}
      </Layout>
    </Layout>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
