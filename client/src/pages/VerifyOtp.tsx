import { useEffect, useState, type FormEvent } from "react";
import { BikeIcon } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../config/api";

type VerifyState = {
    email?: unknown;
    resendAvailableAt?: unknown;
    isDelivery?: unknown;
};

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as VerifyState | null;
    const email = typeof state?.email === "string" ? state.email : "";
    const isDelivery = location.pathname.startsWith("/delivery/") ||
        state?.isDelivery === true;
    const resendAvailableAt = typeof state?.resendAvailableAt === "number"
        ? state.resendAvailableAt
        : 0;
    const [cooldownUntil, setCooldownUntil] = useState(resendAvailableAt);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(resendAvailableAt ? 60 : 0);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!cooldownUntil) return;
        const timer = window.setInterval(() => {
            const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
            setSecondsRemaining(remaining);
            if (remaining === 0) window.clearInterval(timer);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [cooldownUntil]);

    if (!email) return <Navigate to="/forgot-password" replace />;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post(
                isDelivery ? "/delivery/verify-reset-otp" : "/auth/verify-reset-otp",
                { email, otp },
            );
            navigate(isDelivery ? "/delivery/reset-password" : "/reset-password", {
                state: { email, otp, isDelivery },
            });
        } catch (requestError) {
            const responseMessage = axios.isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : null;
            setError(responseMessage || "Unable to verify the code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError("");
        setMessage("");
        try {
            await api.post(
                isDelivery ? "/delivery/forgot-password" : "/auth/forgot-password",
                { email },
            );
            const nextAvailableAt = Date.now() + 60_000;
            setCooldownUntil(nextAvailableAt);
            setOtp("");
            setSecondsRemaining(60);
            setMessage("If the email is registered, a new verification code has been sent.");
        } catch (requestError) {
            const responseMessage = axios.isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : null;
            setError(responseMessage || "Unable to resend the code. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex-center px-4 py-12 bg-app-cream">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <BikeIcon className="size-8 text-app-green" />
                        <span className="text-app-green text-2xl font-semibold">Fresh Delivery</span>
                    </Link>
                    <h1 className="text-2xl font-semibold text-app-green mb-2">Verify your email</h1>
                    <p className="text-sm text-app-text-light">Enter the 6-digit code sent to your email.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="text-sm flex flex-col gap-1">
                        Verification code
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            required
                            placeholder="000000"
                            className="w-full px-4 py-3 text-center text-lg tracking-[0.4em] bg-white rounded-xl border not-focus:border-app-border transition-all"
                        />
                    </label>
                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                    {message && <p role="status" className="text-sm text-app-green">{message}</p>}
                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full py-3 bg-green-950 text-white font-semibold rounded-xl hover:bg-green-900 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>
                <div className="text-center text-sm mt-5">
                    <button
                        type="button"
                        disabled={resending || secondsRemaining > 0}
                        onClick={handleResend}
                        className="font-medium text-orange-500 hover:text-orange-600 disabled:text-app-text-light disabled:cursor-not-allowed"
                    >
                        {resending
                            ? "Sending..."
                            : secondsRemaining > 0
                                ? `Resend OTP in ${secondsRemaining}s`
                                : "Resend OTP"}
                    </button>
                    <p className="mt-4">
                        <Link to={isDelivery ? "/delivery/forgot-password" : "/forgot-password"} className="text-app-text-light hover:text-app-green">
                            Change email address
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
