// usrdashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FIDashboard.css";
import Header from "./Header";
import AccessButton from "./AccessButton";

function Modal({ isOpen, onClose, fiUsers, username }) {
  const [fullName, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [file, setFile] = useState(null);
  const [selectedFI, setSelectedFI] = useState(null);
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  if (!isOpen) return null;
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/upload",
        {
          username,
          fullName,
          regNo,
          phonenumber,
          file,
          selectedFI,
        }
      );
      alert("Form submitted!");
      console.log(response);
      navigate("/usrdashboard");
    } catch (error) {
      console.error("Uploading error:", error);
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      alert(errorMessage);
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Application Form to do KYC Verification</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>
              <b>Full Name : </b>
            </label>{" "}
            <input
              type="text"
              value={fullName}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label>
              <b>Phone Number : </b>
            </label>{" "}
            <input
              type="text"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label>
              <b>Govt. Registration Number : </b>
            </label>{" "}
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label>
              <b>Upload Govt. Registration Certificate : </b>
            </label>{" "}
            <input
              type="file"
              value={file}
              onChange={handleFileChange}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label>
              <b>Select FI: </b>
            </label>
            <select
              onChange={(e) => setSelectedFI(e.target.value)}
              required
              className="input"
            >
              <option value="">Select an FI</option>
              {fiUsers.map((fiUser) => (
                <option key={fiUser.username} value={fiUser.username}>
                  {fiUser.username}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <input type="checkbox" required className="input" />
            <label>
              <b>
                I agree to share my details to the verification and to store the
                files
              </b>
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

const FIDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fiUsers, setFiUsers] = useState([]);
  const handleOpenModal = () => {
    fetchFiUsers();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchFiUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/getFis");
      setFiUsers(response.data?.fis);
    } catch (error) {
      console.error("Error fetching FI users:", error);
      alert("Failed to fetch FI users.");
    }
  };

  const handleVerify = async (fiusername, username) => {
    try {
      await axios.post("http://localhost:5000/api/auth/verify-request", {
        fiusername,
        username,
      });
      alert("User verified successfully.");
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  };

  const handleReject = async (fiusername, username) => {
    try {
      await axios.post("http://localhost:5000/api/auth/reject-request", {
        fiusername,
        username,
      });
      alert("User rejected.");
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Not logged in! Please log in...");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to fetch user data. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ color: "white" }}>
      <Header className="header" />
      <h1 style={{ textAlign: "center" }}>Welcome, {user.fullName}!</h1>
      <div className="container">
        <div className="info">
          <h2>User Details</h2>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> FI
          </p>
        </div>
        <div className="info">
          <h2>KYC Details</h2>
          {user ? (
            user.canVerify === "true" ? (
              <>
                <h3>Can verify the users.</h3>
              </>
            ) : (
              <>
                <h3>Cannot Verify the users.</h3>
                <button onClick={() => handleOpenModal(true)}>
                  Want to Verify Users KYC?
                </button>
                <Modal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  fiUsers={fiUsers}
                  username={user.username}
                />
              </>
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <div className="verify-requests-container">
        <h2 style={{ textAlign: "center" }}>KYC Verify Requests</h2>
        <div className="info">
          <table style={{ color: "black" }}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(user.verifyRequests) &&
              user.verifyRequests.length > 0 ? (
                user.verifyRequests.map((request) => (
                  <tr key={request}>
                    <td>{request}</td>
                    <td>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <AccessButton
                          fiusername={user.username}
                          username={request}
                        />
                        <button
                          onClick={() => handleVerify(user.username, request)}
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleReject(user.username, request)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No verification requests available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <br />
      <br />
      <div className="requests-status">
        <div className="verified-requests">
          <h2 style={{ textAlign: "center" }}>
            Users Whose requests are verified
          </h2>
          <div className="info">
            <table style={{ color: "black" }}>
              <thead>
                <tr>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(user.verifiedRequests) &&
                user.verifiedRequests.length > 0 ? (
                  user.verifiedRequests.map((request) => (
                    <tr key={request.username}>
                      <td>{request.username}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      No verified requests available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="accepted-requests">
          <h2 style={{ textAlign: "center" }}>
            FI who has verified your registration
          </h2>
          <div className="info">
            {user.kycStatus === "Approved" ? (
              user.verifiedby === "" ? (
                <>
                  <h3>Self Verified</h3>
                </>
              ) : (
                <>
                  <h3>{user.verifiedby}</h3>
                </>
              )
            ) : (
              <h3>Not Verified!</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIDashboard;
