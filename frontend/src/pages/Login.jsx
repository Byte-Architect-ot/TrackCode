import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Loader, ArrowRight, GraduationCap, Users, Eye, EyeOff } from "lucide-react";
import { studentAuth, educatorAuth, authUtils } from '../api/authApi';

export default function Login({ setPage, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loginType, setLoginType] = useState("student"); // "student" or "educator"

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            let data;
            if (loginType === 'educator') {
                data = await educatorAuth.googleAuth(credentialResponse.credential);
                authUtils.saveEducatorAuth(data);
                setMessage({ text: "Educator login successful! Redirecting...", type: "success" });
                setTimeout(() => {
                    if (onLoginSuccess) onLoginSuccess();
                    setPage('practice');
                }, 500);
            } else {
                data = await studentAuth.googleAuth(credentialResponse.credential);
                authUtils.saveStudentAuth(data);
                setMessage({ text: "Login successful! Redirecting...", type: "success" });
                setTimeout(() => {
                    if (onLoginSuccess) onLoginSuccess();
                    setPage('dashboard');
                }, 500);
            }

            clearTimeout(timeoutId);
        } catch (err) {
            console.error("Google login error:", err);
            if (err.name === 'AbortError') {
                setMessage({ text: "Request timed out. Please try again.", type: "error" });
            } else {
                setMessage({ text: err.message || "Google login failed", type: "error" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            let data;
            
            if (loginType === "educator") {
                data = await educatorAuth.login(email, password);
                authUtils.saveEducatorAuth(data);
            } else {
                data = await studentAuth.login(email, password);
                authUtils.saveStudentAuth(data);
            }

            setMessage({ text: "Login successful! Redirecting...", type: "success" });
            
            setTimeout(() => {
                if (onLoginSuccess) onLoginSuccess();
                setPage(loginType === "educator" ? 'practice' : 'dashboard');
            }, 500);
        } catch (error) {
            console.error("Login error:", error);
            setMessage({ text: error.message || "Login failed", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="text-gray-400 mt-2">Sign in to access SkillGraph</p>
                </div>

                {/* Login Type Toggle */}
                <div className="flex gap-2 p-1 bg-gray-900 rounded-lg mb-6">
                    <button
                        onClick={() => setLoginType("student")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                            loginType === "student"
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <GraduationCap size={18} />
                        Student
                    </button>
                    <button
                        onClick={() => setLoginType("educator")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                            loginType === "educator"
                                ? "bg-purple-600 text-white"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Users size={18} />
                        Educator
                    </button>
                </div>

                {/* Google Login (Students only) */}
                {loginType === "student" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    setMessage({ text: "Google sign-in failed", type: "error" });
                                }}
                                theme="filled_blue"
                                shape="pill"
                                width="100%"
                            />
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">
                                    Or continue with email
                                </span>
                            </div>
                        </div>
                    </>
                )}

                {/* Educator Info */}
                {loginType === "educator" && (
                    <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-sm text-purple-300">
                            <strong>Educator Access</strong><br />
                            Create and manage contests, problems, and view student results.
                        </p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`p-3 rounded-lg text-sm ${
                            message.type === "success"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                            loginType === "educator"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        }`}
                    >
                        {isLoading ? (
                            <Loader className="animate-spin" size={20} />
                        ) : (
                            <>
                                {loginType === "educator" ? "Login as Educator" : "Login"}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-6 space-y-3">
                    <p className="text-center text-gray-400 text-sm">
                        Don't have an account?{" "}
                        <button
                            onClick={() => setPage("signup")}
                            className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                        >
                            Sign up
                        </button>
                    </p>
                    
                    {loginType === "student" && (
                        <p className="text-center text-gray-500 text-xs">
                            Want to create contests?{" "}
                            <button
                                onClick={() => setLoginType("educator")}
                                className="text-purple-400 hover:text-purple-300"
                            >
                                Login as Educator
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}