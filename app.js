const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Import
const User =require('./models/User')
const File=require('./models/File')
const dbConnect=require('./db')
const authRoutes= require ('./routes/auth.Routes')
const fileRoutes= require ('./routes/file.Routes')

// Middleware setup
app.use(cors({
   origin: '*' }
  )); 
app.use(express.json()); 
dbConnect();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api', fileRoutes);

// Start the server
const port = 5000;
app.listen(port, () => 
  console.log(`Server running on port ${port}`)
);
