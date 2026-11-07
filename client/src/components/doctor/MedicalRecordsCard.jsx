export default function MedicalRecordsCard({
  pendingActions,
  activeMedicalPatient,
  symptomsText,
  setSymptomsText,
  diagnosisText,
  setDiagnosisText,
  vitalsData,
  handleSaveClinicalNotes,
  targetWard,
  setTargetWard,
  admissionStatus,
  handleIssueAdmissionOrder,
}) {
  return (
    <div id="medical-records-card" className="doc-card">
      <h2 className="doc-card-title">Medical Reports</h2>

      {/* Header Info Strip */}
      <div className="doc-patient-top-strip">
        <div className="doc-patient-info-left">
          <strong>
            {activeMedicalPatient.name} (PID: {activeMedicalPatient.pid})
          </strong>{" "}
          &bull; {activeMedicalPatient.age} Yrs / {activeMedicalPatient.gender}{" "}
          &bull; Blood: {activeMedicalPatient.bloodGroup}
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
          <h3 className="doc-record-heading">
            Clinical Diagnosis &amp; Vitals
          </h3>

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
              disabled={pendingActions.includes("notes")}
              onClick={handleSaveClinicalNotes}
            >
              Save Clinical Notes
            </button>
          </div>

          {/* Physician Admission Order directly from Clinical Encounter Dashboard */}
          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              background: "rgba(59, 171, 153, 0.08)",
              border: "1px solid rgba(59, 171, 153, 0.25)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1b3d45",
                }}
              >
                Inpatient Admission Order &bull; Hospitalization Request
              </div>
              {admissionStatus && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "#fef3c7",
                    color: "#92400e",
                  }}
                >
                  {admissionStatus}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  color: "#4b5563",
                  fontWeight: 600,
                }}
              >
                Target Ward:
              </label>
              <select
                className="doc-form-control"
                style={{
                  width: "auto",
                  minWidth: "160px",
                  padding: "6px 10px",
                  fontSize: "0.85rem",
                }}
                value={targetWard}
                onChange={(e) => setTargetWard(e.target.value)}
              >
                <option value="Ward 3B">
                  Ward 3B (Pulmonary &amp; General)
                </option>
                <option value="Ward 2A">Ward 2A (Cardiology)</option>
                <option value="Ward 1C">Ward 1C (High Dependency)</option>
              </select>
              <button
                type="button"
                disabled={pendingActions.includes("admission")}
                onClick={handleIssueAdmissionOrder}
                style={{
                  background: "#e11d48",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 4px rgba(225, 29, 72, 0.2)",
                }}
              >
                <span> Admit to {targetWard}</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
