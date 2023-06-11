import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as AntdMenu } from 'antd';
import {
  HomeOutlined,
  FileImageOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import React from 'react';

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntdMenu
      style={{ width: '100%' }}
      mode="horizontal"
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
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Settings',
        },
      ]}
      selectedKeys={[location.pathname]}
      onClick={({ key }) => navigate(key)}
    />
  );
};

export default Menu;
