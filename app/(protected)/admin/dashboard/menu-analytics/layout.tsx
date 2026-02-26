'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MenuAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOverview = pathname.includes('/menu-analytics/overview');
  const isMenu = pathname.includes('/menu-analytics/menu');
  const isLeads = pathname.includes('/menu-analytics/leads');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="text-slate-600" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="hidden md:flex items-center gap-2 mb-6">
          <Link
            href="/admin/dashboard/menu-analytics/overview"
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              isOverview
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-primary/30'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/admin/dashboard/menu-analytics/menu"
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              isMenu
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-primary/30'
            }`}
          >
            Menu
          </Link>
          <Link
            href="/admin/dashboard/menu-analytics/leads"
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              isLeads
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-primary/30'
            }`}
          >
            Leads
          </Link>
        </div>

        {children}
      </div>

      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-2 rounded-full border border-slate-200 shadow-lg">
          <Link
            href="/admin/dashboard/menu-analytics/overview"
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
              isOverview
                ? 'bg-primary text-white'
                : 'text-slate-700 bg-slate-100'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/admin/dashboard/menu-analytics/menu"
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
              isMenu
                ? 'bg-primary text-white'
                : 'text-slate-700 bg-slate-100'
            }`}
          >
            Menu
          </Link>
          <Link
            href="/admin/dashboard/menu-analytics/leads"
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
              isLeads
                ? 'bg-primary text-white'
                : 'text-slate-700 bg-slate-100'
            }`}
          >
            Leads
          </Link>
        </div>
      </div>
    </div>
  );
}
