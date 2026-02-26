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
    <div>
      {loading && (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center p-4">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No leads yet.</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <div className="col-span-5">Mobile</div>
            <div className="col-span-2">Consent</div>
            <div className="col-span-2">Table</div>
            <div className="col-span-3">Last Seen</div>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-12 gap-3 px-5 py-4 text-sm text-slate-700"
              >
                <div className="col-span-5 font-semibold">{lead.phone}</div>
                <div className="col-span-2">
                  {lead.consent ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 size={16} /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                      <XCircle size={16} /> No
                    </span>
                  )}
                </div>
                <div className="col-span-2">{lead.lastTableId || '-'}</div>
                <div className="col-span-3 text-slate-500">
                  {lead.lastSeenAt
                    ? new Date(lead.lastSeenAt).toLocaleString()
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
