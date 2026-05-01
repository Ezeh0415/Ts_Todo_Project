"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const VerifyJwtToken_1 = require("../../Utils/JWTSetup/VerifyJwtToken");
const authenticate = (req, res, next) => {
    // Get tokens from headers
    const accessToken = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
    const refreshToken = req.headers["x-refresh-token"];
    if (!accessToken || !refreshToken) {
        return res.status(401).json({
            error: "Tokens are required",
        });
    }
    // Verify tokens
    const result = (0, VerifyJwtToken_1.verifyAccessToken)(accessToken, refreshToken);
    if (!result.valid) {
        return res.status(401).json({
            error: "Invalid or expired tokens",
        });
    }
    // Attach user data to request
    req.user = result.decoded;
    next();
};
exports.authenticate = authenticate;
