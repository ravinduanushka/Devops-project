import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function Doctor() {
  const navigate = useNavigate();

  // Retrieve logged-in doctor if available
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Active section for sidebar highlighting and scrolling
  const [activeNav, setActiveNav] = useState("PatientQueue");

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // ==========================================
  // SECTION 1: Patient Queue State
  // ==========================================
  const [nowServing, setNowServing] = useState({
    token: "04",
    patientName: "Elena Rostova",
    age: 34,
    room: "02"
  });

  const [queueList, setQueueList] = useState([
    {
      token: "#05",
      patientName: "Liam Carter",
      age: 46,
      estimatedTime: "10:15 AM",
      status: "In Consultation",
      statusColor: "status-teal"
    },
    {
      token: "#06",
      patientName: "Sophia Patel",
      age: 29,
      estimatedTime: "10:30 AM",
      status: "Waiting",
      statusColor: "status-mint"
    },
    {
      token: "#07",
      patientName: "Marcus Thompson",
      age: 58,
      estimatedTime: "11:00 AM",
      status: "Scheduled",
      statusColor: "status-blue"
    }
  ]);

  const handleCallNext = () => {
    if (queueList.length > 0) {
      const next = queueList[0];
      setNowServing({
        token: next.token.replace("#", ""),
        patientName: next.patientName,
        age: next.age,
        room: "02"
      });
      setQueueList(queueList.slice(1));
      showToast(`Now serving Token ${next.token}: ${next.patientName}`);
    } else {
      showToast("No more waiting patients in queue.");
    }
  };

  const handleHold = () => {
    showToast(`Token #${nowServing.token} (${nowServing.patientName}) placed on Hold.`);
  };

  const handleComplete = () => {
    showToast(`Token #${nowServing.token} (${nowServing.patientName}) consultation completed!`);
  };

  const handleCheckIn = (token) => {
    showToast(`Patient with token ${token} checked in successfully!`);
    setQueueList((prev) =>
      prev.map((item) =>
        item.token === token ? { ...item, status: "In Consultation", statusColor: "status-teal" } : item
      )
    );
  };

  // ==========================================
  // SECTION 2: Inpatient Ward State
  // ==========================================
  const [wardTab, setWardTab] = useState("Ward Rounds"); // "Overview" | "Ward Rounds"
  const [wardPatients, setWardPatients] = useState([
    {
      id: 1,
      bedNo: "201-A",
      patientName: "Liam Carter",
      admissionDate: "Oct 12, 2026",
      condition: "Stable",
      conditionColor: "cond-stable",
      nurseSummary: "Post-op recovery, vitals stable",
      actionType: "notes"
    },
    {
      id: 2,
      bedNo: "201-B",
      patientName: "Sophia Patel",
      admissionDate: "Oct 14, 2026",
      condition: "Guarded",
      conditionColor: "cond-guarded",
      nurseSummary: "Awaiting labs, mild pain",
      actionType: "discharge"
    },
    {
      id: 3,
      bedNo: "203-A",
      patientName: "Marcus Thompson",
      admissionDate: "Oct 15, 2026",
      condition: "Critical",
      conditionColor: "cond-critical",
      nurseSummary: "On oxygen, close monitoring",
      actionType: "discharge"
    }
  ]);

  const handleApproveDischarge = (patientName) => {
    showToast(`Discharge approved for ${patientName}`);
    setWardPatients((prev) =>
      prev.map((p) => (p.patientName === patientName ? { ...p, condition: "Discharged", conditionColor: "cond-discharged" } : p))
    );
  };

  // ==========================================
  // SECTION 3: Create New Prescription State
  // ==========================================
  const [rxPatient, setRxPatient] = useState({
    name: "Elena Rostova",
    age: "34",
    gender: "Female",
    patientId: "#P-88210"
  });

  const [currentMedInput, setCurrentMedInput] = useState({
    name: "Amoxicillin",
    dosage: "500 mg",
    frequency: "Twice daily",
    duration: "7 days"
  });

  const [medicationsList, setMedicationsList] = useState([
    { id: 1, name: "Ibuprofen", dosage: "400 mg", frequency: "Once daily", duration: "5 days" },
    { id: 2, name: "Metformin", dosage: "500 mg", frequency: "Twice daily", duration: "14 days" }
  ]);

  const [diagnostics, setDiagnostics] = useState({
    bloodTests: true,
    urineTest: false,
    xRay: false,
    ecg: false
  });

  const [followUpAdvice, setFollowUpAdvice] = useState(
    "Take after meals. Drink plenty of water. Schedule a follow-up in 2 weeks."
  );

  const handleAddMedication = () => {
    if (!currentMedInput.name.trim()) return;
    setMedicationsList([
      ...medicationsList,
      {
        id: Date.now(),
        name: currentMedInput.name,
        dosage: currentMedInput.dosage,
        frequency: currentMedInput.frequency,
        duration: currentMedInput.duration
      }
    ]);
    showToast(`Added ${currentMedInput.name} to prescription.`);
  };

  const handleRemoveMedication = (id) => {
    setMedicationsList(medicationsList.filter((m) => m.id !== id));
  };

  const handleSavePrescription = () => {
    showToast(`Prescription issued successfully for ${rxPatient.name} (${rxPatient.patientId})!`);
  };

  const handleCancelPrescription = () => {
    showToast("Prescription draft cleared.");
  };

  // ==========================================
  // SECTION 4: Medical Records State
  // ==========================================
  const [symptomsText, setSymptomsText] = useState(
    "Patient reports persistent mild chest tightness, slight shortness of breath when walking."
  );
  const [diagnosisText, setDiagnosisText] = useState(
    "Suspected mild respiratory or cardiac effort under-exertion. Further testing required."
  );
  const [vitalsData, setVitalsData] = useState({
    bp: "120/80 mmHg",
    pulse: "78 bpm",
    temp: "99.4°F"
  });

  const handleSaveClinicalNotes = () => {
    showToast("Clinical notes and vitals saved successfully for Kamal Perera!");
  };

  const scrollToSection = (id, navName) => {
    setActiveNav(navName);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nexus_user");
    navigate("/login");
  };

  const doctorDisplayName = currentUser?.name ? `Dr.${currentUser.name}` : "Dr.user";

  return (
    <div className="doc-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="doc-toast-notification">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          HERO BANNER (MATCHING FIGMA & USER IMAGE)
          Uses /doctor-page.jpg or 'doctor page .jpg' from public
          ======================================================== */}
      <section className="doc-hero-section">
        <div className="doc-hero-container">
          <img
            src="/doctor-page.jpg"
            alt="Doctor Consultation and Healthcare"
            className="doc-hero-bg-img"
            onError={(e) => {
              e.currentTarget.src = "/doctor page .jpg";
            }}
          />

          {/* NexusHealth Logo in top-left position matching Image 1 */}
          <div className="doc-hero-logo-box">
            <Link to="/" title="Go to Home">
              <img
                src="/health-logo.png"
                alt="NexusHealth Logo"
                className="doc-hero-logo-img"
                onError={(e) => {
                  e.currentTarget.src = "/health logo.png";
                }}
              />
            </Link>
          </div>

          {/* Top-right quick actions (Doctor status & Logout) */}
          <div className="doc-hero-top-right">
            <span className="doc-online-badge">● Online</span>
            <button onClick={handleLogout} className="doc-logout-pill" title="Sign Out">
              Sign Out
            </button>
          </div>

          {/* Dr.user pill button overlaid on the image, exactly matching Image 1 */}
          <div className="doc-hero-user-badge-container">
            <button
              className="doc-hero-user-badge"
              title="Doctor Profile"
              onClick={() => showToast(`Logged in as ${doctorDisplayName}`)}
            >
              {doctorDisplayName}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          MAIN BODY LAYOUT: Light teal mint background with
          Left Sidebar Navigation + 4 Detailed Dashboard Cards
          ======================================================== */}
      <div className="doc-dashboard-layout">
        <div className="doc-dashboard-inner">
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="doc-sidebar">
            <nav className="doc-nav-menu">
              <button
                className={`doc-nav-item ${activeNav === "PatientQueue" ? "active" : ""}`}
                onClick={() => scrollToSection("patient-queue-card", "PatientQueue")}
              >
                PatientQueue
              </button>

              <button
                className={`doc-nav-item ${activeNav === "WardRounds" ? "active" : ""}`}
                onClick={() => scrollToSection("ward-rounds-card", "WardRounds")}
              >
                WardRounds
              </button>

              <button
                className={`doc-nav-item ${activeNav === "Prescriptions" ? "active" : ""}`}
                onClick={() => scrollToSection("prescriptions-card", "Prescriptions")}
              >
                Prescriptions
              </button>

              <button
                className={`doc-nav-item ${activeNav === "MedicalRecords" ? "active" : ""}`}
                onClick={() => scrollToSection("medical-records-card", "MedicalRecords")}
              >
                MedicalRecords
              </button>
            </nav>
          </aside>

          {/* RIGHT MAIN CONTENT CARDS */}
          <main className="doc-cards-stream">
            {/* ----------------------------------------------------
                CARD 1: Patient Queue (Matching Image 1)
                ---------------------------------------------------- */}
            <div id="patient-queue-card" className="doc-card">
              <h2 className="doc-card-title">Patient Queue</h2>

              {/* Now Serving Highlight Strip */}
              <div className="doc-serving-strip">
                <div className="doc-serving-info">
                  <div className="doc-serving-token-header">
                    <span className="doc-token-bold">Now Serving: Token #{nowServing.token}</span>
                    <span className="doc-green-status-dot" aria-label="Active Consultation"></span>
                  </div>
                  <p className="doc-serving-details">
                    <span className="doc-bullet-dot">●</span> {nowServing.patientName} &bull; Age: {nowServing.age} &bull; Room {nowServing.room}
                  </p>
                </div>

                <div className="doc-serving-btn-group">
                  <button className="doc-btn-call-next" onClick={handleCallNext}>
                    Call Next Patient &gt;
                  </button>
                  <div className="doc-serving-small-actions">
                    <button className="doc-btn-mini-pill" onClick={handleHold}>
                      Hold
                    </button>
                    <button className="doc-btn-mini-pill" onClick={handleComplete}>
                      Complete
                    </button>
                  </div>
                </div>
              </div>

              {/* Queue Sub-section */}
              <div className="doc-queue-subtable-block">
                <h3 className="doc-subtable-heading">Queue</h3>
                <div className="doc-table-scroll">
                  <table className="doc-clean-table">
                    <thead>
                      <tr>
                        <th>Token No.</th>
                        <th>Patient Name</th>
                        <th>Age</th>
                        <th>Estimated Time</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queueList.map((item) => (
                        <tr key={item.token}>
                          <td className="doc-td-token">{item.token}</td>
                          <td className="doc-td-name">{item.patientName}</td>
                          <td>{item.age}</td>
                          <td>{item.estimatedTime}</td>
                          <td>
                            <span className={`doc-status-badge ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="doc-row-actions">
                              <button
                                className="doc-btn-checkin"
                                onClick={() => handleCheckIn(item.token)}
                              >
                                Check in
                              </button>
                              <button
                                className="doc-btn-icon-check"
                                title="Approve"
                                onClick={() => showToast(`Approved patient ${item.patientName}`)}
                              >
                                ✓
                              </button>
                              <button
                                className="doc-btn-icon-edit"
                                title="Edit"
                                onClick={() => showToast(`Edit patient ${item.patientName}`)}
                              >
                                ✎
                              </button>
                              <button
                                className="doc-btn-icon-more"
                                title="More options"
                                onClick={() => showToast(`Options for ${item.patientName}`)}
                              >
                                ⋯
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                CARD 2: Inpatient Ward - Ward Rounds (Matching Image 1)
                ---------------------------------------------------- */}
            <div id="ward-rounds-card" className="doc-card">
              <div className="doc-ward-header-row">
                <h2 className="doc-card-title">Inpatient Ward - Ward Rounds</h2>
                <div className="doc-tab-links">
                  <button
                    className={`doc-tab-link ${wardTab === "Overview" ? "active" : ""}`}
                    onClick={() => setWardTab("Overview")}
                  >
                    Overview
                  </button>
                  <button
                    className={`doc-tab-link ${wardTab === "Ward Rounds" ? "active" : ""}`}
                    onClick={() => setWardTab("Ward Rounds")}
                  >
                    Ward Rounds
                  </button>
                </div>
              </div>

              {/* Ward Summary Ribbon */}
              <div className="doc-ward-summary-ribbon">
                <div className="doc-summary-pills-left">
                  <div className="doc-stat-white-pill">
                    <span className="doc-stat-pill-label">Total Admitted</span>
                    <span className="doc-stat-pill-val">
                      <strong>28</strong> Patients
                    </span>
                  </div>
                  <div className="doc-stat-white-pill">
                    <span className="doc-stat-pill-label">Bed Availability</span>
                    <span className="doc-stat-pill-val">
                      <strong>4 / 32</strong> Beds Available
                    </span>
                  </div>
                </div>

                <div className="doc-summary-icons-right">
                  <button
                    className="doc-square-icon-btn"
                    title="Ward Patients"
                    onClick={() => showToast("Showing all ward patients")}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </button>
                  <button
                    className="doc-square-icon-btn"
                    title="Bed Map"
                    onClick={() => showToast("Viewing bed allocation map")}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 7h-8v6H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4zm-9 4H5V8h5v3z"/>
                    </svg>
                  </button>
                  <button
                    className="doc-square-icon-btn"
                    title="Observation Notes"
                    onClick={() => showToast("Opening nurse observation log")}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Ward Table */}
              <div className="doc-table-scroll">
                <table className="doc-clean-table">
                  <thead>
                    <tr>
                      <th>Bed No</th>
                      <th>Patient Name</th>
                      <th>Admission Date</th>
                      <th>Condition Badges</th>
                      <th>Nurse Observation Summary</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wardPatients.map((p) => (
                      <tr key={p.id}>
                        <td className="doc-td-bed">{p.bedNo}</td>
                        <td className="doc-td-name">{p.patientName}</td>
                        <td>{p.admissionDate}</td>
                        <td>
                          <span className={`doc-condition-badge ${p.conditionColor}`}>
                            {p.condition}
                          </span>
                        </td>
                        <td className="doc-td-summary">{p.nurseSummary}</td>
                        <td style={{ textAlign: "right" }}>
                          {p.actionType === "notes" ? (
                            <button
                              className="doc-btn-notes"
                              onClick={() => showToast(`Opening round notes for ${p.patientName}`)}
                            >
                              📋 Ward Round Notes
                            </button>
                          ) : (
                            <button
                              className="doc-btn-approve-discharge"
                              onClick={() => handleApproveDischarge(p.patientName)}
                            >
                              ✓ Approve Discharge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination matching Image 1 */}
              <div className="doc-pagination-bar">
                <div className="doc-page-controls">
                  <span>Page 1</span>
                  <button className="doc-page-nav-btn">&lt;</button>
                  <span className="doc-page-active-num">1</span>
                  <button className="doc-page-nav-btn">&gt;</button>
                  <button className="doc-page-nav-btn">&raquo;</button>
                </div>
                <div className="doc-page-sizes">
                  <span>5</span>
                  <span>2</span>
                  <span>23</span>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                CARD 3: Create New Prescription (Matching Image 2)
                ---------------------------------------------------- */}
            <div id="prescriptions-card" className="doc-card">
              <div className="doc-rx-header-row">
                <h2 className="doc-card-title">Create New Prescription</h2>
                <span className="doc-date-subtext">Current date: Apr 11, 2024</span>
              </div>

              {/* Patient Details Form Fields */}
              <div className="doc-form-subcard">
                <h3 className="doc-form-section-title">Patient Details</h3>
                <div className="doc-rx-grid-row-4">
                  <div className="doc-input-item">
                    <label>Patient Name</label>
                    <input
                      type="text"
                      className="doc-form-control"
                      value={rxPatient.name}
                      onChange={(e) => setRxPatient({ ...rxPatient, name: e.target.value })}
                    />
                  </div>

                  <div className="doc-input-item">
                    <label>Age</label>
                    <input
                      type="text"
                      className="doc-form-control"
                      value={rxPatient.age}
                      onChange={(e) => setRxPatient({ ...rxPatient, age: e.target.value })}
                    />
                  </div>

                  <div className="doc-input-item">
                    <label>Gender</label>
                    <select
                      className="doc-form-control"
                      value={rxPatient.gender}
                      onChange={(e) => setRxPatient({ ...rxPatient, gender: e.target.value })}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="doc-input-item">
                    <label>Patient ID</label>
                    <input
                      type="text"
                      className="doc-form-control"
                      value={rxPatient.patientId}
                      onChange={(e) => setRxPatient({ ...rxPatient, patientId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Medications Form */}
              <div className="doc-form-subcard">
                <h3 className="doc-form-section-title">Medications</h3>
                <div className="doc-rx-grid-row-4">
                  <div className="doc-input-item">
                    <label>Medicine Name</label>
                    <input
                      type="text"
                      className="doc-form-control"
                      value={currentMedInput.name}
                      onChange={(e) =>
                        setCurrentMedInput({ ...currentMedInput, name: e.target.value })
                      }
                      placeholder="e.g. Amoxicillin"
                    />
                  </div>

                  <div className="doc-input-item">
                    <label>Dosage</label>
                    <input
                      type="text"
                      className="doc-form-control"
                      value={currentMedInput.dosage}
                      onChange={(e) =>
                        setCurrentMedInput({ ...currentMedInput, dosage: e.target.value })
                      }
                      placeholder="500 mg"
                    />
                  </div>

                  <div className="doc-input-item">
                    <label>Frequency</label>
                    <select
                      className="doc-form-control"
                      value={currentMedInput.frequency}
                      onChange={(e) =>
                        setCurrentMedInput({ ...currentMedInput, frequency: e.target.value })
                      }
                    >
                      <option value="Twice daily">Twice daily</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Three times daily">Three times daily</option>
                    </select>
                  </div>

                  <div className="doc-input-item">
                    <label>Duration</label>
                    <input
                      type="text"
                      className="doc-form-control"
                      value={currentMedInput.duration}
                      onChange={(e) =>
                        setCurrentMedInput({ ...currentMedInput, duration: e.target.value })
                      }
                      placeholder="7 days"
                    />
                  </div>
                </div>

                {/* Medication Chips / Rows */}
                <div className="doc-meds-box-list">
                  {medicationsList.map((m) => (
                    <div key={m.id} className="doc-med-item-row">
                      <span className="doc-med-text">
                        {m.name} {m.dosage} &bull; {m.frequency} &bull; {m.duration}
                      </span>
                      <button
                        className="doc-med-trash-btn"
                        title="Remove medication"
                        onClick={() => handleRemoveMedication(m.id)}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                <div className="doc-add-med-align">
                  <button className="doc-btn-add-med" onClick={handleAddMedication}>
                    + Add Medicine
                  </button>
                </div>
              </div>

              {/* Diagnostics & Lab Orders + Follow-up Advice in 2 columns */}
              <div className="doc-two-col-block">
                {/* Diagnostics */}
                <div className="doc-form-subcard" style={{ flex: 1 }}>
                  <h3 className="doc-form-section-title">Diagnostics &amp; Lab Orders</h3>
                  <div className="doc-checkboxes-grid">
                    <label className="doc-checkbox-label">
                      <input
                        type="checkbox"
                        checked={diagnostics.bloodTests}
                        onChange={(e) =>
                          setDiagnostics({ ...diagnostics, bloodTests: e.target.checked })
                        }
                      />
                      <span>Blood Tests</span>
                    </label>

                    <label className="doc-checkbox-label">
                      <input
                        type="checkbox"
                        checked={diagnostics.xRay}
                        onChange={(e) =>
                          setDiagnostics({ ...diagnostics, xRay: e.target.checked })
                        }
                      />
                      <span>X-Ray</span>
                    </label>

                    <label className="doc-checkbox-label">
                      <input
                        type="checkbox"
                        checked={diagnostics.urineTest}
                        onChange={(e) =>
                          setDiagnostics({ ...diagnostics, urineTest: e.target.checked })
                        }
                      />
                      <span>Urine Test</span>
                    </label>

                    <label className="doc-checkbox-label">
                      <input
                        type="checkbox"
                        checked={diagnostics.ecg}
                        onChange={(e) =>
                          setDiagnostics({ ...diagnostics, ecg: e.target.checked })
                        }
                      />
                      <span>ECG</span>
                    </label>
                  </div>
                </div>

                {/* Follow-up Advice */}
                <div className="doc-form-subcard" style={{ flex: 1.2 }}>
                  <h3 className="doc-form-section-title">Follow-up Advice</h3>
                  <textarea
                    rows="3"
                    className="doc-form-control doc-advice-textarea"
                    value={followUpAdvice}
                    onChange={(e) => setFollowUpAdvice(e.target.value)}
                  />
                </div>
              </div>

              {/* Bottom Prescription Action Buttons */}
              <div className="doc-rx-submit-actions">
                <button className="doc-btn-issue-rx" onClick={handleSavePrescription}>
                  Issue &amp; Save Prescription <span style={{ marginLeft: 6 }}>↗</span>
                </button>
                <button className="doc-btn-cancel-rx" onClick={handleCancelPrescription}>
                  Cancel
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------
                CARD 4: Medical Records (Kamal Perera - Image 2)
                ---------------------------------------------------- */}
            <div id="medical-records-card" className="doc-card">
              {/* Header Info Strip */}
              <div className="doc-patient-top-strip">
                <div className="doc-patient-info-left">
                  <strong>Kamal Perera (PID: P-1042)</strong> &bull; 38 Yrs / Male &bull; Blood: O+
                </div>
                <div className="doc-allergy-chip">
                  Allergy: Penicillin
                </div>
              </div>

              {/* Two Column Layout: Past History & Clinical Diagnosis */}
              <div className="doc-record-split-grid">
                {/* Left: Past History */}
                <div className="doc-history-col">
                  <h3 className="doc-record-heading">Past History</h3>

                  <div className="doc-timeline-wrapper">
                    {/* Event 1 */}
                    <div className="doc-timeline-item">
                      <div className="doc-timeline-circle"></div>
                      <div className="doc-timeline-line"></div>
                      <div className="doc-timeline-card">
                        <h4 className="doc-timeline-title">Oct 2, 2026 - GP Consultation</h4>
                        <p className="doc-timeline-body">
                          Treated for viral fever, recovery good.
                        </p>
                      </div>
                    </div>

                    {/* Event 2 */}
                    <div className="doc-timeline-item">
                      <div className="doc-timeline-circle"></div>
                      <div className="doc-timeline-card">
                        <h4 className="doc-timeline-title">Sep 14, 2026 - Cardiology Checkup</h4>
                        <p className="doc-timeline-body">
                          Routine ECG clear.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Clinical Diagnosis & Vitals */}
                <div className="doc-diagnosis-col">
                  <h3 className="doc-record-heading">Clinical Diagnosis &amp; Vitals</h3>

                  <div className="doc-form-field-unit">
                    <label className="doc-record-label">Symptoms</label>
                    <textarea
                      rows="2"
                      className="doc-record-textarea"
                      value={symptomsText}
                      onChange={(e) => setSymptomsText(e.target.value)}
                    />
                  </div>

                  <div className="doc-form-field-unit">
                    <label className="doc-record-label">Doctor's Diagnosis</label>
                    <textarea
                      rows="2"
                      className="doc-record-textarea"
                      value={diagnosisText}
                      onChange={(e) => setDiagnosisText(e.target.value)}
                    />
                  </div>

                  {/* Vitals and Save Button Row */}
                  <div className="doc-vitals-row">
                    <div className="doc-vitals-pack">
                      <div className="doc-vital-box vital-bp">
                        <span className="vital-lbl">BP</span>
                        <span className="vital-val">{vitalsData.bp}</span>
                      </div>
                      <div className="doc-vital-box vital-pulse">
                        <span className="vital-lbl">Pulse</span>
                        <span className="vital-val">{vitalsData.pulse}</span>
                      </div>
                      <div className="doc-vital-box vital-temp">
                        <span className="vital-lbl">Temp</span>
                        <span className="vital-val">{vitalsData.temp}</span>
                      </div>
                    </div>

                    <button
                      className="doc-btn-save-notes"
                      onClick={handleSaveClinicalNotes}
                    >
                      Save Clinical Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ========================================================
          FOOTER (SAME AS PREVIOUS PAGE)
          ======================================================== */}
      <Footer />
    </div>
  );
}

export default Doctor;
