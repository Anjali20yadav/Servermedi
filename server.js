require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('./reminderScheduler'); // 🕒 email cron setup
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// ✅ Allowed origins for CORS
const allowedOrigins = [
  //'http://localhost:5173'
   // your Vercel frontend URL
   'https://meditrack-eight.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
  //     app.use((req, res, next) => {
  // console.log('Origin:', req.headers.origin);
  // next();
  console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
      
    }
  },
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
