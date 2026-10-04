import { useState, type FormEvent } from "react";
import { BikeIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../config/api";

type ResetState = {
    email?: unknown;
    otp?: unknown;
};

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as ResetState | null;
    const email = typeof state?.email === "string" ? state.email : "";
    const otp = typeof state?.otp === "string" ? state.otp : "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!email || !/^\d{6}$/.test(otp)) return <Navigate to="/forgot-password" replace />;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", { email, otp, newPassword: password });
            toast.success("Password reset successfully.");
            navigate("/login", {
                replace: true,
                state: { passwordReset: true },
            });
        } catch (requestError) {
            const responseMessage = axios.isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : null;
            setError(responseMessage || "Unable to reset your password. Please try again.");
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
                    <h1 className="text-2xl font-semibold text-app-green mb-2">Set a new password</h1>
                    <p className="text-sm text-app-text-light">Choose a password with at least 8 characters.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="text-sm flex flex-col gap-1">
                        New Password
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                minLength={8}
                                maxLength={72}
                                required
                                autoComplete="new-password"
                                className="w-full px-4 pr-12 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide new password" : "Show new password"}
                                aria-pressed={showPassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-light hover:text-app-green"
                            >
                                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                            </button>
                        </div>
                    </label>
                    <label className="text-sm flex flex-col gap-1">
                        Confirm Password
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                maxLength={72}
                                required
                                autoComplete="new-password"
                                className="w-full px-4 pr-12 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                                aria-pressed={showConfirmPassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-light hover:text-app-green"
                            >
                                {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                            </button>
                        </div>
                    </label>
                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-950 text-white font-semibold rounded-xl hover:bg-green-900 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
