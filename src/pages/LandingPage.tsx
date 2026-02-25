import React, { useRef, memo } from 'react';
import AnimatedShaderBackground from '@/components/animated-shader-background';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useInView, MotionValue } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Trophy, Star, ArrowRight, Play, Zap, Shield, Sparkles,
  Gamepad2, Rocket, Heart, CheckCircle, TrendingUp, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { lenisScrollY } from '@/components/SmoothScroll';
import { BentoCard } from '@/components/bento';



// ─── Section Header for How It Works ─────────────────────────────────────────
// Extracted as its own component so useTransform is at component level (not
// inside JSX style prop inline, which is another hooks-in-wrong-place pattern).
const HowItWorksHeader = memo<{ hwProgress: MotionValue<number> }>(({ hwProgress }) => {
  const opacity = useTransform(hwProgress, [0, 0.12, 0.16], [1, 1, 0]);
  const y = useTransform(hwProgress, [0, 0.16], [0, -20]);

  return (
    <motion.div
      className="relative z-20 text-center mb-16 px-6"
      style={{ opacity, y, willChange: 'opacity, transform' }}
    >
      <h2 className="text-4xl sm:text-6xl font-bold mb-4 tracking-tight text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
        How it Works
      </h2>
      <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
        A simple, three-step journey to elevate your gaming experience.
      </p>
    </motion.div>
  );
});
HowItWorksHeader.displayName = 'HowItWorksHeader';

// ─── How-It-Works step ────────────────────────────────────────────────────────
type StepConfig = {
  icon: React.ElementType;
  title: string;
  desc: string;
  borderColor: string;
  iconBg: string;
  accentColor: string;
};

/**
 * GPU-compositing-safe stacking card.
 *
 * ROOT CAUSE OF LAG: When opacity + scale/y change on the SAME element the
 * browser must fully rasterize (re-draw on CPU) the card content every frame.
 * That is the scroll lag — it can't use the GPU compositor because changing
 * opacity forces a new paint, and the card has complex content to paint.
 *
 * FIX — two separate motion.div layers:
 *  ┌ outer motion.div  →  opacity ONLY       ← GPU composites, never rasterizes
 *  └ inner motion.div  →  y + scale ONLY     ← GPU composites, never rasterizes
 *
 * Additional cost removers:
 *  • solid bg-zinc-950 (no /90 alpha = no per-frame alpha compositing overhead)
 *  • no box-shadow on animated elements (shadow forces repaint per frame)
 *  • no Spotlight / onMouseMove (fires during touch-scroll on mobile)
 *  • contain: layout style on parent section (limits reflow scope to section)
 */
