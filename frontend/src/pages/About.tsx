import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl sm:text-6xl font-bold text-black mb-6">
            About <span className="text-black">PratBlog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Welcome to PratBlog — a platform where ideas come alive! We believe in
            creating a space for everyone to share their thoughts, stories, and
            inspirations with the world.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-200">
              Creative Writing
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-200">
              Community Driven
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-200">
              Open Platform
            </Badge>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-8 md:grid-cols-3 mb-20"
        >
          <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower creators and readers by providing a seamless blogging
                experience that connects ideas with audiences worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                A global community where creativity knows no boundaries and
                knowledge is freely shared among people of all backgrounds.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground leading-relaxed">
                We value openness, inclusivity, and the courage to share one's voice
                authentically in a respectful space.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-card rounded-3xl p-12 mb-20 border border-border"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose PratBlog?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover what makes our platform the perfect place for your creative journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "✍️", title: "Easy Writing", desc: "Intuitive editor for seamless content creation" },
              { icon: "🌍", title: "Global Reach", desc: "Share your stories with readers worldwide" },
              { icon: "💬", title: "Community", desc: "Connect with like-minded writers and readers" },
              { icon: "📈", title: "Analytics", desc: "Track your blog's performance and growth" },
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Creator Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <Card className="bg-card border border-border p-12 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
              <img 
                src="/src/assets/WhatsApp Image 2025-08-30 at 10.29.00_f312b38f.jpg" 
                alt="Lokesh Saini" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet the Creator</h2>
            <h3 className="text-2xl font-semibold text-black mb-4">Lokesh Saini</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
              Hi! I'm Lokesh Saini, the creator and developer behind PratBlog. As a passionate full-stack developer, 
              I built this platform to provide writers and readers with a beautiful, intuitive space to share and 
              discover amazing stories. My goal was to create a modern, user-friendly blogging experience that 
              brings communities together through the power of words.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                Full-Stack Developer
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                UI/UX Enthusiast
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                Tech Innovator
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground mb-12">Join Our Growing Community</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { number: "10K+", label: "Active Writers" },
              { number: "50K+", label: "Published Articles" },
              { number: "100K+", label: "Monthly Readers" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="text-4xl font-bold text-black mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}