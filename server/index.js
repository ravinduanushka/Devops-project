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

// 1. Unified User Registration Schema (Admin, Doctor, Nurse, Receptionist)
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist'], 
    required: true 
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  doctorDetails: {
    specialization: { type: String },
    roomNo: { type: String }
  },
  nurseDetails: {
    assignedWard: { type: String },
    shiftTime: { type: String, enum: ['Morning', 'Evening', 'Night'] }
  },
  receptionistDetails: {
    deskNumber: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
}));

// 2. Patient Schema
const Patient = mongoose.model('Patient', new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  disease: { type: String, required: true },
  assignedDoctor: { type: String, required: true },
  assignedWard: { type: String, required: true },
  status: { type: String, enum: ['Admitted', 'Discharged'], default: 'Admitted' },
  admittedAt: { type: Date, default: Date.now }
}));

// 3. Appointment Schema
const Appointment = mongoose.model('Appointment', new mongoose.Schema({
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  dateTime: { type: Date, required: true },
  tokenNumber: { type: Number, required: true }
}));

// ==================== API ENDPOINTS ====================

// Health Probe for Kubernetes
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- AUTH / REGISTRATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, doctorDetails, nurseDetails, receptionistDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = new User({
      email,
      password,
      role,
      name,
      phone,
      doctorDetails: role === 'Doctor' ? doctorDetails : undefined,
      nurseDetails: role === 'Nurse' ? nurseDetails : undefined,
      receptionistDetails: role === 'Receptionist' ? receptionistDetails : undefined
    });

    await newUser.save();
    res.status(201).json({ message: `${role} registered successfully!`, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ message: 'Login successful', role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// --- APPOINTMENT ROUTES ---
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMIN STATS ROUTE ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    const doctorCount = await User.countDocuments({ role: 'Doctor' });
    const nurseCount = await User.countDocuments({ role: 'Nurse' });
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