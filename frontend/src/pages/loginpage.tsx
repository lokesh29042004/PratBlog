import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Don’t have an account?");
  const { setLogin, setUser } = useAuth();

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      if (data.success) {
        setLogin(true);
        // Get fresh user data
        const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
          credentials: "include"
        });
        const userData = await userResponse.json();
        if (userData.success) {
          setUser(userData.user);
        }
        navigate("/");
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setMessage("Something went wrong");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    } catch (err) {
      console.error(err);
      setError("❌ Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-100">
        <div className="max-w-7xl px-1 py-3 flex items-center justify-start">
          <img
            src="src/assets/ChatGPT_Image_Aug_14__2025__02_37_44_PM-removebg-preview.png"
            alt="PratBlog Logo"
            className="h-10 w-auto"
          />
        </div>
      </nav>

      {/* Login form */}
      <div className="flex-grow flex justify-center items-center px-4 sm:px-0">
        <div className="p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email input with outlined floating label */}
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full bg-gray-100 border-2 border-black rounded-full px-4 pt-5 pb-2 focus:outline-none focus:border-blue-500"
                placeholder=" "
                required
              />
              <label
                className="absolute left-4 -top-2 bg-gray-100 px-1 text-blue-500 text-sm pointer-events-none
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 transition-all"
              >
                Email address
              </label>
            </div>

            {/* Password input */}
            <div className="relative w-full">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full bg-gray-100 border-2 border-black rounded-full px-4 pt-5 pb-2 focus:outline-none focus:ring-0 focus:border-blue-500"
                placeholder=" "
                required
              />
              <label
                className="absolute left-4 -top-2 bg-gray-100 px-1 text-blue-500 text-sm pointer-events-none
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 transition-all"
              >
                Password
              </label>
            </div>

           <button className="w-full bg-[#131313] hover:bg-[#333333] text-white px-4 py-3 flex justify-center items-center rounded-full transition">
  Continue
</button>

          </form>

          {/* Google login button */}
          <button
            onClick={handleGoogleLogin}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black py-2 rounded-lg transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <p className="mt-4 text-center text-gray-600 text-sm">
            {message}{" "}
            <Link to="/SignUp" className="text-blue-600 hover:underline">
              SignUp
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
