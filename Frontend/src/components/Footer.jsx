import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px), radial-gradient(circle at 75% 75%, #3b82f6 2px, transparent 2px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Briefcase className="h-10 w-10 text-blue-400 group-hover:text-blue-300 transition-all duration-300" />
                <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Jobslink Inc.
              </span>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              Connecting talent with opportunity since 2018. Your trusted partner in career growth and talent acquisition.
            </p>
            
            <div className="flex space-x-4">
              {[
                { icon: FaFacebook, label: 'Facebook' },
                { icon: FaTwitter, label: 'Twitter' },
                { icon: FaLinkedin, label: 'LinkedIn' },
                { icon: FaInstagram, label: 'Instagram' }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="group relative p-3 bg-gray-800/50 rounded-xl hover:bg-blue-500/20 transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  <div className="absolute inset-0 bg-blue-400 rounded-xl opacity-0 group-hover:opacity-10 blur-sm transition-opacity duration-300"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <ExternalLink className="h-5 w-5 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Quick Links</h3>
            </div>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Services' },
                { to: '/jobs', label: 'Jobs' },
                { to: '/employers', label: 'Employers' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.to}
                    className="group flex items-center text-gray-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="h-5 w-5 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">For Job Seekers</h3>
            </div>
            <ul className="space-y-3">
              {[
                { href: '#', label: 'Browse Jobs' },
                { href: '#', label: 'Resume Builder' },
                { href: '#', label: 'Career Advice' },
                { href: '#', label: 'Salary Guide' },
                { href: '#', label: 'Interview Tips' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="group flex items-center text-gray-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-5 w-5 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Contact Info</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="relative mt-1">
                  <Phone className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">+91 8985287845</span>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="relative mt-1">
                  <Mail className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">info@jobslinkinc.com</span>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="relative mt-1">
                  <MapPin className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  123 Business Ave<br />
                  Suite 100<br />
                  New York, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © 2024 Jobslink Inc. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;