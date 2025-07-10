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
  origin: [
    'http://localhost:5173',
    'https://healsync-frontend-ec4u.vercel.app'
  ],
  credentials: true
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
