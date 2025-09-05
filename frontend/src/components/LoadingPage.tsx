import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <img
          src="src/assets/ChatGPT_Image_Aug_14__2025__02_37_44_PM-removebg-preview.png"
          alt="PratBlog Logo"
          className="h-16 w-auto"
        />
      </motion.div>

      {/* Spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </motion.div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 text-gray-600 font-medium"
      >
        Loading your experience...
      </motion.p>
    </div>
  );
}