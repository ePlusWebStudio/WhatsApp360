const cron = require('node-cron');
const db = require('../config/database');
const whatsappService = require('./whatsappService');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  initializeScheduler() {
    try {
      // Process pending content every minute
      cron.schedule('* * * * *', () => {
        this.processPendingContent();
      });

      // Process reminders every 5 minutes
      cron.schedule('*/5 * * * *', () => {
        this.processReminders();
      });

      // Update daily analytics at midnight
      cron.schedule('0 0 * * *', () => {
        this.updateDailyAnalytics();
      });

      // Clean up old messages every week
      cron.schedule('0 0 * * 0', () => {
        this.cleanupOldMessages();
      });

      logger.info('✅ Scheduler service initialized');
    } catch (error) {
      logger.error('Error initializing scheduler:', error);
      throw error;
    }
  }

  async processPendingContent() {
    try {
      const now = new Date();
      const [pendingContent] = await db.query(`
        SELECT * FROM scheduled_content 
        WHERE status = 'pending' 
        AND schedule_time <= ?
        ORDER BY schedule_time ASC
        LIMIT 10
      `, [now]);

      for (const content of pendingContent) {
        await this.sendScheduledContent(content);
      }
    } catch (error) {
      logger.error('Error processing pending content:', error);
    }
  }

  async sendScheduledContent(content) {
    try {
      let recipients = [];

      // Determine recipients
      if (content.target_audience === 'all') {
        const [users] = await db.query(
          'SELECT phone_number FROM users WHERE is_active = TRUE'
        );
        recipients = users.map(u => u.phone_number);
      } else if (content.target_audience.startsWith('segment:')) {
        // Send to specific segment
        const segmentId = content.target_audience.split(':')[1];
        recipients = await this.getSegmentRecipients(segmentId);
      } else {
        // Send to specific number
        recipients = [content.target_audience];
      }

      let successCount = 0;
      let failedCount = 0;

      for (const phoneNumber of recipients) {
        try {
          if (content.media_url) {
            await whatsappService.sendMedia(
              phoneNumber,
              content.media_url,
              content.content
            );
          } else {
            await whatsappService.sendMessage(phoneNumber, content.content);
          }
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error(`Failed to send to ${phoneNumber}:`, error);
          failedCount++;
        }
      }

      // Update content status
      await db.query(
        'UPDATE scheduled_content SET status = ?, sent_count = ?, failed_count = ? WHERE id = ?',
        ['sent', successCount, failedCount, content.id]
      );

      logger.info(`✅ Scheduled content #${content.id} sent to ${successCount} recipients`);
    } catch (error) {
      await db.query(
        'UPDATE scheduled_content SET status = ? WHERE id = ?',
        ['failed', content.id]
      );
      logger.error('Error sending scheduled content:', error);
    }
  }

  async processReminders() {
    try {
      const now = new Date();
      const reminderWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const [upcomingCourses] = await db.query(`
        SELECT * FROM courses 
        WHERE schedule_date BETWEEN ? AND ?
        AND status = 'published'
      `, [now, reminderWindow]);

      for (const course of upcomingCourses) {
        await this.sendCourseReminder(course);
      }
    } catch (error) {
      logger.error('Error processing reminders:', error);
    }
  }

  async sendCourseReminder(course) {
    try {
      const scheduleDate = new Date(course.schedule_date);
      const hoursUntil = Math.round((scheduleDate - new Date()) / (1000 * 60 * 60));

      const reminderMessage = `⏰ *تذكير بدورة قادمة*

📚 ${course.title}

⏱️ الموعد: ${scheduleDate.toLocaleString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}

⌛ متبقي: ${hoursUntil} ساعة

${course.description || ''}

نراك قريباً! 🚀`;

      // Get active users
      const [users] = await db.query(
        'SELECT id, phone_number FROM users WHERE is_active = TRUE'
      );

      for (const user of users) {
        try {
          await whatsappService.sendMessage(user.phone_number, reminderMessage);

          // Log interaction
          await db.query(
            'INSERT INTO interactions (user_id, interaction_type, interaction_data) VALUES (?, ?, ?)',
            [user.id, 'reminder_sent', JSON.stringify({ course_id: course.id })]
          );

          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          logger.error(`Error sending reminder to ${user.phone_number}:`, error);
        }
      }

      logger.info(`✅ Course reminder sent for: ${course.title}`);
    } catch (error) {
      logger.error('Error sending course reminder:', error);
    }
  }

  async updateDailyAnalytics() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const [userStats] = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN DATE(joined_at) = ? THEN 1 ELSE 0 END) as new_users
        FROM users
      `, [dateStr]);

      const [messageStats] = await db.query(`
        SELECT 
          SUM(CASE WHEN message_type = 'outgoing' THEN 1 ELSE 0 END) as messages_sent,
          SUM(CASE WHEN message_type = 'incoming' THEN 1 ELSE 0 END) as messages_received
        FROM messages
        WHERE DATE(sent_at) = ?
      `, [dateStr]);

      const stats = userStats[0];
      const messages = messageStats[0];

      const engagementRate = stats.active_users > 0 
        ? ((messages.messages_received || 0) / stats.active_users * 100).toFixed(2)
        : 0;

      await db.query(`
        INSERT INTO analytics (date, total_users, active_users, new_users, messages_sent, messages_received, engagement_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        total_users = VALUES(total_users),
        active_users = VALUES(active_users),
        new_users = VALUES(new_users),
        messages_sent = VALUES(messages_sent),
        messages_received = VALUES(messages_received),
        engagement_rate = VALUES(engagement_rate)
      `, [dateStr, stats.total_users, stats.active_users, stats.new_users, messages.messages_sent, messages.messages_received, engagementRate]);

      logger.info(`✅ Daily analytics updated for ${dateStr}`);
    } catch (error) {
      logger.error('Error updating daily analytics:', error);
    }
  }

  async cleanupOldMessages() {
    try {
      // Delete messages older than 90 days
      const [result] = await db.query(`
        DELETE FROM messages 
        WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
      `);

      logger.info(`✅ Cleaned up ${result.affectedRows} old messages`);
    } catch (error) {
      logger.error('Error cleaning up old messages:', error);
    }
  }

  async getSegmentRecipients(segmentId) {
    try {
      // This is a placeholder for segment logic
      // Implement your own segment logic here
      const [users] = await db.query(
        'SELECT phone_number FROM users WHERE is_active = TRUE LIMIT 100'
      );
      return users.map(u => u.phone_number);
    } catch (error) {
      logger.error('Error getting segment recipients:', error);
      return [];
    }
  }

  async scheduleContent(contentData) {
    try {
      const { content, mediaUrl, scheduleTime, targetAudience, contentType } = contentData;

      const [result] = await db.query(`
        INSERT INTO scheduled_content 
        (content_type, content, media_url, schedule_time, target_audience, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')
      `, [contentType, content, mediaUrl, scheduleTime, targetAudience]);

      logger.info(`✅ Content scheduled with ID: ${result.insertId}`);
      return { success: true, id: result.insertId };
    } catch (error) {
      logger.error('Error scheduling content:', error);
      throw error;
    }
  }
}

module.exports = new SchedulerService();
