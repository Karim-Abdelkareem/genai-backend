import { Router } from "express";
import {
  authenticateJWT,
  authorizeRoles,
  authorizeSelfOrRoles,
} from "../middleware/auth.middleware.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", authorizeRoles("admin"), getUsers);
router.get("/:id", getUserById);
router.put("/:id", authorizeSelfOrRoles("id", "admin"), updateUser);
router.delete("/:id", authorizeRoles("admin"), deleteUser);

export default router;
