import { React, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./verifyOtp.css";
import Header from "./Header_1";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      if (!email || !otp) {
        alert("All fields are required!!");
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/auth/verify-otp",
          {
            email,
            otp,
          }
        );
        alert(response.data.message); // Display success message
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      alert(errorMessage);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    try {
      if (!email) {
        alert("Email is required!!");
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/auth/resend-otp",
          {
            email,
          }
        );
        alert(response.data.message); // Display success message
        navigate("/verifyOtp");
      }
    } catch (error) {
      console.error("Resend error:", error);
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      alert(errorMessage);
    }
  };
  return (
    <div>
      <Header />
      <div className="mini-container">
        <form>
          <div>
            <label>
              <b>Email : </b>
            </label>{" "}
            &nbsp;
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>
          <br />
          <br />
          <div>
            <label>
              <b>Enter OTP : </b>
            </label>{" "}
            &nbsp;
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="input"
            />
          </div>
          <br />
          <div className="buttons">
            <button className="shine" onClick={handleVerify}>
              Verify
            </button>
            &nbsp;&nbsp;
            <button
              onClick={handleResend}
              style={{
                padding: "10px 15px",
                border: "none",
                borderRadius: "2px",
              }}
            >
              Resend Otp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
