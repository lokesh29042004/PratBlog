import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-6xl sm:text-7xl font-bold text-black leading-tight mb-6">
            Welcome to PratBlog
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your personal space to <span className="text-black font-semibold">share stories</span>, 
            <span className="text-black font-semibold"> explore ideas</span>, and 
            <span className="text-black font-semibold"> connect with the world.</span>
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gray-200 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Write Stories</h3>
              <p className="text-sm text-muted-foreground">Share your thoughts and experiences with our community</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gray-200 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Discover Content</h3>
              <p className="text-sm text-muted-foreground">Explore amazing articles from talented writers</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gray-200 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Join Community</h3>
              <p className="text-sm text-muted-foreground">Connect with like-minded writers and readers</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={() => navigate("/SignUp")}
            size="lg"
            className="px-8 py-6 text-lg font-semibold bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </Button>
          
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg font-semibold border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
          >
            Sign In
          </Button>
        </motion.div>

        {/* Sub text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Join thousands of writers sharing their stories on PratBlog
        </motion.p>
      </motion.div>
    </div>
  );
}
