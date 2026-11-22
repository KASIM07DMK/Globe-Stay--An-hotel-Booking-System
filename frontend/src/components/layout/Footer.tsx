import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#02050E] text-slate-300 pt-16 pb-12 border-t border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-blue-950">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400 font-bold">
                <Compass className="w-6 h-6 text-accent-400" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                Globe<span className="text-accent-400">Stay</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              International hotel booking platform engineered for seamless reservations, guaranteed room availability, zero overbooking, and verified luxury hospitality.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-accent-400" />
              <span>PCI-DSS Compliant &bull; 256-Bit SSL Encrypted &bull; IATA Partner</span>
            </div>
          </div>

          {/* Column 1: Explore Destinations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Destinations</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#destinations" className="hover:text-accent-400 transition">Tokyo, Japan</a></li>
              <li><a href="#destinations" className="hover:text-accent-400 transition">Paris, France</a></li>
              <li><a href="#destinations" className="hover:text-accent-400 transition">Dubai, UAE</a></li>
              <li><a href="#destinations" className="hover:text-accent-400 transition">New York, USA</a></li>
              <li><a href="#destinations" className="hover:text-accent-400 transition">Bali, Indonesia</a></li>
              <li><a href="#destinations" className="hover:text-accent-400 transition">London, UK</a></li>
            </ul>
          </div>

          {/* Column 2: Guest Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Guest Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/my-bookings" className="hover:text-accent-400 transition">Manage Booking</Link></li>
              <li><a href="#faq" className="hover:text-accent-400 transition">Help Center & FAQ</a></li>
              <li><a href="#cancellation" className="hover:text-accent-400 transition">Cancellation Terms</a></li>
              <li><a href="#price-guarantee" className="hover:text-accent-400 transition">Price Guarantee</a></li>
              <li><a href="#accessibility" className="hover:text-accent-400 transition">Accessibility</a></li>
            </ul>
          </div>

          {/* Column 3: Corporate & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">GlobeStay Global</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>100 Marina Boulevard, Singapore 018989</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-accent-400 shrink-0" />
                <span>concierge@globestay.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                <span>+1 (800) 555-GLOBE</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-accent-400 shrink-0" />
                <span>24/7 Multi-Language Support</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} GlobeStay International Hospitality Inc. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#privacy" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#cookies" className="hover:text-slate-400 transition">Cookie Preferences</a>
            <a href="#security" className="hover:text-slate-400 transition">Security Disclosure</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
