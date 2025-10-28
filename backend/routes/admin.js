const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../utils/logger');
const whatsappService = require('../services/whatsappService');
const schedulerService = require('../services/schedulerService');

// Admin dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const userStats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN DATE(joined_at) = CURDATE() THEN 1 ELSE 0 END) as new_users_today,
        AVG(engagement_score) as avg_engagement
      FROM users
    `);

    const messageStats = await db.query(`
      SELECT 
        COUNT(*) as total_messages,
        SUM(CASE WHEN message_type = 'incoming' THEN 1 ELSE 0 END) as incoming_messages,
        SUM(CASE WHEN message_type = 'outgoing' THEN 1 ELSE 0 END) as outgoing_messages,
        SUM(CASE WHEN DATE(sent_at) = CURDATE() THEN 1 ELSE 0 END) as messages_today
      FROM messages
    `);

    const courseStats = await db.query(`
      SELECT 
        COUNT(*) as total_courses,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_courses,
        SUM(CASE WHEN schedule_date >= NOW() THEN 1 ELSE 0 END) as upcoming_courses
      FROM courses
    `);

    res.json({
      users: Array.isArray(userStats) && userStats.length > 0 ? userStats[0] : {},
      messages: Array.isArray(messageStats) && messageStats.length > 0 ? messageStats[0] : {},
      courses: Array.isArray(courseStats) && courseStats.length > 0 ? courseStats[0] : {},
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get top engaged users
router.get('/dashboard/top-users', async (req, res) => {
  try {
    const topUsers = await db.query(`
      SELECT 
        id, phone_number, name, engagement_score, last_active, joined_at
      FROM users
      WHERE is_active = TRUE
      ORDER BY engagement_score DESC
      LIMIT 10
    `);

    res.json(Array.isArray(topUsers) ? topUsers : []);
  } catch (error) {
    logger.error('Error fetching top users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user interactions
router.get('/users/:userId/interactions', async (req, res) => {
  try {
    const interactions = await db.query(`
      SELECT * FROM interactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.params.userId]);

    res.json(Array.isArray(interactions) ? interactions : []);
  } catch (error) {
    logger.error('Error fetching user interactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send bulk message
router.post('/messages/bulk-send', async (req, res) => {
  try {
    const { phone_numbers, message, target_audience } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let recipients = phone_numbers || [];

    // If target_audience is specified, get recipients from database
    if (target_audience === 'all') {
      const users = await db.query(
        'SELECT phone_number FROM users WHERE is_active = TRUE'
      );
      recipients = (Array.isArray(users) ? users : []).map(u => u.phone_number);
    } else if (target_audience === 'vip') {
      const users = await db.query(
        'SELECT phone_number FROM users WHERE user_type = "vip" AND is_active = TRUE'
      );
      recipients = (Array.isArray(users) ? users : []).map(u => u.phone_number);
    }

    const results = await whatsappService.sendBulkMessage(recipients, message);

    res.json({
      total: recipients.length,
      results
    });
  } catch (error) {
    logger.error('Error sending bulk message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manage message templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await db.query(`
      SELECT * FROM message_templates
      WHERE is_active = TRUE
      ORDER BY template_type
    `);

    res.json(Array.isArray(templates) ? templates : []);
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const { template_name, template_type, content, variables } = req.body;

    if (!template_name || !template_type || !content) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await db.query(
      'INSERT INTO message_templates (template_name, template_type, content, variables) VALUES (?, ?, ?, ?)',
      [template_name, template_type, content, JSON.stringify(variables || {})]
    );

    res.status(201).json({ id: result && result.insertId ? result.insertId : null });
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/templates/:id', async (req, res) => {
  try {
    const { template_name, template_type, content, variables } = req.body;

    await db.query(
      'UPDATE message_templates SET template_name = ?, template_type = ?, content = ?, variables = ? WHERE id = ?',
      [template_name, template_type, content, JSON.stringify(variables || {}), req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM message_templates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Survey management
router.get('/surveys/:id/responses', async (req, res) => {
  try {
    const responses = await db.query(`
      SELECT sr.*, u.phone_number, u.name
      FROM survey_responses sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.survey_id = ?
      ORDER BY sr.submitted_at DESC
    `, [req.params.id]);

    res.json(Array.isArray(responses) ? responses : []);
  } catch (error) {
    logger.error('Error fetching survey responses:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/surveys/:id/send', async (req, res) => {
  try {
    const { target_audience } = req.body;

    const survey = await db.query(
      'SELECT * FROM surveys WHERE id = ?',
      [req.params.id]
    );

    if (!Array.isArray(survey) || survey.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get recipients
    let recipients = [];
    if (target_audience === 'all') {
      const users = await db.query(
        'SELECT phone_number FROM users WHERE is_active = TRUE'
      );
      recipients = (Array.isArray(users) ? users : []).map(u => u.phone_number);
    }

    const surveyMessage = `📋 *استبيان جديد*\n\n${survey[0].title}\n\nيرجى الرد على الأسئلة أدناه...`;

    const results = await whatsappService.sendBulkMessage(recipients, surveyMessage);

    res.json({
      survey_id: req.params.id,
      recipients_count: recipients.length,
      results
    });
  } catch (error) {
    logger.error('Error sending survey:', error);
    res.status(500).json({ error: error.message });
  }
});

// Engagement analytics
router.get('/analytics/engagement', async (req, res) => {
  try {
    const data = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as interaction_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM interactions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    logger.error('Error fetching engagement analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Message analytics
router.get('/analytics/messages', async (req, res) => {
  try {
    const data = await db.query(`
      SELECT 
        DATE(sent_at) as date,
        message_type,
        COUNT(*) as count
      FROM messages
      WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(sent_at), message_type
      ORDER BY date DESC
    `);

    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    logger.error('Error fetching message analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// User retention
router.get('/analytics/retention', async (req, res) => {
  try {
    const data = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN last_active >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_7d,
        SUM(CASE WHEN last_active >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_30d,
        SUM(CASE WHEN last_active >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) as active_90d
      FROM users
      WHERE is_active = TRUE
    `);

    res.json(Array.isArray(data) && data.length > 0 ? data[0] : {});
  } catch (error) {
    logger.error('Error fetching retention analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// System health check
router.get('/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Export data
router.get('/export/users', async (req, res) => {
  try {
    const users = await db.query(`
      SELECT id, phone_number, name, joined_at, last_active, engagement_score, user_type
      FROM users
      ORDER BY joined_at DESC
    `);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=users.json');
    res.json(Array.isArray(users) ? users : []);
  } catch (error) {
    logger.error('Error exporting users:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/export/messages', async (req, res) => {
  try {
    const messages = await db.query(`
      SELECT m.*, u.phone_number, u.name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.sent_at DESC
      LIMIT 10000
    `);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=messages.json');
    res.json(Array.isArray(messages) ? messages : []);
  } catch (error) {
    logger.error('Error exporting messages:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
