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

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB server'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// ==================== SCHEMAS ====================

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist'], required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
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

// ==================== ROUTES ====================

app.get('/health', (req, res) => res.status(200).send('OK'));

// Secure Register (Sanitized inputs to prevent NoSQL Injection)
app.post('/api/auth/register', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const role = typeof req.body.role === 'string' ? req.body.role : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

    if (!email || !password || !role || !name || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: { $eq: email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
      doctorDetails: role === 'Doctor' && req.body.doctorDetails ? {
        specialization: String(req.body.doctorDetails.specialization || ''),
        roomNo: String(req.body.doctorDetails.roomNo || '')
      } : undefined,
      nurseDetails: role === 'Nurse' && req.body.nurseDetails ? {
        assignedWard: String(req.body.nurseDetails.assignedWard || ''),
        shiftTime: req.body.nurseDetails.shiftTime
      } : undefined,
      receptionistDetails: role === 'Receptionist' && req.body.receptionistDetails ? {
        deskNumber: String(req.body.receptionistDetails.deskNumber || '')
      } : undefined
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Secure Login (Sanitized inputs)
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Patients Routes (Explicit fields to prevent Mass Assignment)
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch patients' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient({
      name: String(req.body.name || ''),
      age: Number(req.body.age || 0),
      disease: String(req.body.disease || ''),
      assignedDoctor: String(req.body.assignedDoctor || ''),
      assignedWard: String(req.body.assignedWard || '')
    });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create patient' });
  }
});

app.put('/api/patients/:id/discharge', async (req, res) => {
  try {
    const patientId = String(req.params.id);
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { status: 'Discharged' },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (err) {
    res.status(400).json({ error: 'Failed to discharge patient' });
  }
});

// Appointments Routes (Explicit fields to prevent Mass Assignment)
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch appointments' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment({
      patientName: String(req.body.patientName || ''),
      doctorName: String(req.body.doctorName || ''),
      dateTime: new Date(req.body.dateTime),
      tokenNumber: Number(req.body.tokenNumber || 1)
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create appointment' });
  }
});

// Admin Stats Route
app.get('/api/admin/stats', async (req, res) => {
  try {
    const doctorCount = await User.countDocuments({ role: 'Doctor' });
    const nurseCount = await User.countDocuments({ role: 'Nurse' });
    const admittedPatients = await Patient.countDocuments({ status: 'Admitted' });
    const dischargedPatients = await Patient.countDocuments({ status: 'Discharged' });

    res.status(200).json({
      totalDoctors: doctorCount,
      totalNurses: nurseCount,
      activeAdmissions: admittedPatients,
      dischargedCount: dischargedPatients,
      availableBedsEstimate: Math.max(0, 50 - admittedPatients)
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Hospital Server running on port ${PORT}`);
});