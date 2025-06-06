const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File'); // Ensure this path is correct
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});
const upload = multer({ storage });

// File Upload
router.post('/upload/:userId', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  try {
    const { userId } = req.params;
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      filePath: req.file.filename,
      userId,
    });
    await file.save();
    res.json({ success: true, message: 'File uploaded successfully', file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

// Fetch all files for a user
router.get('/files/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const files = await File.find({ userId });
    res.json({ success: true, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch files' });
  }
});

// Download file
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.download(path.join(__dirname, '..', 'uploads', file.filePath), file.originalName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error downloading file' });
  }
});

// Delete file
router.delete('/delete/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    fs.unlinkSync(path.join(__dirname, '..', 'uploads', file.filePath)); // Delete file from filesystem
    await File.deleteOne({ _id: fileId }); // Remove file record from database
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
});

// Serve individual files
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
  fs.exists(filePath, exists => {
    if (!exists) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.sendFile(filePath);
  });
});

module.exports = router;
