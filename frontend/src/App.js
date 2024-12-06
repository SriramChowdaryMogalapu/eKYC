import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import DashboardUser from "./components/UserDashboard";
import DashboardFI from "./components/FIDashboard";
import VerifyOtp from './components/VerifyOtp';
import VerificationPage from "./components/VerificationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/usrdashboard" element={<DashboardUser />} />
      <Route path="/fidashboard" element={<DashboardFI />} />
      <Route path="/verifyOtp" element={<VerifyOtp />} />
      <Route path="/verify/:verificationId" element={<VerificationPage />} />
    </Routes>
  );
}

export default App;
