export default function PatientQueueCard({
  showToast,
  nowServing,
  queueList,
  handleCallNext,
  handleCheckIn,
  handleHold,
  handleComplete,
}) {
  return (
    <div id="patient-queue-card" className="doc-card">
      <h2 className="doc-card-title">Patient Queue</h2>

      {/* Now Serving Strip */}
      <div className="doc-serving-strip">
        <div className="doc-serving-info">
          <div className="doc-serving-token-header">
            <span className="doc-token-bold">
              Now Serving: Token #{nowServing.token}
            </span>
            <span
              className="doc-green-status-dot"
              aria-label="Active Consultation"
            ></span>
          </div>
          <p className="doc-serving-details">
            <span className="doc-bullet-dot">●</span> {nowServing.patientName}{" "}
            &bull; Age: {nowServing.age} &bull; Room {nowServing.room}
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
                        onClick={() =>
                          showToast(`Approved patient ${item.patientName}`)
                        }
                      >
                        ✓
                      </button>
                      <button
                        className="doc-btn-icon-edit"
                        title="Edit"
                        onClick={() =>
                          showToast(`Edit patient ${item.patientName}`)
                        }
                      >
                        ✎
                      </button>
                      <button
                        className="doc-btn-icon-more"
                        title="More options"
                        onClick={() =>
                          showToast(`Options for ${item.patientName}`)
                        }
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
  );
}
