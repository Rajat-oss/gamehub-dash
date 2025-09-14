import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Target, Heart, Zap } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logofinal.png" alt="GameHub" className="h-32 w-32 object-contain" />
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              {!user && (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth?mode=login')} size="sm">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth?mode=signup')} size="sm">
                    Get Started
                  </Button>
                </>
              )}
              {user && (
                <Button onClick={() => navigate('/homepage')} size="sm">
                  Homepage
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              About Pixel Pilgrim
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Connecting gamers worldwide through shared experiences and community
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Mission Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-6">
                  GameHub was created to bridge the gap between gaming and social connection. 
                  We believe that gaming is more than just entertainment—it's a way to build 
                  communities, share experiences, and create lasting memories.
                </p>
                <p className="text-muted-foreground">
                  Our platform empowers gamers to track their journey, discover new titles, 
                  and connect with like-minded players from around the world.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <Users className="h-8 w-8 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg">Community</CardTitle>
                    <p className="text-sm text-muted-foreground">Building connections</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <Target className="h-8 w-8 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg">Progress</CardTitle>
                    <p className="text-sm text-muted-foreground">Track your journey</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <Heart className="h-8 w-8 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg">Passion</CardTitle>
                    <p className="text-sm text-muted-foreground">Love for gaming</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <Zap className="h-8 w-8 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg">Innovation</CardTitle>
                    <p className="text-sm text-muted-foreground">Cutting-edge features</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Meet the Founders Section */}
      <section className="py-16 md:py-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Meet the Founders
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The visionaries behind Pixel Pilgrim's mission to revolutionize gaming communities
              </p>
            </div>
            <div className="grid gap-12 md:grid-cols-2 justify-center">
              <Card className="gaming-card-glow border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-6">
                  <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                    <img src="/vedant.jpg" alt="Vedant Vyas" className="w-full h-full object-cover" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Vedant Vyas</CardTitle>
                  <p className="text-lg font-semibold text-primary">Founder & CEO</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Fullstack developer and gamer extraordinaire. Passionate about building engaging platforms that bring gamers together and create lasting communities.
                  </p>
                </CardContent>
              </Card>
              <Card className="gaming-card-glow border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-6">
                  <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                    <img src="/rajat.png" alt="Rajat Jhade" className="w-full h-full object-cover" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Rajat Jhade</CardTitle>
                  <p className="text-lg font-semibold text-primary">Co-Founder</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Full-stack developer and gaming enthusiast. Focused on creating seamless user experiences and innovative features that enhance the gaming journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Values Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-8">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold mb-2">Inclusivity</h3>
                <p className="text-muted-foreground">
                  Gaming is for everyone. We create a welcoming space for all gamers.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Privacy</h3>
                <p className="text-muted-foreground">
                  Your data is yours. We prioritize user privacy and security.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Quality</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in every feature and interaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} GameHub. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};