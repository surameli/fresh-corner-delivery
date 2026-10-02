import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useRef, useState } from "react";
import type { Address } from "../types";
import {
  ArrowLeft,
  CheckIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MapPinIcon,
} from "lucide-react";
import CheckoutAddress from "../components/Checkout/CheckoutAddress";
import CheckoutPayment from "../components/Checkout/CheckoutPayment";
import CheckoutReview from "../components/Checkout/CheckoutReview";
import api from "../config/api";
import toast from "react-hot-toast";
import { UseAuth } from "../context/AuthContext";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();

  // Use native URLSearchParams as the source of truth for Chapa return params.
  // useSearchParams() has been observed returning null for orderId on a fresh
  // external redirect (window.location.assign) even when the param is present
  // in window.location.search. Native URLSearchParams is always reliable.
  const nativeParams = new URLSearchParams(window.location.search);

  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  const { items, cartTotal, clearCart } = useCart();
  const { user } = UseAuth();

  const [step, setStep] = useState("address");
  const [loading, setLoading] = useState(false);

  const [paymentReturnStatus, setPaymentReturnStatus] = useState<
    "unconfirmed" | "error" | null
  >(null);

  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const verificationStarted = useRef<string | null>(null);

  // =========================================================
  // CHAPA RETURN PARAMETERS
  // =========================================================

  const isPaymentReturn = nativeParams.get("payment") === "return";

  const paymentReturnOrderId = isPaymentReturn
    ? nativeParams.get("orderId")
    : null;

  // =========================================================
  // DEBUG CHAPA RETURN URL
  // =========================================================

  useEffect(() => {
    if (!isPaymentReturn) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    console.log("========== CHAPA RETURN ==========");
    console.log("CURRENT URL:", window.location.href);
    console.log("SEARCH:", window.location.search);
    console.log("PAYMENT:", params.get("payment"));
    console.log("ORDER ID:", params.get("orderId"));
    console.log("ALL PARAMS:", Object.fromEntries(params.entries()));
    console.log("==================================");
  }, [isPaymentReturn]);

  // =========================================================
  // ADDRESS
  // =========================================================

  const defaultAddress =
    user?.addresses?.find((savedAddress) => savedAddress.isDefault) ||
    user?.addresses?.[0];

  const [addressOverride, setAddress] = useState<Address | null>(null);

  const address: Address =
    addressOverride ??
    (defaultAddress
      ? {
          id: defaultAddress.id,
          label: defaultAddress.label,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zip: defaultAddress.zip,
          isDefault: defaultAddress.isDefault,
          lat: defaultAddress.lat,
          lng: defaultAddress.lng,
        }
      : {
          id: "",
          label: "Home",
          address: "",
          city: "",
          state: "",
          zip: "",
          isDefault: false,
          lat: 0,
          lng: 0,
        });

  // =========================================================
  // PAYMENT / ORDER TOTAL
  // =========================================================

  const [paymentMethod, setPaymentMethod] = useState("card");

  const deliveryFee = cartTotal > 20 ? 0 : 1.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + deliveryFee + tax;

  // =========================================================
  // CHECKOUT STEPS
  // =========================================================

  const steps: {
    key: string;
    label: string;
    icon: typeof MapPinIcon;
  }[] = [
    {
      key: "address",
      label: "Address",
      icon: MapPinIcon,
    },
    {
      key: "payment",
      label: "Payment",
      icon: CreditCardIcon,
    },
    {
      key: "review",
      label: "Review",
      icon: CheckIcon,
    },
  ];

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
      };

      console.log("========== CREATE ORDER ==========");
      console.log("ORDER DATA:", orderData);
      console.log("PAYMENT METHOD:", paymentMethod);
      console.log("=================================");

      const { data } = await api.post("/orders", orderData);

      console.log("========== FRONTEND ORDER RESPONSE ==========");
      console.log("FULL RESPONSE:", data);
      console.log("CHECKOUT URL:", data?.payment?.checkoutUrl);
      console.log("=============================================");

      // =====================================================
      // CARD / CHAPA PAYMENT
      // =====================================================

      if (paymentMethod === "card") {
        const checkoutUrl = data.payment?.checkoutUrl;

        if (!checkoutUrl) {
          throw new Error(
            "The payment service did not return a checkout link. Your cart has been kept."
          );
        }

        console.log("========== CHAPA CHECKOUT ==========");
        console.log("CHECKOUT URL:", checkoutUrl);
        console.log("ORDER ID:", data.order?.id);
        console.log("====================================");

        // IMPORTANT:
        // Do NOT clear the cart here.
        // The cart is cleared only after Chapa payment is confirmed.

        window.location.assign(checkoutUrl);

        return;
      }

      // =====================================================
      // NON-CARD PAYMENT
      // =====================================================

      clearCart();

      toast.success("Order placed successfully!");

      navigate(`/orders/${data.order.id}`);

    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : "Could not place order";

      toast.error(message);

      console.error("========== CREATE ORDER ERROR ==========");
      console.error(error);
      console.error("========================================");

    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  // =========================================================
  // VERIFY CHAPA PAYMENT AFTER RETURN
  // =========================================================

  useEffect(() => {
    // Not a Chapa return
    if (!isPaymentReturn) {
      verificationStarted.current = null;
      setIsVerifying(false);
      setPaymentReturnStatus(null);
      return;
    }

    // Chapa returned but there is no order ID
    if (!paymentReturnOrderId) {
      console.error("========== CHAPA RETURN ERROR ==========");
      console.error("Missing orderId from return URL");
      console.error("Current URL:", window.location.href);
      console.error("=========================================");

      setIsVerifying(false);
      setPaymentReturnStatus("error");

      return;
    }

    const attemptKey = `${paymentReturnOrderId}:${verificationAttempt}`;

    // Prevent duplicate verification
    if (verificationStarted.current === attemptKey) {
      return;
    }

    verificationStarted.current = attemptKey;

    console.log("========== VERIFYING CHAPA PAYMENT ==========");
    console.log("ORDER ID:", paymentReturnOrderId);
    console.log("ATTEMPT:", verificationAttempt);
    console.log("=============================================");

    // IMPORTANT:
    // Show loading BEFORE making the request.
    setIsVerifying(true);
    setPaymentReturnStatus(null);

    api
      .post(
        `/orders/${encodeURIComponent(paymentReturnOrderId)}/verify-payment`
      )
      .then(({ data }) => {
        console.log("========== PAYMENT VERIFICATION RESPONSE ==========");
        console.log(data);
        console.log("====================================================");

        setIsVerifying(false);

        if (!data?.paid) {
          setPaymentReturnStatus("unconfirmed");
          return;
        }

        // Payment is confirmed.
        // NOW it is safe to clear the cart.
        clearCart();

        toast.success("Payment confirmed!");

        navigate(`/orders/${paymentReturnOrderId}`, {
          replace: true,
        });
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

        if (status === 402) {
          setPaymentReturnStatus("unconfirmed");
        } else {
          setPaymentReturnStatus("error");
        }
      });
  }, [
    clearCart,
    isPaymentReturn,
    navigate,
    paymentReturnOrderId,
    verificationAttempt,
  ]);

  // =========================================================
  // CHAPA RETURN SCREEN
  // =========================================================

  if (isPaymentReturn) {
    const checking =
      Boolean(paymentReturnOrderId) &&
      (isVerifying || paymentReturnStatus === null);

    const title = checking
      ? "Checking your payment"
      : paymentReturnStatus === "unconfirmed"
      ? "Payment not confirmed yet"
      : "Could not verify your payment";

    const message = checking
      ? "Please wait while we confirm your payment with Chapa."
      : !paymentReturnOrderId
      ? "The payment return link is missing its order reference. Your cart is still saved."
      : paymentReturnStatus === "unconfirmed"
      ? "Your payment has not been confirmed yet. Your cart is still saved. If you completed the payment, try checking again."
      : "We couldn't check the payment status. Your cart is still saved. Please try again.";

    return (
      <div className="min-h-screen bg-app-cream flex-center">
        <div className="max-w-md mx-4 rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-app-green">
            {title}
          </h1>

          <p className="mt-3 text-sm text-app-text-light">
            {message}
          </p>

          {/* Order ID debugging information */}
          {paymentReturnOrderId && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 break-all">
              Order: {paymentReturnOrderId}
            </div>
          )}

          {!checking && (
            <div className="mt-6 flex justify-center gap-3">
              {paymentReturnOrderId && (
                <button
                  onClick={() => {
                    setIsVerifying(true);
                    setPaymentReturnStatus(null);

                    setVerificationAttempt(
                      (attempt) => attempt + 1
                    );
                  }}
                  className="rounded-xl bg-app-green px-5 py-2.5 text-sm font-medium text-white hover:bg-app-green-light"
                >
                  Check again
                </button>
              )}

              <button
                onClick={() =>
                  navigate("/checkout", {
                    replace: true,
                  })
                }
                className="rounded-xl border border-app-border px-5 py-2.5 text-sm font-medium text-app-green"
              >
                Return to checkout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-app-cream flex-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-app-green mb-2">
            Your cart is empty
          </h2>

          <p className="text-sm text-app-text-light mb-4">
            Add some Products to Checkout
          </p>

          <button
            onClick={() => navigate("/products")}
            className="px-5 py-2.5 bg-app-green text-white text-sm font-medium rounded-xl hover:bg-app-green-light transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // NORMAL CHECKOUT PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <h1 className="text-2xl font-semibold text-app-green mb-8">
          Checkout
        </h1>

        {/* =================================================
            STEPS
        ================================================== */}

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => setStep(s.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  step === s.key
                    ? "bg-app-green text-white"
                    : "bg-white text-app-text-light"
                }`}
              >
                <s.icon className="size-4" />

                {s.label}

                {i < steps.length - 1 && (
                  <ChevronRightIcon className="size-4 text-app-text-light" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* =================================================
            CHECKOUT CONTENT
        ================================================== */}

        <div className="grid md:grid-cols-3 gap-6">

          {/* Main form */}
          <div className="md:col-span-2">

            {step === "address" && (
              <CheckoutAddress
                address={address}
                setAddress={setAddress}
                setStep={setStep}
                user={user}
              />
            )}

            {step === "payment" && (
              <CheckoutPayment
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                setStep={setStep}
              />
            )}

            {step === "review" && (
              <CheckoutReview
                address={address}
                items={items}
                handlePlaceOrder={handlePlaceOrder}
                loading={loading}
                total={total}
              />
            )}
          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================== */}

          <div className="bg-white rounded-2xl p-5 h-fit sticky top-24">

            <h3 className="text-sm font-semibold text-app-green mb-4">
              Order Summary
            </h3>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-app-text-light">
                  Subtotal ({items.length} items)
                </span>

                <span>
                  {cartTotal.toFixed(2)} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-app-text-light">
                  Delivery
                </span>

                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-app-success">
                      Free
                    </span>
                  ) : (
                    `${deliveryFee.toFixed(2)} ${currency}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-app-text-light">
                  Tax
                </span>

                <span>
                  {tax.toFixed(2)} {currency}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-app-border text-base font-semibold">
                <span>
                  Total
                </span>

                <span className="text-app-green">
                  {total.toFixed(2)} {currency}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;