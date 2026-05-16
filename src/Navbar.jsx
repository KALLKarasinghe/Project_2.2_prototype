import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser, toggleCart, cart } = useSystemStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-2 px-6 flex justify-between items-center text-xs sm:text-sm font-medium tracking-wide">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            +9470 345 7402
          </span>
          <span className="hidden sm:flex items-center gap-1 text-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            support@globalmedicine.com
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/special-medicine" className="hover:text-blue-200 cursor-pointer transition-colors">Special Medicine</Link>
          <span className="opacity-40">|</span>
          <span className="hover:text-blue-200 cursor-pointer transition-colors">Help Center</span>
        </div>
      </div>

      {/* Main Logo and Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center cursor-pointer">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Global Medicine Logo"
            className="h-14 md:h-16 w-auto object-contain"
          />
          <div className="flex flex-col ml-3 leading-tight">
            <span className="font-extrabold text-2xl md:text-3xl text-blue-900 tracking-tight">Global Medicine</span>
            <span className="font-semibold text-[10px] md:text-xs text-gray-500 tracking-widest uppercase mt-0.5">Healthcare Supply Chain</span>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex gap-4 items-center">
          {/* Navigation Links */}
          <nav className="hidden md:flex gap-6 items-center font-medium text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <Link to="/suppliers" className="hover:text-blue-600 transition-colors">Suppliers</Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link>
          </nav>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Cart Icon (only visible to pharmacies) */}
          {currentUser?.role?.toLowerCase() === 'pharmacy' && (
            <button onClick={toggleCart} className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-50 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce">{cart.length}</span>
              )}
            </button>
          )}

          {/* Auth-aware section */}
          {currentUser ? (
            /* ─── Logged In State ─────────────────────── */
            <div className="flex items-center gap-3">
              <NotificationBell />
              {/* User Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-full pl-2 pr-4 py-1.5 border border-blue-100 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-blue-900 max-w-[120px] truncate">
                    Hi, {currentUser.name?.split(' ')[0]}
                  </span>
                  <svg className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate capitalize">{currentUser.role} Account</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {/* Dashboard Link (if not pharmacy/customer) */}
                      {(currentUser.role === 'admin' || currentUser.role === 'supplier' || currentUser.role === 'company') && (
                        <Link to={currentUser.role === 'admin' ? '/admin' : '/supplier'} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          My Dashboard
                        </Link>
                      )}
                      
                      <Link to="/my-orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        My Orders
                      </Link>

                      <Link to="/membership" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Membership Plan
                      </Link>
                    </div>
                    <div className="p-2 border-t border-slate-50">
                      <button onClick={() => { handleSignOut(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ─── Logged Out State ────────────────────── */
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
