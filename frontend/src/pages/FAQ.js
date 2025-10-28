import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, message, Space, Tag, Input as AntInput
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = AntInput;
const { Option } = Select;

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/faq');
      setFaqs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('فشل في تحميل الأسئلة الشائعة');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingFAQ(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    form.setFieldsValue({
      ...faq,
      keywords: faq.keywords ? JSON.parse(faq.keywords).join(', ') : ''
    });
    setModalVisible(true);
  };

  const handleDelete = async (faqId) => {
    try {
      await axios.delete(`http://localhost:3000/api/faq/${faqId}`);
      message.success('تم حذف السؤال بنجاح');
      fetchFAQs();
    } catch (error) {
      message.error('فشل في حذف السؤال');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const keywords = values.keywords
        ? values.keywords.split(',').map(k => k.trim()).filter(k => k)
        : [];

      const data = {
        ...values,
        keywords: keywords,
        category: values.category || 'general'
      };

      if (editingFAQ) {
        await axios.put(`http://localhost:3000/api/faq/${editingFAQ.id}`, data);
        message.success('تم تحديث السؤال بنجاح');
      } else {
        await axios.post('http://localhost:3000/api/faq', data);
        message.success('تم إضافة السؤال بنجاح');
      }

      setModalVisible(false);
      fetchFAQs();
    } catch (error) {
      message.error('فشل في حفظ السؤال');
    }
  };

  const handleSearch = async (value) => {
    if (!value.trim()) {
      fetchFAQs();
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/faq/search?q=${encodeURIComponent(value)}`);
      setFaqs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('فشل في البحث');
      setFaqs([]);
    }
  };

  const filteredFAQs = (faqs || []).filter(faq =>
    faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'السؤال',
      dataIndex: 'question',
      key: 'question',
      width: '30%',
      render: (text) => (
        <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: 'الإجابة',
      dataIndex: 'answer',
      key: 'answer',
      width: '40%',
      render: (text) => (
        <div style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: 'الفئة',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category || 'عام'}</Tag>
      ),
    },
    {
      title: 'الاستخدام',
      dataIndex: 'usage_count',
      key: 'usage_count',
      render: (count) => (
        <Tag color={count > 10 ? 'green' : count > 5 ? 'orange' : 'red'}>
          {count || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.usage_count || 0) - (b.usage_count || 0),
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
          إدارة الأسئلة الشائعة
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          إضافة سؤال جديد
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <AntInput
          placeholder="البحث في الأسئلة الشائعة..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={(e) => handleSearch(e.target.value)}
          style={{ width: 400 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredFAQs}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} سؤال`,
        }}
      />

      <Modal
        title={editingFAQ ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
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
            name="question"
            label="السؤال"
            rules={[{ required: true, message: 'يرجى إدخال السؤال' }]}
          >
            <TextArea
              placeholder="أدخل السؤال"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="answer"
            label="الإجابة"
            rules={[{ required: true, message: 'يرجى إدخال الإجابة' }]}
          >
            <TextArea
              placeholder="أدخل الإجابة"
              rows={6}
            />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="الكلمات المفتاحية"
            help="افصل بين الكلمات بفاصلة (مثال: تسجيل, دورات, كيف)"
          >
            <Input placeholder="كلمات مفتاحية للبحث" />
          </Form.Item>

          <Form.Item
            name="category"
            label="الفئة"
            initialValue="general"
          >
            <Select>
              <Option value="general">عام</Option>
              <Option value="courses">الدورات</Option>
              <Option value="support">الدعم الفني</Option>
              <Option value="payment">الدفع</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit">
                {editingFAQ ? 'تحديث' : 'إضافة'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FAQ;
