import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import FAQ from './pages/FAQ';
import Courses from './pages/Courses';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import './App.css';

const { Content } = Layout;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout style={{ minHeight: '100vh', direction: 'rtl' }}>
      <Sidebar onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout style={{ marginRight: collapsed ? 80 : 250, transition: 'margin-right 0.2s' }}>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 4 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
