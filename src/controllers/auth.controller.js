import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendEmail } from "../utils/mailer.js";

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  };
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already in use", data: null });
    const hashed = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      username,
      email,
      password: hashed,
      emailVerificationToken,
    });

    // Send verification email (optional)
    if (process.env.EMAIL_FROM && process.env.SMTP_HOST) {
      const verifyUrl = `${
        process.env.APP_URL || "http://localhost:3000"
      }/verify-email?token=${emailVerificationToken}`;
      await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `Click <a href="${verifyUrl}">here</a> to verify your email.`,
      });
    }

    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setAuthCookies(res, accessToken, refreshToken);

    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
    return res.created("User registered", {
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials", data: null });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials", data: null });

    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setAuthCookies(res, accessToken, refreshToken);
    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
    return res.ok("Logged in", { user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.ok("Logged out");
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({
          success: false,
          message: "Refresh token required",
          data: null,
        });
    const decoded = verifyRefreshToken(token);
    const payload = { sub: decoded.sub, role: decoded.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setAuthCookies(res, accessToken, refreshToken);
    return res.ok("Token refreshed", { accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid token", data: null });
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return res.ok("Email verified");
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.ok("If that email exists, a reset was sent");
    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();
    const resetUrl = `${
      process.env.APP_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;
    if (process.env.EMAIL_FROM && process.env.SMTP_HOST) {
      await sendEmail({
        to: email,
        subject: "Password reset",
        html: `Reset: <a href="${resetUrl}">${resetUrl}</a>`,
      });
    }
    return res.ok("If that email exists, a reset was sent");
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired token",
          data: null,
        });
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.ok("Password reset successful");
  } catch (err) {
    next(err);
  }
}
