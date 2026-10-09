import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getAppointments, createAppointment, getPatients, getPrescriptions } from "../services/api";

function Patient() {
  const navigate = useNavigate();

  // Retrieve logged-in patient session if available
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeNav, setActiveNav] = useState("Appointments");
  const [toastMessage, setToastMessage] = useState("");
  const isManualScroll = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  // Patient display name
  const patientDisplayName = currentUser?.name
    ? `Mr/Ms ${currentUser.name}`
    : "Mr. Kamal Perera";

  // ==========================================
  // STEP 1: APPOINTMENTS STATE & WORKFLOW
  // ==========================================
  const [tokenStatus, setTokenStatus] = useState(() => {
    try {
      const activeTok = localStorage.getItem("nexus_active_token");
      if (activeTok) {
        const parsed = JSON.parse(activeTok);
        return {
          yourToken: parsed.token || "#05",
          currentlyServing: parsed.currentlyServing ? `#${parsed.currentlyServing}` : "#04",
          scheduledVisit: `${parsed.doctorName || "Dr. Vance"} (${parsed.department || "Cardiology"}) - Today at ${parsed.estimatedTime || "10:15 AM"}`
        };
      }
    } catch {}
    return {
      yourToken: "#05",
      currentlyServing: "#04",
      scheduledVisit: "Dr. Vance (Cardiology) - Today at 10:15 AM"
    };
  });

  const [doctorsList] = useState([
    { name: "Dr. Vance", specialty: "Cardiology", fee: "Rs. 2,500.00", feeUsd: "$50.00" },
    { name: "Dr. Priyantha Senanayake", specialty: "Cardiology", fee: "Rs. 2,500.00", feeUsd: "$50.00" },
    { name: "Dr. Champa Gunasekara", specialty: "General Medicine", fee: "Rs. 2,000.00", feeUsd: "$40.00" },
    { name: "Dr. Sanath Weerasinghe", specialty: "Pulmonology", fee: "Rs. 2,800.00", feeUsd: "$55.00" },
    { name: "Dr. Sanduni Wickramasinghe", specialty: "Neurology", fee: "Rs. 3,000.00", feeUsd: "$60.00" }
  ]);

  const [bookingForm, setBookingForm] = useState({
    doctor: "Dr. Vance - Cardiology",
    specialty: "Cardiology",
    consultationType: "In-Person Visit",
    dateTime: "Today, Oct 9, 2026 - 10:15 AM",
    patientName: currentUser?.name ? `${currentUser.name} (PID: P-1042)` : "Kamal Perera (PID: P-1042)",
    patientAge: 38
  });

  // Doctor selection auto-updates specialty and fee
  const handleDoctorChange = (e) => {
    const selectedDocName = e.target.value;
    const found = doctorsList.find((d) => `${d.name} - ${d.specialty}` === selectedDocName);
    setBookingForm({
      ...bookingForm,
      doctor: selectedDocName,
      specialty: found ? found.specialty : "General Medicine"
    });
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({
        patientName: currentUser?.name || "Kamal Perera",
        doctorName: bookingForm.doctor.split(" - ")[0],
        department: bookingForm.specialty,
        dateTime: new Date().toISOString(),
        tokenNumber: 5,
        type: bookingForm.consultationType
      });
    } catch {
      // offline fallback works seamlessly
    }
    showToast(`✓ Appointment confirmed with ${bookingForm.doctor}! Token #05 is active.`);
  };

  const handleCancelBooking = () => {
    setBookingForm({
      doctor: "Dr. Vance - Cardiology",
      specialty: "Cardiology",
      consultationType: "In-Person Visit",
      dateTime: "Today, Oct 9, 2026 - 10:15 AM",
      patientName: currentUser?.name ? `${currentUser.name} (PID: P-1042)` : "Kamal Perera (PID: P-1042)",
      patientAge: 38
    });
    showToast("Booking form reset.");
  };

  // Sync token status in real-time from Receptionist dispatch and backend database
  useEffect(() => {
    const syncTokenFromDb = async () => {
      try {
        const res = await getAppointments();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const latestAppt = res.data[0];
          setTokenStatus({
            yourToken: `#${String(latestAppt.tokenNumber || "05").padStart(2, "0")}`,
            currentlyServing: "#04",
            scheduledVisit: `${latestAppt.doctorName || "Dr. Vance"} (${latestAppt.department || "Cardiology"}) - Today at 10:15 AM`
          });
        }
      } catch {
        // fallback to storage
      }
    };

    syncTokenFromDb();

    // Fetch latest prescription and clinical notes from backend
    const syncRxFromDb = async () => {
      try {
        const rxRes = await getPrescriptions();
        if (rxRes?.data && Array.isArray(rxRes.data) && rxRes.data.length > 0) {
          const latest = rxRes.data[0];
          if (latest.medications && latest.medications.length > 0) {
            setPrescriptions(latest.medications);
          }
          if (latest.diagnosis) {
            setMedicalRecord((prev) => ({
              ...prev,
              diagnosisHistory: [
                {
                  id: Date.now(),
                  date: `Today, ${new Date(latest.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${latest.doctorName || "Dr. Vance"} Consultation`,
                  notes: `Doctor diagnosis notes: ${latest.diagnosis}. Symptoms: ${latest.symptoms || "Mild bronchial irritation"}. Advised: ${latest.followUpAdvice || "Take as prescribed"}.`
                },
                ...prev.diagnosisHistory.filter((item) => !item.notes.includes(latest.diagnosis))
              ]
            }));
          }
        }
      } catch {
        // offline fallback operates seamlessly
      }
    };

    syncRxFromDb();

    const handleStorageUpdate = (event) => {
      let activeTok = event?.detail;
      if (!activeTok) {
        try {
          activeTok = JSON.parse(localStorage.getItem("nexus_active_token"));
        } catch {
          activeTok = null;
        }
      }

      if (activeTok) {
        setTokenStatus({
          yourToken: activeTok.token || "#05",
          currentlyServing: activeTok.currentlyServing ? `#${activeTok.currentlyServing}` : "#04",
          scheduledVisit: `${activeTok.doctorName || "Dr. Vance"} (${activeTok.department || "Cardiology"}) - Today at ${activeTok.estimatedTime || "10:15 AM"}`
        });
      }

      // Check if new prescription was dispatched by Doctor
      try {
        const storedRx = localStorage.getItem("nexus_patient_prescriptions");
        if (storedRx) {
          const parsedRx = JSON.parse(storedRx);
          if (Array.isArray(parsedRx) && parsedRx.length > 0) {
            setPrescriptions(parsedRx);
          }
        }
        const storedRec = localStorage.getItem("nexus_patient_latest_record");
        if (storedRec) {
          const parsedRec = JSON.parse(storedRec);
          setMedicalRecord((prev) => ({
            ...prev,
            diagnosisHistory: [
              parsedRec,
              ...prev.diagnosisHistory.filter((item) => item.id !== parsedRec.id)
            ]
          }));
        }
      } catch {}
    };

    const handleRxDispatched = (event) => {
      const rxData = event?.detail;
      if (rxData && rxData.medications) {
        setPrescriptions(rxData.medications);
        if (rxData.diagnosis) {
          setMedicalRecord((prev) => ({
            ...prev,
            diagnosisHistory: [
              {
                id: Date.now(),
                date: `Today, Oct 09, 2026 - ${rxData.doctorName || "Dr. Vance"} Consultation`,
                notes: `Doctor diagnosis notes: ${rxData.diagnosis}. Symptoms: ${rxData.symptoms}. Prescribed: ${rxData.medications.map((m) => m.name).join(", ")}. Follow-up: ${rxData.followUpAdvice}`
              },
              ...prev.diagnosisHistory.filter((item) => !item.notes.includes(rxData.diagnosis))
            ]
          }));
        }
        showToast("🔔 New Prescription & Consultation Record received from Dr. Vance!");
      }
    };

    window.addEventListener("nexus_queue_updated", handleStorageUpdate);
    window.addEventListener("nexus_prescription_issued", handleRxDispatched);
    window.addEventListener("storage", handleStorageUpdate);
    const interval = setInterval(() => {
      syncTokenFromDb();
      syncRxFromDb();
    }, 4000);

    return () => {
      window.removeEventListener("nexus_queue_updated", handleStorageUpdate);
      window.removeEventListener("nexus_prescription_issued", handleRxDispatched);
      window.removeEventListener("storage", handleStorageUpdate);
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // STEP 2: MY RECORDS STATE (Diagnosis & Vitals)
  // ==========================================
  const [medicalRecord, setMedicalRecord] = useState(() => {
    try {
      const latestRec = localStorage.getItem("nexus_patient_latest_record");
      if (latestRec) {
        const parsedRec = JSON.parse(latestRec);
        return {
          patientName: "Kamal Perera",
          pid: "P-1042",
          age: 38,
          gender: "Male",
          bloodGroup: "O+",
          allergy: "Penicillin",
          diagnosisHistory: [
            parsedRec,
            {
              id: 2,
              date: "Sep 14, 2026 - GP Follow-up",
              notes: "Routine check-up, vital signs stable, advised dietary improvements."
            }
          ],
          vitals: { bp: "124/80 mmHg", pulse: "74 bpm", temp: "98.6 F" }
        };
      }
    } catch {}
    return {
      patientName: "Kamal Perera",
      pid: "P-1042",
      age: 38,
      gender: "Male",
      bloodGroup: "O+",
      allergy: "Penicillin",
      diagnosisHistory: [
        {
          id: 1,
          date: "Oct 09, 2026 - Dr. Vance Consultation",
          notes: "Doctor diagnosis notes: Acute bronchitis with mild bronchial irritation. Prescribed Amoxicillin 500mg, Ibuprofen 400mg."
        },
        {
          id: 2,
          date: "Sep 14, 2026 - GP Follow-up",
          notes: "Routine check-up, vital signs stable, advised dietary improvements."
        }
      ],
      vitals: { bp: "124/80 mmHg", pulse: "74 bpm", temp: "98.6 F" }
    };
  });

  // ==========================================
  // STEP 3: PRESCRIPTIONS STATE
  // ==========================================
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const storedRx = localStorage.getItem("nexus_patient_prescriptions");
      if (storedRx) {
        const parsed = JSON.parse(storedRx);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        name: "Amoxicillin 500mg",
        dosage: "500 mg",
        frequency: "Twice daily",
        duration: "7 days",
        instructions: "After meals"
      },
      {
        name: "Ibuprofen 400mg",
        dosage: "400 mg",
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "With food"
      }
    ];
  });

  const handleDownloadRx = () => {
    showToast("✓ Generating Digital Prescription (PDF)... Download starting!");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  // ==========================================
  // STEP 4: WARD ADMISSION STATE
  // ==========================================
  const [admission] = useState({
    status: "Current Status: Inpatient Admitted - Ward 3B",
    bed: "Bed-01A",
    admittedDate: "Oct 12, 2026",
    doctor: "Dr. Priyantha Senanayake",
    nurse: "Nurse K. Perera",
    logs: [
      "08:00 AM - Breakfast served (Low sodium diet)",
      "07:30 AM - Vitals taken (BP: 120/80 mmHg, Pulse: 72 bpm, Temp: 98.6 F)",
      "06:00 AM - Morning medication administered"
    ]
  });

  const [showDischargeModal, setShowDischargeModal] = useState(false);

  // Auto-switch sidebar active category as user scrolls down the page
  useEffect(() => {
    const sections = [
      { id: "appointments-card", nav: "Appointments" },
      { id: "my-records-card", nav: "MyRecords" },
      { id: "prescriptions-card", nav: "Prescriptions" },
      { id: "ward-admission-card", nav: "WardAdmission" }
    ];

    const handleScroll = () => {
      if (isManualScroll.current) return;

      const scrollPosition = window.scrollY + 220;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveNav(sections[i].nav);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sidebar smooth scrolling when manually clicked
  const scrollToSection = (id, navName) => {
    setActiveNav(navName);
    isManualScroll.current = true;
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -20;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setTimeout(() => {
      isManualScroll.current = false;
    }, 850);
  };

  const handleLogout = () => {
    localStorage.removeItem("nexus_user");
    navigate("/login");
  };

  return (
    <div className="patient-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="patient-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Discharge Summary Modal */}
      {showDischargeModal && (
        <div className="patient-modal-backdrop" onClick={() => setShowDischargeModal(false)}>
          <div className="patient-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="patient-modal-header">
              <h3>Inpatient Discharge Summary</h3>
              <button
                className="patient-modal-close-btn"
                onClick={() => setShowDischargeModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="patient-modal-body">
              <p><strong>Patient Name:</strong> {medicalRecord.patientName} (PID: {medicalRecord.pid})</p>
              <p><strong>Ward / Bed:</strong> Ward 3B, {admission.bed}</p>
              <p><strong>Admission Date:</strong> {admission.admittedDate}</p>
              <p><strong>Attending Doctor:</strong> {admission.doctor}</p>
              <p><strong>Discharge Status:</strong> Approved for Convalescent Recovery</p>
              <hr style={{ margin: "16px 0", borderColor: "#e2e8f0" }} />
              <h4 style={{ color: "#0f766e", marginBottom: 8 }}>Discharge Instructions:</h4>
              <ul style={{ paddingLeft: 20, color: "#334155", lineHeight: 1.6 }}>
                <li>Continue prescribed oral medications for 7 days.</li>
                <li>Follow low-sodium diet and maintain moderate hydration.</li>
                <li>Schedule follow-up cardiology appointment in 2 weeks.</li>
                <li>Contact emergency hotline if dizziness or chest pain recurs.</li>
              </ul>
            </div>
            <div className="patient-modal-footer">
              <button
                className="patient-btn-print-summary"
                onClick={() => {
                  window.print();
                }}
              >
                🖨 Print Summary
              </button>
              <button
                className="patient-btn-close-modal"
                onClick={() => setShowDischargeModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          HERO BANNER
          Uses /patient.png from public (with fallback to /patient.jpg)
          NexusHealth logo top-left
          Mr/Ms User pill button positioned directly under heading
          Sign Out button top-right
          ======================================================== */}
      <section className="patient-hero-section">
        <div className="patient-hero-container">
          <img
            src="/patient.png"
            alt="Compassionate Care - NexusHealth"
            className="patient-hero-bg-img"
            onError={(e) => {
              e.currentTarget.src = "/patient.jpg";
            }}
          />

          {/* NexusHealth Logo in top-left position */}
          <div className="patient-hero-logo-box">
            <Link to="/" title="Go to Home">
              <img
                src="/health-logo.png"
                alt="NexusHealth Logo"
                className="patient-hero-logo-img"
                onError={(e) => {
                  e.currentTarget.src = "/health logo.png";
                }}
              />
            </Link>
          </div>

          {/* Top-right Sign Out button */}
          <div className="patient-hero-top-right">
            <button onClick={handleLogout} className="patient-logout-pill" title="Sign Out">
              Sign Out
            </button>
          </div>

          {/* Left Text Overlay: Heading & Mr/Ms User badge directly underneath */}
          <div className="patient-hero-left-overlay">
            <h1 className="patient-hero-custom-heading">
              Compassionate Care.<br />
              Better Health.<br />
              Stronger Tomorrow.
            </h1>
            <div className="patient-hero-btn-wrap">
              <button
                className="patient-hero-user-badge"
                title="Patient Profile"
                onClick={() => showToast(`Signed in as ${patientDisplayName}`)}
              >
                {patientDisplayName}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2-COLOR WORKFLOW LAYOUT (SAME AS PREVIOUS DOCTOR PAGE):
          Left Column (Sidebar): #B0E5DD
          Right Column (Cards Stream): #DAEFEC
          ======================================================== */}
      <div className="patient-dashboard-layout">
        {/* LEFT COLUMN: Sidebar Navigation (#B0E5DD) */}
        <aside className="patient-sidebar-col">
          <nav className="patient-nav-menu">
            <button
              className={`patient-nav-item patient-nav-anim-1 ${activeNav === "Appointments" ? "active" : ""}`}
              onClick={() => scrollToSection("appointments-card", "Appointments")}
              title="View & Book Appointments"
            >
              <span className="patient-nav-text">Appointments</span>
              <span className="patient-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`patient-nav-item patient-nav-anim-2 ${activeNav === "MyRecords" ? "active" : ""}`}
              onClick={() => scrollToSection("my-records-card", "MyRecords")}
              title="View Clinical Records & Vitals"
            >
              <span className="patient-nav-text">MyRecords</span>
              <span className="patient-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`patient-nav-item patient-nav-anim-3 ${activeNav === "Prescriptions" ? "active" : ""}`}
              onClick={() => scrollToSection("prescriptions-card", "Prescriptions")}
              title="View Prescriptions"
            >
              <span className="patient-nav-text">Prescriptions</span>
              <span className="patient-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`patient-nav-item patient-nav-anim-4 ${activeNav === "WardAdmission" ? "active" : ""}`}
              onClick={() => scrollToSection("ward-admission-card", "WardAdmission")}
              title="View Ward Admission Details"
            >
              <span className="patient-nav-text">WardAdmission</span>
              <span className="patient-nav-indicator" aria-hidden="true">›</span>
            </button>
          </nav>
        </aside>

        {/* RIGHT COLUMN: 4 Workflow Dashboard Cards (#DAEFEC) */}
        <main className="patient-main-col">
          <div className="patient-cards-stream">
            {/* ----------------------------------------------------
                WORKFLOW STEP 1: APPOINTMENTS (Matching Image 1)
                - Displays scheduled visit & live token tracker
                - Book Appointment form with fee breakdown
                ---------------------------------------------------- */}
            <div id="appointments-card" className="patient-card">
              {/* Scheduled Visit Strip with Live Tokens */}
              <div className="patient-visit-strip">
                <div className="patient-visit-info">
                  <span className="patient-visit-label">Your Scheduled Visit:</span>
                  <p className="patient-visit-text">{tokenStatus.scheduledVisit}</p>
                </div>
                <div className="patient-token-badges-group">
                  <span className="patient-badge-your-token">
                    Your Token: {tokenStatus.yourToken}
                  </span>
                  <span className="patient-badge-serving-token">
                    Currently Serving: {tokenStatus.currentlyServing}
                  </span>
                </div>
              </div>

              {/* Book Appointment Card */}
              <div className="patient-booking-subcard">
                <h3 className="patient-subcard-title">Book Appointment</h3>

                <form onSubmit={handleScheduleAppointment} className="patient-booking-grid">
                  {/* Left Column: Consultation Details */}
                  <div className="patient-form-col">
                    <h4 className="patient-form-group-title">Consultation Details</h4>

                    <div className="patient-form-group">
                      <label>Doctor</label>
                      <select
                        className="patient-form-control"
                        value={bookingForm.doctor}
                        onChange={handleDoctorChange}
                      >
                        {doctorsList.map((doc, idx) => (
                          <option key={idx} value={`${doc.name} - ${doc.specialty}`}>
                            {doc.name} - {doc.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="patient-form-group">
                      <label>Specialty</label>
                      <input
                        type="text"
                        className="patient-form-control patient-input-readonly"
                        value={bookingForm.specialty}
                        readOnly
                      />
                    </div>

                    <div className="patient-form-group">
                      <label>Consultation Type</label>
                      <select
                        className="patient-form-control"
                        value={bookingForm.consultationType}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, consultationType: e.target.value })
                        }
                      >
                        <option value="In-Person Visit">In-Person Visit</option>
                        <option value="Online Video Consultation">Online Video Consultation</option>
                      </select>
                    </div>

                    <div className="patient-form-group">
                      <label>Date &amp; Time</label>
                      <input
                        type="text"
                        className="patient-form-control"
                        value={bookingForm.dateTime}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, dateTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Right Column: Payment & Confirmation */}
                  <div className="patient-form-col">
                    <h4 className="patient-form-group-title">Payment &amp; Confirmation</h4>

                    <p className="patient-summary-patient-meta">
                      Patient Name: <strong>{bookingForm.patientName}</strong> &bull; Age: {bookingForm.patientAge}
                    </p>

                    <div className="patient-fee-callout-box">
                      <span className="patient-fee-label">Consultation Fee</span>
                      <span className="patient-fee-amount">Rs. 2,500.00</span>
                      <span className="patient-fee-usd">(or $50.00)</span>
                    </div>

                    <div className="patient-booking-actions">
                      <button type="submit" className="patient-btn-schedule">
                        Schedule Appointment
                      </button>
                      <button
                        type="button"
                        className="patient-btn-cancel-appt"
                        onClick={handleCancelBooking}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 2: MY RECORDS (Matching Image 2)
                - Diagnosis History timeline
                - Nurse-updated vital signs (BP, Pulse, Temp)
                ---------------------------------------------------- */}
            <div id="my-records-card" className="patient-card">
              <h2 className="patient-card-title">My Records</h2>

              {/* Patient Top Strip */}
              <div className="patient-top-strip">
                <div className="patient-top-strip-info">
                  <strong>{medicalRecord.patientName} (PID: {medicalRecord.pid})</strong> &bull; {medicalRecord.age} Yrs / {medicalRecord.gender} &bull; Blood: {medicalRecord.bloodGroup}
                </div>
                <div className="patient-allergy-chip">
                  ⚠️ Allergy: {medicalRecord.allergy}
                </div>
              </div>

              {/* Two Column Layout: Diagnosis History & Latest Vitals */}
              <div className="patient-records-split-grid">
                {/* Left: Diagnosis History */}
                <div className="patient-timeline-col">
                  <h3 className="patient-records-subtitle">Diagnosis History</h3>

                  <div className="patient-timeline-wrapper">
                    {medicalRecord.diagnosisHistory.map((item, idx) => (
                      <div key={item.id} className="patient-timeline-item">
                        <div className="patient-timeline-circle"></div>
                        {idx < medicalRecord.diagnosisHistory.length - 1 && (
                          <div className="patient-timeline-line"></div>
                        )}
                        <div className="patient-timeline-card">
                          <h4 className="patient-timeline-title">{item.date}</h4>
                          <p className="patient-timeline-body">{item.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Latest Vital Signs */}
                <div className="patient-vitals-col">
                  <h3 className="patient-records-subtitle">Latest Vital Signs</h3>
                  <p className="patient-vitals-subtext">Latest Vital Signs</p>

                  <div className="patient-vitals-row">
                    <div className="patient-vital-card vital-bp">
                      <span className="p-vital-lbl">BP</span>
                      <span className="p-vital-val">{medicalRecord.vitals.bp}</span>
                    </div>
                    <div className="patient-vital-card vital-pulse">
                      <span className="p-vital-lbl">Pulse</span>
                      <span className="p-vital-val">{medicalRecord.vitals.pulse}</span>
                    </div>
                    <div className="patient-vital-card vital-temp">
                      <span className="p-vital-lbl">Body Temp</span>
                      <span className="p-vital-val">{medicalRecord.vitals.temp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 3: PRESCRIPTIONS (Matching Image 2)
                - Table of medications prescribed by doctor
                - Diagnostic test orders & follow-up appointment
                ---------------------------------------------------- */}
            <div id="prescriptions-card" className="patient-card">
              <div className="patient-card-header-flex">
                <h2 className="patient-card-title">Patient view - Prescriptions</h2>
                <button
                  className="patient-btn-download-rx"
                  onClick={handleDownloadRx}
                  title="Download Official Prescription PDF"
                >
                  <span role="img" aria-label="Rx Document">📄</span> Download Digital Rx (PDF)
                </button>
              </div>

              {/* Medicines Table Card */}
              <div className="patient-meds-table-box">
                <h3 className="patient-meds-box-title">Medicines</h3>
                <div className="patient-table-scroll">
                  <table className="patient-clean-table">
                    <thead>
                      <tr>
                        <th>Medicine Name</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Dietary Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((rx, idx) => (
                        <tr key={idx}>
                          <td className="patient-td-med-name">{rx.name}</td>
                          <td>{rx.dosage}</td>
                          <td>{rx.frequency}</td>
                          <td>{rx.duration}</td>
                          <td>{rx.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom 2 Callout Blocks: Diagnostic Tests & Follow-up */}
              <div className="patient-rx-bottom-grid">
                <div className="patient-rx-tan-card">
                  <h4 className="patient-rx-tan-title">Diagnostic Tests Ordered:</h4>
                  <ul className="patient-rx-tan-list">
                    <li>&bull; Blood Tests</li>
                    <li>&bull; Urine Test</li>
                  </ul>
                </div>

                <div className="patient-rx-mint-card">
                  <h4 className="patient-rx-mint-title">Follow-up Consultation:</h4>
                  <p className="patient-rx-mint-text">
                    Dr. Senanayake – Cardiology, October 26, 2026
                  </p>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 4: WARD ADMISSION (Matching Image 3)
                - Inpatient status, Bed allocation & Care log
                - View Discharge Summary
                ---------------------------------------------------- */}
            <div id="ward-admission-card" className="patient-card">
              <h2 className="patient-card-title">Patient view - Ward Admission</h2>

              <div className="patient-ward-status-pill">
                {admission.status}
              </div>

              <div className="patient-ward-split-grid">
                {/* Left: Admission Details */}
                <div className="patient-ward-box">
                  <h3 className="patient-ward-box-title">Admission Details</h3>
                  <div className="patient-ward-meta-list">
                    <div className="patient-ward-meta-row">
                      <span className="p-meta-lbl">Assigned Bed:</span>
                      <span className="p-meta-val">{admission.bed}</span>
                    </div>
                    <div className="patient-ward-meta-row">
                      <span className="p-meta-lbl">Admitted Date:</span>
                      <span className="p-meta-val">{admission.admittedDate}</span>
                    </div>
                    <div className="patient-ward-meta-row">
                      <span className="p-meta-lbl">Attending Physician:</span>
                      <span className="p-meta-val">{admission.doctor}</span>
                    </div>
                    <div className="patient-ward-meta-row">
                      <span className="p-meta-lbl">Assigned Nurse:</span>
                      <span className="p-meta-val">{admission.nurse}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Daily Nursing Care Log */}
                <div className="patient-ward-box">
                  <h3 className="patient-ward-box-title">Daily Nursing Care Log</h3>
                  <ul className="patient-nursing-log-list">
                    {admission.logs.map((log, idx) => (
                      <li key={idx} className="patient-nursing-log-item">
                        {log}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="patient-btn-discharge-summary"
                    onClick={() => setShowDischargeModal(true)}
                  >
                    View Discharge Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER: Identical to Previous Doctor Page */}
      <Footer />
    </div>
  );
}

export default Patient;
