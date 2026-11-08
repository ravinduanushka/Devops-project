export default function WardRoundsCard({
  pendingActions,
  showToast,
  wardTab,
  setWardTab,
  wardPatients,
  handleApproveDischarge,
  activeAdmitted,
  availableBeds,
}) {
  return (
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
            onClick={() =>
              showToast(`Total admitted patients: ${activeAdmitted}`)
            }
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </button>
          <button
            className="doc-square-icon-btn"
            title="Bed Map"
            onClick={() => showToast(`Available beds: ${availableBeds} of 32`)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-8v6H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4zm-9 4H5V8h5v3z" />
            </svg>
          </button>
          <button
            className="doc-square-icon-btn"
            title="Observation Notes"
            onClick={() => showToast("Opening nurse monitoring logs")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
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
                      onClick={() =>
                        showToast(`Opening round notes for ${p.patientName}`)
                      }
                    >
                      Ward Round Notes
                    </button>
                  ) : (
                    <button
                      className="doc-btn-approve-discharge"
                      disabled={
                        p.condition === "Discharged" ||
                        pendingActions.includes("discharge")
                      }
                      onClick={() => handleApproveDischarge(p)}
                    >
                      {p.condition === "Discharged"
                        ? "✓ Discharged"
                        : "✓ Approve Discharge"}
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
  );
}
