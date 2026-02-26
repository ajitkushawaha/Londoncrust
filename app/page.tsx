'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { restaurantInfo } from '@/lib/mockData';
import {
  ArrowRight,
  MapPin,
  Clock,
  Star,
  Phone,
  ChevronRight,
  Zap,
  UtensilsCrossed,
  LayoutGrid,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-red-100 selection:text-red-700">
      <Navbar />

      <main className="pt-20">
        {/* --- Hero Section --- */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-50">
          {/* Mural Background Overlay */}
          <div className="absolute inset-0 z-0 opacity-10">
            <Image
              src="/london_ahmedabad_mural_1772121945432.png"
              alt="Mural"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div className={`space-y-8 transition-all duration-1000 transform ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-xl animate-bounce">
                  <Zap size={14} fill="currentColor" />
                  Ahmedabad's Best Pizza
                </div>

                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                  <span className="text-red-600">LONDON</span> <br />
                  <span className="text-blue-600 italic">CRUST</span>
                </h1>

                <p className="text-xl sm:text-2xl text-slate-600 font-bold max-w-lg leading-tight">
                  {restaurantInfo.tagline}. <br />
                  <span className="text-slate-400">Pizzas • Burgers • Momos • More</span>
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/menu"
                    className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-xl hover:bg-red-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.4)] group"
                  >
                    ORDER NOW
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/menu"
                    className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]"
                  >
                    THE MENU
                  </Link>
                </div>
              </div>

              <div className={`relative transition-all duration-1000 delay-300 transform ${isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="relative aspect-square rounded-[3rem] overflow-hidden border-12 border-white shadow-2xl skew-y-3">
                  <Image
                    src="/front.png"
                    alt="Vibrant Cafe"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-linear-to-t from-red-600/90 to-transparent">
                    <p className="text-white font-black text-2xl uppercase italic">Vibe with us</p>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-blue-600 text-white p-6 rounded-3xl shadow-2xl -rotate-12 border-4 border-white">
                  <span className="font-black text-4xl leading-none">FREE</span> <br />
                  <span className="text-xs font-bold uppercase tracking-widest leading-none">Delivery*</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- Quick Facts Strip --- */}
        <section className="bg-blue-600 py-6 -mt-8 relative z-20 overflow-hidden transform skew-y-1">
          <div className="flex items-center justify-center gap-12 sm:gap-24 animate-marquee whitespace-nowrap">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-6 text-white text-3xl font-black italic uppercase">
                <span>CHEESY PIZZAS</span>
                <span className="text-red-300">•</span>
                <span>LOADED BURGERS</span>
                <span className="text-red-300">•</span>
                <span>CHILLI MOMOS</span>
                <span className="text-red-300">•</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- Feature Grid --- */}
        <section className="py-24 relative overflow-hidden bg-white">
          {/* Subtle Brick Background Segment */}
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-5 pointer-events-none">
            <Image src="/red_brick_texture_1772121908552.png" alt="Brick" fill className="object-cover" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 leading-[0.9] tracking-tight">
                CRISPY. CRUNCHY. <br />
                <span className="text-red-600 uppercase italic">UNFORGETTABLE.</span>
              </h2>
              <p className="text-lg text-slate-500 font-bold uppercase tracking-widest">{restaurantInfo.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-slate-50 p-10 rounded-4xl border-l-12 border-red-600 shadow-xl hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-8 border-2 border-red-200">
                  <UtensilsCrossed size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 italic">Artisanal Dough</h3>
                <p className="text-slate-500 font-bold leading-tight uppercase text-sm">
                  Hand-tossed everyday. Our signature London crust is light, crispy, and the talk of the town.
                </p>
              </div>

              {/* Card 2 - The Contrast Card */}
              <div className="bg-blue-600 p-10 rounded-4xl text-white shadow-2xl hover:-translate-y-2 transition-transform duration-500 border-t-12 border-white">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                  <Star size={32} fill="currentColor" />
                </div>
                <h3 className="text-3xl font-black mb-4 italic uppercase">Voted #1 Spot</h3>
                <p className="text-blue-100 font-bold leading-tight uppercase text-sm">
                  From college students to families, we're Ahmedabad's favorite hangout for late-night cravings.
                </p>
                <div className="mt-8 flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="white" />)}
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-10 rounded-4xl border-b-12 border-b-blue-600 shadow-xl border-t border-t-slate-100 hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12"></div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 border-2 border-blue-100">
                  <LayoutGrid size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 italic">The Cafe Vibe</h3>
                <p className="text-slate-500 font-bold leading-tight uppercase text-sm">
                  Modern interiors, mural walls, and energetic music. It's not just food; it's an experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Interactive Info Area --- */}
        <section className="py-24 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-4xl shadow-xl flex items-center gap-6 border-2 border-slate-100">
                <div className="p-4 bg-red-600 rounded-2xl text-white">
                  <Clock size={32} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Always Open</p>
                  <p className="text-xl font-black text-slate-900 uppercase">11 AM - 1 AM</p>
                </div>
              </div>

              <div className="bg-red-600 p-8 rounded-4xl shadow-xl flex items-center gap-6 text-white group cursor-pointer overflow-hidden relative border-2 border-red-500">
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="relative z-10 p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                  <MapPin size={32} />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-black text-red-100 uppercase tracking-widest group-hover:text-blue-100">Visit Us</p>
                  <p className="text-lg font-black uppercase leading-none">Navrangpura, AMD</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-4xl shadow-xl flex items-center gap-6 border-2 border-slate-100">
                <div className="p-4 bg-blue-600 rounded-2xl text-white">
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Order On</p>
                  <p className="text-xl font-black text-slate-900 uppercase italic">Zomato • Swiggy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Call To Action --- */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative p-12 py-20 bg-red-600 rounded-[4rem] text-center text-white overflow-hidden shadow-[0_40px_80px_-20px_rgba(220,38,38,0.5)]">
              <div className="absolute inset-0 z-0 opacity-20">
                <Image src="/red_brick_texture_1772121908552.png" alt="Brick" fill className="object-cover" />
              </div>
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-5xl sm:text-7xl font-black italic uppercase leading-none mt-4">Still Hungry <br /> for <span className="text-blue-200">More?</span></h2>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/menu"
                    className="px-12 py-6 bg-white text-red-600 rounded-2xl font-black text-2xl hover:bg-slate-50 transition-all shadow-xl hover:scale-105 active:scale-95 uppercase italic"
                  >
                    Let's Eat!
                  </Link>
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-red-100">Available across Ahmedabad for fast delivery</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
