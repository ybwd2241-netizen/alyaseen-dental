const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const appointmentsRoute = require('./routes/appointments');
const authRoute = require('./routes/auth');

app.use('/api/appointments', appointmentsRoute);
app.use('/api/auth', authRoute);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 السيرفر يعمل بنجاح على المنفذ: ${PORT}`);
    console.log(`🌐 تم الربط بالعنوان: 0.0.0.0`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
  .catch((err) => console.error('❌ فشل الاتصال:', err.message));