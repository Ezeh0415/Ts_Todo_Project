// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../Utils/JWTSetup/VerifyJwtToken";

export interface AuthRequest extends Request {
  user?: any; // Add user data to request
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Get tokens from headers
  const accessToken = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
  const refreshToken = req.headers["x-refresh-token"] as string;

  if (!accessToken || !refreshToken) {
    return res.status(401).json({
      error: "Tokens are required",
    });
  }

  // Verify tokens
  const result = verifyAccessToken(accessToken, refreshToken);

  if (!result.valid) {
    return res.status(401).json({
      error: "Invalid or expired tokens",
    });
  }

  // Attach user data to request
  req.user = result.decoded;
  next();
};
