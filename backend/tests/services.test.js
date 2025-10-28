const faqService = require('../services/faqService');
const whatsappService = require('../services/whatsappService');
const db = require('../config/database');

// Test FAQ Service
async function testFAQService() {
  console.log('\n🧪 اختبار خدمة الأسئلة الشائعة');
  console.log('═'.repeat(60));

  try {
    // Test 1: Load FAQs
    console.log('\n1️⃣ اختبار تحميل الأسئلة الشائعة');
    await faqService.loadFAQs();
    console.log(`✅ تم تحميل ${faqService.faqs.length} سؤال شائع`);

    // Test 2: Find Answer
    console.log('\n2️⃣ اختبار البحث عن إجابة');
    const result = await faqService.findAnswer('كيف أبدأ؟');
    if (result.found) {
      console.log(`✅ تم العثور على إجابة`);
      console.log(`❓ السؤال: ${result.question}`);
      console.log(`💡 الإجابة: ${result.answer.substring(0, 50)}...`);
      console.log(`📊 الثقة: ${result.confidence}%`);
    } else {
      console.log(`⚠️ لم يتم العثور على إجابة مطابقة`);
      console.log(`💡 الاقتراحات: ${result.suggestions.slice(0, 2).join(', ')}`);
    }

    // Test 3: Add FAQ
    console.log('\n3️⃣ اختبار إضافة سؤال شائع');
    const addResult = await faqService.addFAQ(
      'ما هي ساعات العمل؟',
      'ساعات عملنا من 9 صباحاً إلى 6 مساءً',
      ['ساعات', 'عمل', 'وقت'],
      'support'
    );
    if (addResult.success) {
      console.log(`✅ تم إضافة السؤال بنجاح`);
      console.log(`🆔 معرف السؤال: ${addResult.id}`);
    }

    // Test 4: Get Statistics
    console.log('\n4️⃣ اختبار الحصول على إحصائيات الأسئلة الشائعة');
    const stats = await faqService.getStatistics();
    console.log(`✅ تم جلب الإحصائيات`);
    console.log(`📊 إجمالي الأسئلة: ${stats.statistics.total_faqs}`);
    console.log(`📈 إجمالي الاستخدام: ${stats.statistics.total_usage}`);
    console.log(`📉 متوسط الاستخدام: ${stats.statistics.avg_usage?.toFixed(2)}`);
    console.log(`🏆 أكثر 3 أسئلة استخداماً:`);
    stats.topFAQs.slice(0, 3).forEach((faq, i) => {
      console.log(`   ${i + 1}. ${faq.question} (${faq.usage_count} استخدام)`);
    });

  } catch (error) {
    console.error('❌ خطأ في اختبار خدمة الأسئلة الشائعة:', error.message);
  }
}

// Test WhatsApp Service
async function testWhatsAppService() {
  console.log('\n🧪 اختبار خدمة WhatsApp');
  console.log('═'.repeat(60));

  try {
    // Test 1: Get Status
    console.log('\n1️⃣ اختبار الحصول على حالة الخدمة');
    const status = await whatsappService.getStatus();
    console.log(`✅ تم جلب الحالة`);
    console.log(`📱 الحالة: ${status.status}`);
    console.log(`🔌 جاهز: ${status.isReady ? 'نعم' : 'لا'}`);

    // Test 2: Send Message (Placeholder)
    console.log('\n2️⃣ اختبار إرسال رسالة (محاكاة)');
    const sendResult = await whatsappService.sendMessage(
      '+966XXXXXXXXX',
      'هذه رسالة اختبار'
    );
    console.log(`✅ تم محاكاة إرسال الرسالة`);
    console.log(`🆔 معرف الرسالة: ${sendResult.messageId}`);

  } catch (error) {
    console.error('❌ خطأ في اختبار خدمة WhatsApp:', error.message);
  }
}

