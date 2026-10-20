const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
// تعريف المنفذ أولاً لضمان عمله على Render
const PORT = process.env.PORT || 3000;

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

// 1. تشغيل السيرفر أولاً (هذا هو السر لمنع خطأ Timed Out)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 السيرفر يعمل بنجاح على المنفذ: ${PORT}`);
});

// 2. الاتصال بقاعدة البيانات MongoDB بعد تشغيل السيرفر
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
  .catch((err) => console.error('❌ فشل الاتصال:', err.message));