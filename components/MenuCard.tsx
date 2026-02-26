'use client';

import Image from 'next/image';
import { Plus, Minus, Info, Flame, Star } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import type { Offer } from '@/lib/types';

interface MenuCardProps {
  id: string | number;
  name: string;
  description: string;
  price?: number;
  priceLabel?: string;
  image: string;
  offer?: Offer;
  onAddToCart?: (item: any) => void;
  quantity?: number;
  variants?: { name: string; price: number }[];
}

export default function MenuCard({
  id,
  name,
  description,
  price,
  priceLabel,
  image,
  offer,
  onAddToCart,
  quantity = 0,
  variants = [],
}: MenuCardProps) {
  const [qty, setQty] = useState(quantity);
  const [variantIndex, setVariantIndex] = useState(0);

  // Sync internal quantity with prop quantity
  useEffect(() => {
    setQty(quantity);
  }, [quantity]);

  const hasVariants = variants && variants.length > 0;
  const selectedVariant = hasVariants ? variants[variantIndex] : undefined;
  const unitPrice = hasVariants ? selectedVariant!.price : price ?? 0;
  const idKey = hasVariants ? `${id}:${selectedVariant!.name}` : String(id);

  const displayPrice = useMemo(() => {
    if (hasVariants && !onAddToCart) {
      const min = Math.min(...variants.map((v) => v.price));
      const max = Math.max(...variants.map((v) => v.price));
      return min === max ? `₹${min}` : `₹${min}–₹${max}`;
    }
    const p = hasVariants ? selectedVariant?.price : price;
    if (typeof p === 'number') return `₹${p}`;
    if (priceLabel) return priceLabel;
    return '—';
  }, [hasVariants, variants, onAddToCart, price, priceLabel, selectedVariant]);

  const handleAdd = () => {
    const newQty = qty + 1;
    setQty(newQty);
    if (onAddToCart) {
      onAddToCart({
        id: idKey,
        name: hasVariants ? `${name} - ${selectedVariant!.name}` : name,
        price: unitPrice,
        image,
        quantity: newQty,
        variantName: selectedVariant?.name,
      });
    }
  };

  const handleRemove = () => {
    if (qty > 0) {
      const newQty = qty - 1;
      setQty(newQty);
      if (onAddToCart) {
        onAddToCart({
          id: idKey,
          name: hasVariants ? `${name} - ${selectedVariant!.name}` : name,
          price: unitPrice,
          image,
          quantity: newQty,
          variantName: selectedVariant?.name,
        });
      }
    }
  };

  const offerLabel = useMemo(() => {
    if (!offer || offer.type === 'none') return null;
    if (offer.type === 'bogo') return offer.label || 'BOGO';
    if (offer.type === 'percent') return `${offer.value}% OFF`;
    if (offer.type === 'flat') return `₹${offer.value} OFF`;
    return null;
  }, [offer]);

  const isReadOnly = !onAddToCart;

  return (
    <div className={`bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 flex flex-col h-full group ${!isReadOnly ? 'hover:shadow-xl' : 'hover:border-blue-200'}`}>
      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {offerLabel && (
          <div className="absolute top-4 left-4 rounded-xl bg-red-600 px-3 py-1 text-[10px] font-black text-white shadow-lg uppercase tracking-widest italic animate-pulse z-10">
            {offerLabel}
          </div>
        )}

        {/* Overlay for Read-Only Mode */}
        {isReadOnly && (
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
            <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest">
              <Info size={14} className="text-blue-400" /> Swipe to see more
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/20 z-10">
          <span className="text-slate-900 font-black italic text-lg leading-none">{displayPrice}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-black text-slate-900 uppercase italic leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{name}</h3>
        </div>

        <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed mb-6 flex-grow line-clamp-3">
          {description}
        </p>

        <div className="space-y-4 mt-auto">
          {hasVariants && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {variants.map((v, idx) => (
                <button
                  key={v.name}
                  onClick={() => !isReadOnly && setVariantIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${variantIndex === idx
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                    } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {v.name} {isReadOnly && `• ₹${v.price}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex gap-3">
              <div className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase tracking-widest">
                <Flame size={12} fill="currentColor" /> Spicy
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                <Star size={12} fill="currentColor" /> Top Rated
              </div>
            </div>

            {!isReadOnly && (
              qty === 0 ? (
                <button
                  onClick={handleAdd}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  Add <Plus size={14} strokeWidth={3} />
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                  <button
                    onClick={handleRemove}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-red-600 shadow-sm active:scale-90 transition-all hover:bg-red-50"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <span className="text-sm font-black text-slate-900 w-4 text-center">{qty}</span>
                  <button
                    onClick={handleAdd}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-blue-600 shadow-sm active:scale-90 transition-all hover:bg-blue-50"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
