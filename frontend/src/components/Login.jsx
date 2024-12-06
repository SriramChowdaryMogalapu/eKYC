import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios directly
import "./Login.css";
import logo from "./ekyc_logo.png";
import Header from "./Header_1";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User"); // Default role is "User"
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Directly make the API call here
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
          role,
        }
      );

      if (response.data && response.data.token) {
        alert("Login successful");
        localStorage.setItem("authToken", response.data.token); // Save JWT token
        if (role === "User") {
          navigate("/usrdashboard"); // Redirecting to dashboard after login
        } else {
          navigate("/fidashboard");
        }
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error || "Invalid credentials. Please try again.";
      alert(errorMessage);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    await navigate("/verifyOtp");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    await navigate("/signup");
  };

  const handleForgot = async (e) =>{
    e.preventDefault();
  };

  return (
    <div>
      <Header />
      <br />
      <br />
      <div className="container">
        <div className="mini-container">
          <h2 className="title">Login</h2>
          <br />
          <div className="logo">
            <img src={logo} alt="Logo" width="30%" height="20%" />
          </div>
          <div className="form">
            <form action="">
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
                  <b>Password : </b>
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
              <div className="buttons">
                <button className="shine" onClick={handleLogin}>
                  Login
                </button>
                &nbsp;&nbsp;
                <button
                  onClick={handleSignup}
                  style={{
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "2px",
                  }}
                >
                  SignUp
                </button>
              </div>
            </form>
          </div>
          <div className="login">
            <p style={{ color: "black" }}>
              Email Not verified?{" "}
              <span
                onClick={handleVerify}
                style={{ cursor: "pointer", color: "blue" }}
              >
                Verify otp
              </span>
            </p>
          </div>
          <div className="login">
            <p style={{ color: "black" }}>
              Forgot Password?{" "}
              <span
                onClick={handleForgot}
                style={{ cursor: "pointer", color: "blue" }}
              >
                Recreate Password
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
