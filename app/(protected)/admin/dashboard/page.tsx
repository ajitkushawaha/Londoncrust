'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Receipt, CookingPot, LogOut, ChevronRight, Activity, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
    }
  };

  const cards = [
    {
      title: 'Dashboard',
      description: 'Manage menus, track analytics & monitor live stats',
      icon: LayoutDashboard,
      href: '/admin/dashboard/menu-analytics',
      color: 'indigo',
    },
    {
      title: 'Counter',
      description: 'Manage tables, verify orders & handle payments',
      icon: Receipt,
      href: '/admin/dashboard/counter',
      color: 'emerald',
    },
    {
      title: 'Kitchen',
      description: 'Track orders, manage fulfillment & update ETA',
      icon: CookingPot,
      href: '/admin/dashboard/kitchen',
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-size-[6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#ebf4ff,transparent)]"></div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex  md:items-center justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-2">
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100/50">
              <Sparkles size={12} className="animate-pulse" />
              Management Suite
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Control <span className="text-primary">Center</span>
            </h1>
            <p className="text-slate-500 font-medium text-base sm:text-lg">
              Welcome back, Admin. <span className="hidden sm:inline">Your restaurant is running smoothly.</span>
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group self-start md:self-auto flex items-center gap-3 px-5 py-2.5 sm:px-6 sm:py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 text-sm sm:text-base font-semibold hover:text-red-600 hover:border-red-100 hover:bg-red-50/50 transition-all duration-300"
          >
            <span className='hidden md:inline-flex'>Sign Out</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut size={16} />
            </div>
          </button>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const colors = {
              indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500', hover: 'hover:text-indigo-600' },
              emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', hover: 'hover:text-emerald-600' },
              amber: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', hover: 'hover:text-amber-600' },
            }[card.color] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500', hover: 'hover:text-primary' };

            return (
              <Link key={index} href={card.href} className="group relative block h-full">
                <div className="relative h-full bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-4xl sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:border-primary/20 flex flex-col justify-between overflow-hidden">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-linear-to-br from-transparent to-${card.color}-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className='flex sm:flex-col flex-row gap-4 sm:gap-2'>
                    <div className="relative mb-6 sm:mb-8">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 ${colors.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner ring-4 ring-white`}>
                        <Icon className={`${colors.text} w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm`} />
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 ${colors.dot} rounded-full border-4 border-white scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 shadow-sm`} />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 tracking-tight transition-colors duration-300 mb-2`}>
                        {card.title}
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-[15px] font-medium leading-relaxed">
                        {card.description}
                      </p>

                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {index + 1}
                      </div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-100 flex items-center justify-center bg-slate-50 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm">
                      <ChevronRight className="text-slate-400 group-hover:text-white transition-colors duration-300" size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Status */}
        <div className="mt-16 sm:mt-20 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 text-xs sm:text-sm font-bold transition-all hover:border-primary/20 hover:shadow-md cursor-default">
            <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
            </div>
            <span>System Core Online</span>
            <span className="w-px h-4 bg-slate-200 mx-1"></span>
            <Activity size={14} className="text-slate-400" />
            <span className="text-slate-400 font-medium hidden xs:inline">99.9% Uptime</span>
          </div>
          <p className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wide text-center">
            &copy; 2024 LONDON CRUST PIZZA • ADMIN PANEL V2.1
          </p>
        </div>
      </div>
    </div>
  );
}
