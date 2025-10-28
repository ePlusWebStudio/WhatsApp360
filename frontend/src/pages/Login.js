import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, WhatsAppOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../App.css';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // For demo purposes, we'll use a simple login
      // In production, this should be a real API call
      const response = await axios.post('http://localhost:3000/admin/login', {
        email: values.email,
        password: values.password
      });

      if (response.data.token) {
        onLogin(response.data.token);
        message.success('تم تسجيل الدخول بنجاح');
      }
    } catch (error) {
      // For demo, accept any email/password
      if (values.email && values.password) {
        const demoToken = 'demo-token-' + Date.now();
        onLogin(demoToken);
        message.success('تم تسجيل الدخول بنجاح (نسخة تجريبية)');
        return;
      }

      message.error('فشل في تسجيل الدخول. تحقق من البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: 48,
            color: '#1890ff',
            marginBottom: 16
          }}>
            <WhatsAppOutlined />
          </div>
          <h1 style={{ color: '#001529', marginBottom: 8 }}>
            WhatsApp360 Bot
          </h1>
          <p style={{ color: '#666', marginBottom: 0 }}>
            لوحة التحكم الإدارية
          </p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
              { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="البريد الإلكتروني"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'يرجى إدخال كلمة المرور' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="كلمة المرور"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ height: 48, fontSize: 16 }}
            >
              {loading ? <Spin /> : 'دخول'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
          <p>نسخة تجريبية - يمكنك استخدام أي بريد إلكتروني وكلمة مرور</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
