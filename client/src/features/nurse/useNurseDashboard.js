import { createActionRunner } from "../shared/actionRunner";
import {
  saveMedication,
  medicationSchedule,
  validateVitals,
  prepareHandover,
} from "./nurseWorkflows";
import useNurseNotice from "./useNurseNotice";
import useNurseSync from "./useNurseSync";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser, administerMedication } from "../../services/api";
import useNurseNavigation from "./useNurseNavigation";
export default function useNurseDashboard() {
  const navigate = useNavigate();

  // Retrieve logged-in session
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { activeNav, scrollToSection } = useNurseNavigation();
  const { toastMessage, showToast } = useNurseNotice();
  const [runAction] = useState(() =>
    createActionRunner({
      onPending: () => {},
      onError: (message) => {
        if (message) showToast(message);
      },
    }),
  );
  const [syncVersion, setSyncVersion] = useState(0);
  const selection = useRef(null);
  const [vitalsByPatient, setVitalsByPatient] = useState({});

  // Nurse display name
  const nurseDisplayName = currentUser?.name
    ? `Nurse ${currentUser.name}`
    : "Mr/Ms User";

  // ==========================================
  // SECTION 1: WARD MONITORING STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const [inpatientList, setInpatientList] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_allocated_bed");
      if (stored) {
        const allocated = JSON.parse(stored);
        if (allocated && allocated.patientName) {
          return [
            {
              bedNo: allocated.bedNo || "Bed-02A",
              patientName: allocated.patientName,
              pid: allocated.pid || "P-1042",
              age: allocated.age || 38,
              gender: allocated.gender || "Male",
              bloodGroup: allocated.bloodGroup || "O+",
              allergy: allocated.allergy || "Penicillin",
              admissionDate: allocated.admissionDate || "Oct 09, 2026",
              condition: allocated.condition || "Stable",
              conditionColor: allocated.conditionColor || "nurse-cond-stable",
              attendingPhysician: allocated.attendingPhysician || "Dr. Vance",
            },
            {
              bedNo: "Bed-01B",
              patientName: "Kavindi Jayawardena",
              pid: "P-88219",
              age: 34,
              gender: "Female",
              bloodGroup: "B+",
              allergy: "Penicillin",
              admissionDate: "Oct 12, 2026",
              condition: "Stable",
              conditionColor: "nurse-cond-stable",
              attendingPhysician: "Dr. Priyantha Senanayake",
            },
            {
              bedNo: "Bed-02B",
              patientName: "Nuwan Pradeep",
              pid: "P-30891",
              age: 58,
              gender: "Male",
              bloodGroup: "AB-",
              allergy: "Aspirin",
              admissionDate: "Oct 10, 2026",
              condition: "Under Observation",
              conditionColor: "nurse-cond-observation",
              attendingPhysician: "Dr. Senanayake",
            },
            {
              bedNo: "Bed-03A",
              patientName: "Ruwani Dissanayake",
              pid: "P-44021",
              age: 42,
              gender: "Female",
              bloodGroup: "O+",
              allergy: "Sulfa",
              admissionDate: "Oct 11, 2026",
              condition: "Guarded",
              conditionColor: "nurse-cond-guarded",
              attendingPhysician: "Dr. Kanthi Rajapaksha",
            },
            {
              bedNo: "Bed-04C",
              patientName: "Surangi Senaratne",
              pid: "P-55209",
              age: 27,
              gender: "Female",
              bloodGroup: "A+",
              allergy: "None known",
              admissionDate: "Oct 13, 2026",
              condition: "Critical",
              conditionColor: "nurse-cond-critical",
              attendingPhysician: "Dr. Priyantha Senanayake",
            },
          ];
        }
      }
    } catch {
      // Unreadable legacy cache must not block authenticated backend refreshes.
    }

    return [
      {
        bedNo: "Bed-02A",
        patientName: "Kamal Perera",
        pid: "P-1042",
        age: 38,
        gender: "Male",
        bloodGroup: "O+",
        allergy: "Penicillin",
        admissionDate: "Oct 09, 2026",
        condition: "Stable",
        conditionColor: "nurse-cond-stable",
        attendingPhysician: "Dr. Vance",
      },
      {
        bedNo: "Bed-01B",
        patientName: "Kavindi Jayawardena",
        pid: "P-88219",
        age: 34,
        gender: "Female",
        bloodGroup: "B+",
        allergy: "Penicillin",
        admissionDate: "Oct 12, 2026",
        condition: "Stable",
        conditionColor: "nurse-cond-stable",
        attendingPhysician: "Dr. Priyantha Senanayake",
      },
      {
        bedNo: "Bed-02B",
        patientName: "Nuwan Pradeep",
        pid: "P-30891",
        age: 58,
        gender: "Male",
        bloodGroup: "AB-",
        allergy: "Aspirin",
        admissionDate: "Oct 10, 2026",
        condition: "Under Observation",
        conditionColor: "nurse-cond-observation",
        attendingPhysician: "Dr. Senanayake",
      },
      {
        bedNo: "Bed-03A",
        patientName: "Ruwani Dissanayake",
        pid: "P-44021",
        age: 42,
        gender: "Female",
        bloodGroup: "O+",
        allergy: "Sulfa",
        admissionDate: "Oct 11, 2026",
        condition: "Guarded",
        conditionColor: "nurse-cond-guarded",
        attendingPhysician: "Dr. Kanthi Rajapaksha",
      },
      {
        bedNo: "Bed-04C",
        patientName: "Surangi Senaratne",
        pid: "P-55209",
        age: 27,
        gender: "Female",
        bloodGroup: "A+",
        allergy: "None known",
        admissionDate: "Oct 13, 2026",
        condition: "Critical",
        conditionColor: "nurse-cond-critical",
        attendingPhysician: "Dr. Priyantha Senanayake",
      },
    ];
  });

  // Active Patient Context for Vital Recording & Medication Administration
  const [activePatient, setActivePatient] = useState({
    bedNo: "Bed-02A",
    patientName: "Kamal Perera",
    pid: "P-1042",
    age: 38,
    gender: "Male",
    bloodGroup: "O+",
    allergy: "Penicillin",
    admissionDate: "Oct 09, 2026",
    condition: "Stable",
    conditionColor: "nurse-cond-stable",
    attendingPhysician: "Dr. Vance",
  });

  // Load database patients and sync confirmed bed allocations from Receptionist Portal

  const handleOpenCareSheet = (patient) => {
    selection.current = Symbol();
    setActivePatient(patient);
    setActiveRxRecord(null);
    setMedSchedule([]);
    const vitals = vitalsByPatient[patient.pid];
    setVitalsInput(
      vitals?.input || {
        bpSys: "",
        bpDia: "",
        heartRate: "",
        temperature: "",
        spO2: "",
      },
    );
    setVitalTrends(vitals?.trends || []);
    showToast(
      `Loaded clinical care sheet for ${patient.patientName} (${patient.bedNo})`,
    );
    scrollToSection("vital-recording-card", "VitalRecording");
  };

  // Filtered patients
  const filteredPatients = inpatientList.filter((p) => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bedNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.attendingPhysician || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (selectedFilter === "All") return matchesSearch;
    return (
      matchesSearch &&
      p.condition.toLowerCase() === selectedFilter.toLowerCase()
    );
  });

  // ==========================================
  // SECTION 2: VITAL RECORDING STATE
  // ==========================================
  const [vitalsInput, setVitalsInput] = useState({
    bpSys: "120",
    bpDia: "80",
    heartRate: "78",
    temperature: "98.6",
    spO2: "98",
  });

  const [vitalTrends, setVitalTrends] = useState([
    "Previous: 118/78 mmHg (8 hrs ago)",
    "122/82 mmHg (16 hrs ago)",
    "120/80 mmHg (24 hrs ago)",
  ]);

  const handleLogVitals = (event) => {
    event.preventDefault();
    try {
      const input = validateVitals(vitalsInput, activePatient.pid);
      const trends = [
        `Latest: ${input.bpSys}/${input.bpDia} mmHg (Just now)`,
        ...vitalTrends.slice(0, 2),
      ];
      setVitalTrends(trends);
      setVitalsByPatient((previous) => ({
        ...previous,
        [activePatient.pid]: { input, trends },
      }));
      showToast(
        `Vitals recorded in this workspace for ${activePatient.patientName}. Server storage is not configured.`,
      );
    } catch (error) {
      showToast(error.message);
    }
  };

  // ==========================================
  // SECTION 3: MEDICATION ADMINISTRATION & PHARMACY QUEUE STATE
  // ==========================================
  const [activeRxRecord, setActiveRxRecord] = useState(null);

  const [medSchedule, setMedSchedule] = useState([
    {
      id: 1,
      scheduledTime: "1) 08:00 AM",
      medName: "Amoxicillin 500mg",
      dosage: "500 mg",
      instructions: "After meals (Twice daily)",
      nurseVerification: "Pending Verification",
      status: "Mark Given",
      isAdministered: false,
    },
    {
      id: 2,
      scheduledTime: "2) 12:00 PM",
      medName: "Ibuprofen 400mg",
      dosage: "400 mg",
      instructions: "With food (Twice daily)",
      nurseVerification: "Pending Verification",
      status: "Mark Given",
      isAdministered: false,
    },
    {
      id: 3,
      scheduledTime: "3) 06:00 PM",
      medName: "Paracetamol 500mg",
      dosage: "500 mg",
      instructions: "As needed for fever/pain",
      nurseVerification: "Pending Verification",
      status: "Mark Given",
      isAdministered: false,
    },
  ]);

  // Load and listen for digital prescription orders from Doctor Portal & Backend DB

  const handleMarkMedGiven = (id) => {
    const selected = selection.current;
    return runAction(
      "medication",
      () =>
        saveMedication(
          { administerMedication },
          activeRxRecord,
          activePatient,
          id,
        ),
      ({ data }) => {
        if (selected !== selection.current) return;
        setActiveRxRecord({
          ...data,
          dbId: data._id,
          orderId: `RX-${data._id.slice(-4)}`,
        });
        setMedSchedule(medicationSchedule(data));
        setSyncVersion((version) => version + 1);
        const medication = data.medications.find((item) => item._id === id);
        showToast(
          `Medication administration saved: ${medication.name} for ${activePatient.patientName}.`,
        );
      },
    );
  };

  // ==========================================
  // SECTION 4: SHIFT HANDOVER STATE
  // ==========================================
  const [clinicalNotes, setClinicalNotes] = useState(
    "Bed-01A vitals stable; Bed-04 IV line replacement completed at 10:30 AM.",
  );
  const [handoverChecks, setHandoverChecks] = useState({
    reportDone: true,
    vitalsDone: false,
    fastingPrep: false,
  });
  const [oncomingNurseId, setOncomingNurseId] = useState("");

  const handleSubmitHandover = (event) => {
    event.preventDefault();
    try {
      const handover = prepareHandover(
        clinicalNotes,
        oncomingNurseId,
        handoverChecks,
      );
      showToast(
        `Handover prepared locally for ID: ${handover.nurseId}. Server submission is not configured.`,
      );
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleLogout = async () => {
    if (!(await logoutUser())) return;
    navigate("/login");
  };

  useEffect(() => {
    selection.current = Symbol();
    return () => {
      selection.current = Symbol();
    };
  }, [activePatient.pid]);

  useNurseSync({
    patientId: activePatient.pid,
    syncVersion,
    setInpatientList,
    setActivePatient,
    setActiveRxRecord,
    setMedSchedule,
    showToast,
  });

  return {
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
  };
}
