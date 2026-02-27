import { restaurantInfo } from '@/lib/mockData';
import { Phone, MapPin, Clock, Instagram, Twitter, Facebook, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-red-600 text-white py-20 relative overflow-hidden">
      {/* Mural Accent Overlay */}
      <div className="absolute inset-x-0 top-0 h-32 opacity-10 bg-[url('/london_ahmedabad_mural_1772121945432.png')] bg-repeat-x bg-contain pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Identity */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-black text-2xl shadow-xl">LC</div>
              <span className="font-black text-2xl tracking-tighter uppercase italic">London Crust</span>
            </div>
            <p className="text-sm leading-relaxed font-bold text-red-100 uppercase tracking-wide">
              {restaurantInfo.description}
            </p>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-blue-100 font-black mb-8 uppercase tracking-widest text-sm italic">Hungry for more?</h4>
            <ul className="space-y-4 text-lg font-black uppercase italic">
              <li><Link href="/menu" className="hover:text-blue-200 transition-colors flex items-center gap-2">THE MENU <ArrowUpRight size={16} /></Link></li>
              <li><Link href="/" className="hover:text-blue-200 transition-colors flex items-center gap-2">ORDER ONLINE <ArrowUpRight size={16} /></Link></li>
              <li><Link href="/admin/login" className="hover:text-blue-200 transition-colors flex items-center gap-2">ADMIN PANEL <ArrowUpRight size={16} /></Link></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-blue-100 font-black mb-8 uppercase tracking-widest text-sm italic">When to Vibe?</h4>
            <div className="space-y-4 font-black uppercase tracking-tight">
              <div className="flex flex-col">
                <span className="text-xs text-red-200">WEEKDAYS</span>
                <span className="text-2xl">{restaurantInfo.hours.weekday}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-red-200">WEEKENDS</span>
                <span className="text-2xl">{restaurantInfo.hours.weekend}</span>
              </div>
            </div>
          </div>

          {/* Social Presence */}
          <div>
            <h4 className="text-blue-100 font-black mb-8 uppercase tracking-widest text-sm italic">Join the Gang</h4>
            <div className="flex gap-4">
              {[
                { icon: Instagram, href: restaurantInfo.social.instagram },
                { icon: Facebook, href: restaurantInfo.social.facebook },
                { icon: Twitter, href: restaurantInfo.social.twitter }
              ].map((social, i) => (
                <a key={i} href={social.href} className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all border-2 border-white/20 shadow-lg">
                  <social.icon size={24} strokeWidth={3} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-70 italic">&copy; 2026 London Crust Pizza. Ahmedabad's Finest.</p>
          <div className="flex items-center gap-4 text-[10px] font-black text-red-200 uppercase tracking-widest">
            Privacy <span className="w-1 h-1 rounded-full bg-white/30"></span>
            Terms <span className="w-1 h-1 rounded-full bg-white/30"></span>
            Sitemap
          </div>
        </div>
      </div>
    </footer>
  );
}
