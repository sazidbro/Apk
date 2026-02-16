
import React, { useState } from 'react';
import { useApp } from '../store';

const SecurityOverlay: React.FC = () => {
  const { state, setLocked } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === state.pin) {
          setLocked(false);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleClear = () => setPin('');

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20">
          <i className="fa-solid fa-shield-halved text-white text-3xl"></i>
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Enter your 4-digit PIN to unlock</p>
      </div>

      <div className="flex gap-4 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              pin.length > i 
                ? 'bg-blue-500 border-blue-500 scale-125' 
                : 'border-slate-700'
            } ${error ? 'bg-red-500 border-red-500 animate-bounce' : ''}`}
          ></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num)}
            className="w-16 h-16 rounded-full bg-slate-800 text-white text-2xl font-bold flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            {num}
          </button>
        ))}
        <button onClick={handleClear} className="w-16 h-16 flex items-center justify-center text-slate-400">
          <i className="fa-solid fa-delete-left text-xl"></i>
        </button>
        <button
          onClick={() => handlePress('0')}
          className="w-16 h-16 rounded-full bg-slate-800 text-white text-2xl font-bold flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          0
        </button>
        <div className="w-16 h-16"></div>
      </div>
      
      {error && <p className="mt-8 text-red-500 font-bold animate-pulse">Incorrect PIN</p>}
    </div>
  );
};

export default SecurityOverlay;
