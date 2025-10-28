# البدء السريع
## WhatsApp360 Bot - Quick Start Guide

---

## ⚡ البدء في 5 دقائق

### 1️⃣ إعداد قاعدة البيانات (2 دقيقة)

```bash
# فتح MySQL
mysql -u root -p

# تنفيذ الأوامر
CREATE DATABASE wa_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wa_bot_user'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON wa_bot_db.* TO 'wa_bot_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# تحميل الجداول
mysql -u wa_bot_user -p wa_bot_db < database/schema.sql
```

### 2️⃣ تثبيت Backend (2 دقيقة)

```bash
cd backend
npm install
cp .env.example .env
# عدّل .env بكلمة مرور قاعدة البيانات
npm run dev
```

### 3️⃣ تشغيل Frontend (1 دقيقة)

```bash
cd ../frontend
npm install
npm start
```

**✅ تم! الخادم يعمل على `http://localhost:3000`**

---

## 🔗 الـ APIs الأساسية

### الحصول على المستخدمين
```bash
curl http://localhost:3000/api/users
```

### إضافة سؤال شائع
```bash
curl -X POST http://localhost:3000/api/faq \
  -H "Content-Type: application/json" \
  -d '{
    "question": "كيف أبدأ؟",
    "answer": "ابدأ بـ...",
    "keywords": ["بدء"]
  }'
```

### إرسال رسالة
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+966XXXXXXXXX",
    "message": "مرحباً!"
  }'
```

### جدولة محتوى
```bash
curl -X POST http://localhost:3000/api/scheduled-content \
  -H "Content-Type: application/json" \
  -d '{
    "content": "محتوى مهم",
    "schedule_time": "2025-11-01T10:00:00",
    "target_audience": "all",
    "content_type": "announcement"
  }'
```

### الحصول على الإحصائيات
```bash
curl http://localhost:3000/admin/dashboard/stats
```

---

## 📁 الملفات المهمة

| الملف | الغرض |
|------|-------|
| `backend/.env` | متغيرات البيئة |
| `database/schema.sql` | جداول قاعدة البيانات |
| `backend/server.js` | ملف الخادم الرئيسي |
| `backend/routes/api.js` | الـ APIs |
| `backend/services/` | الخدمات الأساسية |

---

## 🔧 الأوامر الأساسية

```bash
# تشغيل الخادم
cd backend && npm run dev

# تشغيل الواجهة
cd frontend && npm start

# إيقاف الخادم
Ctrl + C

# إعادة تثبيت المكتبات
rm -rf node_modules package-lock.json
npm install

# فحص صحة النظام
curl http://localhost:3000/health
```

---

## 🐛 حل المشاكل السريع

| المشكلة | الحل |
|--------|------|
| خطأ في الاتصال بـ MySQL | تأكد من تشغيل MySQL: `net start MySQL80` |
| المنفذ 3000 مستخدم | غير المنفذ في `.env` إلى `PORT=3001` |
| خطأ في المكتبات | احذف `node_modules` وأعد التثبيت |
| خطأ في قاعدة البيانات | تحقق من كلمة المرور في `.env` |

---

## 📊 الإحصائيات

```bash
# عدد المستخدمين
curl http://localhost:3000/api/users | jq 'length'

# إحصائيات لوحة التحكم
curl http://localhost:3000/admin/dashboard/stats | jq '.'

# الأسئلة الشائعة
curl http://localhost:3000/api/faq | jq '.'
```

---

## 🎯 الخطوات التالية

1. ✅ **تثبيت المشروع** - اتبع الخطوات أعلاه
2. 📝 **إضافة بيانات** - أضف أسئلة شائعة ودورات
3. 🔌 **ربط WhatsApp** - أضف API keys في `.env`
4. 🎨 **تخصيص الواجهة** - عدّل قوالب الرسائل
5. 🚀 **النشر** - انشر على الإنتاج

---

## 📚 المراجع

- 📖 [دليل التطوير الشامل](./DEVELOPMENT_PLAN.md)
- 📖 [دليل الإعداد التفصيلي](./SETUP_GUIDE.md)
- 📖 [دليل المشروع الرئيسي](./README.md)
- 📖 [ملخص المشروع](./PROJECT_SUMMARY.md)

---

## 💡 نصائح مهمة

- 💾 احفظ `.env` في مكان آمن
- 🔐 استخدم كلمات مرور قوية
- 📝 احتفظ بنسخ احتياطية من قاعدة البيانات
- 🔍 راجع السجلات في `backend/logs/`
- 🧪 اختبر الـ APIs قبل الاستخدام

---

## 🚀 جاهز للبدء؟

```bash
# انسخ هذه الأوامر وشغّلها
cd /c/wamp64/www/wa-bot/backend
npm install
npm run dev

# في نافذة جديدة
cd /c/wamp64/www/wa-bot/frontend
npm install
npm start
```

**استمتع بالتطوير! 🎉**

---

**آخر تحديث:** أكتوبر 2025
