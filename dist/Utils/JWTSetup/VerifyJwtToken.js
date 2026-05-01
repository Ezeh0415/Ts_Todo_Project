"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Config = require("../../Config/Config");
const verifyAccessToken = (token, refreshToken) => {
    try {
        // Try access token
        const decoded = jsonwebtoken_1.default.verify(token, Config.JWT_TOKEN_KEY);
        return { valid: true, decoded };
    }
    catch (error) {
        // Access token failed, try refresh token
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, Config.JWT_REFRESH_TOKEN_KEY);
            return { valid: true, decoded };
        }
        catch {
            // Both failed
            return { valid: false };
        }
    }
};
exports.verifyAccessToken = verifyAccessToken;
