const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB server'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==================== SCHEMAS & MODELS ====================

// 1. Doctor Schema
const Doctor = mongoose.model('Doctor', new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  phone: { type: String, required: true },
  roomNo: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}));

// 2. Nurse Schema
const Nurse = mongoose.model('Nurse', new mongoose.Schema({
  name: { type: String, required: true },
  assignedWard: { type: String, required: true },
  shiftTime: { type: String, enum: ['Morning', 'Evening', 'Night'], required: true },
  contact: { type: String, required: true }
}));

// 3. Patient Schema
const Patient = mongoose.model('Patient', new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  disease: { type: String, required: true },
  assignedDoctor: { type: String, required: true },
  assignedWard: { type: String, required: true },
  status: { type: String, enum: ['Admitted', 'Discharged'], default: 'Admitted' },
  admittedAt: { type: Date, default: Date.now }
}));

// ==================== API ENDPOINTS ====================

// Health Probe for Kubernetes
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- DOCTOR ROUTES ---
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- NURSE ROUTES ---
app.get('/api/nurses', async (req, res) => {
  try {
    const nurses = await Nurse.find();
    res.json(nurses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/nurses', async (req, res) => {
  try {
    const nurse = new Nurse(req.body);
    await nurse.save();
    res.status(201).json(nurse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- PATIENT ROUTES ---
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Discharge Patient
app.put('/api/patients/:id/discharge', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: 'Discharged' },
      { new: true }
    );
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMINISTRATIVE DASHBOARD STATS ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    const doctorCount = await Doctor.countDocuments();
    const nurseCount = await Nurse.countDocuments();
    const admittedPatients = await Patient.countDocuments({ status: 'Admitted' });
    const dischargedPatients = await Patient.countDocuments({ status: 'Discharged' });

    res.json({
      totalDoctors: doctorCount,
      totalNurses: nurseCount,
      activeAdmissions: admittedPatients,
      dischargedCount: dischargedPatients,
      availableBedsEstimate: Math.max(0, 50 - admittedPatients)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Hospital Server running on port ${PORT}`);
});