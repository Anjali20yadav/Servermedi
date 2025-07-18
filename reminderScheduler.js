const cron = require('node-cron');
const Medicine = require('./models/Medicine');
const User = require('./models/User');
const sendEmail = require('./utils/emailService');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected for Scheduler'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

cron.schedule('*/1 * * * *', async () => {
  console.log("🔔 Running reminder check...");

  // Robust IST calculation
  const now = new Date();
  const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const nowDateStr = nowIST.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const nowHours = nowIST.getHours();
  const nowMinutes = nowIST.getMinutes();

  try {
    const medicines = await Medicine.find({});
    console.log(`Fetched ${medicines.length} medicines from DB`);

    for (let med of medicines) {
      if (!med.time) {
        console.warn(`⚠️ Medicine ${med.name} has no time set, skipping...`);
        continue;
      }

      // Parse med.time (string "HH:mm")
      const [hoursStr, minutesStr] = med.time.split(':');
      const reminderHours = parseInt(hoursStr, 10);
      const reminderMinutes = parseInt(minutesStr, 10);

      if (isNaN(reminderHours) || isNaN(reminderMinutes)) {
        console.warn(`⚠️ Medicine ${med.name} has invalid time format, skipping...`);
        continue;
      }

      // Check if current date is within duration (using IST)
      const startDate = new Date(med.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + med.duration - 1);
      endDate.setHours(23, 59, 59, 999);

      if (nowIST < startDate || nowIST > endDate) {
        console.log(`Skipping ${med.name} as today is outside duration.`);
        continue;
      }

      // Compose reminder datetime for today using med.time (in IST)
      const reminderDateTime = new Date(nowDateStr);
      reminderDateTime.setHours(reminderHours, reminderMinutes, 0, 0);

      // 🔍 Log current time vs reminder time
      console.log("🕓 Current IST Time:", nowIST.toTimeString().slice(0, 5), "⏰ Reminder Time:", reminderDateTime.toTimeString().slice(0, 5));

      if (reminderDateTime.getHours() === nowHours && reminderDateTime.getMinutes() === nowMinutes) {
        // Check lastNotified to avoid duplicate email on same day
        if (med.lastNotified) {
          // Convert lastNotified to IST for comparison
          const lastNotifiedIST = new Date(new Date(med.lastNotified).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
          const lastNotifiedDateStr = lastNotifiedIST.toISOString().split('T')[0];
          if (lastNotifiedDateStr === nowDateStr) {
            console.log(`Already notified today for ${med.name}, skipping.`);
            continue;
          }
        }

        console.log(`📨 Sending email reminder for medicine ${med.name}...`);

        const user = await User.findById(med.user);
        if (!user || !user.email) {
          console.warn(`⚠️ User or email not found for ${med.name}`);
          continue;
        }

        await sendEmail(
          user.email,
          `💊 Medicine Reminder: ${med.name}`,
          `Hello ${user.name},\n\nThis is your reminder to take ${med.name} (${med.dosage}) at ${reminderDateTime.toLocaleTimeString()} (IST).\n\nStay healthy!\nHealsync`
        );

        med.lastNotified = nowIST;
        await med.save();

        console.log(`📧 Reminder sent and lastNotified updated for ${med.name}`);
      } else {
        console.log(`No reminder for ${med.name} at this minute.`);
      }
    }
  } catch (error) {
    console.error("❌ Error in reminder scheduler:", error);
  }
});
