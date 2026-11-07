import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCurrentUser, getPatients, getAppointments, getPrescriptions, getAdmissions, getDoctors, createAppointment } from '../services/api';

const formatDate = (value) => new Date(value).toLocaleString();

export default function Patient() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [form, setForm] = useState({ doctorId: '', dateTime: '', type: 'In-Person Visit' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [user, patients, appointments, prescriptions, admissions, doctors] = await Promise.all([
          getCurrentUser(), getPatients(), getAppointments(), getPrescriptions(), getAdmissions(), getDoctors()
        ]);
        if (active) {
          setData({ user: user.data, patients: patients.data, appointments: appointments.data,
            prescriptions: prescriptions.data, admissions: admissions.data, doctors: doctors.data });
          setError('');
        }
      } catch (failure) {
        if (!active) return;
        // Clear previously displayed records rather than retaining stale clinical data.
        setData(null);
        if (failure.response?.status === 401) navigate('/login', { replace: true });
        else setError('Unable to load your records. Please refresh to try again.');
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [navigate]);

  const bookAppointment = async (event) => {
    event.preventDefault();
    if (isBooking || !data) return;
    setError('');
    setMessage('');
    const doctor = data.doctors.find((item) => item._id === form.doctorId);
    const date = new Date(form.dateTime);
    if (!doctor || !form.dateTime || !Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
      setError('Choose a doctor and a future appointment date and time.');
      return;
    }
    setIsBooking(true);
    try {
      const response = await createAppointment({ doctorName: doctor.name, department: doctor.specialty,
        dateTime: date.toISOString(), type: form.type });
      setData((previous) => previous ? { ...previous, appointments: [response.data, ...previous.appointments] } : previous);
      setMessage(`Appointment confirmed. Your token is #${response.data.tokenNumber}.`);
      setForm((previous) => ({ ...previous, dateTime: '' }));
    } catch (failure) {
      if (failure.response?.status === 401) navigate('/login', { replace: true });
      else setError(failure.response?.data?.error || 'Unable to confirm your appointment. Please try again.');
    } finally { setIsBooking(false); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="patient-page-wrapper" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1>My Patient Portal</h1>
        {error && <p className="alert-box alert-error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        {!data && !error && <p role="status">Loading your records...</p>}
        {data && <>
          <p>Welcome, {data.user.name}. Patient ID: <strong>{data.user.patientId}</strong></p>
          <section className="patient-booking-subcard">
            <h2>Book Appointment</h2>
            <form onSubmit={bookAppointment}>
              <label htmlFor="patient-doctor">Doctor</label>
              <select id="patient-doctor" className="patient-form-control" required value={form.doctorId}
                onChange={(event) => setForm({ ...form, doctorId: event.target.value })}>
                <option value="">Choose a doctor</option>
                {data.doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name} - {doctor.specialty}</option>)}
              </select>
              <label htmlFor="appointment-date-time">Date and time</label>
              <input id="appointment-date-time" type="datetime-local" className="patient-form-control" required
                value={form.dateTime} onChange={(event) => setForm({ ...form, dateTime: event.target.value })} />
              <label htmlFor="consultation-type">Consultation type</label>
              <select id="consultation-type" className="patient-form-control" value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option>In-Person Visit</option><option>Online Video Consultation</option>
              </select>
              <button className="patient-btn-schedule" type="submit" disabled={isBooking || !data.doctors.length}>
                {isBooking ? 'Booking...' : 'Schedule Appointment'}
              </button>
            </form>
          </section>
          <section className="patient-booking-subcard">
            <h2>My Appointments</h2>
            {!data.appointments.length && <p>No appointments yet.</p>}
            {data.appointments.map((item) => <article key={item._id}>
              <h3>Token #{item.tokenNumber} - {item.doctorName}</h3>
              <p>{formatDate(item.dateTime)} - {item.status}</p>
            </article>)}
          </section>
          <section className="patient-booking-subcard">
            <h2>My Medical Records</h2>
            {!data.patients.length && <p>No linked patient record is available. Contact reception with your Patient ID.</p>}
            {data.patients.map((item) => <article key={item._id}>
              <p>Name: {item.name}</p><p>Diagnosis: {item.diagnosis || 'Not recorded'}</p>
              <p>Allergies: {item.allergies || 'Not recorded'}</p><p>Status: {item.status}</p>
              {item.wardNumber && <p>Ward: {item.wardNumber}</p>}
            </article>)}
          </section>
          <section className="patient-booking-subcard">
            <h2>My Prescriptions</h2>
            {!data.prescriptions.length && <p>No prescriptions yet.</p>}
            {data.prescriptions.map((item) => <article key={item._id}>
              <h3>{item.doctorName} - {formatDate(item.createdAt)}</h3>
              <p>{item.diagnosis}</p>
              <ul>{item.medications.map((medication, index) => <li key={medication._id || index}>
                {medication.name} - {medication.dosage} - {medication.frequency} - {medication.duration}
                {medication.instructions && ` (${medication.instructions})`}
              </li>)}</ul>
              <p>{item.followUpAdvice}</p><p>{item.status}</p>
            </article>)}
          </section>
          <section className="patient-booking-subcard">
            <h2>My Admissions</h2>
            {!data.admissions.length && <p>No admissions yet.</p>}
            {data.admissions.map((item) => <article key={item._id}>
              <h3>{item.doctorName}</h3><p>{item.ward} {item.bedNo} - {item.status}</p>
              <p>{item.diagnosis}</p><p>{item.orderNotes}</p>
            </article>)}
          </section>
        </>}
      </main>
      <Footer />
    </div>
  );
}
