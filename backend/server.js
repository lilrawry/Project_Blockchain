const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://10.5.0.2:3001'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', patientsRouter);
app.use('/api', doctorsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running' });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initialize();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 Medical Records API ready`);
      console.log(`
Available endpoints:
  - GET    /api/patients
  - GET    /api/patients/:walletAddress
  - POST   /api/patients
  - GET    /api/patients/:walletAddress/records
  - POST   /api/records
  - GET    /api/patients/:walletAddress/access
  - POST   /api/patients/:walletAddress/grant-access
  - POST   /api/patients/:walletAddress/revoke-access
  
  - GET    /api/doctors
  - GET    /api/doctors/:walletAddress
  - POST   /api/doctors
  - GET    /api/doctors/:walletAddress/patients
  - GET    /api/doctors/:walletAddress/patient/:patientWallet/records
  - POST   /api/doctors/:walletAddress/records/:recordId/diagnosis
      `);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await db.close();
  process.exit(0);
});

startServer();
