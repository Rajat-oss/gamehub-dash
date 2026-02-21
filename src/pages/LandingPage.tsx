import React, { useRef, useState, useEffect } from 'react';
import AnimatedShaderBackground from '@/components/animated-shader-background';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Trophy, Download, Star, ArrowRight, Play, Zap, Shield, Sparkles,
  Gamepad2, Rocket, Globe, Heart, CheckCircle, Quote, ExternalLink,
  Github, Twitter, Linkedin, Mail, MapPin, Phone, TrendingUp, Headphones, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { lenisScrollY } from '@/components/SmoothScroll';
import { BentoCard } from '@/components/bento';

// Animated Dots Background Component (React Bits inspired)
const AnimatedDotsBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(120, 119, 198, 0.15) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            scale: [null, Math.random() * 0.5 + 0.5],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Spotlight Effect Component (React Bits inspired)
const Spotlight: React.FC<{ className?: string }> = ({ className }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        background: useTransform(
          [mouseX, mouseY],
          ([x, y]) =>
            `radial-gradient(600px circle at ${x}px ${y}px, rgba(120, 119, 198, 0.15), transparent 40%)`
        ),
      }}
    />
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Navbar transforms — driven by Lenis's own smoothed position, updates every RAF tick
  const navMaxWidth = useTransform(lenisScrollY, [0, 120], [9999, 1080]);
  const navHeight = useTransform(lenisScrollY, [0, 120], [100, 66]);
  const navRadius = useTransform(lenisScrollY, [0, 120], [0, 16]);
  const navPadX = useTransform(lenisScrollY, [0, 120], [40, 28]);
  const navMarginTop = useTransform(lenisScrollY, [0, 120], [0, 12]);
  const navBg = useTransform(lenisScrollY, [0, 120], ['rgba(9,9,11,0)', 'rgba(9,9,11,0.42)']);
  const navShadow = useTransform(lenisScrollY, [0, 120], ['0px 0px 0px rgba(0,0,0,0)', '0px 8px 40px rgba(0,0,0,0.3)']);
  const logoScale = useTransform(lenisScrollY, [0, 120], [1, 0.8]);


  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const showcaseRef = useRef(null);
  const socialRef = useRef(null);

  const { scrollYProgress: hwProgress } = useScroll({
    target: howItWorksRef,
    offset: ["start start", "end end"]
  });

  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  const showcaseInView = useInView(showcaseRef, { once: true, margin: '-100px' });
  const socialInView = useInView(socialRef, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Trophy,
      title: "Game Progress Tracking",
      description: "Log your gaming sessions, track completion rates, and monitor your gaming journey with detailed analytics",
      color: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-500",
      gradient: "bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent"
    },
    {
      icon: Users,
      title: "Gaming Social Network",
      description: "Share screenshots, stories, and connect with gamers worldwide who share your passion",
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
      gradient: "bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent"
    },
    {
      icon: Gamepad2,
      title: "Personal Game Library",
      description: "Organize your entire game collection, create wishlists, and discover new titles",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      gradient: "bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent"
    },
    {
      icon: Heart,
      title: "Gaming Stories & Posts",
      description: "Share your epic gaming moments, achievements, and experiences with the community",
      color: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
      gradient: "bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent"
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Rate games and read authentic reviews from fellow gamers in the community",
      color: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-500",
      gradient: "bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent"
    },
    {
      icon: Sparkles,
      title: "AI Gaming Assistant",
      description: "Get personalized game recommendations and expert gaming tips powered by AI",
      color: "from-red-500/20 to-orange-500/20",
      iconColor: "text-red-500",
      gradient: "bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent"
    }
  ];

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Games Library", href: "#games" },
      { name: "Pricing", href: "#pricing" },
      { name: "API", href: "#api" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "#careers" },
      { name: "Blog", href: "#blog" },
      { name: "Press", href: "#press" }
    ],
    support: [
      { name: "Help Center", href: "#help" },
      { name: "Contact Us", href: "#contact" },
      { name: "Status", href: "#status" },
      { name: "Community", href: "#community" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "GDPR", href: "#gdpr" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.div
          className="w-full flex items-center justify-between pointer-events-auto overflow-hidden"
          style={{
            maxWidth: navMaxWidth,
            height: navHeight,
            borderRadius: navRadius,
            paddingLeft: navPadX,
            paddingRight: navPadX,
            marginTop: navMarginTop,
            backgroundColor: navBg,
            boxShadow: navShadow,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <motion.div
            className="cursor-pointer flex-shrink-0"
            style={{ scale: logoScale, transformOrigin: 'left center' }}
            onClick={() => navigate('/')}
          >
            <img src="/logofinal.png" alt="Pixel Pilgrim" className="h-20 w-20 object-contain" />
          </motion.div>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm font-medium tracking-wide hover:text-primary transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium tracking-wide hover:text-primary transition-colors"
            >
              Features
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth?mode=login')}
                  className="hidden sm:inline-flex font-medium"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/auth?mode=signup')}
                  className="font-semibold bg-gradient-to-r from-primary to-violet-600 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Get Started
                </Button>
              </>
            )}
            {user && (
              <>
                <Button size="sm" onClick={() => navigate('/homepage')}>
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try { await logout(); navigate('/'); }
                    catch (error) { console.error('Logout error:', error); }
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.header>



      {/* Hero Section */}
      <section className="relative h-svh w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Shader Background */}
        <div className="absolute inset-0">
          <AnimatedShaderBackground />
        </div>

        {/* Dark vignette so text pops */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none z-[1]" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 w-full max-w-6xl mx-auto gap-0 pt-[100px]">

          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-5 sm:mb-8 px-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white/90 text-center">
              <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
              <span>Now in Early Access — join 50,000+ gamers</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-60" />
            </span>
          </motion.div>

          {/* Giant stacked heading */}
          <motion.h1
            className="font-black leading-[0.85] tracking-tighter select-none mb-4 sm:mb-6"
            style={{ fontFamily: 'Exo 2, sans-serif', fontSize: 'clamp(2.8rem, 13vw, 9rem)' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <span className="block text-white mix-blend-exclusion">PIXEL</span>
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
              PILGRIM
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="max-w-sm sm:max-w-xl text-base sm:text-lg md:text-xl text-white/70 leading-relaxed mb-7 sm:mb-10 px-2"
            style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            The ultimate hub to track, discover, and share your gaming journey — all in one beautiful place.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-row items-center gap-3 w-full sm:w-auto mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            {!user ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/auth?mode=signup')}
                  className="group flex-1 sm:flex-none px-6 sm:px-10 py-6 text-sm sm:text-base font-semibold rounded-full bg-white text-black hover:bg-white/90 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
                >
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group flex-1 sm:flex-none px-6 sm:px-10 py-6 text-sm sm:text-base font-semibold rounded-full border border-white/30 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 transition-all duration-300"
                  onClick={() => window.open('https://youtu.be/iLHAoc0Rrzo?si=oYsvvwqUVv3N-avL', '_blank')}
                >
                  <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Watch Demo
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate('/homepage')}
                className="group px-8 sm:px-10 py-6 text-base font-semibold rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </motion.div>
        </div>


        {/* Scroll caret */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-white/40" />
        </motion.div>
      </section>



      <Separator />

      {/* Features Section — Bento Grid */}
      <motion.section
        id="features"
        ref={featuresRef}
        className="relative py-24 md:py-32 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container relative z-10 px-4 sm:px-6">
          {/* Section Header */}
          <motion.div
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-1.5">
              <Zap className="w-4 h-4 mr-2 inline" />
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Why Choose{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Pixel Pilgrim
              </span>
              ?
            </h2>
            <p className="max-w-[700px] text-lg sm:text-xl text-muted-foreground leading-relaxed" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
              Experience gaming like never before with our cutting-edge platform
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">

            {/* Library Card — game shelf mockup */}
            <BentoCard
              eyebrow="Library"
              title="Your entire gaming universe"
              description="Track every game across every platform. Backlog, playing, completed — your full collection beautifully organized and always at your fingertips."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/60 to-[#0d0d1a] overflow-hidden">
                  <div className="absolute top-6 left-6 right-6 flex gap-3">
                    {[
                      { color: 'from-violet-500 to-purple-700', label: 'Playing', badge: 'PS5' },
                      { color: 'from-blue-500 to-cyan-700', label: 'Backlog', badge: 'PC' },
                      { color: 'from-fuchsia-500 to-pink-700', label: 'Completed', badge: 'Xbox' },
                      { color: 'from-indigo-500 to-violet-700', label: 'Wishlist', badge: 'Switch' },
                    ].map((g, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-2">
                        <div className={`h-32 rounded-xl bg-gradient-to-b ${g.color} relative overflow-hidden shadow-lg`}>
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)' }} />
                          <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-md">{g.badge}</span>
                        </div>
                        <span className="text-[10px] text-white/50 font-medium text-center">{g.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0d0d1a] to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      <span className="text-xs text-white/60">247 games tracked</span>
                    </div>
                    <div className="flex gap-1">
                      {['bg-violet-500', 'bg-blue-500', 'bg-fuchsia-500'].map((c, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${c}`} />
                      ))}
                    </div>
                  </div>
                </div>
              }
              className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
            />

            {/* Community Card — avatar network */}
            <BentoCard
              eyebrow="Community"
              title="Connect with your tribe"
              description="Find players who share your taste. Join discussions, share clips, and make friends who actually play what you play."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/60 to-[#00101a] overflow-hidden flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 0 400 300" className="absolute inset-0">
                    {/* Connection lines */}
                    {[
                      [200, 150, 110, 80], [200, 150, 290, 80], [200, 150, 80, 190],
                      [200, 150, 320, 190], [200, 150, 200, 60], [110, 80, 290, 80],
                    ].map(([x1, y1, x2, y2], i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="4,4" />
                    ))}
                  </svg>
                  {/* Nodes */}
                  {[
                    { cx: '50%', cy: '50%', size: 16, color: 'bg-cyan-400', pulse: true, label: 'You' },
                    { cx: '27%', cy: '27%', size: 11, color: 'bg-blue-400', label: 'Raj' },
                    { cx: '73%', cy: '27%', size: 11, color: 'bg-teal-400', label: 'Maya' },
                    { cx: '20%', cy: '63%', size: 9, color: 'bg-sky-400', label: 'Alex' },
                    { cx: '80%', cy: '63%', size: 9, color: 'bg-cyan-300', label: 'Sam' },
                    { cx: '50%', cy: '20%', size: 9, color: 'bg-indigo-400', label: 'Zara' },
                  ].map((n, i) => (
                    <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                      style={{ left: n.cx, top: n.cy }}>
                      {n.pulse && <div className={`absolute w-${n.size + 6} h-${n.size + 6} rounded-full ${n.color} opacity-20 animate-ping`} />}
                      <div className={`w-${n.size} h-${n.size} rounded-full ${n.color} shadow-lg flex items-center justify-center`}>
                        <span className="text-[7px] font-bold text-black">{n.label[0]}</span>
                      </div>
                      <span className="text-[9px] text-white/50">{n.label}</span>
                    </div>
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#00101a] to-transparent" />
                </div>
              }
              className="lg:col-span-3 lg:rounded-tr-4xl"
            />

            {/* Progress Card — stats bars */}
            <BentoCard
              eyebrow="Progress"
              title="Achievements & milestones"
              description="Set goals, track streaks, and celebrate milestones. Watch your gaming stats grow over time with beautiful visualizations."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-b from-amber-950/70 to-[#1a1000] overflow-hidden p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-300 font-semibold">Season Stats</span>
                  </div>
                  {/* Bar chart */}
                  <div className="flex items-end gap-2 h-28 mb-4">
                    {[45, 70, 55, 90, 60, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-md bg-gradient-to-t from-amber-600 to-yellow-400"
                          style={{ height: `${h}%`, opacity: 0.7 + i * 0.04 }} />
                        <span className="text-[8px] text-white/40">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* XP bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Level 42 · Legendary</span><span>8,420 / 10,000 XP</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-amber-500 to-yellow-300" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#1a1000] to-transparent" />
                </div>
              }
              className="lg:col-span-2 lg:rounded-bl-4xl"
            />

            {/* Discover Card — stacked game cards */}
            <BentoCard
              eyebrow="Discover"
              title="Never run out of games"
              description="Smart recommendations based on your taste and play history. Find your next obsession before your backlog empties."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 to-[#001a0d] overflow-hidden flex items-start justify-center pt-6">
                  {/* Stacked cards */}
                  {[
                    { rotate: '-8deg', color: 'from-emerald-700 to-teal-900', label: 'Elden Ring', genre: 'RPG', score: '9.8' },
                    { rotate: '3deg', color: 'from-green-700 to-emerald-900', label: 'Hades II', genre: 'Roguelite', score: '9.5' },
                    { rotate: '0deg', color: 'from-teal-600 to-emerald-800', label: 'Hollow Knight', genre: 'Metroidvania', score: '9.7' },
                  ].map((c, i) => (
                    <div key={i} className="absolute"
                      style={{ transform: `rotate(${c.rotate}) translateY(${i * 8}px)`, zIndex: 3 - i, top: '1rem', width: '75%' }}>
                      <div className={`rounded-2xl bg-gradient-to-br ${c.color} p-4 shadow-2xl border border-white/10`}>
                        <div className="flex justify-between items-start mb-8">
                          <span className="text-[10px] bg-black/40 text-white/70 rounded-full px-2 py-0.5">{c.genre}</span>
                          <span className="text-sm font-bold text-emerald-300">★ {c.score}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{c.label}</p>
                      </div>
                    </div>
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#001a0d] to-transparent" />
                </div>
              }
              className="lg:col-span-2"
            />

            {/* Reviews Card — ratings UI */}
            <BentoCard
              eyebrow="Reviews"
              title="Honest takes, real gamers"
              description="Read and write reviews from people who've actually finished the game. No influencer scores, no paid placements — just the truth."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-b from-rose-950/60 to-[#1a000a] overflow-hidden p-5">
                  {/* Score */}
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-5xl font-black text-white leading-none">9.2</span>
                    <div className="flex flex-col gap-1 pb-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= 4 ? 'text-rose-400 fill-rose-400' : 'text-rose-400/40'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-white/50">2,847 reviews</span>
                    </div>
                  </div>
                  {/* Rating bars */}
                  {[['Gameplay', 97], ['Story', 88], ['Visuals', 95], ['Audio', 82]].map(([label, pct]) => (
                    <div key={label} className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] text-white/50 w-14 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-white/40 w-6 text-right">{pct}</span>
                    </div>
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1a000a] to-transparent" />
                </div>
              }
              className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
            />

          </div>

        </div>
      </motion.section>


      {/* How It Works Section - Minimal Premium Stacking Cards */}
      <section
        ref={howItWorksRef}
        className="relative h-[400vh] bg-background"
        id="how-it-works"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

          {/* Section Header */}
          <motion.div
            className="relative z-20 text-center mb-12 sm:mb-20 px-6 pt-20"
            style={{
              opacity: useTransform(hwProgress, [0, 0.15], [1, 0]),
              y: useTransform(hwProgress, [0, 0.15], [0, -40])
            }}
          >
            <Badge variant="outline" className="px-4 py-1.5 mb-6 text-primary border-primary/20">
              <Rocket className="w-4 h-4 mr-2 inline" />
              Getting Started
            </Badge>
            <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              HOW IT <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">WORKS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
              Unlock your full gaming potential in three simple, powerful steps.
            </p>
          </motion.div>

          {/* Stacking Cards Container */}
          <div className="relative w-full max-w-4xl px-4 sm:px-6 h-[50vh] flex flex-col items-center">
            {[
              {
                icon: Users,
                title: "Create Your Identity",
                desc: "Sign up in seconds and customize your digital gaming persona with your favorite titles and platforms.",
                color: "border-blue-500/20",
                iconBg: "bg-blue-500/10 text-blue-500"
              },
              {
                icon: Gamepad2,
                title: "Track Your Journey",
                desc: "Log your sessions, build your library, and track your progress with precise, automated analytics.",
                color: "border-purple-500/20",
                iconBg: "bg-purple-500/10 text-purple-500"
              },
              {
                icon: Heart,
                title: "Connect & Conquer",
                desc: "Join a global hub of passionate gamers, share your epic moments, and discover your next favorite game.",
                color: "border-pink-500/20",
                iconBg: "bg-pink-500/10 text-pink-500"
              }
            ].map((step, index) => {
              // Normalized progress range for each card's "active" state
              const rangeStart = 0.2 + index * 0.25;
              const rangeEnd = 0.45 + index * 0.25;

              return (
                <motion.div
                  key={index}
                  className="absolute top-0 w-full"
                  style={{
                    zIndex: index,
                    y: useTransform(hwProgress, [rangeStart - 0.2, rangeStart], [400, 0], { clamp: true }),
                    scale: useTransform(hwProgress, [rangeEnd, rangeEnd + 0.25], [1, 0.96 - (index * 0.02)], { clamp: true }),
                    opacity: useTransform(hwProgress, [rangeStart - 0.1, rangeStart, rangeEnd, rangeEnd + 0.25], [0, 1, 1, 0.4], { clamp: true }),
                    willChange: "transform, opacity"
                  }}
                >
                  <Card className={`relative overflow-hidden border-2 ${step.color} bg-zinc-950/90 shadow-2xl`}>
                    <Spotlight className="opacity-10" />
                    <CardContent className="p-8 sm:p-12">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                        {/* Step Icon */}
                        <div className={`w-20 h-20 rounded-3xl shrink-0 flex items-center justify-center ${step.iconBg}`}>
                          <step.icon className="w-10 h-10" />
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 text-center sm:text-left">
                          <div className="inline-flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Step 0{index + 1}</span>
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                            {step.title}
                          </h3>
                          <p className="text-lg text-white/50 leading-relaxed max-w-2xl" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
                            {step.desc}
                          </p>

                          <div className="mt-8 flex items-center justify-center sm:justify-start text-primary font-bold cursor-pointer group/btn w-fit">
                            Learn more
                            <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* Product Showcase Section - 3D Cards */}
      <motion.section
        ref={showcaseRef}
        className="relative py-24 md:py-32 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={showcaseInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:gap-24 items-center lg:grid-cols-2">
              {/* Content */}
              <motion.div
                className="space-y-8"
                initial={{ x: -50, opacity: 0 }}
                animate={showcaseInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div>
                  <Badge variant="outline" className="px-4 py-1.5 mb-6">
                    <TrendingUp className="w-4 h-4 mr-2 inline" />
                    Track Progress
                  </Badge>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    Track Every{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                      Gaming Moment
                    </span>
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
                    Log your gaming sessions, track completion rates, and see your progress over time.
                    Never lose track of your gaming journey again with detailed analytics and insights.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: CheckCircle, text: "Automatic session tracking with playtime logs", color: "text-green-500" },
                    { icon: TrendingUp, text: "Beautiful progress visualization & charts", color: "text-blue-500" },
                    { icon: Trophy, text: "Achievement milestones & rewards", color: "text-yellow-500" }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 group cursor-pointer"
                      initial={{ x: -20, opacity: 0 }}
                      animate={showcaseInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 10 }}
                    >
                      <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/20 group-hover:border-primary/50 transition-colors">
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <span className="text-lg">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <Button size="lg" className="group">
                  Explore Features
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>

              {/* 3D Card Preview */}
              <motion.div
                className="relative"
                initial={{ x: 50, opacity: 0, scale: 0.9 }}
                animate={showcaseInView ? { x: 0, opacity: 1, scale: 1 } : { x: 50, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="relative group">
                  {/* Main Card */}
                  <motion.div
                    className="relative bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-primary/20 shadow-2xl"
                    whileHover={{
                      rotateY: 5,
                      rotateX: 5,
                      scale: 1.02
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-primary/20">
                        <h3 className="text-2xl font-bold" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                          Gaming Dashboard
                        </h3>
                        <Badge variant="outline" className="px-3 py-1">
                          Live
                        </Badge>
                      </div>

                      {/* Game Cards */}
                      <div className="space-y-4">
                        {[
                          {
                            game: "Cyberpunk 2077",
                            time: "45h played",
                            progress: 75,
                            icon: Gamepad2,
                            color: "from-cyan-500 to-blue-500"
                          },
                          {
                            game: "Elden Ring",
                            time: "Completed",
                            progress: 100,
                            icon: Trophy,
                            color: "from-yellow-500 to-orange-500"
                          },
                          {
                            game: "Hades",
                            time: "★★★★★",
                            progress: 60,
                            icon: Star,
                            color: "from-purple-500 to-pink-500"
                          }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="group/item relative flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-primary/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                            initial={{ x: 20, opacity: 0 }}
                            animate={showcaseInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
                            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.03, x: 5 }}
                          >
                            {/* Progress Bar Background */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover/item:opacity-10 transition-opacity`}
                              style={{ width: `${item.progress}%` }}
                            />

                            <div className="relative z-10 flex items-center gap-4 flex-1">
                              <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color}`}>
                                <item.icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{item.game}</p>
                                <p className="text-sm text-muted-foreground">{item.time}</p>
                              </div>
                            </div>

                            <div className="relative z-10">
                              <div className={`text-lg font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                {item.progress}%
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/20">
                        {[
                          { label: "Games", value: "42" },
                          { label: "Hours", value: "328" },
                          { label: "Achievements", value: "156" }
                        ].map((stat, index) => (
                          <div key={index} className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                              {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl"
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <Separator />



      <Separator />

      {/* Social Features Section - Animated Feed */}
      <motion.section
        ref={socialRef}
        className="relative py-24 md:py-32 overflow-hidden bg-muted/30"
        initial={{ opacity: 0 }}
        animate={socialInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 50px, hsl(var(--primary)) 50px, hsl(var(--primary)) 51px)`
        }} />

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:gap-24 items-center lg:grid-cols-2">
              {/* Animated Social Feed */}
              <motion.div
                className="relative order-2 lg:order-1"
                initial={{ x: -50, opacity: 0, scale: 0.9 }}
                animate={socialInView ? { x: 0, opacity: 1, scale: 1 } : { x: -50, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="relative bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-primary/20 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/20">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Users className="w-6 h-6 text-primary" />
                      Community Feed
                    </h3>
                    <Badge variant="outline">Live</Badge>
                  </div>

                  {/* Feed Items */}
                  <div className="space-y-4 max-h-[500px] overflow-hidden">
                    {[
                      {
                        user: "Alex",
                        avatar: "bg-blue-500",
                        icon: Users,
                        action: "shared a screenshot",
                        content: "Just beat the final boss! 🎉",
                        time: "2m ago",
                        color: "from-blue-500/20 to-cyan-500/20"
                      },
                      {
                        user: "Sarah",
                        avatar: "bg-green-500",
                        icon: Heart,
                        action: "posted a review",
                        content: "Amazing storyline! Highly recommend ⭐⭐⭐⭐⭐",
                        time: "15m ago",
                        color: "from-green-500/20 to-emerald-500/20"
                      },
                      {
                        user: "Mike",
                        avatar: "bg-purple-500",
                        icon: Trophy,
                        action: "unlocked achievement",
                        content: "Speedrun Master - Complete in under 2 hours",
                        time: "1h ago",
                        color: "from-purple-500/20 to-pink-500/20"
                      },
                      {
                        user: "Emma",
                        avatar: "bg-pink-500",
                        icon: Sparkles,
                        action: "started playing",
                        content: "The Legend of Zelda: Breath of the Wild",
                        time: "3h ago",
                        color: "from-pink-500/20 to-rose-500/20"
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="group relative"
                        initial={{ x: -20, opacity: 0 }}
                        animate={socialInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      >
                        <div className="relative flex items-start gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-primary/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                          {/* Gradient Background on Hover */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                          {/* Avatar */}
                          <div className="relative z-10">
                            <motion.div
                              className={`w-12 h-12 ${item.avatar} rounded-full flex items-center justify-center shadow-lg`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <item.icon className="w-6 h-6 text-white" />
                            </motion.div>
                          </div>

                          {/* Content */}
                          <div className="relative z-10 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm">
                                {item.user} <span className="text-muted-foreground font-normal">{item.action}</span>
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>

                            {/* Interaction Buttons */}
                            <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                                <Heart className="w-3 h-3" />
                                <span>Like</span>
                              </button>
                              <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                                <Users className="w-3 h-3" />
                                <span>Comment</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Scroll Indicator */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/90 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  />
                </div>

                {/* Floating Reaction Bubble */}
                <motion.div
                  className="absolute -top-4 -right-4 p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-xl"
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-5 h-5 text-white fill-white" />
                </motion.div>
              </motion.div>

              {/* Content */}
              <motion.div
                className="space-y-8 order-1 lg:order-2"
                initial={{ x: 50, opacity: 0 }}
                animate={socialInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div>
                  <Badge variant="outline" className="px-4 py-1.5 mb-6">
                    <Users className="w-4 h-4 mr-2 inline" />
                    Social Gaming
                  </Badge>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    Connect with{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                      Fellow Gamers
                    </span>
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
                    Share your gaming achievements, post reviews, and discover new games through
                    your gaming community. Build lasting friendships over shared gaming experiences.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Heart, text: "Share screenshots and gaming stories", color: "text-pink-500" },
                    { icon: Users, text: "Follow other gamers and build your network", color: "text-blue-500" },
                    { icon: TrendingUp, text: "Discover trending games in your community", color: "text-green-500" }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 group cursor-pointer"
                      initial={{ x: 20, opacity: 0 }}
                      animate={socialInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 10 }}
                    >
                      <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/20 group-hover:border-primary/50 transition-colors">
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <span className="text-lg">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <Button size="lg" className="group">
                  Join Community
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <Separator />

      {/* CTA Section - Professional Design */}
      <section className="relative py-20 md:py-32 overflow-hidden border-t">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

        <div className="container relative z-10 px-4 sm:px-6">
          <motion.div
            className="mx-auto max-w-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Main Content Card */}
            <div className="relative bg-card border rounded-2xl shadow-lg overflow-hidden">
              {/* Subtle Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />

              {/* Content */}
              <div className="p-8 md:p-12 lg:p-16">
                <div className="max-w-3xl mx-auto text-center">
                  {/* Text Content */}
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Badge variant="secondary" className="mb-4">
                        <Rocket className="w-3 h-3 mr-1.5" />
                        Get Started
                      </Badge>
                    </motion.div>

                    <motion.h2
                      className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                      style={{ fontFamily: 'Exo 2, sans-serif' }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      Ready to Transform Your Gaming Experience?
                    </motion.h2>

                    <motion.p
                      className="text-lg text-muted-foreground leading-relaxed"
                      style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      Join over 10,000 gamers who are already tracking their progress, sharing achievements, and connecting with a vibrant gaming community.
                    </motion.p>

                    {/* Trust Indicators */}
                    <motion.div
                      className="flex flex-wrap items-center justify-center gap-6 pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      {[
                        { icon: CheckCircle, text: "Free to start" },
                        { icon: CheckCircle, text: "No credit card" },
                        { icon: Shield, text: "Secure & private" },
                        { icon: Sparkles, text: "AI powered" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                      className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      {!user ? (
                        <>
                          <Button
                            size="lg"
                            onClick={() => navigate('/auth?mode=signup')}
                            className="group text-base px-8 py-6 shadow-md hover:shadow-xl transition-all"
                          >
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => window.open('https://youtu.be/iLHAoc0Rrzo?si=oYsvvwqUVv3N-avL', '_blank')}
                            className="text-base px-8 py-6"
                          >
                            <Play className="mr-2 h-5 w-5" />
                            Watch Demo
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="lg"
                          onClick={() => navigate('/homepage')}
                          className="group text-base px-8 py-6"
                        >
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Bottom Testimonial Bar */}
              <motion.div
                className="border-t bg-muted/30 px-8 py-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full border-2 border-background ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][i]
                            } flex items-center justify-center text-white text-xs font-semibold`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Trusted by gamers worldwide</p>
                      <p className="text-muted-foreground text-xs">Join the community today</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                    <span className="ml-2 text-sm font-medium">4.9/5 rating</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};