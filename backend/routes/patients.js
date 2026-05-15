const express = require('express');
const router = express.Router();
const db = require('../database');
const CryptoJS = require('crypto-js');

// ─────────────────────────────────────────────────────────────────
// Encryption utilities matching frontend crypto.js
// ─────────────────────────────────────────────────────────────────

function deriveKey(walletAddress) {
  if (!walletAddress) throw new Error("Wallet address required");
  const normalized = walletAddress.toLowerCase();
  const hash1 = CryptoJS.SHA256(normalized).toString();
  const hash2 = CryptoJS.SHA256(hash1 + normalized).toString();
  return hash2;
}

function encryptData(content, key) {
  const wordArray = CryptoJS.enc.Utf8.parse(content);
  const iv = CryptoJS.lib.WordArray.random(16);
  
  const encrypted = CryptoJS.AES.encrypt(wordArray, CryptoJS.enc.Hex.parse(key), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ivHex = iv.toString(CryptoJS.enc.Hex);
  const cipherBase64 = encrypted.toString();
  return `${ivHex}::${cipherBase64}`;
}

// Get all patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await db.all('SELECT * FROM patients');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient by wallet address
router.get('/patients/:walletAddress', async (req, res) => {
  try {
    const patient = await db.get(
      'SELECT * FROM patients WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create patient
router.post('/patients', async (req, res) => {
  try {
    const { walletAddress, name, dateOfBirth, bloodType } = req.body;
    const result = await db.run(
      'INSERT INTO patients (walletAddress, name, dateOfBirth, bloodType) VALUES (?, ?, ?, ?)',
      [walletAddress, name, dateOfBirth, bloodType]
    );
    res.json({ id: result.lastID, walletAddress, name, dateOfBirth, bloodType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-register patient (creates if not exists)
router.post('/patients/register/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Check if patient already exists
    let patient = await db.get(
      'SELECT * FROM patients WHERE walletAddress = ?',
      [walletAddress]
    );

    if (!patient) {
      // Create new patient with default values
      const result = await db.run(
        'INSERT INTO patients (walletAddress, name, dateOfBirth, bloodType) VALUES (?, ?, ?, ?)',
        [walletAddress, `Patient ${walletAddress.substring(0, 8)}...`, '1990-01-01', 'O+']
      );
      patient = { id: result.lastID, walletAddress, name: `Patient ${walletAddress.substring(0, 8)}...`, dateOfBirth: '1990-01-01', bloodType: 'O+' };
    }

    res.json({ registered: true, patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sample records for patient
router.post('/patients/:walletAddress/create-samples', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const patient = await db.get(
      'SELECT id FROM patients WHERE walletAddress = ?',
      [walletAddress]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get all seed doctors
    const doctors = await db.all('SELECT id FROM doctors');

    // Derive encryption key from patient's wallet
    const derivedKey = deriveKey(walletAddress);

    // Create sample records
    const sampleRecords = [
      {
        title: 'General Health Checkup',
        type: 'Consultation',
        description: 'Annual physical examination and health assessment',
        content: 'BP: 120/80 mmHg | HR: 72 bpm | Temp: 37.0°C | Weight: 70kg | Height: 175cm | Overall Assessment: Excellent health, no concerns noted',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 7,
        notes: 'Patient in excellent health. All vital signs normal.'
      },
      {
        title: 'Blood Work Results',
        type: 'Lab Results',
        description: 'Complete blood panel and chemistry analysis',
        content: 'Hemoglobin: 14.5 g/dL (Normal) | WBC: 7.2 K/µL (Normal) | Platelets: 245 K/µL (Normal) | Glucose: 95 mg/dL (Normal) | Cholesterol: 180 mg/dL (Normal) | HDL: 55 mg/dL | LDL: 100 mg/dL',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
        notes: 'All values within normal ranges. Continue regular monitoring.'
      },
      {
        title: 'Cardiovascular Assessment',
        type: 'Imaging',
        description: 'Echocardiogram and cardiac function evaluation',
        content: 'Ejection Fraction: 62% (Normal) | Ventricle Size: Normal | Valve Function: Normal | Chamber Size: Normal | No abnormalities detected | Recommendation: Continue current lifestyle',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 14,
        notes: 'Heart function excellent. No intervention needed.'
      },
      {
        title: 'Dental Examination',
        type: 'Dental',
        description: 'Routine dental checkup and cleaning',
        content: 'Teeth: 32 present, all healthy | Cavities: 0 | Gum Health: Excellent | Plaque Buildup: Minimal | Recommendation: Continue twice-daily brushing',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
        notes: 'Excellent oral hygiene. No dental work needed.'
      },
      {
        title: 'Vision Test',
        type: 'Optical',
        description: 'Eye examination and vision assessment',
        content: 'Right Eye: 20/20 | Left Eye: 20/20 | Color Vision: Normal | Intraocular Pressure: 14 mmHg (Normal) | No cataracts detected',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 45,
        notes: 'Vision perfect. No prescription needed.'
      }
    ];

    const processedRecords = [];

    for (const record of sampleRecords) {
      // Encrypt the content
      const encryptedContent = encryptData(record.content, derivedKey);
      
      const result = await db.run(
        'INSERT INTO medical_records (patientId, title, type, description, encryptedContent, timestamp, notes, isEncrypted) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [patient.id, record.title, record.type, record.description, encryptedContent, record.timestamp, record.notes]
      );

      processedRecords.push({
        id: result.lastID,
        title: record.title,
        type: record.type,
        description: record.description,
        timestamp: record.timestamp
      });
    }

    // Grant access to all seed doctors
    for (const doctor of doctors) {
      await db.run(
        'INSERT OR IGNORE INTO access_permissions (patientId, doctorId, hasAccess) VALUES (?, ?, 1)',
        [patient.id, doctor.id]
      );
    }

    res.json({ created: true, count: processedRecords.length, records: processedRecords, accessGranted: doctors.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient's medical records
router.get('/patients/:walletAddress/records', async (req, res) => {
  try {
    const patient = await db.get(
      'SELECT id FROM patients WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const records = await db.all(
      'SELECT * FROM medical_records WHERE patientId = ? ORDER BY timestamp DESC',
      [patient.id]
    );
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add medical record
router.post('/records', async (req, res) => {
  try {
    const { patientWallet, title, type, description, encryptedContent, notes } = req.body;
    
    const patient = await db.get(
      'SELECT id FROM patients WHERE walletAddress = ?',
      [patientWallet]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const result = await db.run(
      'INSERT INTO medical_records (patientId, title, type, description, encryptedContent, timestamp, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient.id, title, type, description, encryptedContent, Math.floor(Date.now() / 1000), notes]
    );
    
    res.json({ id: result.lastID, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient's access list (doctors with access)
router.get('/patients/:walletAddress/access', async (req, res) => {
  try {
    const patient = await db.get(
      'SELECT id FROM patients WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const access = await db.all(`
      SELECT 
        d.walletAddress, d.name, d.specialty,
        ap.hasAccess, ap.grantedAt
      FROM access_permissions ap
      JOIN doctors d ON ap.doctorId = d.id
      WHERE ap.patientId = ?
    `, [patient.id]);
    
    res.json(access);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grant doctor access
router.post('/patients/:walletAddress/grant-access', async (req, res) => {
  try {
    const { doctorWallet } = req.body;
    
    const patient = await db.get(
      'SELECT id FROM patients WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const doctor = await db.get(
      'SELECT id FROM doctors WHERE walletAddress = ?',
      [doctorWallet]
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await db.run(
      'INSERT OR REPLACE INTO access_permissions (patientId, doctorId, hasAccess) VALUES (?, ?, 1)',
      [patient.id, doctor.id]
    );

    res.json({ success: true, message: 'Access granted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke doctor access
router.post('/patients/:walletAddress/revoke-access', async (req, res) => {
  try {
    const { doctorWallet } = req.body;
    
    const patient = await db.get(
      'SELECT id FROM patients WHERE walletAddress = ?',
      [req.params.walletAddress]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const doctor = await db.get(
      'SELECT id FROM doctors WHERE walletAddress = ?',
      [doctorWallet]
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await db.run(
      'UPDATE access_permissions SET hasAccess = 0, revokedAt = CURRENT_TIMESTAMP WHERE patientId = ? AND doctorId = ?',
      [patient.id, doctor.id]
    );

    res.json({ success: true, message: 'Access revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
