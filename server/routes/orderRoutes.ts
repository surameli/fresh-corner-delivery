import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import {
  createOrder,
  getAllorders,
  getorder,
  getorderlocation,
  getUserOrders,
  handleChapaCallback,
  updateorderstatus,
  verifyOrderPayment,
} from "../controller/orderController.js";

const orderRouter = express.Router();

// ── Static routes must come before /:id to avoid param capture ──────────────

// Chapa v2 webhook — no auth (Chapa calls this directly)
orderRouter.post("/chapa-callback", handleChapaCallback);

// Admin: all orders
orderRouter.get("/all", auth, admin, getAllorders);

// ── Authenticated user routes ────────────────────────────────────────────────

orderRouter.post("/", auth, createOrder);
orderRouter.get("/", auth, getUserOrders);

// ── Parameterised routes ─────────────────────────────────────────────────────

orderRouter.post("/:id/verify-payment", auth, verifyOrderPayment);
orderRouter.get("/:id", auth, getorder);
orderRouter.put("/:id/status", auth, admin, updateorderstatus);
orderRouter.get("/:id/location", auth, getorderlocation);

export default orderRouter;
