# 🔧 دليل حل المشاكل
## WhatsApp360 Bot - Troubleshooting Guide

---

## 🚨 المشاكل الشائعة والحلول

### 1. الخادم لا يبدأ

#### المشكلة
```
Error: listen EADDRINUSE :::3000
```

#### الحلول

**الحل 1: تغيير المنفذ**
```bash
# عدّل .env
PORT=3001

# أعد تشغيل الخادم
npm run dev
```

**الحل 2: إيقاف العملية المستخدمة للمنفذ**

Windows:
```bash
# ابحث عن العملية
netstat -ano | findstr :3000

# أوقفها (استبدل PID برقم العملية)
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
# ابحث عن العملية
lsof -i :3000

# أوقفها
kill -9 <PID>
```

---

### 2. خطأ في الاتصال بقاعدة البيانات

#### المشكلة
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

#### الحلول

**الحل 1: تأكد من تشغيل MySQL**

Windows:
```bash
net start MySQL80
```

macOS:
```bash
brew services start mysql
```

Linux:
```bash
sudo systemctl start mysql
```

**الحل 2: تحقق من بيانات الاتصال في .env**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=wa_bot_user
DB_PASSWORD=secure_password_123
DB_NAME=wa_bot_db
```

**الحل 3: اختبر الاتصال مباشرة**
```bash
mysql -u wa_bot_user -p wa_bot_db -e "SELECT 1;"
```

---

### 3. خطأ: "Access denied for user"

#### المشكلة
```
Error: Access denied for user 'wa_bot_user'@'localhost'
```

#### الحلول

**الحل 1: تحقق من كلمة المرور**
```bash
# اختبر الاتصال مع كلمة المرور
mysql -u wa_bot_user -p

# أدخل كلمة المرور من .env
```

**الحل 2: أعد تعيين كلمة المرور**
```bash
mysql -u root -p

# في MySQL:
ALTER USER 'wa_bot_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# حدّث .env بكلمة المرور الجديدة
```

**الحل 3: أعد إنشاء المستخدم**
```bash
mysql -u root -p

# في MySQL:
DROP USER 'wa_bot_user'@'localhost';
CREATE USER 'wa_bot_user'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON wa_bot_db.* TO 'wa_bot_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### 4. خطأ: "Database does not exist"

#### المشكلة
```
Error: Unknown database 'wa_bot_db'
```

#### الحلول

**الحل 1: أنشئ قاعدة البيانات**
```bash
mysql -u root -p

# في MySQL:
CREATE DATABASE wa_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**الحل 2: حمّل الجداول**
```bash
mysql -u wa_bot_user -p wa_bot_db < database/schema.sql
```

---

### 5. خطأ في المكتبات

#### المشكلة
```
npm ERR! peer dep missing
```

#### الحلول

**الحل 1: أعد تثبيت المكتبات**
```bash
# احذف المجلدات
rm -rf node_modules package-lock.json

# أعد التثبيت
npm install
```

**الحل 2: حدّث npm**
```bash
npm install -g npm@latest
npm install
```

**الحل 3: استخدم npm ci**
```bash
npm ci
```

---

### 6. خطأ: "Cannot find module"

#### المشكلة
```
Error: Cannot find module 'express'
```

#### الحلول

```bash
# تأكد من أنك في مجلد backend
cd backend

# أعد تثبيت المكتبات
npm install

# تحقق من package.json
cat package.json
```

---

### 7. خطأ في الـ API

#### المشكلة
```
404 Not Found
```

#### الحلول

**الحل 1: تحقق من الـ endpoint**
```bash
# تأكد من الـ URL
curl http://localhost:3000/api/users

# ليس
curl http://localhost:3000/users
```

**الحل 2: تحقق من طريقة الطلب**
```bash
# للـ GET
curl http://localhost:3000/api/users

# للـ POST
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

### 8. خطأ: "CORS error"

#### المشكلة
```
Access to XMLHttpRequest blocked by CORS policy
```

#### الحلول

**الحل 1: تحقق من CORS في .env**
```
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

**الحل 2: أضف رؤوس CORS**
```bash
curl -H "Origin: http://localhost:3000" \
  http://localhost:3000/api/users
