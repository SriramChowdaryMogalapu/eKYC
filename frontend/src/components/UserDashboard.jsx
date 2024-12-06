// usrdashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import Header from "./Header";
import Button from "react-bootstrap/Button";
import QRGenerator from "./QRGenerator";

function Modal({ isOpen, onClose, fiUsers, username }) {
  const [fullName, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [aadharnumber, setAadharnumber] = useState("");
  const [file, setFile] = useState(null);
  const [selectedFI, setSelectedFI] = useState("");
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  if (!isOpen) return null;
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log(selectedFI);
    const abeKey = selectedFI;
    console.log(abeKey);
    // Create a FormData object to handle file uploads
    const formData = new FormData();
    formData.append("fileBuffer", file);
    formData.append("username", username);
    formData.append("fullName", fullName);
    formData.append("fatherName", fatherName);
    formData.append("phonenumber", phonenumber);
    formData.append("aadharnumber", aadharnumber);
    formData.append("abeKey", abeKey); // Make sure you're sending the selectedFI as well

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/upload-user-kyc",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data
          },
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
        <h2>Application Form for KYC Verification</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>
              <b>username: {username}</b>
            </label>
          </div>
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
              <b>Father Name : </b>
            </label>{" "}
            <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
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
              <b>Aadhar Number : </b>
            </label>{" "}
            <input
              type="text"
              value={aadharnumber}
              onChange={(e) => setAadharnumber(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label>
              <b>Upload Aadhar : </b>
            </label>{" "}
            <input
              type="file"
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

function Modal1({isOpen, onClose,username,verificationId}){
 return <QRGenerator verificationId={verificationId}/>
}
const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ModalOpen,setModalOpen]=useState(false);
  const [fiUsers, setFiUsers] = useState([]);
  const handleModalOpen = () => {
    setModalOpen(true);
  }
  const handleModalClose = ()=>{
    setModalOpen(false);
  }
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
      setFiUsers(response.data);
    } catch (error) {
      console.error("Error fetching FI users:", error);
      alert("Failed to fetch FI users.");
    }
  };

  useEffect(() => {
    fetchFiUsers();
  }, [navigate]);

  const handleSendRequest = async (fiusername, username) => {
    try {
      await axios.post("http://localhost:5000/api/auth/request-verification", {
        username,
        fiusername,
      });
      alert("Access request sent to user.");
    } catch (error) {
      console.error("Error sending access request:", error);
    }
  };

  const handleAccept = async (fiusername, username) => {
    try {
      await axios.post("http://localhost:5000/api/auth/accept-request", {
        username,
        fiusername,
      });
      alert("User verified successfully.");
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  };

  const handleReject = async (fiusername, username) => {
    try {
      await axios.post("http://localhost:5000/api/auth/reject-access-request", {
        username,
        fiusername,
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
  console.log("kycVerified value:", user);
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
            <strong>Role:</strong> User
          </p>
        </div>
        <div className="info">
          <h2>KYC Status</h2>
          {user.kycStatus === "Verified" ? (
            <>
              <h3>Verified</h3>
              <Button variant="primary" onClick={() => handleModalOpen()}>QR Code</Button>
              <Modal1
                isOpen={isModalOpen}
                onClose={handleModalClose}
                username={user.username}
                verificationId={user.verificationId}
              />
            </>
          ) : (
            <>
              <h3>Not Verified</h3>
              <Button variant="primary" onClick={() => handleOpenModal(true)}>
                Want to Verify Your KYC?
              </Button>
              <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                fiUsers={fiUsers}
                username={user.username}
              />
            </>
          )}
        </div>
      </div>
      <div className="request-container">
        <h2 style={{ textAlign: "center" }}>KYC Access Requests</h2>
        <div className="info">
          <table style={{ color: "black" }}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(user.accessRequests) &&
              user.accessRequests.length > 0 ? (
                user.accessRequests.map((request) => (
                  <tr key={request}>
                    <td>{request}</td>
                    <td>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() =>
                            handleAccept(request,user.username)
                          }
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleReject(request,user.username)
                          }
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
                    No Access requests available.
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
        <div className="sent-requests">
          <h2 style={{ textAlign: "center" }}>FIs to which QR is sent</h2>
          <div className="info"></div>
        </div>
        <div className="accepted-requests">
          <h2 style={{ textAlign: "center" }}>
            FIs whose access requests are accepted
          </h2>
          <div className="info">
          <table style={{ color: "black" }}>
            <thead>
              <tr>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(user.accessRequests) &&
              user.acceptedRequests.length > 0 ? (
                user.acceptedRequests.map((request) => (
                  <tr key={request}>
                    <td colSpan="3" style={{ textAlign: "center" }}>{request}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No Accepted requests available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        <div className="send-requests">
          <h2 style={{ textAlign: "center" }}>
            Want to send Kyc Requests to FI?
          </h2>
          <div className="info">
            <table style={{ color: "black" }}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(fiUsers) &&
                fiUsers.length > 0 &&
                user.kycStatus === "Verified" ? (
                  fiUsers.map((request) => (
                    <tr key={request.username}>
                      <td>{request.username}</td>
                      <td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() =>
                              handleSendRequest(user.username, request.username)
                            }
                          >
                            Send
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      Kyc Not Verified!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
