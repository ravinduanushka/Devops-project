import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const loginUser = (credentials) => api.post('/api/auth/login', credentials);
export const registerUser = (userData) => api.post('/api/auth/register', userData);
export const getPatients = () => api.get('/api/patients');
export const createPatient = (patientData) => api.post('/api/patients', patientData);
export const getAppointments = () => api.get('/api/appointments');
export const createAppointment = (appointmentData) => api.post('/api/appointments', appointmentData);
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data);
export const updateAppointment = (id, data) => api.put(`/api/appointments/${id}`, data);
export const getPrescriptions = () => api.get('/api/prescriptions');
export const createPrescription = (prescriptionData) => api.post('/api/prescriptions', prescriptionData);
export const updatePrescription = (id, data) => api.put(`/api/prescriptions/${id}`, data);
export const getAdmissions = () => api.get('/api/admissions');
export const createAdmission = (admissionData) => api.post('/api/admissions', admissionData);
export const updateAdmission = (id, data) => api.put(`/api/admissions/${id}`, data);
export const checkHealth = () => api.get('/health');

export default api;