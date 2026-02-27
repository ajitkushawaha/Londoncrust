'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Truck,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import type { Order, Table, ApiResponse } from '@/lib/types';
import QRCode from 'qrcode';

export default function CounterPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newTable, setNewTable] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tables' | 'verify' | 'bills'>('verify');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch('/api/tables', { cache: 'no-store' }),
        fetch('/api/orders', { cache: 'no-store' })
      ]);
      const tablesJson = await tablesRes.json();
      const ordersJson = await ordersRes.json();
      if (tablesJson.ok) setTables(tablesJson.data);
      if (ordersJson.ok) setOrders(ordersJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable) return;
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: newTable }),
      });
      const json = await res.json();
      if (json.ok) {
        setNewTable('');
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const deleteTable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const downloadQR = async (tableNumber: string) => {
    const url = `${window.location.origin}/t/${tableNumber}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 });
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `table-${tableNumber}-qr.png`;
    link.click();
  };

  const act = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  if (loading && tables.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingVerify = orders.filter(o => o.status === 'pending_verification');
  const verified = orders.filter(o => o.status === 'verified');
  const billRequests = orders.filter(o => o.billRequested && !o.billRequestAccepted);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ArrowLeft className="text-slate-600" />
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 font-outfit">Counter</h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black border border-emerald-100 uppercase tracking-widest animate-pulse">
              Live
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl max-w-md">
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'verify'
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Verify ({pendingVerify.length + verified.length})
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all relative ${activeTab === 'bills'
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Bill ({billRequests.length})
              {billRequests.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'tables'
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Tables ({tables.length})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full grow p-4 sm:p-6 lg:p-8">
        {activeTab === 'tables' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Add Table - Sidebar style on desktop */}
              <div className="lg:col-span-1 sticky top-32">
                <form onSubmit={addTable} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <Plus size={20} className="text-primary" />
                    Add Table
                  </h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newTable}
                      onChange={(e) => setNewTable(e.target.value)}
                      placeholder="Ex: A1, 5, etc."
                      className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary bg-slate-50 text-slate-900 transition-all font-bold placeholder:text-slate-300"
                    />
                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                      Create Table
                    </button>
                  </div>
                </form>
              </div>

              {/* Tables Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
                {tables.map(table => (
                  <div key={table._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 italic uppercase">Table {table.number}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${orders.some(o => o.tableId === table.number && !['completed', 'cancelled', 'rejected'].includes(o.status)) ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {orders.some(o => o.tableId === table.number && !['completed', 'cancelled', 'rejected'].includes(o.status)) ? 'Active session' : 'Available'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTable(table._id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => downloadQR(table.number)}
                        className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                      >
                        <Download size={14} /> QR
                      </button>
                      <Link
                        href={`/t/${table.number}`}
                        target="_blank"
                        className="flex-1 py-3 px-4 bg-primary/5 border border-primary/10 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"
                      >
                        <ExternalLink size={14} /> Menu
                      </Link>
                    </div>
                  </div>
                ))}
                {tables.length === 0 && (
                  <div className="sm:col-span-2 text-center py-20 bg-white rounded-4xl border-2 border-dashed border-slate-200">
                    <Search size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tables found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'bills' ? (
          <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
              <span>Pending Bills ({billRequests.length})</span>
              <span className="h-0.5 grow ml-4 bg-slate-100 hidden sm:block"></span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {billRequests.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-4xl shadow-sm border-2 border-red-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 -mr-16 -mt-16 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 italic uppercase leading-none">Table {order.tableId}</h3>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1.5">Awaiting Pay</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-red-700 italic leading-none">₹{order.total}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-8 py-4 border-y border-red-50 grow">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="text-slate-400 italic">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => act(order.id, 'accept_bill')}
                      className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Receipt size={16} /> Accept Bill
                    </button>
                  </div>
                </div>
              ))}
              {billRequests.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 bg-white/50 border border-slate-100 rounded-4xl p-20 text-center">
                  <Receipt size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Zero payment requests</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Needs Verification */}
            <div className="space-y-6">
              <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Verification Queue ({pendingVerify.length})</span>
                <span className="h-0.5 grow ml-4 bg-indigo-50 hidden sm:block"></span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingVerify.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-4xl shadow-sm border border-indigo-100 ring-4 ring-indigo-50/30 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block tracking-widest">
                          Incoming
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 italic uppercase leading-none">Table {order.tableId}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary italic leading-none">₹{order.total}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1.5">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-3xl p-4 mb-6 border border-slate-100 grow">
                      <ul className="space-y-2.5">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex gap-2">
                              <span className="text-indigo-500">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="text-slate-400 font-medium italic">₹{item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => act(order.id, 'reject')}
                        className="py-4 px-4 bg-white border border-slate-200 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button
                        onClick={() => act(order.id, 'verify')}
                        className="py-4 px-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <CheckCircle2 size={16} /> Verify
                      </button>
                    </div>
                  </div>
                ))}
                {pendingVerify.length === 0 && (
                  <div className="md:col-span-2 lg:col-span-3 bg-white/50 border border-slate-100 rounded-4xl p-16 text-center">
                    <CheckCircle2 size={48} className="text-emerald-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Queue is clear</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ready for Kitchen */}
            <div className="space-y-6">
              <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Cooking Queue ({verified.length})</span>
                <span className="h-0.5 grow ml-4 bg-emerald-50 hidden sm:block"></span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {verified.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-4xl shadow-sm border border-emerald-100 border-l-8 border-l-emerald-500 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-900 italic uppercase">Table {order.tableId}</h3>
                      <p className="text-xl font-black text-primary italic">₹{order.total}</p>
                    </div>
                    <button
                      onClick={() => act(order.id, 'send_to_kitchen')}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Truck size={18} /> Send Kitchen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
