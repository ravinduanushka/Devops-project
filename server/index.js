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

mongoose.connect(MONGO_URI).catch((err) => {
  process.stderr.write(`Database connection error: ${err.message}\n`);
  process.exit(1);
});

const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

// ==================== SCHEMAS ====================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'], required: true },
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
});

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0 },
  diagnosis: { type: String, required: true, trim: true },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wardNumber: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Admitted', 'Discharged'], default: 'Admitted' },
  admittedAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  doctorName: { type: String, required: true, trim: true },
  dateTime: { type: Date, required: true },
  tokenNumber: { type: Number, required: true, min: 1 }
});

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// ==================== ROUTES ====================

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// User Registration with Confirm Password Validation
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const confirmPassword = typeof req.body.confirmPassword === 'string' ? req.body.confirmPassword : '';
    const role = cleanString(req.body.role);
    const name = cleanString(req.body.name);
    const phone = cleanString(req.body.phone);

    if (!email || !password || !confirmPassword || !role || !name || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
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
  } catch (err) {
    return next(err);
  }
});

// User Login
app.post('/api/auth/login', async (req, res, next) => {
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

    return res.status(200).json({
      message: 'Login successful',
      role: user.role,
      name: user.name,
      userId: user._id
    });
  } catch (err) {
    return next(err);
  }
});

// Patients API
app.get('/api/patients', async (_req, res, next) => {
  try {
    const patients = await Patient.find().populate('assignedDoctor', 'name doctorDetails phone');
    return res.status(200).json(patients);
  } catch (err) {
    return next(err);
  }
});

app.post('/api/patients', async (req, res, next) => {
  try {
    const patient = new Patient({
      name: cleanString(req.body.name),
      age: Number(req.body.age) || 0,
      diagnosis: cleanString(req.body.diagnosis),
      assignedDoctor: req.body.assignedDoctor,
      wardNumber: cleanString(req.body.wardNumber)
    });
    await patient.save();
    return res.status(201).json(patient);
  } catch (err) {
    return next(err);
  }
});

// Appointments API
app.get('/api/appointments', async (_req, res, next) => {
  try {
    const appointments = await Appointment.find();
    return res.status(200).json(appointments);
  } catch (err) {
    return next(err);
  }
});

app.post('/api/appointments', async (req, res, next) => {
  try {
    const appointment = new Appointment({
      patientName: cleanString(req.body.patientName),
      doctorName: cleanString(req.body.doctorName),
      dateTime: new Date(req.body.dateTime),
      tokenNumber: Number(req.body.tokenNumber) || 1
    });
    await appointment.save();
    return res.status(201).json(appointment);
  } catch (err) {
    return next(err);
  }
});

// Centralized Express Error Handler
app.use((err, _req, res, _next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT);