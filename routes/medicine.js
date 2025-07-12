const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medicine = require('../models/Medicine');


// Add a medicine reminder
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, time, date, duration, notes } = req.body;

    // Combine date and time into full Date object
    // const [hours, minutes] = time.split(':').map(Number);
    // const scheduledTime = new Date(date);
    // scheduledTime.setHours(parseInt(hours));
    // scheduledTime.setMinutes(parseInt(minutes));
    // scheduledTime.setSeconds(0);
    // scheduledTime.setMilliseconds(0);

    const [hours, minutes] = time.split(':').map(Number);
const localDateTime = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

// Convert IST (UTC+5:30) to UTC
const scheduledTime = new Date(localDateTime.getTime() - 5.5 * 60 * 60 * 1000);


    const now = new Date();
    const diffMinutes = (scheduledTime - now) / 1000 / 60;

    if (diffMinutes < 1) {
      return res.status(400).json({ msg: 'Scheduled time must be at least 1 minute after current time.' });
    }

    const newMedicine = new Medicine({
      user: req.user,
      name,
      dosage,
      time,
      date,
      duration,
      notes,
      scheduledTime
    });

    const savedMedicine = await newMedicine.save();
    res.status(201).json(savedMedicine);
  } catch (err) {
    console.error("❌ Error saving medicine:", err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Get all medicines for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user }).sort({ scheduledTime: 1 });
    res.json(medicines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update a medicine reminder by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, dosage, time, date, duration, notes } = req.body;

    const updatedFields = { name, dosage, time, date, duration, notes };

    if (date && time) {
      // const [hours, minutes] = time.split(':');
      // const scheduledTime = new Date(date);
      // scheduledTime.setHours(parseInt(hours));
      // scheduledTime.setMinutes(parseInt(minutes));
      // scheduledTime.setSeconds(0);
      const [hours, minutes] = time.split(':').map(Number);
const localDateTime = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
const scheduledTime = new Date(localDateTime.getTime() - 5.5 * 60 * 60 * 1000);

      updatedFields.scheduledTime = scheduledTime;
    }

    const updatedReminder = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      updatedFields,
      { new: true }
    );

    if (!updatedReminder) return res.status(404).json({ msg: 'Reminder not found' });
    res.json(updatedReminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a medicine reminder by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedReminder = await Medicine.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });

    if (!deletedReminder) return res.status(404).json({ msg: 'Reminder not found' });

    res.json({ msg: 'Reminder deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
