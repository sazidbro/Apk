
import React, { useMemo } from 'react';
import { useApp } from '../store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

const Analytics: React.FC = () => {
  const { state } = useApp();

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const monthVal = d.getMonth();
      const yearVal = d.getFullYear();

      const monthTrans = state.transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === monthVal && td.getFullYear() === yearVal;
      });

      const income = monthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      months.push({ name: monthLabel, income, expense, balance: income - expense });
    }
    return months;
  }, [state.transactions]);

  return (
    <div className="space-y-8">
      {/* Monthly Trends */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Cash Flow (6M)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} 
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Income (৳)
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> Expense (৳)
          </div>
        </div>
      </div>

      {/* Savings Trend */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Savings Growth</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 transition-colors">
           <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Max Monthly Income</p>
           <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
             ৳{Math.max(...chartData.map(d => d.income)).toLocaleString()}
           </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800 transition-colors">
           <p className="text-[10px] uppercase font-bold text-rose-400 mb-1">Max Monthly Spent</p>
           <p className="text-xl font-bold text-rose-700 dark:text-rose-400">
             ৳{Math.max(...chartData.map(d => d.expense)).toLocaleString()}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
