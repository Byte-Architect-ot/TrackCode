import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight } from 'lucide-react';

// Notice we accept setPage as a prop now
const AuthPage = ({ setPage }) => {
  const [isLogin, setIsLogin] = useState(true);

  // In AuthPage.jsx

    const handleGoogleSuccess = async (credentialResponse) => {
    console.log("1. Google responded with token:", credentialResponse.credential);

    try {
      console.log("2. Sending token to Backend...");
      
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log("3. Backend HTTP status:", res.status);
      
      let data;
      try {
        data = await res.json();
        console.log("4. Backend Data:", data);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        const text = await res.text();
        console.error("Response text:", text);
        throw new Error("Invalid response from server");
      }
      
      if (res.ok) {
        console.log("5. Success! Switching to dashboard.");
        // Use accessToken if available, fallback to token
        const authToken = data.accessToken || data.token;
        if (authToken) {
          localStorage.setItem('token', authToken);
          // Save user info if available
          if (data.user) {
            localStorage.setItem('userName', data.user.username || data.user.name);
            localStorage.setItem('userEmail', data.user.email);
          }
          setPage('dashboard');
        } else {
          throw new Error("No token received from server");
        }
      } else {
        console.error("Backend refused login:", data.message || data.error);
        alert("Login failed: " + (data.message || data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("NETWORK ERROR:", err);
      if (err.name === 'AbortError') {
        alert("Request timed out. Please check your internet connection and try again.");
      } else {
        alert("Could not connect to backend server: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Enter details to access student portal' : 'Get started with your account'}
          </p>
        </div>

        {/* Google Button */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            theme="filled_blue"
            shape="pill"
            width="320"
          />
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with email</span></div>
        </div>

        {/* Form (Visual Only for now) */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
           {/* ... Input fields code from previous response ... */}
           
           <button onClick={() => setPage('dashboard')} className="w-full flex items-center justify-center bg-gray-900 text-white p-2.5 rounded-lg hover:bg-gray-800">
            {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 hover:underline">
            {isLogin ? "New student? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;