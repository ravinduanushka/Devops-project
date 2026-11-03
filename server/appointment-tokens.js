// MongoDB increments this shared counter atomically across server replicas.
module.exports = async function allocateAppointmentToken(Appointment, Counter) {
  const latest = await Appointment.findOne().sort({ tokenNumber: -1 }).select('tokenNumber').lean();
  const highest = latest?.tokenNumber || 0;
  try {
    await Counter.updateOne(
      { _id: 'appointments' },
      { $max: { sequence: highest } },
      { upsert: true }
    );
  } catch (error) {
    // Another request may have created the counter concurrently.
    if (error.code !== 11000) throw error;
    await Counter.updateOne({ _id: 'appointments' }, { $max: { sequence: highest } });
  }
  const counter = await Counter.findOneAndUpdate(
    { _id: 'appointments' },
    { $inc: { sequence: 1 } },
    { returnDocument: 'after' }
  );
  return counter.sequence;
};
