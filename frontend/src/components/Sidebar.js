import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  BarChartOutlined,
  LogoutOutlined,
  WhatsAppOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ onLogout, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'لوحة التحكم',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'إدارة المستخدمين',
    },
    {
      key: '/faq',
      icon: <QuestionCircleOutlined />,
      label: 'الأسئلة الشائعة',
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: 'الدورات',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'التحليلات',
    },
  ];

  const handleMenuClick = (item) => {
    navigate(item.key);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        تسجيل الخروج
      </Menu.Item>
    </Menu>
  );

  return (
    <Sider
      width={250}
      collapsedWidth={80}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="admin-sider"
      style={{
        position: 'fixed',
        height: '100vh',
        right: 0,
        zIndex: 1000,
        background: '#001529',
        overflow: 'auto',
      }}
      trigger={null}
    >
      <div className="admin-logo" style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: collapsed ? 24 : 18,
        fontWeight: 'bold',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0 16px',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <WhatsAppOutlined style={{ marginLeft: collapsed ? 0 : 8 }} />
        {!collapsed && 'WhatsApp360'}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="admin-menu"
        style={{ marginTop: 16 }}
      />

      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <Tooltip title={collapsed ? 'توسيع' : 'طي'} placement="top">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: 'white',
              width: '100%',
              height: 40,
            }}
          />
        </Tooltip>

        <Dropdown overlay={userMenu} placement="topRight">
          <Button
            type="text"
            style={{
              width: '100%',
              color: 'white',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 40,
            }}
          >
            <Avatar icon={<UserOutlined />} size={24} />
            {!collapsed && <span>المدير</span>}
          </Button>
        </Dropdown>
      </div>
    </Sider>
  );
};

export default Sidebar;
