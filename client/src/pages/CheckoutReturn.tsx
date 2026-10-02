/**
 * CheckoutReturn.tsx
 * ------------------
 * Handles the Chapa payment return flow.
 *
 * Route: /checkout/return/:orderId
 *
 * WHY a separate page instead of query params on /checkout:
 *   Chapa's hosted payment page embeds the return_url inside an HTML
 *   attribute before redirecting. This causes the browser to HTML-decode
 *   "&" → "&amp;", so a URL like:
 *     /checkout?payment=return&orderId=<ID>
 *   arrives at the browser as:
 *     /checkout?payment=return&amp;orderId=<ID>
 *   making URLSearchParams return null for "orderId" (the actual key becomes
 *   "amp;orderId"). Putting the orderId in the path avoids "&" entirely.
 */

import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useRef, useState } from "react";
import api from "../config/api";
import toast from "react-hot-toast";
import axios from "axios";

const CheckoutReturn = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [paymentReturnStatus, setPaymentReturnStatus] = useState<
    "unconfirmed" | "error" | null
  >(null);
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const verificationStarted = useRef<string | null>(null);

  // =========================================================
  // DEBUG
  // =========================================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    console.log("========== CHAPA RETURN ==========");
    console.log("CURRENT URL:", window.location.href);
    console.log("SEARCH:", window.location.search);
    console.log("PAYMENT:", params.get("payment"));
    console.log("ORDER ID:", orderId ?? null);
    console.log("ALL PARAMS:", Object.fromEntries(params.entries()));
    console.log("==================================");
  }, [orderId]);

  // =========================================================
  // VERIFY CHAPA PAYMENT
  // =========================================================

  useEffect(() => {
    // Missing orderId — should never happen if the route matched
    if (!orderId) {
      console.error("========== CHAPA RETURN ERROR ==========");
      console.error("Missing orderId from URL path");
      console.error("Current URL:", window.location.href);
      console.error("=========================================");

      setIsVerifying(false);
      setPaymentReturnStatus("error");
      return;
    }

    const attemptKey = `${orderId}:${verificationAttempt}`;

    // Prevent duplicate verification for the same attempt
    if (verificationStarted.current === attemptKey) {
      return;
    }

    verificationStarted.current = attemptKey;

    console.log("========== VERIFYING CHAPA PAYMENT ==========");
    console.log("ORDER ID:", orderId);
    console.log("ATTEMPT:", verificationAttempt);
    console.log("=============================================");

    setIsVerifying(true);
    setPaymentReturnStatus(null);

    api
      .post(`/orders/${encodeURIComponent(orderId)}/verify-payment`)
      .then(({ data }) => {
        console.log("========== PAYMENT VERIFICATION RESPONSE ==========");
        console.log(data);
        console.log("====================================================");

        setIsVerifying(false);

        if (!data?.paid) {
          setPaymentReturnStatus("unconfirmed");
          return;
        }

        // Payment confirmed — safe to clear the cart now
        clearCart();

        toast.success("Payment confirmed!");

        navigate(`/orders/${orderId}`, { replace: true });
      })
      .catch((error: unknown) => {
        console.error("========== PAYMENT VERIFICATION ERROR ==========");
        console.error(error);

        if (axios.isAxiosError(error)) {
          console.error("STATUS:", error.response?.status);
          console.error(
            "DATA:",
            JSON.stringify(error.response?.data, null, 2)
          );
        }

        console.error("=================================================");

        setIsVerifying(false);

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        setPaymentReturnStatus(status === 402 ? "unconfirmed" : "error");
      });
  }, [clearCart, navigate, orderId, verificationAttempt]);

  // =========================================================
  // RENDER
  // =========================================================

  const checking =
    Boolean(orderId) && (isVerifying || paymentReturnStatus === null);

  const title = checking
    ? "Checking your payment"
    : paymentReturnStatus === "unconfirmed"
    ? "Payment not confirmed yet"
    : "Could not verify your payment";

  const message = checking
    ? "Please wait while we confirm your payment with Chapa."
    : !orderId
    ? "The payment return link is missing its order reference. Your cart is still saved."
    : paymentReturnStatus === "unconfirmed"
    ? "Your payment has not been confirmed yet. Your cart is still saved. If you completed the payment, try checking again."
    : "We couldn't check the payment status. Your cart is still saved. Please try again.";

  return (
    <div className="min-h-screen bg-app-cream flex-center">
      <div className="max-w-md mx-4 rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-app-green">{title}</h1>

        <p className="mt-3 text-sm text-app-text-light">{message}</p>

        {/* Order ID for reference */}
        {orderId && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 break-all">
            Order: {orderId}
          </div>
        )}

        {!checking && (
          <div className="mt-6 flex justify-center gap-3">
            {orderId && (
              <button
                onClick={() => {
                  setIsVerifying(true);
                  setPaymentReturnStatus(null);
                  setVerificationAttempt((n) => n + 1);
                }}
                className="rounded-xl bg-app-green px-5 py-2.5 text-sm font-medium text-white hover:bg-app-green-light"
              >
                Check again
              </button>
            )}

            <button
              onClick={() => navigate("/checkout", { replace: true })}
              className="rounded-xl border border-app-border px-5 py-2.5 text-sm font-medium text-app-green"
            >
              Return to checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutReturn;
