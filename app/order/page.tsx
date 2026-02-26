'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import {
  Trash2,
  Plus,
  Minus,
  Phone,
  ArrowRight,
  ShoppingBag,
  Clock,
  AlertCircle,
  Hash,
  MessageSquare,
  Gift,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OrderPage() {
  const { cart, updateQuantity, removeItem, total, count, clearCart } = useCart();
  const [notification, setNotification] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setIsOrdering(true);

    // Simulate API call
    setTimeout(() => {
      setIsOrdering(false);
      setOrderComplete(true);
      setNotification(`Order Placed Successfully! We're prepping your crust.`);
      setTimeout(() => {
        clearCart();
        setOrderComplete(false);
      }, 5000);
    }, 2000);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black italic uppercase text-slate-900 mb-4 tracking-tighter">Order Processing!</h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] max-w-sm leading-relaxed mb-12">
          Your chef has been notified. Estimated wait time is 15-20 minutes. Enjoy the vibe!
        </p>
        <Link
          href="/"
          className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-red-700 transition-all active:scale-95"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-100 selection:text-red-700">
      <Navbar />

      <main className="grow pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h1 className="text-5xl font-black italic uppercase text-slate-900 leading-none tracking-tighter">Review Order</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Freshly Prepared • London Style</p>
            </div>
            <Link
              href="/menu"
              className="text-blue-600 font-black uppercase text-xs tracking-widest hover:text-blue-700 flex items-center gap-2 group"
            >
              <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Add more items
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {cart.length === 0 ? (
                <div className="bg-white p-12 rounded-4xl border-2 border-dashed border-slate-200 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <ShoppingBag size={40} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 uppercase italic mb-2">Cart is empty!</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">What are you craving today?</p>
                  <Link
                    href="/menu"
                    className="inline-block px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-blue-700 transition-all"
                  >
                    Explore Menu
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm group hover:shadow-md transition-all">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-inner bg-slate-100 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-slate-900 uppercase italic text-sm leading-tight leading-none">{item.name}</h3>
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-tight">₹{item.price} per unit</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-red-600 shadow-sm active:scale-90 transition-all"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-blue-600 shadow-sm active:scale-90 transition-all"
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                        <span className="text-sm font-black text-slate-900 uppercase italic">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Special Instructions */}
              {cart.length > 0 && (
                <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="font-black text-slate-900 uppercase italic text-sm">Cooking Notes?</h3>
                  </div>
                  <textarea
                    placeholder="Extra spicy? No onions? Tell us and we'll nail it!"
                    className="w-full h-24 bg-slate-50 rounded-2xl p-4 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-blue-600/10 border border-slate-100 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-slate-50 sticky top-28 space-y-8 overflow-hidden">
                {/* Table Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 uppercase italic text-lg leading-none">Your Table</h3>
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                      <Hash size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => setTableNumber(String(num))}
                        className={`h-12 rounded-xl font-black text-sm transition-all border-2 ${tableNumber === String(num)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                            : 'bg-slate-50 border-slate-100 text-slate-400'
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Totals */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span>Bag Total ({count} items)</span>
                    <span className="text-slate-900">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span>Taxes & GST (5%)</span>
                    <span className="text-slate-900">₹{Math.round(total * 0.05)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Gift size={20} className="text-blue-600 animate-bounce" />
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Coupons Applied</span>
                    </div>
                    <span className="text-xs font-black text-blue-600 uppercase">- ₹0</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Grand Total</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">₹{total + Math.round(total * 0.05)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      <Clock size={12} /> 15m wait
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0 || !tableNumber || isOrdering}
                  className={`w-full py-6 rounded-2.5xl font-black uppercase text-lg tracking-[0.1em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isOrdering
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                    }`}
                >
                  {isOrdering ? (
                    <>Processing <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></>
                  ) : (
                    <>Confirm Order <ArrowRight size={20} strokeWidth={3} /></>
                  )}
                </button>

                {!tableNumber && cart.length > 0 && (
                  <p className="text-[10px] font-black text-red-500 uppercase text-center tracking-widest animate-pulse">
                    Select your table number to proceed
                  </p>
                )}

                <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 bg-slate-200 rounded-full border-2 border-white"></div>)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">12 others ordering now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
