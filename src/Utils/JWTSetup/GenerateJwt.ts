import jwt from "jsonwebtoken";
const Config = require('../../Config/Config');




export const generateAccessToken = (userId: object, email: string) => {
  return jwt.sign(
    { userId, email },           // Payload (data to store)
    Config.JWT_TOKEN_KEY,        // Secret key
    { expiresIn: Config.JWT_TOKEN_EXPIRE } // "15m", "1h", "7d"
  );
};

export const generateRefreshToken = (userId: object, email: string) => {
  return jwt.sign(
    { userId, email },
    Config.JWT_REFRESH_TOKEN_KEY,
    { expiresIn: Config.JWT_REFRESH_TOKEN_EXPIRE } // "7d"
  );
};