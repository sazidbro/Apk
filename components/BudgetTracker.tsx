
import React from 'react';
import { useApp } from '../store';
import { Category } from '../types';

const BudgetTracker: React.FC = () => {
  const { state, updateBudget } = useApp();

  const getSpent = (cat: Category) => {
    return state.transactions
      .filter(t => t.category === cat && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateProgress = (spent: number, limit: number) => {
    return Math.min(100, (spent / limit) * 100);
  };

  const getProgressColor = (percent: number) => {
    if (percent < 70) return 'bg-green-500';
    if (percent < 90) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleUpdate = (cat: Category, currentLimit: number) => {
    const val = prompt(`Set new limit for ${cat} (৳):`, currentLimit.toString());
    if (val !== null && !isNaN(Number(val))) {
      updateBudget(cat, Number(val));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-4 transition-colors">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
          <i className="fa-solid fa-lightbulb text-xl"></i>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Smart Suggestion</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Based on your income, try the 50-30-20 rule to maximize savings.</p>
        </div>
      </div>

      <div className="space-y-4">
        {state.budgets.map((b) => {
          const spent = getSpent(b.category);
          const percent = calculateProgress(spent, b.limit);
          
          return (
            <div key={b.category} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{b.category}</h3>
                  <p className="text-xs text-slate-400">
                    ৳{spent.toLocaleString()} of ৳{b.limit.toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => handleUpdate(b.category, b.limit)}
                  className="text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(percent)}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <span>{percent.toFixed(0)}% Used</span>
                <span className={percent > 90 ? 'text-red-500' : ''}>
                  {b.limit - spent > 0 ? `৳${(b.limit - spent).toLocaleString()} Left` : 'Exceeded'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetTracker;
