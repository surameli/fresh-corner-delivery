import { useState, type FormEvent } from "react";
import { BikeIcon, MailIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../config/api";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/forgot-password", { email });
            navigate("/verify-otp", {
                state: { email: email.trim().toLowerCase(), resendAvailableAt: Date.now() + 60_000 },
            });
        } catch (requestError) {
            const message = axios.isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : null;
            setError(message || "Unable to request a verification code. Please try again.");
        } finally {
            setLoading(false);
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
                    <h1 className="text-2xl font-semibold text-app-green mb-2">Forgot Password?</h1>
                    <p className="text-sm text-app-text-light">
                        Enter your email and we&apos;ll send a password reset code if an account is registered.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="text-sm flex flex-col gap-1">
                        Email Address
                        <div className="relative">
                            <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border transition-all"
                            />
                        </div>
                    </label>
                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-950 text-white font-semibold rounded-xl hover:bg-green-900 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>
                <p className="text-center text-sm mt-5">
                    <Link to="/login" className="font-medium text-orange-500 hover:text-orange-600">
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
