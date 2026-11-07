export default function PrescriptionCard({
  pendingActions,
  rxPatient,
  setRxPatient,
  currentMedInput,
  setCurrentMedInput,
  medicationsList,
  diagnostics,
  setDiagnostics,
  followUpAdvice,
  setFollowUpAdvice,
  handleAddMedication,
  handleRemoveMedication,
  handleSavePrescription,
  handleCancelPrescription,
}) {
  return (
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
              onChange={(e) =>
                setRxPatient({ ...rxPatient, name: e.target.value })
              }
            />
          </div>

          <div className="doc-input-item">
            <label>Age</label>
            <input
              type="text"
              className="doc-form-control"
              value={rxPatient.age}
              onChange={(e) =>
                setRxPatient({ ...rxPatient, age: e.target.value })
              }
            />
          </div>

          <div className="doc-input-item">
            <label>Gender</label>
            <select
              className="doc-form-control"
              value={rxPatient.gender}
              onChange={(e) =>
                setRxPatient({ ...rxPatient, gender: e.target.value })
              }
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
              onChange={(e) =>
                setRxPatient({ ...rxPatient, patientId: e.target.value })
              }
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
                setCurrentMedInput({
                  ...currentMedInput,
                  dosage: e.target.value,
                })
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
                setCurrentMedInput({
                  ...currentMedInput,
                  frequency: e.target.value,
                })
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
                setCurrentMedInput({
                  ...currentMedInput,
                  duration: e.target.value,
                })
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
              ></button>
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
          <h3 className="doc-form-section-title">
            Diagnostics &amp; Lab Orders
          </h3>
          <div className="doc-checkboxes-grid">
            <label className="doc-checkbox-label">
              <input
                type="checkbox"
                checked={diagnostics.bloodTests}
                onChange={(e) =>
                  setDiagnostics({
                    ...diagnostics,
                    bloodTests: e.target.checked,
                  })
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
                  setDiagnostics({
                    ...diagnostics,
                    urineTest: e.target.checked,
                  })
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
        <button
          className="doc-btn-issue-rx"
          disabled={pendingActions.includes("prescription")}
          onClick={handleSavePrescription}
        >
          Issue &amp; Save Prescription{" "}
          <span style={{ marginLeft: 6 }}>↗</span>
        </button>
        <button
          className="doc-btn-cancel-rx"
          onClick={handleCancelPrescription}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
