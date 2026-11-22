import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-glow-blue">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Error 404
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Page Off the Map
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              We couldn't locate the destination or reservation page you're trying to reach. It may have been relocated or no longer exists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
                Return Home
              </Button>
            </Link>
            <Link to="/search" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full border-blue-900/60 text-blue-300 hover:text-white" leftIcon={<Search className="w-4 h-4" />}>
                Browse Stays
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
