import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Spin, message, Select, DatePicker, Space
} from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  UserOutlined, MessageOutlined, WhatsAppOutlined, BarChartOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, summaryRes] = await Promise.all([
        axios.get('http://localhost:3000/api/analytics'),
        axios.get('http://localhost:3000/api/analytics/summary')
      ]);

      setAnalytics(Array.isArray(analyticsRes.data) ? analyticsRes.data : []);
      setSummary(summaryRes.data);
    } catch (error) {
      message.error('فشل في تحميل التحليلات');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    // Implement filtering by date range
    console.log('Date range changed:', dates);
  };

  // Prepare data for charts
  const userActivityData = (analytics || []).slice(-7).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.active_users,
    messages: item.messages_received
  }));

  const messageTypeData = (analytics || []).slice(-7).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    incoming: item.messages_received,
    outgoing: item.messages_sent
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
          التحليلات والإحصائيات
        </h1>

        <Space>
          <RangePicker
            onChange={handleDateRangeChange}
            placeholder={['من تاريخ', 'إلى تاريخ']}
          />
          <Select defaultValue="7days" style={{ width: 120 }}>
            <Option value="7days">آخر 7 أيام</Option>
            <Option value="30days">آخر 30 يوم</Option>
            <Option value="90days">آخر 90 يوم</Option>
          </Select>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <UserOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {summary?.total_users || 0}
              </div>
              <div style={{ color: '#666' }}>إجمالي المستخدمين</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <MessageOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {summary?.messages_today || 0}
              </div>
              <div style={{ color: '#666' }}>الرسائل اليوم</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <WhatsAppOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {analytics.length > 0 ? analytics[analytics.length - 1].engagement_rate : 0}%
              </div>
              <div style={{ color: '#666' }}>معدل التفاعل</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <BarChartOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {analytics.length > 0 ? analytics[analytics.length - 1].new_users : 0}
              </div>
              <div style={{ color: '#666' }}>مستخدمين جدد</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16}>
        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="نشاط المستخدمين والرسائل">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#1890ff" name="المستخدمون النشطون" />
                <Bar dataKey="messages" fill="#52c41a" name="الرسائل الواردة" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="حركة الرسائل">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={messageTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="incoming" stroke="#52c41a" name="واردة" />
                <Line type="monotone" dataKey="outgoing" stroke="#1890ff" name="صادرة" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* User Types Distribution */}
      <Row gutter={16}>
        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="توزيع أنواع المستخدمين">
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'conic-gradient(#1890ff 70%, #52c41a 30%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 'bold'
                  }}>
                    70%
                  </div>
                </div>
                <div>عادي</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'conic-gradient(#faad14 30%, #d9d9d9 30%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 'bold'
                  }}>
                    30%
                  </div>
                </div>
                <div>VIP</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="إحصائيات إضافية">
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <strong>متوسط الرسائل اليومية:</strong>
                <span style={{ float: 'left' }}>
                  {analytics.length > 0 ?
                    Math.round(analytics.reduce((sum, item) => sum + item.messages_received, 0) / analytics.length)
                    : 0}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <strong>أعلى يوم نشاط:</strong>
                <span style={{ float: 'left' }}>
                  {analytics.length > 0 ?
                    new Date(analytics.reduce((max, item) =>
                      item.messages_received > max.messages_received ? item : max
                    ).date).toLocaleDateString('ar-SA')
                    : 'غير محدد'}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <strong>معدل النمو:</strong>
                <span style={{ float: 'left' }}>
                  {analytics.length > 1 ?
                    `${((analytics[analytics.length - 1].active_users - analytics[0].active_users) /
                      analytics[0].active_users * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
