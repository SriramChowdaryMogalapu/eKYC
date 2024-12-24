const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const ipfsService = require("../utils/ipfsService");
const { verifySignature } = require('../utils/cryptoUtils');
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");
const {
  addKYCRecord,
  updateKYCStatus,
  deleteKYCRecord,
  addLog,
  recordAccessRequest,
  getKYCRecord,
} = require('../utils/blockchainHelper');
exports.signup = async (req, res) => {
  try {
    const { username, fullName, email, role, password } = req.body;
    if (!username || !fullName || !email || !role || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const existingUser1 = await User.findOne({ username });
    if (existingUser1) {
      return res.status(400).json({ error: "username is already in use" });
    }
    const user = await User.create({
      username,
      fullName,
      email,
      role,
      password: hashedPassword,
      otp,
    });
    await sendEmail(email, "OTP Verification", `Your OTP is ${otp}`);
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Error in signup" });
  }
};
exports.resendOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otp1 = Math.floor(1000 + Math.random() * 9000).toString();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Your email is already verified!!" });
    } else {
      user.otp = otp1;
      await sendEmail(email, "OTP Verification", `Your OTP is ${otp1}`);
      return res.json({ message: "OTP is resent to email" });
    }
  } catch (error) {
    console.error("OTP Resend error:", error);
    return res.status(500).json({ error: "OTP Resending failed" });
  }
};
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      await sendEmail(email, "Account Verified", "Your account has been successfully verified.");
      res.json({ message: "Email verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findOne({ username, role });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) return res.status(401).json({ error: "Email not verified" });
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const date = new Date();
      await sendEmail(user.email, "Login Alert", `Dear ${username}, You have just logged in on ${date}`);
      return res.json({ message: "Login Successful", token, role: user.role });
    } else {
      return res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};
exports.getUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("username email fullName canVerify kycverified isVerified kycStatus verifiedby accessRequests acceptedRequests verifiedRequests verifyRequests verificationId"); // Select fields to return

    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getFICanVerifyData = async (req, res) => {
  try {
    const fis = await User.find({ role: "FI", canVerify: "true" }).select("username");
    res.json(fis);
  }
  catch (error) {
    console.error("FI Fetch error:", error);
    res.status(500).json({ error: "Fetching FI failed" });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email, username } = req.body;
    const user = await User.findOne({ email });

    if (!user || username != user.username) {
      return res.status(404).json({ error: "User not found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(email, "Password Reset Request", `Please click the following link to reset your password: ${resetUrl}`);

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Forgot password failed" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    await sendEmail(user.email, "Password Reset Successful", "Your password has been successfully reset.");

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Reset password failed" });
  }
};

exports.uploadFiKyc = async (req, res) => {
  const { username,
    fullName,
    regNo,
    phonenumber,
    aadharnumber,
    fileBuffer, abeKey } = req.body;
  try {
    const ipfsHash = await ipfsService.uploadToIPFS(fileBuffer);
    const user = await User.findOne({ username });

    if (!user || username != user.username) {
      return res.status(404).json({ error: "User not found" });
    }
    const fiuser = await User.findOne({ abeKey });
    if (!fiuser || abeKey != fiuser.username) {
      return res.status(404).json({ error: "User not found" });
    }
    user.fullName = fullName;
    user.regNo = regNo;
    user.phonenumber = phonenumber;
    user.ipfsHash = ipfsHash;
    user.abeKey = abeKey;
    fiuser.verifyRequests.push(username);
    await user.save();
    await fiuser.save();
    res.status(201).json({ uploaded: "Successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.uploadUserKyc = async (req, res) => {
  console.log(req.body);
  const {
    username,
    fullName,
    fatherName,
    phonenumber,
    aadharnumber,
    abeKey
  } = req.body;

  const fileBuffer = req.file.buffer;
  try {
    const ipfsHash = await ipfsService.uploadToIPFS(fileBuffer);
    const user = await User.findOne({ username });

    if (!user || username != user.username) {
      return res.status(404).json({ error: "User not found" });
    }
    const updated_abeKey = abeKey.trim();
    console.log("Searching for FI user with abeKey:", abeKey);
    const fiuser = await User.findOne({ username: updated_abeKey });
    if (!fiuser || updated_abeKey != fiuser.username) {
      return res.status(404).json({ error: "FI User not found" });
    }
    user.fullName = fullName;
    user.fatherName = fatherName;
    user.phonenumber = phonenumber;
    user.aadharnumber = aadharnumber;
    user.ipfsHash = ipfsHash;
    user.abeKey = updated_abeKey;
    fiuser.verifyRequests.push(username);
    await user.save();
    await fiuser.save();
    console.log("Request Successful!!");
    res.status(201).json({ uploaded: "Successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestAccess = async (req, res) => {
  const { fiusername, username } = req.body;
  try {
    const fiuser = await User.findOne({ username: fiusername });
    const user = await User.findOne({ username });
    if (!fiuser || fiusername !== fiuser.username) {
      return res.status(404).json({ error: "FI User not found" });
    }
    if (!user || username !== user.username) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.accessRequests.includes(fiusername)) {
      return res.status(400).json({ message: "Access request already sent" });
    }
    if (fiuser.sentAccessRequests.includes(username)) {
      return res.status(400).json({ message: "Request already present from FI" });
    }
    user.accessRequests.push(fiusername);
    fiuser.sentAccessRequests.push(username);
    await user.save();
    await fiuser.save();
    res.status(201).json({ uploaded: "Access request sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.requestVerification = async (req, res) => {
  const { username, fiusername } = req.body;
  try {
    const user = await User.findOne({ username });
    const fiuser = await User.findOne({ username: fiusername });
    if (!fiuser || fiusername != fiuser.username) {
      return res.status(404).json({ error: "User not found" });
    }
    if (fiuser.verifyRequests.includes(username)) {
      return res.status(400).json({ message: "Verify request already sent" });
    }
    if (user.sentRequests.includes(fiusername)) {
      return res.status(400).json({ message: "Request already present from User" });
    }
    const date = Date();
    fiuser.verifyRequests.push(username);
    user.sentRequests.push(fiusername);
    await user.save();
    await fiuser.save();
    res.status(201).json({ uploaded: "Successful!" });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  const { username, fiusername, } = req.body;
  try {
    const user = await User.findOne({ username });
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const fiuser = await User.findOne({ username: fiusername });
    if (!fiuser) {
      return res.status(404).json({ error: "User not found" });
    }
    const date = Date();
    user.acceptedRequests.push(fiusername);
    console.log(user.accessRequests);
    user.accessRequests = user.accessRequests.filter(item => item !== fiusername);
    console.log(user);
    await user.save();
    res.status(201).json({ Accepted: "Accepted" });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyRequest = async (req, res) => {
  const { username, fiusername } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || username !== user.username) {
      return res.status(404).json({ error: "User not found" });
    }

    const fiuser = await User.findOne({ username: fiusername });
    if (!fiuser || fiusername !== fiuser.username) {
      return res.status(404).json({ error: "FI User not found" });
    }
    const verificationId = uuidv4();
    const privateKey = `${fiusername}${username}`;
    const hmac = crypto.createHmac('sha256', privateKey);
    hmac.update(verificationId);
    const signature = hmac.digest('hex');
    const date = new Date();
    user.kycStatus = "Verified";
    user.kycVerified = true;
    user.verifiedby = fiusername;
    user.verificationId = verificationId;
    user.signature = signature;
    fiuser.verifiedRequests.push(username);
    fiuser.verifyRequests = fiuser.verifyRequests.filter(item => item !== username);
    console.log(fiuser.verifyRequests);
    console.log(user.verificationId);
    await user.save();
    await fiuser.save();
    res.status(201).json({
      message: "Accepted",
      verificationId,
      signature
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.rejectAccessRequest = async (req, res) => {
  const { username, fiusername, } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user || username != user.username) {
      return res.status(404).json({ error: "User not found" });
    }
    const fiuser = await User.findOne({ username: fiusername });
    if (!fiuser || fiusername != fiuser.username) {
      return res.status(404).json({ error: "User not found" });
    }
    const date = Date();
    fiuser.verifyRequests = fiuser.verifyRequests.filter(item => item.username != username);
    user.accessRequests = user.accessRequests.filter(item => item.username !== fiusername);
    await user.save();
    await fiuser.save();
    res.status(201).json({ Accepted: "Accepted" });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  const { username, fiusername, } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user || username != user.username) {
      return res.status(404).json({ error: "User not found" });
    }
    const fiuser = await User.findOne({ username: fiusername });
    if (!fiuser || fiusername != fiuser.username) {
      return res.status(404).json({ error: "User not found" });
    }
    const date = Date();
    user.kycStatus = "Rejected";
    const m = { username, ipfsHash };
    fiuser.verifyRequests = fiuser.verifyRequests.filter(item => item !== m);
    await user.save();
    await fiuser.save();
    res.status(201).json({ Rejected: "Rejected" });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserKycData = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username }).select("username fullName fatherName phonenumber aadharnumber ipfsHash acceptedRequests verifiedby kycStatus verificationId signature"); // Select fields to return

    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFIKycData = async (req, res) => {
  try {
    const userId = req.body;
    const user = await User.findOne(userId).select("username fullName regNo phonenumber ipfsHash");

    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyUser = (req, res) => {
  const { username, verificationId, storedSignature, fiusername } = req.body; // Added fiusername

  const isValid = verifySignature(fiusername, username, verificationId, storedSignature);
  if (isValid) {
    res.json({ message: 'Verification successful!' });
  } else {
    res.json({ message: 'Verification failed!' });
  }
};
