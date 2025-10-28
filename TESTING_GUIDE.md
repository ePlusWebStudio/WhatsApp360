# 🧪 دليل الاختبار الشامل
## WhatsApp360 Bot - Testing Guide

---

## 📋 نظرة عامة

هذا الدليل يشرح كيفية اختبار جميع مكونات النظام للتأكد من أنها تعمل بشكل صحيح.

---

## 🚀 البدء السريع

### الخطوة 1: تشغيل الخادم

```bash
cd backend
npm run dev
```

**النتيجة المتوقعة:**
```
🚀 Server running on http://localhost:3000
📝 Environment: development
✅ Database connected successfully
✅ WhatsApp service initialized
✅ Scheduler service initialized
```

### الخطوة 2: اختبار صحة النظام

```bash
curl http://localhost:3000/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-28T...",
  "uptime": 123.45
}
```

---

## 🧪 اختبارات API

### 1. اختبار المستخدمين

#### الحصول على قائمة المستخدمين
```bash
curl http://localhost:3000/api/users
```

#### إنشاء مستخدم جديد
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+966501234567",
    "name": "أحمد محمد",
    "user_type": "regular"
  }'
```

#### الحصول على بيانات مستخدم محدد
```bash
curl http://localhost:3000/api/users/1
```

---

### 2. اختبار الأسئلة الشائعة

#### الحصول على جميع الأسئلة
```bash
curl http://localhost:3000/api/faq
```

#### البحث عن سؤال
```bash
curl "http://localhost:3000/api/faq/search?q=دورات"
```

#### إضافة سؤال شائع جديد
```bash
curl -X POST http://localhost:3000/api/faq \
  -H "Content-Type: application/json" \
  -d '{
    "question": "كيف أسجل في الدورات؟",
    "answer": "يمكنك التسجيل مباشرة من خلال التطبيق",
    "keywords": ["تسجيل", "دورات", "كيف"],
    "category": "courses"
  }'
```

#### الحصول على إحصائيات الأسئلة الشائعة
```bash
curl http://localhost:3000/api/faq/stats
```

---

### 3. اختبار الدورات

#### الحصول على جميع الدورات
```bash
curl http://localhost:3000/api/courses
```

#### إنشاء دورة جديدة
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "دورة التسويق الرقمي",
    "description": "دورة شاملة في التسويق الرقمي",
    "instructor": "محمد أحمد",
    "schedule_date": "2025-11-05T10:00:00",
    "duration_minutes": 120
  }'
```

---

### 4. اختبار الرسائل

#### الحصول على الرسائل
```bash
curl "http://localhost:3000/api/messages?limit=10"
```

#### إرسال رسالة (محاكاة)
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+966501234567",
    "message": "مرحباً بك في أكاديميتنا!"
  }'
```

---

### 5. اختبار المحتوى المجدول

#### الحصول على المحتوى المجدول
```bash
curl "http://localhost:3000/api/scheduled-content?status=pending"
```

#### جدولة محتوى جديد
```bash
curl -X POST http://localhost:3000/api/scheduled-content \
  -H "Content-Type: application/json" \
  -d '{
    "content": "محتوى تعليمي مهم",
    "schedule_time": "2025-10-28T15:00:00",
    "target_audience": "all",
    "content_type": "announcement"
  }'
```

---

### 6. اختبار الاستبيانات

#### الحصول على الاستبيانات
```bash
curl http://localhost:3000/api/surveys
```

#### إنشاء استبيان جديد
```bash
curl -X POST http://localhost:3000/api/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "title": "استبيان رضا العملاء",
    "description": "نود معرفة رأيك في خدماتنا",
    "questions": [
      {
        "id": 1,
        "text": "هل أنت راضٍ عن الخدمة؟",
        "type": "yes_no"
      },
      {
        "id": 2,
        "text": "ما تقييمك من 1 إلى 5؟",
        "type": "rating"
      }
    ]
  }'
```

---

### 7. اختبار التحليلات

#### الحصول على ملخص التحليلات
```bash
curl http://localhost:3000/api/analytics/summary
```

#### الحصول على بيانات التحليلات
```bash
curl http://localhost:3000/api/analytics
```

---

### 8. اختبار لوحة التحكم الإدارية

#### إحصائيات لوحة التحكم
```bash
curl http://localhost:3000/admin/dashboard/stats
```

#### أفضل المستخدمين النشطين
```bash
curl http://localhost:3000/admin/dashboard/top-users
```

#### تحليلات التفاعل
```bash
curl http://localhost:3000/admin/analytics/engagement
```

#### معدل الاحتفاظ
```bash
curl http://localhost:3000/admin/analytics/retention
```

#### فحص صحة النظام
```bash
curl http://localhost:3000/admin/health
```

---

## 🤖 استخدام Postman

### استيراد الـ Collection

1. افتح Postman
2. اذهب إلى File → Import
3. اختر `postman_collection.json`
4. سيتم استيراد جميع الـ requests

### تشغيل الاختبارات

1. اختر Collection
2. اضغط على "Run"
3. سيتم تشغيل جميع الاختبارات تلقائياً

---

## 🧪 اختبارات الخدمات

### تشغيل اختبارات الخدمات

```bash
cd backend
node tests/services.test.js
```

**الاختبارات المضمنة:**
- ✅ اختبار الاتصال بقاعدة البيانات
- ✅ اختبار خدمة الأسئلة الشائعة
- ✅ اختبار خدمة WhatsApp
- ✅ اختبار تكامل البيانات
- ✅ اختبار الأداء

---

## 🔍 اختبارات API الشاملة

### تشغيل اختبارات API

```bash
cd backend
npm install axios  # إذا لم تكن مثبتة
node tests/api.test.js
```

**الاختبارات المضمنة:**
- ✅ فحص صحة النظام
- ✅ جلب المستخدمين
- ✅ إنشاء مستخدم جديد
- ✅ جلب الأسئلة الشائعة
- ✅ إضافة سؤال شائع
- ✅ البحث في الأسئلة الشائعة
- ✅ جلب الدورات
- ✅ إنشاء دورة جديدة
- ✅ جلب التحليلات
- ✅ إحصائيات لوحة التحكم
- ✅ حالة WhatsApp
- ✅ جلب الرسائل

---

## 📊 اختبار الأداء

### قياس سرعة الاستعلامات

```bash
# اختبار سرعة جلب المستخدمين
time curl http://localhost:3000/api/users > /dev/null

