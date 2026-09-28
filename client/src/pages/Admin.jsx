import { useState, useEffect, useCallback } from "react";
import {
  registerUser,
  getPatients,
  createPatient,
  getAppointments,
  createAppointment,
  checkHealth
} from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Admin() {
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("register"); // 'register' | 'patients' | 'appointments' | 'overview'

  // Server health state
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [serverTimestamp, setServerTimestamp] = useState("");

  // Data states
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Admin user registration form
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Doctor",
    doctorDetails: {
      specialization: "General Medicine",
      roomNo: "101"
    },
    nurseDetails: {
      assignedWard: "General Ward A",
      shiftTime: "Morning"
    },
    receptionistDetails: {
      deskNumber: "Main Counter"
    }
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");

  // New patient form
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    diagnosis: "",
    assignedDoctor: "",
    wardNumber: "Ward A"
  });
  const [patientLoading, setPatientLoading] = useState(false);

  // New appointment form
  const [newAppt, setNewAppt] = useState({
    patientName: "",
    doctorName: "",
    dateTime: "",
    tokenNumber: 1
  });
  const [apptLoading, setApptLoading] = useState(false);

  // Notifications
  const [notification, setNotification] = useState({ type: "", message: "" });

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [patientsRes, apptsRes] = await Promise.allSettled([
        getPatients(),
        getAppointments()
      ]);

      if (patientsRes.status === "fulfilled") {
        setPatients(Array.isArray(patientsRes.value.data) ? patientsRes.value.data : []);
      }
      if (apptsRes.status === "fulfilled") {
        setAppointments(Array.isArray(apptsRes.value.data) ? apptsRes.value.data : []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const res = await checkHealth();
        if (active) {
          if (res.data?.status === "UP") {
            setServerStatus("ONLINE (UP)");
            setServerTimestamp(new Date(res.data.timestamp || Date.now()).toLocaleTimeString());
          } else {
            setServerStatus("UNKNOWN");
          }
        }
      } catch {
        if (active) {
          setServerStatus("OFFLINE / DISCONNECTED");
        }
      }

      try {
        const [patientsRes, apptsRes] = await Promise.allSettled([
          getPatients(),
          getAppointments()
        ]);
        if (active) {
          if (patientsRes.status === "fulfilled") {
            setPatients(Array.isArray(patientsRes.value.data) ? patientsRes.value.data : []);
          }
          if (apptsRes.status === "fulfilled") {
            setAppointments(Array.isArray(apptsRes.value.data) ? apptsRes.value.data : []);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setRegForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setRegForm((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    if (regError) setRegError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess("");

    if (regForm.password.length < 6) {
      setRegError("Password must be at least 6 characters.");
      setRegLoading(false);
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError("Passwords do not match.");
      setRegLoading(false);
      return;
    }

    try {
      const payload = {
        name: regForm.name.trim(),
        email: regForm.email.trim(),
        phone: regForm.phone.trim(),
        password: regForm.password,
        confirmPassword: regForm.confirmPassword,
        role: regForm.role
      };

      if (regForm.role === "Doctor") {
        payload.doctorDetails = regForm.doctorDetails;
      } else if (regForm.role === "Nurse") {
        payload.nurseDetails = regForm.nurseDetails;
      } else if (regForm.role === "Receptionist") {
        payload.receptionistDetails = regForm.receptionistDetails;
      }

      await registerUser(payload);
      setRegSuccess(`Successfully registered ${regForm.role}: ${regForm.name} (${regForm.email})`);

      // Reset form
      setRegForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: regForm.role,
        doctorDetails: { specialization: "", roomNo: "" },
        nurseDetails: { assignedWard: "", shiftTime: "Morning" },
        receptionistDetails: { deskNumber: "" }
      });

      // Reload patients
      loadDashboardData();
    } catch (err) {
      setRegError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration failed. Verify server is running and email is not already taken."
      );
    } finally {
      setRegLoading(false);
    }
  };

  const handleCreatePatientSubmit = async (e) => {
    e.preventDefault();
    setPatientLoading(true);
    try {
      await createPatient(newPatient);
      setNotification({ type: "success", message: `Patient ${newPatient.name} added successfully!` });
      setNewPatient({ name: "", age: "", diagnosis: "", assignedDoctor: "", wardNumber: "Ward A" });
      loadDashboardData();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.error || "Failed to add patient. Check fields and assigned doctor ID."
      });
    } finally {
      setPatientLoading(false);
    }
  };

  const handleCreateAppointmentSubmit = async (e) => {
    e.preventDefault();
    setApptLoading(true);
    try {
      await createAppointment(newAppt);
      setNotification({ type: "success", message: `Appointment created for ${newAppt.patientName}!` });
      setNewAppt({ patientName: "", doctorName: "", dateTime: "", tokenNumber: appointments.length + 1 });
      loadDashboardData();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.error || "Failed to create appointment."
      });
    } finally {
      setApptLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="admin-container">
        {/* Top Header */}
        <div className="admin-header-bar">
          <div className="admin-header-left">
            <h1 className="admin-title">Hospital Administration</h1>
            <p className="admin-subtitle">
              Manage system staff, register doctors, nurses, patients, and oversee clinical records.
            </p>
          </div>

          <div className="admin-header-right">
            <div className={`server-status-pill ${serverStatus.includes("ONLINE") ? "status-online" : "status-offline"}`}>
              <span className="status-dot"></span>
              <span>Backend: {serverStatus}</span>
              {serverTimestamp && <span className="status-time">({serverTimestamp})</span>}
            </div>
            <button onClick={loadDashboardData} className="btn-refresh" title="Refresh Data">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {notification.message && (
          <div className={`alert-box alert-${notification.type}`} style={{ marginBottom: "20px" }}>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ type: "", message: "" })}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: "#e6fffa", color: "#00a884" }}>
              👥
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">{patients.length}</span>
              <span className="stat-card-title">Registered Patients</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
              📅
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">{appointments.length}</span>
              <span className="stat-card-title">Scheduled Appointments</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
              🛡️
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">Admin Portal</span>
              <span className="stat-card-title">
                {currentUser ? `${currentUser.name} (${currentUser.role})` : "Session Active"}
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
              ⚡
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">Server Connected</span>
              <span className="stat-card-title">Port 5000 / Mongo Database</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tab-nav">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            ➕ Register People / Staff
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "patients" ? "active" : ""}`}
            onClick={() => setActiveTab("patients")}
          >
            🏥 Patients Directory ({patients.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            📋 Appointments ({appointments.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Quick Operations
          </button>
        </div>

        {/* TAB 1: REGISTER PEOPLES */}
        {activeTab === "register" && (
          <div className="admin-panel-card">
            <div className="panel-header">
              <div className="panel-header-info">
                <h2 className="panel-title">Register New People & Personnel</h2>
                <p className="panel-description">
                  As an Administrator, you can register new Doctors, Nurses, Receptionists, Patients, and fellow Administrators.
                  All entries are securely encrypted and stored directly in the database.
                </p>
              </div>
            </div>

            {regError && (
              <div className="alert-box alert-error" role="alert">
                <span className="alert-icon">⚠️</span>
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="alert-box alert-success" role="alert">
                <span className="alert-icon">✅</span>
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="admin-reg-form">
              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="reg-people-role">Select Role to Register *</label>
                  <select
                    id="reg-people-role"
                    name="role"
                    value={regForm.role}
                    onChange={handleRegChange}
                    className="form-select"
                  >
                    <option value="Doctor">Doctor (Specialist / Consultant)</option>
                    <option value="Nurse">Nurse (Inpatient / Clinical)</option>
                    <option value="Receptionist">Receptionist (Front Desk)</option>
                    <option value="Patient">Patient</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-people-name">Full Name *</label>
                  <input
                    id="reg-people-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Dr. Arthur Conan / Alice Walker"
                    value={regForm.name}
                    onChange={handleRegChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-people-email">Email Address (Login Username) *</label>
                  <input
                    id="reg-people-email"
                    type="email"
                    name="email"
                    placeholder="person@nexushealth.com"
                    value={regForm.email}
                    onChange={handleRegChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="reg-people-phone">Phone Number *</label>
                  <input
                    id="reg-people-phone"
                    type="tel"
                    name="phone"
                    placeholder="091-9118207 / +94..."
                    value={regForm.phone}
                    onChange={handleRegChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-people-password">Temporary Password *</label>
                  <input
                    id="reg-people-password"
                    type="password"
                    name="password"
                    placeholder="min 6 characters"
                    value={regForm.password}
                    onChange={handleRegChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-people-confirm">Confirm Password *</label>
                  <input
                    id="reg-people-confirm"
                    type="password"
                    name="confirmPassword"
                    placeholder="confirm password"
                    value={regForm.confirmPassword}
                    onChange={handleRegChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Dynamic Role Details */}
              {regForm.role === "Doctor" && (
                <div className="role-specific-box">
                  <h4 className="role-box-title">Doctor Credentials</h4>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Medical Specialization</label>
                      <input
                        type="text"
                        name="doctorDetails.specialization"
                        placeholder="e.g. Cardiology, Paediatrics, Oncology"
                        value={regForm.doctorDetails.specialization}
                        onChange={handleRegChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Assigned Consultation Room</label>
                      <input
                        type="text"
                        name="doctorDetails.roomNo"
                        placeholder="e.g. Room 405"
                        value={regForm.doctorDetails.roomNo}
                        onChange={handleRegChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {regForm.role === "Nurse" && (
                <div className="role-specific-box">
                  <h4 className="role-box-title">Nurse Assignment</h4>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Assigned Ward</label>
                      <input
                        type="text"
                        name="nurseDetails.assignedWard"
                        placeholder="e.g. Ward C - Post Surgery"
                        value={regForm.nurseDetails.assignedWard}
                        onChange={handleRegChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Assigned Shift</label>
                      <select
                        name="nurseDetails.shiftTime"
                        value={regForm.nurseDetails.shiftTime}
                        onChange={handleRegChange}
                        className="form-select"
                      >
                        <option value="Morning">Morning Shift (07:00 - 15:00)</option>
                        <option value="Evening">Evening Shift (15:00 - 23:00)</option>
                        <option value="Night">Night Shift (23:00 - 07:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {regForm.role === "Receptionist" && (
                <div className="role-specific-box">
                  <h4 className="role-box-title">Desk Station</h4>
                  <div className="form-group">
                    <label>Counter Number</label>
                    <input
                      type="text"
                      name="receptionistDetails.deskNumber"
                      placeholder="e.g. Front Reception Counter #2"
                      value={regForm.receptionistDetails.deskNumber}
                      onChange={handleRegChange}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-submit-row">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="btn btn-primary"
                  style={{ minWidth: "200px" }}
                >
                  {regLoading ? "Registering Person..." : `Register ${regForm.role}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: PATIENTS DIRECTORY */}
        {activeTab === "patients" && (
          <div className="admin-panel-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Patients Directory</h2>
                <p className="panel-description">List of admitted and registered patients in the hospital system.</p>
              </div>
            </div>

            {/* Quick Add Patient Form */}
            <div className="inline-add-section">
              <h3 className="section-subtitle">Admit / Add Patient Record</h3>
              <form onSubmit={handleCreatePatientSubmit} className="inline-form">
                <input
                  type="text"
                  placeholder="Patient Name *"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Age *"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  required
                  className="form-input"
                  style={{ maxWidth: "100px" }}
                />
                <input
                  type="text"
                  placeholder="Diagnosis / Condition *"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Ward Number (e.g. Ward 3)"
                  value={newPatient.wardNumber}
                  onChange={(e) => setNewPatient({ ...newPatient, wardNumber: e.target.value })}
                  required
                  className="form-input"
                />
                <button type="submit" disabled={patientLoading} className="btn btn-primary">
                  {patientLoading ? "Adding..." : "+ Admit Patient"}
                </button>
              </form>
            </div>

            {/* Patients Table */}
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age</th>
                    <th>Diagnosis</th>
                    <th>Ward</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-empty">
                        {loadingData ? "Loading patients..." : "No patients found. Add a patient above or via the API."}
                      </td>
                    </tr>
                  ) : (
                    patients.map((pt, idx) => (
                      <tr key={pt._id || idx}>
                        <td className="font-semibold">{pt.name}</td>
                        <td>{pt.age}</td>
                        <td>
                          <span className="diagnosis-tag">{pt.diagnosis}</span>
                        </td>
                        <td>{pt.wardNumber || "N/A"}</td>
                        <td>{pt.assignedDoctor?.name || "Dr. Specialist"}</td>
                        <td>
                          <span className={`status-badge ${pt.status === "Discharged" ? "badge-inactive" : "badge-active"}`}>
                            {pt.status || "Admitted"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="admin-panel-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Appointments Schedule</h2>
                <p className="panel-description">Manage specialist doctor consultations and patient queue tokens.</p>
              </div>
            </div>

            {/* Add Appointment Form */}
            <div className="inline-add-section">
              <h3 className="section-subtitle">Schedule New Appointment</h3>
              <form onSubmit={handleCreateAppointmentSubmit} className="inline-form">
                <input
                  type="text"
                  placeholder="Patient Name *"
                  value={newAppt.patientName}
                  onChange={(e) => setNewAppt({ ...newAppt, patientName: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Doctor Name *"
                  value={newAppt.doctorName}
                  onChange={(e) => setNewAppt({ ...newAppt, doctorName: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="datetime-local"
                  value={newAppt.dateTime}
                  onChange={(e) => setNewAppt({ ...newAppt, dateTime: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Token #"
                  value={newAppt.tokenNumber}
                  onChange={(e) => setNewAppt({ ...newAppt, tokenNumber: e.target.value })}
                  required
                  className="form-input"
                  style={{ maxWidth: "100px" }}
                />
                <button type="submit" disabled={apptLoading} className="btn btn-primary">
                  {apptLoading ? "Scheduling..." : "+ Create Appointment"}
                </button>
              </form>
            </div>

            {/* Appointments Table */}
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Patient Name</th>
                    <th>Assigned Doctor</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="table-empty">
                        {loadingData ? "Loading appointments..." : "No appointments found. Create one above."}
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt, idx) => (
                      <tr key={apt._id || idx}>
                        <td>
                          <span className="token-badge">#{apt.tokenNumber}</span>
                        </td>
                        <td className="font-semibold">{apt.patientName}</td>
                        <td>{apt.doctorName}</td>
                        <td>{new Date(apt.dateTime).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: QUICK OPERATIONS */}
        {activeTab === "overview" && (
          <div className="admin-panel-card">
            <h2 className="panel-title">System & Operational Shortcuts</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Quick Register</h3>
                <p>Register a doctor or clinical specialist in 30 seconds.</p>
                <button className="btn btn-outline" onClick={() => setActiveTab("register")}>
                  Open Registration
                </button>
              </div>
              <div className="overview-card">
                <h3>Patient Records</h3>
                <p>Access current inpatient list and medical observation statuses.</p>
                <button className="btn btn-outline" onClick={() => setActiveTab("patients")}>
                  View Patients
                </button>
              </div>
              <div className="overview-card">
                <h3>Doctor Consultations</h3>
                <p>Check queue tokens and appointment slots for today.</p>
                <button className="btn btn-outline" onClick={() => setActiveTab("appointments")}>
                  Manage Queue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Admin;
