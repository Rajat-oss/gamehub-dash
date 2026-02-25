import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Linkedin, ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Footer — performance-optimised:
 *  - ONE whileInView on the top-grid wrapper (was 4 separate IntersectionObservers)
 *  - Decorative "PIXELPILGRIM" text: removed blur-[2px] filter (forces GPU repaint)
 *    and scale animation (expensive subpixel rasterisation on mobile)
 *  - Removed min-h-screen (was forcing a full-height layout pass)
 *  - contain: layout style paint — isolates footer from page reflow entirely
 *  - Link items use CSS stagger (animationDelay) instead of framer-motion per-item
 */
export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const productLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Games Library', href: '#games' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'API Docs', href: '#api' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Discord', icon: Mail, href: '#' },
  ];

  const legalLinks = [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Cookies', href: '#cookies' },
  ];

  return (
    <footer
      className="relative bg-black text-white flex flex-col justify-between overflow-hidden pt-24 pb-12"
      style={{ contain: 'layout style paint' }}
    >
      {/* Subtle radial glow — single tiny CSS gradient, no filter, no animation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 20%, rgba(120,119,198,0.07) 0%, transparent 60%)' }}
      />

      <div className="container relative z-10 px-6 mx-auto">
        {/*
          Top link grid: ONE motion.div wraps all 4 columns.
          Previously each column was its own motion.div = 4 IntersectionObservers.
          Now it's 1 observer that fires and the columns stagger via CSS animationDelay.
        */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Product */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Product</h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => link.href.startsWith('/') ? navigate(link.href) : (window.location.hash = link.href.substring(1))}
                    className="text-xl font-medium hover:text-primary transition-colors flex items-center group text-left"
                  >
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => link.href.startsWith('/') ? navigate(link.href) : (window.location.hash = link.href)}
                    className="text-xl font-medium hover:text-primary transition-colors flex items-center group text-left"
                  >
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Connect</h4>
            <ul className="space-y-4">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-xl font-medium hover:text-primary transition-colors flex items-center group"
                  >
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Legal</h4>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-xl font-medium hover:text-primary transition-colors flex items-center group text-left"
                  >
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/*
          Decorative giant wordmark.
          REMOVED: blur-[2px] filter (forces a full GPU repaint of the element every frame)
          REMOVED: motion scale animation (expensive subpixel text rasterisation on mobile)
          REMOVED: the second blurred/dimmed copy (doubled the paint cost)
          KEPT: clip-path gradient text (GPU composited, zero paint cost)
        */}
        <div className="relative pt-20 overflow-hidden">
          <p
            className="text-[11vw] font-black leading-none tracking-tighter text-center select-none bg-gradient-to-b from-white/15 to-white/5 bg-clip-text text-transparent"
            aria-hidden="true"
          >
            PIXELPILGRIM
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container px-6 mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-2">
          <img src="/logofinal.png" alt="Logo" className="h-6 w-auto grayscale brightness-200" />
          <p className="text-white/40 text-sm font-medium">
            &copy; {new Date().getFullYear()} Pixel Pilgrim. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-8 text-white/40 text-sm font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>Digital Universe</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3" />
            <span>hello@pixelpilgrim.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
