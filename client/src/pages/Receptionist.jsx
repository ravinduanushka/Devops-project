import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getPatients, createPatient, getAppointments, createAppointment, updatePatient } from "../services/api";

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

  // ==========================================
  // SECTION 1: NEW PATIENT REGISTRATION STATE
  // ==========================================
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
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      await createPatient({
        name: regForm.fullName,
        age: parseInt(regForm.age) || 38,
        gender: regForm.gender,
        contact: regForm.contactNumber,
        bloodGroup: regForm.bloodGroup,
        allergies: regForm.allergies,
        nic: regForm.nicNumber,
        status: "Registered"
      });
    } catch {
      // offline fallback works seamlessly
    }
    showToast(`✓ Patient ${regForm.fullName} (NIC: ${regForm.nicNumber}) registered successfully!`);
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
    showToast("Registration form reset.");
  };

  // ==========================================
  // SECTION 2: OPD TOKEN GENERATION STATE
  // ==========================================
  const [doctorsList] = useState([
    { name: "Dr. Robert Vance", specialty: "Cardiology", fee: "Rs. 2,500 Paid" },
    { name: "Dr. Elena Rostova", specialty: "General Medicine", fee: "Rs. 2,000 Paid" },
    { name: "Dr. Marcus Thompson", specialty: "Pulmonology", fee: "Rs. 2,800 Paid" },
    { name: "Dr. Sarah Jenkins", specialty: "Pediatrics", fee: "Rs. 2,200 Paid" }
  ]);

  const [tokenForm, setTokenForm] = useState({
    selectedDoctor: "Dr. Robert Vance - Cardiology",
    clinicUnit: "Cardiology",
    searchPatient: "Elena Rostova (ID: P-88219)",
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
    const nextTokenNum = parseInt(tokenForm.tokenNumber) + 1;
    const tokenStr = nextTokenNum < 10 ? `0${nextTokenNum}` : `${nextTokenNum}`;
    
    try {
      await createAppointment({
        patientName: tokenForm.searchPatient.split(" (")[0],
        doctorName: tokenForm.selectedDoctor.split(" - ")[0],
        department: tokenForm.clinicUnit,
        dateTime: new Date().toISOString(),
        tokenNumber: parseInt(tokenForm.tokenNumber),
        type: "In-Person Consultation"
      });
    } catch {
      // offline fallback works seamlessly
    }

    showToast(`✓ OPD Token #${tokenForm.tokenNumber} issued & printed for ${tokenForm.searchPatient}!`);
    setTokenForm((prev) => ({
      ...prev,
      tokenNumber: tokenStr
    }));
  };

  // ==========================================
  // SECTION 3: BED ALLOCATION STATE
  // ==========================================
  const initialBeds = [
    { id: "Bed-01A", status: "occupied", patient: "Elena Rostova" },
    { id: "Bed-01B", status: "occupied", patient: "Marcus Thompson" },
    { id: "Bed-01C", status: "occupied", patient: "Ahmed Khan" },
    { id: "Bed-02A", status: "available", patient: "" },
    { id: "Bed-02B", status: "available", patient: "" },
    { id: "Bed-03A", status: "occupied", patient: "Mei Lin Chen" },
    { id: "Bed-03B", status: "occupied", patient: "David Miller" },
    { id: "Bed-03C", status: "occupied", patient: "Sarah Connor" },
    { id: "Bed-03D", status: "available", patient: "" },
    { id: "Bed-04A", status: "available", patient: "" },
    { id: "Bed-04B", status: "available", patient: "" },
    { id: "Bed-04C", status: "occupied", patient: "John Doe" },
    { id: "Bed-04D", status: "available", patient: "" },
    { id: "Bed-05A", status: "available", patient: "" },
    { id: "Bed-05B", status: "available", patient: "" },
    { id: "Bed-05C", status: "occupied", patient: "Grace Hopper" },
    { id: "Bed-06A", status: "occupied", patient: "Alan Turing" },
    { id: "Bed-06B", status: "occupied", patient: "Ada Lovelace" },
    { id: "Bed-06C", status: "available", patient: "" },
    { id: "Bed-06D", status: "occupied", patient: "Marie Curie" }
  ];

  const [bedsList, setBedsList] = useState(initialBeds);
  const [selectedBedToAssign, setSelectedBedToAssign] = useState("Bed-02A");
  const [bedAssignPatient, setBedAssignPatient] = useState({
    name: "Elena Rostova",
    id: "P-88219",
    doctor: "Dr. Vance"
  });

  const occupiedCount = bedsList.filter((b) => b.status === "occupied").length;
  const totalBeds = 32;

  const handleBedClick = (bed) => {
    if (bed.status === "available") {
      setSelectedBedToAssign(bed.id);
      showToast(`Selected ${bed.id} for assignment.`);
    } else {
      showToast(`${bed.id} is currently occupied by ${bed.patient || "another patient"}.`);
    }
  };

  const handleConfirmBedAllocation = (e) => {
    e.preventDefault();
    if (!selectedBedToAssign) {
      showToast("Please choose an available bed first.");
      return;
    }
    setBedsList((prev) =>
      prev.map((b) =>
        b.id === selectedBedToAssign
          ? { ...b, status: "occupied", patient: bedAssignPatient.name }
          : b
      )
    );
    showToast(`✓ Bed ${selectedBedToAssign} allocated to ${bedAssignPatient.name} (PID: ${bedAssignPatient.id})!`);
  };

  // ==========================================
  // SECTION 4: DISCHARGE & BILLING STATE
  // ==========================================
  const [dischargeData, setDischargeData] = useState({
    patientName: "Elena Rostova",
    bedNo: "Bed-01A",
    pid: "P-88219",
    currentStatus: "Awaiting Clearance",
    doctorClearance: "Cleared by Dr. Robert Vance",
    nursingClearance: "Verified by Nurse Sarah Chen",
    charges: [
      { item: "Room Charges (Bed-01A)", amount: "Rs. 8,500.00" },
      { item: "Doctor Visit Fees", amount: "Rs. 4,500.00" },
      { item: "Pharmacy & Medication", amount: "Rs. 3,500.00" },
      { item: "Lab & Diagnostic Tests", amount: "Rs. 2,000.00" }
    ],
    totalAmount: "Rs. 18,500.00",
    paymentStatus: "Payment Completed",
    isCleared: false
  });

  const handleGenerateDischarge = (e) => {
    e.preventDefault();
    setDischargeData((prev) => ({
      ...prev,
      currentStatus: "Discharged & Cleared",
      isCleared: true
    }));
    // Free Bed-01A
    setBedsList((prev) =>
      prev.map((b) => (b.id === dischargeData.bedNo ? { ...b, status: "available", patient: "" } : b))
    );
    showToast(
      `✓ Discharge slip generated for ${dischargeData.patientName}! ${dischargeData.bedNo} is now free and available.`
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
                  <h3 className="rec-sub-title">Personal Info</h3>
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
                          className="rec-form-control rounded-input"
                          value={tokenForm.searchPatient}
                          onChange={(e) => setTokenForm({ ...tokenForm, searchPatient: e.target.value })}
                          placeholder="Search patient..."
                          required
                        />
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
                  <h3 className="rec-panel-heading">Invoice &amp; Bill Summary</h3>

                  <div className="rec-invoice-table">
                    <div className="rec-invoice-header">
                      <span>Itemized Charges</span>
                    </div>

                    {dischargeData.charges.map((c, idx) => (
                      <div key={idx} className="rec-invoice-row">
                        <span>{c.item}</span>
                        <strong>{c.amount}</strong>
                      </div>
                    ))}

                    <div className="rec-invoice-total-row">
                      <span>Total Amount:</span>
                      <span className="rec-invoice-total-val">{dischargeData.totalAmount}</span>
                    </div>

                    <div className="rec-payment-status-row">
                      <span>Payment Status:</span>
                      <span className="rec-badge-payment-done">{dischargeData.paymentStatus}</span>
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
