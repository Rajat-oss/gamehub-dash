import React, { useRef, useState, useEffect } from 'react';
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
  Github, Twitter, Linkedin, Mail, MapPin, Phone, TrendingUp, Headphones
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';

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
  const [navbarY, setNavbarY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const navbarHeight = 56;
      
      if (scrolled > navbarHeight) {
        setNavbarY(-scrolled + navbarHeight);
      } else {
        setNavbarY(0);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const showcaseRef = useRef(null);
  const socialRef = useRef(null);
  
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: '-100px' });
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

  const stats = [
    { number: "10K+", label: "Gaming Sessions Logged", icon: Trophy },
    { number: "500+", label: "Games in Database", icon: Gamepad2 },
    { number: "5K+", label: "Gaming Stories Shared", icon: Heart },
    { number: "24/7", label: "AI Assistant Available", icon: Sparkles }
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
        className="w-full border-b bg-background"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: navbarY, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="container flex h-14 items-center">
          <div className="mr-4 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/logofinal.png" 
              alt="GameHub" 
              className="h-32 w-32 object-contain" 
            />
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <nav className="hidden md:flex items-center space-x-6">
                <ThemeToggle />
                <button onClick={() => navigate('/pricing')} className="text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </button>
              </nav>
              {/* Mobile menu */}
              <div className="md:hidden flex items-center space-x-2">
                <ThemeToggle />
                <button onClick={() => navigate('/pricing')} className="text-xs font-medium hover:text-primary transition-colors px-2 py-1">
                  Pricing
                </button>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              {!user && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/auth?mode=login')}
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth?mode=signup')}
                    size="sm"
                  >
                    Get Started
                  </Button>
                </>
              )}
              {user && (
                <>
                  <Button 
                    onClick={() => navigate('/homepage')}
                    size="sm"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        await logout();
                        navigate('/');
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }}
                    size="sm"
                  >
                    Logout
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <AnimatedDotsBackground />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        {/* Floating Gaming Icons */}
        <motion.div
          className="absolute top-32 left-[10%] opacity-10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Gamepad2 className="h-16 w-16 text-primary" />
        </motion.div>
        <motion.div
          className="absolute top-48 right-[15%] opacity-10"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Trophy className="h-20 w-20 text-yellow-500" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-[20%] opacity-10"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-14 w-14 text-purple-500" />
        </motion.div>
        
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-8 py-12 md:py-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="px-6 py-2 text-sm font-medium border-primary/50 bg-background/50 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Welcome to the Future of Gaming
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: 'Exo 2, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block mb-2">Your Ultimate</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                  Pixel Pilgrim
                </span>
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 blur-2xl -z-10"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="max-w-[800px] text-center text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed"
              style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Track your gaming journey, share epic moments, and connect with fellow gamers. 
              The ultimate platform combining game logging with social gaming experiences.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {!user ? (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth?mode=signup')} 
                    className="group relative overflow-hidden w-full sm:w-auto text-base px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Start Gaming Now
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary"
                      initial={{ x: '100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="group w-full sm:w-auto text-base px-8 py-6 border-2 hover:bg-accent/10 backdrop-blur-sm"
                    onClick={() => window.open('https://youtu.be/iLHAoc0Rrzo?si=oYsvvwqUVv3N-avL', '_blank')}
                  >
                    <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Watch Demo
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/homepage')} 
                  className="group w-full sm:w-auto text-base px-8 py-6"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </motion.div>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 w-full max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { number: "10K+", label: "Active Gamers", icon: Users },
                { number: "500+", label: "Games Tracked", icon: Gamepad2 },
                { number: "50K+", label: "Sessions Logged", icon: Trophy },
                { number: "24/7", label: "AI Support", icon: Sparkles }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Separator />
      
      {/* Features Section - Bento Grid Style */}
      <motion.section 
        ref={featuresRef}
        className="relative py-24 md:py-32 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container relative z-10 space-y-16 px-4 sm:px-6">
          {/* Section Header */}
          <motion.div 
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-1.5">
              <Zap className="w-4 h-4 mr-2 inline" />
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight" style={{fontFamily: 'Exo 2, sans-serif'}}>
              Why Choose{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Pixel Pilgrim
              </span>
              ?
            </h2>
            <p className="max-w-[700px] text-lg sm:text-xl text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
              Experience gaming like never before with our cutting-edge platform
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const isLarge = index === 0 || index === 5;
              return (
                <motion.div
                  key={index}
                  className={`group relative ${isLarge ? 'lg:col-span-2' : ''}`}
                  initial={{ y: 50, opacity: 0, scale: 0.95 }}
                  animate={featuresInView ? { y: 0, opacity: 1, scale: 1 } : { y: 50, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className={`relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-500 h-full backdrop-blur-sm bg-background/50 ${feature.gradient}`}>
                    {/* Spotlight Effect */}
                    <Spotlight />
                    
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.color} blur-xl`} />
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div
                          className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} backdrop-blur-sm`}
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                        </motion.div>
                        <motion.div
                          className={`text-6xl font-bold ${feature.iconColor} opacity-5`}
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1.2, opacity: 0.1 }}
                        >
                          {index + 1}
                        </motion.div>
                      </div>
                      <CardTitle className="text-2xl mb-3" style={{fontFamily: 'Exo 2, sans-serif'}}>
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
                        {feature.description}
                      </p>
                      <motion.div
                        className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </motion.div>
                    </CardContent>
                    
                    {/* Animated Border */}
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${feature.iconColor.replace('text-', '')}, transparent)`,
                        opacity: 0
                      }}
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section - Timeline Style */}
      <motion.section 
        ref={howItWorksRef}
        className="relative py-24 md:py-32 overflow-hidden bg-muted/30"
        initial={{ opacity: 0 }}
        animate={howItWorksInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="container relative z-10 px-4 sm:px-6">
          <motion.div 
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            animate={howItWorksInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-1.5">
              <Rocket className="w-4 h-4 mr-2 inline" />
              Getting Started
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight" style={{fontFamily: 'Exo 2, sans-serif'}}>
              How It{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="max-w-[700px] text-lg sm:text-xl text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
              Get started in three simple steps and unlock your gaming potential
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="mx-auto max-w-5xl">
            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-purple-500/50 to-primary/50" />
              
              {[
                { 
                  icon: Users, 
                  title: "Create Your Profile", 
                  desc: "Sign up in seconds and customize your gaming identity with your favorite games and preferences",
                  color: "from-blue-500 to-cyan-500",
                  iconBg: "bg-blue-500"
                },
                { 
                  icon: Gamepad2, 
                  title: "Track Your Games", 
                  desc: "Start logging your gaming sessions, build your library, and track your progress across all platforms",
                  color: "from-purple-500 to-pink-500",
                  iconBg: "bg-purple-500"
                },
                { 
                  icon: Heart, 
                  title: "Connect & Share", 
                  desc: "Join the community, share your gaming moments, and discover new friends who love the same games",
                  color: "from-pink-500 to-rose-500",
                  iconBg: "bg-pink-500"
                }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className={`relative flex items-center mb-16 last:mb-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  initial={{ y: 50, opacity: 0, scale: 0.9 }}
                  animate={howItWorksInView ? { y: 0, opacity: 1, scale: 1 } : { y: 50, opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                >
                  {/* Step Number Badge (Mobile & Desktop Center) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      className={`w-16 h-16 rounded-full ${step.iconBg} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {index + 1}
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  <motion.div 
                    className={`w-full md:w-[calc(50%-3rem)] ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-500 backdrop-blur-sm bg-background/80">
                      <Spotlight />
                      
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${step.color}`} />
                      
                      <CardContent className="relative z-10 p-8">
                        <div className="md:hidden mb-4">
                          <motion.div
                            className={`inline-flex w-14 h-14 rounded-full ${step.iconBg} items-center justify-center text-white font-bold text-xl shadow-lg`}
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            {index + 1}
                          </motion.div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <motion.div
                            className={`p-4 rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10`}
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <step.icon className="w-8 h-8 text-white" />
                          </motion.div>
                          
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-3" style={{fontFamily: 'Exo 2, sans-serif'}}>
                              {step.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

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
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6" style={{fontFamily: 'Exo 2, sans-serif'}}>
                    Track Every{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                      Gaming Moment
                    </span>
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
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
                        <h3 className="text-2xl font-bold" style={{fontFamily: 'Exo 2, sans-serif'}}>
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
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6" style={{fontFamily: 'Exo 2, sans-serif'}}>
                    Connect with{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                      Fellow Gamers
                    </span>
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
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
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left Side - Text Content */}
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
                      className="grid sm:grid-cols-2 gap-4 pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      {[
                        { icon: CheckCircle, text: "Free to start" },
                        { icon: CheckCircle, text: "No credit card" },
                        { icon: Shield, text: "Secure & private" },
                        { icon: Users, text: "10K+ members" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 pt-4"
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

                  {/* Right Side - Stats/Features */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { 
                          icon: Gamepad2, 
                          value: "500+", 
                          label: "Games Tracked",
                          color: "from-blue-500/10 to-cyan-500/10",
                          iconColor: "text-blue-500"
                        },
                        { 
                          icon: Trophy, 
                          value: "50K+", 
                          label: "Sessions Logged",
                          color: "from-yellow-500/10 to-orange-500/10",
                          iconColor: "text-yellow-500"
                        },
                        { 
                          icon: Users, 
                          value: "10K+", 
                          label: "Active Users",
                          color: "from-green-500/10 to-emerald-500/10",
                          iconColor: "text-green-500"
                        },
                        { 
                          icon: Star, 
                          value: "4.9/5", 
                          label: "User Rating",
                          color: "from-purple-500/10 to-pink-500/10",
                          iconColor: "text-purple-500"
                        }
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          className={`relative p-6 rounded-xl border bg-gradient-to-br ${stat.color} hover:shadow-md transition-all group cursor-default`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ y: -4 }}
                        >
                          <div className="space-y-2">
                            <stat.icon className={`w-8 h-8 ${stat.iconColor} transition-transform group-hover:scale-110`} />
                            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color.replace('/10', '')} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stat.label}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
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
                          className={`w-10 h-10 rounded-full border-2 border-background ${
                            ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][i]
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