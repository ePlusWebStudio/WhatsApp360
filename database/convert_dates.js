#!/usr/bin/env node

/**
 * 🔄 تحويل التواريخ من الهجري إلى الميلادي
 * Convert Hijri dates to Gregorian dates
 * 
 * الاستخدام: node convert_dates.js
 * Usage: node convert_dates.js
 */

const mysql = require('mysql2/promise');
const { hijriToGregorian } = require('hijri-to-gregorian');

// إعدادات قاعدة البيانات
const dbConfig = {
  host: 'localhost',
  user: 'wa_bot_user',
  password: 'password',
  database: 'wa_bot_db',
  charset: 'utf8mb4'
};

// دالة للتحقق من التاريخ الهجري
function isHijriDate(date) {
  const year = date.getFullYear();
  return year >= 1440 && year <= 1450;
}

// دالة لتحويل التاريخ الهجري إلى ميلادي
function convertHijriToGregorian(date) {
  if (!isHijriDate(date)) {
    return date; // التاريخ ميلادي بالفعل
  }

  try {
    const hijriYear = date.getFullYear();
    const hijriMonth = date.getMonth() + 1;
    const hijriDay = date.getDate();
    
    const gregorian = hijriToGregorian(hijriYear, hijriMonth, hijriDay);
    return new Date(gregorian.year, gregorian.month - 1, gregorian.day);
  } catch (error) {
    console.error('Error converting date:', error);
    return date;
  }
}

