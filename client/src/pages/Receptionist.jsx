import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import useReceptionistDashboard from '../features/receptionist/useReceptionistDashboard';

function Receptionist() {
  const {
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
  } = useReceptionistDashboard();

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
                  if (e.currentTarget.getAttribute("src") !== "/health logo.png") {
                    e.currentTarget.src = "/health logo.png";
                  }
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

              {/* Pending Admission Request Banner from Doctor */}
              {pendingAdmissions.length > 0 && (
                <div style={{
                  margin: "0 0 16px 0",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px"
                }}>
                  <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
                    <span style={{ fontWeight: 700, marginRight: "6px" }}>🏥 Pending Inpatient Admission:</span>
                    <strong>{pendingAdmissions[0].patientName}</strong> (PID: {pendingAdmissions[0].patientId}) &bull; Order: <em>"{pendingAdmissions[0].orderNotes || "Admit to Ward 3B"}"</em> by <strong>{pendingAdmissions[0].doctorName}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const order = pendingAdmissions[0];
                      setBedAssignPatient({
                        name: order.patientName,
                        id: order.patientId,
                        doctor: order.doctorName,
                        ward: order.ward || "Ward 3B",
                        diagnosis: order.diagnosis,
                        dbId: order.dbId
                      });
                      setSelectedBedToAssign("Bed-02A");
                      showToast(`Loaded admission request for ${order.patientName}. Preselected Bed-02A.`);
                    }}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Select &amp; Assign Bed-02A
                  </button>
                </div>
              )}

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
                      <div className="rec-clearance-row" style={{
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span className="rec-check-icon" style={{
                          background: "#16a34a",
                          color: "#ffffff",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}>✓</span>
                        <span style={{ fontSize: "0.85rem", color: "#166534" }}>
                          <strong>Doctor Clearance:</strong> <span style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontWeight: 700,
                            marginLeft: "4px"
                          }}>{dischargeData.doctorClearance || "Cleared by Dr. Robert Vance"}</span>
                        </span>
                      </div>

                      <div className="rec-clearance-row" style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span className="rec-check-icon" style={{
                          background: "#0284c7",
                          color: "#ffffff",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}>✓</span>
                        <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>
                          <strong>Nursing Clearance:</strong> {dischargeData.nursingClearance}
                        </span>
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
