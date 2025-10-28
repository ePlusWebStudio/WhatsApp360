# WhatsApp360 Bot - Community Management System

**تطوير:** أكاديمية اي بلس ويب EPLUSWEB  
**الموقع:** eplusweb.com

---

## 📖 نظرة عامة

نظام متكامل لإدارة المجتمعات الرقمية على WhatsApp مع ميزات متقدمة للترحيب الآلي، الأسئلة الشائعة، جدولة المحتوى، والتحليلات.

---

## 🚀 البدء السريع

### المتطلبات الأساسية

- **Node.js** v14+ و npm
- **MySQL** 5.7+
- **Redis** (اختياري، للتخزين المؤقت)
- **WhatsApp Business Account** (للتكامل الكامل)

### التثبيت

#### 1. استنساخ المشروع

```bash
cd /c/wamp64/www/wa-bot
```

#### 2. تثبيت المكتبات

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. إعداد قاعدة البيانات

```bash
# تسجيل الدخول إلى MySQL
mysql -u root -p

# إنشاء قاعدة البيانات
CREATE DATABASE wa_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# إنشاء مستخدم
CREATE USER 'wa_bot_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON wa_bot_db.* TO 'wa_bot_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 4. تنفيذ جداول قاعدة البيانات

```bash
mysql -u wa_bot_user -p wa_bot_db < database/schema.sql
```

#### 5. إعداد متغيرات البيئة

```bash
cd backend
cp .env.example .env
# عدّل .env بمعلومات قاعدة البيانات والـ API Keys
```

#### 6. تشغيل الخادم

```bash
# Backend
cd backend
npm run dev

# في نافذة terminal جديدة - Frontend
cd frontend
npm start
```

---

## 📁 هيكل المشروع

```
wa-bot/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── services/
│   │   ├── whatsappService.js
│   │   ├── schedulerService.js
│   │   └── faqService.js
│   ├── routes/
│   │   ├── api.js
│   │   ├── webhooks.js
│   │   └── admin.js
│   ├── utils/
│   │   └── logger.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── database/
│   └── schema.sql
├── DEVELOPMENT_PLAN.md
└── README.md
```

---

## 🔧 التكوين

### متغيرات البيئة الأساسية

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=wa_bot_user
DB_PASSWORD=your_password
DB_NAME=wa_bot_db

# WhatsApp
WHATSAPP_API_KEY=your_api_key
WHATSAPP_VERIFY_TOKEN=your_verify_token

# JWT
JWT_SECRET=your_secret_key

# Academy
ACADEMY_NAME=أكاديمية اي بلس ويب
ACADEMY_EMAIL=info@eplusweb.com
```

---

## 📚 الميزات الرئيسية

### 1. الترحيب الآلي
- رسائل ترحيب مخصصة للأعضاء الجدد
- دعم أنواع مختلفة من الأعضاء (عام، VIP)
- جدولة رسائل المتابعة

### 2. نظام الأسئلة الشائعة (FAQ)
- محرك بحث ذكي بمعالجة لغوية
- تطابق الكلمات المفتاحية
- إحصائيات الاستخدام

### 3. جدولة المحتوى
- جدولة الرسائل والوسائط
- استهداف جماهير محددة
- معالجة الأخطاء والإعادة

### 4. التذكيرات الذكية
- تذكيرات الدورات والفعاليات
- حساب الوقت المتبقي
- إرسال مجدول تلقائي

### 5. الاستبيانات والاستطلاعات
- إنشاء استبيانات ديناميكية
- جمع الإجابات تلقائياً
- تحليل النتائج

### 6. لوحة التحكم
- إدارة المستخدمين
- عرض التحليلات
- إدارة المحتوى
- تتبع التفاعلات

---

## 🔌 API Endpoints

### المستخدمون
- `GET /api/users` - قائمة المستخدمين
- `GET /api/users/:id` - بيانات مستخدم
- `POST /api/users` - إنشاء مستخدم جديد

### الرسائل
- `GET /api/messages` - قائمة الرسائل
- `POST /api/messages/send` - إرسال رسالة

### الأسئلة الشائعة
- `GET /api/faq` - قائمة الأسئلة
- `POST /api/faq` - إضافة سؤال جديد
- `GET /api/faq/search?q=term` - البحث

### الدورات
- `GET /api/courses` - قائمة الدورات
- `POST /api/courses` - إنشاء دورة جديدة

### المحتوى المجدول
- `GET /api/scheduled-content` - قائمة المحتوى المجدول
- `POST /api/scheduled-content` - جدولة محتوى جديد

### التحليلات
- `GET /api/analytics` - بيانات التحليلات
- `GET /api/analytics/summary` - ملخص التحليلات

### الإدارة
- `GET /admin/dashboard/stats` - إحصائيات لوحة التحكم
- `POST /admin/messages/bulk-send` - إرسال رسائل جماعية
- `GET /admin/analytics/engagement` - تحليلات التفاعل

---

## 🔐 الأمان

### أفضل الممارسات المطبقة

- ✅ تشفير كلمات المرور باستخدام bcrypt
- ✅ التحقق من المدخلات (Validation)
- ✅ حماية من CSRF و XSS
- ✅ معدل تحديد الطلبات (Rate Limiting)
- ✅ تسجيل الأنشطة (Logging)
- ✅ استخدام HTTPS/SSL

### متطلبات الأمان

1. استخدم متغيرات البيئة للمعلومات الحساسة
2. قم بتحديث المكتبات بانتظام
3. استخدم كلمات مرور قوية
4. قم بعمل نسخ احتياطية منتظمة

---

## 📊 قاعدة البيانات

### الجداول الرئيسية

- **users** - بيانات الأعضاء
- **messages** - سجل الرسائل
- **courses** - الدورات والفعاليات
- **interactions** - تتبع التفاعلات
- **surveys** - الاستبيانات
- **survey_responses** - إجابات الاستبيانات
- **scheduled_content** - المحتوى المجدول
- **faq** - الأسئلة الشائعة
- **message_templates** - قوالب الرسائل
- **analytics** - بيانات التحليلات

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# اختبارات مع التغطية
npm run test:coverage

# اختبارات الأداء
npm run test:performance
```

---

## 📈 التطوير المستقبلي

### المرحلة التالية
- [ ] دعم Telegram
- [ ] دعم Discord
- [ ] تكامل مع AI (GPT)
- [ ] نظام الدفع والاشتراكات
- [ ] تقارير متقدمة
- [ ] تكامل CRM

---

## 🐛 حل المشاكل

### المشكلة: خطأ في الاتصال بقاعدة البيانات

**الحل:**
```bash
# تحقق من بيانات الاتصال في .env
# تأكد من تشغيل MySQL
# جرب إعادة تشغيل الخادم
npm run dev
```

### المشكلة: لا تعمل WebHooks

**الحل:**
- تحقق من WHATSAPP_VERIFY_TOKEN في .env
- تأكد من أن الخادم يعمل على HTTPS
- جرب إعادة التحقق من الـ Webhook

---

## 📞 الدعم والمساعدة

للحصول على الدعم:
- 📧 البريد الإلكتروني: info@eplusweb.com
- 🌐 الموقع: eplusweb.com
- 📱 الهاتف: +966XXXXXXXXX

---

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

---

## 👥 المساهمون

- فريق تطوير أكاديمية اي بلس ويب

---

**آخر تحديث:** أكتوبر 2025
