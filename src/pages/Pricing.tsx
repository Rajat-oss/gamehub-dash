import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { paymentService } from '@/services/paymentService';
import { subscriptionService, UserSubscription } from '@/services/subscriptionService';
import { 
  Check, X, Star, Zap, Crown, Gamepad2, Users, Trophy, 
  Shield, Sparkles, Heart, Camera, MessageSquare, BarChart3,
  Cloud, Headphones, Gift, ArrowRight, Unlock
} from 'lucide-react';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    if (user) {
      loadUserSubscription();
    }
  }, [user]);

  const loadUserSubscription = async () => {
    if (user) {
      const subscription = await subscriptionService.getUserSubscription(user.uid);
      setUserSubscription(subscription);
    }
  };

  const handlePayment = async (planType: 'pro' | 'elite', amount: number, planName: string) => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }

    setIsLoading(true);
    try {
      const paymentResponse = await paymentService.createPayment(
        {
          amount,
          currency: 'INR',
          planName,
          planType,
        },
        user.email || '',
        user.displayName || 'User'
      );

      // Create subscription after successful payment
      await subscriptionService.createSubscription(user.uid, planType, paymentResponse.razorpay_payment_id);
      
      toast({
        title: 'Payment Successful!',
        description: `Welcome to ${planName}! Your subscription is now active.`,
      });

      // Reload subscription data
      await loadUserSubscription();
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!userSubscription || userSubscription.status !== 'active') {
      return 'free';
    }
    return userSubscription.plan;
  };

  const isFeatureUnlocked = (feature: string) => {
    return subscriptionService.hasFeatureAccess(userSubscription, feature);
  };

  const pricingPlans = [
    {
      name: "Free Gamer",
      price: "$0",
      period: "forever",
      description: "Perfect for casual gamers starting their journey",
      icon: Gamepad2,
      color: "text-gray-500",
      bgColor: "bg-gray-50 dark:bg-gray-900",
      borderColor: "border-gray-200 dark:border-gray-700",
      features: [
        { name: "Track up to 10 games", included: true },
        { name: "Basic game logging", included: true },
        { name: "Public profile", included: true },
        { name: "Community access", included: true },
        { name: "Mobile app access", included: true },
        { name: "Advanced analytics", included: false, featureKey: "advanced_analytics" },
        { name: "Custom themes", included: false, featureKey: "custom_themes" },
        { name: "Priority support", included: false, featureKey: "priority_support" },
        { name: "AI recommendations", included: false, featureKey: "ai_recommendations" },
        { name: "Unlimited game library", included: false, featureKey: "unlimited_games" }
      ]
    },
    {
      name: "Pro Gamer",
      price: "$9.99",
      period: "per month",
      description: "For dedicated gamers who want more features",
      icon: Star,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-700",
      popular: true,
      features: [
        { name: "Unlimited game tracking", included: true, featureKey: "unlimited_games" },
        { name: "Advanced game analytics", included: true, featureKey: "advanced_analytics" },
        { name: "Custom profile themes", included: true, featureKey: "custom_themes" },
        { name: "Priority community features", included: true },
        { name: "Screenshot uploads (50/month)", included: true, featureKey: "screenshot_uploads" },
        { name: "Gaming session insights", included: true },
        { name: "Friend recommendations", included: true },
        { name: "Email support", included: true },
        { name: "AI game recommendations", included: true, featureKey: "ai_recommendations" },
        { name: "Export gaming data", included: true }
      ]
    },
    {
      name: "Elite Gamer",
      price: "$19.99",
      period: "per month",
      description: "Ultimate experience for gaming enthusiasts",
      icon: Crown,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      borderColor: "border-purple-200 dark:border-purple-700",
      features: [
        { name: "Everything in Pro Gamer", included: true },
        { name: "Unlimited screenshot uploads", included: true, featureKey: "unlimited_screenshots" },
        { name: "Advanced AI gaming assistant", included: true, featureKey: "advanced_ai" },
        { name: "Custom gaming challenges", included: true, featureKey: "custom_challenges" },
        { name: "Priority customer support", included: true, featureKey: "priority_support" },
        { name: "Beta feature access", included: true, featureKey: "beta_access" },
        { name: "Gaming performance coaching", included: true },
        { name: "Exclusive community events", included: true },
        { name: "Personal gaming statistics", included: true },
        { name: "API access for developers", included: true }
      ]
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into your gaming habits, progress tracking, and performance metrics."
    },
    {
      icon: Users,
      title: "Social Gaming",
      description: "Connect with fellow gamers, share achievements, and build your gaming community."
    },
    {
      icon: Sparkles,
      title: "AI Recommendations",
      description: "Get personalized game suggestions based on your preferences and playing history."
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      description: "Access your gaming data across all devices with automatic cloud synchronization."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your gaming data is secure and private. We never share your information."
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Get help whenever you need it with our dedicated gaming support team."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logofinal.png" alt="Pixel Pilgrim" className="h-32 w-32 object-contain" />
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
              Choose Your Gaming Plan
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Unlock the full potential of your gaming journey with our flexible pricing options
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.bgColor} ${plan.borderColor} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-6">
                  <plan.icon className={`w-12 h-12 ${plan.color} mx-auto mb-4`} />
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => {
                      const isUnlocked = feature.featureKey ? isFeatureUnlocked(feature.featureKey) : feature.included;
                      return (
                        <li key={featureIndex} className="flex items-center gap-3">
                          {feature.included ? (
                            isUnlocked ? (
                              <Unlock className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )
                          ) : (
                            <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={`${feature.included ? '' : 'text-muted-foreground'} ${isUnlocked ? 'font-medium text-green-600' : ''}`}>
                            {feature.name} {isUnlocked && '(Unlocked)'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isLoading || getCurrentPlan() === plan.name.toLowerCase().replace(' gamer', '')}
                    onClick={() => {
                      if (plan.price === "$0") {
                        navigate('/auth?mode=signup');
                      } else {
                        const planType = plan.name.toLowerCase().includes('pro') ? 'pro' : 'elite';
                        const amount = parseFloat(plan.price.replace('$', '')) * 80; // Convert to INR (approximate)
                        handlePayment(planType, amount, plan.name);
                      }
                    }}
                  >
                    {getCurrentPlan() === plan.name.toLowerCase().replace(' gamer', '') ? (
                      'Current Plan'
                    ) : (
                      plan.price === "$0" ? "Get Started Free" : isLoading ? "Processing..." : "Choose Plan"
                    )}
                    {getCurrentPlan() !== plan.name.toLowerCase().replace(' gamer', '') && (
                      <ArrowRight className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-2xl font-bold md:text-4xl">
              Why Choose Pixel Pilgrim?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover the features that make us the ultimate gaming platform
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
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

      {/* FAQ Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-12 md:text-4xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I change my plan anytime?</h3>
                <p className="text-muted-foreground">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Is there a free trial for paid plans?</h3>
                <p className="text-muted-foreground">We offer a 14-day free trial for both Pro Gamer and Elite Gamer plans. No credit card required to start your trial.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and various regional payment methods. All payments are processed securely.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-muted-foreground">Absolutely! You can cancel your subscription at any time. You'll continue to have access to paid features until the end of your billing period.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-muted/20">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold md:text-4xl mb-4">
              Ready to Level Up Your Gaming?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of gamers who have already transformed their gaming experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth?mode=signup')}>
                Start Free Trial
                <Gift className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Pixel Pilgrim. All rights reserved.
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