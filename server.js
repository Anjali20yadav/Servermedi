require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('./reminderScheduler'); // 🕒 email cron setup

const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Connect to MongoDB
connectDB();


// 👈 For local dev, allow all origins
app.use(cors({
  origin: 'http://localhost:5173',  // frontend ka local URL
  credentials: true,
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('✅ Backend running locally!');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicine', authMiddleware, require('./routes/medicine'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
