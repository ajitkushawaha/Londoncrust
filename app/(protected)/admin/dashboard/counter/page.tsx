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
  Truck
} from 'lucide-react';
import Link from 'next/link';
import type { Order, Table, ApiResponse } from '@/lib/types';
import QRCode from 'qrcode';

export default function CounterPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newTable, setNewTable] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tables' | 'verify'>('verify');
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/orders')
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-2 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ArrowLeft className="text-slate-600" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Counter</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 uppercase tracking-wider">
            Live
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'verify' 
              ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Verification ({pendingVerify.length + verified.length})
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'tables' 
              ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tables ({tables.length})
          </button>
        </div>
      </div>

      <div className="flex-grow p-4 space-y-6">
        {activeTab === 'tables' ? (
          <>
            {/* Add Table Form */}
            <form onSubmit={addTable} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-primary" />
                Add New Table
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  placeholder="Ex: A1, 5, Terrace-2"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-slate-50 text-slate-900 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  Add
                </button>
              </div>
            </form>

            {/* Tables List */}
            <div className="grid grid-cols-1 gap-4">
              {tables.map(table => (
                <div key={table._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Table {table.number}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">Ready for orders</p>
                    </div>
                    <button
                      onClick={() => deleteTable(table._id)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => downloadQR(table.number)}
                      className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                    >
                      <Download size={18} />
                      QR Code
                    </button>
                    <Link
                      href={`/t/${table.number}`}
                      target="_blank"
                      className="flex-1 py-3 px-4 bg-primary/5 border border-primary/20 rounded-2xl text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                    >
                      <ExternalLink size={18} />
                      View Menu
                    </Link>
                  </div>
                </div>
              ))}
              {tables.length === 0 && (
                <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <Search size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No tables added yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Verification Flow */}
            <div className="space-y-6">
              {/* Pending Verification */}
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-4">
                  Needs Verification ({pendingVerify.length})
                </h2>
                <div className="space-y-4">
                  {pendingVerify.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-indigo-100 ring-2 ring-indigo-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                            New Order
                          </span>
                          <h3 className="text-xl font-extrabold text-slate-900">Table {order.tableId}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-primary">₹{order.total}</p>
                          <p className="text-xs text-slate-400 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
                        <ul className="space-y-2">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-sm text-slate-700">
                              <span className="font-medium">{item.name} × {item.quantity}</span>
                              <span className="text-slate-400">₹{item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => act(order.id, 'reject')}
                          className="py-3.5 px-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                        >
                          <XCircle size={20} />
                          Reject
                        </button>
                        <button
                          onClick={() => act(order.id, 'verify')}
                          className="py-3.5 px-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                          <CheckCircle2 size={20} />
                          Verify
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingVerify.length === 0 && (
                    <div className="bg-white/50 border border-slate-100 rounded-3xl p-8 text-center">
                      <CheckCircle2 size={32} className="text-emerald-300 mx-auto mb-2" />
                      <p className="text-slate-400 font-medium">All orders verified.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified, Wait for Kitchen */}
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-4">
                  Verified - Ready for Kitchen ({verified.length})
                </h2>
                <div className="space-y-4">
                  {verified.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Table {order.tableId}</h3>
                        <p className="text-lg font-extrabold text-primary">₹{order.total}</p>
                      </div>
                      <button
                        onClick={() => act(order.id, 'send_to_kitchen')}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-extrabold flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                      >
                        <Truck size={20} />
                        Send to Kitchen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
