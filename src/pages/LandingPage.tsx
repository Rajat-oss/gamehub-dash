import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Trophy, Download, Star, ArrowRight, Play, Zap, Shield, Sparkles,
  Gamepad2, Rocket, Globe, Heart, CheckCircle, Quote, ExternalLink,
  Github, Twitter, Linkedin, Mail, MapPin, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const [navbarY, setNavbarY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const navbarHeight = 56; // h-14 = 56px
      
      if (scrolled > navbarHeight) {
        setNavbarY(-scrolled + navbarHeight);
      } else {
        setNavbarY(0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      description: "Log your gaming sessions, track completion rates, and monitor your gaming journey",
      color: "text-yellow-500"
    },
    {
      icon: Users,
      title: "Gaming Social Network",
      description: "Share screenshots, stories, and connect with gamers who share your interests",
      color: "text-green-500"
    },
    {
      icon: Gamepad2,
      title: "Personal Game Library",
      description: "Organize your games, create wishlists, and discover new titles to play",
      color: "text-blue-500"
    },
    {
      icon: Heart,
      title: "Gaming Stories & Posts",
      description: "Share your gaming moments, achievements, and experiences with the community",
      color: "text-pink-500"
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Rate games you've played and read authentic reviews from fellow gamers",
      color: "text-purple-500"
    },
    {
      icon: Sparkles,
      title: "AI Gaming Assistant",
      description: "Get personalized game recommendations and gaming tips from our AI assistant",
      color: "text-red-500"
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
      <section className="gaming-hero-bg gaming-grid-bg relative overflow-hidden">
        {/* Particle System */}
        <div className="particle-system">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Gaming Icons Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Gamepad2 className="absolute top-20 left-10 h-8 w-8 text-primary/10 animate-float" />
          <Trophy className="absolute top-40 right-16 h-6 w-6 text-accent/10 animate-float-delayed" />
          <Zap className="absolute top-32 right-32 h-10 w-10 text-primary/5 animate-gaming-bounce" />
          <Shield className="absolute bottom-40 left-20 h-7 w-7 text-accent/10 animate-float" />
          <Sparkles className="absolute bottom-32 right-24 h-9 w-9 text-primary/8 animate-float-delayed" />
        </div>
        
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 sm:gap-2 py-12 sm:py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
            <Badge variant="outline" className="animate-fade-in-up cyber-glow text-xs sm:text-sm">
              🎮 Welcome to the Future of Gaming
            </Badge>
            <h1 className="animate-fade-in-up text-center text-2xl sm:text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] px-2" style={{animationDelay: '0.1s', fontFamily: 'Exo 2, sans-serif'}}>
              Your Ultimate{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift neon-text block sm:inline">
                Pixel Pilgrim
              </span>
            </h1>
            <p className="animate-fade-in-up max-w-[750px] text-center text-base sm:text-lg text-muted-foreground sm:text-xl px-4 sm:px-0 leading-relaxed" style={{animationDelay: '0.2s', fontFamily: 'Source Sans Pro, sans-serif'}}>
              Track your gaming journey, share epic moments, and connect with fellow gamers. 
              The ultimate platform combining game logging with social gaming experiences.
            </p>
            <div className="animate-fade-in-up flex w-full items-center justify-center flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 py-6 sm:py-4 md:pb-10 px-4 sm:px-0" style={{animationDelay: '0.3s'}}>
              {!user ? (
                <>
                  <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="gaming-button group animate-glow-pulse w-full sm:w-auto">
                    Start Gaming Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button size="lg" variant="outline" className="group cyber-glow w-full sm:w-auto">
                    <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 animate-gaming-bounce" />
                    Watch Demo
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={() => navigate('/homepage')} className="gaming-button group animate-glow-pulse w-full sm:w-auto">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Separator />
      
      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        className="gaming-features-bg relative py-8 md:py-12 lg:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Gaming Icons */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{ y }}
        >
          <Users className="absolute top-10 left-5 h-12 w-12 text-green-500/5 animate-float" />
          <Download className="absolute top-20 right-10 h-8 w-8 text-purple-500/5 animate-float-delayed" />
          <Globe className="absolute bottom-10 left-1/4 h-10 w-10 text-blue-500/5 animate-gaming-bounce" />
        </motion.div>
        
        <div className="container relative z-10 space-y-8 sm:space-y-6 px-4 sm:px-6">
          <motion.div 
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 sm:gap-2 text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-6xl px-2" style={{fontFamily: 'Exo 2, sans-serif'}}>
              Why Choose Pixel Pilgrim?
            </h2>
            <p className="max-w-[90%] sm:max-w-[85%] leading-relaxed text-muted-foreground text-base sm:text-lg sm:leading-7 px-2" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
              Experience gaming like never before with our cutting-edge platform
            </p>
          </motion.div>
          <div className="mx-auto grid justify-center gap-6 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={featuresInView ? { y: 0, opacity: 1, scale: 1 } : { y: 50, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="gaming-card-glow group relative overflow-hidden transition-all hover:shadow-lg cyber-glow h-full">
                  <CardHeader>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.color} transition-transform`} />
                    </motion.div>
                    <CardTitle className="text-xl" style={{fontFamily: 'Exo 2, sans-serif'}}>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        ref={howItWorksRef}
        className="relative py-8 md:py-12 lg:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={howItWorksInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container relative z-10 px-4 sm:px-6">
          <motion.div 
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 sm:gap-2 text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            animate={howItWorksInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-5xl px-2" style={{fontFamily: 'Exo 2, sans-serif'}}>
              How Pixel Pilgrim Works
            </h2>
            <p className="max-w-[90%] sm:max-w-[85%] leading-relaxed text-muted-foreground text-base sm:text-lg px-2" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
              Get started in three simple steps
            </p>
          </motion.div>
          <div className="mx-auto grid gap-8 sm:gap-12 grid-cols-1 md:grid-cols-3 max-w-5xl">
            {[
              { icon: Users, title: "1. Create Account", desc: "Sign up and set up your gaming profile in minutes" },
              { icon: Gamepad2, title: "2. Log Your Games", desc: "Track your gaming sessions and build your library" },
              { icon: Heart, title: "3. Share & Connect", desc: "Share your gaming moments and connect with others" }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={howItWorksInView ? { y: 0, opacity: 1, scale: 1 } : { y: 50, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <step.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Exo 2, sans-serif'}}>{step.title}</h3>
                <p className="text-muted-foreground" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Separator />

      {/* Product Showcase Section */}
      <motion.section 
        ref={showcaseRef}
        className="relative py-8 md:py-12 lg:py-24 overflow-hidden bg-muted/20"
        initial={{ opacity: 0 }}
        animate={showcaseInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:gap-20 items-center lg:grid-cols-2">
              <motion.div 
                className="space-y-6"
                initial={{ x: -50, opacity: 0 }}
                animate={showcaseInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight md:text-4xl" style={{fontFamily: 'Exo 2, sans-serif'}}>
                  Track Every Gaming Moment
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
                  Log your gaming sessions, track completion rates, and see your progress over time. 
                  Never lose track of your gaming journey again.
                </p>
                <div className="space-y-4">
                  {[
                    "Automatic session tracking",
                    "Progress visualization", 
                    "Achievement milestones"
                  ].map((feature, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ x: -20, opacity: 0 }}
                      animate={showcaseInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 10 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                className="relative"
                initial={{ x: 50, opacity: 0, scale: 0.9 }}
                animate={showcaseInView ? { x: 0, opacity: 1, scale: 1 } : { x: 50, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Gamepad2 className="w-6 h-6 text-primary" />
                        <span className="font-medium">Cyberpunk 2077</span>
                      </div>
                      <span className="text-sm text-muted-foreground">45h played</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span className="font-medium">Elden Ring</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Completed</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-purple-500" />
                        <span className="font-medium">Hades</span>
                      </div>
                      <span className="text-sm text-muted-foreground">★★★★★</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <Separator />

     

      <Separator />

      {/* Social Features Section */}
      <motion.section 
        ref={socialRef}
        className="relative py-8 md:py-12 lg:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={socialInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:gap-20 items-center lg:grid-cols-2">
              <motion.div 
                className="relative order-2 lg:order-1"
                initial={{ x: -50, opacity: 0, scale: 0.9 }}
                animate={socialInView ? { x: 0, opacity: 1, scale: 1 } : { x: -50, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl p-8 backdrop-blur-sm border border-green-500/20">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Alex shared a screenshot</p>
                        <p className="text-sm text-muted-foreground">Just beat the final boss! 🎉</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Sarah posted a review</p>
                        <p className="text-sm text-muted-foreground">Amazing storyline! Highly recommend ⭐⭐⭐⭐⭐</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Mike unlocked achievement</p>
                        <p className="text-sm text-muted-foreground">Speedrun Master - Complete in under 2 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="space-y-6 order-1 lg:order-2"
                initial={{ x: 50, opacity: 0 }}
                animate={socialInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight md:text-4xl" style={{fontFamily: 'Exo 2, sans-serif'}}>
                  Connect with Fellow Gamers
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
                  Share your gaming achievements, post reviews, and discover new games through 
                  your gaming community. Build lasting friendships over shared gaming experiences.
                </p>
                <div className="space-y-4">
                  {[
                    "Share screenshots and stories",
                    "Follow other gamers",
                    "Discover trending games"
                  ].map((feature, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ x: 20, opacity: 0 }}
                      animate={socialInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 10 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <Separator />
      
      {/* CTA Section */}
      <section className="container py-12 sm:py-8 md:py-12 lg:py-24 px-4 sm:px-6">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 sm:gap-2 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-6xl px-2" style={{fontFamily: 'Exo 2, sans-serif'}}>
            Ready to Level Up Your Gaming?
          </h2>
          <p className="max-w-[90%] sm:max-w-[85%] leading-relaxed text-muted-foreground text-base sm:text-lg sm:leading-7 px-2" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
            Join thousands of gamers who have already discovered their new favorite games
          </p>
          <div className="flex w-full items-center justify-center py-6 sm:py-4 md:pb-10 px-4 sm:px-0">
            {!user && (
              <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="w-full sm:w-auto">
                <img src="/logofinal.png" alt="" className="mr-2 h-4 w-4 object-contain" />
                Join Pixel Pilgrim Today
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};