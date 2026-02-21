import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Linkedin, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const productLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Games Library', href: '#games' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'API Docs', href: '#api' }
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact', href: '/contact' }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Discord', icon: Mail, href: '#' }
  ];

  const legalLinks = [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Cookies', href: '#cookies' }
  ];

  return (
    <footer className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden pt-24 pb-12">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />
      </div>

      <div className="container relative z-10 px-6 mx-auto flex-1 flex flex-col justify-center">
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Product</h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => link.href.startsWith('/') ? navigate(link.href) : window.location.hash = link.href.substring(1)}
                    className="text-xl font-medium hover:text-primary transition-colors flex items-center group text-left"
                  >
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => link.href.startsWith('/') ? navigate(link.href) : window.location.hash = link.href}
                    className="text-xl font-medium hover:text-primary transition-colors flex items-center group text-left"
                  >
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Connect</h4>
            <ul className="space-y-4">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-xl font-medium hover:text-primary transition-colors flex items-center group">
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60">Legal</h4>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-xl font-medium hover:text-primary transition-colors flex items-center group text-left"
                  >
                    {link.name}
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Big Bold Text Section */}
        <motion.div
          className="relative mt-auto pt-20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[14vw] font-black leading-none tracking-tighter text-center select-none bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent opacity-10 blur-[2px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
            PIXELPILGRIM
          </h2>
          <h2 className="text-[14vw] font-black leading-none tracking-tighter text-center select-none relative z-10 hover:text-primary transition-colors duration-700 cursor-default">
            PIXELPILGRIM
          </h2>
        </motion.div>
      </div>

      {/* Bottom Footer Details */}
      <div className="container px-6 mx-auto mt-20 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
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
