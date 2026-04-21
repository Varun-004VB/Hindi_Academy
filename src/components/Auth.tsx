import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://motor-vending-paramount.ngrok-free.dev").replace(/\/+$/, "");

// --------------------------------------------------
// Permanent Device ID Function (Keep This)
// --------------------------------------------------
const getDeviceId = (): string => {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
};

import { supabase } from "../lib/supabase";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    mobile: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --------------------------------------------------
  // GOOGLE LOGIN
  // --------------------------------------------------
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google Login error:", error);
      alert("Google Login failed.");
    }
  };

  // --------------------------------------------------
  // REGISTER API CALL
  // --------------------------------------------------
  const handleRegister = async () => {
    if (!form.username || !form.mobile || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      username: form.username,
      mobile: form.mobile,
      email: form.email,
      password: form.password,
      device_id: getDeviceId(),
    };

    try {
      const response = await fetch(`${API_BASE}/manpower/signup/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("userEmail", form.email);
        alert("✅ Registration Successful!");
        setIsLogin(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Registration failed: ${errorData.message || errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed due to network error.");
    }
  };

  // --------------------------------------------------
  // LOGIN API CALL
  // --------------------------------------------------
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert("Please enter email & password");
      return;
    }

    // --- Automatic Admin Check (Robust version) ---
    const emailLower = form.email.trim().toLowerCase();
    const passwordTrim = form.password.trim();

    if (emailLower === "admin@gmail.com" && passwordTrim === "admin") {
      localStorage.setItem("admin", "true");
      localStorage.setItem("userLoggedIn", "true");
      localStorage.setItem("userEmail", "admin@gmail.com");
      navigate("/admin-dashboard");
      return;
    }

    const payload = {
      email: form.email,
      password: form.password,
      device_id: getDeviceId(),
    };

    try {
      const response = await fetch(`${API_BASE}/manpower/owners/login/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("userEmail", form.email);
        alert("✅ User Login Successful!");
        navigate("/");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Login failed: ${errorData.message || errorData.detail || "Invalid credentials"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed due to network error.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE IMAGE */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, rgba(168,85,247,0.7), rgba(219,39,119,0.7)),
              url('https://i.pinimg.com/736x/a1/ca/ea/a1caead725be9f9e5b53852ae1c3ebc9.jpg')
            `,
          }}
        />
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <div className="space-y-5">
            {/* Show extra fields only for Registration */}
            {!isLogin && (
              <>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  type="text"
                  placeholder="Username"
                  className="w-full border-b-2 border-gray-300 focus:border-purple-500 outline-none py-2"
                />

                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  type="text"
                  placeholder="Mobile Number"
                  className="w-full border-b-2 border-gray-300 focus:border-purple-500 outline-none py-2"
                />
              </>
            )}

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Email Address"
              className="w-full border-b-2 border-gray-300 focus:border-purple-500 outline-none py-2"
            />

            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border-b-2 border-gray-300 focus:border-purple-500 outline-none py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
              >
                👁
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={isLogin ? handleLogin : handleRegister}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-full font-semibold shadow-md shadow-purple-500/30"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 font-medium hover:underline text-center"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;