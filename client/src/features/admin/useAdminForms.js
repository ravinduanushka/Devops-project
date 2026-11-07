import { useState } from "react";
import {
  registerUser,
  createPatient,
  createAppointment,
} from "../../services/api";
import {
  initialRegistrationForm,
  initialPatientForm,
  initialAppointmentForm,
  createAdminSubmission,
  registerStaff,
  addPatient,
  addAppointment,
  errorMessage,
} from "./adminWorkflows";

const api = { registerUser, createPatient, createAppointment };

export default function useAdminForms({ setNotification, loadDashboardData }) {
  const [regForm, setRegForm] = useState(initialRegistrationForm);
  const [newPatient, setNewPatient] = useState(initialPatientForm);
  const [newAppt, setNewAppt] = useState(initialAppointmentForm);
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");
  const [pending, setPending] = useState([]);
  const [submit] = useState(() => createAdminSubmission(setPending));

  const handleRegChange = (event) => {
    const { name, value } = event.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setRegForm((previous) => ({
        ...previous,
        [parent]: { ...previous[parent], [child]: value },
      }));
    } else setRegForm((previous) => ({ ...previous, [name]: value }));
    if (regError) setRegError("");
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegError("");
    setRegSuccess("");
    const result = await submit("registration", () =>
      registerStaff(api, regForm),
    );
    if (result.busy) return;
    if (!result.ok) {
      setRegError(
        errorMessage(
          result.error,
          "Registration failed. Verify server is running and email is not already taken.",
        ),
      );
      return;
    }
    setRegSuccess(
      `Successfully registered ${regForm.role}: ${regForm.name} (${regForm.email})`,
    );
    setRegForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: regForm.role,
      doctorDetails: { specialization: "", roomNo: "" },
      nurseDetails: { assignedWard: "", shiftTime: "Morning" },
      receptionistDetails: { deskNumber: "" },
    });
    // Reload errors use the existing notification banner, not a false registration failure.
    loadDashboardData();
  };

  const handleCreatePatientSubmit = async (event) => {
    event.preventDefault();
    const result = await submit("patient", () => addPatient(api, newPatient));
    if (result.busy) return;
    if (!result.ok) {
      setNotification({
        type: "error",
        message: errorMessage(
          result.error,
          "Failed to add patient. Check fields and assigned doctor ID.",
        ),
      });
      return;
    }
    setNotification({
      type: "success",
      message: `Patient ${newPatient.name} added successfully!`,
    });
    setNewPatient(initialPatientForm());
    loadDashboardData();
  };

  const handleCreateAppointmentSubmit = async (event) => {
    event.preventDefault();
    const result = await submit("appointment", () =>
      addAppointment(api, newAppt),
    );
    if (result.busy) return;
    if (!result.ok) {
      setNotification({
        type: "error",
        message: errorMessage(result.error, "Failed to create appointment."),
      });
      return;
    }
    setNotification({
      type: "success",
      message: `Appointment created for ${newAppt.patientName}!`,
    });
    setNewAppt(initialAppointmentForm());
    loadDashboardData();
  };

  return {
    regForm,
    regLoading: pending.includes("registration"),
    regSuccess,
    regError,
    newPatient,
    setNewPatient,
    patientLoading: pending.includes("patient"),
    newAppt,
    setNewAppt,
    apptLoading: pending.includes("appointment"),
    handleRegChange,
    handleRegisterSubmit,
    handleCreatePatientSubmit,
    handleCreateAppointmentSubmit,
  };
}
