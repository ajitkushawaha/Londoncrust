'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Lead {
  id: string;
  phone: string;
  consent: boolean;
  createdAt?: number;
  lastSeenAt?: number;
  lastTableId?: string;
  visits?: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/leads');
        const json = await res.json();
        if (json.ok) {
          setLeads(json.data || []);
        } else {
          setError(json.error || 'Failed to load leads');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load leads');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rows = useMemo(() => leads, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 uppercase italic">Customer Leads</h1>
        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-blue-100">
          {rows.length} Total Records
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center p-4">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-4xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No leads captured yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
            <div className="col-span-3">Mobile</div>
            <div className="col-span-2">Frequency</div>
            <div className="col-span-2">Consent</div>
            <div className="col-span-2">Table</div>
            <div className="col-span-3">Last Seen</div>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-12 gap-3 px-6 py-5 text-sm items-center hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-3 font-black text-slate-900 italic">{lead.phone}</div>
                <div className="col-span-2">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-xl font-bold text-[10px] uppercase border border-amber-100">
                    {lead.visits || 1} Visits
                  </span>
                </div>
                <div className="col-span-2">
                  {lead.consent ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                      <CheckCircle2 size={14} strokeWidth={3} /> WhatsApp OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-300 font-bold text-[10px] uppercase">
                      <XCircle size={14} strokeWidth={3} /> No Consent
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-slate-500 font-bold text-xs">{lead.lastTableId || '-'}</div>
                <div className="col-span-3 text-slate-400 font-medium text-xs">
                  {lead.lastSeenAt
                    ? new Date(lead.lastSeenAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
