import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("✅ Signup successful! Please log in.");
        navigate("/login");
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("⚠️ Something went wrong. Try again.");
      console.error(err);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    } catch (err) {
      console.error(err);
      setMessage("❌ Google sign-up failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar with logo only */}
      <nav className="bg-gray-100">
        <div className="max-w-7xl px-1 py-3 flex items-center justify-start">
          <img
            src="src/assets/ChatGPT_Image_Aug_14__2025__02_37_44_PM-removebg-preview.png"
            alt="PratBlog Logo"
            className="h-10 w-auto"
          />
        </div>
      </nav>

      {/* Signup form */}
      <div className="flex-grow flex justify-center items-center px-4 sm:px-0">
        <div className="p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Floating Email Input */}
            <div className="relative w-full">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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

            {/* Floating Password Input */}
            <div className="relative w-full">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="peer w-full bg-gray-100 border-2 border-black rounded-full px-4 pt-5 pb-2 focus:outline-none focus:border-blue-500"
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

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-[#131313] hover:bg-[#333333] text-white px-4 py-3 flex justify-center items-center rounded-full transition"
            >
              Sign Up
            </button>
          </form>

          {/* Google signup button */}
          <button
            onClick={handleGoogleSignup}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black py-2 rounded-lg transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
          )}

          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
