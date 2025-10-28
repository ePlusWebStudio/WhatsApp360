const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const whatsappService = require('../services/whatsappService');
const faqService = require('../services/faqService');
const db = require('../config/database');

// WhatsApp webhook verification (GET)
router.get('/whatsapp', (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        logger.info('✅ Webhook verified');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    logger.error('Error verifying webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// WhatsApp webhook events (POST)
router.post('/whatsapp', async (req, res) => {
  try {
    const body = req.body;

    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const messages = body.entry[0].changes[0].value.messages;

        for (const message of messages) {
          await handleIncomingMessage(message);
        }
      }

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle incoming message
async function handleIncomingMessage(message) {
  try {
    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    const messageType = message.type;

    logger.info(`📨 Incoming message from ${phoneNumber}: ${messageText}`);

    // Register or update user
    await whatsappService.handleIncomingMessage(phoneNumber, messageText);

    // Get user
    const [user] = await db.query(
      'SELECT id FROM users WHERE phone_number = ?',
      [phoneNumber]
    );

    if (!user || user.length === 0) {
      logger.error('User not found after registration');
      return;
    }

    const userId = user[0].id;

    // Process message based on content
    const response = await processUserMessage(userId, messageText);

    if (response) {
      await whatsappService.sendMessage(phoneNumber, response);
    }
  } catch (error) {
    logger.error('Error handling incoming message:', error);
  }
}

// Process user message and generate response
async function processUserMessage(userId, messageText) {
  try {
    const lowerMessage = messageText.toLowerCase().trim();

    // Check for commands
    if (lowerMessage === 'مساعدة' || lowerMessage === 'help') {
      return getHelpMenu();
    }

    if (lowerMessage === 'دورات' || lowerMessage === 'courses') {
      return await getCoursesMenu();
    }

    if (lowerMessage === 'جدول' || lowerMessage === 'schedule') {
      return await getScheduleMenu();
    }

    if (lowerMessage === 'دعم' || lowerMessage === 'support') {
      return getSupportMenu();
    }

    // Try to find answer in FAQ
    const faqResult = await faqService.handleIncomingQuestion(userId, messageText);

    if (faqResult.type === 'answer') {
      return faqResult.content;
    }

    // Default response if no FAQ match
    return `شكراً لرسالتك! 👋\n\nللحصول على قائمة الأوامر المتاحة، اكتب "مساعدة" 📋`;
  } catch (error) {
    logger.error('Error processing user message:', error);
    return 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة لاحقاً.';
  }
}

// Menu functions
function getHelpMenu() {
  return `📋 *قائمة الأوامر المتاحة*

1️⃣ *دورات* - عرض الدورات المتاحة
2️⃣ *جدول* - عرض جدول الفعاليات
3️⃣ *دعم* - التواصل مع فريق الدعم
4️⃣ *مساعدة* - عرض هذه القائمة

💡 *يمكنك أيضاً:*
• طرح أي سؤال والإجابة عليه تلقائياً
• الرد على الاستبيانات والاستطلاعات
• الحصول على تذكيرات الدورات

نحن هنا لمساعدتك! 🚀`;
}

async function getCoursesMenu() {
  try {
    const [courses] = await db.query(`
      SELECT id, title, schedule_date, instructor
      FROM courses
      WHERE status = 'published'
      ORDER BY schedule_date ASC
      LIMIT 5
    `);

    if (courses.length === 0) {
      return '📚 لا توجد دورات متاحة حالياً.\n\nتابعنا للحصول على آخر الدورات! 🔔';
    }

    let menu = '📚 *الدورات المتاحة*\n\n';
    courses.forEach((course, index) => {
      const date = new Date(course.schedule_date).toLocaleString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      menu += `${index + 1}. *${course.title}*\n   📅 ${date}\n   👨‍🏫 ${course.instructor || 'مدرب متخصص'}\n\n`;
    });

    menu += 'للتسجيل في أي دورة، اكتب رقم الدورة 🎓';
    return menu;
  } catch (error) {
    logger.error('Error getting courses menu:', error);
    return 'عذراً، حدث خطأ في جلب الدورات.';
  }
}

async function getScheduleMenu() {
  try {
    const [courses] = await db.query(`
      SELECT title, schedule_date
      FROM courses
      WHERE schedule_date >= NOW()
      AND status = 'published'
      ORDER BY schedule_date ASC
      LIMIT 7
    `);

    if (courses.length === 0) {
      return '📅 لا توجد فعاليات قادمة حالياً.';
    }

    let schedule = '📅 *جدول الفعاليات القادمة*\n\n';
    courses.forEach((course) => {
      const date = new Date(course.schedule_date).toLocaleString('ar-EG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      schedule += `📌 ${course.title}\n⏰ ${date}\n\n`;
    });

    return schedule;
  } catch (error) {
    logger.error('Error getting schedule menu:', error);
    return 'عذراً، حدث خطأ في جلب الجدول.';
  }
}

function getSupportMenu() {
  return `📞 *فريق الدعم*

للتواصل مع فريق الدعم:

📧 البريد الإلكتروني: ${process.env.ACADEMY_EMAIL || 'info@eplusweb.com'}
📱 الهاتف: ${process.env.ACADEMY_PHONE || '+966XXXXXXXXX'}

⏰ ساعات العمل:
السبت - الخميس: 9:00 صباحاً - 6:00 مساءً
الجمعة: مغلق

نحن هنا لمساعدتك! 💪`;
}

// Message status webhook (for delivery/read receipts)
router.post('/whatsapp/status', async (req, res) => {
  try {
    const { messageId, status, timestamp } = req.body;

    logger.info(`Message ${messageId} status: ${status}`);

    // Update message status in database
    await db.query(
      'UPDATE messages SET status = ? WHERE message_id = ?',
      [status, messageId]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error updating message status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
