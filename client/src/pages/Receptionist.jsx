import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getPatients, createPatient, getAppointments, createAppointment, updatePatient, getAdmissions, updateAdmission } from "../services/api";

function Receptionist() {
  const navigate = useNavigate();

  // Retrieve logged-in session if available
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeNav, setActiveNav] = useState("PatientRegistration");
  const [toastMessage, setToastMessage] = useState("");
  const isManualScroll = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  const handleLogout = () => {
    localStorage.removeItem("nexus_user");
    navigate("/login");
  };

  // Sidebar and workflow smooth scrolling
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
    "Dinithi Fernando (ID: P-4012)"
  ]);

  const [regForm, setRegForm] = useState({
    fullName: "Kamal Perera",
    nicNumber: "198812345678",
    age: "38",
    gender: "Male",
    contactNumber: "+94 77 123 4567",
    bloodGroup: "O+",
    allergies: "Penicillin"
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
        searchPatient: patientName ? `${patientName} (PID: ${currentPatientId})` : ""
      }));
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();

    // 1. Auto-generate fresh new Patient ID upon clicking Register Patient
    const newPatientId = generateNewPatientId();
    setCurrentPatientId(newPatientId);

    const patientPayload = {
      name: regForm.fullName,
      patientId: newPatientId,
      age: parseInt(regForm.age) || 38,
      gender: regForm.gender,
      contact: regForm.contactNumber,
      bloodGroup: regForm.bloodGroup,
      allergies: regForm.allergies,
      nic: regForm.nicNumber,
      status: "Registered"
    };

    try {
      await createPatient(patientPayload);
    } catch {
      // offline fallback works seamlessly
    }

    const patientTag = `${regForm.fullName} (PID: ${newPatientId})`;

    // 2. Automatically transfer registered patient & new auto-generated ID to OPD Token Generation
    setTokenForm((prev) => ({
      ...prev,
      searchPatient: patientTag
    }));

    // 3. Add to patient search options
    setPatientOptions((prev) => [patientTag, ...prev.filter((p) => p !== patientTag)]);

    // 4. Update Bed Allocation & Discharge records with newly generated ID
    setBedAssignPatient((prev) => ({
      ...prev,
      name: regForm.fullName,
      id: newPatientId
    }));

    setDischargeData((prev) => ({
      ...prev,
      patientName: regForm.fullName,
      pid: newPatientId
    }));

    // Save to shared localStorage for immediate portal-wide sync
    localStorage.setItem("nexus_registered_patient", JSON.stringify(patientPayload));
    window.dispatchEvent(new Event("storage"));

    showToast(`✓ Patient ${regForm.fullName} (PID: ${newPatientId}) registered into hospital system! Proceeding to OPD Token Generation.`);

    // 5. Instantly scroll receptionist to the OPD Token Generation section
    setTimeout(() => {
      scrollToSection("token-generation-card", "TokenGeneration");
    }, 350);
  };

  const handleCancelReg = () => {
    setRegForm({
      fullName: "",
      nicNumber: "",
      age: "",
      gender: "Male",
      contactNumber: "",
      bloodGroup: "O+",
      allergies: ""
    });
    setTokenForm((prev) => ({
      ...prev,
      searchPatient: ""
    }));
    showToast("Registration form reset.");
  };

  // ==========================================
  // SECTION 2: OPD TOKEN GENERATION STATE
  // ==========================================
  const [doctorsList] = useState([
    { name: "Dr. Vance", specialty: "Cardiology", fee: "Rs. 2,500 Paid" },
    { name: "Dr. Sanath Weerasinghe", specialty: "Pulmonology", fee: "Rs. 2,800 Paid" },
    { name: "Dr. Priyantha Senanayake", specialty: "Cardiology", fee: "Rs. 2,500 Paid" },
    { name: "Dr. Champa Gunasekara", specialty: "General Medicine", fee: "Rs. 2,000 Paid" },
    { name: "Dr. Malini Fernando", specialty: "Pediatrics", fee: "Rs. 2,200 Paid" }
  ]);

  const [tokenForm, setTokenForm] = useState({
    selectedDoctor: "Dr. Vance - Cardiology",
    clinicUnit: "Cardiology",
    searchPatient: "Kamal Perera (PID: P-1042)",
    tokenNumber: "05",
    time: "10:15 AM",
    fee: "Rs. 2,500 Paid"
  });

  const handleDoctorTokenChange = (e) => {
    const val = e.target.value;
    const doc = doctorsList.find((d) => `${d.name} - ${d.specialty}` === val);
    setTokenForm({
      ...tokenForm,
      selectedDoctor: val,
      clinicUnit: doc ? doc.specialty : "General Medicine",
      fee: doc ? doc.fee : "Rs. 2,500 Paid"
    });
  };

  const handleIssueToken = async (e) => {
    e.preventDefault();
    const currentTokenNum = tokenForm.tokenNumber || "05";
    const nextTokenNum = parseInt(currentTokenNum, 10) + 1;
    const nextTokenStr = nextTokenNum < 10 ? `0${nextTokenNum}` : `${nextTokenNum}`;
    const cleanPatientName = tokenForm.searchPatient.split(" (")[0].trim() || "Kamal Perera";
    const extractedPidMatch = tokenForm.searchPatient.match(/(?:ID|PID):\s*([^)]+)/i);
    const extractedPid = extractedPidMatch ? extractedPidMatch[1].trim() : currentPatientId;
    const cleanDoctorName = tokenForm.selectedDoctor.split(" - ")[0].trim() || "Dr. Vance";

    const apptPayload = {
      patientName: cleanPatientName,
      patientId: extractedPid,
      doctorName: cleanDoctorName,
      department: tokenForm.clinicUnit,
      dateTime: new Date().toISOString(),
      tokenNumber: parseInt(currentTokenNum, 10) || 5,
      status: "Waiting",
      type: "In-Person Consultation",
      fee: tokenForm.fee
    };

    try {
      await createAppointment(apptPayload);
    } catch {
      // offline fallback works seamlessly
    }

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
      currentlyServing: "04"
    };

    // Broadcast state for Doctor Portal & Patient Portal via localStorage & events
    localStorage.setItem("nexus_active_token", JSON.stringify(activeQueueEntry));

    try {
      const existingQueue = JSON.parse(localStorage.getItem("nexus_queue_list") || "[]");
      const filtered = Array.isArray(existingQueue) ? existingQueue.filter((q) => q.token !== activeQueueEntry.token) : [];
      localStorage.setItem("nexus_queue_list", JSON.stringify([activeQueueEntry, ...filtered]));
    } catch {
      localStorage.setItem("nexus_queue_list", JSON.stringify([activeQueueEntry]));
    }

    // Trigger instant real-time sync across open browser tabs & views
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("nexus_queue_updated", { detail: activeQueueEntry }));

    showToast(`✓ OPD Token #${currentTokenNum} issued for ${tokenForm.searchPatient} assigned to ${cleanDoctorName}! Dispatched to Doctor Queue (#${currentTokenNum} Waiting) & Patient Portal.`);
    setTokenForm((prev) => ({
      ...prev,
      tokenNumber: nextTokenStr
    }));
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
    { id: "Bed-06D", status: "occupied", patient: "Rohan De Silva" }
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
      orderNotes: "Admit to Ward 3B - Hospitalization required for clinical observation & intravenous respiratory therapy",
      diagnosis: "Acute bronchitis with mild bronchial irritation",
      status: "Pending Bed Allocation",
      timestamp: "10:20 AM"
    }
  ]);

  const [bedAssignPatient, setBedAssignPatient] = useState({
    name: "Kamal Perera",
    id: "P-1042",
    doctor: "Dr. Vance",
    ward: "Ward 3B",
    diagnosis: "Acute bronchitis with mild bronchial irritation"
  });

  const occupiedCount = bedsList.filter((b) => b.status === "occupied").length;
  const totalBeds = 32;

  // Real-time synchronization of Doctor admission orders
  useEffect(() => {
    const fetchAdmissionsData = async () => {
      let localOrders = [];
      try {
        const stored = localStorage.getItem("nexus_pending_admissions");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localOrders = parsed;
          }
        }
      } catch {}

      try {
        const res = await getAdmissions();
        if (Array.isArray(res.data) && res.data.length > 0) {
          const dbOrders = res.data
            .filter((o) => o.status === "Pending Bed Allocation")
            .map((o) => ({
              orderId: o._id ? `ADM-${o._id.slice(-4)}` : "ADM-DB",
              patientName: o.patientName,
              patientId: o.patientId,
              doctorName: o.doctorName,
              ward: o.ward || "Ward 3B",
              orderNotes: o.orderNotes,
              diagnosis: o.diagnosis,
              status: o.status,
              timestamp: new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dbId: o._id
            }));

          if (dbOrders.length > 0) {
            localOrders = [...dbOrders, ...localOrders.filter((l) => !dbOrders.some((d) => d.patientName === l.patientName))];
          }
        }
      } catch {}

      if (localOrders.length > 0) {
        setPendingAdmissions(localOrders);
        const topOrder = localOrders[0];
        setBedAssignPatient({
          name: topOrder.patientName || "Kamal Perera",
          id: topOrder.patientId || "P-1042",
          doctor: topOrder.doctorName || "Dr. Vance",
          ward: topOrder.ward || "Ward 3B",
          diagnosis: topOrder.diagnosis || "Acute bronchitis with mild bronchial irritation",
          dbId: topOrder.dbId
        });
      }
    };

    fetchAdmissionsData();

    const handleNewAdmission = (e) => {
      const order = e?.detail;
      if (order) {
        showToast(`⚡ Inpatient admission request received for ${order.patientName}: "${order.orderNotes || "Admit to Ward 3B"}"!`);
      }
      fetchAdmissionsData();
    };

    window.addEventListener("nexus_admission_ordered", handleNewAdmission);
    window.addEventListener("storage", fetchAdmissionsData);
    const interval = setInterval(fetchAdmissionsData, 4000);

    return () => {
      window.removeEventListener("nexus_admission_ordered", handleNewAdmission);
      window.removeEventListener("storage", fetchAdmissionsData);
      clearInterval(interval);
    };
  }, []);

  const handleBedClick = (bed) => {
    if (bed.status === "available") {
      setSelectedBedToAssign(bed.id);
      showToast(`Selected ${bed.id} for assignment.`);
    } else {
      showToast(`${bed.id} is currently occupied by ${bed.patient || "another patient"}.`);
    }
  };

  const handleConfirmBedAllocation = async (e) => {
    e.preventDefault();
    const bedId = selectedBedToAssign || "Bed-02A";

    // 1. Update Bed grid state
    setBedsList((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? { ...b, status: "occupied", patient: bedAssignPatient.name }
          : b
      )
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
      admissionDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      condition: "Stable",
      conditionColor: "nurse-cond-stable",
      attendingPhysician: bedAssignPatient.doctor || "Dr. Vance",
      diagnosis: bedAssignPatient.diagnosis || "Acute bronchitis with mild bronchial irritation"
    };

    // 3. Update backend database
    if (bedAssignPatient.dbId) {
      try {
        await updateAdmission(bedAssignPatient.dbId, {
          status: "Bed Allocated",
          bedNo: bedId,
          ward: bedAssignPatient.ward || "Ward 3B"
        });
      } catch {}
    }

    try {
      const allPatients = await getPatients();
      if (Array.isArray(allPatients.data)) {
        const match = allPatients.data.find((p) => p.name === allocatedRecord.patientName);
        if (match && match._id) {
          await updatePatient(match._id, {
            status: "Admitted",
            wardNumber: `${allocatedRecord.ward} / ${bedId}`,
            assignedDoctor: allocatedRecord.attendingPhysician
          });
        }
      }
    } catch {}

    // 4. Update localStorage and broadcast to Nurse Portal & Doctor Portal
    localStorage.setItem("nexus_allocated_bed", JSON.stringify(allocatedRecord));
    try {
      const stored = JSON.parse(localStorage.getItem("nexus_pending_admissions") || "[]");
      const updatedPending = Array.isArray(stored) ? stored.filter((p) => p.patientName !== allocatedRecord.patientName) : [];
      localStorage.setItem("nexus_pending_admissions", JSON.stringify(updatedPending));
      setPendingAdmissions(updatedPending);
    } catch {}

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("nexus_bed_allocated", { detail: allocatedRecord }));

    showToast(`✓ Confirmed: Bed ${bedId} in Ward 3B allocated to ${allocatedRecord.patientName} (PID: ${allocatedRecord.pid})! Enrolled into Nurse WardMonitoring census.`);
  };

  // ==========================================
  // SECTION 4: DISCHARGE & BILLING STATE
  // ==========================================
  const [dischargeData, setDischargeData] = useState({
    patientName: "Kamal Perera",
    bedNo: "Bed-01A",
    pid: "P-88219",
    currentStatus: "Awaiting Clearance",
    doctorClearance: "Cleared by Dr. Priyantha Senanayake",
    nursingClearance: "Verified by Nurse Chamari Perera",
    charges: [
      { id: 1, item: "Room Charges (Bed-01A)", amount: "8500" },
      { id: 2, item: "Doctor Visit Fees", amount: "4500" },
      { id: 3, item: "Pharmacy & Medication", amount: "3500" },
      { id: 4, item: "Lab & Diagnostic Tests", amount: "2000" }
    ],
    totalAmount: "Rs. 18,500.00",
    paymentStatus: "Payment Completed",
    isCleared: false
  });

  const calculateTotalBill = () => {
    const sum = dischargeData.charges.reduce((acc, c) => {
      const val = parseFloat(c.amount) || 0;
      return acc + val;
    }, 0);
    return `Rs. ${sum.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleChargeChange = (index, field, value) => {
    setDischargeData((prev) => {
      const nextCharges = [...prev.charges];
      nextCharges[index] = {
        ...nextCharges[index],
        [field]: value
      };
      return {
        ...prev,
        charges: nextCharges
      };
    });
  };

  const handleAddChargeItem = () => {
    setDischargeData((prev) => ({
      ...prev,
      charges: [
        ...prev.charges,
        { id: Date.now(), item: "", amount: "" }
      ]
    }));
  };

  const handleRemoveChargeItem = (index) => {
    setDischargeData((prev) => {
      if (prev.charges.length <= 1) {
        return {
          ...prev,
          charges: [{ id: Date.now(), item: "", amount: "" }]
        };
      }
      return {
        ...prev,
        charges: prev.charges.filter((_, idx) => idx !== index)
      };
    });
  };

  const handleGenerateDischarge = (e) => {
    e.preventDefault();
    const finalTotal = calculateTotalBill();
    setDischargeData((prev) => ({
      ...prev,
      totalAmount: finalTotal,
      currentStatus: "Discharged & Cleared",
      isCleared: true
    }));
    // Free Bed-01A
    setBedsList((prev) =>
      prev.map((b) => (b.id === dischargeData.bedNo ? { ...b, status: "available", patient: "" } : b))
    );
    showToast(
      `✓ Discharge slip generated for ${dischargeData.patientName} (${finalTotal})! ${dischargeData.bedNo} is now free and available.`
    );
  };

  // Auto-switch sidebar active category as user scrolls down the page
  useEffect(() => {
    const sections = [
      { id: "patient-registration-card", nav: "PatientRegistration" },
      { id: "token-generation-card", nav: "TokenGeneration" },
      { id: "bed-allocation-card", nav: "BedAllocation" },
      { id: "discharge-billing-card", nav: "Discharge&BillingClearance" }
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

  return (
    <div className="rec-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rec-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          HERO BANNER
          Uses /reciption.png from public (with fallback to /reciption.jpg)
          NexusHealth logo top-left
          Sign Out button top-right
          Heading text on left (No Mr/Ms user button, as requested)
          ======================================================== */}
      <section className="rec-hero-section">
        <div className="rec-hero-container">
          <img
            src="/reciption.png"
            alt="Receptionist Portal - NexusHealth"
            className="rec-hero-bg-img"
            onError={(e) => {
              e.currentTarget.src = "/reciption.jpg";
            }}
          />

          {/* NexusHealth Logo in top-left position */}
          <div className="rec-hero-logo-box">
            <Link to="/" title="Go to Home">
              <img
                src="/health-logo.png"
                alt="NexusHealth Logo"
                className="rec-hero-logo-img"
                onError={(e) => {
                  e.currentTarget.src = "/health logo.png";
                }}
              />
            </Link>
          </div>

          {/* Top-right Sign Out button */}
          <div className="rec-hero-top-right">
            <button onClick={handleLogout} className="rec-logout-pill" title="Sign Out">
              Sign Out
            </button>
          </div>

          {/* Left Text Overlay: Heading (Manageable size, No Mr/Ms User badge per user instruction) */}
          <div className="rec-hero-left-overlay">
            <h1 className="rec-hero-custom-heading">
              Your Portal<br />
              to Better Care.
            </h1>
          </div>
        </div>
      </section>

      {/* ========================================================
          WORKFLOW LAYOUT:
          Unified Background: #DAEFEC with vertical border divider
          ======================================================== */}
      <div className="rec-dashboard-layout">
        {/* LEFT COLUMN: Sidebar Navigation (#DAEFEC) */}
        <aside className="rec-sidebar-col">
          <nav className="rec-nav-menu">
            <button
              className={`rec-nav-item rec-nav-anim-1 ${activeNav === "PatientRegistration" ? "active" : ""}`}
              onClick={() => scrollToSection("patient-registration-card", "PatientRegistration")}
              title="New Patient Registration"
            >
              <span className="rec-nav-text">PatientRegistration</span>
              <span className="rec-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`rec-nav-item rec-nav-anim-2 ${activeNav === "TokenGeneration" ? "active" : ""}`}
              onClick={() => scrollToSection("token-generation-card", "TokenGeneration")}
              title="OPD Token Generation"
            >
              <span className="rec-nav-text">TokenGeneration</span>
              <span className="rec-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`rec-nav-item rec-nav-anim-3 ${activeNav === "BedAllocation" ? "active" : ""}`}
              onClick={() => scrollToSection("bed-allocation-card", "BedAllocation")}
              title="Ward Bed Allocation"
            >
              <span className="rec-nav-text">BedAllocation</span>
              <span className="rec-nav-indicator" aria-hidden="true">›</span>
            </button>

            <button
              className={`rec-nav-item rec-nav-anim-4 ${activeNav === "Discharge&BillingClearance" ? "active" : ""}`}
              onClick={() => scrollToSection("discharge-billing-card", "Discharge&BillingClearance")}
              title="Discharge & Billing Clearance"
            >
              <span className="rec-nav-text">Discharge&Billing</span>
              <span className="rec-nav-indicator" aria-hidden="true">›</span>
            </button>
          </nav>
        </aside>

        {/* RIGHT COLUMN: 4 Workflow Dashboard Cards (#DAEFEC) */}
        <main className="rec-main-col">
          <div className="rec-cards-stream">
            {/* ----------------------------------------------------
                WORKFLOW STEP 1: NEW PATIENT REGISTRATION (Image 1)
                ---------------------------------------------------- */}
            <div id="patient-registration-card" className="rec-card">
              <h2 className="rec-card-title">New Patient Registration</h2>

              <form onSubmit={handleRegisterPatient} className="rec-form-wrapper">
                {/* Personal Info Box */}
                <div className="rec-sub-section">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h3 className="rec-sub-title" style={{ margin: 0 }}>Personal Info</h3>
                    <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>
                      Auto-Generated ID: {currentPatientId}
                    </span>
                  </div>
                  <div className="rec-grid-2col">
                    <div className="rec-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        className="rec-form-control underline-input"
                        value={regForm.fullName}
                        onChange={handleRegChange}
                        placeholder="e.g. Kamal Perera"
                        required
                      />
                    </div>

                    <div className="rec-form-group">
                      <label>NIC Number</label>
                      <input
                        type="text"
                        name="nicNumber"
                        className="rec-form-control underline-input"
                        value={regForm.nicNumber}
                        onChange={handleRegChange}
                        placeholder="e.g. 198812345678"
                        required
                      />
                    </div>

                    <div className="rec-form-group">
                      <label>Age / Gender</label>
                      <div className="rec-age-gender-pair">
                        <input
                          type="number"
                          name="age"
                          className="rec-form-control underline-input"
                          value={regForm.age}
                          onChange={handleRegChange}
                          placeholder="Age"
                          style={{ width: "80px" }}
                          required
                        />
                        <span className="rec-slash">/</span>
                        <select
                          name="gender"
                          className="rec-form-control underline-input"
                          value={regForm.gender}
                          onChange={handleRegChange}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="rec-form-group">
                      <label>Contact Number</label>
                      <input
                        type="tel"
                        name="contactNumber"
                        className="rec-form-control underline-input"
                        value={regForm.contactNumber}
                        onChange={handleRegChange}
                        placeholder="e.g. +94 77 123 4567"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Info Box */}
                <div className="rec-sub-section" style={{ marginTop: "24px" }}>
                  <h3 className="rec-sub-title">Medical Info</h3>
                  <div className="rec-grid-2col">
                    <div className="rec-form-group">
                      <label>Blood Group</label>
                      <select
                        name="bloodGroup"
                        className="rec-form-control select-box"
                        value={regForm.bloodGroup}
                        onChange={handleRegChange}
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div className="rec-form-group">
                      <label>Allergies</label>
                      <input
                        type="text"
                        name="allergies"
                        className="rec-form-control underline-input"
                        value={regForm.allergies}
                        onChange={handleRegChange}
                        placeholder="e.g. Penicillin, Aspirin, None"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="rec-form-actions">
                  <button type="button" className="rec-btn-cancel" onClick={handleCancelReg}>
                    Cancel
                  </button>
                  <button type="submit" className="rec-btn-primary">
                    Register Patient
                  </button>
                </div>
              </form>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 2: OPD TOKEN GENERATION (Image 2)
                ---------------------------------------------------- */}
            <div id="token-generation-card" className="rec-card">
              <h2 className="rec-card-title">OPD Token Generation</h2>

              <div className="rec-split-card-grid">
                {/* Left: Doctor & Patient Selection */}
                <div className="rec-split-panel-card">
                  <h3 className="rec-panel-heading">Doctor &amp; Patient Selection</h3>

                  <form onSubmit={handleIssueToken}>
                    <div className="rec-form-group" style={{ marginBottom: "16px" }}>
                      <label>Select Doctor</label>
                      <select
                        className="rec-form-control rounded-input"
                        value={tokenForm.selectedDoctor}
                        onChange={handleDoctorTokenChange}
                      >
                        {doctorsList.map((doc, idx) => (
                          <option key={idx} value={`${doc.name} - ${doc.specialty}`}>
                            {doc.name} - {doc.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rec-form-group" style={{ marginBottom: "16px" }}>
                      <label>Search Patient (ID / NIC / Name)</label>
                      <div className="rec-input-icon-wrap">
                        <input
                          type="text"
                          list="receptionist-patient-options"
                          className="rec-form-control rounded-input"
                          value={tokenForm.searchPatient}
                          onChange={(e) => setTokenForm({ ...tokenForm, searchPatient: e.target.value })}
                          placeholder="Search patient..."
                          required
                        />
                        <datalist id="receptionist-patient-options">
                          {patientOptions.map((opt, idx) => (
                            <option key={idx} value={opt} />
                          ))}
                        </datalist>
                        <span className="rec-input-icon">🔍</span>
                      </div>
                    </div>

                    <div className="rec-form-group">
                      <label>Clinic / OPD Unit</label>
                      <input
                        type="text"
                        className="rec-form-control rounded-input readonly-input"
                        value={tokenForm.clinicUnit}
                        readOnly
                      />
                    </div>
                  </form>
                </div>

                {/* Right: OPD Token Slip Preview */}
                <div className="rec-split-panel-card">
                  <h3 className="rec-panel-heading">OPD Token Slip</h3>

                  <div className="rec-token-slip-box">
                    <div className="rec-slip-header">
                      <strong>NexusHealth</strong>
                      <span>OPD Token Slip</span>
                    </div>

                    <div className="rec-slip-token-number">
                      Token #{tokenForm.tokenNumber}
                    </div>

                    <div className="rec-slip-details">
                      <p><strong>Patient:</strong> {tokenForm.searchPatient}</p>
                      <p><strong>Doctor:</strong> {tokenForm.selectedDoctor}</p>
                      <div className="rec-slip-meta-row">
                        <span><strong>Time:</strong> {tokenForm.time}</span>
                        <span><strong>Fee:</strong> {tokenForm.fee}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rec-btn-slip-action"
                      onClick={handleIssueToken}
                    >
                      Issue &amp; Print Slip
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="rec-form-actions" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="rec-btn-cancel"
                  onClick={() => showToast("Token generation canceled.")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rec-btn-primary"
                  onClick={handleIssueToken}
                >
                  Issue &amp; Print Slip
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 3: BED ALLOCATION - WARD 3B (Image 2)
                ---------------------------------------------------- */}
            <div id="bed-allocation-card" className="rec-card">
              <h2 className="rec-card-title">Bed Allocation - Ward 3B</h2>

              <div className="rec-split-card-grid">
                {/* Left: Ward 3B Status & Bed Grid */}
                <div className="rec-split-panel-card">
                  <div className="rec-ward-status-header">
                    <span className="rec-ward-title-text">
                      Ward 3B Status <strong>({occupiedCount}/{totalBeds} Occupied)</strong>
                    </span>
                    <div className="rec-bed-legend">
                      <span className="legend-item"><span className="legend-dot dot-avail"></span> Available</span>
                      <span className="legend-item"><span className="legend-dot dot-occ"></span> Occupied</span>
                    </div>
                  </div>

                  {/* Bed Allocation Visual Grid */}
                  <div className="rec-bed-tiles-grid">
                    {bedsList.map((bed) => {
                      const isAvail = bed.status === "available";
                      const isSelected = selectedBedToAssign === bed.id;
                      return (
                        <button
                          key={bed.id}
                          type="button"
                          className={`rec-bed-tile ${isAvail ? "tile-avail" : "tile-occ"} ${isSelected ? "tile-selected" : ""}`}
                          onClick={() => handleBedClick(bed)}
                          title={`${bed.id}: ${isAvail ? "Available (Click to select)" : `Occupied by ${bed.patient}`}`}
                        >
                          {bed.id}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Bed Assignment Details */}
                <div className="rec-split-panel-card">
                  <h3 className="rec-panel-heading">Bed Assignment</h3>

                  <div className="rec-assignment-details-list">
                    <div className="rec-assign-row">
                      <span className="rec-assign-label">Patient Name:</span>
                      <span className="rec-assign-val">{bedAssignPatient.name}</span>
                    </div>

                    <div className="rec-assign-row">
                      <span className="rec-assign-label">Patient ID:</span>
                      <span className="rec-assign-val">{bedAssignPatient.id}</span>
                    </div>

                    <div className="rec-assign-row">
                      <span className="rec-assign-label">Attending Physician:</span>
                      <span className="rec-assign-val">{bedAssignPatient.doctor}</span>
                    </div>

                    <div className="rec-assign-row" style={{ marginTop: "14px" }}>
                      <span className="rec-assign-label">Assigned Bed:</span>
                      <span className="rec-assign-badge-highlight">
                        {selectedBedToAssign ? `Select ${selectedBedToAssign}` : "Choose from grid"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="rec-form-actions" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="rec-btn-cancel"
                  onClick={() => setSelectedBedToAssign("")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rec-btn-primary"
                  onClick={handleConfirmBedAllocation}
                >
                  Confirm Bed Allocation
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------
                WORKFLOW STEP 4: DISCHARGE & BILLING (Image 3)
                ---------------------------------------------------- */}
            <div id="discharge-billing-card" className="rec-card">
              <h2 className="rec-card-title">Discharge &amp; Billing</h2>

              <div className="rec-split-card-grid">
                {/* Left: Discharge Approvals */}
                <div className="rec-split-panel-card">
                  <h3 className="rec-panel-heading">Discharge Approvals</h3>

                  <div className="rec-approvals-box">
                    <p className="rec-appr-patient">
                      <strong>Patient:</strong> {dischargeData.patientName} ({dischargeData.bedNo})
                    </p>
                    <p className="rec-appr-pid">
                      <strong>ID:</strong> {dischargeData.pid}
                    </p>
                    <p className="rec-appr-status">
                      <strong>Current Status:</strong>{" "}
                      <span className={`status-pill ${dischargeData.isCleared ? "pill-cleared" : "pill-awaiting"}`}>
                        {dischargeData.currentStatus}
                      </span>
                    </p>

                    <div className="rec-clearance-items">
                      <div className="rec-clearance-row">
                        <span className="rec-check-icon">✓</span>
                        <span><strong>Doctor Clearance:</strong> {dischargeData.doctorClearance}</span>
                      </div>

                      <div className="rec-clearance-row">
                        <span className="rec-check-icon">✓</span>
                        <span><strong>Nursing Clearance:</strong> {dischargeData.nursingClearance}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Invoice & Bill Summary */}
                <div className="rec-split-panel-card">
                  <div className="rec-panel-header-wrap">
                    <h3 className="rec-panel-heading">Invoice &amp; Bill Summary</h3>
                    <span className="rec-editable-badge" title="Receptionist can edit charges below">
                      ✏️ Editable
                    </span>
                  </div>

                  <div className="rec-invoice-table">
                    <div className="rec-invoice-header">
                      <span>Itemized Charges</span>
                      <span className="rec-invoice-header-hint">Type to edit item &amp; amount</span>
                    </div>

                    <div className="rec-invoice-rows-list">
                      {dischargeData.charges.map((c, idx) => (
                        <div key={c.id || idx} className="rec-invoice-row-editable">
                          <input
                            type="text"
                            className="rec-invoice-input-item"
                            value={c.item}
                            onChange={(e) => handleChargeChange(idx, "item", e.target.value)}
                            placeholder="Charge item description..."
                            aria-label={`Charge description ${idx + 1}`}
                          />
                          <div className="rec-invoice-amount-box">
                            <span className="rec-currency-prefix">Rs.</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              className="rec-invoice-input-amount"
                              value={c.amount}
                              onChange={(e) => handleChargeChange(idx, "amount", e.target.value)}
                              placeholder="0.00"
                              aria-label={`Amount for ${c.item || "item " + (idx + 1)}`}
                            />
                          </div>
                          <button
                            type="button"
                            className="rec-invoice-del-btn"
                            onClick={() => handleRemoveChargeItem(idx)}
                            title="Remove this charge item"
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="rec-invoice-add-btn"
                      onClick={handleAddChargeItem}
                    >
                      <span>+</span> Add Charge Item
                    </button>

                    <div className="rec-invoice-total-row">
                      <span>Total Amount:</span>
                      <span className="rec-invoice-total-val">{calculateTotalBill()}</span>
                    </div>

                    <div className="rec-payment-status-row">
                      <span>Payment Status:</span>
                      <select
                        className={`rec-payment-status-select ${
                          dischargeData.paymentStatus === "Payment Completed"
                            ? "status-completed"
                            : dischargeData.paymentStatus === "Pending Payment"
                            ? "status-pending"
                            : "status-partial"
                        }`}
                        value={dischargeData.paymentStatus}
                        onChange={(e) =>
                          setDischargeData((prev) => ({ ...prev, paymentStatus: e.target.value }))
                        }
                      >
                        <option value="Payment Completed">Payment Completed</option>
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Insurance Claim Pending">Insurance Claim Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="rec-form-actions" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="rec-btn-cancel"
                  onClick={() => showToast("Discharge process postponed.")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rec-btn-primary"
                  onClick={handleGenerateDischarge}
                >
                  Generate Discharge Slip &amp; Free Bed
                </button>
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

export default Receptionist;
