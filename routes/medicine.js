const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medicine = require('../models/Medicine');


// Add a medicine reminder
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, time, date, duration, notes } = req.body;

    // Parse user input (IST) and convert to UTC
    const [hours, minutes] = time.split(':').map(Number);
    // Create a Date in IST
    const istDateTime = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`);
    // Convert IST Date to UTC (Date object stores as UTC)
    const scheduledTimeUTC = new Date(istDateTime.toISOString());

    const nowUTC = new Date();
    const diffMinutes = (scheduledTimeUTC - nowUTC) / 1000 / 60;

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
      scheduledTime: scheduledTimeUTC
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
      const [hours, minutes] = time.split(':').map(Number);
      const istDateTime = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`);
      const scheduledTimeUTC = new Date(istDateTime.toISOString());
      updatedFields.scheduledTime = scheduledTimeUTC;
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