# اختبار سرعة جلب الأسئلة الشائعة
time curl http://localhost:3000/api/faq > /dev/null

# اختبار سرعة الاستعلامات المعقدة
time curl http://localhost:3000/admin/dashboard/stats > /dev/null
```

### الأوقات المتوقعة
- جلب المستخدمين: < 100ms
- جلب الأسئلة الشائعة: < 50ms
- الاستعلامات المعقدة: < 200ms

---

## 🔐 اختبار الأمان

### 1. اختبار التحقق من المدخلات

```bash
# محاولة إنشاء مستخدم بدون رقم هاتف
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد"
  }'

# النتيجة المتوقعة: 400 Bad Request
```

### 2. اختبار معدل تحديد الطلبات

```bash
# إرسال عدة طلبات متتالية
for i in {1..100}; do
  curl http://localhost:3000/api/users
done
```

### 3. اختبار معالجة الأخطاء

```bash
# محاولة الوصول إلى مستخدم غير موجود
curl http://localhost:3000/api/users/99999

# النتيجة المتوقعة: 404 Not Found
```

---

## 📈 اختبار الحمل

### استخدام Apache Bench

```bash
# اختبار 1000 طلب مع 10 متزامنة
ab -n 1000 -c 10 http://localhost:3000/api/users

# اختبار 5000 طلب مع 50 متزامنة
ab -n 5000 -c 50 http://localhost:3000/api/faq
```

### استخدام wrk

```bash
# تثبيت wrk
# Windows: choco install wrk

# اختبار الحمل
wrk -t4 -c100 -d30s http://localhost:3000/api/users
```

---

## 🔄 اختبار الجدولة

### التحقق من عمل الجدولة

```bash
# جدولة محتوى للإرسال الآن
curl -X POST http://localhost:3000/api/scheduled-content \
  -H "Content-Type: application/json" \
  -d '{
    "content": "اختبار الجدولة",
    "schedule_time": "2025-10-28T01:00:00",
    "target_audience": "all",
    "content_type": "test"
  }'

# تحقق من السجلات
tail -f backend/logs/app.log
```

---

## 📋 قائمة التحقق من الاختبارات

### اختبارات أساسية
- [ ] الخادم يعمل بدون أخطاء
- [ ] قاعدة البيانات متصلة
- [ ] جميع الـ APIs تستجيب
- [ ] لا توجد أخطاء في السجلات

### اختبارات الميزات
- [ ] الترحيب الآلي يعمل
- [ ] نظام الأسئلة الشائعة يعمل
- [ ] الجدولة تعمل
- [ ] التحليلات تُحدّث بشكل صحيح

### اختبارات الأمان
- [ ] التحقق من المدخلات يعمل
- [ ] معدل تحديد الطلبات يعمل
- [ ] معالجة الأخطاء صحيحة
- [ ] البيانات الحساسة محمية

### اختبارات الأداء
- [ ] الاستعلامات سريعة (< 200ms)
- [ ] النظام يتحمل الحمل العالي
- [ ] لا توجد تسريبات ذاكرة
- [ ] الاتصالات مستقرة

---

## 🐛 حل مشاكل الاختبار

### المشكلة: الخادم لا يستجيب

```bash
# تحقق من أن الخادم يعمل
curl http://localhost:3000/health

# إذا لم يستجب، أعد تشغيل الخادم
npm run dev
```

### المشكلة: خطأ في قاعدة البيانات

```bash
# تحقق من الاتصال
mysql -u wa_bot_user -p wa_bot_db -e "SELECT COUNT(*) FROM users;"

# أعد تحميل الجداول إذا لزم الأمر
mysql -u wa_bot_user -p wa_bot_db < database/schema.sql
```

### المشكلة: أخطاء في الاستعلامات

```bash
# تحقق من السجلات
tail -f backend/logs/app.log

# ابحث عن الأخطاء
grep "ERROR" backend/logs/error.log
```

---

## 📊 تقرير الاختبار

### نموذج تقرير

```
تاريخ الاختبار: 2025-10-28
الإصدار: 1.0.0

✅ الاختبارات الناجحة: 45/50
❌ الاختبارات الفاشلة: 5/50
⏭️ الاختبارات المتخطاة: 0/50

نسبة النجاح: 90%

الملاحظات:
- جميع الـ APIs تستجيب بشكل صحيح
- الأداء ممتاز
- الأمان محمي
- بعض الاختبارات تحتاج إلى تحسين
```

---

## 🎯 الخطوات التالية

1. ✅ اختبر جميع الـ APIs
2. ✅ اختبر الخدمات
3. ✅ اختبر الأداء
4. ✅ اختبر الأمان
5. ✅ اختبر الحمل
6. ✅ وثّق النتائج
7. ✅ أصلح الأخطاء
8. ✅ أعد الاختبارات

---

## 📞 الدعم

إذا واجهت مشاكل:
- 📧 info@eplusweb.com
- 🌐 eplusweb.com
- 📱 +966XXXXXXXXX

---

**آخر تحديث:** أكتوبر 2025
