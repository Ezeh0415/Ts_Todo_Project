 const otpGenerator = require("otp-generator");
 
export const NewOtp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: true,
    });

