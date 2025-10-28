const axios = require('axios');

const API_URL = 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test Suite
async function runTests() {
  console.log('🧪 بدء اختبارات API\n');
  console.log('═'.repeat(60));

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Health Check
  console.log('\n1️⃣ اختبار صحة النظام (Health Check)');
  console.log('─'.repeat(60));
  let result = await apiCall('GET', '/health');
  if (result.success && result.status === 200) {
    console.log('✅ النظام يعمل بشكل صحيح');
    console.log(`📊 Uptime: ${result.data.uptime.toFixed(2)} ثانية`);
    passedTests++;
  } else {
    console.log('❌ فشل اختبار صحة النظام');
    failedTests++;
  }

  // Test 2: Get Users
  console.log('\n2️⃣ اختبار الحصول على المستخدمين');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/api/users');
  if (result.success && result.status === 200) {
    console.log(`✅ تم جلب المستخدمين بنجاح`);
    console.log(`📊 عدد المستخدمين: ${result.data.length}`);
    passedTests++;
  } else {
    console.log('❌ فشل جلب المستخدمين');
    failedTests++;
  }

  // Test 3: Create User
  console.log('\n3️⃣ اختبار إنشاء مستخدم جديد');
  console.log('─'.repeat(60));
  const newUser = {
    phone_number: '+966' + Math.random().toString().slice(2, 11),
    name: 'مستخدم اختبار',
    user_type: 'regular'
  };
  result = await apiCall('POST', '/api/users', newUser);
  if (result.success && result.status === 201) {
    console.log('✅ تم إنشاء المستخدم بنجاح');
    console.log(`📱 رقم الهاتف: ${result.data.phone_number}`);
    console.log(`👤 الاسم: ${result.data.name}`);
    passedTests++;
  } else {
    console.log('❌ فشل إنشاء المستخدم');
    console.log(`الخطأ: ${result.error}`);
    failedTests++;
  }

  // Test 4: Get FAQ
  console.log('\n4️⃣ اختبار الحصول على الأسئلة الشائعة');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/api/faq');
  if (result.success && result.status === 200) {
    console.log(`✅ تم جلب الأسئلة الشائعة بنجاح`);
    console.log(`📚 عدد الأسئلة: ${result.data.length}`);
    if (result.data.length > 0) {
      console.log(`❓ أول سؤال: ${result.data[0].question}`);
    }
    passedTests++;
  } else {
    console.log('❌ فشل جلب الأسئلة الشائعة');
    failedTests++;
  }

  // Test 5: Add FAQ
  console.log('\n5️⃣ اختبار إضافة سؤال شائع جديد');
  console.log('─'.repeat(60));
  const newFAQ = {
    question: 'كيف يمكنني الاتصال بالدعم؟',
    answer: 'يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف',
    keywords: ['دعم', 'اتصال', 'تواصل'],
    category: 'support'
  };
  result = await apiCall('POST', '/api/faq', newFAQ);
  if (result.success && result.status === 201) {
    console.log('✅ تم إضافة السؤال بنجاح');
    console.log(`🆔 معرف السؤال: ${result.data.id}`);
    passedTests++;
  } else {
    console.log('❌ فشل إضافة السؤال');
    console.log(`الخطأ: ${result.error}`);
    failedTests++;
  }

  // Test 6: Search FAQ
  console.log('\n6️⃣ اختبار البحث في الأسئلة الشائعة');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/api/faq/search?q=دورات');
  if (result.success && result.status === 200) {
    console.log('✅ تم البحث بنجاح');
    console.log(`🔍 عدد النتائج: ${result.data.length}`);
    passedTests++;
  } else {
    console.log('❌ فشل البحث');
    failedTests++;
  }

  // Test 7: Get Courses
  console.log('\n7️⃣ اختبار الحصول على الدورات');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/api/courses');
  if (result.success && result.status === 200) {
    console.log(`✅ تم جلب الدورات بنجاح`);
    console.log(`📚 عدد الدورات: ${result.data.length}`);
    passedTests++;
  } else {
    console.log('❌ فشل جلب الدورات');
    failedTests++;
  }

  // Test 8: Create Course
  console.log('\n8️⃣ اختبار إنشاء دورة جديدة');
  console.log('─'.repeat(60));
  const newCourse = {
    title: 'دورة التسويق الرقمي',
    description: 'دورة شاملة في التسويق الرقمي',
    instructor: 'محمد أحمد',
    schedule_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 120
  };
  result = await apiCall('POST', '/api/courses', newCourse);
  if (result.success && result.status === 201) {
    console.log('✅ تم إنشاء الدورة بنجاح');
    console.log(`📚 اسم الدورة: ${result.data.title}`);
    passedTests++;
  } else {
    console.log('❌ فشل إنشاء الدورة');
    console.log(`الخطأ: ${result.error}`);
    failedTests++;
  }

  // Test 9: Get Analytics Summary
  console.log('\n9️⃣ اختبار الحصول على ملخص التحليلات');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/api/analytics/summary');
  if (result.success && result.status === 200) {
    console.log('✅ تم جلب التحليلات بنجاح');
    console.log(`👥 إجمالي المستخدمين: ${result.data.total_users}`);
    console.log(`✉️ الرسائل اليوم: ${result.data.messages_today}`);
    passedTests++;
  } else {
    console.log('❌ فشل جلب التحليلات');
    failedTests++;
  }

  // Test 10: Admin Dashboard Stats
  console.log('\n🔟 اختبار إحصائيات لوحة التحكم');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/admin/dashboard/stats');
  if (result.success && result.status === 200) {
    console.log('✅ تم جلب إحصائيات لوحة التحكم بنجاح');
    console.log(`👥 إجمالي المستخدمين: ${result.data.users.total_users}`);
    console.log(`✅ المستخدمون النشطون: ${result.data.users.active_users}`);
    console.log(`📚 الدورات: ${result.data.courses.total_courses}`);
    passedTests++;
  } else {
    console.log('❌ فشل جلب الإحصائيات');
    failedTests++;
  }

  // Test 11: WhatsApp Status
  console.log('\n1️⃣1️⃣ اختبار حالة خدمة WhatsApp');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/api/whatsapp/status');
  if (result.success && result.status === 200) {
    console.log('✅ تم جلب حالة WhatsApp بنجاح');
    console.log(`📱 الحالة: ${result.data.status}`);
    console.log(`🔌 جاهز: ${result.data.isReady ? 'نعم' : 'لا'}`);
    passedTests++;
  } else {
    console.log('❌ فشل جلب حالة WhatsApp');
    failedTests++;
  }

  // Test 12: Get Messages
  console.log('\n1️⃣2️⃣ اختبار الحصول على الرسائل');
  console.log('─'.repeat(60));
  result = await apiCall('GET', '/api/messages?limit=10');
  if (result.success && result.status === 200) {
    console.log('✅ تم جلب الرسائل بنجاح');
    console.log(`💬 عدد الرسائل: ${result.data.length}`);
    passedTests++;
  } else {
    console.log('❌ فشل جلب الرسائل');
    failedTests++;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 ملخص الاختبارات:');
  console.log('─'.repeat(60));
  console.log(`✅ اختبارات ناجحة: ${passedTests}`);
  console.log(`❌ اختبارات فاشلة: ${failedTests}`);
  console.log(`📈 نسبة النجاح: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%`);
  console.log('═'.repeat(60) + '\n');

  if (failedTests === 0) {
    console.log('🎉 جميع الاختبارات نجحت!');
  } else {
    console.log(`⚠️ هناك ${failedTests} اختبار فاشل يحتاج إلى معالجة`);
  }
}

// Run tests
runTests().catch(console.error);
