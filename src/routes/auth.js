const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT Secret - Should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'healthcareapp_secret_key';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password and role' });
    }
    
    let user;
    let query;
    
    // Check user based on role
    switch (role) {
      case 'admin':
        query = 'SELECT * FROM admins WHERE email = ?';
        break;
      case 'doctor':
        query = 'SELECT * FROM doctors WHERE email = ?';
        break;
      case 'patient':
        query = 'SELECT * FROM patients WHERE email = ?';
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    const [rows] = await db.query(query, [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    user = rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Remove sensitive data
    delete user.password;
    
    res.status(200).json({
      user,
      token,
      role
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register route (primarily for patients)
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber, 
      dateOfBirth, 
      gender, 
      address 
    } = req.body;
    
    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if email already exists
    const [existingUsers] = await db.query('SELECT * FROM patients WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new patient
    const [result] = await db.query(
      'INSERT INTO patients (first_name, last_name, email, password, phone_number, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, phoneNumber, dateOfBirth, gender, address]
    );
    
    if (result.affectedRows === 1) {
      // Get the newly created patient
      const [newPatient] = await db.query('SELECT id, first_name, last_name, email, phone_number, date_of_birth, gender, address FROM patients WHERE id = ?', [result.insertId]);
      
      // Create JWT token
      const token = jwt.sign(
        { 
          id: result.insertId, 
          email: email, 
          role: 'patient' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        user: newPatient[0],
        token,
        role: 'patient'
      });
    } else {
      throw new Error('Failed to create patient account');
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token route
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// Logout route (frontend will handle token removal)
router.post('/logout', (req, res) => {
  // Server-side nothing to do for JWT except acknowledge logout
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router; 