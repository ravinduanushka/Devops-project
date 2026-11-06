const bcrypt = require('bcryptjs');

module.exports = async (User) => {
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
    // Drop any legacy unique index on email if present from earlier schema versions
    try {
      const existingIndexes = await User.collection.indexes().catch(() => []);
      for (const idx of existingIndexes) {
        if (idx.name !== '_id_' && idx.unique && idx.key && idx.key.email) {
          await User.collection.dropIndex(idx.name).catch(() => {});
          console.log(`Dropped legacy unique email index: ${idx.name}`);
        }
      }
    } catch (_idxErr) {
      await User.collection.dropIndex('email_1').catch(() => {});
    }

    for (const doc of initialDoctors) {
      try {
        const shortName = doc.name.replace(/\s+(Weerasinghe|Senanayake|Gunasekara|Fernando)$/, '');
        const existing = await User.findOne({
          role: 'Doctor',
          $or: [
            { name: doc.name },
            { name: shortName }
          ]
        });
        if (!existing) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(doc.password, salt);
          const newUser = new User({
            ...doc,
            password: hashedPassword
          });
          await newUser.save();
          console.log(`Seeded doctor: ${doc.name}`);
        } else {
          existing.name = doc.name;
          existing.email = doc.email;
          existing.doctorDetails = doc.doctorDetails;
          await existing.save();
          console.log(`Updated doctor profile: ${doc.name}`);
        }
      } catch (docErr) {
        console.error(`Failed to seed/update doctor ${doc.name}:`, docErr.message);
      }
    }
    console.log('5 default doctors initialized successfully with email ' + sharedEmail);

    // Seed designated single Receptionist
    const recEmail = (process.env.RECEPTIONIST_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();
    const recPass = process.env.RECEPTIONIST_PASSWORD || 'webreciption56';
    const existingRec = await User.findOne({ role: 'Receptionist' });
    if (!existingRec) {
      const recSalt = await bcrypt.genSalt(10);
      const hashedRecPass = await bcrypt.hash(recPass, recSalt);
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
      existingRec.name = existingRec.name || 'Hospital Receptionist';
      await existingRec.save();
      console.log('Updated Receptionist profile with email ' + recEmail);
    }
  } catch (err) {
    console.error('Error seeding users:', err.message);
  }
};

