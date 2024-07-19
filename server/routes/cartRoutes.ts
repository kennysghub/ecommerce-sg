import express from "express";
import {
  getCart,
  updateCart,
  replaceCart,
} from "../controllers/cartController";
import { authenticateToken } from "../middleware/authenticateToken";

const router = express.Router();

router.get("/", authenticateToken, getCart);
router.patch("/", authenticateToken, updateCart);
router.put("/", authenticateToken, replaceCart);

export default router;
