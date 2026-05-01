"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Config = require('../../Config/Config');
const generateAccessToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, // Payload (data to store)
    Config.JWT_TOKEN_KEY, // Secret key
    { expiresIn: Config.JWT_TOKEN_EXPIRE } // "15m", "1h", "7d"
    );
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, Config.JWT_REFRESH_TOKEN_KEY, { expiresIn: Config.JWT_REFRESH_TOKEN_EXPIRE } // "7d"
    );
};
exports.generateRefreshToken = generateRefreshToken;