```

---

### 9. خطأ: "Timeout"

#### المشكلة
```
Error: Request timeout
```

#### الحلول

**الحل 1: تحقق من الخادم**
```bash
curl http://localhost:3000/health
```

**الحل 2: تحقق من قاعدة البيانات**
```bash
mysql -u wa_bot_user -p wa_bot_db -e "SELECT 1;"
```

**الحل 3: أعد تشغيل الخادم**
```bash
# أوقف الخادم (Ctrl + C)
# أعد تشغيله
npm run dev
```

---

### 10. خطأ: "Out of memory"

#### المشكلة
```
Error: JavaScript heap out of memory
```

#### الحلول

**الحل 1: زيادة حد الذاكرة**
```bash
node --max-old-space-size=4096 server.js
```

**الحل 2: تحقق من التسريبات**
```bash
# عرض استخدام الذاكرة
node -e "console.log(process.memoryUsage())"
```

---

## 📊 اختبار التشخيص

### فحص شامل للنظام

```bash
# 1. تحقق من الخادم
curl http://localhost:3000/health

# 2. تحقق من قاعدة البيانات
mysql -u wa_bot_user -p wa_bot_db -e "SELECT COUNT(*) FROM users;"

# 3. تحقق من الـ APIs
curl http://localhost:3000/api/users

# 4. تحقق من السجلات
tail -20 backend/logs/app.log

# 5. تحقق من الأخطاء
grep "ERROR" backend/logs/error.log
```

---

## 🔍 عرض السجلات

### السجلات الرئيسية

```bash
# عرض جميع السجلات
tail -f backend/logs/app.log

# عرض الأخطاء فقط
tail -f backend/logs/error.log

# عرض آخر 100 سطر
tail -100 backend/logs/app.log

# البحث عن كلمة معينة
grep "ERROR" backend/logs/app.log
grep "database" backend/logs/app.log
```

### تحليل السجلات

```bash
# عد عدد الأخطاء
grep -c "ERROR" backend/logs/error.log

# عرض الأخطاء الفريدة
grep "ERROR" backend/logs/error.log | sort | uniq

# عرض الأخطاء مع السياق
grep -B2 -A2 "ERROR" backend/logs/app.log
```

---

## 🧪 اختبارات التشخيص

### اختبار الاتصال

```bash
# اختبر الخادم
curl -v http://localhost:3000/health

# اختبر قاعدة البيانات
node -e "
const db = require('./config/database');
db.query('SELECT 1 as test')
  .then(() => console.log('✅ Database OK'))
  .catch(err => console.error('❌ Database Error:', err));
"
```

### اختبار الأداء

```bash
# قياس سرعة الاستجابة
curl -w "Time: %{time_total}s\n" http://localhost:3000/api/users

# اختبر استعلام معقد
time curl http://localhost:3000/admin/dashboard/stats
```

---

## 📋 قائمة التحقق من المشاكل

### عند بدء الخادم
- [ ] هل المنفذ متاح؟
- [ ] هل MySQL يعمل؟
- [ ] هل .env معدّ بشكل صحيح؟
- [ ] هل جميع المكتبات مثبتة؟

### عند الاتصال بقاعدة البيانات
- [ ] هل بيانات الاتصال صحيحة؟
- [ ] هل المستخدم موجود؟
- [ ] هل قاعدة البيانات موجودة؟
- [ ] هل الجداول موجودة؟

### عند استخدام الـ APIs
- [ ] هل الـ URL صحيح؟
- [ ] هل طريقة الطلب صحيحة؟
- [ ] هل البيانات صحيحة؟
- [ ] هل الرؤوس صحيحة؟

---

## 🆘 طلب الدعم

إذا لم تتمكن من حل المشكلة:

1. **اجمع المعلومات:**
   ```bash
   # نسخ السجلات
   cp backend/logs/error.log error_log.txt
   
   # نسخ معلومات النظام
   npm list > npm_list.txt
   ```

2. **وثّق المشكلة:**
   - رسالة الخطأ الكاملة
   - الخطوات التي أدت للمشكلة
   - ما حاولت بالفعل
   - نتائج الاختبارات

3. **تواصل مع الدعم:**
   - 📧 info@eplusweb.com
   - 🌐 eplusweb.com
   - 📱 +966XXXXXXXXX

---

## 📚 موارد إضافية

- 📖 [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 📖 [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- 📖 [README.md](./README.md)
- 📖 [RUN_TESTS.md](./RUN_TESTS.md)

---

**آخر تحديث:** أكتوبر 2025
