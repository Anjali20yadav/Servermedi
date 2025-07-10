const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  time: {
    type: String, // e.g. "08:00"
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // number of days to remind
    required: true
  },
  notes: String,

  scheduledTime: {
    type: Date,
    required: true
  },

  lastNotified: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Medicine', medicineSchema);
