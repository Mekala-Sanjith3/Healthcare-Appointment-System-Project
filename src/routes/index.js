const appointmentsRoutes = require('./appointments');
const medicalRecordsRoutes = require('./medicalRecords');

app.use('/api/appointments', appointmentsRoutes);
app.use('/api/medical-records', medicalRecordsRoutes); 