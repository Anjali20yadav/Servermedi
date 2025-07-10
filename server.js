 // ✅ Load .env variables before anything else
require('dotenv').config();

const express = require('express');

const cors = require('cors');
const connectDB = require('./config/db');
require('./reminderScheduler');

console.log("🔍 MONGO_URI:", process.env.MONGO_URI); // 🔍 Check if it's loading

const app = express();

// Connect to MongoDB
connectDB();


app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicine', require('./routes/medicine'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
