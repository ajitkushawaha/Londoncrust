'use client';

import Link from 'next/link';
import { Menu, X, ShoppingBag, User, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { restaurantInfo } from '@/lib/mockData';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-2' : 'bg-red-600 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${isScrolled ? 'bg-red-600 border-red-100' : 'bg-white border-blue-600'}`}>
              <span className={`font-black text-xl sm:text-2xl ${isScrolled ? 'text-white' : 'text-blue-600'}`}>LC</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-lg sm:text-xl tracking-tighter leading-none transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
                {restaurantInfo.name.split(' ')[0]} <span className={isScrolled ? 'text-red-600' : 'text-blue-200'}>{restaurantInfo.name.split(' ').slice(1).join(' ')}</span>
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isScrolled ? 'text-blue-600' : 'text-red-100'}`}>Ahmedabad</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-black uppercase tracking-widest transition-colors ${isScrolled ? 'text-slate-600 hover:text-red-600' : 'text-white hover:text-blue-100'}`}>
              Home
            </Link>
            <Link href="/menu" className={`text-sm font-black uppercase tracking-widest transition-colors ${isScrolled ? 'text-slate-600 hover:text-red-600' : 'text-white hover:text-blue-100'}`}>
              The Menu
            </Link>

            <Link
              href="/admin/login"
              className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors ${isScrolled ? 'text-slate-600 hover:text-red-600' : 'text-white hover:text-blue-100'}`}
            >
              <User size={16} />
              Admin
            </Link>

            <a
              href={`tel:${restaurantInfo.phone}`}
              className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-md flex items-center gap-2 ${isScrolled ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <Phone size={16} />
              Call Now
            </a>
          </div>

          {/* Mobile Menu Button Group */}
          <div className="md:hidden flex items-center gap-3">
            <a href={`tel:${restaurantInfo.phone}`} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isScrolled ? 'bg-red-50 text-red-600' : 'bg-white/20 text-white'}`}>
              <Phone size={20} />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl border transition-colors ${isScrolled ? 'text-slate-900 border-slate-200' : 'text-white border-white/20'}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <Link
              href="/"
              className="block py-4 text-xl font-black text-slate-900 border-b border-slate-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="block py-4 text-xl font-black text-slate-900 border-b border-slate-50"
              onClick={() => setIsOpen(false)}
            >
              Full Menu
            </Link>
            <Link
              href="/admin/login"
              className="block py-4 text-xl font-black text-slate-900 border-b border-slate-50"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
            <a
              href={`tel:${restaurantInfo.phone}`}
              className="block w-full py-4 bg-red-600 text-white rounded-2xl font-black text-center text-lg mt-6 shadow-lg uppercase italic tracking-widest"
              onClick={() => setIsOpen(false)}
            >
              Call to Order
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
