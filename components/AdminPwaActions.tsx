'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, LayoutDashboard } from 'lucide-react';

type DeferredInstall = BeforeInstallPromptEvent | null;

export default function AdminPwaActions() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstall>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const installAndRoute = async (path: string) => {
    if (!deferredPrompt) {
      router.push(path);
      return;
    }

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      router.push(path);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-800">
        <Download size={16} className="text-primary" />
        <p className="text-sm font-bold uppercase tracking-wide">Install App</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => installAndRoute('/admin/dashboard')}
          disabled={installing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-60"
        >
          <LayoutDashboard size={14} /> Dashboard App
        </button>
      </div>
      <p className="mt-2 text-[11px] font-medium text-slate-500">
        Single install with shortcuts and its work only in andriod. Authentication is enforced per protected route.
      </p>
    </div>
  );
}
