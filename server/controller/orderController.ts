/**
 * orderController.ts
 * ------------------
 * Order management for Fresh Corner Delivery.
 * Payment: Chapa v2 Hosted Checkout ONLY.
 *
 * Flow:
 *   POST /api/orders               → createOrder
 *   POST /api/orders/:id/verify-payment → verifyOrderPayment
 *   POST /api/orders/chapa-callback     → handleChapaCallback
 */

import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";
import {
  initializeChapaPayment,
  verifyChapaPayment,
} from "../config/chapaService.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the merchant reference sent to Chapa as `merchant_reference`.
 * Includes a short timestamp suffix so every payment attempt is unique —
 * this prevents Chapa from rejecting a retry with the same reference.
 */
const buildMerchantReference = (orderId: string): string => {
  const idPart = orderId.replace(/-/g, "").slice(0, 10);
  const tsPart = Date.now().toString(36).slice(-6); // 6 base-36 chars ≈ ~2 billion range
  return `ORDER_${idPart}_${tsPart}`;
};

/**
 * Verify payment with Chapa and, if confirmed, mark the order paid and
 * decrement stock — exactly once (idempotent via updateMany where isPaid=false).
 *
 * Returns true if the order is now paid (either just confirmed or already was).
 */
const verifyAndFulfillChapaOrder = async (
  orderId: string,
  merchantReference: string
): Promise<boolean> => {
  // 1. Ask Chapa v2 for the payment status
  const verification = await verifyChapaPayment(merchantReference);

  // Chapa v2 verify response: { status, data: { status, ... } }
  // The payment status lives in data.status
  const paymentStatus = String(
    verification.data?.status ?? verification.status ?? ""
  ).toLowerCase();

  console.log(`CHAPA PAYMENT STATUS for ${merchantReference}: "${paymentStatus}"`);

  if (paymentStatus !== "success") return false;

  // 2. Load order (may already be paid from a previous call — idempotent)
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return false;
  if (order.isPaid) return true; // already fulfilled, skip stock decrement

  const orderItems = order.items as Array<{
    product: string;
    quantity: number;
  }>;

  // 3. Atomically flip isPaid false→true and decrement stock
  const markedPaid = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, isPaid: false },
      data: { isPaid: true },
    });

    if (updated.count === 0) return false; // another request already did this

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.product },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return true;
  });

  // 4. Fire Inngest events only when we're the winner of the race
  if (markedPaid) {
    for (const item of orderItems) {
      await inngest.send({
        name: "inventory/stock.update",
        data: { productId: item.product },
      });
    }
    await inngest.send({
      name: "order/placed",
      data: { orderId: order.id },
    });
  }

  return true;
};

// ─── POST /api/orders ─────────────────────────────────────────────────────────

