/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import MenuCard from '@/components/MenuCard';
import { menuItems as seedItems } from '@/lib/mockData';
import type { MenuItem, Order, OrderStatus } from '@/lib/types';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  Search,
  X,
  MapPin,
  Utensils,
  LayoutGrid,
  List as ListIcon,
  ShoppingBag,
  History,
  ChevronRight,
  Plus,
  Minus,
  Clock,
  ArrowLeft,
  Flame,
  Star as StarIcon,
  RefreshCw
} from 'lucide-react';

export default function TableOrderPage() {
  const params = useParams<{ tableId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = Array.isArray(params?.tableId)
    ? params.tableId[0]
    : params?.tableId;

  const { cart, addItem, removeItem, updateQuantity, clearCart, total, count } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [guestReady, setGuestReady] = useState(false);
  const [guestLoading, setGuestLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(true);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [items, setItems] = useState<MenuItem[]>(seedItems as any);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'classic' | 'grid'>('classic');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!tableId) return;
      try {
        const res = await fetch(`/api/guest/status?tableId=${encodeURIComponent(tableId)}`);
        const json = await res.json();
        if (json?.ok && json?.data?.valid) {
          setGuestReady(true);
          fetchOrders();
        } else {
          // If server says no session, but we have a phone in localStorage, try auto-login
          const savedPhone = localStorage.getItem(`guest_phone_${tableId}`);
          if (savedPhone) {
            setPhone(savedPhone);
            // We don't auto-start session here to avoid infinite loops or unnecessary hits, 
            // but we could if we wanted it to be even more seamless.
            // For now, let's just prep the phone state.
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setGuestLoading(false);
      }
    };
    checkSession();
  }, [tableId]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (json.ok) setItems(json.data || []);
      } catch (e) {
        // keep seed items
      }
    };
    load();
  }, []);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.ok) {
        // Filter orders for this table only
        const tableOrders = (json.data || []).filter((o: Order) => o.tableId === tableId);
        setOrders(tableOrders);
      }
    } catch (e) {
      console.error('Failed to fetch orders');
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const startGuestSession = async () => {
    if (!tableId) return;
    setGuestError(null);
    const normalized = phone.trim();
    if (!normalized) {
      setGuestError('Please enter your mobile number.');
      return;
    }
    setStartingSession(true);
    try {
      const res = await fetch('/api/guest/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, phone: normalized, consent }),
      });
      const json = await res.json();
      if (json.ok) {
        localStorage.setItem(`guest_phone_${tableId}`, normalized);
        setGuestReady(true);
        setShowLoginModal(false);
        fetchOrders();
        return;
      }
      setGuestError(json.error || 'Failed to start session.');
    } catch (e: any) {
      setGuestError(e?.message || 'Failed to start session.');
    } finally {
      setStartingSession(false);
    }
  };

  const handleAddToCart = (item: any) => {
    if (!guestReady) {
      setShowLoginModal(true);
      return;
    }
    addItem(item);
  };

  const handleSubmit = async () => {
    if (!guestReady) {
      setMessage('Please enter your mobile number to continue.');
      return;
    }
    if (!tableId) return;
    if (cart.length === 0) {
      setMessage('Add at least one item to order.');
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: cart,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        clearCart();
        setIsCartOpen(false);
        setMessage('Order placed! Redirecting to status...');

        fetchOrders();

        // Short delay to show the message before switching
        setTimeout(() => {
          setMessage(null);
          setIsHistoryOpen(true);
        }, 800);
      } else {
        setMessage(json.error || 'Failed to place order.');
      }
    } catch (e: any) {
      setMessage(e?.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const allowedCategories = ['All', 'Grilled Sandwich', 'Maggi', 'Dessert', 'Momo', 'Burger', 'Club Sandwich'];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const isInCategoryList = allowedCategories.includes(item.category || '');
      return (selectedCategory === 'All' ? isInCategoryList : matchesCategory) && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    const catsToShow = selectedCategory === 'All' ? allowedCategories.filter(c => c !== 'All') : [selectedCategory];

    catsToShow.forEach(cat => {
      const catItems = items.filter(it => it.category === cat &&
        (it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (catItems.length > 0) groups[cat] = catItems;
    });
    return groups;
  }, [items, selectedCategory, searchQuery]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending_verification': return 'bg-amber-500';
      case 'verified': return 'bg-blue-500';
      case 'kitchen_queue': return 'bg-indigo-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-emerald-500';
      case 'cancelled':
      case 'rejected': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className={`min-h-screen selection:bg-red-100 selection:text-red-700 bg-slate-50 flex flex-col`}>
      {/* --- Specialized Sticky Header --- */}
      <header className="fixed top-0 inset-x-0 z-100 bg-white border-b border-slate-100 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-red-600/20 rotate-3">
              LC
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase italic leading-none tracking-tight">London Crust</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Table {tableId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <History size={16} strokeWidth={3} className="text-orange-500" />
              <span className="hidden sm:inline">Orders</span>
              {orders.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </button>

            <button
              onClick={() => {
                if (!guestReady) setShowLoginModal(true);
                else setIsCartOpen(true);
              }}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20"
            >
              <ShoppingBag size={16} strokeWidth={3} />
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white flex items-center justify-center rounded-full text-[9px] border-2 border-white shadow-md">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="grow pt-14 pb-22">
        {/* --- Welcome Summary --- */}
        <section className="px-4 py-6">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-4xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[url('/london_ahmedabad_mural_1772121945432.png')] bg-repeat bg-size-[200px] pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-emerald-400 w-3 h-3 rounded-full animate-pulse"></div>
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Digital Order Active</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase leading-none tracking-tighter mb-4">
                Fresh Crusts <br /> <span className="text-blue-200">Coming Your Way</span>
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                Table {tableId} • Select your favorites, staff will verify your order.
              </p>
            </div>
          </div>
        </section>

        {/* --- Search & Grid Toggle --- */}
        <div className="px-4 mb-6">
          <div className="max-w-4xl mx-auto flex gap-3">
            <div className="relative grow">
              <input
                type="text"
                placeholder="Find a dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-white border-2 border-slate-100 rounded-2xl px-12 text-slate-900 font-bold placeholder:text-slate-400 focus:border-red-600 focus:outline-none transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <div className="bg-white p-1 rounded-2xl border-2 border-slate-100 flex shadow-sm">
              <button
                onClick={() => setViewMode('classic')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'classic' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'}`}
              >
                <ListIcon size={18} strokeWidth={3} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'}`}
              >
                <LayoutGrid size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Categories Slider --- */}
        <div className="px-4 mb-8">
          <div className="max-w-4xl mx-auto overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <div className="flex gap-2">
              {allowedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Menu Display --- */}
        <div className="px-4">
          <div className="max-w-4xl mx-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {filteredItems.map((it) => (
                  <MenuCard
                    key={String(it.id)}
                    id={it.id}
                    name={it.name}
                    description={it.description}
                    price={it.price}
                    image={it.image}
                    priceLabel={it.priceLabel}
                    onAddToCart={handleAddToCart}
                    quantity={cart.find((i: any) => i.id === String(it.id))?.quantity || 0}
                    variants={it.variants}
                    offer={it.offer}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedItems).map(([category, catItems], idx) => (
                  <div key={category} className="space-y-4">
                    <div className={`py-2 px-4 rounded-xl shadow-md transform -rotate-1 mb-4 flex items-center justify-between ${idx % 2 === 0 ? 'bg-blue-600' : 'bg-red-600'}`}>
                      <h2 className="text-sm font-black text-white italic uppercase tracking-tighter">
                        {category}
                      </h2>
                      <span className="text-[8px] font-black text-white/50 uppercase italic">{catItems.length} Items</span>
                    </div>

                    <div className="space-y-3 px-1">
                      {catItems.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 hover:shadow-lg transition-all group">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="grow">
                            <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-[11px] leading-none mb-1">{item.name}</h3>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide line-clamp-1">{item.description}</p>
                            <span className="text-blue-600 font-black italic text-[10px] mt-0.5 block">₹{item.price}</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart({ ...item, quantity: 1, id: String(item.id) })}
                            className="bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center text-slate-900 border border-slate-100 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                          >
                            <Plus size={16} strokeWidth={4} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                <Utensils size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-xl font-black text-slate-400 uppercase italic">No items found</p>
                <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="mt-4 text-xs font-black text-red-600 uppercase tracking-widest border-b-2 border-red-600 pb-1">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Floating Bottom Cart Bar --- */}
      {count > 0 && !isCartOpen && (
        <div className="fixed bottom-6 inset-x-0 z-90 px-4 animate-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={() => setIsCartOpen(true)}
            className="max-w-4xl mx-auto w-full bg-slate-900 border-2 border-white/20 backdrop-blur-md rounded-4xl p-2 flex items-center justify-between shadow-2xl shadow-slate-900/40 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBag size={14} strokeWidth={3} />
              </div>
              <div className="text-left">
                {/* <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Review Selection</p> */}
                <p className="text-sm font-black uppercase italic tracking-tight">{count} Items • ₹{total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
              View<ChevronRight size={18} strokeWidth={3} />
            </div>
          </button>
        </div>
      )}

      {/* --- Guest Login Backdrop --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <div className="w-full max-w-sm rounded-[3rem] bg-white p-8 shadow-2xl shadow-black/20 border-8 border-slate-50 relative overflow-hidden">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-20"
            >
              <X size={16} strokeWidth={3} />
            </button>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 -mr-16 -mt-16 rounded-full" />

            <div className="relative z-10 text-center mb-8">
              <div className="w-16 h-16 bg-red-600 rounded-3xl rotate-12 flex items-center justify-center text-white mx-auto shadow-xl mb-6">
                <Utensils size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Let's Get Cookin'</h2>
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Enter your mobile number to start ordering
              </p>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 px-6 text-slate-900 font-black focus:border-red-600 focus:outline-none transition-all placeholder:text-slate-200"
                    placeholder="e.g. 9876543210"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                    +91
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${consent ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}`}>
                  {consent && <Plus size={14} strokeWidth={4} />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-slate-600 transition-colors">I agree to receive offers via WhatsApp.</span>
              </label>

              {guestError && (
                <div className="bg-red-50 p-4 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest text-center border border-red-100">
                  {guestError}
                </div>
              )}

              <button
                onClick={startGuestSession}
                disabled={startingSession}
                className="w-full h-16 rounded-4xl bg-slate-900 text-white font-black uppercase italic tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {startingSession ? 'Initializing...' : (
                  <>Start Ordering <ChevronRight size={20} strokeWidth={3} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Cart Drawer --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-300 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white">
                  <ShoppingBag size={20} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase italic leading-none tracking-tight">Your Cart</h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Table {tableId} • {count} Items</p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <Utensils size={40} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-sm font-black text-slate-300 uppercase italic tracking-widest">Cart is empty</p>
                </div>
              ) : (
                cart.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-4 group">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden relative">
                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="grow">
                      <h3 className="font-black text-slate-800 uppercase italic text-xs leading-tight mb-1">{it.name}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">₹{it.price} each</p>

                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity - 1)}
                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-red-600 shadow-sm active:scale-90 transition-all"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{it.quantity}</span>
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity + 1)}
                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm active:scale-90 transition-all"
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 italic">₹{it.price * it.quantity}</p>
                      <button onClick={() => removeItem(it.id)} className="mt-2 text-[9px] font-black text-slate-300 hover:text-red-600 uppercase tracking-widest transition-all">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-200 shrink-0 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <span>Taxes (Included)</span>
                  <span>₹0</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Total</span>
                  <span className="text-2xl font-black text-red-600 italic tracking-tighter">₹{total}</span>
                </div>
              </div>

              {message && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">
                  {message}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full h-16 rounded-4xl bg-slate-900 text-white font-black uppercase italic tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? 'Confirming...' : (
                  <>Place Order <ChevronRight size={20} strokeWidth={3} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Order History Drawer --- */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-300 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                  <History size={20} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase italic leading-none tracking-tight">Order Status</h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Real-time Tracker</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchOrders}
                  disabled={isRefreshing}
                  className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all active:scale-90 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
                >
                  <RefreshCw size={18} strokeWidth={3} />
                </button>
                <button onClick={() => setIsHistoryOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="grow overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {orders.length === 0 ? (
                <div className="text-center py-20">
                  <Clock size={40} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-sm font-black text-slate-300 uppercase italic tracking-widest text-center px-12">No orders placed yet in this session.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="relative pl-8 border-l-2 border-slate-100 pb-10 last:pb-0">
                    <div className={`absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md ${getStatusColor(order.status)}`} />

                    <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm space-y-4">
                      {/* Header Section */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total</span>
                          <span className="text-lg font-black text-slate-900 italic">₹{order.total}</span>
                        </div>
                      </div>

                      {/* Items List - Multi-line style */}
                      <div className="space-y-3 py-4 border-y-2 border-slate-50 border-double">
                        {order.items.map((it: any, i: number) => (
                          <div key={i} className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-black text-slate-800 uppercase italic tracking-tight">{it.quantity}x {it.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Progress/ETA */}
                      {order.status === 'in_progress' && order.etaMinutes && (
                        <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 animate-pulse">
                          <Clock className="text-blue-600" size={16} />
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Est. Ready in {order.etaMinutes} mins</p>
                        </div>
                      )}

                      {/* Footer Info & Actions */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          <History size={10} />
                          Ordered at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {order.status === 'completed' && !order.billRequestAccepted && (
                          <button
                            disabled={order.billRequested}
                            className={`w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${order.billRequested
                              ? 'bg-slate-100 text-slate-400 shadow-none cursor-default'
                              : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                              }`}
                            onClick={async () => {
                              if (order.billRequested) return;
                              try {
                                const res = await fetch(`/api/orders/${order.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'request_bill' }),
                                });
                                if (res.ok) fetchOrders();
                              } catch (e) {
                                console.error('Failed to request bill');
                              }
                            }}
                          >
                            <Utensils size={14} />
                            {order.billRequested ? 'Bill Requested' : 'Request Bill'}
                          </button>
                        )}
                        {order.billRequestAccepted && (
                          <div className="w-full py-3 px-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Payment being processed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-slate-900 shrink-0">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black uppercase text-xs tracking-widest transition-all"
              >
                Close Status Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Utility CSS for scrollbar hiding --- */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

