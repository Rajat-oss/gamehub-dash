import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Blog', href: '#blog' },
    { name: 'Press', href: '#press' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Status', href: '#status' },
    { name: 'Community', href: '#community' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'GDPR', href: '#gdpr' }
  ];

  return (
    <footer className="bg-[#0A0A0A] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img src="/logofinal.png" alt="Pixel Pilgrim" className="h-8 w-auto" />
              <span className="text-xl font-bold">Pixel Pilgrim</span>
            </div>
            
            <p className="text-[#AAAAAA] max-w-md leading-relaxed">
              The ultimate gaming platform connecting players to their next favorite game experience through advanced discovery and community tools.
            </p>
            
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#AAAAAA] hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#AAAAAA] hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#AAAAAA] hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Company Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    {link.href.startsWith('/') ? (
                      <button 
                        onClick={() => navigate(link.href)}
                        className="text-[#AAAAAA] hover:text-white transition-colors text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-[#AAAAAA] hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    {link.href.startsWith('/') ? (
                      <button 
                        onClick={() => navigate(link.href)}
                        className="text-[#AAAAAA] hover:text-white transition-colors text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-[#AAAAAA] hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <p className="text-[#AAAAAA] text-sm">
              &copy; {new Date().getFullYear()} Pixel Pilgrim. All rights reserved.
            </p>
            
            <div className="flex flex-wrap gap-6">
              {legalLinks.map((link, index) => (
                <React.Fragment key={index}>
                  {link.href.startsWith('/') ? (
                    <button 
                      onClick={() => navigate(link.href)}
                      className="text-[#AAAAAA] hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <a 
                      href={link.href}
                      className="text-[#AAAAAA] hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};