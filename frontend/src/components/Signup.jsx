import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios for making API requests
import "./Signup.css";
import logo from "./ekyc_logo.png";
import Header from "./Header_1";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User"); // Default role is "User"
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    await navigate("/login");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://ekyc-8o9a.onrender.com/api/auth/signup",
        {
          username,
          fullName,
          email,
          role,
          password,
        }
      );
      alert(response.data.message); // Display success message
      navigate("/verifyOtp");
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      alert(errorMessage);
    }
  };

  const handleVerify=(e)=>{
    e.preventDefault();
    navigate("/verifyOtp");
  }

  return (
    <div>
      <Header />
      <div className="mini-container">
        <h2 className="title">Sign Up</h2>
        <br />
        <div className="logo">
          <img src={logo} alt="Logo" width="30%" height="20%" />
        </div>
        <div className="form">
          <form>
            <div>
              <label>
                <b>Full Name : </b>
              </label>{" "}
              &nbsp;
              <input
                type="text"
                value={fullName}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
              />
            </div>
            <br />
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
            <div>
              <label>
                <b>Username : </b>
              </label>{" "}
              &nbsp;
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input"
              />
            </div>
            <br />
            <div>
              <label>
                <b> Password : </b>
              </label>{" "}
              &nbsp;
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>
            <br />
            <div>
              <label>
                <b>Role : </b>
              </label>
              &nbsp;
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input"
              >
                <option value="User">User</option>
                <option value="FI">Financial Institution (FI)</option>
              </select>
            </div>
            <br />
            <button className="shine" onClick={handleSignup}>
              Sign Up
            </button>
          </form>
        </div>
        <div className="login">
          <p>
            Already have an account?{" "}
            <span
              onClick={handleLogin}
              style={{ cursor: "pointer", color: "blue" }}
            >
              Login
            </span>
          </p>
        </div>
        <div className="login">
          <p>
            Email Not verified?{" "}
            <span
              onClick={handleVerify}
              style={{ cursor: "pointer", color: "blue" }}
            >
              verify otp
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
