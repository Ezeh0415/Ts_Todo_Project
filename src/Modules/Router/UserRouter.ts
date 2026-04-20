import express from "express";
const router = express.Router();

// signup imported
const SignUpModule = require("../Apis/Auth/SignUp/Signup");
const SignUp = SignUpModule.default;

// Otp imported
const OtpModule = require("../Apis/Auth/OtpVerify/OtpVerify");
const VerifyOtp = OtpModule.default;

// resend otp imported
const ResendOtpModule = require("../Apis/Auth/ResendOtp/ResendOtp");
const ResendOtp = ResendOtpModule.default;

// login imported
const LoginModule = require("../Apis/Auth/Login/Login");
const Login = LoginModule.default;

router.post("/signup", SignUp);
router.post("/VerifyOtp", VerifyOtp);
router.post("/ResendOtp", ResendOtp);
router.put("/login", Login);

export default router;
