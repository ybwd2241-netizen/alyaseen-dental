const express = require('express');
const Appointment = require('../models/Appointment');

const router = express.Router();

// إنشاء حجز جديد
router.post('/', async (req, res) => {
  try {
    const { patientName, phone, email, service, date, time, notes } = req.body;

    // التحقق من الحقول المطلوبة
    if (!patientName || !phone || !service || !date || !time) {
      return res.status(400).json({ message: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' });
    }

    const appointment = new Appointment({
      patientName,
      phone,
      email,
      service,
      date,
      time,
      notes
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحجز بنجاح',
      appointment
    });
  } catch (error) {
    console.error('خطأ في إنشاء الحجز:', error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

// عرض جميع الحجوزات (مع إمكانية الفلترة حسب الحالة)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    // إذا تم تمرير status، فلترة حسب الحالة
    if (status && status !== 'all') {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

// تحديث حالة الحجز (قبول/رفض)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // التحقق من الحالة
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'الحالة يجب أن تكون approved أو rejected' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة الحجز',
      appointment
    });
  } catch (error) {
    console.error('خطأ في تحديث الحجز:', error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

// حذف حجز
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    res.json({
      success: true,
      message: 'تم حذف الحجز'
    });
  } catch (error) {
    console.error('خطأ في حذف الحجز:', error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;