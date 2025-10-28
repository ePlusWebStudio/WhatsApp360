import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Button, Modal, Form, Input, Select, Space } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  BookOutlined,
  WhatsAppOutlined,
  QuestionCircleOutlined,
  BarChartOutlined,
  PlusOutlined,
  SendOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch health status first
      try {
        const healthResponse = await axios.get('http://localhost:3000/health', { timeout: 3000 });
        setHealth(healthResponse.data);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        setHealth({ status: 'ERROR', message: 'الخادم غير متصل' });
      }

      // Try to fetch stats
      try {
        const statsResponse = await axios.get('http://localhost:3000/admin/dashboard/stats', { timeout: 3000 });
        setStats(statsResponse.data);
      } catch (statsError) {
        console.error('Stats fetch failed:', statsError);
        setStats(null);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setHealth({ status: 'ERROR', message: 'خطأ في الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (type) => {
    setModalType(type);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (modalType === 'user') {
        try {
          await axios.post('http://localhost:3000/api/users', values);
          message.success('تم إضافة المستخدم بنجاح');
        } catch (error) {
          if (error.response?.status === 400) {
            message.error(error.response.data.error || 'بيانات غير صحيحة');
          } else if (error.response?.status === 409) {
            message.error('رقم الهاتف موجود بالفعل في النظام');
          } else if (error.response?.status === 500) {
            message.error('خطأ في الخادم: ' + (error.response.data.error || 'حاول مرة أخرى'));
          } else {
            message.error('فشل في إضافة المستخدم: ' + (error.message || 'خطأ غير معروف'));
          }
          throw error;
        }
      } else if (modalType === 'faq') {
        const keywords = values.keywords
          ? values.keywords.split(',').map(k => k.trim()).filter(k => k)
          : [];
        await axios.post('http://localhost:3000/api/faq', {
          ...values,
          keywords: keywords,
          category: values.category || 'general'
        });
        message.success('تم إضافة السؤال بنجاح');
      } else if (modalType === 'course') {
        await axios.post('http://localhost:3000/api/courses', values);
        message.success('تم إضافة الدورة بنجاح');
      } else if (modalType === 'message') {
        try {
          let response;
          try {
            // Try admin endpoint first
            response = await axios.post('http://localhost:3000/admin/messages/bulk-send', {
              message: values.message,
              target_audience: values.target_group
            });
          } catch (adminError) {
            // Fallback to api endpoint
            console.log('Admin endpoint failed, trying fallback:', adminError.message);
            response = await axios.post('http://localhost:3000/api/messages/bulk-send', {
              message: values.message,
              target_audience: values.target_group
            });
          }
          message.success(`تم إرسال الرسالة إلى ${response.data.total} مستخدم بنجاح`);
        } catch (error) {
          message.error('فشل في إرسال الرسالة: ' + (error.response?.data?.error || error.message));
          throw error;
        }
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      // Error message already shown above
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'user': return 'إضافة مستخدم جديد';
      case 'faq': return 'إضافة سؤال شائع';
      case 'course': return 'إضافة دورة جديدة';
      case 'message': return 'إرسال رسالة جماعية';
      default: return '';
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'user':
        return (
          <>
            <Form.Item
              name="name"
              label="الاسم"
              rules={[{ required: true, message: 'يرجى إدخال الاسم' }]}
            >
              <Input placeholder="أدخل اسم المستخدم" />
            </Form.Item>
            <Form.Item
              name="phone_number"
              label="رقم الهاتف"
              rules={[
                { required: true, message: 'يرجى إدخال رقم الهاتف' },
                { 
                  pattern: /^(\+\d{1,3}[- ]?)?\d{7,15}$/, 
                  message: 'يرجى إدخال رقم هاتف صحيح (مثال: +966501234567 أو 0501234567)' 
                }
              ]}
            >
              <Input placeholder="+966501234567 أو 0501234567" />
            </Form.Item>
          </>
        );
      case 'faq':
        return (
          <>
            <Form.Item
              name="question"
              label="السؤال"
              rules={[{ required: true, message: 'يرجى إدخال السؤال' }]}
            >
              <Input.TextArea placeholder="أدخل السؤال" rows={3} />
            </Form.Item>
            <Form.Item
              name="answer"
              label="الإجابة"
              rules={[{ required: true, message: 'يرجى إدخال الإجابة' }]}
            >
              <Input.TextArea placeholder="أدخل الإجابة" rows={4} />
            </Form.Item>
            <Form.Item
              name="keywords"
              label="الكلمات المفتاحية"
            >
              <Input placeholder="افصل بين الكلمات بفاصلة" />
            </Form.Item>
          </>
        );
      case 'course':
        return (
          <>
            <Form.Item
              name="title"
              label="عنوان الدورة"
              rules={[{ required: true, message: 'يرجى إدخال عنوان الدورة' }]}
            >
              <Input placeholder="أدخل عنوان الدورة" />
            </Form.Item>
            <Form.Item
              name="instructor"
              label="المدرب"
            >
              <Input placeholder="اسم المدرب" />
            </Form.Item>
          </>
        );
      case 'message':
        return (
          <>
            <Form.Item
              name="message"
              label="الرسالة"
              rules={[{ required: true, message: 'يرجى إدخال الرسالة' }]}
            >
              <Input.TextArea placeholder="أدخل نص الرسالة" rows={4} />
            </Form.Item>
            <Form.Item
              name="target_group"
              label="المجموعة المستهدفة"
              initialValue="all"
            >
              <Select>
                <Select.Option value="all">جميع المستخدمين</Select.Option>
                <Select.Option value="vip">VIP فقط</Select.Option>
                <Select.Option value="active">المستخدمين النشطين</Select.Option>
              </Select>
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        لوحة التحكم الرئيسية
      </h1>

      {/* System Status */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: health?.status === 'OK' ? '#52c41a' : '#ff4d4f',
                animation: health?.status === 'OK' ? 'none' : 'pulse 1s infinite'
              }}></div>
              <div>
                <h3 style={{ margin: 0 }}>
                  حالة النظام: {health?.status === 'OK' ? '✅ يعمل بشكل طبيعي' : '❌ الخادم غير متصل'}
                </h3>
                <p style={{ margin: 0, color: health?.status === 'OK' ? '#52c41a' : '#ff4d4f' }}>
                  {health?.status === 'OK' ? 'الخادم متصل وجاهز' : 'تحقق من الخادم - قد لا يكون قيد التشغيل'}
                  {health?.timestamp && ` • آخر تحديث: ${new Date(health.timestamp).toLocaleTimeString('ar-SA')}`}
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="إجمالي المستخدمين"
              value={stats?.users?.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <p className="stats-label">
              نشط: {stats?.users?.active_users || 0}
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="الرسائل اليوم"
              value={stats?.messages?.messages_today || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <p className="stats-label">
              واردة: {stats?.messages?.incoming_messages || 0}
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="الدورات"
              value={stats?.courses?.total_courses || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <p className="stats-label">
              قادمة: {stats?.courses?.upcoming_courses || 0}
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="معدل التفاعل"
              value={stats?.users?.avg_engagement || 0}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <p className="stats-label">
              متوسط النشاط
            </p>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="الإجراءات السريعة" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => handleQuickAction('user')}
                  style={{ height: 60, fontSize: 14 }}
                >
                  إضافة مستخدم
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  block
                  icon={<QuestionCircleOutlined />}
                  onClick={() => handleQuickAction('faq')}
                  style={{ height: 60, fontSize: 14 }}
                >
                  إضافة سؤال شائع
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  block
                  icon={<BookOutlined />}
                  onClick={() => handleQuickAction('course')}
                  style={{ height: 60, fontSize: 14 }}
                >
                  إضافة دورة
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  block
                  icon={<SendOutlined />}
                  onClick={() => handleQuickAction('message')}
                  style={{ height: 60, fontSize: 14 }}
                >
                  إرسال رسالة
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Features Overview */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="نظرة عامة على الميزات">
            <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
              <WhatsAppOutlined style={{ fontSize: 48, marginBottom: 16, color: '#25D366' }} />
              <h3>مرحباً بك في لوحة تحكم WhatsApp360 Bot</h3>
              <p>استخدم الإجراءات السريعة أعلاه أو القائمة الجانبية للوصول إلى الميزات المختلفة</p>
              <ul style={{ textAlign: 'right', marginTop: 20, display: 'inline-block' }}>
                <li>📊 عرض التحليلات والإحصائيات المفصلة</li>
                <li>👥 إدارة المستخدمين والأعضاء</li>
                <li>❓ إدارة الأسئلة الشائعة والإجابات</li>
                <li>📚 إدارة الدورات والفعاليات</li>
                <li>📱 إرسال رسائل جماعية</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal for Quick Actions */}
      <Modal
        title={getModalTitle()}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {renderModalContent()}
          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit">
                تأكيد
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
