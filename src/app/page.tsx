"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { QuickCapture } from "@/components/capture/QuickCapture";
import { QuickCaptureFAB } from "@/components/capture/QuickCaptureFAB";
import { motion } from "framer-motion";
import { Settings, LogOut, Sparkles, Brain, Target, TrendingUp, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("Logged in user:", user);
        setUser(user);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
  };

  const features = [
    {
      icon: Brain,
      title: "Knowledge Repository",
      description: "Capture and organize your thoughts with bi-directional linking",
      color: "text-primary",
    },
    {
      icon: Target,
      title: "Kanban Tasks",
      description: "Visual task management with drag-and-drop simplicity",
      color: "text-accent",
    },
    {
      icon: TrendingUp,
      title: "Finance Tracker",
      description: "Track income and expenses with beautiful visualizations",
      color: "text-success",
    },
    {
      icon: CheckCircle2,
      title: "Habit Tracker",
      description: "Build better habits with streak tracking and analytics",
      color: "text-warning",
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px] md:bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none" />
      
      {/* Glowing Artifacts */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3], 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3], 
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3], 
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[100px]" 
        />
      </div>

      {/* Floating Login/Profile Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-4 right-4 md:top-6 md:right-6 z-50"
      >
        {user ? (
          <div className="relative">
            <div 
              className="flex items-center gap-3 px-2 py-2 rounded-full bg-background/50 backdrop-blur-md border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group touch-manipulation"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Image 
                src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                alt={user.user_metadata.full_name || "User"} 
                width={32}
                height={32}
                className="rounded-full border border-border"
              />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 rounded-xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-xl overflow-hidden"
              >
                <div className="p-1">
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <div className="flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-full bg-background/50 backdrop-blur-md border border-border/50 shadow-sm hover:shadow-md hover:bg-accent/10 transition-all cursor-pointer group touch-manipulation">
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">Login</span>
            </div>
          </Link>
        )}
      </motion.div>

      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl px-4"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Now in Development</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Second Brain
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-foreground/80 mb-8 md:mb-12 max-w-2xl mx-auto">
            Your unified personal knowledge and productivity system. Capture ideas, manage tasks, track habits, and monitor finances—all in one beautiful place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-16 w-full sm:w-auto px-4 sm:px-0">
            <Button size="lg" onClick={() => setIsQuickCaptureOpen(true)} className="w-full sm:w-auto">
              Try Quick Capture
            </Button>
            <Link href="/tasks" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                View Tasks
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {feature.title === "Kanban Tasks" ? (
                  <Link href="/tasks" className="cursor-pointer">
                    <Card hover>
                      <CardHeader>
                        <feature.icon className={`h-8 w-8 mb-2 ${feature.color}`} />
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : (
                  <Card hover>
                    <CardHeader>
                      <feature.icon className={`h-8 w-8 mb-2 ${feature.color}`} />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>

          {/* Tech Stack Badges */}
          <div className="mt-8 md:mt-12 flex flex-wrap gap-2 justify-center px-4">
            <Badge variant="primary">Next.js 15</Badge>
            <Badge variant="primary">TypeScript</Badge>
            <Badge variant="primary">Tailwind CSS</Badge>
            <Badge variant="primary">Framer Motion</Badge>
            <Badge variant="primary">Supabase</Badge>
          </div>
        </motion.div>
      </div>

      {/* Quick Capture FAB */}
      <QuickCaptureFAB onClick={() => setIsQuickCaptureOpen(true)} />

      {/* Quick Capture Modal */}
      <QuickCapture
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
      />

      {/* Demo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Component Demo"
        description="Try out the UI components"
      >
        <div className="space-y-4">
          <Input label="Title" placeholder="Enter a title..." />
          <Textarea label="Content" placeholder="What's on your mind?" rows={4} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
