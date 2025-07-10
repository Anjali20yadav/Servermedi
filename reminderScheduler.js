const cron = require('node-cron');
const Medicine = require('./models/Medicine');
const User = require('./models/User');
const sendEmail = require('./utils/emailService');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected for Scheduler'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

cron.schedule('*/1 * * * *', async () => {  // run every 1 min to catch exact time
  console.log("🔔 Running reminder check...");

  const now = new Date();
  const nowDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();

  try {
    const medicines = await Medicine.find({});
    console.log(`Fetched ${medicines.length} medicines from DB`);

    for (let med of medicines) {
      if (!med.scheduledTime) {
        console.warn(`⚠️ Medicine ${med.name} has no scheduledTime set, skipping...`);
        continue;
      }

      const scheduledDateObj = new Date(med.scheduledTime);
      if (isNaN(scheduledDateObj)) {
        console.warn(`⚠️ Medicine ${med.name} has invalid scheduledTime, skipping...`);
        continue;
      }

      // Check if current date is within duration
      const startDate = new Date(med.date);
      startDate.setHours(0,0,0,0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + med.duration - 1);
      endDate.setHours(23,59,59,999);

      if (now < startDate || now > endDate) {
        console.log(`Skipping ${med.name} as today is outside duration.`);
        continue;
      }

      // Compose today's scheduledTime with today's date + scheduledTime's time part
      const scheduledTimeToday = new Date(`${nowDateStr}T${scheduledDateObj.toTimeString().slice(0,8)}`);

      if (scheduledTimeToday.getHours() === nowHours && scheduledTimeToday.getMinutes() === nowMinutes) {
        // Check lastNotified to avoid duplicate email on same day
        if (med.lastNotified) {
          const lastNotifiedDateStr = new Date(med.lastNotified).toISOString().split('T')[0];
          if (lastNotifiedDateStr === nowDateStr) {
            console.log(`Already notified today for ${med.name}, skipping.`);
            continue;
          }
        }

        console.log(`Sending email reminder for medicine ${med.name}...`);

        const user = await User.findById(med.user);
        if (!user || !user.email) {
          console.warn(`⚠️ User or email not found for ${med.name}`);
          continue;
        }

        await sendEmail(
          user.email,
          `💊 Medicine Reminder: ${med.name}`,
          `Hello ${user.name},\n\nThis is your reminder to take ${med.name} (${med.dosage}) at ${scheduledTimeToday.toLocaleTimeString()}.\n\nStay healthy!\nHealsync`
        );

        med.lastNotified = now;
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
