import RequireSession from "./components/RequireSession";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Doctor from "./pages/Doctor";
import Patient from "./pages/Patient";
import Nurse from "./pages/Nurse";
import Receptionist from "./pages/Receptionist";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<RequireSession role="Admin"><Admin /></RequireSession>} />
        <Route path="/doctor" element={<RequireSession role="Doctor"><Doctor /></RequireSession>} />
        <Route path="/patient" element={<RequireSession role="Patient"><Patient /></RequireSession>} />
        <Route path="/nurse" element={<RequireSession role="Nurse"><Nurse /></RequireSession>} />
        <Route path="/receptionist" element={<RequireSession role="Receptionist"><Receptionist /></RequireSession>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;