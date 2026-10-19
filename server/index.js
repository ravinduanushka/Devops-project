const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

app.use(express.json());

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      allowedOrigin,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    if (allowed.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';


// connectDB called after models are defined
const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

// ==================== SCHEMAS ====================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
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
  patientId: { type: String, default: '' },
  age: { type: Number, default: 0, min: 0 },
  gender: { type: String, default: 'Male' },
  contact: { type: String, default: '' },
  nic: { type: String, default: '' },
  bloodGroup: { type: String, default: 'O+' },
  allergies: { type: String, default: '' },
  diagnosis: { type: String, default: 'OPD Consultation', trim: true },
  assignedDoctor: { type: mongoose.Schema.Types.Mixed, default: null },
  wardNumber: { type: String, default: '', trim: true },
  status: { type: String, default: 'Registered' },
  admittedAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  patientId: { type: String, default: '' },
  doctorName: { type: String, required: true, trim: true },
  department: { type: String, default: 'General Medicine' },
  dateTime: { type: Date, default: Date.now },
  tokenNumber: { type: Number, required: true, min: 1 },
  status: { type: String, default: 'Waiting' },
  type: { type: String, default: 'In-Person Consultation' },
  fee: { type: String, default: 'Rs. 2,500 Paid' },
  createdAt: { type: Date, default: Date.now }
});

const prescriptionSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  patientId: { type: String, default: '' },
  doctorName: { type: String, required: true, trim: true },
  diagnosis: { type: String, default: '' },
  symptoms: { type: String, default: '' },
  medications: [
    {
      name: { type: String, required: true },
      dosage: { type: String, default: '' },
      frequency: { type: String, default: '' },
      duration: { type: String, default: '' },
      instructions: { type: String, default: '' }
    }
  ],
  followUpAdvice: { type: String, default: '' },
  status: { type: String, default: 'Pending Dispensing' },
  createdAt: { type: Date, default: Date.now }
});

const admissionOrderSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  patientId: { type: String, default: '' },
  doctorName: { type: String, required: true, trim: true },
  ward: { type: String, default: 'Ward 3B' },
  bedNo: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  orderNotes: { type: String, default: 'Admit to Ward 3B' },
  status: { type: String, default: 'Pending Bed Allocation' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Prescription = mongoose.model('Prescription', prescriptionSchema);
const AdmissionOrder = mongoose.model('AdmissionOrder', admissionOrderSchema);

// ==================== SEED INITIAL DOCTORS ====================

const seedInitialDoctors = async () => {
  const sharedEmail = (process.env.DOCTOR_SHARED_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();

  const initialDoctors = [
    {
      name: 'Dr. Vance',
      email: sharedEmail,
      password: process.env.DOCTOR_VANCE_PASSWORD || 'vancedoctor',
      phone: '+94 77 123 4567',
      role: 'Doctor',
      doctorDetails: {
        specialization: 'Cardiology',
        roomNo: '01'
      }
    },
    {
      name: 'Dr. Sanath Weerasinghe',
      email: sharedEmail,
      password: process.env.DOCTOR_SANATH_PASSWORD || 'sanathdoctor',
      phone: '+94 77 234 5678',
      role: 'Doctor',
      doctorDetails: {
        specialization: 'Pulmonology',
        roomNo: '02'
      }
    },
    {
      name: 'Dr. Priyantha Senanayake',
      email: sharedEmail,
      password: process.env.DOCTOR_PRIYANTHA_PASSWORD || 'priyanthadoctor',
      phone: '+94 77 345 6789',
      role: 'Doctor',
      doctorDetails: {
        specialization: 'Cardiology',
        roomNo: '03'
      }
    },
    {
      name: 'Dr. Champa Gunasekara',
      email: sharedEmail,
      password: process.env.DOCTOR_CHAMPA_PASSWORD || 'champadoctor',
      phone: '+94 77 456 7890',
      role: 'Doctor',
      doctorDetails: {
        specialization: 'General Medicine',
        roomNo: '04'
      }
    },
    {
      name: 'Dr. Malani Fernando',
      email: sharedEmail,
      password: process.env.DOCTOR_MALANI_PASSWORD || 'malanidoctor',
      phone: '+94 77 567 8901',
      role: 'Doctor',
      doctorDetails: {
        specialization: 'Pediatrics',
        roomNo: '05'
      }
    }
  ];

  try {
    // Drop unique index on email if it exists from previous schema
    await User.collection.dropIndex('email_1').catch(() => {});

    for (const doc of initialDoctors) {
      const existing = await User.findOne({ name: doc.name, role: 'Doctor' });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doc.password, salt);

      if (!existing) {
        const newUser = new User({
          ...doc,
          password: hashedPassword
        });
        await newUser.save();
        console.log(`Seeded doctor: ${doc.name}`);
      } else {
        existing.email = doc.email;
        existing.password = hashedPassword;
        existing.doctorDetails = doc.doctorDetails;
        await existing.save();
        console.log(`Updated doctor credentials: ${doc.name}`);
      }
    }
    console.log('5 default doctors initialized successfully with email ' + sharedEmail);

    // Seed designated single Receptionist
    const recEmail = (process.env.RECEPTIONIST_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();
    const recPass = process.env.RECEPTIONIST_PASSWORD || 'webreciption56';
    const recSalt = await bcrypt.genSalt(10);
    const hashedRecPass = await bcrypt.hash(recPass, recSalt);

    const existingRec = await User.findOne({ role: 'Receptionist' });
    if (!existingRec) {
      const newRec = new User({
        name: 'Hospital Receptionist',
        email: recEmail,
        password: hashedRecPass,
        role: 'Receptionist',
        phone: '+94 11 234 5678',
        receptionistDetails: { deskNumber: 'Desk 01' }
      });
      await newRec.save();
      console.log('Seeded Receptionist with email ' + recEmail);
    } else {
      existingRec.email = recEmail;
      existingRec.password = hashedRecPass;
      existingRec.name = existingRec.name || 'Hospital Receptionist';
      await existingRec.save();
      console.log('Updated Receptionist credentials with email ' + recEmail);
    }
  } catch (err) {
    console.error('Error seeding users:', err.message);
  }
};

const connectDB = async (retries = 5, delayMs = 2000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected successfully');
      await seedInitialDoctors();
      return;
    } catch (err) {
      process.stderr.write(`Database connection attempt ${i} failed: ${err.message}\n`);
      if (i === retries) {
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
connectDB();

// ==================== ROUTES ====================

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Doctors API - get all registered doctors dynamically
app.get('/api/doctors', async (_req, res, next) => {
  try {
    const doctors = await User.find({ role: 'Doctor' }).sort({ createdAt: 1 });
    const formatted = doctors.map((doc) => {
      const spec = doc.doctorDetails?.specialization || 'General Medicine';
      let fee = 'Rs. 2,500 Paid';
      if (spec === 'Pulmonology') fee = 'Rs. 2,800 Paid';
      else if (spec === 'General Medicine') fee = 'Rs. 2,000 Paid';
      else if (spec === 'Pediatrics') fee = 'Rs. 2,200 Paid';
      else if (spec === 'Cardiology') fee = 'Rs. 2,500 Paid';
      else if (spec === 'Neurology') fee = 'Rs. 3,000 Paid';

      return {
        _id: doc._id,
        name: doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`,
        specialty: spec,
        fee: fee,
        roomNo: doc.doctorDetails?.roomNo || '',
        phone: doc.phone
      };
    });
    return res.status(200).json(formatted);
  } catch (err) {
    return next(err);
  }
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

    if (!email || !password || !role || !name || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const authorizedRecEmail = (process.env.RECEPTIONIST_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();
    const authorizedRecPassword = process.env.RECEPTIONIST_PASSWORD || 'webreciption56';

    if (role === 'Receptionist') {
      if (email !== authorizedRecEmail || password !== authorizedRecPassword) {
        return res.status(400).json({
          error: `Only the authorized Receptionist credentials (Email: ${authorizedRecEmail}, Password: ${authorizedRecPassword}) are accepted for the Receptionist role.`
        });
      }

      const existingRec = await User.findOne({ role: 'Receptionist' });
      if (existingRec) {
        const salt = await bcrypt.genSalt(10);
        existingRec.email = authorizedRecEmail;
        existingRec.password = await bcrypt.hash(authorizedRecPassword, salt);
        existingRec.name = name || existingRec.name;
        existingRec.phone = phone || existingRec.phone;
        if (req.body.receptionistDetails?.deskNumber) {
          existingRec.receptionistDetails = { deskNumber: cleanString(req.body.receptionistDetails.deskNumber) };
        }
        await existingRec.save();
        return res.status(200).json({ message: 'Receptionist configured successfully' });
      }
    }

    const sharedDoctorEmail = (process.env.DOCTOR_SHARED_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();
    const existingUser = await User.findOne({
      $or: [
        { email: { $eq: email }, name: { $eq: name } },
        ...(email !== sharedDoctorEmail && email !== authorizedRecEmail ? [{ email: { $eq: email } }] : [])
      ]
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or name' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctorDetails = role === 'Doctor' && req.body.doctorDetails ? {
      specialization: cleanString(req.body.doctorDetails.specialization) || 'General Medicine',
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

// User Login (supports multiple doctors sharing anusikan0426@gmail.com by matching password)
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Credentials required' });
    }

    const matchingUsers = await User.find({ email: { $eq: email } });
    if (!matchingUsers || matchingUsers.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let matchedUser = null;
    for (const u of matchingUsers) {
      const isMatch = await bcrypt.compare(password, u.password);
      if (isMatch) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Login successful',
      role: matchedUser.role,
      name: matchedUser.name,
      userId: matchedUser._id,
      doctorDetails: matchedUser.doctorDetails
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
      patientId: cleanString(req.body.patientId || req.body.pid),
      age: Number(req.body.age) || 0,
      gender: cleanString(req.body.gender) || 'Male',
      contact: cleanString(req.body.contact || req.body.contactNumber),
      nic: cleanString(req.body.nic || req.body.nicNumber),
      bloodGroup: cleanString(req.body.bloodGroup) || 'O+',
      allergies: cleanString(req.body.allergies),
      diagnosis: cleanString(req.body.diagnosis) || 'OPD Consultation',
      assignedDoctor: req.body.assignedDoctor || null,
      wardNumber: cleanString(req.body.wardNumber),
      status: cleanString(req.body.status) || 'Registered'
    });
    await patient.save();
    return res.status(201).json(patient);
  } catch (err) {
    return next(err);
  }
});

app.put('/api/patients/:id', async (req, res, next) => {
  try {
    const updateData = {};
    if (req.body.status) updateData.status = cleanString(req.body.status);
    if (req.body.diagnosis) updateData.diagnosis = cleanString(req.body.diagnosis);
    if (req.body.wardNumber) updateData.wardNumber = cleanString(req.body.wardNumber);
    if (req.body.assignedDoctor) updateData.assignedDoctor = req.body.assignedDoctor;
    if (req.body.admittedAt) updateData.admittedAt = new Date(req.body.admittedAt);
    const updated = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

// Appointments API
app.get('/api/appointments', async (_req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1, tokenNumber: 1 });
    return res.status(200).json(appointments);
  } catch (err) {
    return next(err);
  }
});

app.post('/api/appointments', async (req, res, next) => {
  try {
    const appointment = new Appointment({
      patientName: cleanString(req.body.patientName),
      patientId: cleanString(req.body.patientId || req.body.pid),
      doctorName: cleanString(req.body.doctorName),
      department: cleanString(req.body.department) || 'General Medicine',
      dateTime: req.body.dateTime ? new Date(req.body.dateTime) : new Date(),
      tokenNumber: Number(req.body.tokenNumber) || 1,
      status: cleanString(req.body.status) || 'Waiting',
      type: cleanString(req.body.type) || 'In-Person Consultation',
      fee: cleanString(req.body.fee) || 'Rs. 2,500 Paid'
    });
    await appointment.save();
    return res.status(201).json(appointment);
  } catch (err) {
    return next(err);
  }
});

app.put('/api/appointments/:id', async (req, res, next) => {
  try {
    const updateData = {};
    if (req.body.status) updateData.status = cleanString(req.body.status);
    if (req.body.doctorName) updateData.doctorName = cleanString(req.body.doctorName);
    const updated = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

// Prescriptions API (Doctor -> Patient & Pharmacy)
app.get('/api/prescriptions', async (_req, res, next) => {
  try {
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    return res.status(200).json(prescriptions);
  } catch (err) {
    return next(err);
  }
});

app.post('/api/prescriptions', async (req, res, next) => {
  try {
    const prescription = new Prescription({
      patientName: cleanString(req.body.patientName),
      patientId: cleanString(req.body.patientId || req.body.pid),
      doctorName: cleanString(req.body.doctorName),
      diagnosis: cleanString(req.body.diagnosis),
      symptoms: cleanString(req.body.symptoms),
      medications: Array.isArray(req.body.medications) ? req.body.medications : [],
      followUpAdvice: cleanString(req.body.followUpAdvice),
      status: cleanString(req.body.status) || 'Pending Dispensing'
    });
    await prescription.save();

    // Also update patient record diagnosis if patient exists
    if (prescription.patientName && prescription.diagnosis) {
      await Patient.findOneAndUpdate(
        { name: prescription.patientName },
        { diagnosis: prescription.diagnosis }
      );
    }

    return res.status(201).json(prescription);
  } catch (err) {
    return next(err);
  }
});

app.put('/api/prescriptions/:id', async (req, res, next) => {
  try {
    const updateData = {};
    if (req.body.status) updateData.status = cleanString(req.body.status);
    const updated = await Prescription.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

// Admissions API (Doctor -> Receptionist -> Nurse)
app.get('/api/admissions', async (_req, res, next) => {
  try {
    const orders = await AdmissionOrder.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    return next(err);
  }
});

app.post('/api/admissions', async (req, res, next) => {
  try {
    const order = new AdmissionOrder({
      patientName: cleanString(req.body.patientName),
      patientId: cleanString(req.body.patientId || req.body.pid),
      doctorName: cleanString(req.body.doctorName),
      ward: cleanString(req.body.ward) || 'Ward 3B',
      bedNo: cleanString(req.body.bedNo),
      diagnosis: cleanString(req.body.diagnosis),
      orderNotes: cleanString(req.body.orderNotes) || 'Admit to Ward 3B',
      status: cleanString(req.body.status) || 'Pending Bed Allocation'
    });
    await order.save();

    // Also update patient status if found
    if (order.patientName) {
      await Patient.findOneAndUpdate(
        { name: order.patientName },
        { status: 'Admission Requested', wardNumber: order.ward }
      );
    }

    return res.status(201).json(order);
  } catch (err) {
    return next(err);
  }
});

app.put('/api/admissions/:id', async (req, res, next) => {
  try {
    const updateData = {};
    if (req.body.status) updateData.status = cleanString(req.body.status);
    if (req.body.bedNo) updateData.bedNo = cleanString(req.body.bedNo);
    if (req.body.ward) updateData.ward = cleanString(req.body.ward);
    const updated = await AdmissionOrder.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Also synchronize patient record
    if (updated && updated.patientName && (updateData.bedNo || updateData.status === 'Bed Allocated' || updateData.status === 'Admitted')) {
      await Patient.findOneAndUpdate(
        { name: updated.patientName },
        {
          status: 'Admitted',
          wardNumber: `${updated.ward || 'Ward 3B'} / ${updated.bedNo}`,
          admittedAt: new Date()
        }
      );
    }

    return res.status(200).json(updated);
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