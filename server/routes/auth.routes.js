import express from "express";
import {
  signup,
  checkUsername,
  checkEmail,
  sendCode,
  verifyCode,
  login,
  logout,
  refreshToken,
  updatePassword,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/check-username", checkUsername);
router.get("/check-email", checkEmail);
router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/update-password", verifyToken, updatePassword);

export default router;
