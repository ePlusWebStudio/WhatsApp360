import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Space, Tag, Select
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/courses');
      // Ensure data is always an array
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('فشل في تحميل الدورات');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      ...course,
      schedule_date: dayjs(course.schedule_date)
    });
    setModalVisible(true);
  };

  const handleDelete = async (courseId) => {
    try {
      Modal.confirm({
        title: 'تأكيد الحذف',
        content: 'هل أنت متأكد من حذف هذه الدورة؟',
        okText: 'نعم',
        cancelText: 'لا',
        onOk: async () => {
          try {
            await axios.delete(`http://localhost:3000/api/courses/${courseId}`);
            message.success('تم حذف الدورة بنجاح');
            await fetchCourses();
          } catch (error) {
            message.error('فشل في حذف الدورة: ' + (error.response?.data?.error || error.message));
          }
        }
      });
    } catch (error) {
      message.error('فشل في حذف الدورة');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        schedule_date: values.schedule_date.toISOString(),
        duration_minutes: values.duration_minutes || 60,
        materials: [] // Will be implemented later
      };

      if (editingCourse) {
        // Update course
        message.info('ميزة التحديث ستكون متاحة في التحديث القادم');
      } else {
        // Add new course
        await axios.post('http://localhost:3000/api/courses', data);
        message.success('تم إضافة الدورة بنجاح');
        setModalVisible(false);
        fetchCourses();
      }
    } catch (error) {
      message.error('فشل في حفظ الدورة');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'green';
      case 'ongoing': return 'blue';
      case 'completed': return 'gray';
      default: return 'orange';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'ongoing': return 'جاري';
      case 'completed': return 'مكتمل';
      default: return 'مسودة';
    }
  };

  const columns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
    },
    {
      title: 'المدرب',
      dataIndex: 'instructor',
      key: 'instructor',
      render: (text) => text || 'غير محدد',
    },
    {
      title: 'التاريخ والوقت',
      dataIndex: 'schedule_date',
      key: 'schedule_date',
      render: (date) => (
        <Space>
          <ClockCircleOutlined />
          {new Date(date).toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Space>
      ),
    },
    {
      title: 'المدة',
      dataIndex: 'duration_minutes',
      key: 'duration_minutes',
      render: (minutes) => `${minutes || 60} دقيقة`,
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'المشاركون',
      key: 'participants',
      render: (_, record) => (
        <span>
          {record.current_participants || 0}
          {record.max_participants && `/${record.max_participants}`}
        </span>
      ),
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
          إدارة الدورات والفعاليات
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          إضافة دورة جديدة
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} دورة`,
        }}
      />

      <Modal
        title={editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="عنوان الدورة"
            rules={[{ required: true, message: 'يرجى إدخال عنوان الدورة' }]}
          >
            <Input placeholder="أدخل عنوان الدورة" />
          </Form.Item>

          <Form.Item
            name="description"
            label="وصف الدورة"
          >
            <TextArea
              placeholder="أدخل وصف الدورة"
              rows={4}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="instructor"
              label="المدرب"
              style={{ flex: 1 }}
            >
              <Input placeholder="اسم المدرب" />
            </Form.Item>

            <Form.Item
              name="duration_minutes"
              label="المدة (دقائق)"
              style={{ flex: 1 }}
              initialValue={60}
            >
              <InputNumber
                min={30}
                max={480}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="schedule_date"
            label="تاريخ ووقت الدورة"
            rules={[{ required: true, message: 'يرجى تحديد تاريخ ووقت الدورة' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="اختر التاريخ والوقت"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="max_participants"
              label="الحد الأقصى للمشاركين"
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                max={1000}
                style={{ width: '100%' }}
                placeholder="عدد المشاركين"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="الحالة"
              style={{ flex: 1 }}
              initialValue="draft"
            >
              <Select>
                <Select.Option value="draft">مسودة</Select.Option>
                <Select.Option value="published">منشور</Select.Option>
                <Select.Option value="ongoing">جاري</Select.Option>
                <Select.Option value="completed">مكتمل</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCourse ? 'تحديث' : 'إضافة'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Courses;
