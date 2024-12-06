import React, { useState } from "react";
import axios from "axios";
import { sha256 } from "js-sha256"; // Importing the sha256 function

const VerificationPage = () => {
  const [username, setUsername] = useState("");
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Fetch user KYC data
      console.log("Username"+username);
      const response = await axios.get(`http://localhost:5000/api/auth/getUserKycData?username=${username}`);
      console.log("Response"+response);
      if (!response.data) {
        throw new Error("Failed to fetch user data");
      }

      const data = response.data;
      console.log(data);
      setVerificationData(data); // Set user data, including verifiedby
      setError("");

      // Validate the digital signature
      const isValidSignature = validateSignature(data.verifiedby, username, data.verificationId, data.signature);
      
      if (!isValidSignature) {
        setError("Invalid signature.");
        setVerificationData(null);
      }
    } catch (error) {
      setError("Error fetching verification details.");
      setVerificationData(null);
      console.error(error);
    }
  };

  // Function to validate the digital signature
  const validateSignature = (fiusername, userUsername, verificationId, signature) => {
    const publicKey = `${fiusername}${userUsername}`;
    const expectedSignature = sha256.hmac(publicKey, verificationId);
    return expectedSignature === signature;
  };

  return (
    <div>
      <h1>Verification Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          required
        />
        <button type="submit">Fetch Verification Details</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {verificationData && (
        <div>
          <h3>Verification Details</h3>
          <p><strong>Username:</strong> {verificationData.username}</p>
          <p><strong>Verified By:</strong> {verificationData.verifiedby}</p>
          <p><strong>KYC Status:</strong> {verificationData.kycStatus}</p>
          <p><strong>Verification ID:</strong> {verificationData.verificationId}</p>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;