import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FIDashboard.css";
const AccessButton = ({ fiusername, username }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonState, setButtonState] = useState("Access"); // 'Access', 'Request sent', 'View'
  const [userData, setUserData] = useState(null); // To store user data (acceptedRequests, accessRequests)

  useEffect(() => {
    // Fetch the user's details, including acceptedRequests and accessRequests
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "https://ekyc-8o9a.onrender.com/api/auth/getUserKycData",
          {
            username,
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [username]); // Re-fetch when the username changes

  useEffect(() => {
    if (userData) {
      // Ensure that acceptedRequests and accessRequests are arrays before using 'includes'
      const acceptedRequests = Array.isArray(userData.acceptedRequests) ? userData.acceptedRequests : [];
      const accessRequests = Array.isArray(userData.accessRequests) ? userData.accessRequests : [];
      
      // Check if fiusername is in acceptedRequests or accessRequests
      if (acceptedRequests.includes(fiusername)) {
        setButtonState("View"); // If fiusername is in acceptedRequests, set button to 'View'
      } else if (accessRequests.includes(fiusername)) {
        setButtonState("Request sent"); // If fiusername is in accessRequests, set button to 'Request sent'
      } else {
        setButtonState("Access"); // Otherwise, set button to 'Access'
      }
    }
  }, [userData, fiusername]);
  

  const handleAccessRequest = async () => {
    try {
      const response = await axios.post(
        "https://ekyc-8o9a.onrender.com/api/auth/request-access",
        {
          fiusername,
          username,
        }
      );
      console.log("Response from server:", response);
      if (response.data.message) {
        alert("Request Already Sent");
      } else {
        alert("Access request sent to user.");
      }
      setButtonState("Request sent");
    } catch (error) {
      console.error("Error sending access request:", error);
    }
  };

  const handleView = async () => {
    try {
      setModalOpen(true);
      // You can open your modal here to display the details and documents
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          if (buttonState === "Access") handleAccessRequest();
          if (buttonState === "View") handleView();
        }}
        disabled={buttonState === "Request sent"} // Disable if the request is sent
      >
        {buttonState}
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setModalOpen(false)}>
              &times;
            </button>
            <h2>User Details</h2>
            <h3>Username: {userData.username}</h3>
            <h3>Full Name: {userData.fullName}</h3>
            <h3>PhoneNumber: {userData.phonenumber}</h3>
            <h3>Father Name: {userData.fatherName}</h3>
            <h3>AadharNumber: {userData.aadharnumber}</h3>
            <h3>View Files: <button><a href={`https://${userData.ipfsHash}.ipfs.w3s.link`}>View</a></button></h3>
            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessButton;