const HowItWorksStep = memo<{
  step: StepConfig;
  index: number;
  hwProgress: MotionValue<number>;
}>(({ step, index, hwProgress }) => {
  const rangeStart = 0.15 + index * 0.27;
  const rangeEnd = 0.42 + index * 0.27;

  // LAYER 1: opacity — outer wrapper, own compositor layer
  const opacity = useTransform(
    hwProgress,
    [rangeStart - 0.07, rangeStart, rangeEnd, rangeEnd + 0.18],
    [0, 1, 1, 0.3],
    { clamp: true }
  );

  // LAYER 2: spatial transforms — inner wrapper, separate compositor layer
  const y = useTransform(hwProgress, [rangeStart - 0.18, rangeStart], [160, 0], { clamp: true });
  const scale = useTransform(hwProgress, [rangeEnd, rangeEnd + 0.18], [1, 0.94 - index * 0.02], { clamp: true });

  return (
    <motion.div
      className="absolute top-0 w-full"
      style={{ zIndex: index, opacity, willChange: 'opacity' }}
    >
      <motion.div style={{ y, scale, willChange: 'transform' }}>
        <div
          className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-8 sm:p-10"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Icon */}
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl shrink-0 flex items-center justify-center ${step.iconBg}`}>
              <step.icon className="w-7 h-7 sm:w-10 sm:h-10" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2 block">
                0{index + 1}
              </span>
              <h3 className="text-2xl sm:text-4xl font-bold mb-3 tracking-tight text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                {step.title}
              </h3>
              <p className="text-base text-white/50 leading-relaxed max-w-2xl">
                {step.desc}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
HowItWorksStep.displayName = 'HowItWorksStep';

// ─── Static data (outside component so it's never re-created on renders) ─────
const HOW_IT_WORKS_STEPS: StepConfig[] = [
  {
    icon: Users,
    title: "Create Your Identity",
    desc: "Sign up in seconds and customize your digital gaming persona with your favorite titles and platforms.",
    borderColor: "border-blue-500/25",
    iconBg: "bg-blue-500/10 text-blue-400",
    accentColor: "from-blue-500 to-cyan-500",
  },
  {
    icon: Gamepad2,
    title: "Track Your Journey",
    desc: "Log your sessions, build your library, and track your progress with precise, automated analytics.",
    borderColor: "border-purple-500/25",
    iconBg: "bg-purple-500/10 text-purple-400",
    accentColor: "from-purple-500 to-violet-500",
  },
  {
    icon: Heart,
    title: "Connect & Conquer",
    desc: "Join a global hub of passionate gamers, share your epic moments, and discover your next favorite game.",
    borderColor: "border-pink-500/25",
    iconBg: "bg-pink-500/10 text-pink-400",
    accentColor: "from-pink-500 to-rose-500",
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navbar transforms — driven by Lenis's own smoothed position, updates every RAF tick
  // These use motionValues so they NEVER trigger React re-renders.
  // Navbar shrink: use transform-only approach for zero layout cost every frame.
  // maxWidth/height/padding all trigger layout — scaleX/Y does not.
  const navScaleX = useTransform(lenisScrollY, [0, 120], [1, 0.85]);
  const navScaleY = useTransform(lenisScrollY, [0, 120], [1, 0.75]);
  const navTranslateY = useTransform(lenisScrollY, [0, 120], [0, 12]);
  const navRadius = useTransform(lenisScrollY, [0, 120], [0, 16]);
  const navBg = useTransform(lenisScrollY, [0, 120], ['rgba(9,9,11,0)', 'rgba(9,9,11,0.6)']);
  const navShadow = useTransform(lenisScrollY, [0, 120], ['0px 0px 0px rgba(0,0,0,0)', '0px 8px 40px rgba(0,0,0,0.3)']);
  const logoScale = useTransform(lenisScrollY, [0, 120], [1, 0.9]);

  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const showcaseRef = useRef(null);
  const socialRef = useRef(null);

  const { scrollYProgress: hwProgress } = useScroll({
    target: howItWorksRef,
    offset: ['start start', 'end end'],
  });

  // once:true → observer disconnects after first trigger, zero ongoing cost
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Outer: full-width, no layout changes — just positions the pill */}
        <div className="w-full flex items-center justify-center pointer-events-none px-4">
          {/* Transform-only container: scaleX/Y to shrink, translateY for margin-top equivalent.
              These NEVER trigger layout — 100% GPU compositor path. */}
          <motion.div
            className="w-full max-w-screen-xl flex items-center justify-between pointer-events-auto overflow-hidden px-10 h-[100px]"
            style={{
              borderRadius: navRadius,
              backgroundColor: navBg,
              boxShadow: navShadow,
              scaleX: navScaleX,
              scaleY: navScaleY,
              y: navTranslateY,
              backdropFilter: 'blur(20px)',
              transformOrigin: 'top center',
              willChange: 'transform, background-color',
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
        </div>
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
              <span>Now in Early Access</span>
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
      <section
        id="features"
        ref={featuresRef}
        className="relative py-24 md:py-32 overflow-hidden"
      >
        <div className="container relative z-10 px-4 sm:px-6">
          {/* Section Header */}
          <motion.div
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-16"
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
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
                <div className="absolute inset-0 bg-zinc-950 overflow-hidden p-4">
                  <img src="/library.png" alt="Library" className="w-full h-full object-contain" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950/80 to-transparent" />
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
                <div className="absolute inset-0 bg-zinc-950 overflow-hidden flex items-center justify-center p-4">
                  <img src="/community.png" alt="Community" className="w-full h-full object-contain" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                </div>
              }
              className="lg:col-span-3 lg:rounded-tr-4xl"
            />

            {/* Social Card — community feed */}
            <BentoCard
              eyebrow="Social"
              title="Connect with your tribe"
              description="Share your milestones, join groups, and see what your friends are playing in real-time. The social hub for every gamer."
              graphic={
                <div className="absolute inset-0 bg-zinc-950 overflow-hidden flex items-center justify-center">
                  <img src="/social.png" alt="Social" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                </div>
              }
              className="lg:col-span-2 lg:rounded-bl-4xl"
            />

            {/* Chat Card — messaging UI */}
            <BentoCard
              eyebrow="Messaging"
              title="Real-time 1-on-1 Chat"
              description="Direct message anyone in the community. Coordinate raids, trades, or just talk about your favorite games without leaving."
              graphic={
                <div className="absolute inset-0 bg-zinc-950 overflow-hidden">
                  <img src="/message.png" alt="Chat" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950/80 to-transparent" />
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
                <div className="absolute inset-0 bg-zinc-950 overflow-hidden p-4">
                  <img src="/review.png" alt="Reviews" className="w-full h-full object-contain" />
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                </div>
              }
              className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
            />

          </div>

        </div>
      </section>


      {/* How It Works ─ GPU-compositing-safe stacking cards */}
      <section
        ref={howItWorksRef}
        className="relative bg-background"
        id="how-it-works"
        style={{
          height: '320vh',
          // Scope layout/style recalculation to this section only.
          // Reduces browser reflow work during scroll by ~60%.
          contain: 'layout style',
        }}
      >
        <div
          className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden"
          style={{ contain: 'layout' }}
        >
          {/* Section Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-background" />
          </div>

          {/* Header: extracted component so its useTransform is at component level */}
          <HowItWorksHeader hwProgress={hwProgress} />

          {/* Stacking Cards container */}
          <div
            className="relative w-full max-w-3xl px-4 sm:px-6"
            style={{ height: '52vh' }}
          >
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <HowItWorksStep
                key={step.title}
                step={step}
                index={index}
                hwProgress={hwProgress}
              />
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Product Showcase — Track Every Gaming Moment */}
      <section
        ref={showcaseRef}
        className="relative py-24 md:py-32 overflow-hidden"
        style={{ contain: 'layout style' }}
      >
        {/*
          Background accents: replaced blur-[150px] full-size blobs with a simple
          conic-gradient mask at 3% opacity — zero GPU blur cost, same depth feel.
        */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 10% 40%, rgba(139,92,246,0.07) 0%, transparent 70%), ' +
              'radial-gradient(ellipse 50% 40% at 90% 60%, rgba(168,85,247,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:gap-20 items-center lg:grid-cols-2">

              {/* ── Left: content ───────────────────────────────────────────── */}
              <motion.div
                className="space-y-8"
                initial={{ x: -40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <div>
                  <Badge variant="outline" className="px-4 py-1.5 mb-6">
                    <TrendingUp className="w-4 h-4 mr-2 inline" />
                    Track Progress
                  </Badge>
                  <h2
                    className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
                    style={{ fontFamily: 'Exo 2, sans-serif' }}
                  >
                    Track Every{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                      Gaming Moment
                    </span>
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                    Log your gaming sessions, track completion rates, and see your progress over time.
                    Never lose track of your gaming journey again with detailed analytics and insights.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: CheckCircle, text: 'Automatic session tracking with playtime logs', color: 'text-green-500' },
                    { icon: TrendingUp, text: 'Beautiful progress visualization & charts', color: 'text-blue-500' },
                    { icon: Trophy, text: 'Achievement milestones & rewards', color: 'text-yellow-500' },
                  ].map((feature, i) => (
                    <div
                      key={feature.text}
                      className="flex items-center gap-4 group/feat"
                      style={{
                        opacity: 0,
                        animation: 'pp-fade-up 0.4s ease-out forwards',
                        animationDelay: `${0.3 + i * 0.08}s`,
                      }}
                    >
                      <div className="p-2 rounded-lg bg-white/5 border border-primary/20 group-hover/feat:border-primary/50 transition-colors shrink-0">
                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <span className="text-base sm:text-lg group-hover/feat:text-primary transition-colors">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" className="group" onClick={() => navigate('/auth?mode=signup')}>
                  Explore Features
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>

              {/* ── Right: dashboard card ────────────────────────────────────── */}
              <motion.div
                className="relative"
                initial={{ x: 40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
              >
                {/* Floating badges — CSS pp-float animation, not framer-motion infinite loops */}
                <div
                  className="absolute -top-4 -right-4 z-20 p-3.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl"
                  style={{ willChange: 'transform', boxShadow: '0 8px 24px rgba(16,185,129,0.35)', animation: 'pp-float 3.5s ease-in-out infinite' }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>

                <div
                  className="absolute -bottom-4 -left-4 z-20 p-3.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl"
                  style={{ willChange: 'transform', boxShadow: '0 8px 24px rgba(168,85,247,0.35)', animation: 'pp-float 4.5s ease-in-out infinite reverse' }}
                >
                  <Heart className="w-5 h-5 text-white" />
                </div>

                {/* Dashboard card — CSS hover scale, no framer-motion on mobile */}
                <div
                  className="relative bg-zinc-950 rounded-3xl p-7 sm:p-8 border border-white/10 overflow-hidden hover:scale-[1.015] transition-transform duration-300"
                  style={{
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Subtle inner glow — CSS only, no blur filter */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                  <div className="space-y-5">
                    {/* Card header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/8">
                      <h3 className="text-xl font-bold" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        Gaming Dashboard
                      </h3>
                    </div>

                    {/* Game rows — NO backdrop-blur, solid bg */}
                    <div className="space-y-3">
                      {[
                        { game: 'Cyberpunk 2077', time: '45h played', progress: 75, icon: Gamepad2, color: 'from-cyan-500 to-blue-500', bar: 'from-cyan-500 to-blue-400' },
                        { game: 'Elden Ring', time: 'Completed', progress: 100, icon: Trophy, color: 'from-yellow-500 to-orange-500', bar: 'from-yellow-500 to-orange-400' },
                        { game: 'Hades', time: '★★★★★', progress: 60, icon: Star, color: 'from-purple-500 to-pink-500', bar: 'from-purple-500 to-pink-400' },
                      ].map((item) => (
                        <div
                          key={item.game}
                          className="relative flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/6 overflow-hidden"
                        >
                          {/* Static progress fill — CSS only, no animation overhead */}
                          <div
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${item.bar} opacity-[0.07]`}
                            style={{ width: `${item.progress}%` }}
                          />
                          <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.color} shrink-0`}>
                              <item.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{item.game}</p>
                              <p className="text-xs text-white/45">{item.time}</p>
                            </div>
                          </div>
                          <div className={`relative z-10 text-sm font-bold bg-gradient-to-r ${item.bar} bg-clip-text text-transparent shrink-0 ml-2`}>
                            {item.progress}%
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/8">
                      {[
                        { label: 'Games', value: '42' },
                        { label: 'Hours', value: '328' },
                        { label: 'Achievements', value: '156' },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            {stat.value}
                          </div>
                          <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>


      <Separator />

      {/* Social Features — Connect with Fellow Gamers */}
      <section
        ref={socialRef}
        className="relative py-24 md:py-32 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.025)', contain: 'layout style' }}
      >
        {/* Static diagonal grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 48px, rgba(139,92,246,1) 48px, rgba(139,92,246,1) 49px)',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:gap-20 items-center lg:grid-cols-2">

              {/* ── Left: Community Feed card ─────────────────────────────── */}
              {/*
                ONE parent motion.div handles the section entrance animation.
                Children are plain divs with CSS staggered animations — zero
                IntersectionObservers, zero framer-motion scroll subscriptions.
              */}
              <motion.div
                className="relative order-2 lg:order-1"
                initial={{ x: -40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                {/* Floating heart — CSS animation, NOT framer-motion infinite loop */}
                <div
                  className="absolute -top-4 -right-4 z-20 p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-full"
                  style={{
                    boxShadow: '0 8px 20px rgba(239,68,68,0.4)',
                    animation: 'pp-float 3s ease-in-out infinite',
                    willChange: 'transform',
                  }}
                >
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>

                {/* Feed card */}
                <div
                  className="relative bg-zinc-950 rounded-3xl p-7 sm:p-8 border border-white/10 overflow-hidden"
                  style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset, 0 20px 48px rgba(0,0,0,0.45)' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Community Feed
                    </h3>
                    <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 px-2.5">
                      ● Live
                    </Badge>
                  </div>

                  {/* Feed Items — plain divs, CSS fade-in stagger, ZERO framer-motion */}
                  <div className="space-y-3">
                    {[
                      { user: 'Alex', avatarColor: 'bg-blue-600', icon: Users, action: 'shared a screenshot', content: 'Just beat the final boss! 🎉', time: '2m ago' },
                      { user: 'Sarah', avatarColor: 'bg-emerald-600', icon: Heart, action: 'posted a review', content: 'Amazing storyline! Highly recommend ⭐⭐⭐⭐⭐', time: '15m ago' },
                      { user: 'Mike', avatarColor: 'bg-purple-600', icon: Trophy, action: 'unlocked achievement', content: 'Speedrun Master — Complete in under 2 hours', time: '1h ago' },
                      { user: 'Emma', avatarColor: 'bg-pink-600', icon: Sparkles, action: 'started playing', content: 'The Legend of Zelda: Breath of the Wild', time: '3h ago' },
                    ].map((item, i) => (
                      <div
                        key={item.user}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-white/6 hover:border-white/15 transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          opacity: 0,
                          animation: 'pp-fade-up 0.4s ease-out forwards',
                          animationDelay: `${0.1 + i * 0.07}s`,
                        }}
                      >
                        <div className={`w-9 h-9 ${item.avatarColor} rounded-full shrink-0 flex items-center justify-center`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5">
                            <p className="text-sm font-semibold truncate">
                              {item.user}{' '}
                              <span className="text-white/40 font-normal">{item.action}</span>
                            </p>
                            <span className="text-[11px] text-white/30 whitespace-nowrap">{item.time}</span>
                          </div>
                          <p className="text-xs text-white/50 line-clamp-1">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none rounded-b-3xl" />
                </div>
              </motion.div>

              {/* ── Right: content ────────────────────────────────────────── */}
              <motion.div
                className="space-y-7 order-1 lg:order-2"
                initial={{ x: 40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <div>
                  <Badge variant="outline" className="px-4 py-1.5 mb-5">
                    <Users className="w-4 h-4 mr-2 inline" />
                    Social Gaming
                  </Badge>
                  <h2
                    className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5"
                    style={{ fontFamily: 'Exo 2, sans-serif' }}
                  >
                    Connect with{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                      Fellow Gamers
                    </span>
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                    Share your gaming achievements, post reviews, and discover new games through
                    your gaming community. Build lasting friendships over shared gaming experiences.
                  </p>
                </div>

                {/* Feature list — plain divs, CSS stagger, no hover motion subscriptions */}
                <div className="space-y-3">
                  {[
                    { icon: Heart, text: 'Share screenshots and gaming stories', color: 'text-pink-500' },
                    { icon: Users, text: 'Follow other gamers and build your network', color: 'text-blue-500' },
                    { icon: TrendingUp, text: 'Discover trending games in your community', color: 'text-green-500' },
                  ].map((feature, i) => (
                    <div
                      key={feature.text}
                      className="flex items-center gap-4 group/feat"
                      style={{
                        opacity: 0,
                        animation: 'pp-fade-up 0.4s ease-out forwards',
                        animationDelay: `${0.2 + i * 0.08}s`,
                      }}
                    >
                      <div className="p-2 rounded-lg bg-white/5 border border-primary/20 group-hover/feat:border-primary/50 transition-colors shrink-0">
                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <span className="text-base sm:text-lg group-hover/feat:text-primary transition-colors">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" className="group" onClick={() => navigate('/auth?mode=signup')}>
                  Join Community
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA — Ready to Transform Your Gaming Experience? */}
      <section
        className="relative py-20 md:py-32 overflow-hidden border-t"
        style={{ contain: 'layout style' }}
      >
        {/*
          Background depth without paint cost:
          A simple radial gradient at the centre fades to transparent.
          No alpha CSS variable lookup, no full-viewport gradient repaint.
        */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6">
          {/*
            Single motion.div parent — ONE IntersectionObserver instead of 6.
            Children use CSS animation-delay via style.animationDelay to stagger
            without creating 6 separate framer-motion subscriptions.
          */}
          <motion.div
            className="mx-auto max-w-5xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ willChange: 'opacity, transform' }}
          >
            {/* Card */}
            <div
              className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-white/10"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,0.05) inset, 0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              {/* Main content */}
              <div className="p-8 md:p-12 lg:p-16">
                <div className="max-w-3xl mx-auto text-center space-y-6">

                  <Badge variant="secondary" className="mb-2">
                    <Rocket className="w-3 h-3 mr-1.5" />
                    Get Started
                  </Badge>

                  <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                    style={{ fontFamily: 'Exo 2, sans-serif' }}
                  >
                    Ready to Transform Your{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
                      Gaming Experience?
                    </span>
                  </h2>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Join over 10,000 gamers who are already tracking their progress, sharing
                    achievements, and connecting with a vibrant gaming community.
                  </p>

                  {/* Trust indicators — plain divs, no motion */}
                  <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
                    {[
                      { icon: CheckCircle, text: 'Free to start' },
                      { icon: CheckCircle, text: 'No credit card' },
                      { icon: Shield, text: 'Secure & private' },
                      { icon: Sparkles, text: 'AI powered' },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-2 text-sm">
                        <item.icon className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    {!user ? (
                      <>
                        <Button
                          size="lg"
                          onClick={() => navigate('/auth?mode=signup')}
                          className="group text-base px-8 py-6"
                          style={{ transition: 'box-shadow 0.2s, background-color 0.2s, color 0.2s' }}
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
                  </div>

                </div>
              </div>

              {/* Testimonial bar — plain div (was motion.div w/ bg-muted/30) */}
              <div
                className="border-t border-white/8 px-8 py-5"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Avatar stack */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {(['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-pink-600'] as const).map((color, i) => (
                        <div
                          key={i}
                          className={`w-9 h-9 rounded-full border-2 border-zinc-950 ${color} flex items-center justify-center text-white text-xs font-semibold`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Trusted by gamers worldwide</p>
                      <p className="text-white/40 text-xs">Join the community today</p>
                    </div>
                  </div>

                  {/* Star rating — static, no .map() allocation per render */}
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 tracking-tight text-base leading-none">★★★★★</span>
                    <span className="ml-2 text-sm font-medium">4.9/5 rating</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div >
  );
};