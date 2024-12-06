const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  fullName: String,
  aadharnumber: String,
  phonenumber: String,
  fatherName: String,
  ipfsHash: String,
  abeKey: String,
  regNo: String,
  email: { type: String, unique: true },
  role: String,
  password: String,
  otp: String,
  isVerified: { type: String, default: "false" },
  kycVerified: { type: String, default: "false" },
  kycStatus: { type: String, default: "Pending" },
  canVerify: { type: String, default: "false" },
  verifiedby: { type: String, default: "" },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationId:{type:String,default:""},
  signature:{type:String},
  sentRequests:[],
  sentAccessRequests:[],
  accessRequests: [],
  verifyRequests: [],
  verifiedRequests: [],
  acceptedRequests: [],
});

module.exports = mongoose.model("User", userSchema);