export const createOrder = async (req: Request, res: Response) => {
  console.log("🔥 CREATE ORDER REACHED");

  const { items, shippingAddress, paymentMethod } = req.body;

  // 1. Validate items
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  // 2. Load customer
  const customer = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { name: true, email: true, phone: true },
  });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // 3. Look up real prices and stock from DB
  const productIds: string[] = items.map((i: any) => i.product);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap: Record<string, (typeof products)[0]> = {};
  products.forEach((p) => (productMap[p.id] = p));

  // 4. Stock check
  for (const item of items) {
    const product = productMap[item.product];
    if (!product || (product.stock ?? 0) < item.quantity) {
      return res.status(400).json({ message: "Product out of stock" });
    }
  }

  // 5. Build order items using DB prices (never trust client-supplied prices)
  const orderItems = items.map((item: any) => {
    const dbProduct = productMap[item.product];
    if (!dbProduct) throw new Error(`Product ${item.product} not found`);
    return {
      product: dbProduct.id,
      name: dbProduct.name,
      image: dbProduct.image,
      price: dbProduct.price,
      quantity: item.quantity,
      unit: dbProduct.unit,
    };
  });

  // 6. Calculate totals
  const subtotal = orderItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 20 ? 0 : 1.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  // 7. Create order record (not yet paid)
  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total,
      statusHistory: [
        {
          status: "placed",
          note: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    },
  });

  // 8. Card payment → initialize Chapa v1
  if (paymentMethod === "card") {
    try {
      const nameParts = customer.name.trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "Customer";

      // Generate a stable merchant reference for this order
      const merchantReference = buildMerchantReference(order.id);

      // Return URL: where Chapa sends the customer after payment.
      //
      // IMPORTANT: Do NOT use query parameters with multiple values here.
      // Chapa's hosted payment page embeds the return_url inside an HTML
      // attribute, which causes the browser to HTML-encode "&" to "&amp;".
      // When the browser follows the link, "?payment=return&amp;orderId=..."
      // arrives at the frontend with "amp;orderId" instead of "orderId".
      //
      // Solution: embed the orderId in the URL PATH so there is no "&"
      // separator at all. The route /checkout/return/:orderId is handled
      // by the CheckoutReturn page component.
      const clientUrl = (
        process.env.CLIENT_URL || "http://localhost:5173"
      ).replace(/\/$/, "");
      const returnUrl = `${clientUrl}/checkout/return/${encodeURIComponent(order.id)}`;

      // ── Debug: verify the URL contains no HTML entities ──────────────────
      console.log("========== FINAL CHAPA RETURN URL ==========");
      console.log(JSON.stringify(returnUrl));
      console.log("HAS AMP ENTITY:", returnUrl.includes("&amp;"));
      console.log("HAS NORMAL AMPERSAND:", returnUrl.includes("&"));
      console.log("============================================");

      // Callback URL (optional — only include when properly configured)
      const callbackUrl = process.env.CHAPA_CALLBACK_URL?.trim();
      const hasValidCallback =
        callbackUrl &&
        (() => {
          try {
            const u = new URL(callbackUrl);
            return (
              u.protocol === "https:" &&
              !["localhost", "127.0.0.1", "::1"].includes(u.hostname)
            );
          } catch {
            return false;
          }
        })();

      console.log("========== STARTING CHAPA v1 ==========");
      console.log("ORDER ID        :", order.id);
      console.log("TOTAL           :", total);
      console.log("TX_REF          :", merchantReference);
      console.log("RETURN URL      :", returnUrl);
      console.log("CALLBACK URL    :", hasValidCallback ? callbackUrl : "(not set — skipped)");

      const payment = await initializeChapaPayment({
        amount: total,
        orderId: order.id,
        merchantReference,
        firstName,
        lastName,
        email: customer.email,
        phone: customer.phone || undefined,
        returnUrl,
        ...(hasValidCallback ? { callbackUrl } : {}),
      });

      // Store the merchant reference so we can verify later
      await prisma.order.update({
        where: { id: order.id },
        data: { chapaReference: merchantReference },
      });

      const checkoutUrl = payment.data?.checkout_url;
      if (!checkoutUrl) {
        throw new Error(
          "Chapa responded but did not return a checkout_url. Full response: " +
            JSON.stringify(payment)
        );
      }

      console.log("========== ORDER RESPONSE ==========");
      console.log("CHECKOUT URL:", checkoutUrl);
      console.log("RESPONSE:", JSON.stringify({
        order: order.id,
        payment: { checkoutUrl },
      }, null, 2));
      console.log("====================================");

      return res.json({
        order: { ...order, chapaReference: merchantReference },
        payment: {
          checkoutUrl,
          chapaReference: merchantReference,
        },
      });
    } catch (error: any) {
      console.error("========== CHAPA PAYMENT ERROR ==========");
      console.error("STATUS :", error.response?.status);
      console.error("DATA   :", JSON.stringify(error.response?.data, null, 2));
      console.error("MESSAGE:", error.message);
      console.error("=========================================");

      return res.status(500).json({
        message: "Order created but Chapa payment initialization failed",
        // Include Chapa's error code and request_id — needed when contacting support
        error: error.response?.data ?? error.message,
        chapaRequestId: error.response?.data?.error?.details?.request_id ?? null,
        hint: "If error.code is PROCESSING_FAILED, your Chapa test key may not be provisioned for the v2 API (api.chapa.global). Contact Chapa support with the chapaRequestId above.",
      });
    }
  }

  // 9. Cash / other payment methods — create order, decrement stock immediately
  res.json({ order });

  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.product },
      data: { stock: { decrement: item.quantity } },
    });
  }

  for (const item of orderItems) {
    await inngest.send({
      name: "inventory/stock.update",
      data: { productId: item.product },
    });
  }
  await inngest.send({ name: "order/placed", data: { orderId: order.id } });
};

// ─── POST /api/orders/:id/verify-payment ──────────────────────────────────────

