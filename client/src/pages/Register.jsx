import { useState } from "react";
import { registerUser } from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Receptionist",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await registerUser(formData);

      console.log("Registration successful:", response.data);
      alert("Registration successful!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h1>Hospital Management System</h1>

      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
          <option value="Receptionist">Receptionist</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;