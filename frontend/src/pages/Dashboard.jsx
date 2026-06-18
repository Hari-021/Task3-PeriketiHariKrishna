import React, { useState, useEffect } from 'react';
import api from '../api';
import { Utensils, ClipboardList, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    menuItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    preparingOrders: 0,
    servedOrders: 0,
    cancelledOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuRes, ordersRes] = await Promise.all([
          api.get('/menu'),
          api.get('/orders')
        ]);

        const menuItems = menuRes.data.length;
        const orders = ordersRes.data;

        setStats({
          menuItems,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'Pending').length,
          preparingOrders: orders.filter(o => o.status === 'Preparing').length,
          servedOrders: orders.filter(o => o.status === 'Served').length,
          completedOrders: orders.filter(o => o.status === 'Completed').length,
          cancelledOrders: orders.filter(o => o.status === 'Cancelled').length
        });
        setError(null);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Unable to retrieve POS dashboard statistics. Ensure that the FastAPI server is running on port 8000.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: 'Total Menu Items',
      value: stats.menuItems,
      icon: Utensils,
      color: 'from-orange-500/10 to-amber-500/5 text-orange-400 border-orange-500/20',
      description: 'Active menu entries'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ClipboardList,
      color: 'from-blue-500/10 to-indigo-500/5 text-blue-400 border-blue-500/20',
      description: 'Total cumulative orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'from-amber-500/10 to-yellow-500/5 text-amber-400 border-amber-500/20',
      description: 'Orders awaiting preparation'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20',
      description: 'Served and closed bills'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-8 h-8 border-2 border-t-orange-500 border-slate-800 rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Assembling analytics overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-wide">Operational Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">Real-time statistics and database counters.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-card p-5 rounded-2xl flex flex-col justify-between border bg-gradient-to-br ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</span>
                <div className="p-1.5 rounded-lg bg-slate-900/60 text-slate-300">
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-slate-100 tracking-tight">
                  {card.value}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Pipeline Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/40">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">
          Order Processing Queue
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Pending', count: stats.pendingOrders, bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
            { label: 'Preparing', count: stats.preparingOrders, bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
            { label: 'Served', count: stats.servedOrders, bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
            { label: 'Completed', count: stats.completedOrders, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
            { label: 'Cancelled', count: stats.cancelledOrders, bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400' }
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center ${item.bg}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{item.label}</span>
              <span className="text-xl font-extrabold mt-1.5">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
