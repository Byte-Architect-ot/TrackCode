import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, Loader, ArrowRight, GraduationCap, Users, Eye, EyeOff, Key, CheckCircle } from "lucide-react";
import { studentAuth, educatorAuth, authUtils } from '../api/authApi';

export default function Signup({ setPage, onSignupSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
        // secretKey field removed to keep educator flow basic
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [signupType, setSignupType] = useState("student");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Password validation
    const passwordValidation = {
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
        matches: formData.password === formData.confirmPassword && formData.password.length > 0
    };

    const isPasswordValid = Object.values(passwordValidation).every(v => v);

    const handleGoogleSuccess = async (credentialResponse) => {
        if (signupType === "educator") {
            setMessage({ text: "Google signup is only available for students", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const data = await studentAuth.googleAuth(credentialResponse.credential);
            authUtils.saveStudentAuth(data);
            
            setMessage({ text: "Account created successfully! Redirecting...", type: "success" });
            setTimeout(() => {
                if (onSignupSuccess) onSignupSuccess();
                setPage('dashboard');
            }, 500);
        } catch (err) {
            setMessage({ text: err.message || "Google signup failed", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!agreedToTerms) {
            setMessage({ text: "Please agree to the terms and conditions", type: "error" });
            return;
        }

        if (!isPasswordValid) {
            setMessage({ text: "Please fix password requirements", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            let data;
            
            if (signupType === "educator") {
                // secretKey is not required/used in current flow
                data = await educatorAuth.register(
                    formData.name, 
                    formData.email, 
                    formData.password
                );
                authUtils.saveEducatorAuth(data);
            } else {
                data = await studentAuth.register(
                    formData.name, 
                    formData.email, 
                    formData.password
                );
                authUtils.saveStudentAuth(data);
            }

            setMessage({ text: "Account created successfully! Redirecting...", type: "success" });
            
            setTimeout(() => {
                if (onSignupSuccess) onSignupSuccess();
                setPage(signupType === "educator" ? 'practice' : 'dashboard');
            }, 500);
        } catch (error) {
            setMessage({ text: error.message || "Signup failed", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const PasswordCheck = ({ valid, text }) => (
        <div className={`flex items-center gap-2 text-xs ${valid ? 'text-green-400' : 'text-gray-500'}`}>
            <CheckCircle size={12} className={valid ? 'opacity-100' : 'opacity-30'} />
            {text}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="text-gray-400 mt-2">Join SkillGraph today</p>
                </div>

                {/* Signup Type Toggle */}
                <div className="flex gap-2 p-1 bg-gray-900 rounded-lg mb-6">
                    <button
                        onClick={() => setSignupType("student")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                            signupType === "student"
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <GraduationCap size={18} />
                        Student
                    </button>
                    <button
                        onClick={() => setSignupType("educator")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                            signupType === "educator"
                                ? "bg-purple-600 text-white"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Users size={18} />
                        Educator
                    </button>
                </div>

                {/* Google Signup (Students only) */}
                {signupType === "student" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    setMessage({ text: "Google sign-up failed", type: "error" });
                                }}
                                theme="filled_blue"
                                shape="pill"
                                text="signup_with"
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
                {signupType === "educator" && (
                    <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-sm text-purple-300">
                            <strong>Educator Registration</strong><br />
                            A secret key may be provided by the administrator, but it is optional for now.
                        </p>
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Educator secret-key input removed to keep registration basic */}

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        
                        {/* Password Requirements */}
                        {formData.password && (
                            <div className="mt-2 grid grid-cols-2 gap-1">
                                <PasswordCheck valid={passwordValidation.minLength} text="8+ characters" />
                                <PasswordCheck valid={passwordValidation.hasUppercase} text="Uppercase letter" />
                                <PasswordCheck valid={passwordValidation.hasLowercase} text="Lowercase letter" />
                                <PasswordCheck valid={passwordValidation.hasNumber} text="Number" />
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                className={`w-full bg-gray-700 border text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 ${
                                    formData.confirmPassword && !passwordValidation.matches
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-600 focus:ring-blue-500'
                                }`}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {formData.confirmPassword && !passwordValidation.matches && (
                            <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                        )}
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded bg-gray-700 border-gray-600"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-400">
                            I agree to the{" "}
                            <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                        </label>
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
                        disabled={isLoading || !isPasswordValid || !agreedToTerms}
                        className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            isLoading || !isPasswordValid || !agreedToTerms
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : signupType === "educator"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-[1.02]"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-[1.02]"
                        }`}
                    >
                        {isLoading ? (
                            <Loader className="animate-spin" size={20} />
                        ) : (
                            <>
                                Create {signupType === "educator" ? "Educator" : ""} Account
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account?{" "}
                    <button
                        onClick={() => setPage("login")}
                        className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}