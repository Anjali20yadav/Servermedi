// test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log("🔍 URI:", uri);

mongoose.connect(uri, {
  dbName: 'healsync', // ✅ force DB name here
})
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
