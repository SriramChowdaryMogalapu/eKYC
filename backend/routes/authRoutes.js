const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-otp", authController.resendOTP);
router.get("/user", authenticateToken, authController.getUserData);
router.get("/getFis", authController.getFICanVerifyData);
router.post("/accept-request", authController.acceptRequest);
router.post("/upload-fi-kyc", authController.uploadFiKyc);
router.post("/verify-request", authController.verifyRequest);
router.post("/reject-request", authController.rejectRequest);
router.post("/reject-access-request", authController.rejectAccessRequest);
router.post("/request-access", authController.requestAccess);
router.post("/request-verification", authController.requestVerification);
router.get("/getUserKycData",authController.getUserKycData);
router.get("/getFIKycData",authController.getFIKycData);
router.post("/verifyUser",authController.verifyUser);
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload-user-kyc', upload.single('fileBuffer'), authController.uploadUserKyc);
module.exports = router;