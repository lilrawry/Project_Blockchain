const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await db.all('SELECT * FROM doctors');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor by wallet address
router.get('/doctors/:walletAddress', async (req, res) => {
  try {
    const doctor = await db.get(
      'SELECT * FROM doctors WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create doctor
router.post('/doctors', async (req, res) => {
  try {
    const { walletAddress, name, specialty, license } = req.body;
    const result = await db.run(
      'INSERT INTO doctors (walletAddress, name, specialty, license) VALUES (?, ?, ?, ?)',
      [walletAddress, name, specialty, license]
    );
    res.json({ id: result.lastID, walletAddress, name, specialty, license });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all patients a doctor has access to
router.get('/doctors/:walletAddress/patients', async (req, res) => {
  try {
    const doctor = await db.get(
      'SELECT id FROM doctors WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const patients = await db.all(`
      SELECT 
        p.id, p.walletAddress, p.name, p.dateOfBirth, p.bloodType,
        ap.grantedAt
      FROM access_permissions ap
      JOIN patients p ON ap.patientId = p.id
      WHERE ap.doctorId = ? AND ap.hasAccess = 1
      ORDER BY ap.grantedAt DESC
    `, [doctor.id]);

    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient records for a doctor (only if they have access)
router.get('/doctors/:walletAddress/patient/:patientWallet/records', async (req, res) => {
  try {
    const doctor = await db.get(
      'SELECT id FROM doctors WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const patient = await db.get(
      'SELECT id FROM patients WHERE walletAddress = ?',
      [req.params.patientWallet]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if doctor has access
    const access = await db.get(
      'SELECT hasAccess FROM access_permissions WHERE doctorId = ? AND patientId = ? AND hasAccess = 1',
      [doctor.id, patient.id]
    );
    
    if (!access) {
      return res.status(403).json({ error: 'No access to this patient\'s records' });
    }

    // Get patient's records
    const records = await db.all(
      'SELECT * FROM medical_records WHERE patientId = ? ORDER BY timestamp DESC',
      [patient.id]
    );

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add diagnosis/note to patient record
router.post('/doctors/:walletAddress/records/:recordId/diagnosis', async (req, res) => {
  try {
    const { diagnosis } = req.body;
    
    const doctor = await db.get(
      'SELECT id FROM doctors WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const record = await db.get(
      'SELECT * FROM medical_records WHERE id = ?',
      [req.params.recordId]
    );
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Check if doctor has access to this patient's records
    const access = await db.get(
      'SELECT hasAccess FROM access_permissions WHERE doctorId = ? AND patientId = ? AND hasAccess = 1',
      [doctor.id, record.patientId]
    );
    
    if (!access) {
      return res.status(403).json({ error: 'No access to this patient\'s records' });
    }

    // Update record with diagnosis
    await db.run(
      'UPDATE medical_records SET notes = ? WHERE id = ?',
      [diagnosis, req.params.recordId]
    );

    res.json({ success: true, message: 'Diagnosis added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
