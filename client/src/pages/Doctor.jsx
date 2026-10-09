import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getPatients, getAppointments, updatePatient, createPrescription, createAdmission } from "../services/api";

// Catalog of patient clinical profiles supporting the connected workflow
const initialPatientsCatalog = {
  "04": {
    token: "04",
    name: "Kavindi Jayawardena",
    age: 34,
    gender: "Female",
    pid: "P-88210",
    room: "02",
    bloodGroup: "A+",
    allergy: "None known",
    vitals: { bp: "118/76 mmHg", pulse: "72 bpm", temp: "98.6°F" },
    pastHistory: [
      { date: "Jan 12, 2026 - Routine Health Checkup", desc: "All baseline labs normal, healthy recovery." },
      { date: "Aug 05, 2025 - ENT Consultation", desc: "Treated for seasonal allergic rhinitis." }
    ],
    symptoms: "Mild fever and sore throat for 3 days, mild fatigue.",
    diagnosis: "Acute viral pharyngitis. Conservative symptomatic care.",
    medications: [
      { id: 1, name: "Amoxicillin", dosage: "500 mg", frequency: "Twice daily", duration: "7 days" },
      { id: 2, name: "Ibuprofen", dosage: "400 mg", frequency: "Once daily", duration: "5 days" }
    ],
    diagnostics: { bloodTests: true, urineTest: false, xRay: false, ecg: false },
    followUpAdvice: "Take after meals. Drink plenty of water. Schedule a follow-up in 2 weeks."
  },
  "05": {
    token: "05",
    name: "Kamal Perera",
    age: 38,
    gender: "Male",
    pid: "P-1042",
    room: "02",
    bloodGroup: "O+",
    allergy: "Penicillin",
    vitals: { bp: "124/80 mmHg", pulse: "74 bpm", temp: "98.6°F" },
    pastHistory: [
      { date: "Oct 09, 2026 - OPD Intake", desc: "Front-desk registration completed, token assigned." },
      { date: "May 14, 2025 - Routine Health Check", desc: "All baseline labs normal, healthy recovery." }
    ],
    symptoms: "Mild chest tightness upon exertion, persistent dry cough for 2 days.",
    diagnosis: "Early exertion-related bronchial irritation. Conservative symptomatic care.",
    medications: [
      { id: 1, name: "Salbutamol Inhaler", dosage: "100 mcg", frequency: "As needed", duration: "14 days" },
      { id: 2, name: "Paracetamol", dosage: "500 mg", frequency: "Twice daily", duration: "5 days" }
    ],
    diagnostics: { bloodTests: true, urineTest: false, xRay: true, ecg: true },
    followUpAdvice: "Rest adequately. Return immediately if breathlessness or tightness worsens."
  },
  "06": {
    token: "06",
    name: "Nalani Wickramasinghe",
    age: 29,
    gender: "Female",
    pid: "P-2045",
    room: "02",
    bloodGroup: "B+",
    allergy: "Sulfa drugs",
    vitals: { bp: "112/70 mmHg", pulse: "80 bpm", temp: "99.1°F" },
    pastHistory: [
      { date: "Nov 02, 2025 - Neurology Clinic", desc: "Evaluated for recurring migraine episodes." }
    ],
    symptoms: "Unilateral throbbing headache, photophobia and nausea since yesterday.",
    diagnosis: "Acute migraine attack with moderate tension headache.",
    medications: [
      { id: 1, name: "Sumatriptan", dosage: "50 mg", frequency: "Once daily", duration: "3 days" },
      { id: 2, name: "Paracetamol", dosage: "650 mg", frequency: "Twice daily", duration: "3 days" }
    ],
    diagnostics: { bloodTests: false, urineTest: false, xRay: false, ecg: false },
    followUpAdvice: "Rest in a quiet, dark room. Maintain hydration and keep a headache diary."
  },
  "07": {
    token: "07",
    name: "Nuwan Pradeep",
    age: 58,
    gender: "Male",
    pid: "P-3089",
    room: "02",
    bloodGroup: "AB-",
    allergy: "Aspirin",
    vitals: { bp: "142/90 mmHg", pulse: "88 bpm", temp: "99.8°F" },
    pastHistory: [
      { date: "Mar 10, 2026 - Pulmonology Review", desc: "Chronic bronchitis with moderate wheezing." }
    ],
    symptoms: "Productive cough with yellowish sputum, shortness of breath on exertion.",
    diagnosis: "Exacerbation of chronic bronchitis. Inpatient observation advised if oxygen dips.",
    medications: [
      { id: 1, name: "Azithromycin", dosage: "500 mg", frequency: "Once daily", duration: "5 days" },
      { id: 2, name: "Salbutamol Inhaler", dosage: "100 mcg", frequency: "Three times daily", duration: "7 days" }
    ],
    diagnostics: { bloodTests: true, urineTest: false, xRay: true, ecg: false },
    followUpAdvice: "Monitor SpO2 twice daily. Return immediately if breathlessness worsens."
  },
  "08": {
    token: "08",
    name: "Kamal Perera",
    age: 38,
    gender: "Male",
    pid: "P-1042",
    room: "02",
    bloodGroup: "O+",
    allergy: "Penicillin",
    vitals: { bp: "120/80 mmHg", pulse: "78 bpm", temp: "99.4°F" },
    pastHistory: [
      { date: "Oct 2, 2026 - GP Consultation", desc: "Treated for viral fever, recovery good." },
      { date: "Sep 14, 2026 - Cardiology Checkup", desc: "Routine ECG clear." }
    ],
    symptoms: "Patient reports persistent mild chest tightness, slight shortness of breath when walking.",
    diagnosis: "Suspected mild respiratory or cardiac effort under-exertion. Further testing required.",
    medications: [
      { id: 1, name: "Ibuprofen", dosage: "400 mg", frequency: "Once daily", duration: "5 days" },
      { id: 2, name: "Metformin", dosage: "500 mg", frequency: "Twice daily", duration: "14 days" }
    ],
    diagnostics: { bloodTests: true, urineTest: false, xRay: false, ecg: true },
    followUpAdvice: "Take after meals. Drink plenty of water. Schedule a follow-up in 2 weeks."
  }
};

