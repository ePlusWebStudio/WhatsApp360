-- 🔄 تحويل التواريخ من الهجري إلى الميلادي
-- Convert Hijri dates to Gregorian dates

-- ⚠️ قبل التشغيل: خذ نسخة احتياطية من قاعدة البيانات
-- ⚠️ Before running: Take a backup of your database

-- 1. تحويل تواريخ المستخدمين
-- Convert user dates
UPDATE users 
SET joined_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(joined_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(joined_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE joined_at
END,
last_active = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(last_active) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(last_active, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE last_active
END;

-- 2. تحويل تواريخ الرسائل
-- Convert message dates
UPDATE messages 
SET sent_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(sent_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(sent_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE sent_at
END;

-- 3. تحويل تواريخ الدورات
-- Convert course dates
UPDATE courses 
SET schedule_date = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(schedule_date) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(schedule_date, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE schedule_date
END,
created_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(created_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(created_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE created_at
END;

-- 4. تحويل تواريخ التفاعلات
-- Convert interaction dates
UPDATE interactions 
SET created_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(created_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(created_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE created_at
END;

-- 5. تحويل تواريخ الاستبيانات
-- Convert survey dates
UPDATE surveys 
SET created_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(created_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(created_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE created_at
END;

-- 6. تحويل تواريخ ردود الاستبيانات
-- Convert survey response dates
UPDATE survey_responses 
SET submitted_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(submitted_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(submitted_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE submitted_at
END;

-- 7. تحويل تواريخ المحتوى المجدول
-- Convert scheduled content dates
UPDATE scheduled_content 
SET scheduled_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(scheduled_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(scheduled_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE scheduled_at
END,
created_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(created_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(created_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE created_at
END;

-- 8. تحويل تواريخ التحليلات
-- Convert analytics dates
UPDATE analytics 
SET date = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(date) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(date, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE date
END;

-- 9. تحويل تواريخ قوالب الرسائل
-- Convert message template dates
UPDATE message_templates 
SET created_at = CASE 
    -- إذا كان التاريخ بصيغة هجرية (1440-1446)
    WHEN YEAR(created_at) BETWEEN 1440 AND 1446 THEN
        DATE_ADD(created_at, INTERVAL 579 YEAR)
    -- إذا كان التاريخ بصيغة ميلادية (2020-2026)
    ELSE created_at
END;

-- ✅ تم تحويل جميع التواريخ بنجاح
-- ✅ All dates have been converted successfully

-- 📊 التحقق من النتائج
-- Verify results
SELECT 
    'users' as table_name, 
    COUNT(*) as total_records,
    MIN(joined_at) as earliest_date,
    MAX(joined_at) as latest_date
FROM users
UNION ALL
SELECT 
    'messages' as table_name, 
    COUNT(*) as total_records,
    MIN(sent_at) as earliest_date,
    MAX(sent_at) as latest_date
FROM messages
UNION ALL
SELECT 
    'courses' as table_name, 
    COUNT(*) as total_records,
    MIN(schedule_date) as earliest_date,
    MAX(schedule_date) as latest_date
FROM courses;
