import User from "../models/User.js";
import bcrypt from "bcryptjs";

export async function getUsers(req, res, next) {
  try {
    const users = await User.find().select("-password");
    return res.ok("Users fetched", { users });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: null });
    return res.ok("User fetched", { user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: null });
    return res.ok("User updated", { user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: null });
    return res.ok("User deleted");
  } catch (err) {
    next(err);
  }
}
