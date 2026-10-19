const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function updateDoctorAccount() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // ===== بيانات الدخول الجديدة والآمنة =====
    const NEW_USERNAME = 'admin_dental';      // اسم المستخدم الجديد
    const NEW_PASSWORD = 'Dental@2026!';      // كلمة المرور الجديدة (قوية وآمنة)

    // حذف جميع المستخدمين القدامى لضمان الأمان
    const deleted = await User.deleteMany({});
    console.log(`🗑️  تم حذف ${deleted.deletedCount} حساب قديم`);

    // إنشاء حساب الدكتور الجديد
    const doctor = new User({
      username: NEW_USERNAME,
      password: NEW_PASSWORD,
      role: 'doctor'
    });

    await doctor.save();

    console.log('✅ تم إنشاء حساب الدكتور الجديد بنجاح');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 بيانات الدخول الجديدة (احفظيها في مكان آمن):');
    console.log(`   👤 اسم المستخدم: ${NEW_USERNAME}`);
    console.log(`   🔑 كلمة المرور: ${NEW_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  سلمي هذه البيانات للدكتور عبر رسالة خاصة وآمنة فقط!');

    // إغلاق الاتصال
    await mongoose.disconnect();
    console.log('🔒 تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
  } catch (error) {
    console.error('❌ فشل تحديث الحساب:', error.message);
    process.exit(1);
  }
}

updateDoctorAccount();