// دالة رئيسية لتحويل التواريخ
async function convertDates() {
  let connection;
  
  try {
    console.log('🔄 بدء تحويل التواريخ...');
    console.log('🔄 Starting date conversion...');
    
    // الاتصال بقاعدة البيانات
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ تم الاتصال بقاعدة البيانات');
    console.log('✅ Connected to database');
    
    // 1. تحويل تواريخ المستخدمين
    console.log('\n📊 تحويل تواريخ المستخدمين...');
    console.log('📊 Converting user dates...');
    
    const [users] = await connection.execute('SELECT id, joined_at, last_active FROM users');
    let usersUpdated = 0;
    
    for (const user of users) {
      const joinedAt = user.joined_at ? new Date(user.joined_at) : null;
      const lastActive = user.last_active ? new Date(user.last_active) : null;
      
      const newJoinedAt = joinedAt ? convertHijriToGregorian(joinedAt) : null;
      const newLastActive = lastActive ? convertHijriToGregorian(lastActive) : null;
      
      if (newJoinedAt !== joinedAt || newLastActive !== lastActive) {
        await connection.execute(
          'UPDATE users SET joined_at = ?, last_active = ? WHERE id = ?',
          [newJoinedAt, newLastActive, user.id]
        );
        usersUpdated++;
      }
    }
    
    console.log(`✅ تم تحديث ${usersUpdated} مستخدم`);
    console.log(`✅ Updated ${usersUpdated} users`);
    
    // 2. تحويل تواريخ الرسائل
    console.log('\n📨 تحويل تواريخ الرسائل...');
    console.log('📨 Converting message dates...');
    
    const [messages] = await connection.execute('SELECT id, sent_at FROM messages');
    let messagesUpdated = 0;
    
    for (const message of messages) {
      const sentAt = message.sent_at ? new Date(message.sent_at) : null;
      const newSentAt = sentAt ? convertHijriToGregorian(sentAt) : null;
      
      if (newSentAt !== sentAt) {
        await connection.execute(
          'UPDATE messages SET sent_at = ? WHERE id = ?',
          [newSentAt, message.id]
        );
        messagesUpdated++;
      }
    }
    
    console.log(`✅ تم تحديث ${messagesUpdated} رسالة`);
    console.log(`✅ Updated ${messagesUpdated} messages`);
    
    // 3. تحويل تواريخ الدورات
    console.log('\n🎓 تحويل تواريخ الدورات...');
    console.log('🎓 Converting course dates...');
    
    const [courses] = await connection.execute('SELECT id, schedule_date, created_at FROM courses');
    let coursesUpdated = 0;
    
    for (const course of courses) {
      const scheduleDate = course.schedule_date ? new Date(course.schedule_date) : null;
      const createdAt = course.created_at ? new Date(course.created_at) : null;
      
      const newScheduleDate = scheduleDate ? convertHijriToGregorian(scheduleDate) : null;
      const newCreatedAt = createdAt ? convertHijriToGregorian(createdAt) : null;
      
      if (newScheduleDate !== scheduleDate || newCreatedAt !== createdAt) {
        await connection.execute(
          'UPDATE courses SET schedule_date = ?, created_at = ? WHERE id = ?',
          [newScheduleDate, newCreatedAt, course.id]
        );
        coursesUpdated++;
      }
    }
    
    console.log(`✅ تم تحديث ${coursesUpdated} دورة`);
    console.log(`✅ Updated ${coursesUpdated} courses`);
    
    // 4. تحويل تواريخ التفاعلات
    console.log('\n🔄 تحويل تواريخ التفاعلات...');
    console.log('🔄 Converting interaction dates...');
    
    const [interactions] = await connection.execute('SELECT id, created_at FROM interactions');
    let interactionsUpdated = 0;
    
    for (const interaction of interactions) {
      const createdAt = interaction.created_at ? new Date(interaction.created_at) : null;
      const newCreatedAt = createdAt ? convertHijriToGregorian(createdAt) : null;
      
      if (newCreatedAt !== createdAt) {
        await connection.execute(
          'UPDATE interactions SET created_at = ? WHERE id = ?',
          [newCreatedAt, interaction.id]
        );
        interactionsUpdated++;
      }
    }
    
    console.log(`✅ تم تحديث ${interactionsUpdated} تفاعل`);
    console.log(`✅ Updated ${interactionsUpdated} interactions`);
    
    // 5. تحويل تواريخ التحليلات
    console.log('\n📈 تحويل تواريخ التحليلات...');
    console.log('📈 Converting analytics dates...');
    
    const [analytics] = await connection.execute('SELECT id, date FROM analytics');
    let analyticsUpdated = 0;
    
    for (const analytic of analytics) {
      const date = analytic.date ? new Date(analytic.date) : null;
      const newDate = date ? convertHijriToGregorian(date) : null;
      
      if (newDate !== date) {
        await connection.execute(
          'UPDATE analytics SET date = ? WHERE id = ?',
          [newDate, analytic.id]
        );
        analyticsUpdated++;
      }
    }
    
    console.log(`✅ تم تحديث ${analyticsUpdated} سجل تحليل`);
    console.log(`✅ Updated ${analyticsUpdated} analytics records`);
    
    // التحقق من النتائج
    console.log('\n📊 التحقق من النتائج...');
    console.log('📊 Verifying results...');
    
    const [userStats] = await connection.execute(
      'SELECT COUNT(*) as total, MIN(joined_at) as earliest, MAX(joined_at) as latest FROM users'
    );
    
    console.log(`📊 المستخدمون: ${userStats[0].total} سجل`);
    console.log(`📊 Users: ${userStats[0].total} records`);
    console.log(`📊 أقدم تاريخ: ${userStats[0].earliest}`);
    console.log(`📊 Earliest date: ${userStats[0].earliest}`);
    console.log(`📊 أحدث تاريخ: ${userStats[0].latest}`);
    console.log(`📊 Latest date: ${userStats[0].latest}`);
    
    console.log('\n🎉 تم تحويل جميع التواريخ بنجاح!');
    console.log('🎉 All dates converted successfully!');
    
  } catch (error) {
    console.error('❌ خطأ في تحويل التواريخ:', error);
    console.error('❌ Error converting dates:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ تم إغلاق الاتصال بقاعدة البيانات');
      console.log('✅ Database connection closed');
    }
  }
}

// تشغيل السكريبت
if (require.main === module) {
  convertDates();
}

module.exports = { convertDates, convertHijriToGregorian, isHijriDate };
