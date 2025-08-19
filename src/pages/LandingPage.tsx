import React from 'react';
import { Button } from '@/components/ui/button';
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

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Zap,
      title: "Vast Game Library",
      description: "Access thousands of games from indie gems to AAA blockbusters",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: "Gaming Community",
      description: "Connect with fellow gamers and share your gaming experiences",
      color: "text-green-500"
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Track your progress and unlock achievements across all games",
      color: "text-yellow-500"
    },
    {
      icon: Download,
      title: "Lightning Fast",
      description: "Optimized performance for seamless gaming experience",
      color: "text-purple-500"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data and gaming progress are always protected",
      color: "text-red-500"
    },
    {
      icon: Sparkles,
      title: "Premium Features",
      description: "Unlock exclusive content and advanced gaming tools",
      color: "text-pink-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Gamers", icon: Users },
    { number: "500+", label: "Games Available", icon: Gamepad2 },
    { number: "98%", label: "Satisfaction Rate", icon: Heart },
    { number: "24/7", label: "Support Available", icon: Shield }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Pro Gamer",
      content: "GameHub has completely transformed my gaming experience. The vast library and seamless interface make discovering new games a joy.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      content: "As a gaming content creator, I love how GameHub helps me find trending games and connect with the gaming community effortlessly.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Mike Rodriguez",
      role: "Casual Gamer",
      content: "The recommendation system is spot-on! I've discovered so many hidden gems that I wouldn't have found otherwise.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
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
      { name: "About Us", href: "#about" },
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
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "GDPR", href: "#gdpr" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              {/* Navigation items can go here */}
            </div>
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
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
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size="sm"
                >
                  Dashboard
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

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
        
        <div className="container relative z-10">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
            <Badge variant="outline" className="animate-fade-in-up cyber-glow">
              🎮 Welcome to the Future of Gaming
            </Badge>
            <h1 className="animate-fade-in-up text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]" style={{animationDelay: '0.1s'}}>
              Your Ultimate{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift neon-text">
                Gaming Hub
              </span>
            </h1>
            <p className="animate-fade-in-up max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl" style={{animationDelay: '0.2s'}}>
              Discover, request, and enjoy thousands of games in one place. 
              Join our community of passionate gamers and elevate your gaming experience.
            </p>
            <div className="animate-fade-in-up flex w-full items-center justify-center space-x-4 py-4 md:pb-10" style={{animationDelay: '0.3s'}}>
              {!user ? (
                <>
                  <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="gaming-button group animate-glow-pulse">
                    Start Gaming Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button size="lg" variant="outline" className="group cyber-glow">
                    <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 animate-gaming-bounce" />
                    Watch Demo
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={() => navigate('/dashboard')} className="gaming-button group animate-glow-pulse">
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
      <section className="gaming-features-bg relative py-8 md:py-12 lg:py-24 overflow-hidden">
        {/* Background Gaming Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <Users className="absolute top-10 left-5 h-12 w-12 text-green-500/5 animate-float" />
          <Download className="absolute top-20 right-10 h-8 w-8 text-purple-500/5 animate-float-delayed" />
          <Globe className="absolute bottom-10 left-1/4 h-10 w-10 text-blue-500/5 animate-gaming-bounce" />
        </div>
        
        <div className="container relative z-10 space-y-6">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
              Why Choose GameHub?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Experience gaming like never before with our cutting-edge platform
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="gaming-card-glow group relative overflow-hidden transition-all hover:shadow-lg animate-fade-in-up cyber-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <feature.icon className={`h-8 w-8 ${feature.color} transition-transform group-hover:scale-110 animate-gaming-bounce`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />
      
      {/* Stats Section */}
      <section className="gaming-stats-bg relative py-8 md:py-12 lg:py-24 overflow-hidden">
        {/* Floating Numbers Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl font-bold text-primary/5 animate-float">10K</div>
          <div className="absolute top-20 right-20 text-4xl font-bold text-accent/5 animate-float-delayed">500+</div>
          <div className="absolute bottom-20 left-1/3 text-5xl font-bold text-primary/5 animate-gaming-bounce">98%</div>
          <div className="absolute bottom-10 right-10 text-3xl font-bold text-accent/5 animate-float">24/7</div>
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 lg:grid-cols-4 md:max-w-[64rem]">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="gaming-card-glow text-center animate-fade-in-up border-0 bg-background/50 backdrop-blur cyber-glow animate-glow-pulse"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary animate-gaming-bounce" />
                  <div className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary neon-text">
                    {stat.number}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="gaming-testimonials-bg relative py-8 md:py-12 lg:py-24 overflow-hidden">
        {/* Background Quote Marks */}
        <div className="absolute inset-0 pointer-events-none">
          <Quote className="absolute top-10 left-5 h-20 w-20 text-primary/3 animate-float" />
          <Quote className="absolute top-40 right-10 h-16 w-16 text-accent/3 animate-float-delayed" />
          <Star className="absolute bottom-20 left-1/4 h-12 w-12 text-primary/3 animate-gaming-bounce" />
          <Heart className="absolute bottom-10 right-1/3 h-14 w-14 text-accent/3 animate-float" />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              What Our Gamers Say
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of satisfied gamers who have transformed their gaming experience
            </p>
          </div>
          <div className="mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:max-w-[80rem]">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="gaming-card-glow group relative overflow-hidden transition-all hover:shadow-xl animate-fade-in-up cyber-glow"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="pb-4">
                  <Quote className="h-8 w-8 text-primary mb-2 animate-gaming-bounce" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover animate-glow-pulse"
                    />
                    <div className="text-left">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />
      
      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
            Ready to Level Up Your Gaming?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join thousands of gamers who have already discovered their new favorite games
          </p>
          <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
            {!user && (
              <Button size="lg" onClick={() => navigate('/auth?mode=signup')}>
                <img src="/logofinal.png" alt="" className="mr-2 h-4 w-4 object-contain" />
                Join GameHub Today
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Logo and Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3">
                <img src="/logofinal.png" alt="GameHub" className="h-10 w-10 object-contain" />
                <span className="text-xl font-bold">GameHub</span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                The ultimate gaming platform connecting players to their next favorite game experience through advanced discovery and community tools.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="rounded-full bg-background p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="#" className="rounded-full bg-background p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a href="#" className="rounded-full bg-background p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex space-x-6 md:order-2">
                {footerLinks.legal.map((link, index) => (
                  <a 
                    key={index}
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground md:mt-0 md:order-1">
                &copy; {new Date().getFullYear()} GameHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};