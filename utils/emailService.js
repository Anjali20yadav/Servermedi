const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chotikmri282@gmail.com', // 🔁 Replace with your Gmail
    pass: 'fsbrcwvczwyblvxv',       // 🔁 App password (no spaces!)
  },
  tls: {
    rejectUnauthorized: false  // 👈 ye line add kar di
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"Healsync Reminder" <chotikmri282@gmail.com>', // 🔁 Replace
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

module.exports = sendEmail;
