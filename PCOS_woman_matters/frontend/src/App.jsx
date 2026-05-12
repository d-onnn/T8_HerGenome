import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import DoctorDashboard from "./pages/doctorDashboard";
import PatientDashboard from "./pages/patientDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}