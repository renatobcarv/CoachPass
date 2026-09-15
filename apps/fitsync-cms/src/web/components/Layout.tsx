import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { AIChat } from './AIChat';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex bg-[#f3f4f9] text-[#000326] dark:bg-[#000326] dark:text-white">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 border-b border-[#000326]/10 bg-[#f3f4f9]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between dark:border-white/10 dark:bg-[#000137]/95">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl border border-[#000326]/10 bg-white flex items-center justify-center text-[#000326]/70 transition hover:bg-white dark:border-white/10 dark:bg-[#000346] dark:text-[#C5C5CE]"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#000326] dark:bg-white">
              <span className="text-white text-xs font-bold dark:text-[#000326]">C</span>
            </div>
            <span className="text-base font-bold tracking-tight text-[#000326] dark:text-white">CoachPass</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              className="relative w-9 h-9 rounded-xl border border-[#000326]/10 bg-white flex items-center justify-center text-[#000326]/60 transition dark:border-white/10 dark:bg-[#000346] dark:text-[#C5C5CE]"
            >
              <Sun
                className={`absolute w-4 h-4 transition-all duration-300 ${
                  isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <Moon
                className={`absolute w-4 h-4 transition-all duration-300 ${
                  isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                }`}
              />
            </button>
            <button
              onClick={() =>
                toast.info('2 novas notificações', { description: 'Abra o dashboard para ver todas' })
              }
              className="relative w-9 h-9 rounded-xl border border-[#000326]/10 bg-white flex items-center justify-center text-[#000326]/60 transition dark:border-white/10 dark:bg-[#000346] dark:text-[#C5C5CE]"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#000326] dark:bg-[#C5C5CE]" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden dark:bg-gradient-to-b dark:from-[#000326] dark:via-[#000137] dark:to-[#000346]">
          <Outlet />
        </main>
      </div>

      <AIChat />
    </div>
  );
}
