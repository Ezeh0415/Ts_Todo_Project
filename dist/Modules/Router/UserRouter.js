"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const JwtAuth_1 = require("../../Config/Config/JwtAuth");
const Passport_1 = require("../../Config/Config/Passport");
const router = express_1.default.Router();
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
const passport = (0, Passport_1.configureGooglePassport)();
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
router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
// Google sends the user back to this URL
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), register //calls the controller logic
);
// task section
router.post("/createTask", JwtAuth_1.authenticate, CreateTask);
router.patch("/updatePriority", JwtAuth_1.authenticate, UpdatePriority);
router.patch("/updateStatus", JwtAuth_1.authenticate, UpdateStatus);
exports.default = router;
