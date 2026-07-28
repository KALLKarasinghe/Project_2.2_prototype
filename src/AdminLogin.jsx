import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginUser } = useSystemStore();
  const [adminUsername, setAdminUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!adminUsername.trim()) newErrors.adminUsername = 'Username is required.';
    if (!password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = await loginUser({ email: adminUsername, password: password });
      if (data.success) {
        if (data.user.role.toLowerCase() !== 'admin') {
          toast.error('This portal is restricted to Administrators only.');
          return;
        }
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid Admin Credentials. Please verify your details.');
    }
  };

  // determine class for username input
  let usernameClass = "w-full bg-slate-950 border text-white rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder-slate-600 ";
  if (errors.adminUsername) {
    usernameClass += "border-red-500";
  } else {
    usernameClass += "border-slate-800";
  }

  // show username error if any
  let usernameError = null;
  if (errors.adminUsername) {
    usernameError = <p className="text-red-400 text-xs mt-1.5 font-semibold">{errors.adminUsername}</p>;
  }

  // determine class for password input
  let passwordClass = "w-full bg-slate-950 border text-white rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder-slate-600 ";
  if (errors.password) {
    passwordClass += "border-red-500";
  } else {
    passwordClass += "border-slate-800";
  }

  // show password error if any
  let passwordError = null;
  if (errors.password) {
    passwordError = <p className="text-red-400 text-xs mt-1.5 font-semibold">{errors.password}</p>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative font-sans text-slate-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40vw] h-[40vw] bg-rose-900 rounded-full mix-blend-color-dodge filter blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40vw] h-[40vw] bg-purple-900 rounded-full mix-blend-color-dodge filter blur-[100px] opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Global Medicine Logo" className="w-24 h-24 object-contain drop-shadow-2xl opacity-90 brightness-200" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Access</h1>
          <p className="text-slate-400 font-medium mt-2">Restricted Administrator Portal</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8">
          <form onSubmit={handleAdminSignIn} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Admin Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => { setAdminUsername(e.target.value); setErrors(p => ({ ...p, adminUsername: '' })); }}
                  className={usernameClass}
                  placeholder="e.g. Linuka"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              </div>
              {usernameError}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  className={passwordClass}
                  placeholder="••••••••••••"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
              </div>
              {passwordError}
            </div>

            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-4 py-3.5 shadow-md shadow-rose-900/50 transform hover:-translate-y-0.5 transition-all active:scale-95 mt-2 border border-rose-500">
              Authenticate
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <Link to="/login" className="text-slate-500 hover:text-slate-300 font-medium flex items-center justify-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Standard Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
