const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { 
      specialty, 
      name, 
      location, 
      availableDate, 
      limit = 10, 
      page = 1 
    } = req.query;
    
    // Start building the query
    let query = 'SELECT id, first_name, last_name, email, specialty, phone_number, profile_picture, availability, created_at, updated_at FROM doctors WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM doctors WHERE 1=1';
    const queryParams = [];
    
    // Add filters if provided
    if (specialty) {
      query += ' AND specialty LIKE ?';
      countQuery += ' AND specialty LIKE ?';
      queryParams.push(`%${specialty}%`);
    }
    
    if (name) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ?)';
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ?)';
      queryParams.push(`%${name}%`, `%${name}%`);
    }
    
    if (location) {
      query += ' AND location LIKE ?';
      countQuery += ' AND location LIKE ?';
      queryParams.push(`%${location}%`);
    }
    
    if (availableDate) {
      // Assuming availability is stored as a JSON or string we can search
      // Modify this based on your actual availability data structure
      query += ' AND availability LIKE ?';
      countQuery += ' AND availability LIKE ?';
      queryParams.push(`%${availableDate}%`);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute the queries
    const [doctors] = await db.query(query, queryParams);
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset params
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      data: doctors,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query to get doctor with limited sensitive information
    const [doctors] = await db.query(
      'SELECT id, first_name, last_name, email, specialty, phone_number, profile_picture, availability, created_at, updated_at FROM doctors WHERE id = ?',
      [id]
    );
    
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.status(200).json(doctors[0]);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new doctor (admin only)
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      specialty,
      phoneNumber,
      profilePicture,
      availability
    } = req.body;
    
    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password || !specialty) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if email already exists
    const [existingDoctors] = await db.query('SELECT * FROM doctors WHERE email = ?', [email]);
    
    if (existingDoctors.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new doctor
    const [result] = await db.query(
      'INSERT INTO doctors (first_name, last_name, email, password, specialty, phone_number, profile_picture, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, specialty, phoneNumber, profilePicture, availability]
    );
    
    if (result.affectedRows === 1) {
      // Get the newly created doctor
      const [newDoctor] = await db.query(
        'SELECT id, first_name, last_name, email, specialty, phone_number, profile_picture, availability, created_at, updated_at FROM doctors WHERE id = ?', 
        [result.insertId]
      );
      
      res.status(201).json(newDoctor[0]);
    } else {
      throw new Error('Failed to create doctor');
    }
    
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a doctor (admin or the doctor themselves)
router.put('/:id', auth(['admin', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      email, 
      specialty,
      phoneNumber,
      profilePicture,
      availability,
      password
    } = req.body;
    
    // Check if the doctor exists
    const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ?', [id]);
    
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // If not admin, the doctor can only update their own profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Unauthorized to update this doctor' });
    }
    
    // Prepare update fields
    const updateFields = [];
    const queryParams = [];
    
    if (firstName) {
      updateFields.push('first_name = ?');
      queryParams.push(firstName);
    }
    
    if (lastName) {
      updateFields.push('last_name = ?');
      queryParams.push(lastName);
    }
    
    if (email) {
      // Check if email already exists and not the current doctor
      const [existingDoctors] = await db.query('SELECT * FROM doctors WHERE email = ? AND id != ?', [email, id]);
      
      if (existingDoctors.length > 0) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      
      updateFields.push('email = ?');
      queryParams.push(email);
    }
    
    if (specialty) {
      updateFields.push('specialty = ?');
      queryParams.push(specialty);
    }
    
    if (phoneNumber) {
      updateFields.push('phone_number = ?');
      queryParams.push(phoneNumber);
    }
    
    if (profilePicture) {
      updateFields.push('profile_picture = ?');
      queryParams.push(profilePicture);
    }
    
    if (availability) {
      updateFields.push('availability = ?');
      queryParams.push(availability);
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.push('password = ?');
      queryParams.push(hashedPassword);
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');
    
    // Add id to params for WHERE clause
    queryParams.push(id);
    
    // Execute update query
    if (updateFields.length > 0) {
      const [result] = await db.query(
        `UPDATE doctors SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );
      
      if (result.affectedRows === 1) {
        // Get the updated doctor
        const [updatedDoctor] = await db.query(
          'SELECT id, first_name, last_name, email, specialty, phone_number, profile_picture, availability, created_at, updated_at FROM doctors WHERE id = ?', 
          [id]
        );
        
        res.status(200).json(updatedDoctor[0]);
      } else {
        throw new Error('Failed to update doctor');
      }
    } else {
      // No fields to update
      res.status(400).json({ message: 'No fields to update' });
    }
    
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a doctor (admin only)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the doctor exists
    const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ?', [id]);
    
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Delete the doctor
    const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
    
    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Doctor deleted successfully' });
    } else {
      throw new Error('Failed to delete doctor');
    }
    
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctor's availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the doctor exists
    const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ?', [id]);
    
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get the doctor's availability
    const [availability] = await db.query('SELECT availability FROM doctors WHERE id = ?', [id]);
    
    res.status(200).json({ availability: availability[0].availability });
    
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update doctor's availability (admin or the doctor themselves)
router.put('/:id/availability', auth(['admin', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    
    // Check if the doctor exists
    const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ?', [id]);
    
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // If not admin, the doctor can only update their own availability
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Unauthorized to update this doctor' });
    }
    
    // Update the doctor's availability
    const [result] = await db.query(
      'UPDATE doctors SET availability = ?, updated_at = NOW() WHERE id = ?',
      [availability, id]
    );
    
    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Availability updated successfully', availability });
    } else {
      throw new Error('Failed to update availability');
    }
    
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 