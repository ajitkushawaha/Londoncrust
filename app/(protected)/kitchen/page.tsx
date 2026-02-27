'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Order } from '@/lib/types';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etas, setEtas] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const json = await res.json();
      if (json.ok) {
        setOrders(json.data);
      } else {
        setError(json.error || 'Failed to load orders');
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const accept = async (id: string) => {
    const rawEta = etas[id];
    const eta = Number.isFinite(rawEta) ? rawEta : 15;
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', etaMinutes: eta }),
    });
    const json = await res.json();
    if (json.ok) {
      await load();
    } else {
      alert(json.error || 'Failed to accept');
    }
  };

  const complete = async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete' }),
    });
    const json = await res.json();
    if (json.ok) {
      await load();
    } else {
      alert(json.error || 'Failed to complete');
    }
  };

  const queue = orders.filter((o) => o.status === 'kitchen_queue');
  const inProgress = orders.filter((o) => o.status === 'in_progress');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Kitchen</h1>
        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && <p className="text-destructive">{error}</p>}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Queue</h2>
            <div className="space-y-4">
              {queue.map((o) => (
                <div
                  key={o.id}
                  className="bg-card rounded-lg p-4 shadow flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      Table {o.tableId} • ₹{o.total}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {o.items.map((it) => `${it.name}×${it.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={etas[o.id] ?? 15}
                      onChange={(e) =>
                        setEtas((prev) => ({
                          ...prev,
                          [o.id]: Number(e.target.value),
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                    <button
                      onClick={() => accept(o.id)}
                      className="px-3 py-2 rounded bg-primary text-primary-foreground"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
              {queue.length === 0 && (
                <p className="text-muted-foreground">No orders in queue.</p>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">In Progress</h2>
            <div className="space-y-4">
              {inProgress.map((o) => (
                <div
                  key={o.id}
                  className="bg-card rounded-lg p-4 shadow flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      Table {o.tableId} • ₹{o.total} • {typeof o.etaMinutes === 'number' && o.etaMinutes > 0 ? `ETA ${o.etaMinutes}m` : 'Preparing'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {o.items.map((it) => `${it.name}×${it.quantity}`).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => complete(o.id)}
                    className="px-3 py-2 rounded bg-secondary text-secondary-foreground"
                  >
                    Complete
                  </button>
                </div>
              ))}
              {inProgress.length === 0 && (
                <p className="text-muted-foreground">No active orders.</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
