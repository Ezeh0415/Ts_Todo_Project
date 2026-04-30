import express from "express";
import { authenticate } from "../../Config/Config/JwtAuth";
import { configureGooglePassport } from "../../Config/Config/Passport";

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

const ForgotPasswordModule = require("../Apis/Auth/ForgortPassword/ForgortPassword");
const ForgotPassword = ForgotPasswordModule.default;

const ResetPasswordModule = require("../Apis/Auth/ResetPassword/ResetPassword");
const ResetPassword = ResetPasswordModule.default;

// login imported
const LoginModule = require("../Apis/Auth/Login/Login");
const Login = LoginModule.default;

// create Task imported
const CreateTaskModule = require("../Apis/TaskPage/CreateTask/CreateTask");
const CreateTask = CreateTaskModule.default;

// update Priority imported
const UpdatePriorityModule = require("../Apis/TaskPage/UpdatePriority/UpdatePriority");
const UpdatePriority = UpdatePriorityModule.default;

// update status imported
const updateStatusModule = require("../Apis/TaskPage/UpdateStatus/UpdateStatus");
const UpdateStatus = updateStatusModule.default;

const passport = configureGooglePassport();

const registerModule = require("../Apis/OAuth/OAuth");
const register = registerModule.default;

// Auth section
router.post("/signup", SignUp);
router.post("/VerifyOtp", VerifyOtp);
router.post("/ResendOtp", ResendOtp);
router.put("/login", Login);
router.post("/forgotPassword", ForgotPassword);
router.post("/resetPassword", ResetPassword);

// Google Auth Routes

// Redirect the user to Google
router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }))

// Google sends the user back to this URL
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    register //calls the controller logic
);

// task section
router.post("/createTask", authenticate, CreateTask);
router.patch("/updatePriority", authenticate, UpdatePriority);
router.patch("/updateStatus", authenticate, UpdateStatus);

export default router;