export const verifyOrderPayment = async (req: Request, res: Response) => {
  try {
    // 1. Find order belonging to authenticated user
    const order = await prisma.order.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentMethod !== "card") {
      return res
        .status(400)
        .json({ message: "Order does not use Chapa payment" });
    }
    if (!order.chapaReference) {
      return res
        .status(400)
        .json({ message: "Chapa merchant reference is missing on this order" });
    }

    // 2. Verify with Chapa and fulfill if paid
    const paid = await verifyAndFulfillChapaOrder(
      order.id,
      order.chapaReference
    );

    if (!paid) {
      return res.status(402).json({
        paid: false,
        message: "Chapa has not confirmed this payment",
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    return res.json({ paid: true, order: updatedOrder });
  } catch (error: any) {
    console.error(
      "CHAPA PAYMENT VERIFICATION ERROR:",
      error.response?.data ?? error.message
    );
    return res
      .status(500)
      .json({ message: "Could not verify Chapa payment" });
  }
};

// ─── POST /api/orders/chapa-callback ──────────────────────────────────────────
/**
 * Chapa v2 webhook/callback handler.
 *
 * Chapa v2 sends the merchant_reference back in the callback so we can
 * look up the order directly.  We never trust the callback status alone —
 * we always re-verify with the Chapa API before marking an order paid.
 *
 * Expected callback body fields (v2):
 *   merchant_reference  — the reference we generated (ORDER_xxxx)
 *   status              — "success" | "failed" | ...
 *
 * The route must be registered BEFORE /:id/* routes to avoid param capture.
 */
export const handleChapaCallback = async (req: Request, res: Response) => {
  try {
    console.log("========== CHAPA CALLBACK ==========");
    console.log("QUERY:", req.query);
    console.log("BODY :", req.body);

    // Chapa v1 callback sends tx_ref (not merchant_reference)
    const merchantReference = String(
      req.body?.tx_ref ??
        req.query?.tx_ref ??
        ""
    );

    if (!merchantReference) {
      return res.status(400).json({
        message: "tx_ref is missing from Chapa callback",
      });
    }

    console.log("TX_REF (merchant reference):", merchantReference);

    // Find the order by the merchant reference we stored
    const order = await prisma.order.findFirst({
      where: { chapaReference: merchantReference },
    });

    if (!order) {
      console.error("❌ ORDER NOT FOUND FOR MERCHANT REFERENCE:", merchantReference);
      return res.status(404).json({
        message: "Order not found for merchant_reference",
        merchantReference,
      });
    }

    console.log("✅ ORDER FOUND:", order.id);

    // Always verify server-side — never trust callback status alone
    const paid = await verifyAndFulfillChapaOrder(order.id, merchantReference);

    console.log("✅ PAYMENT VERIFIED:", paid);

    return res.json({ received: true, paid, orderId: order.id });
  } catch (error: any) {
    console.error("========== CHAPA CALLBACK ERROR ==========");
    console.error("STATUS :", error.response?.status);
    console.error("DATA   :", JSON.stringify(error.response?.data, null, 2));
    console.error("MESSAGE:", error.message);
    console.error("==========================================");

    return res
      .status(500)
      .json({ message: "Could not process Chapa callback" });
  }
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────

export const getUserOrders = async (req: Request, res: Response) => {
  const { status } = req.query;
  const where: any = {
    userId: req.user!.id,
    // Hide unpaid card orders from the customer's order list
    NOT: [{ paymentMethod: "card", isPaid: false }],
  };
  if (status && status !== "all") {
    where.status = status;
  }
  const orders = await prisma.order.findMany({
    where,
    include: {
      deliveryPartner: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────

export const getorder = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id },
    include: {
      deliveryPartner: {
        select: { name: true, phone: true, avatar: true, vehicleType: true },
      },
    },
  });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json({ order });
};

// ─── PUT /api/orders/:id/status (admin) ───────────────────────────────────────

export const updateorderstatus = async (req: Request, res: Response) => {
  const { status, note } = req.body;
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
  });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  const history = (
    Array.isArray(order.statusHistory) ? order.statusHistory : []
  ) as any[];
  history.push({
    status,
    note: note || `Order ${status.toLowerCase()}`,
    timestamp: new Date(),
  });
  const updatedOrder = await prisma.order.update({
    where: { id: String(req.params.id) },
    data: { status, statusHistory: history },
  });
  res.json({ order: updatedOrder });
};

// ─── GET /api/orders/all (admin) ──────────────────────────────────────────────

export const getAllorders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
    include: {
      user: { select: { name: true, email: true } },
      deliveryPartner: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
};

// ─── GET /api/orders/:id/location ─────────────────────────────────────────────

export const getorderlocation = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id },
    select: { liveLocation: true, status: true },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ liveLocation: order.liveLocation, status: order.status });
};
