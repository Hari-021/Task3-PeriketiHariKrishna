import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, ChefHat } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', name: 'Dashboard', icon: LayoutDashboard },
    { to: '/menu', name: 'Menu Items', icon: UtensilsCrossed },
    { to: '/orders', name: 'Orders List', icon: ClipboardList },
  ];

  return (
    <aside className="w-64 h-screen glass-panel border-r border-slate-800/40 flex flex-col fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/40 flex items-center gap-3">
        <div className="p-2.5 bg-orange-600/10 rounded-xl border border-orange-500/20 text-orange-500">
          <ChefHat size={24} />
        </div>
        <div>
          <h1 className="font-extrabold text-lg bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent tracking-wide">
            GUSTO
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            POS Control Center
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                  isActive
                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 font-medium shadow-sm shadow-orange-500/5'
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:bg-slate-800/30'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="text-sm font-medium tracking-wide">{link.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-800/40 bg-slate-900/10">
        <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-semibold text-emerald-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SQLite Connected</span>
        </div>
      </div>
    </aside>
  );
}
