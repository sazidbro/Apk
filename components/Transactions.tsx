
import React, { useState } from 'react';
import { useApp } from '../store';
import { Category, TransactionType } from '../types';

const Transactions: React.FC = () => {
  const { state, addTransaction, deleteTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as TransactionType,
    category: Category.FOOD,
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = formData.type === 'expense' 
    ? [Category.FOOD, Category.TRANSPORT, Category.STUDY, Category.SHOPPING, Category.OTHERS]
    : [Category.SALARY, Category.FREELANCE, Category.GIFT, Category.OTHERS];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount))) return;
    
    // Check budget limit warning
    if (formData.type === 'expense') {
      const budget = state.budgets.find(b => b.category === formData.category);
      const spent = state.transactions
        .filter(t => t.category === formData.category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (budget && spent + Number(formData.amount) > budget.limit) {
        if (!confirm(`Warning: This will exceed your budget for ${formData.category}. Continue?`)) return;
      }
    }

    addTransaction({
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      note: formData.note,
      date: formData.date,
    });
    setShowModal(false);
    setFormData(prev => ({ ...prev, amount: '', note: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">History</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
        >
          <i className="fa-solid fa-plus"></i>
          Add New
        </button>
      </div>

      <div className="space-y-3">
        {state.transactions.length > 0 ? (
          state.transactions.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 group transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                <i className={`fa-solid ${t.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t.category}</p>
                <p className="text-xs text-slate-400 truncate max-w-[120px]">{t.note || 'No description'}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-slate-800 dark:text-slate-100'}`}>
                  {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => deleteTransaction(t.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400">
            <i className="fa-solid fa-receipt text-4xl mb-3 opacity-20"></i>
            <p>No transactions found.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white">Add Transaction</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: Category.FOOD })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600' : 'text-slate-400'}`}
                >Expense</button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: Category.SALARY })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white dark:bg-slate-600 shadow-sm text-green-600' : 'text-slate-400'}`}
                >Income</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount (৳)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 pl-8 pr-4 font-bold text-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="What was this for?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all mt-4"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
