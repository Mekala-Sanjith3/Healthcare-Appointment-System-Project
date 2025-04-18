const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get all appointments (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const query = `
      SELECT a.*, p.name as patient_name, d.name as doctor_name 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.date DESC, a.time ASC
    `;
    const [appointments] = await db.query(query);
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for a specific patient
router.get('/patient/:patientId', auth(['admin', 'patient']), async (req, res) => {
  try {
    // Patients can only view their own appointments
    if (req.user.role === 'patient' && req.user.id !== parseInt(req.params.patientId)) {
      return res.status(403).json({ message: 'Unauthorized to access these appointments' });
    }

    const query = `
      SELECT a.*, d.name as doctor_name, d.specialty 
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.date DESC, a.time ASC
    `;
    const [appointments] = await db.query(query, [req.params.patientId]);
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for a specific doctor
router.get('/doctor/:doctorId', auth(['admin', 'doctor']), async (req, res) => {
  try {
    // Doctors can only view their own appointments
    if (req.user.role === 'doctor' && req.user.id !== parseInt(req.params.doctorId)) {
      return res.status(403).json({ message: 'Unauthorized to access these appointments' });
    }

    const query = `
      SELECT a.*, p.name as patient_name, p.date_of_birth, p.gender
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.date ASC, a.time ASC
    `;
    const [appointments] = await db.query(query, [req.params.doctorId]);
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific appointment
router.get('/:id', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const query = `
      SELECT a.*, p.name as patient_name, p.date_of_birth, p.gender, p.phone, p.email,
      d.name as doctor_name, d.specialty
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `;
    const [appointments] = await db.query(query, [req.params.id]);
    
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const appointment = appointments[0];
    
    // Check authorization - patients can only view their own appointments
    if (req.user.role === 'patient' && req.user.id !== appointment.patient_id) {
      return res.status(403).json({ message: 'Unauthorized to access this appointment' });
    }
    
    // Doctors can only view their own appointments
    if (req.user.role === 'doctor' && req.user.id !== appointment.doctor_id) {
      return res.status(403).json({ message: 'Unauthorized to access this appointment' });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new appointment
router.post('/', auth(['admin', 'patient']), async (req, res) => {
  try {
    const { patient_id, doctor_id, date, time, type, status, notes } = req.body;
    
    // Patients can only create appointments for themselves
    if (req.user.role === 'patient' && req.user.id !== parseInt(patient_id)) {
      return res.status(403).json({ message: 'You can only create appointments for yourself' });
    }
    
    // Validate required fields
    if (!patient_id || !doctor_id || !date || !time || !type) {
      return res.status(400).json({ message: 'Missing required appointment fields' });
    }
    
    // Check for conflicts
    const conflictQuery = `
      SELECT * FROM appointments
      WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled'
    `;
    const [conflicts] = await db.query(conflictQuery, [doctor_id, date, time]);
    
    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    
    const insertQuery = `
      INSERT INTO appointments (patient_id, doctor_id, date, time, type, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.query(insertQuery, [
      patient_id, 
      doctor_id, 
      date, 
      time, 
      type, 
      status || 'pending', 
      notes || ''
    ]);
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Appointment created successfully' 
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an appointment
router.put('/:id', auth(['admin', 'doctor']), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { patient_id, doctor_id, date, time, type, status, notes } = req.body;
    
    // Get current appointment data
    const [currentAppointment] = await db.query(
      'SELECT * FROM appointments WHERE id = ?', 
      [appointmentId]
    );
    
    if (currentAppointment.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Doctors can only update their own appointments
    if (req.user.role === 'doctor' && req.user.id !== currentAppointment[0].doctor_id) {
      return res.status(403).json({ message: 'Unauthorized to update this appointment' });
    }
    
    // Check for conflicts if changing date/time
    if ((date && date !== currentAppointment[0].date) || 
        (time && time !== currentAppointment[0].time) ||
        (doctor_id && doctor_id !== currentAppointment[0].doctor_id)) {
      
      const conflictQuery = `
        SELECT * FROM appointments
        WHERE doctor_id = ? AND date = ? AND time = ? AND id != ? AND status != 'cancelled'
      `;
      
      const [conflicts] = await db.query(conflictQuery, [
        doctor_id || currentAppointment[0].doctor_id,
        date || currentAppointment[0].date,
        time || currentAppointment[0].time,
        appointmentId
      ]);
      
      if (conflicts.length > 0) {
        return res.status(409).json({ message: 'This time slot is already booked' });
      }
    }
    
    const updateQuery = `
      UPDATE appointments
      SET patient_id = ?, doctor_id = ?, date = ?, time = ?, 
          type = ?, status = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [
      patient_id || currentAppointment[0].patient_id,
      doctor_id || currentAppointment[0].doctor_id,
      date || currentAppointment[0].date,
      time || currentAppointment[0].time,
      type || currentAppointment[0].type,
      status || currentAppointment[0].status,
      notes !== undefined ? notes : currentAppointment[0].notes,
      appointmentId
    ]);
    
    res.json({ message: 'Appointment updated successfully' });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an appointment
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const [appointment] = await db.query(
      'SELECT * FROM appointments WHERE id = ?', 
      [req.params.id]
    );
    
    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await db.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel an appointment (can be done by patient, doctor, or admin)
router.post('/:id/cancel', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Get current appointment data
    const [appointments] = await db.query(
      'SELECT * FROM appointments WHERE id = ?', 
      [appointmentId]
    );
    
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const appointment = appointments[0];
    
    // Check authorization
    if (req.user.role === 'patient' && req.user.id !== appointment.patient_id) {
      return res.status(403).json({ message: 'Unauthorized to cancel this appointment' });
    }
    
    if (req.user.role === 'doctor' && req.user.id !== appointment.doctor_id) {
      return res.status(403).json({ message: 'Unauthorized to cancel this appointment' });
    }
    
    // Can't cancel an already cancelled appointment
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }
    
    // Update appointment status to cancelled
    await db.query(
      'UPDATE appointments SET status = "cancelled", updated_at = NOW() WHERE id = ?',
      [appointmentId]
    );
    
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots for a doctor on a specific date
router.get('/available/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Get doctor's schedule
    const [doctorSchedule] = await db.query(
      'SELECT working_hours FROM doctors WHERE id = ?',
      [doctorId]
    );
    
    if (doctorSchedule.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Parse working hours (assuming format like "09:00-17:00")
    const workingHours = doctorSchedule[0].working_hours || "09:00-17:00";
    const [startTime, endTime] = workingHours.split('-');
    
    // Get booked appointments for that date
    const [bookedSlots] = await db.query(
      'SELECT time FROM appointments WHERE doctor_id = ? AND date = ? AND status != "cancelled"',
      [doctorId, date]
    );
    
    // Generate available time slots (assuming 30-minute intervals)
    const availableSlots = generateTimeSlots(startTime, endTime, bookedSlots.map(slot => slot.time));
    
    res.json(availableSlots);
  } catch (err) {
    console.error('Error fetching available time slots:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate available time slots
function generateTimeSlots(startTime, endTime, bookedSlots) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    // Format time as HH:MM
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Check if slot is available
    if (!bookedSlots.includes(timeSlot)) {
      slots.push(timeSlot);
    }
    
    // Move to next slot (30 min increment)
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute -= 60;
    }
  }
  
  return slots;
}

module.exports = router; 