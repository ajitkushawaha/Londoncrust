'use client';

import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, TrendingUp, UtensilsCrossed, Users, XCircle } from 'lucide-react';
import type { Order } from '@/lib/types';

export default function OverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (json.ok) setOrders(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const stats = {
    totalOrders: orders.length,
    dailyOrders: orders.filter((o) => {
      const today = new Date().setHours(0, 0, 0, 0);
      return o.createdAt >= today;
    }).length,
    completed: orders.filter((o) => o.status === 'completed').length,
    rejected: orders.filter(
      (o) => o.status === 'rejected' || o.status === 'cancelled',
    ).length,
    totalRevenue: orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0),
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Performance Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
              <BarChart3 className="text-slate-700 w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalOrders}</p>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1">Total Orders</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="text-blue-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.dailyOrders}</p>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1">Today's Orders</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
              <CheckCircle2 className="text-emerald-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.completed}</p>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1">Completed</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-3">
              <XCircle className="text-rose-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.rejected}</p>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1">Rejected</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <UtensilsCrossed className="text-amber-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1">Total Revenue</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Customer Insights</h2>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
            <Users className="text-primary w-8 h-8" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">84%</p>
            <p className="text-slate-500 text-sm font-medium">Repeat Customer Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
}
