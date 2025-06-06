const mongoose = require('mongoose');
const dotenv= require ('dotenv')

dotenv.config();

const dbConnect = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
};

module.exports = dbConnect;

