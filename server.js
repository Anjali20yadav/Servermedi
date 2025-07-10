require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('./reminderScheduler');

const authMiddleware = require('./middleware/authMiddleware');

console.log("🔍 MONGO_URI:", process.env.MONGO_URI);

const app = express();

connectDB();



app.use(cors({
  origin: '*', // 🔓 Temporarily allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));




app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Backend is running!');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicine', authMiddleware, require('./routes/medicine'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
