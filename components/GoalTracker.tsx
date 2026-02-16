
import React, { useState } from 'react';
import { useApp } from '../store';

const GoalTracker: React.FC = () => {
  const { state, addGoal, updateGoal } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '' });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    addGoal({
      name: newGoal.name,
      targetAmount: Number(newGoal.target),
      currentAmount: 0,
    });
    setNewGoal({ name: '', target: '' });
    setShowAdd(false);
  };

  const handleAddProgress = (id: string, current: number, target: number) => {
    const val = prompt("Add to savings (৳):", "0");
    if (val !== null && !isNaN(Number(val))) {
      updateGoal(id, Math.min(target, current + Number(val)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Savings Goals</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="text-blue-600 font-bold text-sm"
        >
          <i className="fa-solid fa-plus mr-1"></i> New Goal
        </button>
      </div>

      {showAdd && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddGoal} className="space-y-3">
            <input 
              placeholder="Goal Name (e.g. New Laptop)" 
              className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 border-none dark:text-white"
              value={newGoal.name}
              onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
            />
            <input 
              type="number" 
              placeholder="Target Amount (৳)" 
              className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 border-none dark:text-white"
              value={newGoal.target}
              onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {state.goals.length > 0 ? (
          state.goals.map(g => {
            const percent = (g.currentAmount / g.targetAmount) * 100;
            return (
              <div key={g.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{g.name}</h3>
                    <p className="text-xs text-slate-400">Created {new Date(g.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleAddProgress(g.id, g.currentAmount, g.targetAmount)}
                    className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center transition-transform active:scale-90"
                  >
                    <i className="fa-solid fa-piggy-bank"></i>
                  </button>
                </div>

                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-blue-600">৳{g.currentAmount.toLocaleString()}</span>
                  <span className="text-slate-400">৳{g.targetAmount.toLocaleString()}</span>
                </div>

                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <div className="mt-2 text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest">
                  {percent.toFixed(0)}% Accomplished
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400">
            <i className="fa-solid fa-mountain text-4xl mb-3 opacity-20"></i>
            <p>Define your dreams. Add a goal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
