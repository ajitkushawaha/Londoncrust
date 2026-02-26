'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2, Tag } from 'lucide-react';
import type { MenuItem, Offer } from '@/lib/types';

const emptyForm = {
  id: '',
  name: '',
  description: '',
  category: '',
  price: '',
  priceLabel: '',
  image: '',
  offerType: 'none',
  offerValue: '',
  offerLabel: '',
  variantsText: '',
};

function parseVariants(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, priceRaw] = line.split('|').map((p) => p.trim());
      const price = Number(priceRaw);
      if (!name || Number.isNaN(price)) return null;
      return { name, price };
    })
    .filter(Boolean) as { name: string; price: number }[];
}

function offerLabel(offer?: Offer) {
  if (!offer || offer.type === 'none') return null;
  if (offer.type === 'bogo') return offer.label || 'BOGO';
  if (offer.type === 'percent') return `${offer.value}% OFF`;
  if (offer.type === 'flat') return `₹${offer.value} OFF`;
  return null;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const json = await res.json();
      if (json.ok) setItems(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const filteredMenu = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  const resetForm = () => setForm({ ...emptyForm });

  const startEdit = (item: MenuItem) => {
    const offer = item.offer || { type: 'none' };
    const variantsText = (item.variants || [])
      .map((v) => `${v.name}|${v.price}`)
      .join('\n');
    setForm({
      id: String(item.id),
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      price: item.price !== undefined ? String(item.price) : '',
      priceLabel: item.priceLabel || '',
      image: item.image || '',
      offerType: offer.type,
      offerValue:
        offer.type === 'percent' || offer.type === 'flat'
          ? String(offer.value)
          : '',
      offerLabel: 'label' in offer && offer.label ? offer.label : '',
      variantsText,
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.image) return;
    setSaving(true);
    try {
      const offer: Offer =
        form.offerType === 'none'
          ? { type: 'none' }
          : form.offerType === 'bogo'
            ? { type: 'bogo', label: form.offerLabel || undefined }
            : {
                type: form.offerType as 'percent' | 'flat',
                value: Number(form.offerValue || 0),
                label: form.offerLabel || undefined,
              };
      const payload: Partial<MenuItem> & { offer?: Offer } = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.price ? Number(form.price) : undefined,
        priceLabel: form.priceLabel || undefined,
        image: form.image,
        variants: parseVariants(form.variantsText),
        offer,
      };

      if (form.id) {
        await fetch(`/api/menu/${form.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      await loadItems();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      await loadItems();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">
            {form.id ? 'Edit Item' : 'Add Item'}
          </h2>
          {form.id && (
            <button
              onClick={resetForm}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
            <input
              list="category-options"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            />
            <datalist id="category-options">
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Price Label (optional)</label>
            <input
              value={form.priceLabel}
              onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              placeholder="MRP"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Image URL</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              rows={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Offer Type</label>
            <select
              value={form.offerType}
              onChange={(e) => setForm({ ...form, offerType: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <option value="none">None</option>
              <option value="bogo">Buy One Get One</option>
              <option value="percent">Percent Off</option>
              <option value="flat">Flat Off</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Offer Value</label>
            <input
              type="number"
              value={form.offerValue}
              onChange={(e) => setForm({ ...form, offerValue: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              disabled={form.offerType === 'none' || form.offerType === 'bogo'}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Offer Label (optional)</label>
            <input
              value={form.offerLabel}
              onChange={(e) => setForm({ ...form, offerLabel: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Variants (one per line: Name|Price)
          </label>
          <textarea
            value={form.variantsText}
            onChange={(e) => setForm({ ...form, variantsText: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            rows={3}
            placeholder="Small|199\nLarge|299"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold disabled:opacity-50"
          >
            {saving ? 'Saving...' : form.id ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu Items</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMenu.map((item) => (
            <div
              key={String(item.id)}
              className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    {offerLabel(item.offer) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <Tag size={12} /> {offerLabel(item.offer)}
                      </span>
                    )}
                  </div>
                  <p className="text-primary font-extrabold text-sm">
                    {typeof item.price === 'number' ? `₹${item.price}` : item.priceLabel || '—'}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {filteredMenu.length === 0 && (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No menu items found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
