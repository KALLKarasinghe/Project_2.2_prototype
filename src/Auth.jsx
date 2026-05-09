import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { registerUser, loginUser } = useSystemStore();
  const [isLogin, setIsLogin] = useState(true);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('');

  // Sign Up State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regLicense, setRegLicense] = useState(null);
  const [loginErrors, setLoginErrors] = useState({});
  const [regErrors, setRegErrors] = useState({});

  const handleSignIn = (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginEmail.trim()) errs.loginEmail = 'Email is required.';
    if (!loginPassword) errs.loginPassword = 'Password is required.';
    if (!loginRole) errs.loginRole = 'Please select your portal role.';
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setLoginErrors({});

    loginUser({ role: loginRole, email: loginEmail, name: loginEmail.split('@')[0] });
    toast.success(`Welcome! Redirecting to your ${loginRole} portal...`);

    switch (loginRole) {
      case 'Pharmacy': navigate('/pharmacy'); break;
      case 'Supplier': navigate('/supplier'); break;
      case 'Medical Agent': navigate('/agent'); break;
      default: break;
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const errs = {};
    if (!regName.trim()) errs.regName = 'Full name is required.';
    if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail)) errs.regEmail = 'A valid email is required.';
    if (!regPassword || regPassword.length < 6) errs.regPassword = 'Password must be at least 6 characters.';
    if (!regRole) errs.regRole = 'Please select a role.';
    if (regRole && !regLicense) errs.regLicense = 'A license document is required for this role.';
    if (Object.keys(errs).length) { setRegErrors(errs); return; }
    setRegErrors({});

    registerUser({ name: regName, email: regEmail, password: regPassword, role: regRole, licenseDocument: regLicense ? regLicense.name : null });
    setRegName(''); setRegEmail(''); setRegPassword(''); setRegRole(''); setRegLicense(null);
    toast.success('Registration submitted! Please wait for Admin approval.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/30 mb-4 transition-transform hover:scale-105">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Medicine</h1>
          <p className="text-slate-500 font-medium mt-1">Access your secure portal</p>
        </div>

        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-8">
          
          {/* Toggle Buttons */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl mb-8 relative">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${isLogin ? 'left-1' : 'left-[calc(50%+0.25rem)]'}`}
            ></div>
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${isLogin ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${!isLogin ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Create Account
            </button>
          </div>

          {/* Sign In Form */}
          {isLogin ? (
            <form onSubmit={handleSignIn} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginErrors(p => ({ ...p, loginEmail: '' })); }}
                  className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${loginErrors.loginEmail ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="you@example.com"
                />
                {loginErrors.loginEmail && <p className="text-red-500 text-xs mt-1 font-medium">{loginErrors.loginEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginErrors(p => ({ ...p, loginPassword: '' })); }}
                  className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${loginErrors.loginPassword ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="••••••••"
                />
                {loginErrors.loginPassword && <p className="text-red-500 text-xs mt-1 font-medium">{loginErrors.loginPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Portal Role</label>
                <div className="relative">
                  <select 
                    value={loginRole}
                    onChange={(e) => { setLoginRole(e.target.value); setLoginErrors(p => ({ ...p, loginRole: '' })); }}
                    className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer ${loginErrors.loginRole ? 'border-red-400' : 'border-slate-200'}`}
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Medical Agent">Medical Agent</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {loginErrors.loginRole && <p className="text-red-500 text-xs mt-1 font-medium">{loginErrors.loginRole}</p>}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</a>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-4 py-3.5 shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all active:scale-95 mt-6">
                Sign In to Portal
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => { setRegName(e.target.value); setRegErrors(p => ({ ...p, regName: '' })); }}
                  className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regName ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="John Doe"
                />
                {regErrors.regName && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => { setRegEmail(e.target.value); setRegErrors(p => ({ ...p, regEmail: '' })); }}
                  className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regEmail ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="you@example.com"
                />
                {regErrors.regEmail && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={regPassword}
                  onChange={(e) => { setRegPassword(e.target.value); setRegErrors(p => ({ ...p, regPassword: '' })); }}
                  className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regPassword ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="Min. 6 characters"
                />
                {regErrors.regPassword && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Role</label>
                <div className="relative">
                  <select 
                    required
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select a role</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Medical Agent">Medical Agent</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {regRole && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload License Document</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer bg-slate-50 relative">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            required 
                            onChange={(e) => setRegLicense(e.target.files[0])}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {regLicense ? regLicense.name : 'PDF, PNG, JPG up to 10MB'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-4 py-3.5 shadow-md transform hover:-translate-y-0.5 transition-all active:scale-95 mt-6">
                Submit Registration
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center mt-8">
          <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium flex items-center justify-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
