const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Log database connection details
console.log('Appointments routes loaded with database config:', {
  host: process.env.DB_HOST || db.config?.host || 'unknown',
  user: process.env.DB_USER || db.config?.user || 'unknown',
  database: process.env.DB_NAME || db.config?.database || 'unknown',
  // Don't log password for security reasons
});

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
    
    console.log('Received appointment creation request:', req.body);
    
    // Patients can only create appointments for themselves
    if (req.user.role === 'patient' && req.user.id !== parseInt(patient_id)) {
      return res.status(403).json({ message: 'You can only create appointments for yourself' });
    }
    
    // Validate required fields
    if (!patient_id || !doctor_id || !date || !time || !type) {
      console.error('Missing required fields:', { patient_id, doctor_id, date, time, type });
      return res.status(400).json({ message: 'Missing required appointment fields' });
    }
    
    // Validate appointment type matches the ENUM in the database
    if (type !== 'IN_PERSON' && type !== 'TELEMEDICINE') {
      console.error('Invalid appointment type:', type);
      return res.status(400).json({ message: 'Invalid appointment type. Must be either IN_PERSON or TELEMEDICINE' });
    }
    
    // Check for conflicts
    const conflictQuery = `
      SELECT * FROM appointments
      WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'CANCELLED'
    `;
    const [conflicts] = await db.query(conflictQuery, [doctor_id, date, time]);
    
    if (conflicts.length > 0) {
      console.error('Time slot conflict detected');
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    
    // Get patient and doctor info for notifications
    const [patientRows] = await db.query('SELECT name FROM patients WHERE id = ?', [patient_id]);
    const [doctorRows] = await db.query('SELECT name FROM doctors WHERE id = ?', [doctor_id]);
    
    if (patientRows.length === 0 || doctorRows.length === 0) {
      console.error('Patient or doctor not found:', { patient_id, doctor_id });
      return res.status(404).json({ message: 'Patient or doctor not found' });
    }

    const patientName = patientRows[0].name;
    const doctorName = doctorRows[0].name;
    
    console.log('Creating appointment between patient:', patientName, 'and doctor:', doctorName);
    
    // Start a transaction to ensure data consistency
    await db.query('START TRANSACTION');
    
    // Insert the appointment
    const insertQuery = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.query(insertQuery, [
      patient_id, 
      doctor_id, 
      date, 
      time, 
      type, 
      status || 'PENDING', 
      notes || ''
    ]);
    
    const appointmentId = result.insertId;
    console.log('Appointment created with ID:', appointmentId);
    
    // Create notification for the doctor
    const doctorNotificationQuery = `
      INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    await db.query(doctorNotificationQuery, [
      doctor_id,
      'New Appointment',
      `${patientName} has scheduled an appointment with you on ${date} at ${time}.`,
      'APPOINTMENT',
      appointmentId
    ]);
    
    // Create notification for the patient
    const patientNotificationQuery = `
      INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    await db.query(patientNotificationQuery, [
      patient_id,
      'Appointment Scheduled',
      `Your appointment with ${doctorName} has been scheduled for ${date} at ${time}.`,
      'APPOINTMENT',
      appointmentId
    ]);
    
    // Commit the transaction
    await db.query('COMMIT');
    
    console.log('Appointment and notifications created successfully');
    
    res.status(201).json({ 
      id: appointmentId,
      message: 'Appointment created successfully',
      appointmentDetails: {
        patientId: patient_id,
        doctorId: doctor_id,
        date: date,
        time: time,
        type: type,
        status: status || 'PENDING',
        notes: notes || ''
      }
    });
  } catch (err) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error creating appointment:', err);
    
    let errorMessage = 'Server error';
    
    // Provide more specific error messages based on the error type
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = 'Invalid patient or doctor ID. Please check that both exist in the system.';
    } else if (err.code === 'ER_DATA_TOO_LONG') {
      errorMessage = 'One of the fields is too long.';
    } else if (err.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = 'Invalid field name in the request.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ message: errorMessage });
  }
});

