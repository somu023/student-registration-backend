const express = require('express');
const bcrypt = require('bcrypt');
const Student = require('../models/student.model');
const verifyFrontendOrigin = require('../middleware/auth');
const router = express.Router();

// Signup
router.post('/signup', verifyFrontendOrigin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, password: hashed });
    await student.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

// Login
router.post('/login', verifyFrontendOrigin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', student });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', verifyFrontendOrigin, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: 'Email not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    student.password = hashed;
    await student.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
});

// Get all students (Admin only)
router.get('/', async (req, res) => {
  const token = req.headers['x-admin-secret'];
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Unauthorized admin access' });
  }

  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

module.exports = router;
