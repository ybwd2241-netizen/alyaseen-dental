const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// إعدادات وسيطة (Middleware)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم ملفات الواجهة الأمامية من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// ربط الـ Routes
const appointmentsRoute = require('./routes/appointments');
const authRoute = require('./routes/auth');

app.use('/api/appointments', appointmentsRoute);
app.use('/api/auth', authRoute);

// الاتصال بقاعدة البيانات MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
  .catch((err) => console.error('❌ فشل الاتصال:', err.message));

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log('🚀 السيرفر يعمل على: http://127.0.0.1:' + PORT);
});