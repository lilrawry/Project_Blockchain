const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'medical_records.db');

class Database {
  constructor() {
    this.db = null;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) reject(err);
        else {
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Patients table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            walletAddress TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            dateOfBirth TEXT,
            bloodType TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Doctors table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            walletAddress TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            specialty TEXT NOT NULL,
            license TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Medical records table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS medical_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId INTEGER NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            encryptedContent TEXT NOT NULL,
            doctorId INTEGER,
            timestamp INTEGER,
            isEncrypted INTEGER DEFAULT 1,
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(patientId) REFERENCES patients(id),
            FOREIGN KEY(doctorId) REFERENCES doctors(id)
          )
        `);

        // Access permissions table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS access_permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId INTEGER NOT NULL,
            doctorId INTEGER NOT NULL,
            hasAccess INTEGER DEFAULT 1,
            grantedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            revokedAt DATETIME,
            UNIQUE(patientId, doctorId),
            FOREIGN KEY(patientId) REFERENCES patients(id),
            FOREIGN KEY(doctorId) REFERENCES doctors(id)
          )
        `, (err) => {
          if (err) reject(err);
          else {
            this.seedData().then(resolve).catch(reject);
          }
        });
      });
    });
  }

  seedData() {
    return new Promise((resolve, reject) => {
      // Check if data already exists
      this.db.get('SELECT COUNT(*) as count FROM patients', (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count > 0) {
          resolve(); // Data already seeded
          return;
        }

        // Seed patients
        const patients = [
          { walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4', name: 'John Doe', dateOfBirth: '1985-03-15', bloodType: 'O+' },
          { walletAddress: '0x1234567890123456789012345678901234567890', name: 'Jane Smith', dateOfBirth: '1990-07-22', bloodType: 'A+' }
        ];

        // Seed doctors
        const doctors = [
          { walletAddress: '0x0987654321098765432109876543210987654321', name: 'Dr. Emily Johnson', specialty: 'General Practitioner', license: 'MD123456' },
          { walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'Dr. Michael Chen', specialty: 'Cardiologist', license: 'MD789012' }
        ];

        this.db.serialize(() => {
          // Insert patients
          patients.forEach(p => {
            this.db.run(
              'INSERT OR IGNORE INTO patients (walletAddress, name, dateOfBirth, bloodType) VALUES (?, ?, ?, ?)',
              [p.walletAddress, p.name, p.dateOfBirth, p.bloodType]
            );
          });

          // Insert doctors
          doctors.forEach(d => {
            this.db.run(
              'INSERT OR IGNORE INTO doctors (walletAddress, name, specialty, license) VALUES (?, ?, ?, ?)',
              [d.walletAddress, d.name, d.specialty, d.license]
            );
          });

          // Add sample medical records
          this.db.run(`
            INSERT OR IGNORE INTO medical_records (patientId, title, type, description, encryptedContent, timestamp, isEncrypted, notes)
            VALUES 
            (1, 'General Health Checkup', 'Consultation', 'Annual health examination', 'encrypted_data_1', ?, 1, 'Patient in excellent health'),
            (1, 'Blood Work Results', 'Lab', 'Complete blood panel results', 'encrypted_data_2', ?, 1, 'All values within normal range'),
            (2, 'Cardiac Evaluation', 'Consultation', 'Heart condition assessment', 'encrypted_data_3', ?, 1, 'Follow-up required in 3 months')
          `, [Math.floor(Date.now() / 1000) - 86400 * 7, Math.floor(Date.now() / 1000) - 86400 * 3, Math.floor(Date.now() / 1000) - 86400]);

          // Add sample access permissions
          this.db.run(`
            INSERT OR IGNORE INTO access_permissions (patientId, doctorId, hasAccess)
            VALUES 
            (1, 1, 1),
            (1, 2, 0),
            (2, 1, 1)
          `, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
