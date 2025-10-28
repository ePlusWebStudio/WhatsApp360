#!/usr/bin/env node

/**
 * 🔄 تحويل التواريخ من الهجري إلى الميلادي (نسخة مبسطة)
 * Convert Hijri dates to Gregorian dates (Simple version)
 * 
 * الاستخدام: node convert_dates_simple.js
 * Usage: node convert_dates_simple.js
 */

const mysql = require('mysql2/promise');

// إعدادات قاعدة البيانات
const dbConfig = {
  host: 'localhost',
  user: 'wa_bot_user',
  password: 'password',
  database: 'wa_bot_db',
  charset: 'utf8mb4'
};

// دالة بسيطة للتحويل التقريبي (1 سنة هجرية ≈ 0.97 سنة ميلادية)
function convertHijriToGregorianSimple(date) {
  const year = date.getFullYear();
  
  // إذا كان السنة بين 1440-1450 (هجري)، حوّلها إلى ميلادي
  if (year >= 1440 && year <= 1450) {
    const gregorianYear = Math.round(2020 + (year - 1440) * 0.97);
    return new Date(gregorianYear, date.getMonth(), date.getDate());
  }
  
  return date; // التاريخ ميلادي بالفعل
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
      let needsUpdate = false;
      let newJoinedAt = user.joined_at;
      let newLastActive = user.last_active;
      
      if (user.joined_at) {
        const joinedDate = new Date(user.joined_at);
        const convertedJoined = convertHijriToGregorianSimple(joinedDate);
        if (convertedJoined !== joinedDate) {
          newJoinedAt = convertedJoined;
          needsUpdate = true;
        }
      }
      
      if (user.last_active) {
        const lastActiveDate = new Date(user.last_active);
        const convertedLastActive = convertHijriToGregorianSimple(lastActiveDate);
        if (convertedLastActive !== lastActiveDate) {
          newLastActive = convertedLastActive;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
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
      if (message.sent_at) {
        const sentDate = new Date(message.sent_at);
        const convertedSent = convertHijriToGregorianSimple(sentDate);
        
        if (convertedSent !== sentDate) {
          await connection.execute(
            'UPDATE messages SET sent_at = ? WHERE id = ?',
            [convertedSent, message.id]
          );
          messagesUpdated++;
        }
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
      let needsUpdate = false;
      let newScheduleDate = course.schedule_date;
      let newCreatedAt = course.created_at;
      
      if (course.schedule_date) {
        const scheduleDate = new Date(course.schedule_date);
        const convertedSchedule = convertHijriToGregorianSimple(scheduleDate);
        if (convertedSchedule !== scheduleDate) {
          newScheduleDate = convertedSchedule;
          needsUpdate = true;
        }
      }
      
      if (course.created_at) {
        const createdDate = new Date(course.created_at);
        const convertedCreated = convertHijriToGregorianSimple(createdDate);
        if (convertedCreated !== createdDate) {
          newCreatedAt = convertedCreated;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
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
      if (interaction.created_at) {
        const createdDate = new Date(interaction.created_at);
        const convertedCreated = convertHijriToGregorianSimple(createdDate);
        
        if (convertedCreated !== createdDate) {
          await connection.execute(
            'UPDATE interactions SET created_at = ? WHERE id = ?',
            [convertedCreated, interaction.id]
          );
          interactionsUpdated++;
        }
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
      if (analytic.date) {
        const date = new Date(analytic.date);
        const convertedDate = convertHijriToGregorianSimple(date);
        
        if (convertedDate !== date) {
          await connection.execute(
            'UPDATE analytics SET date = ? WHERE id = ?',
            [convertedDate, analytic.id]
          );
          analyticsUpdated++;
        }
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

module.exports = { convertDates, convertHijriToGregorianSimple };
