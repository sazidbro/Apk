
import React, { useState } from 'react';
import { useApp } from '../store';
import { GoogleGenAI } from '@google/genai';
import { Category } from '../types';

const Settings: React.FC = () => {
  const { state, setTheme, setPin, setLocked, importData } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const handleExport = () => {
    const data = JSON.stringify(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === 'string') {
          importData(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + digit;
      setPinInput(newPin);
      
      if (newPin.length === 4) {
        if (pinStep === 'create') {
          setFirstPin(newPin);
          setPinInput('');
          setPinStep('confirm');
        } else {
          if (newPin === firstPin) {
            setPin(newPin);
            setShowPinModal(false);
            setPinInput('');
            setPinStep('create');
            alert("Security PIN enabled successfully!");
          } else {
            alert("PINs do not match. Try again.");
            setPinInput('');
            setPinStep('create');
          }
        }
      }
    }
  };

  const removePin = () => {
    if (confirm("Are you sure you want to remove PIN protection?")) {
      setPin(null);
    }
  };

  const generateAIReport = async () => {
    if (!process.env.API_KEY) {
      alert("AI Insights require an API Key environment variable.");
      return;
    }

    setIsAiLoading(true);
    setAiAdvice(null);
    
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentMonthTrans = state.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = currentMonthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;

    const budgetStatus = state.budgets.map(b => {
      const spent = currentMonthTrans.filter(t => t.category === b.category && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return `${b.category}: Spent ৳${spent} of ৳${b.limit} budget.`;
    }).join('\n');

    const goalsSummary = state.goals.map(g => `${g.name}: ${((g.currentAmount/g.targetAmount)*100).toFixed(0)}% complete.`).join(', ');

    const prompt = `
      You are an expert Personal Finance Coach for a student in Bangladesh. 
      Analyze the user's "Income and Uses" for ${currentMonth}:
      - Total Monthly Income: ৳${income}
      - Total Monthly Expenses (Uses): ৳${expense}
      - Current Savings Rate: ${savingsRate}%
      
      Category Breakdown & Budgets:
      ${budgetStatus}
      
      Savings Goals:
      ${goalsSummary || 'No goals set yet.'}
      
      Based strictly on this data, provide 3 punchy, actionable advice points in bullet format. 
      Help the user optimize their "Uses" (spending) based on their "Income".
      Be encouraging but firm about overspending. Use BDT (৳) currency. 
      Keep it under 100 words total.
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAdvice(response.text || "I couldn't generate advice right now.");
    } catch (e) {
      setAiAdvice("Failed to connect to AI server. Check your internet.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalIncome = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const categoryTotals = Object.values(Category).map(cat => ({
    name: cat,
    total: state.transactions.filter(t => t.category === cat && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  })).filter(c => c.total > 0);

  return (
    <div className="space-y-6">
      {/* AI Advice Display Section */}
      {(aiAdvice || isAiLoading) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 shadow-sm animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
                {isAiLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
             </div>
             <h3 className="font-bold text-blue-900 dark:text-blue-300">Financial Insights</h3>
           </div>
           {isAiLoading ? (
             <p className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">Analyzing your income and uses...</p>
           ) : (
             <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
               {aiAdvice}
             </div>
           )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Intelligence</h3>
        <button 
          onClick={generateAIReport}
          disabled={isAiLoading}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-transform active:scale-95 disabled:opacity-70"
        >
          <i className="fa-solid fa-brain"></i>
          {isAiLoading ? 'Analyzing...' : 'Generate Smart AI Advice'}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Appearance</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div 
            onClick={() => setTheme(state.theme === 'light' ? 'dark' : 'light')}
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <i className={`fa-solid ${state.theme === 'light' ? 'fa-sun' : 'fa-moon'}`}></i>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</span>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors relative ${state.theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${state.theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Security</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div 
            onClick={state.pin ? removePin : () => setShowPinModal(true)}
            className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <i className="fa-solid fa-lock"></i>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">PIN Protection</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${state.pin ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
              {state.pin ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <div 
            onClick={() => setLocked(true)}
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600">
                <i className="fa-solid fa-power-off"></i>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Lock Application Now</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Data Management</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div onClick={handleExport} className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <i className="fa-solid fa-download"></i>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">Export Backup (JSON)</span>
          </div>
          <label className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <i className="fa-solid fa-upload"></i>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">Import Data</span>
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          </label>
          <div onClick={handlePrint} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">Print Professional Report</span>
          </div>
        </div>
      </div>

      <div className="pt-6 pb-4 text-center border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">FinTrack Pro v1.2.6</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
          Designed & Developed by <span className="text-blue-600">Sazid Moontasir</span>
        </p>
        <p className="text-[10px] text-slate-300 mt-1">Full Offline Mode Active</p>
      </div>

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="text-center mb-8">
               <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                 <i className="fa-solid fa-shield-halved text-2xl"></i>
               </div>
               <h3 className="text-xl font-bold dark:text-white">
                 {pinStep === 'create' ? 'Create a PIN' : 'Confirm your PIN'}
               </h3>
               <p className="text-sm text-slate-400 mt-1">Protect your financial data with a 4-digit code.</p>
             </div>

             <div className="flex justify-center gap-4 mb-10">
               {[0, 1, 2, 3].map(i => (
                 <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pinInput.length > i ? 'bg-indigo-500 border-indigo-500 scale-110' : 'border-slate-300 dark:border-slate-600'}`}></div>
               ))}
             </div>

             <div className="grid grid-cols-3 gap-4">
               {['1','2','3','4','5','6','7','8','9','C','0','X'].map(val => (
                 <button 
                   key={val}
                   onClick={() => {
                     if (val === 'C') setPinInput('');
                     else if (val === 'X') setShowPinModal(false);
                     else handlePinDigit(val);
                   }}
                   className={`h-14 rounded-2xl font-bold text-lg flex items-center justify-center transition-all active:scale-90 ${
                     val === 'X' ? 'text-red-500' : val === 'C' ? 'text-amber-500' : 'bg-slate-50 dark:bg-slate-700 dark:text-white hover:bg-indigo-50'
                   }`}
                 >
                   {val === 'X' ? <i className="fa-solid fa-times"></i> : val}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Professional Printable Report */}
      <div className="print-only fixed inset-0 bg-white text-slate-900 p-0 m-0 z-[-1] overflow-auto">
        <div className="max-w-4xl mx-auto p-12 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-blue-600 pb-8 mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">FINTRACK PRO</h1>
              <p className="text-lg text-blue-600 font-bold uppercase tracking-widest">Statement of Account</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Sazid Moontasir</p>
              <p className="text-slate-500 text-sm">Lead Developer</p>
              <p className="text-slate-400 text-[10px] mt-1 italic tracking-widest">EST. 2024</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
                 {state.user.avatar && <img src={state.user.avatar} className="w-full h-full object-cover" />}
               </div>
               <div>
                 <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">Prepared For</p>
                 <h2 className="text-2xl font-bold text-slate-900">{state.user.name}</h2>
                 <p className="text-xs text-slate-500 mt-1 font-medium italic">Private Financial Record</p>
               </div>
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-center">
               <p className="text-[10px] uppercase font-black opacity-60 tracking-[0.3em] mb-1">Report Period</p>
               <h3 className="text-xl font-bold">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
               <p className="text-[10px] mt-2 font-medium text-blue-400">Generated: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* AI Advice Print Section */}
          {aiAdvice && (
            <div className="mb-12 p-8 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-200">
              <h4 className="text-xs font-black uppercase text-blue-600 tracking-[0.3em] mb-4">Financial Advisor's Summary</h4>
              <div className="text-sm text-slate-800 leading-relaxed italic whitespace-pre-wrap">
                {aiAdvice}
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 border-2 border-slate-100 rounded-3xl">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Total Income</p>
              <h3 className="text-2xl font-black text-green-600">৳{totalIncome.toLocaleString()}</h3>
            </div>
            <div className="text-center p-6 border-2 border-slate-100 rounded-3xl">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Total Uses</p>
              <h3 className="text-2xl font-black text-red-500">৳{totalExpense.toLocaleString()}</h3>
            </div>
            <div className="text-center p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200">
              <p className="text-[10px] uppercase font-bold text-white/70 tracking-widest mb-3">Net Liquidity</p>
              <h3 className="text-2xl font-black text-white">৳{(totalIncome - totalExpense).toLocaleString()}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 border-t-2 border-slate-100 pt-10">
            {/* Breakdown */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] mb-6">Utilization Breakdown</h4>
              <div className="space-y-4">
                {categoryTotals.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-slate-600 font-bold">{cat.name}</span>
                      <span className="font-black text-slate-900">৳{cat.total.toLocaleString()}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-300" style={{ width: `${(cat.total / totalExpense) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] mb-6">Recent Ledger Activity</h4>
              <div className="space-y-4">
                 {state.transactions.slice(0, 12).map(t => (
                   <div key={t.id} className="flex justify-between items-start text-[11px] border-b border-slate-50 pb-2">
                     <div>
                       <p className="font-black text-slate-800 uppercase">{t.category}</p>
                       <p className="text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                     </div>
                     <p className={`font-black ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                       {t.type === 'income' ? '+' : '-'} ৳{t.amount.toLocaleString()}
                     </p>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-10 border-t-4 border-slate-100 text-center">
             <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">Private & Confidential Financial Document</p>
             <div className="mt-6 flex justify-center items-center gap-4 text-xs font-bold text-slate-400 italic">
               <span>FinTrack Pro</span>
               <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
               <span>Developed by Sazid Moontasir</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
