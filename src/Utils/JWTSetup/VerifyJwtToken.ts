import jwt from "jsonwebtoken";
const Config = require("../../Config/Config");

export const verifyAccessToken = (token: string, refreshToken: string) => {
  try {
    // Try access token
    const decoded = jwt.verify(token, Config.JWT_TOKEN_KEY);
    return { valid: true, decoded };
  } catch (error) {
    // Access token failed, try refresh token
    try {
      const decoded = jwt.verify(refreshToken, Config.JWT_REFRESH_TOKEN_KEY);
      return { valid: true, decoded };
    } catch {
      // Both failed
      return { valid: false };
    }
  }
};
