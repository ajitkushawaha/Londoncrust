'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuCard from '@/components/MenuCard';
import { menuItems as seedItems } from '@/lib/mockData';
import type { MenuItem } from '@/lib/types';
import {
  Search,
  X,
  MapPin,
  SearchCheck,
  Utensils,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Flame,
  Star as StarIcon
} from 'lucide-react';

export default function MenuPage() {
  const [viewMode, setViewMode] = useState<'classic' | 'grid'>('classic');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items, setItems] = useState<MenuItem[]>(seedItems as any);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showBottomFilter, setShowBottomFilter] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBottomFilter(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const allowedCategories = ['All', 'Grilled Sandwich', 'Maggi', 'Dessert', 'Momo', 'Burger', 'Club Sandwich'];

  const categories = useMemo(() => allowedCategories, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const isInCategoryList = allowedCategories.includes(item.category || '');
      return (selectedCategory === 'All' ? isInCategoryList : matchesCategory) && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Group items for Classic View
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

  const CategoryList = ({ isBottom = false }) => (
    <div className={`flex gap-2 overflow-x-auto whitespace-nowrap py-4 px-4 scrollbar-hide max-w-4xl mx-auto ${isBottom ? 'justify-center font-black' : ''}`}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => {
            setSelectedCategory(category);
            setSearchQuery('');
            if (isBottom) window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-tight transition-all border-2 ${selectedCategory === category
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col selection:bg-red-100 selection:text-red-700 ${viewMode === 'classic' ? 'bg-[#fdfbf6]' : 'bg-slate-50'}`}>
      <Navbar />

      <main className="grow pt-20 pb-32">
        {/* --- Iconic Header --- */}
        <section className="bg-red-600 px-4 pt-12 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/london_ahmedabad_mural_1772121945432.png')] bg-repeat bg-size-[200px] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto relative z-10 space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase leading-none tracking-tighter">
                London Crust <br /> <span className="text-blue-200">Digital Menu</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <p className="text-red-100 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <MapPin size={14} strokeWidth={3} /> Navrangpura, Ahmedabad
                </p>
                <span className="hidden sm:block text-white/30">•</span>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Kitchen Live</span>
                </div>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="grow h-14 bg-white rounded-2xl flex items-center justify-between px-6 text-slate-900 border-4 border-slate-900 shadow-[8px_8px_0px_#1e293b] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <span className="font-black uppercase text-xs tracking-widest text-slate-400">Search for cravings...</span>
                <Search size={22} strokeWidth={3} />
              </button>

              <div className="flex bg-slate-900 p-1.5 rounded-2xl shadow-xl">
                <button
                  onClick={() => setViewMode('classic')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'classic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <ListIcon size={16} strokeWidth={3} /> Journal
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <LayoutGrid size={16} strokeWidth={3} /> Grid
                </button>
              </div>
            </div>

            {isSearchVisible && (
              <div className="max-w-xl mx-auto relative animate-in zoom-in duration-300">
                <input
                  type="text"
                  placeholder="Search pizzas, burgers, momos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl px-6 font-black placeholder:text-slate-600 border-4 border-blue-600 shadow-2xl focus:outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>
        </section>

        {/* --- Category Strip --- */}
        <div className={`relative z-40 bg-white border-b border-slate-100 transition-opacity duration-300 ${showBottomFilter ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <CategoryList />
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">

          {viewMode === 'grid' ? (
            /* --- Grid View --- */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="relative">
                  <MenuCard
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    priceLabel={item.priceLabel}
                    image={item.image}
                    variants={item.variants}
                    offer={item.offer}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* --- Classic View (Printed Style) --- */
            <div className="space-y-20 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
                {Object.entries(groupedItems).map(([category, catItems], idx) => (
                  <div key={category} className="space-y-6">
                    {/* Section Header - Rounded Bar Style */}
                    <div className={`py-4 px-8 rounded-full shadow-lg transform -rotate-1 mb-8 ${idx % 2 === 0 ? 'bg-blue-600' : 'bg-red-600'}`}>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter text-center">
                        {category}
                      </h2>
                    </div>

                    <div className="space-y-6 px-4">
                      {catItems.map(item => (
                        <div key={item.id} className="group cursor-default">
                          <div className="flex justify-between items-end gap-4 mb-1">
                            <div className="flex flex-col">
                              <h3 className="font-black text-slate-800 uppercase italic tracking-tight group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h3>
                              {item.variants && (
                                <div className="flex gap-2 mt-1">
                                  {item.variants.map(v => (
                                    <span key={v.name} className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-1.5 py-0.5 rounded">
                                      {v.name} • ₹{v.price}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="grow border-b-2 border-slate-200 border-dotted mb-1 mx-2"></div>
                            <span className="font-black text-xl italic text-slate-900 whitespace-nowrap">
                              {item.price ? `₹${item.price}` : item.priceLabel}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed max-w-[85%]">
                            {item.description}
                          </p>
                          <div className="flex gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-widest">
                              <Flame size={10} fill="currentColor" /> Signature
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest">
                              <StarIcon size={10} fill="currentColor" /> Best-Seller
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* "The Crust" Mural Motif Footer */}
              <div className="pt-20 border-t-8 border-double border-slate-100 flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl rotate-12 flex items-center justify-center text-white shadow-2xl">
                  <Utensils size={40} />
                </div>
                <div>
                  <h4 className="text-3xl font-black italic uppercase text-slate-900 tracking-tighter">London Crust Experience</h4>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Ahmedabad • CG Road • Navrangpura</p>
                </div>
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                <Utensils size={48} />
              </div>
              <p className="text-3xl font-black text-slate-900 uppercase italic mb-2">No results</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-6 px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase shadow-2xl hover:bg-red-700 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- Sleek Floating Category Bar (Appears on Scroll) --- */}
      <div className={`fixed bottom-8 inset-x-0 z-50 transition-all duration-700 transform ${showBottomFilter ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0 pointer-events-none'}`}>
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-red-600/95 backdrop-blur-2xl px-2 py-3 rounded-full shadow-[0_20px_50px_rgba(220,38,38,0.3)] border-2 border-white/20 overflow-hidden flex items-center">

            <div className="pl-5 pr-3 border-r border-white/10 shrink-0">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Menu</span>
            </div>

            <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchQuery('');
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === category
                      ? 'bg-white text-blue-600 shadow-xl scale-110'
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-red-600 to-transparent pointer-events-none rounded-r-full"></div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
