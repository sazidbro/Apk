
import React, { useMemo, useState } from 'react';
import { useApp } from '../store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Category } from '../types';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [viewDate, setViewDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return viewDate.getMonth() === now.getMonth() && viewDate.getFullYear() === now.getFullYear();
  }, [viewDate]);

  const stats = useMemo(() => {
    const monthTransactions = state.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    const categoryData = Object.values(Category)
      .map(cat => ({
        name: cat,
        value: monthTransactions
          .filter(t => t.type === 'expense' && t.category === cat)
          .reduce((sum, t) => sum + t.amount, 0)
      }))
      .filter(d => d.value > 0);

    return { income, expenses, balance, savingsRate, categoryData };
  }, [state.transactions, viewDate]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#94a3b8'];

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Month Navigator */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <button 
          onClick={() => changeMonth(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="text-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{monthName}</h3>
          {!isCurrentMonth && (
            <button 
              onClick={() => setViewDate(new Date())}
              className="text-[10px] text-blue-500 font-bold uppercase tracking-wider"
            >
              Go to Today
            </button>
          )}
        </div>
        <button 
          onClick={() => changeMonth(1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 dark:shadow-none">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-blue-100 text-sm font-medium opacity-80 uppercase tracking-wider">
              {isCurrentMonth ? 'Total Balance' : `${monthName} Balance`}
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              ৳{stats.balance.toLocaleString()}
            </h2>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <i className="fa-solid fa-vault text-xl"></i>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-arrow-down text-green-400 text-xs"></i>
            </div>
            <div>
              <p className="text-blue-100 text-[10px] uppercase font-bold tracking-tighter opacity-70">Income</p>
              <p className="font-semibold text-sm">৳{stats.income.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 bg-red-400/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-arrow-up text-red-400 text-xs"></i>
            </div>
            <div>
              <p className="text-blue-100 text-[10px] uppercase font-bold tracking-tighter opacity-70">Expense</p>
              <p className="font-semibold text-sm">৳{stats.expenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Metric */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Savings Ratio</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${stats.savingsRate > 20 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {stats.savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, stats.savingsRate))}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          {isCurrentMonth ? 'Goal: 20% savings.' : `Monthly achievement: ${stats.savingsRate.toFixed(0)}%`}
        </p>
      </div>

      {/* Category Breakdown Chart */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Spending breakdown</h3>
        <div className="h-48">
          {stats.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   formatter={(value: number) => `৳${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No expenses for this month.
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-2 mt-2">
           {stats.categoryData.map((d, i) => (
             <div key={d.name} className="flex items-center gap-2 text-xs">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
               <span className="text-slate-500 truncate">{d.name}</span>
               <span className="font-bold text-slate-700 dark:text-slate-300 ml-auto">৳{d.value}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
