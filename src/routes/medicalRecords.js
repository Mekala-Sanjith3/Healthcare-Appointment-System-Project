const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/records');
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Get all medical records (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const query = `
      SELECT mr.*, p.name as patient_name, d.name as doctor_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN doctors d ON mr.doctor_id = d.id
      ORDER BY mr.date DESC
    `;
    const [records] = await db.query(query);
    res.json(records);
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medical records for a specific patient
router.get('/patient/:patientId', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Patients can only view their own records
    if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
      return res.status(403).json({ message: 'Unauthorized to access these records' });
    }

    const query = `
      SELECT mr.*, d.name as doctor_name, d.specialty
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      WHERE mr.patient_id = ?
      ORDER BY mr.date DESC
    `;
    const [records] = await db.query(query, [patientId]);
    res.json(records);
  } catch (err) {
    console.error('Error fetching patient medical records:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medical records created by a specific doctor
router.get('/doctor/:doctorId', auth(['admin', 'doctor']), async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Doctors can only view records they created
    if (req.user.role === 'doctor' && req.user.id !== parseInt(doctorId)) {
      return res.status(403).json({ message: 'Unauthorized to access these records' });
    }

    const query = `
      SELECT mr.*, p.name as patient_name, p.date_of_birth, p.gender
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      WHERE mr.doctor_id = ?
      ORDER BY mr.date DESC
    `;
    const [records] = await db.query(query, [doctorId]);
    res.json(records);
  } catch (err) {
    console.error('Error fetching doctor medical records:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific medical record
router.get('/:id', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const recordId = req.params.id;
    
    const query = `
      SELECT mr.*, p.name as patient_name, p.date_of_birth, p.gender, 
             d.name as doctor_name, d.specialty
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN doctors d ON mr.doctor_id = d.id
      WHERE mr.id = ?
    `;
    const [records] = await db.query(query, [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    const record = records[0];
    
    // Patients can only view their own records
    if (req.user.role === 'patient' && req.user.id !== record.patient_id) {
      return res.status(403).json({ message: 'Unauthorized to access this record' });
    }
    
    // Doctors can view records they created or if they're assigned to the patient
    if (req.user.role === 'doctor' && req.user.id !== record.doctor_id) {
      // Check if doctor is assigned to this patient
      const [assignment] = await db.query(
        'SELECT * FROM patient_doctor WHERE patient_id = ? AND doctor_id = ?',
        [record.patient_id, req.user.id]
      );
      
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'Unauthorized to access this record' });
      }
    }
    
    res.json(record);
  } catch (err) {
    console.error('Error fetching medical record:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new medical record
router.post('/', auth(['admin', 'doctor']), upload.array('files', 5), async (req, res) => {
  try {
    const { patient_id, diagnosis, description, prescription, treatment_plan, notes } = req.body;
    
    // Validate required fields
    if (!patient_id || !diagnosis) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Set doctor_id based on authenticated user if not admin
    let doctor_id = req.body.doctor_id;
    if (req.user.role === 'doctor') {
      doctor_id = req.user.id;
      
      // Check if doctor is assigned to this patient
      const [assignment] = await db.query(
        'SELECT * FROM patient_doctor WHERE patient_id = ? AND doctor_id = ?',
        [patient_id, doctor_id]
      );
      
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'You are not assigned to this patient' });
      }
    } else if (!doctor_id) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }
    
    // Process uploaded files
    const files = req.files ? req.files.map(file => file.filename).join(',') : '';
    
    const insertQuery = `
      INSERT INTO medical_records (
        patient_id, doctor_id, date, diagnosis, description, 
        prescription, treatment_plan, files, notes, created_at
      ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.query(insertQuery, [
      patient_id,
      doctor_id,
      diagnosis,
      description || '',
      prescription || '',
      treatment_plan || '',
      files,
      notes || ''
    ]);
    
    res.status(201).json({
      id: result.insertId,
      message: 'Medical record created successfully'
    });
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a medical record
router.put('/:id', auth(['admin', 'doctor']), upload.array('files', 5), async (req, res) => {
  try {
    const recordId = req.params.id;
    const { diagnosis, description, prescription, treatment_plan, notes } = req.body;
    
    // Get current record data
    const [records] = await db.query('SELECT * FROM medical_records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    const record = records[0];
    
    // Doctors can only update their own records
    if (req.user.role === 'doctor' && req.user.id !== record.doctor_id) {
      return res.status(403).json({ message: 'Unauthorized to update this record' });
    }
    
    // Process uploaded files
    let files = record.files || '';
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => file.filename).join(',');
      files = files ? `${files},${newFiles}` : newFiles;
    }
    
    const updateQuery = `
      UPDATE medical_records
      SET diagnosis = ?, description = ?, prescription = ?, 
          treatment_plan = ?, files = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [
      diagnosis || record.diagnosis,
      description !== undefined ? description : record.description,
      prescription !== undefined ? prescription : record.prescription,
      treatment_plan !== undefined ? treatment_plan : record.treatment_plan,
      files,
      notes !== undefined ? notes : record.notes,
      recordId
    ]);
    
    res.json({ message: 'Medical record updated successfully' });
  } catch (err) {
    console.error('Error updating medical record:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a medical record
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // Check if record exists and get file information before deletion
    const [records] = await db.query('SELECT * FROM medical_records WHERE id = ?', [recordId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Delete associated files
    const record = records[0];
    if (record.files) {
      const fileList = record.files.split(',');
      fileList.forEach(filename => {
        const filePath = path.join(__dirname, '../uploads/records', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // Delete the record
    await db.query('DELETE FROM medical_records WHERE id = ?', [recordId]);
    
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    console.error('Error deleting medical record:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download a file
router.get('/file/:filename', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/records', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Verify authorization by finding the record that contains this file
    const [records] = await db.query(
      "SELECT * FROM medical_records WHERE files LIKE CONCAT('%', ?, '%')",
      [filename]
    );
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Record not found for this file' });
    }
    
    const record = records[0];
    
    // Check user authorization
    if (req.user.role === 'patient' && req.user.id !== record.patient_id) {
      return res.status(403).json({ message: 'Unauthorized to access this file' });
    }
    
    if (req.user.role === 'doctor' && req.user.id !== record.doctor_id) {
      // Check if doctor is assigned to this patient
      const [assignment] = await db.query(
        'SELECT * FROM patient_doctor WHERE patient_id = ? AND doctor_id = ?',
        [record.patient_id, req.user.id]
      );
      
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'Unauthorized to access this file' });
      }
    }
    
    // Send the file
    res.download(filePath);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient's complete medical history
router.get('/history/:patientId', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Patients can only view their own history
    if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
      return res.status(403).json({ message: 'Unauthorized to access this medical history' });
    }
    
    // If doctor, check if assigned to patient
    if (req.user.role === 'doctor') {
      const [assignment] = await db.query(
        'SELECT * FROM patient_doctor WHERE patient_id = ? AND doctor_id = ?',
        [patientId, req.user.id]
      );
      
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'You are not assigned to this patient' });
      }
    }
    
    // Get patient info
    const [patients] = await db.query(
      'SELECT id, name, date_of_birth, gender, blood_type, allergies FROM patients WHERE id = ?',
      [patientId]
    );
    
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get all medical records
    const [records] = await db.query(`
      SELECT mr.*, d.name as doctor_name, d.specialty
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      WHERE mr.patient_id = ?
      ORDER BY mr.date DESC
    `, [patientId]);
    
    // Get all appointments
    const [appointments] = await db.query(`
      SELECT a.*, d.name as doctor_name, d.specialty
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.date DESC
    `, [patientId]);
    
    res.json({
      patient: patients[0],
      records: records,
      appointments: appointments
    });
  } catch (err) {
    console.error('Error fetching patient medical history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 