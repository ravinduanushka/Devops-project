export const errorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export function initialRegistrationForm() {
  return {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Doctor",
    doctorDetails: { specialization: "General Medicine", roomNo: "101" },
    nurseDetails: {
      assignedWard: "Ward 3B (Pulmonary & General)",
      shiftTime: "Morning",
    },
    receptionistDetails: { deskNumber: "Main Counter" },
  };
}

export const initialPatientForm = () => ({
  name: "",
  age: "",
  diagnosis: "",
  assignedDoctor: "",
  wardNumber: "Ward A",
});
export const initialAppointmentForm = () => ({
  patientName: "",
  doctorName: "",
  dateTime: "",
});

export function registrationPayload(form) {
  if (form.password.length < 6)
    throw new Error("Password must be at least 6 characters.");
  if (form.password !== form.confirmPassword)
    throw new Error("Passwords do not match.");
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    role: form.role,
  };
  if (!payload.name || !payload.email || !payload.phone)
    throw new Error("Name, email and phone are required.");
  const detail = {
    Doctor: "doctorDetails",
    Nurse: "nurseDetails",
    Receptionist: "receptionistDetails",
  }[form.role];
  if (detail) payload[detail] = { ...form[detail] };
  return payload;
}

export function patientPayload(form) {
  const payload = { ...form, name: form.name.trim() };
  if (!payload.name) throw new Error("Patient name is required.");
  const age = form.age === "" ? 0 : Number(form.age);
  if (!Number.isFinite(age) || age < 0)
    throw new Error("Patient age must be a non-negative number.");
  return { ...payload, age };
}

export function appointmentPayload(form, now = Date.now()) {
  const date = new Date(form.dateTime);
  if (
    !form.dateTime ||
    !Number.isFinite(date.getTime()) ||
    date.getTime() <= now
  ) {
    throw new Error("Please choose a future appointment date and time.");
  }
  const payload = {
    patientName: form.patientName.trim(),
    doctorName: form.doctorName.trim(),
    dateTime: date.toISOString(),
  };
  if (!payload.patientName || !payload.doctorName)
    throw new Error("Patient and doctor names are required.");
  // Token allocation belongs to the backend; no client-supplied counter is sent.
  return payload;
}

export const registerStaff = (api, form) =>
  api.registerUser(registrationPayload(form));
export const addPatient = (api, form) =>
  api.createPatient(patientPayload(form));
export const addAppointment = (api, form) =>
  api.createAppointment(appointmentPayload(form));

export function createAdminSubmission(onPending) {
  const pending = new Set();
  return async (key, request) => {
    if (pending.has(key)) return { ok: false, busy: true };
    pending.add(key);
    onPending([...pending]);
    try {
      return { ok: true, response: await request() };
    } catch (error) {
      return { ok: false, error };
    } finally {
      pending.delete(key);
      onPending([...pending]);
    }
  };
}

export async function fetchDashboardData(api) {
  const results = await Promise.allSettled([
    api.getPatients(),
    api.getAppointments(),
  ]);
  const data = {},
    errors = [];
  for (const [index, key] of ["patients", "appointments"].entries()) {
    const result = results[index];
    if (result.status === "fulfilled" && Array.isArray(result.value.data))
      data[key] = result.value.data;
    else errors.push(`Unable to load ${key}.`);
  }
  return { data, errors };
}
