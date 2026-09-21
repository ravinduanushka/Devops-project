// ==================== USER AUTH & ROLE REGISTRATION ====================

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
  
  // Specific profile fields based on role
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

// Appointment Schema
const Appointment = mongoose.model('Appointment', new mongoose.Schema({
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  dateTime: { type: Date, required: true },
  tokenNumber: { type: Number, required: true }
}));

// ==================== REGISTRATION ENDPOINTS ====================

// 1. Unified Registration Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, doctorDetails, nurseDetails, receptionistDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = new User({
      email,
      password, // Note: Use bcrypt for hashing in production
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

// 2. Simple Login Route
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

// 3. Appointments Route (Used by Receptionist / Doctor)
app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});