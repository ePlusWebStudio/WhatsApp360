# 🔄 دليل تحويل التواريخ من الهجري إلى الميلادي
# Guide to Convert Hijri Dates to Gregorian

**التاريخ:** أكتوبر 28، 2025  
**الإصدار:** 1.0.0  
**الحالة:** ✅ **جاهز للاستخدام**

---

## 🎯 الهدف

تحويل جميع التواريخ في قاعدة البيانات من صيغة هجرية إلى صيغة ميلادية وتصحيح البيانات المدخلة مسبقاً.

---

## ⚠️ تحذير هام

**قبل البدء، خذ نسخة احتياطية كاملة من قاعدة البيانات!**

```bash
# نسخ احتياطي لقاعدة البيانات
mysqldump -u wa_bot_user -p wa_bot_db > backup_before_date_conversion.sql
```

---

## 📁 الملفات المتاحة

### 1. 📄 convert_hijri_to_gregorian.sql
- **نوع:** SQL Script
- **الوصف:** سكريبت SQL مباشر لتحويل التواريخ
- **المميزات:** سريع، لا يتطلب مكتبات خارجية
- **العيوب:** تحويل تقريبي (يضيف 579 سنة)

### 2. 📄 convert_dates.js
- **نوع:** Node.js Script
- **الوصف:** سكريبت متقدم مع مكتبة hijri-to-gregorian
- **المميزات:** تحويل دقيق، معالجة فردية للسجلات
- **العيوب:** يتطلب تثبيت مكتبة خارجية

### 3. 📄 convert_dates_simple.js
- **نوع:** Node.js Script (مبسط)
- **الوصف:** سكريبت مبسط بدون مكتبات خارجية
- **المميزات:** سهل الاستخدام، تحويل تقريبي جيد
- **العيوب:** تحويل تقريبي (0.97 سنة ميلادية = 1 سنة هجرية)

---

## 🚀 طرق الاستخدام

### الطريقة الأولى: SQL Script (الأسرع)

```bash
# 1. اتصل بقاعدة البيانات
mysql -u wa_bot_user -p wa_bot_db

# 2. شغل السكريبت
source /c/wamp64/www/wa-bot/database/convert_hijri_to_gregorian.sql;

# 3. تحقق من النتائج
SELECT COUNT(*) as total_users FROM users;
SELECT MIN(joined_at) as earliest_date FROM users;
SELECT MAX(joined_at) as latest_date FROM users;
```

### الطريقة الثانية: Node.js Simple (موصى به)

```bash
# 1. انتقل لمجلد قاعدة البيانات
cd c:/wamp64/www/wa-bot/database

# 2. شغل السكريبت
node convert_dates_simple.js

# 3. راقب النتائج
```

### الطريقة الثالثة: Node.js Advanced (الأدق)

```bash
# 1. ثبّت المكتبة المطلوبة
npm install hijri-to-gregorian

# 2. شغل السكريبت
node convert_dates.js

# 3. راقب النتائج
```

---

## 📊 الجداول التي سيتم تحويلها

| الجدول | الحقول التي سيتم تحويلها |
|--------|---------------------------|
| `users` | `joined_at`, `last_active` |
| `messages` | `sent_at` |
| `courses` | `schedule_date`, `created_at` |
| `interactions` | `created_at` |
| `surveys` | `created_at` |
| `survey_responses` | `submitted_at` |
| `scheduled_content` | `scheduled_at`, `created_at` |
| `analytics` | `date` |
| `message_templates` | `created_at` |

---

## 🔍 التحقق من النتائج

### 1. التحقق من التواريخ المحولة

```sql
-- تحقق من تواريخ المستخدمين
SELECT id, name, joined_at, last_active FROM users ORDER BY joined_at DESC LIMIT 10;

-- تحقق من تواريخ الرسائل
SELECT id, message_type, sent_at FROM messages ORDER BY sent_at DESC LIMIT 10;

-- تحقق من تواريخ الدورات
SELECT id, title, schedule_date, created_at FROM courses ORDER BY created_at DESC LIMIT 10;
```

### 2. التحقق من نطاق التواريخ

```sql
-- يجب أن تكون التواريخ بين 2020-2026
SELECT 
    'users' as table_name,
    MIN(joined_at) as earliest,
    MAX(joined_at) as latest,
    COUNT(*) as total
FROM users
WHERE joined_at IS NOT NULL
UNION ALL
SELECT 
    'messages' as table_name,
    MIN(sent_at) as earliest,
    MAX(sent_at) as latest,
    COUNT(*) as total
FROM messages
WHERE sent_at IS NOT NULL;
```

---

## 🛠️ استكشاف الأخطاء

### مشكلة: التواريخ لا تزال هجرية

**الحل:**
```sql
-- تحقق من السنوات في قاعدة البيانات
SELECT DISTINCT YEAR(joined_at) as year FROM users ORDER BY year;
SELECT DISTINCT YEAR(sent_at) as year FROM messages ORDER BY year;
```

### مشكلة: أخطاء في التحويل

**الحل:**
```bash
# أعد تشغيل السكريبت مع تسجيل الأخطاء
node convert_dates_simple.js 2>&1 | tee conversion.log
```

### مشكلة: فقدان البيانات

**الحل:**
```bash
# استعادة النسخة الاحتياطية
mysql -u wa_bot_user -p wa_bot_db < backup_before_date_conversion.sql
```

---

## 📈 بعد التحويل

### 1. تحديث الواجهة الأمامية

تأكد من أن الواجهة الأمامية تستخدم صيغة التاريخ الميلادي:

```javascript
// في جميع ملفات JavaScript
new Date(date).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
});
```

### 2. اختبار النظام

```bash
# 1. أعد تشغيل الخادم
cd backend
npm run dev

# 2. اختبر عرض التواريخ
# 3. تحقق من جميع الصفحات
```

---

## ✅ قائمة التحقق النهائية

- [x] أخذ نسخة احتياطية من قاعدة البيانات
- [x] اختيار طريقة التحويل المناسبة
- [x] تشغيل سكريبت التحويل
- [x] التحقق من النتائج
- [x] اختبار الواجهة الأمامية
- [x] التأكد من عرض التواريخ بشكل صحيح

---

## 📞 المساعدة

إذا واجهت أي مشاكل:

1. **تحقق من السجلات:** `tail -f backend/app.log`
2. **اختبر الاتصال:** `mysql -u wa_bot_user -p wa_bot_db`
3. **استعادة النسخة الاحتياطية:** إذا لزم الأمر

---

**آخر تحديث:** أكتوبر 28، 2025  
**الإصدار:** 1.0.0  
**الحالة:** ✅ **مكتمل وجاهز**
