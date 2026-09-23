import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export const loginUser = (data) => {
  return api.post("/api/auth/login", data);
};

export const registerUser = (data) => {
  return api.post("/api/auth/register", data);
};

export const getDoctors = () => {
  return api.get("/api/doctors");
};

export const getPatients = (params = {}) => {
  return api.get("/api/patients", { params });
};

export const addPatient = (data) => {
  return api.post("/api/patients", data);
};

export const dischargePatient = (id) => {
  return api.put(`/api/patients/${id}/discharge`);
};

export const getAppointments = (doctor = "") => {
  return api.get("/api/appointments", {
    params: doctor ? { doctor } : {},
  });
};

export const createAppointment = (data) => {
  return api.post("/api/appointments", data);
};

export const getAdminStats = () => {
  return api.get("/api/admin/stats");
};

export default api;