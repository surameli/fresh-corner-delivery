/**
 * chapaService.ts
 * ---------------
 * Chapa v1 integration.
 * Base URL : https://api.chapa.co/v1
 * Init     : POST /transaction/initialize
 * Verify   : GET  /transaction/verify/<tx_ref>
 *
 * v1 payload shape (flat — no nested customer object):
 *   amount, currency, email, first_name, last_name, phone_number,
 *   tx_ref, return_url, callback_url, meta
 *
 * DO NOT use v2 fields:
 *   merchant_reference, customer: { ... }
 */

import axios from "axios";

// ─── Axios instance ──────────────────────────────────────────────────────────

const CHAPA_BASE_URL =
  process.env.CHAPA_BASE_URL?.trim() || "https://api.chapa.co/v1";

const chapaClient = axios.create({
  baseURL: CHAPA_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InitChapaOptions {
  amount: number;
  orderId: string;
  /** Sent to Chapa as `tx_ref`. Must be used unchanged during verification. */
  merchantReference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  returnUrl?: string;
  callbackUrl?: string;
}

export interface ChapaInitResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
    [key: string]: unknown;
  };
}

export interface ChapaVerifyResponse {
  message: string;
  status: string;
  data: {
    status: string;
    [key: string]: unknown;
  };
}

// ─── Initialize ───────────────────────────────────────────────────────────────

export const initializeChapaPayment = async (
  opts: InitChapaOptions
): Promise<ChapaInitResponse> => {
  const {
    amount,
    orderId,
    merchantReference,
    firstName,
    lastName,
    email,
    phone,
    returnUrl,
    callbackUrl,
  } = opts;

  // v1 expects the amount as a string-formatted decimal
  const formattedAmount = Number(amount.toFixed(2)).toString();

  // ── Chapa v1 flat payload ─────────────────────────────────────────────────
  // tx_ref  = our internal merchant reference
  // No nested "customer" object — all fields are top-level
  const payload: Record<string, unknown> = {
    amount: formattedAmount,
    currency: "ETB",
    email,
    first_name: firstName,
    last_name: lastName,
    tx_ref: merchantReference,          // <-- v1 field, NOT merchant_reference
    meta: { order_id: orderId },
  };

  if (phone) payload.phone_number = phone;
  if (returnUrl) payload.return_url = returnUrl;
  if (callbackUrl) payload.callback_url = callbackUrl;

  const keyExists = Boolean(process.env.CHAPA_SECRET_KEY);

  console.log("========== CHAPA V1 INITIALIZE ==========");
  console.log("TX_REF  :", merchantReference);
  console.log("PAYLOAD :", JSON.stringify(payload, null, 2));
  console.log("KEY EXISTS:", keyExists);
  console.log("==========================================");

  try {
    const response = await chapaClient.post<ChapaInitResponse>(
      "/transaction/initialize",
      payload
    );

    console.log("========== CHAPA V1 INIT RESPONSE ==========");
    console.log("STATUS:", response.status);
    console.log("DATA  :", JSON.stringify(response.data, null, 2));
    console.log("============================================");

    return response.data;
  } catch (error: unknown) {
    const axiosErr = error as import("axios").AxiosError;

    console.error("========== CHAPA V1 INIT ERROR ==========");
    console.error("STATUS :", axiosErr.response?.status);
    console.error("DATA   :", JSON.stringify(axiosErr.response?.data, null, 2));
    console.error("MESSAGE:", axiosErr.message);
    console.error("=========================================");

    throw error;
  }
};

// ─── Verify ───────────────────────────────────────────────────────────────────

export const verifyChapaPayment = async (
  merchantReference: string
): Promise<ChapaVerifyResponse> => {
  console.log("========== CHAPA V1 VERIFY ==========");
  console.log("TX_REF BEING VERIFIED:", merchantReference);
  console.log(
    "VERIFY URL:",
    `${CHAPA_BASE_URL}/transaction/verify/${encodeURIComponent(merchantReference)}`
  );
  console.log("=====================================");

  try {
    const response = await chapaClient.get<ChapaVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(merchantReference)}`
    );

    console.log("========== CHAPA V1 VERIFY RESPONSE ==========");
    console.log("STATUS:", response.status);
    console.log("DATA  :", JSON.stringify(response.data, null, 2));
    console.log("==============================================");

    return response.data;
  } catch (error: unknown) {
    const axiosErr = error as import("axios").AxiosError;

    console.error("========== CHAPA V1 VERIFY ERROR ==========");
    console.error("STATUS :", axiosErr.response?.status);
    console.error("DATA   :", JSON.stringify(axiosErr.response?.data, null, 2));
    console.error("MESSAGE:", axiosErr.message);
    console.error("===========================================");

    throw error;
  }
};
