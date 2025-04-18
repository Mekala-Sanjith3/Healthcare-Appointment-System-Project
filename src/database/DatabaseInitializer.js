const fs = require('fs');
const path = require('path');
const db = require('./db');
const { execSync } = require('child_process');

class DatabaseInitializer {
  /**
   * Initialize the database
   * This checks connection, creates schema if needed, and adds sample data
   */
  static async initialize() {
    try {
      // Test database connection
      const isConnected = await db.testConnection();
      
      if (!isConnected) {
        console.error('Failed to connect to database. Using mock data instead.');
        return false;
      }
      
      console.log('Database connection successful. Checking schema...');
      
      // Check if tables exist, if not, run the schema.sql script
      const tablesExist = await this.checkTablesExist();
      
      if (!tablesExist) {
        console.log('Tables not found. Setting up database schema...');
        await this.setupSchema();
      } else {
        console.log('Database schema already exists.');
      }
      
      // Add sample data if tables are empty
      await this.initializeSampleDataIfNeeded();
      
      console.log('Database initialization completed successfully.');
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }
  
  /**
   * Check if the required tables exist in the database
   */
  static async checkTablesExist() {
    try {
      const dbName = process.env.DB_NAME || 'healthcare_db';
      const tables = await db.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ?
      `, [dbName]);
      
      const requiredTables = ['admins', 'doctors', 'patients', 'appointments', 'medical_records'];
      const existingTables = tables.map(table => table.TABLE_NAME);
      
      return requiredTables.every(table => existingTables.includes(table));
    } catch (error) {
      console.error('Error checking tables:', error);
      return false;
    }
  }
  
  /**
   * Set up database schema using schema.sql
   */
  static async setupSchema() {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Split the schema into separate statements
      const statements = schemaSQL
        .split(';')
        .filter(statement => statement.trim())
        .map(statement => statement.trim() + ';');
      
      // Execute each statement
      for (const statement of statements) {
        await db.query(statement);
      }
      
      console.log('Database schema created successfully.');
      return true;
    } catch (error) {
      console.error('Error setting up schema:', error);
      
      // Alternative: run as shell command if direct execution fails
      try {
        const mysqlCmd = `mysql -u${process.env.DB_USER || 'root'} -p${process.env.DB_PASSWORD || 'root'} < ${path.join(__dirname, 'schema.sql')}`;
        execSync(mysqlCmd);
        console.log('Database schema created using shell command.');
        return true;
      } catch (shellError) {
        console.error('Error running schema through shell:', shellError);
        return false;
      }
    }
  }
  
  /**
   * Add sample data if tables are empty
   */
  static async initializeSampleDataIfNeeded() {
    try {
      // Check if admins table has data
      const admins = await db.query('SELECT COUNT(*) as count FROM admins');
      
      if (admins[0].count === 0) {
        // Add default admin
        await db.create('admins', {
          name: 'Admin User',
          email: 'admin@healthcare.com',
          password: 'admin123',
          role: 'ADMIN'
        });
        console.log('Default admin user created.');
      }
      
      // Check if doctors table has data
      const doctors = await db.query('SELECT COUNT(*) as count FROM doctors');
      
      if (doctors[0].count === 0) {
        // Add sample doctors
        const sampleDoctors = [
          {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@healthcare.com',
            password: 'doctor123',
            specialization: 'Cardiology',
            qualification: 'MD, Cardiology',
            experience: '14 years',
            clinic_address: '123 Medical Center, New York, NY',
            status: 'ACTIVE',
            role: 'DOCTOR'
          },
          {
            name: 'Dr. Michael Chen',
            email: 'michael.chen@healthcare.com',
            password: 'doctor123',
            specialization: 'Dermatology',
            qualification: 'MD, Dermatology',
            experience: '8 years',
            clinic_address: '456 Health Plaza, Los Angeles, CA',
            status: 'ACTIVE',
            role: 'DOCTOR'
          }
        ];
        
        for (const doctor of sampleDoctors) {
          await db.create('doctors', doctor);
        }
        console.log('Sample doctors created.');
      }
      
      // Check if patients table has data
      const patients = await db.query('SELECT COUNT(*) as count FROM patients');
      
      if (patients[0].count === 0) {
        // Add sample patients
        const samplePatients = [
          {
            name: 'John Smith',
            email: 'john.smith@example.com',
            password: 'patient123',
            phone_number: '555-123-4567',
            address: '789 Residential St, Chicago, IL',
            blood_group: 'A+',
            age: 45,
            gender: 'Male',
            status: 'ACTIVE',
            role: 'PATIENT'
          },
          {
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            password: 'patient123',
            phone_number: '555-987-6543',
            address: '321 Home Ave, Boston, MA',
            blood_group: 'O-',
            age: 32,
            gender: 'Female',
            status: 'ACTIVE',
            role: 'PATIENT'
          }
        ];
        
        for (const patient of samplePatients) {
          await db.create('patients', patient);
        }
        console.log('Sample patients created.');
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing sample data:', error);
      return false;
    }
  }
}

module.exports = DatabaseInitializer; 