const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ...existing code...
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ...existing code...
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Accept email and password from the request body
  try {
    const user = await User.findOne({ email }); // Search by email instead of username
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    user.lastLogin = new Date();
    await user.save();
    res.json({
      success: true,
      userId: user._id,
      email: user.email, // Include the email in the response
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Update User Profile
router.put('/profile/:userId', upload.single('profilePicture'), async (req, res) => {
  const { userId } = req.params;
  const { fullName, email } = req.body;
  const profilePicture = req.file ? req.file.filename : undefined;

  try {
    const updateData = { fullName, email };
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Get User Profile
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId, '-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ success: false, message: 'Error fetching user profile' });
  }
});

module.exports = router;
