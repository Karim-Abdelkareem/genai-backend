import jwt from "jsonwebtoken";

export function signAccessToken(payload, options = {}) {
  const secret = process.env.JWT_ACCESS_SECRET || "access_secret_dev";
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  return jwt.sign(payload, secret, { expiresIn, ...options });
}

export function signRefreshToken(payload, options = {}) {
  const secret = process.env.JWT_REFRESH_SECRET || "refresh_secret_dev";
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn, ...options });
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET || "access_secret_dev";
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET || "refresh_secret_dev";
  return jwt.verify(token, secret);
}
