// Ensure User schema includes 'Patient' in role enum:
// role: { type: String, enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'], required: true }

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const confirmPassword = typeof req.body.confirmPassword === 'string' ? req.body.confirmPassword : '';
    const role = cleanString(req.body.role);
    const name = cleanString(req.body.name);
    const phone = cleanString(req.body.phone);

    if (!email || !password || !confirmPassword || !role || !name || !phone) {
      return res.status(400).json({ error: 'All fields including password confirmation are required' });
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