// Update an appointment
router.put('/:id', auth(['admin', 'doctor']), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { patient_id, doctor_id, date, time, type, status, notes } = req.body;
    
    // Get current appointment data
    const [currentAppointment] = await db.query(
      'SELECT a.*, p.name AS patient_name, d.name AS doctor_name FROM appointments a ' +
      'JOIN patients p ON a.patient_id = p.id ' +
      'JOIN doctors d ON a.doctor_id = d.id ' +
      'WHERE a.id = ?', 
      [appointmentId]
    );
    
    if (currentAppointment.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const appointment = currentAppointment[0];
    
    // Doctors can only update their own appointments
    if (req.user.role === 'doctor' && req.user.id !== appointment.doctor_id) {
      return res.status(403).json({ message: 'Unauthorized to update this appointment' });
    }
    
    // Check for conflicts if changing date/time
    if ((date && date !== appointment.date) || 
        (time && time !== appointment.time) ||
        (doctor_id && doctor_id !== appointment.doctor_id)) {
      
      const conflictQuery = `
        SELECT * FROM appointments
        WHERE doctor_id = ? AND date = ? AND time = ? AND id != ? AND status != 'cancelled'
      `;
      
      const [conflicts] = await db.query(conflictQuery, [
        doctor_id || appointment.doctor_id,
        date || appointment.date,
        time || appointment.time,
        appointmentId
      ]);
      
      if (conflicts.length > 0) {
        return res.status(409).json({ message: 'This time slot is already booked' });
      }
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    const updateQuery = `
      UPDATE appointments
      SET patient_id = ?, doctor_id = ?, date = ?, time = ?, 
          type = ?, status = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [
      patient_id || appointment.patient_id,
      doctor_id || appointment.doctor_id,
      date || appointment.date,
      time || appointment.time,
      type || appointment.type,
      status || appointment.status,
      notes || appointment.notes,
      appointmentId
    ]);
    
    // Create notifications based on what changed
    if (status && status !== appointment.status) {
      // Status change notification
      const statusMessage = `Your appointment on ${date || appointment.date} at ${time || appointment.time} has been ${status.toLowerCase()}.`;
      
      // Notify patient about status change
      await db.query(
        'INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [
          appointment.patient_id,
          'Appointment Status Update',
          statusMessage,
          'APPOINTMENT',
          appointmentId
        ]
      );
      
      // If appointment is cancelled or completed, notify doctor as well
      if (status === 'CANCELLED' || status === 'COMPLETED') {
        const doctorMessage = `The appointment with ${appointment.patient_name} on ${date || appointment.date} at ${time || appointment.time} has been ${status.toLowerCase()}.`;
        await db.query(
          'INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [
            appointment.doctor_id,
            'Appointment Update',
            doctorMessage,
            'APPOINTMENT',
            appointmentId
          ]
        );
      }
    } else if ((date && date !== appointment.date) || (time && time !== appointment.time)) {
      // Reschedule notification
      const rescheduleMessage = `Your appointment has been rescheduled to ${date || appointment.date} at ${time || appointment.time}.`;
      
      // Notify patient
      await db.query(
        'INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [
          appointment.patient_id,
          'Appointment Rescheduled',
          rescheduleMessage,
          'APPOINTMENT',
          appointmentId
        ]
      );
      
      // Notify doctor
      const doctorRescheduleMessage = `The appointment with ${appointment.patient_name} has been rescheduled to ${date || appointment.date} at ${time || appointment.time}.`;
      await db.query(
        'INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [
          appointment.doctor_id,
          'Appointment Rescheduled',
          doctorRescheduleMessage,
          'APPOINTMENT',
          appointmentId
        ]
      );
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.json({ 
      id: appointmentId,
      message: 'Appointment updated successfully' 
    });
  } catch (err) {
    // Rollback in case of error
    await db.query('ROLLBACK');
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
    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Update appointment status to cancelled
    await db.query(
      'UPDATE appointments SET status = "CANCELLED", updated_at = NOW() WHERE id = ?',
      [appointmentId]
    );
    
    // Create notifications for patient and doctor
    // Get patient and doctor info
    const [patientInfo] = await db.query('SELECT name FROM patients WHERE id = ?', [appointment.patient_id]);
    const [doctorInfo] = await db.query('SELECT name FROM doctors WHERE id = ?', [appointment.doctor_id]);
    
    if (patientInfo.length > 0 && doctorInfo.length > 0) {
      const patientName = patientInfo[0].name;
      const doctorName = doctorInfo[0].name;
      
      // Notify the doctor
      await db.query(
        'INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [
          appointment.doctor_id,
          'Appointment Cancelled',
          `The appointment with ${patientName} on ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled.`,
          'APPOINTMENT',
          appointmentId
        ]
      );
      
      // Notify the patient
      await db.query(
        'INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [
          appointment.patient_id,
          'Appointment Cancelled',
          `Your appointment with ${doctorName} on ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled.`,
          'APPOINTMENT',
          appointmentId
        ]
      );
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.json({ 
      message: 'Appointment cancelled successfully',
      id: appointmentId
    });
  } catch (err) {
    // Rollback in case of error
    await db.query('ROLLBACK');
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
      'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != "CANCELLED"',
      [doctorId, date]
    );
    
    // Generate available time slots (assuming 30-minute intervals)
    const availableSlots = generateTimeSlots(startTime, endTime, bookedSlots.map(slot => slot.appointment_time));
    
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

// Get notifications for a user
router.get('/notifications/:userId', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify that the user is authorized to access these notifications
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Unauthorized to access these notifications' });
    }
    
    const query = `
      SELECT n.*, 
             a.appointment_date, 
             a.appointment_time,
             a.appointment_type,
             a.status as appointment_status
      FROM notifications n
      LEFT JOIN appointments a ON n.reference_id = a.id AND n.notification_type = 'APPOINTMENT'
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `;
    
    const [notifications] = await db.query(query, [userId]);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', auth(['admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    
    // Verify that the user is authorized to update this notification
    const [notificationRows] = await db.query(
      'SELECT user_id FROM notifications WHERE id = ?', 
      [notificationId]
    );
    
    if (notificationRows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (req.user.role !== 'admin' && req.user.id !== notificationRows[0].user_id) {
      return res.status(403).json({ message: 'Unauthorized to update this notification' });
    }
    
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [notificationId]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 