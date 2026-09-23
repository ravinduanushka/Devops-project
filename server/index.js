const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

app.use(express.json());

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

mongoose.connect(MONGO_URI).catch(() => {
  process.exit(1);
});

// Helper function to sanitize string inputs and reduce cognitive complexity
const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

// ==================== SCHEMAS ====================

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist'], required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  doctorDetails: {
    specialization: { type: String, default: '' },
    roomNo: { type: String, default: '' }
  },
  nurseDetails: {
    assignedWard: { type: String, default: '' },
    shiftTime: { type: String, enum: ['Morning', 'Evening', 'Night'], default: 'Morning' }
  },
  receptionistDetails: {
    deskNumber: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
}));

const Patient = mongoose.model('Patient', new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  disease: { type: String, required: true },
  assignedDoctor: { type: String, required: true },
  assignedWard: { type: String, required: true },
  status: { type: String, enum: ['Admitted', 'Discharged'], default: 'Admitted' },
  admittedAt: { type: Date, default: Date.now }
}));

const Appointment = mongoose.model('Appointment', new mongoose.Schema({
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  dateTime: { type: Date, required: true },
  tokenNumber: { type: Number, required: true }
}));

// ==================== ENDPOINTS ====================

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const role = cleanString(req.body.role);
    const name = cleanString(req.body.name);
    const phone = cleanString(req.body.phone);

    if (!email || !password || !role || !name || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: { $eq: email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctorDetails = role === 'Doctor' && req.body.doctorDetails ? {
      specialization: cleanString(req.body.doctorDetails.specialization),
      roomNo: cleanString(req.body.doctorDetails.roomNo)
    } : undefined;

    const nurseDetails = role === 'Nurse' && req.body.nurseDetails ? {
      assignedWard: cleanString(req.body.nurseDetails.assignedWard),
      shiftTime: req.body.nurseDetails.shiftTime || 'Morning'
    } : undefined;

    const receptionistDetails = role === 'Receptionist' && req.body.receptionistDetails ? {
      deskNumber: cleanString(req.body.receptionistDetails.deskNumber)
    } : undefined;

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
      doctorDetails,
      nurseDetails,
      receptionistDetails
    });

    await newUser.save();
    return res.status(201).json({ message: 'Registration successful' });
  } catch (_err) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Credentials required' });
    }

    const user = await User.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful', role: user.role, name: user.name });
  } catch (_err) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Patients Endpoints
app.get('/api/patients', async (_req, res) => {
  try {
    const patients = await Patient.find();
    return res.status(200).json(patients);
  } catch (_err) {
    return res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient({
      name: cleanString(req.body.name),
      age: Number(req.body.age) || 0,
      disease: cleanString(req.body.disease),
      assignedDoctor: cleanString(req.body.assignedDoctor),
      assignedWard: cleanString(req.body.assignedWard)
    });
    await patient.save();
    return res.status(201).json(patient);
  } catch (_err) {
    return res.status(400).json({ error: 'Creation failed' });
  }
});

app.put('/api/patients/:id/discharge', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      cleanString(req.params.id),
      { status: 'Discharged' },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(patient);
  } catch (_err) {
    return res.status(400).json({ error: 'Update failed' });
  }
});

// Appointments Endpoints
app.get('/api/appointments', async (_req, res) => {
  try {
    const appointments = await Appointment.find();
    return res.status(200).json(appointments);
  } catch (_err) {
    return res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment({
      patientName: cleanString(req.body.patientName),
      doctorName: cleanString(req.body.doctorName),
      dateTime: new Date(req.body.dateTime),
      tokenNumber: Number(req.body.tokenNumber) || 1
    });
    await appointment.save();
    return res.status(201).json(appointment);
  } catch (_err) {
    return res.status(400).json({ error: 'Creation failed' });
  }
});

// Admin Metrics Endpoint
app.get('/api/admin/stats', async (_req, res) => {
  try {
    const doctorCount = await User.countDocuments({ role: 'Doctor' });
    const nurseCount = await User.countDocuments({ role: 'Nurse' });
    const admittedPatients = await Patient.countDocuments({ status: 'Admitted' });
    const dischargedPatients = await Patient.countDocuments({ status: 'Discharged' });

    return res.status(200).json({
      totalDoctors: doctorCount,
      totalNurses: nurseCount,
      activeAdmissions: admittedPatients,
      dischargedCount: dischargedPatients,
      availableBedsEstimate: Math.max(0, 50 - admittedPatients)
    });
  } catch (_err) {
    return res.status(500).json({ error: 'Stats failed' });
  }
});

app.listen(PORT);