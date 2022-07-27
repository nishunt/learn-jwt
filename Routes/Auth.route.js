import express from "express";
import {
  login,
  logout,
  refresh,
  register,
} from "../Controllers/Auth.controllers.js";
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh-token", refresh);

router.delete("/logout", logout);

export default router;
