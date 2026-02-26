'use client';

import { X, ExternalLink, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface OrderOnlineModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderOnlineModal({ isOpen, onClose }: OrderOnlineModalProps) {
    if (!isOpen) return null;

    const links = [
        {
            name: 'Zomato',
            url: 'https://www.zomato.com/ahmedabad/london-crust-pizza-c-g-road/order',
            color: 'bg-[#E23744]',
            icon: '/zomato_logo.png', // I'll use text/icon if image not available, but let's assume we want a premium look
            tagline: 'Order from our C.G. Road outlet'
        },
        {
            name: 'Swiggy',
            url: 'https://www.swiggy.com/city/ahmedabad/london-crust-pizza-navrangpura-rest1207302?utm_source=GooglePlaceOrder&utm_campaign=GoogleMap&is_retargeting=true&media_source=GooglePlaceOrder',
            color: 'bg-[#FC8019]',
            icon: '/swiggy_logo.png',
            tagline: 'Superfast delivery from Navrangpura'
        }
    ];

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-black/20 border-8 border-slate-50 relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 -mr-16 -mt-16 rounded-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 -ml-12 -mb-12 rounded-full" />

                <div className="relative z-10 p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-600 rounded-2xl rotate-6 flex items-center justify-center text-white shadow-xl">
                                <ShoppingBag size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Order Online</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select your favorite platform</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all duration-300"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative block w-full p-6 rounded-3xl ${link.color} text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl overflow-hidden`}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <span className="text-3xl font-black italic uppercase tracking-tighter block leading-none mb-1">{link.name}</span>
                                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{link.tagline}</span>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                        <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                            Prefer to visit us? <br />
                            Check our Navrangpura location for the best vibe.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
