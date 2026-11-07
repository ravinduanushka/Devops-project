import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAdminDashboard from '../features/admin/useAdminDashboard';

function Admin() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    serverStatus,
    serverTimestamp,
    patients,
    appointments,
    loadingData,
    regForm,
    regLoading,
    regSuccess,
    regError,
    newPatient,
    setNewPatient,
    patientLoading,
    newAppt,
    setNewAppt,
    apptLoading,
    notification,
    setNotification,
    loadDashboardData,
    handleRegChange,
    handleRegisterSubmit,
    handleCreatePatientSubmit,
    handleCreateAppointmentSubmit,
  } = useAdminDashboard();

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
                      <label htmlFor="admin-doc-spec">Medical Specialization</label>
                      <input
                        id="admin-doc-spec"
                        type="text"
                        name="doctorDetails.specialization"
                        placeholder="e.g. Cardiology, Paediatrics, Oncology"
                        value={regForm.doctorDetails.specialization}
                        onChange={handleRegChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="admin-doc-room">Assigned Consultation Room</label>
                      <input
                        id="admin-doc-room"
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
                      <label htmlFor="admin-nurse-ward">Assigned Ward</label>
                      <select
                        id="admin-nurse-ward"
                        name="nurseDetails.assignedWard"
                        value={regForm.nurseDetails.assignedWard}
                        onChange={handleRegChange}
                        className="form-select"
                      >
                        <option value="Ward 3B (Pulmonary & General)">Ward 3B (Pulmonary &amp; General)</option>
                        <option value="Ward 2A (Cardiology)">Ward 2A (Cardiology)</option>
                        <option value="Ward 1C (High Dependency)">Ward 1C (High Dependency)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="admin-nurse-shift">Assigned Shift</label>
                      <select
                        id="admin-nurse-shift"
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
                    <label htmlFor="admin-rec-desk">Counter Number</label>
                    <input
                      id="admin-rec-desk"
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
                <span>Token assigned when saved</span>
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
