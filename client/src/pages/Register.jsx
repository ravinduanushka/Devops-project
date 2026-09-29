import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    doctorDetails: {
      specialization: "",
      roomNo: ""
    },
    nurseDetails: {
      assignedWard: "",
      shiftTime: "Morning"
    },
    receptionistDetails: {
      deskNumber: ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: selectedRole
      };

      if (selectedRole === "Doctor") {
        payload.doctorDetails = {
          specialization: formData.doctorDetails.specialization.trim(),
          roomNo: formData.doctorDetails.roomNo.trim()
        };
      } else if (selectedRole === "Nurse") {
        payload.nurseDetails = {
          assignedWard: formData.nurseDetails.assignedWard.trim(),
          shiftTime: formData.nurseDetails.shiftTime
        };
      } else if (selectedRole === "Receptionist") {
        payload.receptionistDetails = {
          deskNumber: formData.receptionistDetails.deskNumber.trim()
        };
      }

      await registerUser(payload);
      setSuccessMessage(`Registered successfully as ${selectedRole}! Redirecting to login...`);

      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-register-page">
      {/* Blurred background image layer */}
      <div className="role-bg-layer" />
      <div className="role-bg-overlay" />

      {/* Main Crisp Foreground Content */}
      <div className="role-register-content">
        {/* Top-left Brand Logo */}
        <header className="role-top-bar">
          <Link to="/" className="role-logo-link" title="Back to Home">
            <img
              src="/health-logo.png"
              alt="NexusHealth Logo"
              className="role-logo-img"
              onError={(e) => {
                e.currentTarget.src = "/health logo.png";
              }}
            />
          </Link>
        </header>

        {/* Center Role Selection View */}
        <main className="role-selection-center">
          <h1 className="role-title">Create your Account</h1>
          <p className="role-subtitle">Choose your role</p>

          {/* 4 Role Buttons in 2x2 Grid matching Figma specification */}
          <div className="role-buttons-grid">
            <button
              type="button"
              className="role-pill-btn"
              onClick={() => handleSelectRole("Doctor")}
              aria-label="Register as Doctor"
            >
              Doctor
            </button>

            <button
              type="button"
              className="role-pill-btn"
              onClick={() => handleSelectRole("Patient")}
              aria-label="Register as Patient"
            >
              Patient
            </button>

            <button
              type="button"
              className="role-pill-btn"
              onClick={() => handleSelectRole("Nurse")}
              aria-label="Register as Nurse"
            >
              Nurse
            </button>

            <button
              type="button"
              className="role-pill-btn"
              onClick={() => handleSelectRole("Receptionist")}
              aria-label="Register as Receptionist"
            >
              Receptionist
            </button>
          </div>

          <div className="role-signin-hint">
            Already have an account?{" "}
            <Link to="/login" className="role-signin-link">
              Sign In
            </Link>
          </div>
        </main>
      </div>

      {/* Registration Details Modal Dialog */}
      {selectedRole && (
        <div className="role-modal-overlay" onClick={handleCloseModal}>
          <div
            className="role-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-role-title"
          >
            <div className="role-modal-header">
              <div className="role-modal-title-group">
                <h2 id="modal-role-title" className="role-modal-title">
                  Register as {selectedRole}
                </h2>
                <span className="role-badge-tag">{selectedRole}</span>
              </div>
              <button
                type="button"
                className="role-modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close registration form"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="alert-box alert-error" role="alert">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="alert-box alert-success" role="alert">
                <span>✅ {successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name *</label>
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    placeholder={
                      selectedRole === "Doctor"
                        ? "Dr. Sarah Jenkins"
                        : selectedRole === "Nurse"
                        ? "Nurse Amanda Silva"
                        : "John Doe"
                    }
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address *</label>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    placeholder="user@nexushealth.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number *</label>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  placeholder="077-1234567 / 091-9118207"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Role-Specific Fields */}
              {selectedRole === "Doctor" && (
                <div className="role-specific-box">
                  <h4 className="role-box-title">Doctor Credentials</h4>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="doc-spec">Specialization</label>
                      <input
                        id="doc-spec"
                        type="text"
                        name="doctorDetails.specialization"
                        placeholder="e.g. Cardiology, Neurology, General"
                        value={formData.doctorDetails.specialization}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="doc-room">Room No.</label>
                      <input
                        id="doc-room"
                        type="text"
                        name="doctorDetails.roomNo"
                        placeholder="e.g. Room 204 / OPD-1"
                        value={formData.doctorDetails.roomNo}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === "Nurse" && (
                <div className="role-specific-box">
                  <h4 className="role-box-title">Nursing Assignment</h4>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="nurse-ward">Assigned Ward</label>
                      <input
                        id="nurse-ward"
                        type="text"
                        name="nurseDetails.assignedWard"
                        placeholder="e.g. Ward B - ICU / Pediatrics"
                        value={formData.nurseDetails.assignedWard}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="nurse-shift">Shift Time</label>
                      <select
                        id="nurse-shift"
                        name="nurseDetails.shiftTime"
                        value={formData.nurseDetails.shiftTime}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === "Receptionist" && (
                <div className="role-specific-box">
                  <h4 className="role-box-title">Reception Assignment</h4>
                  <div className="form-group">
                    <label htmlFor="rec-desk">Desk / Counter Number</label>
                    <input
                      id="rec-desk"
                      type="text"
                      name="receptionistDetails.deskNumber"
                      placeholder="e.g. Front Desk #1 / Counter A"
                      value={formData.receptionistDetails.deskNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="reg-password">Password * (min 6 chars)</label>
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-confirm">Confirm Password *</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Change Role
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {loading ? "Registering..." : `Create ${selectedRole} Account`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;