// Test Database Connection
async function testDatabaseConnection() {
  console.log('\n🧪 اختبار الاتصال بقاعدة البيانات');
  console.log('═'.repeat(60));

  try {
    // Test 1: Connection
    console.log('\n1️⃣ اختبار الاتصال');
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ الاتصال بقاعدة البيانات يعمل بنجاح');

    // Test 2: Query Users
    console.log('\n2️⃣ اختبار استعلام المستخدمين');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ عدد المستخدمين: ${users[0].count}`);

    // Test 3: Query Messages
    console.log('\n3️⃣ اختبار استعلام الرسائل');
    const [messages] = await db.query('SELECT COUNT(*) as count FROM messages');
    console.log(`✅ عدد الرسائل: ${messages[0].count}`);

    // Test 4: Query FAQ
    console.log('\n4️⃣ اختبار استعلام الأسئلة الشائعة');
    const [faqs] = await db.query('SELECT COUNT(*) as count FROM faq');
    console.log(`✅ عدد الأسئلة الشائعة: ${faqs[0].count}`);

    // Test 5: Query Courses
    console.log('\n5️⃣ اختبار استعلام الدورات');
    const [courses] = await db.query('SELECT COUNT(*) as count FROM courses');
    console.log(`✅ عدد الدورات: ${courses[0].count}`);

    // Test 6: Database Statistics
    console.log('\n6️⃣ إحصائيات قاعدة البيانات');
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM messages) as messages,
        (SELECT COUNT(*) FROM courses) as courses,
        (SELECT COUNT(*) FROM faq) as faqs,
        (SELECT COUNT(*) FROM interactions) as interactions
    `);
    console.log(`✅ إجمالي البيانات:`);
    console.log(`   👥 المستخدمين: ${stats[0].users}`);
    console.log(`   💬 الرسائل: ${stats[0].messages}`);
    console.log(`   📚 الدورات: ${stats[0].courses}`);
    console.log(`   ❓ الأسئلة الشائعة: ${stats[0].faqs}`);
    console.log(`   🔄 التفاعلات: ${stats[0].interactions}`);

  } catch (error) {
    console.error('❌ خطأ في اختبار قاعدة البيانات:', error.message);
  }
}

// Test Data Integrity
async function testDataIntegrity() {
  console.log('\n🧪 اختبار تكامل البيانات');
  console.log('═'.repeat(60));

  try {
    // Test 1: Check Foreign Keys
    console.log('\n1️⃣ اختبار المفاتيح الأجنبية');
    const [orphanMessages] = await db.query(`
      SELECT COUNT(*) as count FROM messages 
      WHERE user_id NOT IN (SELECT id FROM users)
    `);
    if (orphanMessages[0].count === 0) {
      console.log('✅ جميع الرسائل مرتبطة بمستخدمين صحيحين');
    } else {
      console.log(`⚠️ هناك ${orphanMessages[0].count} رسالة يتيمة`);
    }

    // Test 2: Check Duplicate Phone Numbers
    console.log('\n2️⃣ اختبار أرقام الهاتف المكررة');
    const [duplicates] = await db.query(`
      SELECT phone_number, COUNT(*) as count 
      FROM users 
      GROUP BY phone_number 
      HAVING count > 1
    `);
    if (duplicates.length === 0) {
      console.log('✅ لا توجد أرقام هاتف مكررة');
    } else {
      console.log(`⚠️ هناك ${duplicates.length} رقم هاتف مكرر`);
    }

    // Test 3: Check Data Types
    console.log('\n3️⃣ اختبار أنواع البيانات');
    const [userTypes] = await db.query(`
      SELECT DISTINCT user_type FROM users
    `);
    console.log(`✅ أنواع المستخدمين الموجودة:`);
    userTypes.forEach(u => console.log(`   • ${u.user_type}`));

  } catch (error) {
    console.error('❌ خطأ في اختبار تكامل البيانات:', error.message);
  }
}

// Performance Test
async function testPerformance() {
  console.log('\n🧪 اختبار الأداء');
  console.log('═'.repeat(60));

  try {
    // Test 1: Query Speed
    console.log('\n1️⃣ اختبار سرعة الاستعلامات');
    
    console.log('   جلب المستخدمين...');
    let start = Date.now();
    await db.query('SELECT * FROM users LIMIT 100');
    let duration = Date.now() - start;
    console.log(`   ✅ ${duration}ms`);

    console.log('   جلب الرسائل...');
    start = Date.now();
    await db.query('SELECT * FROM messages LIMIT 100');
    duration = Date.now() - start;
    console.log(`   ✅ ${duration}ms`);

    console.log('   جلب الأسئلة الشائعة...');
    start = Date.now();
    await db.query('SELECT * FROM faq');
    duration = Date.now() - start;
    console.log(`   ✅ ${duration}ms`);

    // Test 2: Complex Query
    console.log('\n2️⃣ اختبار الاستعلامات المعقدة');
    start = Date.now();
    await db.query(`
      SELECT 
        u.id, u.name, u.phone_number,
        COUNT(m.id) as message_count,
        COUNT(i.id) as interaction_count
      FROM users u
      LEFT JOIN messages m ON u.id = m.user_id
      LEFT JOIN interactions i ON u.id = i.user_id
      GROUP BY u.id
      LIMIT 50
    `);
    duration = Date.now() - start;
    console.log(`   ✅ ${duration}ms`);

  } catch (error) {
    console.error('❌ خطأ في اختبار الأداء:', error.message);
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 بدء جميع الاختبارات');
  console.log('═'.repeat(60));

  await testDatabaseConnection();
  await testFAQService();
  await testWhatsAppService();
  await testDataIntegrity();
  await testPerformance();

  console.log('\n' + '═'.repeat(60));
  console.log('✅ انتهت جميع الاختبارات');
  console.log('═'.repeat(60) + '\n');

  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ خطأ في تشغيل الاختبارات:', error);
  process.exit(1);
});
