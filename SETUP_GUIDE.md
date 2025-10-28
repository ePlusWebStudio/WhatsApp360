# دليل الإعداد والتثبيت
## WhatsApp360 Bot - نظام إدارة المجتمع الرقمي

---

## ✅ المتطلبات الأساسية

قبل البدء، تأكد من توفر:

- ✅ **Node.js** v14+ ([تحميل](https://nodejs.org/))
- ✅ **npm** (يأتي مع Node.js)
- ✅ **MySQL** 5.7+ ([تحميل](https://www.mysql.com/downloads/))
- ✅ **Git** (اختياري)
- ✅ **WhatsApp Business Account** (للتكامل الكامل)

---

## 🔧 خطوات التثبيت

### الخطوة 1: إعداد قاعدة البيانات

#### 1.1 إنشاء قاعدة البيانات

```bash
# فتح MySQL Command Line
mysql -u root -p

# تنفيذ الأوامر التالية:
CREATE DATABASE wa_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'wa_bot_user'@'localhost' IDENTIFIED BY 'secure_password_123';

GRANT ALL PRIVILEGES ON wa_bot_db.* TO 'wa_bot_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

#### 1.2 تحميل الجداول

```bash
# من مجلد المشروع
cd /c/wamp64/www/wa360

mysql -u wa_bot_user -p wa_bot_db < database/schema.sql
# أدخل كلمة المرور: secure_password_123
```

---

### الخطوة 2: إعداد Backend

#### 2.1 تثبيت المكتبات

```bash
cd backend
npm install
```

#### 2.2 إعداد ملف البيئة

```bash
# نسخ ملف المثال
cp .env.example .env

# تعديل .env بمحرر نصي (استخدم VS Code أو أي محرر)
```

**محتوى .env:**
```
NODE_ENV=development
PORT=3000
HOST=localhost

DB_HOST=localhost
DB_PORT=3306
DB_USER=wa_bot_user
DB_PASSWORD=secure_password_123
DB_NAME=wa_bot_db

WHATSAPP_API_KEY=your_api_key_here
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
JWT_SECRET=your_jwt_secret_key_here

ACADEMY_NAME=أكاديمية اي بلس ويب
ACADEMY_EMAIL=info@eplusweb.com
ACADEMY_PHONE=+201271720708

CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

#### 2.3 تشغيل الخادم

```bash
# من مجلد backend
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

---

### الخطوة 3: إعداد Frontend

#### 3.1 تثبيت المكتبات

```bash
cd ../frontend
npm install
```

#### 3.2 إنشاء ملف البيئة

```bash
# إنشاء ملف .env
echo "REACT_APP_API_URL=http://localhost:3000" > .env
```

#### 3.3 تشغيل التطبيق

```bash
npm start
```

**النتيجة المتوقعة:**
- سيفتح المتصفح تلقائياً على `http://localhost:3000`
- واجهة لوحة التحكم الإدارية

---

## 🧪 اختبار التثبيت

### 1. اختبار قاعدة البيانات

```bash
# من مجلد backend
node -e "
const db = require('./config/database');
db.query('SELECT COUNT(*) as count FROM users')
  .then(([result]) => {
    console.log('✅ Database connected! Users count:', result[0].count);
  })
  .catch(err => console.error('❌ Error:', err));
"
```

### 2. اختبار API

```bash
# في نافذة terminal جديدة
curl http://localhost:3000/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-27T...",
  "uptime": 123.45
}
```

### 3. اختبار الـ Endpoints

```bash
# الحصول على قائمة المستخدمين
curl http://localhost:3000/api/users

# الحصول على الأسئلة الشائعة
curl http://localhost:3000/api/faq

# الحصول على إحصائيات لوحة التحكم
curl http://localhost:3000/admin/dashboard/stats
```

---

## 📋 الملفات المهمة

| الملف | الوصف |
|------|-------|
| `DEVELOPMENT_PLAN.md` | خطة التطوير الشاملة |
| `README.md` | دليل المشروع الرئيسي |
| `backend/.env` | متغيرات البيئة للخادم |
| `backend/server.js` | ملف الخادم الرئيسي |
| `database/schema.sql` | جداول قاعدة البيانات |

---

## 🚀 الخطوات التالية

### 1. تكوين WhatsApp API

```bash
# احصل على:
1. WhatsApp Business Account ID
2. API Access Token
3. Verify Token

# أضفها إلى .env
WHATSAPP_API_KEY=your_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

### 2. إضافة بيانات أولية

```bash
# أضف أسئلة شائعة
curl -X POST http://localhost:3000/api/faq \
  -H "Content-Type: application/json" \
  -d '{
    "question": "كيف أبدأ؟",
    "answer": "ابدأ بـ...",
    "keywords": ["بدء", "ابدأ"]
  }'

# أضف دورة
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "دورة التسويق الرقمي",
    "description": "...",
    "schedule_date": "2025-11-01T10:00:00",
    "instructor": "المدرب"
  }'
```

### 3. تفعيل الميزات

- [ ] إعداد Webhooks
- [ ] تكوين الجدولة
- [ ] إضافة قوالب الرسائل
- [ ] إعداد التحليلات

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: خطأ في الاتصال بـ MySQL

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**الحل:**
```bash
# تأكد من تشغيل MySQL
# Windows:
net start MySQL80

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

### المشكلة 2: خطأ في المنفذ (Port already in use)

```
Error: listen EADDRINUSE :::3000
```

**الحل:**
```bash
# غير المنفذ في .env
PORT=3001

# أو أغلق العملية المستخدمة للمنفذ 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### المشكلة 3: خطأ في المكتبات

```
npm ERR! peer dep missing
```

**الحل:**
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### المشكلة 4: خطأ في قاعدة البيانات

```
Error: Access denied for user 'wa_bot_user'
```

**الحل:**
```bash
# تحقق من كلمة المرور في .env
# أعد تعيين كلمة المرور:
mysql -u root -p
ALTER USER 'wa_bot_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

---

## 📊 هيكل المشروع بعد التثبيت

```
wa-bot/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── services/
│   ├── routes/
│   ├── utils/
│   ├── logs/
│   ├── node_modules/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── node_modules/
│   ├── .env
│   └── package.json
├── database/
│   └── schema.sql
├── DEVELOPMENT_PLAN.md
├── SETUP_GUIDE.md
└── README.md
```

---

## ✨ الميزات الجاهزة للاستخدام

بعد التثبيت، لديك:

- ✅ **Backend API** كامل مع جميع الـ endpoints
- ✅ **قاعدة بيانات** مع جميع الجداول
- ✅ **نظام الجدولة** للمحتوى والتذكيرات
- ✅ **نظام الأسئلة الشائعة** مع البحث الذكي
- ✅ **نظام التحليلات** الأساسي
- ✅ **لوحة تحكم** أساسية

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل:

1. تحقق من [README.md](./README.md)
2. راجع [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
3. تحقق من السجلات في `backend/logs/`
4. تواصل مع الدعم: info@eplusweb.com

---

## 🎉 تم التثبيت بنجاح!

الآن يمكنك:
- 🚀 تطوير الميزات الإضافية
- 📱 ربط WhatsApp API
- 🎨 تخصيص لوحة التحكم
- 📊 إضافة المزيد من التحليلات

**استمتع بالتطوير!** 💻

---

**آخر تحديث:** أكتوبر 2025