function Doctor() {
  const navigate = useNavigate();

  // Retrieve logged-in doctor from database session
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeNav, setActiveNav] = useState("PatientQueue");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Connected Patient Database / Catalog
  const [patientsCatalog, setPatientsCatalog] = useState(initialPatientsCatalog);

  // Active Patient in Context (Initially Kamal Perera for Medical Records, Kavindi for Queue)
  const [activeMedicalPatient, setActiveMedicalPatient] = useState(initialPatientsCatalog["08"]);

  // ==========================================
  // STEP 1: PATIENT QUEUE STATE
  // ==========================================
  const [nowServing, setNowServing] = useState({
    token: "04",
    patientName: "Kavindi Jayawardena",
    age: 34,
    room: "02"
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
            statusColor: "status-mint"
          },
          {
            token: "#06",
            patientName: "Nalani Wickramasinghe",
            age: 29,
            estimatedTime: "10:30 AM",
            status: "Waiting",
            statusColor: "status-mint"
          },
          {
            token: "#07",
            patientName: "Nuwan Pradeep",
            age: 58,
            estimatedTime: "11:00 AM",
            status: "Scheduled",
            statusColor: "status-blue"
          }
        ];
      }
    } catch {}
    return [
      {
        token: "#05",
        patientName: "Kamal Perera",
        age: 38,
        estimatedTime: "10:15 AM",
        status: "Waiting",
        statusColor: "status-mint"
      },
      {
        token: "#06",
        patientName: "Nalani Wickramasinghe",
        age: 29,
        estimatedTime: "10:30 AM",
        status: "Waiting",
        statusColor: "status-mint"
      },
      {
        token: "#07",
        patientName: "Nuwan Pradeep",
        age: 58,
        estimatedTime: "11:00 AM",
        status: "Scheduled",
        statusColor: "status-blue"
      }
    ];
  });

  // Load backend database appointments & sync with Receptionist token updates in real-time
  useEffect(() => {
    const fetchDbData = async () => {
      try {
        const [patientsRes, apptsRes] = await Promise.allSettled([
          getPatients(),
          getAppointments()
        ]);

        if (apptsRes.status === "fulfilled" && Array.isArray(apptsRes.value.data) && apptsRes.value.data.length > 0) {
          const dbAppts = apptsRes.value.data.map((appt, idx) => ({
            token: `#${String(appt.tokenNumber || idx + 5).padStart(2, "0")}`,
            patientName: appt.patientName,
            age: 38,
            estimatedTime: appt.dateTime ? new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "10:15 AM",
            status: appt.status || "Waiting",
            statusColor: appt.status === "In Consultation" ? "status-teal" : appt.status === "Completed" ? "status-blue" : "status-mint"
          }));

          setQueueList((prev) => {
            const combined = [...dbAppts];
            prev.forEach((item) => {
              if (!combined.some((c) => c.token === item.token)) {
                combined.push(item);
              }
            });
            return combined;
          });
        }

        if (patientsRes.status === "fulfilled" && Array.isArray(patientsRes.value.data) && patientsRes.value.data.length > 0) {
          const dbInpatients = patientsRes.value.data
            .filter((p) => p.status === "Admitted")
            .map((p, idx) => ({
              id: p._id || idx + 100,
              bedNo: p.wardNumber || `20${idx + 4}-A`,
              patientName: p.name,
              admissionDate: new Date(p.admittedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              condition: "Stable",
              conditionColor: "cond-stable",
              nurseSummary: p.diagnosis || "Under active inpatient observation",
              actionType: "discharge",
              dbId: p._id
            }));

          if (dbInpatients.length > 0) {
            setWardPatients((prev) => {
              const merged = [...dbInpatients];
              prev.forEach((p) => {
                if (!merged.some((m) => m.bedNo === p.bedNo)) {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn("Using offline catalog due to database sync notice:", err);
      }
    };

    fetchDbData();

    // Event listener for instant token dispatch from Receptionist Portal
    const handleQueueUpdate = (event) => {
      let activeTok = event?.detail;
      if (!activeTok) {
        try {
          activeTok = JSON.parse(localStorage.getItem("nexus_active_token"));
        } catch {
          activeTok = null;
        }
      }

      if (activeTok && activeTok.token) {
        setQueueList((prev) => {
          const newEntry = {
            token: activeTok.token,
            patientName: activeTok.patientName || "Kamal Perera",
            age: activeTok.age || 38,
            estimatedTime: activeTok.estimatedTime || "10:15 AM",
            status: activeTok.status || "Waiting",
            statusColor: "status-mint"
          };
          return [newEntry, ...prev.filter((item) => item.token !== newEntry.token)];
        });
      }
    };

    const handleBedAllocated = (e) => {
      let allocated = e?.detail;
      if (!allocated) {
        try {
          allocated = JSON.parse(localStorage.getItem("nexus_allocated_bed"));
        } catch {
          allocated = null;
        }
      }
      if (allocated && allocated.patientName) {
        setWardPatients((prev) => {
          const entry = {
            id: Date.now(),
            bedNo: allocated.bedNo || "Bed-02A",
            patientName: allocated.patientName,
            admissionDate: "Oct 09, 2026",
            condition: "Stable",
            conditionColor: "cond-stable",
            nurseSummary: allocated.diagnosis || "Admitted under Ward 3B for continuous clinical care",
            actionType: "discharge",
            dbId: allocated.pid
          };
          return [entry, ...prev.filter((p) => p.bedNo !== entry.bedNo && p.patientName !== entry.patientName)];
        });
      }
    };

    window.addEventListener("nexus_queue_updated", handleQueueUpdate);
    window.addEventListener("nexus_bed_allocated", handleBedAllocated);
    window.addEventListener("storage", handleQueueUpdate);
    window.addEventListener("storage", handleBedAllocated);
    const interval = setInterval(fetchDbData, 3500);

    return () => {
      window.removeEventListener("nexus_queue_updated", handleQueueUpdate);
      window.removeEventListener("nexus_bed_allocated", handleBedAllocated);
      window.removeEventListener("storage", handleQueueUpdate);
      window.removeEventListener("storage", handleBedAllocated);
      clearInterval(interval);
    };
  }, []);

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
        room: "02"
      });

      setQueueList((prev) => prev.slice(1));

      // Find or construct patient context from catalog
      const patientData = patientsCatalog[tokenKey] || {
        token: tokenKey,
        name: next.patientName,
        age: next.age,
        gender: "Male",
        pid: next.patientId || `P-${1000 + parseInt(tokenKey, 10)}`,
        room: "02",
        bloodGroup: "O+",
        allergy: "Penicillin",
        vitals: { bp: "124/80 mmHg", pulse: "74 bpm", temp: "98.6°F" },
        pastHistory: [
          { date: "Oct 09, 2026 - OPD Intake", desc: "Front-desk registration completed, token assigned." }
        ],
        symptoms: "Persistent dry cough, mild chest tightness upon exertion.",
        diagnosis: "Acute bronchitis with mild bronchial irritation.",
        medications: [
          { id: 1, name: "Amoxicillin 500mg", dosage: "500 mg", frequency: "Twice daily", duration: "7 days", instructions: "After meals" },
          { id: 2, name: "Ibuprofen 400mg", dosage: "400 mg", frequency: "Twice daily", duration: "5 days", instructions: "With food" }
        ],
        diagnostics: { bloodTests: true, urineTest: false, xRay: true, ecg: true },
        followUpAdvice: "Take after meals. Drink plenty of water. Schedule a follow-up in 1 week."
      };

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
        doctorName: "Dr. Vance",
        department: "Cardiology"
      };
      localStorage.setItem("nexus_active_token", JSON.stringify(activeTokUpdate));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("nexus_queue_updated", { detail: activeTokUpdate }));

      showToast(`Now serving Token #${tokenKey}: ${next.patientName}. Record loaded into clinical examination workspace!`);

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
    setSymptomsText(patientData.symptoms || "Persistent dry cough, mild chest tightness upon exertion.");
    setDiagnosisText(patientData.diagnosis || "Acute bronchitis with mild bronchial irritation.");
    setVitalsData(patientData.vitals || { bp: "124/80 mmHg", pulse: "74 bpm", temp: "98.6°F" });

    // Update Prescriptions form with this patient
    setRxPatient({
      name: patientData.name,
      age: String(patientData.age),
      gender: patientData.gender,
      patientId: patientData.pid.startsWith("#") ? patientData.pid : `#${patientData.pid}`
    });

    if (patientData.medications) {
      setMedicationsList(patientData.medications);
    }
    if (patientData.diagnostics) {
      setDiagnostics(patientData.diagnostics);
    }
    if (patientData.followUpAdvice) {
      setFollowUpAdvice(patientData.followUpAdvice);
    }
  };

  const handleCheckIn = (token) => {
    const tokenKey = token.replace("#", "");
    const foundPatient = queueList.find((item) => item.token === token);
    const patientData = patientsCatalog[tokenKey];

    if (patientData) {
      loadPatientContext(patientData);
      setNowServing({
        token: tokenKey,
        patientName: patientData.name,
        age: patientData.age,
        room: "02"
      });
      showToast(`Token ${token} (${patientData.name}) checked in & loaded into Medical Records!`);
    } else if (foundPatient) {
      setNowServing({
        token: tokenKey,
        patientName: foundPatient.patientName,
        age: foundPatient.age,
        room: "02"
      });
      showToast(`Token ${token} (${foundPatient.patientName}) checked in!`);
    }

    setQueueList((prev) =>
      prev.map((item) =>
        item.token === token ? { ...item, status: "In Consultation", statusColor: "status-teal" } : item
      )
    );
  };

  const handleHold = () => {
    showToast(`Token #${nowServing.token} (${nowServing.patientName}) placed on Hold.`);
  };

  const handleComplete = () => {
    showToast(`Token #${nowServing.token} (${nowServing.patientName}) consultation completed!`);
  };

  // ==========================================
  // STEP 2: MEDICAL RECORDS STATE
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

  // WORKFLOW ACTION 2: Doctor saves clinical notes
  const handleSaveClinicalNotes = async () => {
    // Update local catalog
    const updated = {
      ...activeMedicalPatient,
      symptoms: symptomsText,
      diagnosis: diagnosisText,
      vitals: vitalsData
    };
    setActiveMedicalPatient(updated);
    setPatientsCatalog((prev) => ({
      ...prev,
      [activeMedicalPatient.token]: updated
    }));

    // If patient has MongoDB record, persist to backend
    if (activeMedicalPatient.dbId) {
      try {
        await updatePatient(activeMedicalPatient.dbId, { diagnosis: diagnosisText });
      } catch (e) {
        console.warn("Backend update notice:", e);
      }
    }

    showToast(`✓ Clinical notes & vitals saved for ${activeMedicalPatient.name}! Moving to Prescriptions.`);
  };

  // ==========================================
  // STEP 3: PRESCRIPTIONS STATE
  // ==========================================
  const [rxPatient, setRxPatient] = useState({
    name: "Kamal Perera",
    age: "38",
    gender: "Male",
    patientId: "#P-1042"
  });

  const [currentMedInput, setCurrentMedInput] = useState({
    name: "Paracetamol 500mg",
    dosage: "500 mg",
    frequency: "Twice daily",
    duration: "3 days"
  });

  const [medicationsList, setMedicationsList] = useState([
    { id: 1, name: "Amoxicillin 500mg", dosage: "500 mg", frequency: "Twice daily", duration: "7 days", instructions: "After meals" },
    { id: 2, name: "Ibuprofen 400mg", dosage: "400 mg", frequency: "Twice daily", duration: "5 days", instructions: "With food" }
  ]);

  const [diagnostics, setDiagnostics] = useState({
    bloodTests: true,
    urineTest: false,
    xRay: true,
    ecg: true
  });

  const [followUpAdvice, setFollowUpAdvice] = useState(
    "Take after meals. Drink plenty of water. Schedule a follow-up in 1 week."
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
        duration: currentMedInput.duration,
        instructions: "As directed"
      }
    ]);
    showToast(`Added ${currentMedInput.name} to prescription.`);
  };

  const handleRemoveMedication = (id) => {
    setMedicationsList(medicationsList.filter((m) => m.id !== id));
  };

  // WORKFLOW ACTION 3: Doctor clicks [ Issue & Save Prescription ]
  const handleSavePrescription = async () => {
    const cleanName = rxPatient.name || activeMedicalPatient.name || "Kamal Perera";
    const cleanPid = (rxPatient.patientId || activeMedicalPatient.pid || "P-1042").replace(/^#/, "");

    const rxPayload = {
      patientName: cleanName,
      patientId: cleanPid,
      doctorName: "Dr. Vance",
      diagnosis: diagnosisText || "Acute bronchitis with mild bronchial irritation",
      symptoms: symptomsText || "Persistent dry cough, mild chest tightness upon exertion",
      medications: medicationsList.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions || (m.name.toLowerCase().includes("amoxicillin") ? "After meals" : "With food")
      })),
      followUpAdvice: followUpAdvice || "Take after meals. Drink plenty of water. Schedule a follow-up in 1 week.",
      vitals: vitalsData,
      status: "Pending Dispensing",
      issuedAt: new Date().toISOString()
    };

    // 1. Post to backend server API
    try {
      await createPrescription(rxPayload);
    } catch {
      // offline fallback operates seamlessly
    }

    // 2. Dispatch to Patient Portal: Prescriptions tab & MyRecords tab
    const patientRxList = rxPayload.medications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions
    }));
    localStorage.setItem("nexus_patient_prescriptions", JSON.stringify(patientRxList));

    const updatedRecordEncounter = {
      id: Date.now(),
      date: `Today, Oct 09, 2026 - Dr. Vance Consultation`,
      notes: `Doctor diagnosis notes: ${rxPayload.diagnosis}. Symptoms: ${rxPayload.symptoms}. Vitals: BP ${vitalsData.bp}, Pulse ${vitalsData.pulse}, Temp ${vitalsData.temp}. Prescribed: ${rxPayload.medications.map((m) => m.name).join(", ")}. Follow-up: ${rxPayload.followUpAdvice}`
    };
    localStorage.setItem("nexus_patient_latest_record", JSON.stringify(updatedRecordEncounter));

    // 3. Dispatch to Hospital Pharmacy Queue (for dispensing verification and fulfillment)
    const pharmacyOrder = {
      orderId: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: rxPayload.patientName,
      patientId: rxPayload.patientId,
      doctorName: rxPayload.doctorName,
      diagnosis: rxPayload.diagnosis,
      medications: rxPayload.medications,
      status: "Pending Verification",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    try {
      const existingQueue = JSON.parse(localStorage.getItem("nexus_pharmacy_queue") || "[]");
      const filteredQueue = Array.isArray(existingQueue) ? existingQueue.filter((q) => q.patientName !== rxPayload.patientName) : [];
      localStorage.setItem("nexus_pharmacy_queue", JSON.stringify([pharmacyOrder, ...filteredQueue]));
    } catch {
      localStorage.setItem("nexus_pharmacy_queue", JSON.stringify([pharmacyOrder]));
    }

    // 4. Trigger instant real-time synchronization across views
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("nexus_prescription_issued", { detail: rxPayload }));

    showToast(`✓ Prescription issued for ${cleanName} (PID: ${cleanPid})! Dispatched to Hospital Pharmacy Queue & Patient Portal (Prescriptions & MyRecords).`);
  };

  const handleCancelPrescription = () => {
    showToast("Prescription cleared.");
  };

  // ==========================================
  // STEP 4: WARD ROUNDS STATE
  // ==========================================
  const [wardTab, setWardTab] = useState("Ward Rounds");
  const [wardPatients, setWardPatients] = useState([
    {
      id: 1,
      bedNo: "201-A",
      patientName: "Kasun Madusanka",
      admissionDate: "Oct 12, 2026",
      condition: "Stable",
      conditionColor: "cond-stable",
      nurseSummary: "Post-op recovery, vitals stable",
      actionType: "notes"
    },
    {
      id: 2,
      bedNo: "201-B",
      patientName: "Nalani Wickramasinghe",
      admissionDate: "Oct 14, 2026",
      condition: "Guarded",
      conditionColor: "cond-guarded",
      nurseSummary: "Awaiting labs, mild pain",
      actionType: "discharge"
    },
    {
      id: 3,
      bedNo: "203-A",
      patientName: "Nuwan Pradeep",
      admissionDate: "Oct 15, 2026",
      condition: "Critical",
      conditionColor: "cond-critical",
      nurseSummary: "On oxygen, close monitoring",
      actionType: "discharge"
    }
  ]);

  // WORKFLOW ACTION 4: Doctor clicks [ Approve Discharge ]
  const handleApproveDischarge = async (patientItem) => {
    showToast(`✓ Discharge approved for ${patientItem.patientName}! Bed ${patientItem.bedNo} is now available.`);
    setWardPatients((prev) =>
      prev.map((p) =>
        p.patientName === patientItem.patientName
          ? { ...p, condition: "Discharged", conditionColor: "cond-discharged" }
          : p
      )
    );

    if (patientItem.dbId) {
      try {
        await updatePatient(patientItem.dbId, { status: "Discharged" });
      } catch (e) {
        console.warn("Discharge database update notice:", e);
      }
    }
  };

  const isManualScroll = useRef(false);

  // Auto-switch sidebar active category as user scrolls down the page
  useEffect(() => {
    const sections = [
      { id: "patient-queue-card", nav: "PatientQueue" },
      { id: "ward-rounds-card", nav: "WardRounds" },
      { id: "prescriptions-card", nav: "Prescriptions" },
      { id: "medical-records-card", nav: "MedicalReports" }
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

  // Doctor display name connected to user registration/database login
  const doctorDisplayName = currentUser?.name
    ? (currentUser.name.startsWith("Dr.") ? currentUser.name : `Dr. ${currentUser.name}`)
    : "Dr. Priyantha Senanayake";

  // Calculate dynamic bed counts
  const dischargedCount = wardPatients.filter((p) => p.condition === "Discharged").length;
  const activeAdmitted = 28 - dischargedCount;
  const availableBeds = 4 + dischargedCount;

  return (
    <div className="doc-page-wrapper">
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
                  e.currentTarget.src = "/health logo.png";
                }}
              />
            </Link>
          </div>

          {/* Top-right Sign Out button */}
          <div className="doc-hero-top-right">
            <button onClick={handleLogout} className="doc-logout-pill" title="Sign Out">
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
              onClick={() => scrollToSection("patient-queue-card", "PatientQueue")}
              title="View Patient Queue"
            >
              <span className="doc-nav-text">PatientQueue</span>
              <span className="doc-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`doc-nav-item doc-nav-anim-2 ${activeNav === "WardRounds" ? "active" : ""}`}
              onClick={() => scrollToSection("ward-rounds-card", "WardRounds")}
              title="View Inpatient Ward Rounds"
            >
              <span className="doc-nav-text">WardRounds</span>
              <span className="doc-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`doc-nav-item doc-nav-anim-3 ${activeNav === "Prescriptions" ? "active" : ""}`}
              onClick={() => scrollToSection("prescriptions-card", "Prescriptions")}
              title="Create New Prescription"
            >
              <span className="doc-nav-text">Prescriptions</span>
              <span className="doc-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`doc-nav-item doc-nav-anim-4 ${activeNav === "MedicalReports" ? "active" : ""}`}
              onClick={() => scrollToSection("medical-records-card", "MedicalReports")}
              title="View Clinical Reports & History"
            >
              <span className="doc-nav-text">MedicalReports</span>
              <span className="doc-nav-indicator" aria-hidden="true">›</span>
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
            <div id="patient-queue-card" className="doc-card">
              <h2 className="doc-card-title">Patient Queue</h2>

              {/* Now Serving Strip */}
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

              {/* Queue Table */}
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
                                title="Load this patient into consultation"
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
                WORKFLOW STEP 4: WARD ROUNDS (Matching Image 1)
                Tracks admitted inpatients, bed assignments, & conditions
                Reviews continuous nurse monitoring logs
                Action: Doctor clicks [ Approve Discharge ] upon recovery
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
                      <strong>{activeAdmitted}</strong> Patients
                    </span>
                  </div>
                  <div className="doc-stat-white-pill">
                    <span className="doc-stat-pill-label">Bed Availability</span>
                    <span className="doc-stat-pill-val">
                      <strong>{availableBeds} / 32</strong> Beds Available
                    </span>
                  </div>
                </div>

                <div className="doc-summary-icons-right">
                  <button
                    className="doc-square-icon-btn"
                    title="Ward Patients"
                    onClick={() => showToast(`Total admitted patients: ${activeAdmitted}`)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </button>
                  <button
                    className="doc-square-icon-btn"
                    title="Bed Map"
                    onClick={() => showToast(`Available beds: ${availableBeds} of 32`)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 7h-8v6H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4zm-9 4H5V8h5v3z"/>
                    </svg>
                  </button>
                  <button
                    className="doc-square-icon-btn"
                    title="Observation Notes"
                    onClick={() => showToast("Opening nurse monitoring logs")}
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
                              disabled={p.condition === "Discharged"}
                              onClick={() => handleApproveDischarge(p)}
                            >
                              {p.condition === "Discharged" ? "✓ Discharged" : "✓ Approve Discharge"}
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
                WORKFLOW STEP 3: PRESCRIPTIONS (Matching Image 2)
                Prescribes medications (drug, dosage, duration, route)
                Requests diagnostic lab tests (FBC, urinalysis, X-ray)
                Action: Doctor clicks [ Issue & Save Prescription ]
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
                WORKFLOW STEP 2: MEDICAL RECORDS (Matching Image 2)
                Displays allergy alerts, blood type, and past encounters
                Nurse logs initial vitals (BP, pulse, temp)
                Doctor inputs symptoms & updates clinical diagnosis
                Action: Doctor saves clinical notes
                ---------------------------------------------------- */}
            <div id="medical-records-card" className="doc-card">
              <h2 className="doc-card-title">Medical Reports</h2>

              {/* Header Info Strip */}
              <div className="doc-patient-top-strip">
                <div className="doc-patient-info-left">
                  <strong>{activeMedicalPatient.name} (PID: {activeMedicalPatient.pid})</strong> &bull; {activeMedicalPatient.age} Yrs / {activeMedicalPatient.gender} &bull; Blood: {activeMedicalPatient.bloodGroup}
                </div>
                <div className="doc-allergy-chip">
                  Allergy: {activeMedicalPatient.allergy}
                </div>
              </div>

              {/* Two Column Layout: Past History & Clinical Diagnosis */}
              <div className="doc-record-split-grid">
                {/* Left: Past History */}
                <div className="doc-history-col">
                  <h3 className="doc-record-heading">Past History</h3>

                  <div className="doc-timeline-wrapper">
                    {activeMedicalPatient.pastHistory?.map((item, idx) => (
                      <div key={idx} className="doc-timeline-item">
                        <div className="doc-timeline-circle"></div>
                        {idx < activeMedicalPatient.pastHistory.length - 1 && (
                          <div className="doc-timeline-line"></div>
                        )}
                        <div className="doc-timeline-card">
                          <h4 className="doc-timeline-title">{item.date}</h4>
                          <p className="doc-timeline-body">{item.desc}</p>
                        </div>
                      </div>
                    ))}
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

                  {/* Vitals logged by nurse and Save Button */}
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
