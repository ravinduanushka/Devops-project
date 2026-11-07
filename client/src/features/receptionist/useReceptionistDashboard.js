import useReceptionistSync from "./useReceptionistSync";
import { createActionRunner } from "../shared/actionRunner";
import {
  patientRegistrationPayload,
  tokenPayload,
  saveBedAllocation,
  saveDischarge,
} from "./receptionistWorkflows";
import useReceptionistNotice from "./useReceptionistNotice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  logoutUser,
  getPatients,
  createPatient,
  createAppointment,
  updatePatient,
  updateAdmission,
} from "../../services/api";
import useReceptionistNavigation from "./useReceptionistNavigation";

export default function useReceptionistDashboard() {
  const navigate = useNavigate();

  const { activeNav, scrollToSection } = useReceptionistNavigation();
  const { toastMessage, showToast } = useReceptionistNotice();
  const [runAction] = useState(() =>
    createActionRunner({
      onPending: () => {},
      onError: (message) => {
        if (message) showToast(message);
      },
    }),
  );

  const handleLogout = async () => {
    if (!(await logoutUser())) return;
    navigate("/login");
  };

  // ==========================================
  // SECTION 1: NEW PATIENT REGISTRATION STATE
  // ==========================================
  const [currentPatientId, setCurrentPatientId] = useState("P-1042");

  // Auto-generate fresh 5-digit Hospital Patient ID
  const generateNewPatientId = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `P-${randomDigits}`;
  };

  const [patientOptions, setPatientOptions] = useState([
    "Kamal Perera (PID: P-1042)",
    "Kamal Perera (NIC: 198812345678)",
    "Kavindi Jayawardena (ID: P-88210)",
    "Kasun Madusanka (ID: P-1033)",
    "Nalani Wickramasinghe (ID: P-2045)",
    "Nuwan Pradeep (ID: P-3089)",
    "Dinithi Fernando (ID: P-4012)",
  ]);

  const [regForm, setRegForm] = useState({
    fullName: "Kamal Perera",
    nicNumber: "198812345678",
    age: "38",
    gender: "Male",
    contactNumber: "+94 77 123 4567",
    bloodGroup: "O+",
    allergies: "Penicillin",
  });

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...regForm, [name]: value };
    setRegForm(updated);

    // Keep OPD Token Generation patient name synced while receptionist is typing
    if (name === "fullName") {
      const patientName = updated.fullName ? updated.fullName.trim() : "";
      setTokenForm((prev) => ({
        ...prev,
        searchPatient: patientName
          ? `${patientName} (PID: ${currentPatientId})`
          : "",
      }));
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();

    // 1. Auto-generate fresh new Patient ID upon clicking Register Patient
    const newPatientId = generateNewPatientId();

    let patientPayload;
    return runAction(
      "registration",
      () => {
        patientPayload = patientRegistrationPayload(regForm, newPatientId);
        return createPatient(patientPayload);
      },
      () => {
        setCurrentPatientId(newPatientId);
        const patientTag = `${regForm.fullName} (PID: ${newPatientId})`;

        // 2. Automatically transfer registered patient & new auto-generated ID to OPD Token Generation
        setTokenForm((prev) => ({
          ...prev,
          searchPatient: patientTag,
        }));

        // 3. Add to patient search options
        setPatientOptions((prev) => [
          patientTag,
          ...prev.filter((p) => p !== patientTag),
        ]);

        // 4. Update Bed Allocation & Discharge records with newly generated ID
        setBedAssignPatient((prev) => ({
          ...prev,
          name: regForm.fullName,
          id: newPatientId,
        }));

        setDischargeData((prev) => ({
          ...prev,
          patientName: regForm.fullName,
          pid: newPatientId,
        }));

        // Save to shared localStorage for immediate portal-wide sync
        localStorage.setItem(
          "nexus_registered_patient",
          JSON.stringify(patientPayload),
        );
        window.dispatchEvent(new Event("storage"));

        showToast(
          `✓ Patient ${regForm.fullName} (PID: ${newPatientId}) registered into hospital system! Proceeding to OPD Token Generation.`,
        );

        // 5. Instantly scroll receptionist to the OPD Token Generation section
        setTimeout(() => {
          scrollToSection("token-generation-card", "TokenGeneration");
        }, 350);
      },
    );
  };

  const handleCancelReg = () => {
    setRegForm({
      fullName: "",
      nicNumber: "",
      age: "",
      gender: "Male",
      contactNumber: "",
      bloodGroup: "O+",
      allergies: "",
    });
    setTokenForm((prev) => ({
      ...prev,
      searchPatient: "",
    }));
    showToast("Registration form reset.");
  };

  // ==========================================
  // SECTION 2: OPD TOKEN GENERATION STATE
  // ==========================================
  const [doctorsList, setDoctorsList] = useState([
    { name: "Dr. Vance", specialty: "Cardiology", fee: "Rs. 2,500 Paid" },
    {
      name: "Dr. Sanath Weerasinghe",
      specialty: "Pulmonology",
      fee: "Rs. 2,800 Paid",
    },
    {
      name: "Dr. Priyantha Senanayake",
      specialty: "Cardiology",
      fee: "Rs. 2,500 Paid",
    },
    {
      name: "Dr. Champa Gunasekara",
      specialty: "General Medicine",
      fee: "Rs. 2,000 Paid",
    },
    {
      name: "Dr. Malini Fernando",
      specialty: "Pediatrics",
      fee: "Rs. 2,200 Paid",
    },
  ]);

  const [tokenForm, setTokenForm] = useState({
    selectedDoctor: "Dr. Vance - Cardiology",
    clinicUnit: "Cardiology",
    searchPatient: "Kamal Perera (PID: P-1042)",
    tokenNumber: "Not issued",
    time: "10:15 AM",
    fee: "Rs. 2,500 Paid",
  });

  const handleDoctorTokenChange = (e) => {
    const val = e.target.value;
    const doc = doctorsList.find((d) => `${d.name} - ${d.specialty}` === val);
    setTokenForm({
      ...tokenForm,
      selectedDoctor: val,
      clinicUnit: doc ? doc.specialty : "General Medicine",
      fee: doc ? doc.fee : "Rs. 2,500 Paid",
    });
  };

  const handleIssueToken = async (e) => {
    e.preventDefault();
    let currentTokenNum, apptPayload;
    return runAction(
      "token",
      async () => {
        apptPayload = tokenPayload(tokenForm);
        const response = await createAppointment(apptPayload);
        if (
          !Number.isInteger(response.data?.tokenNumber) ||
          response.data.tokenNumber < 1
        )
          throw new Error(
            "The server response did not include a valid token. Refresh before trying again.",
          );
        currentTokenNum = String(response.data.tokenNumber).padStart(2, "0");
      },
      () => {
        const {
          patientName: cleanPatientName,
          patientId: extractedPid,
          doctorName: cleanDoctorName,
        } = apptPayload;
        // Live Queue Entry for Doctor Portal
        const activeQueueEntry = {
          token: `#${currentTokenNum}`,
          patientName: cleanPatientName,
          patientId: extractedPid,
          age: parseInt(regForm.age) || 38,
          estimatedTime: tokenForm.time || "10:15 AM",
          status: "Waiting",
          statusColor: "status-mint",
          doctorName: cleanDoctorName,
          department: tokenForm.clinicUnit,
          currentlyServing: "04",
        };

        // Broadcast state for Doctor Portal & Patient Portal via localStorage & events
        localStorage.setItem(
          "nexus_active_token",
          JSON.stringify(activeQueueEntry),
        );

        try {
          const existingQueue = JSON.parse(
            localStorage.getItem("nexus_queue_list") || "[]",
          );
          const filtered = Array.isArray(existingQueue)
            ? existingQueue.filter((q) => q.token !== activeQueueEntry.token)
            : [];
          localStorage.setItem(
            "nexus_queue_list",
            JSON.stringify([activeQueueEntry, ...filtered]),
          );
        } catch {
          localStorage.setItem(
            "nexus_queue_list",
            JSON.stringify([activeQueueEntry]),
          );
        }

        // Trigger instant real-time sync across open browser tabs & views
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(
          new CustomEvent("nexus_queue_updated", { detail: activeQueueEntry }),
        );

        showToast(
          `✓ OPD Token #${currentTokenNum} issued for ${tokenForm.searchPatient} assigned to ${cleanDoctorName}! Dispatched to Doctor Queue (#${currentTokenNum} Waiting) & Patient Portal.`,
        );
        setTokenForm((prev) => ({
          ...prev,
          tokenNumber: currentTokenNum,
        }));
      },
    );
  };

  // ==========================================
  // SECTION 3: BED ALLOCATION STATE
  // ==========================================
  const initialBeds = [
    { id: "Bed-01A", status: "occupied", patient: "Kavindi Jayawardena" },
    { id: "Bed-01B", status: "occupied", patient: "Kasun Madusanka" },
    { id: "Bed-01C", status: "occupied", patient: "Mohamed Rizwan" },
    { id: "Bed-02A", status: "available", patient: "" },
    { id: "Bed-02B", status: "available", patient: "" },
    { id: "Bed-03A", status: "occupied", patient: "Nuwan Pradeep" },
    { id: "Bed-03B", status: "occupied", patient: "Dilani Weerasinghe" },
    { id: "Bed-03C", status: "occupied", patient: "Nalani Wickramasinghe" },
    { id: "Bed-03D", status: "available", patient: "" },
    { id: "Bed-04A", status: "available", patient: "" },
    { id: "Bed-04B", status: "available", patient: "" },
    { id: "Bed-04C", status: "occupied", patient: "Dinesh Bandara" },
    { id: "Bed-04D", status: "available", patient: "" },
    { id: "Bed-05A", status: "available", patient: "" },
    { id: "Bed-05B", status: "available", patient: "" },
    { id: "Bed-05C", status: "occupied", patient: "Chamari Silva" },
    { id: "Bed-06A", status: "occupied", patient: "Sunil Shantha" },
    { id: "Bed-06B", status: "occupied", patient: "Anoma Jayasuriya" },
    { id: "Bed-06C", status: "available", patient: "" },
    { id: "Bed-06D", status: "occupied", patient: "Rohan De Silva" },
  ];

  const [bedsList, setBedsList] = useState(initialBeds);
  const [selectedBedToAssign, setSelectedBedToAssign] = useState("Bed-02A");
  const [pendingAdmissions, setPendingAdmissions] = useState([
    {
      orderId: "ADM-1042",
      patientName: "Kamal Perera",
      patientId: "P-1042",
      doctorName: "Dr. Vance",
      ward: "Ward 3B",
      orderNotes:
        "Admit to Ward 3B - Hospitalization required for clinical observation & intravenous respiratory therapy",
      diagnosis: "Acute bronchitis with mild bronchial irritation",
      status: "Pending Bed Allocation",
      timestamp: "10:20 AM",
    },
  ]);

  const [bedAssignPatient, setBedAssignPatient] = useState({
    name: "Kamal Perera",
    id: "P-1042",
    doctor: "Dr. Vance",
    ward: "Ward 3B",
    diagnosis: "Acute bronchitis with mild bronchial irritation",
  });

  const occupiedCount = bedsList.filter((b) => b.status === "occupied").length;
  const totalBeds = 32;

  // Real-time synchronization of Doctor admission orders

  const handleBedClick = (bed) => {
    if (bed.status === "available") {
      setSelectedBedToAssign(bed.id);
      showToast(`Selected ${bed.id} for assignment.`);
    } else {
      showToast(
        `${bed.id} is currently occupied by ${bed.patient || "another patient"}.`,
      );
    }
  };

  const handleConfirmBedAllocation = async (e) => {
    e.preventDefault();
    const bedId = selectedBedToAssign || "Bed-02A";

    return runAction(
      "bed",
      () =>
        saveBedAllocation(
          { updateAdmission },
          bedAssignPatient,
          bedsList.find((bed) => bed.id === bedId),
        ),
      () => {
        // 1. Update Bed grid state
        setBedsList((prev) =>
          prev.map((b) =>
            b.id === bedId
              ? { ...b, status: "occupied", patient: bedAssignPatient.name }
              : b,
          ),
        );

        // 2. Build allocated bed object
        const allocatedRecord = {
          bedNo: bedId,
          ward: bedAssignPatient.ward || "Ward 3B",
          patientName: bedAssignPatient.name || "Kamal Perera",
          pid: bedAssignPatient.id || "P-1042",
          age: 38,
          gender: "Male",
          bloodGroup: "O+",
          allergy: "Penicillin",
          admissionDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          condition: "Stable",
          conditionColor: "nurse-cond-stable",
          attendingPhysician: bedAssignPatient.doctor || "Dr. Vance",
          diagnosis:
            bedAssignPatient.diagnosis ||
            "Acute bronchitis with mild bronchial irritation",
        };

        // 4. Update localStorage and broadcast to Nurse Portal & Doctor Portal
        localStorage.setItem(
          "nexus_allocated_bed",
          JSON.stringify(allocatedRecord),
        );
        try {
          const stored = JSON.parse(
            localStorage.getItem("nexus_pending_admissions") || "[]",
          );
          const updatedPending = Array.isArray(stored)
            ? stored.filter((p) => p.patientId !== allocatedRecord.pid)
            : [];
          localStorage.setItem(
            "nexus_pending_admissions",
            JSON.stringify(updatedPending),
          );
          setPendingAdmissions(updatedPending);
        } catch {
          // Ignore unreadable initial cache; backend synchronization remains authoritative.
        }

        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(
          new CustomEvent("nexus_bed_allocated", { detail: allocatedRecord }),
        );

        showToast(
          `✓ Confirmed: Bed ${bedId} in Ward 3B allocated to ${allocatedRecord.patientName} (PID: ${allocatedRecord.pid})! Enrolled into Nurse WardMonitoring census.`,
        );
      },
    );
  };

  // ==========================================
  // SECTION 4: DISCHARGE & BILLING STATE
  // ==========================================
  const [dischargeData, setDischargeData] = useState(() => {
    try {
      const storedClearance = localStorage.getItem("nexus_discharge_clearance");
      if (storedClearance) {
        const parsed = JSON.parse(storedClearance);
        if (parsed && parsed.patientName) {
          return {
            patientName: parsed.patientName,
            bedNo: parsed.bedNo || "Bed-02A",
            pid: parsed.pid || "P-1042",
            currentStatus: "Doctor Cleared - Financial Settlement Ready",
            doctorClearance:
              parsed.doctorClearance || "Cleared by Dr. Robert Vance",
            nursingClearance: "Verified by Nurse K. Perera",
            charges: [
              {
                id: 1,
                item: `Room Charges (${parsed.bedNo || "Bed-02A"} in Ward 3B)`,
                amount: "8500",
              },
              {
                id: 2,
                item: "Doctor Visit Fees (Dr. Robert Vance)",
                amount: "4500",
              },
              {
                id: 3,
                item: "Pharmacy & Medication (Amoxicillin, Ibuprofen)",
                amount: "3500",
              },
              {
                id: 4,
                item: "Lab & Diagnostic Tests (ECG, Blood Profile)",
                amount: "2000",
              },
            ],
            totalAmount: "Rs. 18,500.00",
            paymentStatus: "Payment Completed",
            isCleared: false,
            isDoctorCleared: true,
          };
        }
      }
    } catch {
      // Ignore unreadable initial cache; backend synchronization remains authoritative.
    }

    return {
      patientName: "Kamal Perera",
      bedNo: "Bed-02A",
      pid: "P-1042",
      currentStatus: "Awaiting Clearance",
      doctorClearance: "Cleared by Dr. Robert Vance",
      nursingClearance: "Verified by Nurse K. Perera",
      charges: [
        { id: 1, item: "Room Charges (Bed-02A in Ward 3B)", amount: "8500" },
        { id: 2, item: "Doctor Visit Fees (Dr. Robert Vance)", amount: "4500" },
        {
          id: 3,
          item: "Pharmacy & Medication (Amoxicillin, Ibuprofen)",
          amount: "3500",
        },
        {
          id: 4,
          item: "Lab & Diagnostic Tests (ECG, Blood Profile)",
          amount: "2000",
        },
      ],
      totalAmount: "Rs. 18,500.00",
      paymentStatus: "Payment Completed",
      isCleared: false,
      isDoctorCleared: true,
    };
  });

  // Listen for doctor discharge clearance in real-time

  const calculateTotalBill = () => {
    const sum = dischargeData.charges.reduce((acc, c) => {
      const val = parseFloat(c.amount) || 0;
      return acc + val;
    }, 0);
    return `Rs. ${sum.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleChargeChange = (index, field, value) => {
    setDischargeData((prev) => {
      const nextCharges = [...prev.charges];
      nextCharges[index] = {
        ...nextCharges[index],
        [field]: value,
      };
      return {
        ...prev,
        charges: nextCharges,
      };
    });
  };

  const handleAddChargeItem = () => {
    const chargeId = crypto.randomUUID();
    setDischargeData((prev) => ({
      ...prev,
      charges: [...prev.charges, { id: chargeId, item: "", amount: "" }],
    }));
  };

  const handleRemoveChargeItem = (index) => {
    const chargeId = crypto.randomUUID();
    setDischargeData((prev) => {
      if (prev.charges.length <= 1) {
        return {
          ...prev,
          charges: [{ id: chargeId, item: "", amount: "" }],
        };
      }
      return {
        ...prev,
        charges: prev.charges.filter((_, idx) => idx !== index),
      };
    });
  };

  const handleGenerateDischarge = async (e) => {
    e.preventDefault();
    return runAction(
      "discharge",
      () => saveDischarge({ getPatients, updatePatient }, dischargeData),
      () => {
        const finalTotal = calculateTotalBill();
        const freedBedNo = dischargeData.bedNo || "Bed-02A";

        setDischargeData((prev) => ({
          ...prev,
          totalAmount: finalTotal,
          currentStatus: "Discharged & Settled",
          isCleared: true,
        }));

        // 1. Reset assigned bed status from Occupied (Red) back to Available (Green)
        setBedsList((prev) =>
          prev.map((b) =>
            b.id === freedBedNo
              ? { ...b, status: "available", patient: "" }
              : b,
          ),
        );

        // 2. Publish finalized digital discharge summary to patient portal
        const dischargeSummary = {
          summaryId: `DS-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: dischargeData.patientName || "Kamal Perera",
          pid: dischargeData.pid || "P-1042",
          admissionDate: "Oct 09, 2026",
          dischargeDate: "Oct 10, 2026",
          wardBed: `Ward 3B / ${freedBedNo}`,
          attendingPhysician: "Dr. Robert Vance",
          diagnosis:
            "Acute bronchitis with mild bronchial irritation - Clinically Recovered",
          dischargeNotes:
            "Patient has successfully completed inpatient clinical therapy and is hemodynamically stable. Advised to continue oral medication regimens and schedule follow-up in 1 week.",
          totalBill: finalTotal,
          paymentStatus: "Paid & Cleared",
          clearedAt: new Date().toLocaleString(),
        };
        localStorage.setItem(
          "nexus_patient_discharge_summary",
          JSON.stringify(dischargeSummary),
        );

        // Clear active allocated bed
        localStorage.removeItem("nexus_allocated_bed");
        localStorage.removeItem("nexus_discharge_clearance");

        // 4. Dispatch events to Nurse Portal, Doctor Portal, and Patient Portal
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(
          new CustomEvent("nexus_bed_freed", {
            detail: {
              bedNo: freedBedNo,
              patientName: dischargeData.patientName,
            },
          }),
        );
        window.dispatchEvent(
          new CustomEvent("nexus_discharge_finalized", {
            detail: dischargeSummary,
          }),
        );

        showToast(
          `✓ Discharge slip generated & ${freedBedNo} freed! Digital discharge summary published to Patient Portal.`,
        );
      },
    );
  };

  useReceptionistSync({
    setDoctorsList,
    showToast,
    setPendingAdmissions,
    setBedAssignPatient,
    setDischargeData,
  });

  return {
    activeNav,
    toastMessage,
    showToast,
    handleLogout,
    scrollToSection,
    currentPatientId,
    patientOptions,
    regForm,
    handleRegChange,
    handleRegisterPatient,
    handleCancelReg,
    doctorsList,
    tokenForm,
    setTokenForm,
    handleDoctorTokenChange,
    handleIssueToken,
    bedsList,
    selectedBedToAssign,
    setSelectedBedToAssign,
    pendingAdmissions,
    bedAssignPatient,
    setBedAssignPatient,
    occupiedCount,
    totalBeds,
    handleBedClick,
    handleConfirmBedAllocation,
    dischargeData,
    setDischargeData,
    calculateTotalBill,
    handleChargeChange,
    handleAddChargeItem,
    handleRemoveChargeItem,
    handleGenerateDischarge,
  };
}
