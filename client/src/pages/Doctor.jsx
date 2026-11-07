import useDoctorNotice from "../features/doctor/useDoctorNotice";
import useDoctorActions from "../features/doctor/useDoctorActions";
import {
  cleanPatientId,
  doctorName,
  resolveQueuePatient,
  requireDatabasePatient,
  savePatientUpdate,
} from "../features/doctor/patientContext";
import useDoctorSync from "../features/doctor/useDoctorSync";
import useDoctorNavigation from "../features/doctor/useDoctorNavigation";
import { initialPatientsCatalog } from "../features/doctor/legacyDoctorData";
import PatientQueueCard from "../components/doctor/PatientQueueCard";
import WardRoundsCard from "../components/doctor/WardRoundsCard";
import PrescriptionCard from "../components/doctor/PrescriptionCard";
import MedicalRecordsCard from "../components/doctor/MedicalRecordsCard";
import { logoutUser } from "../services/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  updatePatient,
  createPrescription,
  createAdmission,
} from "../services/api";

// Catalog of patient clinical profiles supporting the connected workflow

function Doctor() {
  const navigate = useNavigate();
  const { pendingActions, actionError, runAction } = useDoctorActions();

  // Retrieve logged-in doctor from database session
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { activeNav, scrollToSection } = useDoctorNavigation();
  const { toastMessage, showToast } = useDoctorNotice();

  // Connected Patient Database / Catalog
  const [patientsCatalog, setPatientsCatalog] = useState(
    initialPatientsCatalog,
  );

  // Active Patient in Context (Initially Kamal Perera for Medical Records, Kavindi for Queue)
  const [activeMedicalPatient, setActiveMedicalPatient] = useState(
    initialPatientsCatalog["08"],
  );

  // ==========================================
  // STEP 1: PATIENT QUEUE STATE
  // ==========================================
  const [nowServing, setNowServing] = useState({
    token: "04",
    patientName: "Kavindi Jayawardena",
    age: 34,
    room: "02",
  });

  const [queueList, setQueueList] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_queue_list");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const activeTok = localStorage.getItem("nexus_active_token");
      if (activeTok) {
        const parsedTok = JSON.parse(activeTok);
        return [
          {
            token: parsedTok.token || "#05",
            patientName: parsedTok.patientName || "Kamal Perera",
            age: parsedTok.age || 38,
            estimatedTime: parsedTok.estimatedTime || "10:15 AM",
            status: "Waiting",
            statusColor: "status-mint",
          },
          {
            token: "#06",
            patientName: "Nalani Wickramasinghe",
            age: 29,
            estimatedTime: "10:30 AM",
            status: "Waiting",
            statusColor: "status-mint",
          },
          {
            token: "#07",
            patientName: "Nuwan Pradeep",
            age: 58,
            estimatedTime: "11:00 AM",
            status: "Scheduled",
            statusColor: "status-blue",
          },
        ];
      }
    } catch {
      // A malformed legacy cache must not prevent loading the doctor workspace.
    }
    return [
      {
        token: "#05",
        patientName: "Kamal Perera",
        age: 38,
        estimatedTime: "10:15 AM",
        status: "Waiting",
        statusColor: "status-mint",
      },
      {
        token: "#06",
        patientName: "Nalani Wickramasinghe",
        age: 29,
        estimatedTime: "10:30 AM",
        status: "Waiting",
        statusColor: "status-mint",
      },
      {
        token: "#07",
        patientName: "Nuwan Pradeep",
        age: 58,
        estimatedTime: "11:00 AM",
        status: "Scheduled",
        statusColor: "status-blue",
      },
    ];
  });

  const [wardTab, setWardTab] = useState("Ward Rounds");
  const [wardPatients, setWardPatients] = useState([
    {
      id: 101,
      bedNo: "Bed-02A",
      patientName: "Kamal Perera",
      admissionDate: "Oct 09, 2026",
      condition: "Recovered",
      conditionColor: "cond-stable",
      nurseSummary: "Clinical recovery achieved, vital signs normal",
      actionType: "discharge",
      dbId: "P-1042",
    },
    {
      id: 1,
      bedNo: "Bed-01B",
      patientName: "Kasun Madusanka",
      admissionDate: "Oct 12, 2026",
      condition: "Stable",
      conditionColor: "cond-stable",
      nurseSummary: "Post-op recovery, vitals stable",
      actionType: "notes",
    },
    {
      id: 2,
      bedNo: "Bed-03A",
      patientName: "Nalani Wickramasinghe",
      admissionDate: "Oct 14, 2026",
      condition: "Guarded",
      conditionColor: "cond-guarded",
      nurseSummary: "Awaiting labs, mild pain",
      actionType: "discharge",
    },
    {
      id: 3,
      bedNo: "Bed-02B",
      patientName: "Nuwan Pradeep",
      admissionDate: "Oct 15, 2026",
      condition: "Critical",
      conditionColor: "cond-critical",
      nurseSummary: "On oxygen, close monitoring",
      actionType: "discharge",
    },
  ]);

  const [syncError, setSyncError] = useState("");
  useDoctorSync({ setQueueList, setWardPatients, onError: setSyncError });

  // WORKFLOW ACTION 1: Doctor clicks [ Call Next Patient ]
  // Pops next patient from Queue and LOADS PATIENT CONTEXT into Medical Records & Prescriptions
  const handleCallNext = () => {
    if (queueList.length > 0) {
      const next = queueList[0];
      const tokenKey = next.token.replace("#", "");

      setNowServing({
        token: tokenKey,
        patientName: next.patientName,
        age: next.age,
        room: "02",
      });

      setQueueList((prev) => prev.slice(1));

      // Find or construct patient context from catalog
      const patientData = resolveQueuePatient(next, patientsCatalog);

      // Load patient context into Medical Records & Prescriptions
      loadPatientContext(patientData);

      // Broadcast active serving status (#05) to Patient Portal and localStorage in real-time
      const activeTokUpdate = {
        token: `#${tokenKey}`,
        patientName: next.patientName,
        patientId: patientData.pid,
        currentlyServing: tokenKey,
        status: "In Consultation",
        estimatedTime: "10:15 AM",
        doctorName: doctorName(currentUser),
        department: "Cardiology",
      };
      localStorage.setItem(
        "nexus_active_token",
        JSON.stringify(activeTokUpdate),
      );
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(
        new CustomEvent("nexus_queue_updated", { detail: activeTokUpdate }),
      );

      showToast(
        `Now serving Token #${tokenKey}: ${next.patientName}. Record loaded into clinical examination workspace!`,
      );

      // Auto-navigate to clinical examination workspace
      setTimeout(() => {
        scrollToSection("medical-records-card", "MedicalRecords");
      }, 350);
    } else {
      showToast("No more waiting patients in queue.");
    }
  };

  const loadPatientContext = (patientData) => {
    setActiveMedicalPatient(patientData);
    setSymptomsText(patientData.symptoms || "");
    setDiagnosisText(patientData.diagnosis || "");
    setVitalsData(
      patientData.vitals || {
        bp: "124/80 mmHg",
        pulse: "74 bpm",
        temp: "98.6°F",
      },
    );

    // Update Prescriptions form with this patient
    setRxPatient({
      name: patientData.name,
      age: String(patientData.age),
      gender: patientData.gender,
      patientId: cleanPatientId(patientData.pid),
    });

    setMedicationsList(patientData.medications || []);
    setDiagnostics(
      patientData.diagnostics || {
        bloodTests: false,
        urineTest: false,
        xRay: false,
        ecg: false,
      },
    );
    setFollowUpAdvice(patientData.followUpAdvice || "");
  };

  const handleCheckIn = (token) => {
    const tokenKey = token.replace("#", "");
    const foundPatient = queueList.find((item) => item.token === token);
    if (!foundPatient) return;
    const patientData = resolveQueuePatient(foundPatient, patientsCatalog);
    loadPatientContext(patientData);
    setNowServing({
      token: tokenKey,
      patientName: patientData.name,
      age: patientData.age,
      room: patientData.room,
    });
    showToast(
      `Token ${token} (${patientData.name}) checked in and loaded into Medical Records.`,
    );

    setQueueList((prev) =>
      prev.map((item) =>
        item.token === token
          ? { ...item, status: "In Consultation", statusColor: "status-teal" }
          : item,
      ),
    );
  };

  const handleHold = () => {
    showToast(
      `Token #${nowServing.token} (${nowServing.patientName}) placed on Hold.`,
    );
  };

  const handleComplete = () => {
    showToast(
      `Token #${nowServing.token} (${nowServing.patientName}) consultation completed!`,
    );
  };

  // ==========================================
  // STEP 2: MEDICAL RECORDS STATE
  // ==========================================
  const [symptomsText, setSymptomsText] = useState(
    "Patient reports persistent mild chest tightness, slight shortness of breath when walking.",
  );
  const [diagnosisText, setDiagnosisText] = useState(
    "Suspected mild respiratory or cardiac effort under-exertion. Further testing required.",
  );
  const [vitalsData, setVitalsData] = useState({
    bp: "120/80 mmHg",
    pulse: "78 bpm",
    temp: "99.4°F",
  });

  // WORKFLOW ACTION 2: Doctor saves clinical notes
  const handleSaveClinicalNotes = () =>
    runAction(
      "notes",
      async () => {
        return savePatientUpdate(updatePatient, activeMedicalPatient, {
          diagnosis: diagnosisText,
        });
      },
      () => {
        const updated = {
          ...activeMedicalPatient,
          symptoms: symptomsText,
          diagnosis: diagnosisText,
          vitals: vitalsData,
        };
        setActiveMedicalPatient(updated);
        setPatientsCatalog((previous) => ({
          ...previous,
          [updated.token]: updated,
        }));
        showToast(
          "Diagnosis saved. Symptoms and vitals remain in this workspace.",
        );
      },
    );

  // WORKFLOW ACTION 2B: Inpatient Admission Order (Doctor -> Receptionist -> Nurse)
  const [targetWard, setTargetWard] = useState("Ward 3B");
  const [admissionStatus, setAdmissionStatus] = useState("");

  const handleIssueAdmissionOrder = async () => {
    const cleanName = activeMedicalPatient.name;
    const cleanPid = cleanPatientId(activeMedicalPatient.pid);

    const admissionPayload = {
      orderId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: cleanName,
      patientId: cleanPid,
      doctorName: doctorName(currentUser),
      ward: targetWard || "Ward 3B",
      bedNo: "",
      orderNotes: `Admit to ${targetWard || "Ward 3B"} - Inpatient hospitalization for clinical observation & intravenous respiratory therapy`,
      diagnosis: diagnosisText,
      status: "Pending Bed Allocation",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      issuedAt: new Date().toISOString(),
    };

    return runAction(
      "admission",
      () => {
        requireDatabasePatient(activeMedicalPatient);
        if (!cleanPid)
          throw new Error(
            "Select a patient with a Patient ID before issuing an admission.",
          );
        return createAdmission(admissionPayload);
      },
      () => {
        // 2. Save to localStorage for Receptionist BedAllocation view
        try {
          const existing = JSON.parse(
            localStorage.getItem("nexus_pending_admissions") || "[]",
          );
          const filtered = Array.isArray(existing)
            ? existing.filter((a) => a.patientId !== cleanPid)
            : [];
          localStorage.setItem(
            "nexus_pending_admissions",
            JSON.stringify([admissionPayload, ...filtered]),
          );
          localStorage.setItem(
            "nexus_latest_admission_order",
            JSON.stringify(admissionPayload),
          );
        } catch {
          localStorage.setItem(
            "nexus_pending_admissions",
            JSON.stringify([admissionPayload]),
          );
        }

        // 3. Dispatch real-time events
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(
          new CustomEvent("nexus_admission_ordered", {
            detail: admissionPayload,
          }),
        );

        setAdmissionStatus(
          `Admit to ${targetWard || "Ward 3B"} (Pending Bed Allocation)`,
        );
        showToast(
          `✓ Inpatient Admission Order issued: "Admit to ${targetWard || "Ward 3B"}" for ${cleanName} (PID: ${cleanPid})! Routed to Receptionist Bed Allocation.`,
        );
      },
    );
  };

  // ==========================================
  // STEP 3: PRESCRIPTIONS STATE
  // ==========================================
  const [rxPatient, setRxPatient] = useState({
    name: "Kamal Perera",
    age: "38",
    gender: "Male",
    patientId: "#P-1042",
  });

  const [currentMedInput, setCurrentMedInput] = useState({
    name: "Paracetamol 500mg",
    dosage: "500 mg",
    frequency: "Twice daily",
    duration: "3 days",
  });

  const [medicationsList, setMedicationsList] = useState([
    {
      id: 1,
      name: "Amoxicillin 500mg",
      dosage: "500 mg",
      frequency: "Twice daily",
      duration: "7 days",
      instructions: "After meals",
    },
    {
      id: 2,
      name: "Ibuprofen 400mg",
      dosage: "400 mg",
      frequency: "Twice daily",
      duration: "5 days",
      instructions: "With food",
    },
  ]);

  const [diagnostics, setDiagnostics] = useState({
    bloodTests: true,
    urineTest: false,
    xRay: true,
    ecg: true,
  });

  const [followUpAdvice, setFollowUpAdvice] = useState(
    "Take after meals. Drink plenty of water. Schedule a follow-up in 1 week.",
  );

  const handleAddMedication = () => {
    if (!currentMedInput.name.trim()) return;
    setMedicationsList([
      ...medicationsList,
      {
        id: crypto.randomUUID(),
        name: currentMedInput.name,
        dosage: currentMedInput.dosage,
        frequency: currentMedInput.frequency,
        duration: currentMedInput.duration,
        instructions: "As directed",
      },
    ]);
    showToast(`Added ${currentMedInput.name} to prescription.`);
  };

  const handleRemoveMedication = (id) => {
    setMedicationsList(medicationsList.filter((m) => m.id !== id));
  };

  // WORKFLOW ACTION 3: Doctor clicks [ Issue & Save Prescription ]
  const handleSavePrescription = async () => {
    const cleanName = rxPatient.name || activeMedicalPatient.name;
    const cleanPid = cleanPatientId(
      rxPatient.patientId || activeMedicalPatient.pid,
    );

    const rxPayload = {
      patientName: cleanName,
      patientId: cleanPid,
      doctorName: doctorName(currentUser),
      diagnosis:
        diagnosisText || "Acute bronchitis with mild bronchial irritation",
      symptoms: symptomsText,
      medications: medicationsList.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions:
          m.instructions ||
          (m.name.toLowerCase().includes("amoxicillin")
            ? "After meals"
            : "With food"),
      })),
      followUpAdvice,
      vitals: vitalsData,
      status: "Pending Dispensing",
      issuedAt: new Date().toISOString(),
    };

    return runAction(
      "prescription",
      () => {
        requireDatabasePatient(activeMedicalPatient);
        if (cleanPid !== cleanPatientId(activeMedicalPatient.pid))
          throw new Error(
            "The prescription Patient ID must match the selected patient.",
          );
        if (!cleanPid || !medicationsList.length)
          throw new Error("Select a patient and add at least one medication.");
        return createPrescription(rxPayload);
      },
      () => {
        // 2. Dispatch to Patient Portal: Prescriptions tab & MyRecords tab
        const patientRxList = rxPayload.medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        }));
        localStorage.setItem(
          "nexus_patient_prescriptions",
          JSON.stringify(patientRxList),
        );

        const updatedRecordEncounter = {
          id: Date.now(),
          date: `${new Date().toLocaleDateString()} - ${doctorName(currentUser)} Consultation`,
          notes: `Doctor diagnosis notes: ${rxPayload.diagnosis}. Symptoms: ${rxPayload.symptoms}. Vitals: BP ${vitalsData.bp}, Pulse ${vitalsData.pulse}, Temp ${vitalsData.temp}. Prescribed: ${rxPayload.medications.map((m) => m.name).join(", ")}. Follow-up: ${rxPayload.followUpAdvice}`,
        };
        localStorage.setItem(
          "nexus_patient_latest_record",
          JSON.stringify(updatedRecordEncounter),
        );

        // 3. Dispatch to Hospital Pharmacy Queue (for dispensing verification and fulfillment)
        const pharmacyOrder = {
          orderId: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: rxPayload.patientName,
          patientId: rxPayload.patientId,
          doctorName: rxPayload.doctorName,
          diagnosis: rxPayload.diagnosis,
          medications: rxPayload.medications,
          status: "Pending Verification",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        try {
          const existingQueue = JSON.parse(
            localStorage.getItem("nexus_pharmacy_queue") || "[]",
          );
          const filteredQueue = Array.isArray(existingQueue)
            ? existingQueue.filter((q) => q.patientId !== rxPayload.patientId)
            : [];
          localStorage.setItem(
            "nexus_pharmacy_queue",
            JSON.stringify([pharmacyOrder, ...filteredQueue]),
          );
        } catch {
          localStorage.setItem(
            "nexus_pharmacy_queue",
            JSON.stringify([pharmacyOrder]),
          );
        }

        // 4. Trigger instant real-time synchronization across views
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(
          new CustomEvent("nexus_prescription_issued", { detail: rxPayload }),
        );

        showToast(
          `✓ Prescription issued for ${cleanName} (PID: ${cleanPid})! Dispatched to Hospital Pharmacy Queue & Patient Portal (Prescriptions & MyRecords).`,
        );
      },
    );
  };

  const handleCancelPrescription = () => {
    setMedicationsList([]);
    setFollowUpAdvice("");
    showToast("Prescription cleared.");
  };

  // ==========================================
  // STEP 4: WARD ROUNDS STATE
  // ==========================================
  // WORKFLOW ACTION 4: Doctor clicks [ Approve Discharge ]
  const handleApproveDischarge = (patientItem) =>
    runAction(
      "discharge",
      async () => {
        return savePatientUpdate(updatePatient, patientItem, {
          status: "Discharge Approved",
        });
      },
      () => {
        const clearanceData = {
          patientName: patientItem.patientName,
          bedNo: patientItem.bedNo,
          pid: patientItem.patientId || "",
          doctorName: doctorName(currentUser),
          doctorClearance: `Cleared by ${doctorName(currentUser)}`,
          clearanceDate: new Date().toLocaleDateString(),
          timestamp: new Date().toLocaleTimeString(),
          status: "Cleared by Doctor - Ready for Financial Settlement",
          isDoctorCleared: true,
        };
        setWardPatients((previous) =>
          previous.map((item) =>
            item.id === patientItem.id
              ? {
                  ...item,
                  condition: "Discharged",
                  conditionColor: "cond-discharged",
                }
              : item,
          ),
        );
        localStorage.setItem(
          "nexus_discharge_clearance",
          JSON.stringify(clearanceData),
        );
        window.dispatchEvent(
          new CustomEvent("nexus_discharge_approved", {
            detail: clearanceData,
          }),
        );
        showToast(`Discharge approved for ${patientItem.patientName}.`);
      },
    );

  const handleLogout = async () => {
    if (!(await logoutUser())) return;
    navigate("/login");
  };

  // Doctor display name connected to user registration/database login
  const doctorDisplayName = doctorName(currentUser);

  // Calculate dynamic bed counts
  const dischargedCount = wardPatients.filter(
    (p) => p.condition === "Discharged",
  ).length;
  const activeAdmitted = 28 - dischargedCount;
  const availableBeds = 4 + dischargedCount;

  return (
    <div className="doc-page-wrapper">
      {(actionError || syncError) && (
        <p className="alert-box alert-error" role="alert">
          {actionError || syncError}
        </p>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="doc-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          HERO BANNER
          Uses /doctor-page.jpg from public
          NexusHealth logo top-left
          Dr.user pill button under "Your Family" words
          No online button (as requested)
          ======================================================== */}
      <section className="doc-hero-section">
        <div className="doc-hero-container">
          <div className="doc-hero-img-wrap">
            <img
              src="/doctor-page.jpg"
              alt="Doctor Consultation and Healthcare"
              className="doc-hero-bg-img"
              onError={(e) => {
                e.currentTarget.src = "/doctor page .jpg";
              }}
            />
          </div>

          {/* NexusHealth Logo in top-left position */}
          <div className="doc-hero-logo-box">
            <Link to="/" title="Go to Home">
              <img
                src="/health-logo.png"
                alt="NexusHealth Logo"
                className="doc-hero-logo-img"
                onError={(e) => {
                  if (
                    e.currentTarget.getAttribute("src") !== "/health logo.png"
                  ) {
                    e.currentTarget.src = "/health logo.png";
                  }
                }}
              />
            </Link>
          </div>

          {/* Top-right Sign Out button */}
          <div className="doc-hero-top-right">
            <button
              onClick={handleLogout}
              className="doc-logout-pill"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>

          {/* Left Text Overlay: 2 single lines with Dr.user badge under them */}
          <div className="doc-hero-left-overlay">
            <h1 className="doc-hero-custom-heading">
              Your Health, Our Priority
            </h1>
            <p className="doc-hero-custom-subheading">
              Compassionate Care for You and Your Family
            </p>
            <div className="doc-hero-btn-wrap">
              <button
                className="doc-hero-user-badge"
                title="Doctor Profile"
                onClick={() => showToast(`Signed in as ${doctorDisplayName}`)}
              >
                {doctorDisplayName}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2-COLOR WORKFLOW LAYOUT:
          Left Column (Sidebar): #B0E5DD
          Right Column (Cards Stream): #DAEFEC
          ======================================================== */}
      <div className="doc-dashboard-layout">
        {/* LEFT COLUMN: Sidebar Navigation with charming rectangle borders and staggered entrance (#B0E5DD) */}
        <aside className="doc-sidebar-col">
          <nav className="doc-nav-menu">
            <button
              className={`doc-nav-item doc-nav-anim-1 ${activeNav === "PatientQueue" ? "active" : ""}`}
              onClick={() =>
                scrollToSection("patient-queue-card", "PatientQueue")
              }
              title="View Patient Queue"
            >
              <span className="doc-nav-text">PatientQueue</span>
              <span className="doc-nav-indicator" aria-hidden="true">
                ›
              </span>
            </button>

            <button
              className={`doc-nav-item doc-nav-anim-2 ${activeNav === "WardRounds" ? "active" : ""}`}
              onClick={() => scrollToSection("ward-rounds-card", "WardRounds")}
              title="View Inpatient Ward Rounds"
            >
              <span className="doc-nav-text">WardRounds</span>
              <span className="doc-nav-indicator" aria-hidden="true">
                ›
              </span>
            </button>

            <button
              className={`doc-nav-item doc-nav-anim-3 ${activeNav === "Prescriptions" ? "active" : ""}`}
              onClick={() =>
                scrollToSection("prescriptions-card", "Prescriptions")
              }
              title="Create New Prescription"
            >
              <span className="doc-nav-text">Prescriptions</span>
              <span className="doc-nav-indicator" aria-hidden="true">
                ›
              </span>
            </button>

            <button
              className={`doc-nav-item doc-nav-anim-4 ${activeNav === "MedicalReports" ? "active" : ""}`}
              onClick={() =>
                scrollToSection("medical-records-card", "MedicalReports")
              }
              title="View Clinical Reports & History"
            >
              <span className="doc-nav-text">MedicalReports</span>
              <span className="doc-nav-indicator" aria-hidden="true">
                ›
              </span>
            </button>
          </nav>
        </aside>

        {/* RIGHT COLUMN: 4 Workflow Dashboard Cards (#DAEFEC) */}
        <main className="doc-main-col">
          <div className="doc-cards-stream">
            {/* ----------------------------------------------------
                WORKFLOW STEP 1: PATIENT QUEUE (Matching Image 1)
                Reception assigns token -> Doctor views live queue
                Action: Doctor clicks [ Call Next Patient ]
                ---------------------------------------------------- */}
            <PatientQueueCard
              showToast={showToast}
              nowServing={nowServing}
              queueList={queueList}
              handleCallNext={handleCallNext}
              handleCheckIn={handleCheckIn}
              handleHold={handleHold}
              handleComplete={handleComplete}
            />

            {/* ----------------------------------------------------
                WORKFLOW STEP 4: WARD ROUNDS (Matching Image 1)
                Tracks admitted inpatients, bed assignments, & conditions
                Reviews continuous nurse monitoring logs
                Action: Doctor clicks [ Approve Discharge ] upon recovery
                ---------------------------------------------------- */}
            <WardRoundsCard
              pendingActions={pendingActions}
              showToast={showToast}
              wardTab={wardTab}
              setWardTab={setWardTab}
              wardPatients={wardPatients}
              handleApproveDischarge={handleApproveDischarge}
              activeAdmitted={activeAdmitted}
              availableBeds={availableBeds}
            />

            {/* ----------------------------------------------------
                WORKFLOW STEP 3: PRESCRIPTIONS (Matching Image 2)
                Prescribes medications (drug, dosage, duration, route)
                Requests diagnostic lab tests (FBC, urinalysis, X-ray)
                Action: Doctor clicks [ Issue & Save Prescription ]
                ---------------------------------------------------- */}
            <PrescriptionCard
              pendingActions={pendingActions}
              rxPatient={rxPatient}
              setRxPatient={setRxPatient}
              currentMedInput={currentMedInput}
              setCurrentMedInput={setCurrentMedInput}
              medicationsList={medicationsList}
              diagnostics={diagnostics}
              setDiagnostics={setDiagnostics}
              followUpAdvice={followUpAdvice}
              setFollowUpAdvice={setFollowUpAdvice}
              handleAddMedication={handleAddMedication}
              handleRemoveMedication={handleRemoveMedication}
              handleSavePrescription={handleSavePrescription}
              handleCancelPrescription={handleCancelPrescription}
            />

            {/* ----------------------------------------------------
                WORKFLOW STEP 2: MEDICAL RECORDS (Matching Image 2)
                Displays allergy alerts, blood type, and past encounters
                Nurse logs initial vitals (BP, pulse, temp)
                Doctor inputs symptoms & updates clinical diagnosis
                Action: Doctor saves clinical notes
                ---------------------------------------------------- */}
            <MedicalRecordsCard
              pendingActions={pendingActions}
              activeMedicalPatient={activeMedicalPatient}
              symptomsText={symptomsText}
              setSymptomsText={setSymptomsText}
              diagnosisText={diagnosisText}
              setDiagnosisText={setDiagnosisText}
              vitalsData={vitalsData}
              handleSaveClinicalNotes={handleSaveClinicalNotes}
              targetWard={targetWard}
              setTargetWard={setTargetWard}
              admissionStatus={admissionStatus}
              handleIssueAdmissionOrder={handleIssueAdmissionOrder}
            />
          </div>
        </main>
      </div>

      {/* ========================================================
          FOOTER (SAME AS PREVIOUS PAGE)
          ======================================================== */}
      <Footer />
    </div>
  );
}

export default Doctor;
