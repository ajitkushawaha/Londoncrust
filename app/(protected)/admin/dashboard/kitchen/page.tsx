'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  CookingPot, 
  Clock, 
  CheckCircle2, 
  History,
  Timer,
  Utensils,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import type { Order, ApiResponse } from '@/lib/types';

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [etas, setEtas] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'queue' | 'progress'>('queue');
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const accept = async (id: string) => {
    const eta = etas[id] || 15;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', etaMinutes: eta }),
      });
      const json = await res.json();
      if (json.ok) fetchOrders();
    } catch (e) { console.error(e); }
  };

  const complete = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      const json = await res.json();
      if (json.ok) fetchOrders();
    } catch (e) { console.error(e); }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const queue = orders.filter((o) => o.status === 'kitchen_queue');
  const inProgress = orders.filter((o) => o.status === 'in_progress');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-2 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ArrowLeft className="text-slate-600" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Kitchen</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100 uppercase tracking-wider">
            Active
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'queue' 
              ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'progress' 
              ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            In Progress ({inProgress.length})
          </button>
        </div>
      </div>

      <div className="flex-grow p-4 space-y-6">
        {activeTab === 'queue' ? (
          <div className="space-y-4">
            {queue.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Table {order.tableId}</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">
                      Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <CookingPot className="text-amber-600 w-5 h-5" />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-800">
                        <span className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
                          {item.quantity}
                        </span>
                        <span className="font-bold text-sm leading-tight">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Timer size={14} /> Set Prep Time
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={90}
                        value={etas[order.id] ?? 15}
                        onChange={(e) => setEtas(prev => ({ ...prev, [order.id]: Number(e.target.value) }))}
                        className="w-14 h-8 px-2 border border-slate-200 rounded-lg bg-white text-center font-bold text-slate-900 focus:ring-2 focus:ring-primary/10"
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">min</span>
                    </div>
                  </div>
                  <button
                    onClick={() => accept(order.id)}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                  >
                    Accept Order
                  </button>
                </div>
              </div>
            ))}
            {queue.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Utensils size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">All caught up!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {inProgress.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Table {order.tableId}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 text-xs font-black uppercase tracking-wider">
                        Ready in {order.etaMinutes} min
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => complete(order.id)}
                    className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    <CheckCircle2 size={24} />
                  </button>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 text-slate-700">
                        <span className="font-black text-slate-400 text-xs leading-tight">{item.quantity}×</span>
                        <span className="font-bold text-sm leading-tight">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {inProgress.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <History size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No active orders.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
