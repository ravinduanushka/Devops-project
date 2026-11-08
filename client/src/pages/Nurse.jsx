import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import useNurseDashboard from '../features/nurse/useNurseDashboard';

function Nurse() {
  const {
    activeNav,
    toastMessage,
    showToast,
    nurseDisplayName,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    activePatient,
    handleOpenCareSheet,
    filteredPatients,
    vitalsInput,
    setVitalsInput,
    vitalTrends,
    handleLogVitals,
    activeRxRecord,
    medSchedule,
    handleMarkMedGiven,
    clinicalNotes,
    setClinicalNotes,
    handoverChecks,
    setHandoverChecks,
    oncomingNurseId,
    setOncomingNurseId,
    handleSubmitHandover,
    scrollToSection,
    handleLogout,
  } = useNurseDashboard();

  return (
    <div className="nurse-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="nurse-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          HERO BANNER
          Uses /nurse.png from public (with fallback to /nurse.jpg)
          NexusHealth logo top-left
          Mr/Ms User pill button positioned directly under heading
          Sign Out button top-right
          ======================================================== */}
      <section className="nurse-hero-section">
        <div className="nurse-hero-container">
          <img
            src="/nurse.png"
            alt="Nursing Care - NexusHealth"
            className="nurse-hero-bg-img"
            onError={(e) => {
              e.currentTarget.src = "/nurse.jpg";
            }}
          />

          {/* NexusHealth Logo in top-left position */}
          <div className="nurse-hero-logo-box">
            <Link to="/" title="Go to Home">
              <img
                src="/health-logo.png"
                alt="NexusHealth Logo"
                className="nurse-hero-logo-img"
                onError={(e) => {
                  if (e.currentTarget.getAttribute("src") !== "/health logo.png") {
                    e.currentTarget.src = "/health logo.png";
                  }
                }}
              />
            </Link>
          </div>

          {/* Top-right Sign Out button */}
          <div className="nurse-hero-top-right">
            <button onClick={handleLogout} className="nurse-logout-pill" title="Sign Out">
              Sign Out
            </button>
          </div>

          {/* Left Text Overlay: Heading & Mr/Ms User badge directly underneath */}
          <div className="nurse-hero-left-overlay">
            <h1 className="nurse-hero-custom-heading">
              Care for<br />
              Little Ones.
            </h1>
            <div className="nurse-hero-btn-wrap">
              <button
                className="nurse-hero-user-badge"
                title="Nurse Profile"
                onClick={() => showToast(`Signed in as ${nurseDisplayName}`)}
              >
                {nurseDisplayName}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          WORKFLOW LAYOUT:
          Unified Background: #DAEFEC with clean border divider
          ======================================================== */}
      <div className="nurse-dashboard-layout">
        {/* LEFT COLUMN: Sidebar Navigation (#DAEFEC) */}
        <aside className="nurse-sidebar-col">
          <nav className="nurse-nav-menu">
            <button
              className={`nurse-nav-item nurse-nav-anim-1 ${activeNav === "WardMonitoring" ? "active" : ""}`}
              onClick={() => scrollToSection("ward-monitoring-card", "WardMonitoring")}
              title="View Inpatient Monitoring"
            >
              <span className="nurse-nav-text">WardMonitoring</span>
              <span className="nurse-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`nurse-nav-item nurse-nav-anim-2 ${activeNav === "VitalRecording" ? "active" : ""}`}
              onClick={() => scrollToSection("vital-recording-card", "VitalRecording")}
              title="Record Patient Vitals"
            >
              <span className="nurse-nav-text">VitalRecording</span>
              <span className="nurse-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`nurse-nav-item nurse-nav-anim-3 ${activeNav === "MedAdministration" ? "active" : ""}`}
              onClick={() => scrollToSection("med-administration-card", "MedAdministration")}
              title="Medication Administration"
            >
              <span className="nurse-nav-text">MedAdministration</span>
              <span className="nurse-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`nurse-nav-item nurse-nav-anim-4 ${activeNav === "ShiftHandover" ? "active" : ""}`}
              onClick={() => scrollToSection("shift-handover-card", "ShiftHandover")}
              title="Shift Handover Report"
            >
              <span className="nurse-nav-text">ShiftHandover</span>
              <span className="nurse-nav-indicator" aria-hidden="true">›</span>
            </button>
          </nav>
        </aside>

        {/* RIGHT COLUMN: 4 Workflow Dashboard Cards (#DAEFEC) */}
        <main className="nurse-main-col">
          <div className="nurse-cards-stream">
            {/* ----------------------------------------------------
                WORKFLOW STEP 1: WARD MONITORING (Matching Image 1)
                - Inpatient list across beds
                - Real-time condition badges & bed stats
                ---------------------------------------------------- */}
            <div id="ward-monitoring-card" className="nurse-card">
              <h2 className="nurse-card-title">Ward 3B - Inpatient Monitoring</h2>

              {/* Status Stats Badges */}
              <div className="nurse-ward-stats-strip">
                <span className="nurse-stat-pill stat-occupied">
                  Occupied Beds: <strong>28/32</strong>
                </span>
                <span className="nurse-stat-pill stat-critical">
                  Critical Watch: <strong>2</strong>
                </span>
                <span className="nurse-stat-pill stat-discharge">
                  Pending Discharge: <strong>3</strong>
                </span>
              </div>

              {/* Search & Filter Bar */}
              <div className="nurse-search-filter-row">
                <div className="nurse-search-input-box">
                  <span className="nurse-search-icon" aria-hidden="true">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by patient, bed, or doctor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="nurse-search-input"
                  />
                </div>

                <div className="nurse-filter-box">
                  <select
                    className="nurse-filter-select"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="All">Filters ⌵</option>
                    <option value="Stable">Stable</option>
                    <option value="Under Observation">Under Observation</option>
                    <option value="Guarded">Guarded</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Inpatients Table */}
              <div className="nurse-table-scroll">
                <table className="nurse-clean-table">
                  <thead>
                    <tr>
                      <th>Bed No</th>
                      <th>Patient Name</th>
                      <th>Admission Date</th>
                      <th>Condition</th>
                      <th>Attending Physician</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((item) => (
                      <tr key={item.bedNo}>
                        <td className="nurse-td-bed">{item.bedNo}</td>
                        <td className="nurse-td-name">{item.patientName}</td>
                        <td>{item.admissionDate}</td>
                        <td>
                          <span className={`nurse-badge-cond ${item.conditionColor}`}>
                            {item.condition}
                          </span>
                        </td>
                        <td>{item.attendingPhysician}</td>
                        <td>
                          <button
                            className="nurse-btn-open-care"
                            onClick={() => handleOpenCareSheet(item)}
                          >
                            Open Care Sheet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 2: VITAL RECORDING (Matching Doctor/Patient style)
                - Logs BP, Heart Rate, Temperature, SpO2
                - Historical vitals trends
                ---------------------------------------------------- */}
            <div id="vital-recording-card" className="nurse-card">
              <h2 className="nurse-card-title">Record Patient Vital Signs</h2>

              {/* Header Info Strip */}
              <div className="nurse-patient-strip">
                <div className="nurse-patient-meta">
                  <strong>{activePatient.patientName} ({activePatient.bedNo}, PID: {activePatient.pid})</strong> &bull; {activePatient.age} Yrs / {activePatient.gender} &bull; Blood: {activePatient.bloodGroup}
                </div>
                <div className="nurse-allergy-badge">
                  Allergy: {activePatient.allergy}
                </div>
              </div>

              {/* Form Subcard */}
              <div className="nurse-vitals-subcard">
                <form onSubmit={handleLogVitals}>
                  <div className="nurse-vitals-form-grid">
                    {/* Row 1: BP & Heart Rate */}
                    <div className="nurse-form-unit">
                      <label>Blood Pressure</label>
                      <div className="nurse-bp-input-pair">
                        <input
                          type="number"
                          className="nurse-form-control-unit"
                          value={vitalsInput.bpSys}
                          onChange={(e) => setVitalsInput({ ...vitalsInput, bpSys: e.target.value })}
                          required
                        />
                        <span className="nurse-bp-slash">/</span>
                        <input
                          type="number"
                          className="nurse-form-control-unit"
                          value={vitalsInput.bpDia}
                          onChange={(e) => setVitalsInput({ ...vitalsInput, bpDia: e.target.value })}
                          required
                        />
                        <span className="nurse-unit-suffix">mmHg</span>
                      </div>
                    </div>

                    <div className="nurse-form-unit">
                      <label>Heart Rate</label>
                      <div className="nurse-single-input-suffix">
                        <input
                          type="number"
                          className="nurse-form-control"
                          value={vitalsInput.heartRate}
                          onChange={(e) => setVitalsInput({ ...vitalsInput, heartRate: e.target.value })}
                          required
                        />
                        <span className="nurse-unit-suffix">bpm</span>
                      </div>
                    </div>

                    {/* Row 2: Body Temp & SpO2 */}
                    <div className="nurse-form-unit">
                      <label>Body Temperature</label>
                      <div className="nurse-single-input-suffix">
                        <input
                          type="text"
                          className="nurse-form-control"
                          value={vitalsInput.temperature}
                          onChange={(e) => setVitalsInput({ ...vitalsInput, temperature: e.target.value })}
                          required
                        />
                        <span className="nurse-unit-suffix">°F</span>
                      </div>
                    </div>

                    <div className="nurse-form-unit">
                      <label>Oxygen (SpO2)</label>
                      <div className="nurse-single-input-suffix">
                        <input
                          type="number"
                          className="nurse-form-control"
                          value={vitalsInput.spO2}
                          onChange={(e) => setVitalsInput({ ...vitalsInput, spO2: e.target.value })}
                          required
                        />
                        <span className="nurse-unit-suffix">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Historical Trends & Submit Button */}
                  <div className="nurse-vitals-footer-flex">
                    <div className="nurse-trends-box">
                      <span className="nurse-trends-label">Historical Trends:</span>
                      <div className="nurse-trends-chips">
                        {vitalTrends.map((trend, idx) => (
                          <span key={idx} className="nurse-trend-chip">
                            {trend}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="nurse-btn-log-vitals">
                      Log Vital Signs
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 3: MED ADMINISTRATION (Matching Doctor/Patient style)
                - Active Medication Schedule
                - Administer and verify dosages
                ---------------------------------------------------- */}
            <div id="med-administration-card" className="nurse-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                <h2 className="nurse-card-title" style={{ margin: 0 }}>Medication Administration &amp; Pharmacy Dispensing</h2>
                <span style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "12px", background: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}>
                  Hospital Pharmacy Sync: Active
                </span>
              </div>

              {/* Header Strip */}
              <div className="nurse-med-schedule-strip">
                Active Medication Schedule &bull; Ward 3B / {activePatient.bedNo} ({activePatient.patientName} &bull; PID: {activePatient.pid})
              </div>

              {/* Digital Prescription Order Banner if arrived from Doctor */}
              {activeRxRecord && (
                <div style={{
                  margin: "12px 0 16px 0",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px"
                }}>
                  <div style={{ fontSize: "0.875rem", color: "#166534" }}>
                    <span style={{ fontWeight: 700, marginRight: "6px" }}> Digital Rx Order #{activeRxRecord.orderId || "RX-1042"}:</span>
                    Prescribed by <strong>{activeRxRecord.doctorName || "Dr. Vance"}</strong> for <strong>{activeRxRecord.patientName || "Kamal Perera"}</strong> &bull; <em>Diagnosis: {activeRxRecord.diagnosis || "Acute bronchitis with mild bronchial irritation"}</em>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: medSchedule.every((m) => m.isAdministered) ? "#16a34a" : "#0284c7",
                    color: "#ffffff"
                  }}>
                    {medSchedule.every((m) => m.isAdministered) ? "✓ Dispensed & Administered" : "Ready for Dispensing Verification"}
                  </span>
                </div>
              )}

              {/* Subcard Table */}
              <div className="nurse-med-subcard">
                <div className="nurse-table-scroll">
                  <table className="nurse-clean-table">
                    <thead>
                      <tr>
                        <th>Scheduled Time</th>
                        <th>Medication Name</th>
                        <th>Dosage</th>
                        <th>Doctor Instructions</th>
                        <th>Nurse Verification</th>
                        <th>Status / Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medSchedule.map((med) => (
                        <tr key={med.id}>
                          <td className="nurse-td-time">{med.scheduledTime}</td>
                          <td className="nurse-td-med">{med.medName}</td>
                          <td>{med.dosage}</td>
                          <td>{med.instructions}</td>
                          <td className="nurse-td-verify">{med.nurseVerification}</td>
                          <td>
                            {med.isAdministered ? (
                              <span className="nurse-badge-administered">
                                Administered
                              </span>
                            ) : (
                              <button
                                className="nurse-btn-mark-given"
                                onClick={() => handleMarkMedGiven(med.id)}
                              >
                                Mark Given
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 4: SHIFT HANDOVER (Matching Doctor/Patient style)
                - Ward Clinical Notes & Summary
                - Checklist and oncoming nurse acknowledgment
                ---------------------------------------------------- */}
            <div id="shift-handover-card" className="nurse-card">
              <h2 className="nurse-card-title">Shift Handover & Clinical Notes</h2>

              {/* Top Shift Status Strip */}
              <div className="nurse-handover-header-strip">
                Shift Handover Summary &bull; Day Shift (07:00 AM - 03:00 PM) &bull; Duty Nurse: {nurseDisplayName}
              </div>

              <div className="nurse-handover-subcard">
                <form onSubmit={handleSubmitHandover}>
                  <div className="nurse-handover-grid">
                    {/* Left: Ward 3B Clinical Notes */}
                    <div className="nurse-handover-notes-col">
                      <label className="nurse-handover-label">Ward 3B Clinical Notes</label>
                      <textarea
                        rows="5"
                        className="nurse-handover-textarea"
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="Enter clinical handover notes..."
                      />
                    </div>

                    {/* Right: Pending Handover Checklist */}
                    <div className="nurse-handover-checklist-col">
                      <label className="nurse-handover-label">Pending Handover Checklist</label>

                      <div className="nurse-checklist-items">
                        <label className="nurse-checkbox-label">
                          <input
                            type="checkbox"
                            checked={handoverChecks.reportDone}
                            onChange={(e) =>
                              setHandoverChecks({ ...handoverChecks, reportDone: e.target.checked })
                            }
                          />
                          <span>Handover report completed</span>
                        </label>

                        <label className="nurse-checkbox-label">
                          <input
                            type="checkbox"
                            checked={handoverChecks.vitalsDone}
                            onChange={(e) =>
                              setHandoverChecks({ ...handoverChecks, vitalsDone: e.target.checked })
                            }
                          />
                          <span>02:00 PM Vitals check for Bed-07</span>
                        </label>

                        <label className="nurse-checkbox-label">
                          <input
                            type="checkbox"
                            checked={handoverChecks.fastingPrep}
                            onChange={(e) =>
                              setHandoverChecks({ ...handoverChecks, fastingPrep: e.target.checked })
                            }
                          />
                          <span>Fasting blood draw preparation for Bed-09</span>
                        </label>
                      </div>

                      {/* Oncoming Nurse Acknowledgment */}
                      <div className="nurse-acknowledgment-box">
                        <label className="nurse-ack-label">
                          Oncoming Nurse Acknowledgment (Signature / ID Input)
                        </label>
                        <div className="nurse-ack-input-row">
                          <input
                            type="text"
                            placeholder="Enter Nurse ID (e.g. N-2045)"
                            className="nurse-ack-input"
                            value={oncomingNurseId}
                            onChange={(e) => setOncomingNurseId(e.target.value)}
                          />
                          <span className="nurse-ack-tag">ID</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="nurse-handover-actions">
                    <button
                      type="button"
                      className="nurse-btn-cancel-handover"
                      onClick={() => showToast("Handover draft preserved.")}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="nurse-btn-submit-handover">
                      ✓ Submit Handover Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER: Identical style to previous pages */}
      <Footer />
    </div>
  );
}

export default Nurse;
