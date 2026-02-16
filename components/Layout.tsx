
import React, { useState, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../store';

const Layout: React.FC = () => {
  const location = useLocation();
  const { state, updateUser } = useApp();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(state.user.name);
  const [tempAvatar, setTempAvatar] = useState(state.user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { path: '/', icon: 'fa-chart-pie', label: 'Home' },
    { path: '/transactions', icon: 'fa-list-ul', label: 'Items' },
    { path: '/budget', icon: 'fa-wallet', label: 'Budget' },
    { path: '/analytics', icon: 'fa-chart-line', label: 'Charts' },
    { path: '/goals', icon: 'fa-bullseye', label: 'Goals' },
    { path: '/settings', icon: 'fa-cog', label: 'Settings' },
  ];

  const getPageTitle = () => {
    const item = navItems.find(n => n.path === location.pathname);
    return item ? item.label : 'FinTrack Pro';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    updateUser({ name: tempName, avatar: tempAvatar });
    setShowProfileModal(false);
  };

  return (
    <div className="pb-24 max-w-md mx-auto relative min-h-screen shadow-2xl bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Welcome, {state.user.name}</p>
        </div>
        <button 
          onClick={() => setShowProfileModal(true)}
          className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform active:scale-90"
        >
          {state.user.avatar ? (
            <img src={state.user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <i className="fa-solid fa-user text-slate-400"></i>
          )}
        </button>
      </header>

      <main className="px-6 py-4 animate-in fade-in duration-500">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-3 flex justify-around items-center z-50 transition-colors duration-300">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'
              }`
            }
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold dark:text-white">Your Profile</h3>
              <p className="text-sm text-slate-400 mt-1">Personalize your finance assistant</p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div 
                className="relative group cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  {tempAvatar ? (
                    <img src={tempAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-camera text-slate-400 text-2xl"></i>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <i className="fa-solid fa-pencil text-white"></i>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              <div className="w-full">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-6 text-lg font-semibold focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProfile}
                  className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
