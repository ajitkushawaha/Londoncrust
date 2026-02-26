/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo, useState } from 'react';
import MenuCard from '@/components/MenuCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { menuItems as seedItems } from '@/lib/mockData';
import type { MenuItem, OrderItem } from '@/lib/types';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

export default function TableOrderPage() {
  const params = useParams<{ tableId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = Array.isArray(params?.tableId)
    ? params.tableId[0]
    : params?.tableId;
  const [cart, setCart] = useState<Record<string, OrderItem>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [guestReady, setGuestReady] = useState(false);
  const [guestLoading, setGuestLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(true);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState(false);

  const [items, setItems] = useState<MenuItem[]>(seedItems as any);
  const itemsMemo = useMemo(() => items, [items]);
  const total = Object.values(cart).reduce(
    (sum, it) => sum + it.price * it.quantity,
    0,
  );

  useEffect(() => {
    const checkSession = async () => {
      if (!tableId) return;
      try {
        const res = await fetch(`/api/guest/status?tableId=${encodeURIComponent(tableId)}`);
        const json = await res.json();
        if (json?.ok && json?.data?.valid) {
          setGuestReady(true);
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
        setGuestReady(true);
        return;
      }
      setGuestError(json.error || 'Failed to start session.');
    } catch (e: any) {
      setGuestError(e?.message || 'Failed to start session.');
    } finally {
      setStartingSession(false);
    }
  };

  const handleAddToCart = (item: OrderItem) => {
    setCart((prev) => {
      if (item.quantity <= 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: item };
    });
  };

  const handleSubmit = async () => {
    if (!guestReady) {
      setMessage('Please enter your mobile number to continue.');
      return;
    }
    if (!tableId) return;
    const orderItems = Object.values(cart).filter((i) => i.quantity > 0);
    if (orderItems.length === 0) {
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
          items: orderItems,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setCart({});
        setMessage(
          'Order placed! A staff member will verify your table shortly.',
        );
        const redirect = searchParams.get('redirect');
        if (redirect === 'home') {
          setTimeout(() => router.push('/'), 1500);
        }
      } else {
        setMessage(json.error || 'Failed to place order.');
      }
    } catch (e: any) {
      setMessage(e?.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {!guestReady && !guestLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">Enter Mobile Number</h2>
            <p className="mt-2 text-sm text-slate-500">
              We’ll use this to keep your session active for 1 hour.
            </p>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 block">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 9876543210"
              />
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
              />
              <span>I agree to receive offers via WhatsApp/SMS.</span>
            </label>
            {guestError && (
              <div className="mt-3 text-sm text-red-600">{guestError}</div>
            )}
            <button
              onClick={startGuestSession}
              disabled={startingSession}
              className="mt-5 w-full rounded-xl bg-primary px-4 py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {startingSession ? 'Please wait...' : 'Continue'}
            </button>
          </div>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Table {tableId} Menu
          </h1>
          <p className="text-muted-foreground">
            Select items and place your order. Staff will verify at your table.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {itemsMemo.map((it) => (
              <MenuCard
                key={String(it.id)}
                id={it.id}
                name={it.name}
                description={it.description}
                price={it.price}
                image={it.image}
                priceLabel={it.priceLabel}
                onAddToCart={handleAddToCart}
                quantity={cart[String(it.id)]?.quantity || 0}
                variants={it.variants}
                offer={it.offer}
              />
            ))}
          </div>
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg p-4 shadow-md sticky top-24">
              <h2 className="text-xl font-bold mb-4">Your Order</h2>
              <div className="space-y-3 max-h-[50vh] overflow-auto pr-2">
                {Object.values(cart).length === 0 && (
                  <p className="text-muted-foreground">
                    No items selected yet.
                  </p>
                )}
                {Object.values(cart).map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{it.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {it.quantity} × ₹{it.price}
                      </p>
                    </div>
                    <div className="font-semibold">
                      ₹{it.price * it.quantity}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">₹{total}</span>
              </div>
              {message && (
                <div className="mt-3 text-sm text-foreground">{message}</div>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting || !guestReady}
                className="mt-4 w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
