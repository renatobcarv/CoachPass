import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { AIChat } from './AIChat';
import { toast } from 'sonner';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-slate-50 flex">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-20 dark:bg-zinc-950/95 bg-white/95 backdrop-blur-md dark:border-zinc-800 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl dark:bg-zinc-900 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 dark:hover:bg-zinc-800 hover:bg-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span
              className="text-lg"
              style={{
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
              }}
            >
              CoachPass
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info('2 novas notificações', { description: 'Abra o dashboard para ver todas' })}
              className="w-9 h-9 rounded-xl dark:bg-zinc-900 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 dark:hover:bg-zinc-800 hover:bg-slate-200 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* AI Floating Chat */}
      <AIChat />
    </div>
  );
}