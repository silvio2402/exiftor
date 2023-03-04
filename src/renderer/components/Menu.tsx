import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as AntdMenu } from 'antd';
import { HomeOutlined, FileImageOutlined } from '@ant-design/icons';
import React from 'react';

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntdMenu
      style={{ height: '100%' }}
      items={[
        {
          key: '/',
          icon: <HomeOutlined />,
          label: 'Home',
        },
        {
          key: '/browse',
          icon: <FileImageOutlined />,
          label: 'Browse',
        },
      ]}
      selectedKeys={[location.pathname]}
      onClick={({ key }) => navigate(key)}
    />
  );
};

export default Menu;
