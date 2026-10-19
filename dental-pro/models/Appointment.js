const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'اسم المريض مطلوب'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  service: {
    type: String,
    required: [true, 'الخدمة مطلوبة'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'التاريخ مطلوب']
  },
  time: {
    type: String,
    required: [true, 'الوقت مطلوب']
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);