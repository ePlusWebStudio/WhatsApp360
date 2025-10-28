import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, message, Space, Tag
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, WhatsAppOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      // Ensure data is always an array
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('فشل في تحميل المستخدمين');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      Modal.confirm({
        title: 'تأكيد الحذف',
        content: 'هل أنت متأكد من حذف هذا المستخدم؟',
        okText: 'نعم',
        cancelText: 'لا',
        onOk: async () => {
          try {
            await axios.delete(`http://localhost:3000/api/users/${userId}`);
            message.success('تم حذف المستخدم بنجاح');
            await fetchUsers();
          } catch (error) {
            message.error('فشل في حذف المستخدم: ' + (error.response?.data?.error || error.message));
          }
        }
      });
    } catch (error) {
      message.error('فشل في حذف المستخدم');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update user
        try {
          await axios.put(`http://localhost:3000/api/users/${editingUser.id}`, values);
          message.success('تم تحديث المستخدم بنجاح');
          setModalVisible(false);
          form.resetFields();
          await fetchUsers();
        } catch (error) {
          message.error('فشل في تحديث المستخدم: ' + (error.response?.data?.error || error.message));
        }
      } else {
        // Add new user
        try {
          const response = await axios.post('http://localhost:3000/api/users', values);
          message.success('تم إضافة المستخدم بنجاح');
          setModalVisible(false);
          form.resetFields();
          // Refresh the list immediately
          await fetchUsers();
        } catch (error) {
          if (error.response?.status === 409) {
            message.error('رقم الهاتف موجود بالفعل في النظام');
          } else if (error.response?.status === 400) {
            message.error(error.response.data.error || 'بيانات غير صحيحة');
          } else {
            message.error('فشل في إضافة المستخدم: ' + (error.response?.data?.error || error.message));
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || 'غير محدد',
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (phone) => (
        <Space>
          <WhatsAppOutlined style={{ color: '#25D366' }} />
          {phone}
        </Space>
      ),
    },
    {
      title: 'النوع',
      dataIndex: 'user_type',
      key: 'user_type',
      render: (type) => (
        <Tag color={type === 'vip' ? 'gold' : 'blue'}>
          {type === 'vip' ? 'VIP' : 'عادي'}
        </Tag>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ الانضمام',
      dataIndex: 'joined_at',
      key: 'joined_at',
      render: (date) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            تعديل
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
          إدارة المستخدمين
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          إضافة مستخدم جديد
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} مستخدم`,
        }}
      />

      <Modal
        title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
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

          <Form.Item
            name="user_type"
            label="نوع المستخدم"
            initialValue="regular"
          >
            <Select>
              <Option value="regular">عادي</Option>
              <Option value="vip">VIP</Option>
              <Option value="admin">مدير</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'تحديث' : 'إضافة'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
