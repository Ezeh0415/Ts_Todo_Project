"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewOtp = void 0;
const otpGenerator = require("otp-generator");
exports.NewOtp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: true,
    upperCaseAlphabets: true,
    specialChars: true,
});
