# 🧪 تشغيل الاختبارات
## WhatsApp360 Bot - Run Tests

---

## ⚡ البدء السريع

### الخطوة 1: تأكد من تشغيل الخادم

```bash
cd backend
npm run dev
```

### الخطوة 2: في نافذة terminal جديدة، شغّل الاختبارات

```bash
cd backend
node tests/api.test.js
```

---

## 🧪 أنواع الاختبارات

### 1. اختبارات API الشاملة

```bash
node tests/api.test.js
```

**ما يتم اختباره:**
- ✅ صحة النظام (Health Check)
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

### 2. اختبارات الخدمات

```bash
node tests/services.test.js
```

**ما يتم اختباره:**
- ✅ اختبار الاتصال بقاعدة البيانات
- ✅ اختبار خدمة الأسئلة الشائعة
- ✅ اختبار خدمة WhatsApp
- ✅ اختبار تكامل البيانات
- ✅ اختبار الأداء

### 3. تشغيل جميع الاختبارات

```bash
# الطريقة 1: تشغيل متتالي
node tests/services.test.js
node tests/api.test.js

# الطريقة 2: استخدام npm scripts (بعد تحديث package.json)
npm run test:all
```

---

## 📊 اختبارات يدوية باستخدام curl

### اختبار صحة النظام

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

### اختبار المستخدمين

```bash
# جلب المستخدمين
curl http://localhost:3000/api/users

# إنشاء مستخدم جديد
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+966501234567",
    "name": "أحمد محمد",
    "user_type": "regular"
  }'
```

### اختبار الأسئلة الشائعة

```bash
# جلب الأسئلة الشائعة
curl http://localhost:3000/api/faq

# البحث
curl "http://localhost:3000/api/faq/search?q=دورات"

# إضافة سؤال جديد
curl -X POST http://localhost:3000/api/faq \
  -H "Content-Type: application/json" \
  -d '{
    "question": "كيف أبدأ؟",
    "answer": "ابدأ بـ...",
    "keywords": ["بدء", "ابدأ"],
    "category": "general"
  }'

# الإحصائيات
curl http://localhost:3000/api/faq/stats
```

### اختبار الدورات

```bash
# جلب الدورات
curl http://localhost:3000/api/courses

# إنشاء دورة جديدة
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "دورة التسويق الرقمي",
    "description": "دورة شاملة",
    "instructor": "محمد أحمد",
    "schedule_date": "2025-11-05T10:00:00",
    "duration_minutes": 120
  }'
```

### اختبار التحليلات

```bash
# ملخص التحليلات
curl http://localhost:3000/api/analytics/summary

# بيانات التحليلات
curl http://localhost:3000/api/analytics

# إحصائيات لوحة التحكم
curl http://localhost:3000/admin/dashboard/stats

# أفضل المستخدمين
curl http://localhost:3000/admin/dashboard/top-users

# تحليلات التفاعل
curl http://localhost:3000/admin/analytics/engagement

# معدل الاحتفاظ
curl http://localhost:3000/admin/analytics/retention

# فحص صحة النظام
curl http://localhost:3000/admin/health
```

---

## 🔍 اختبار محدد

### اختبار endpoint معين

```bash
# مثال: اختبار جلب المستخدمين
curl -v http://localhost:3000/api/users

# مثال: اختبار إنشاء مستخدم مع رؤية رؤوس الاستجابة
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+966XXXXXXXXX", "name": "Test"}'
```

### اختبار مع حفظ النتيجة

```bash
# حفظ النتيجة في ملف
curl http://localhost:3000/api/users > users.json

# عرض النتيجة
cat users.json | jq '.'
```

---

## 📈 اختبار الأداء

### قياس سرعة الاستجابة

```bash
# استخدام time
time curl http://localhost:3000/api/users > /dev/null

# استخدام curl مع قياس الوقت
curl -w "Time: %{time_total}s\n" http://localhost:3000/api/users > /dev/null
```

### اختبار الحمل (إذا كان Apache Bench مثبتاً)

```bash
# اختبار 100 طلب مع 10 متزامنة
ab -n 100 -c 10 http://localhost:3000/api/users

# اختبار 1000 طلب مع 50 متزامنة
ab -n 1000 -c 50 http://localhost:3000/api/faq
```

---

## 🔐 اختبار الأمان

### اختبار التحقق من المدخلات

```bash
# محاولة إنشاء مستخدم بدون رقم هاتف (يجب أن يفشل)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "أحمد"}'

# النتيجة المتوقعة: 400 Bad Request
```

### اختبار معالجة الأخطاء

```bash
# محاولة الوصول إلى مستخدم غير موجود
curl http://localhost:3000/api/users/99999

# النتيجة المتوقعة: 404 Not Found
```

---

## 📋 قائمة الاختبارات الموصى بها

### يومياً
- [ ] اختبار صحة النظام
- [ ] اختبار المستخدمين
- [ ] اختبار الأسئلة الشائعة

### أسبوعياً
- [ ] اختبارات API الشاملة
- [ ] اختبارات الخدمات
- [ ] اختبار الأداء

### قبل النشر
- [ ] جميع الاختبارات
- [ ] اختبار الحمل
- [ ] اختبار الأمان

---

## 🐛 استكشاف الأخطاء

### عرض السجلات

```bash
# عرض السجلات الحالية
tail -f backend/logs/app.log

# عرض أخطاء محددة
grep "ERROR" backend/logs/error.log

# عرض آخر 50 سطر
tail -50 backend/logs/app.log
```

### اختبار الاتصال بقاعدة البيانات

```bash
# من داخل backend directory
node -e "
const db = require('./config/database');
db.query('SELECT COUNT(*) as count FROM users')
  .then(([result]) => {
    console.log('✅ Database connected! Users count:', result[0].count);
  })
  .catch(err => console.error('❌ Error:', err));
"
```

---

## 📊 نموذج تقرير الاختبار

```
تاريخ الاختبار: 2025-10-28
الوقت: 01:30 AM

✅ الاختبارات الناجحة: 12/12
❌ الاختبارات الفاشلة: 0/12

نسبة النجاح: 100%

التفاصيل:
- صحة النظام: ✅
- المستخدمين: ✅
- الأسئلة الشائعة: ✅
- الدورات: ✅
- التحليلات: ✅
- لوحة التحكم: ✅

الملاحظات:
- جميع الـ APIs تستجيب بشكل صحيح
- الأداء ممتاز
- لا توجد أخطاء في السجلات
```

---

## 🎯 الخطوات التالية

1. ✅ شغّل الخادم
2. ✅ شغّل الاختبارات
3. ✅ تحقق من النتائج
4. ✅ أصلح أي أخطاء
5. ✅ وثّق النتائج
6. ✅ انتقل إلى التطوير التالي

---

## 📞 الدعم

إذا واجهت مشاكل:
- 📖 اقرأ `TESTING_GUIDE.md`
- 📧 info@eplusweb.com
- 🌐 eplusweb.com

---

**آخر تحديث:** أكتوبر 2025
