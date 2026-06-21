import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { registerUser, loginUser } = useSystemStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  // Sign Up State
  const [regRole, setRegRole] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Dynamic fields
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLicenseNo, setRegLicenseNo] = useState('');
  const [regRegistrationNo, setRegRegistrationNo] = useState('');
  const [regTerritory, setRegTerritory] = useState('');
  
  const [regErrors, setRegErrors] = useState({});

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotErrors, setForgotErrors] = useState({});

  const handleForgot = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!forgotEmail.trim()) errs.email = 'Email is required.';
    if (!forgotPassword || forgotPassword.length < 6) errs.password = 'New password must be at least 6 characters.';
    if (Object.keys(errs).length) { setForgotErrors(errs); return; }
    setForgotErrors({});

    try {
        const res = await fetch('http://localhost/pharma_backend/api/forgot_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: forgotEmail, new_password: forgotPassword })
        });
        const data = await res.json();
        if (data.success) {
            toast.success('Password reset successfully! You can now sign in.');
            setShowForgot(false);
            setIsLogin(true);
            setLoginEmail(forgotEmail);
            setForgotPassword('');
        } else {
            toast.error(data.error || 'Failed to reset password.');
        }
    } catch (err) {
        toast.error('Network error occurred.');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginEmail.trim()) errs.loginEmail = 'Email is required.';
    if (!loginPassword) errs.loginPassword = 'Password is required.';
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setLoginErrors({});

    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      if (data.success && data.user) {
        
        // Safety status check (though backend should also reject)
        const status = data.user.status?.toLowerCase();
        if (data.user.role !== 'admin') {
            if (status === 'pending') {
                toast.error('Your account is pending admin verification');
                return;
            } else if (status === 'rejected') {
                toast.error('Your account has been rejected by admin');
                return;
            }
        }

        toast.success(`Welcome back! You are now signed in.`);
        
        // Route based on role
        const role = data.user.role?.toLowerCase();
        if (role === 'admin') navigate('/admin');
        else if (role === 'supplier') navigate('/supplier');
        else if (role === 'agent') navigate('/agent');
        else if (role === 'customer') navigate('/customer');
        else navigate('/'); // Pharmacy or fallback
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const [regLicenseFile, setRegLicenseFile] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    const errs = {};
    
    if (!regRole) errs.regRole = 'Please select a role.';
    if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail)) errs.regEmail = 'A valid email is required.';
    if (!regPassword || regPassword.length < 6) errs.regPassword = 'Password must be at least 6 characters.';
    
    if (regRole) {
        if (!regName.trim()) errs.regName = 'Name is required.';
        if (['pharmacy', 'supplier', 'agent'].includes(regRole)) {
            if (!regLicenseFile) errs.regLicenseFile = 'A verification document is required.';
        }
        if (regRole === 'pharmacy') {
            if (!regLicenseNo.trim()) errs.regLicenseNo = 'License Number is required.';
            if (!regAddress.trim()) errs.regAddress = 'Address is required.';
        } else if (regRole === 'supplier') {
            if (!regRegistrationNo.trim()) errs.regRegistrationNo = 'BR Number is required.';
            if (!regAddress.trim()) errs.regAddress = 'Address is required.';
        } else if (regRole === 'agent') {
            if (!regTerritory.trim()) errs.regTerritory = 'Territory is required.';
        } else if (regRole === 'customer') {
            if (!regAddress.trim()) errs.regAddress = 'Address is required.';
        }
    }

    if (Object.keys(errs).length) { setRegErrors(errs); return; }
    setRegErrors({});

    const formData = new FormData();
    formData.append('email', regEmail);
    formData.append('password', regPassword);
    formData.append('role', regRole);
    formData.append('name', regName);
    formData.append('address', regAddress);
    formData.append('license_no', regLicenseNo);
    formData.append('registration_no', regRegistrationNo);
    formData.append('territory', regTerritory);
    
    if (regLicenseFile) {
        formData.append('license_file', regLicenseFile);
    }

    try {
        const res = await registerUser(formData);
        if (res && res.success) {
            // Reset form
            setRegEmail(''); setRegPassword(''); setRegRole(''); setRegName(''); 
            setRegAddress(''); setRegLicenseNo(''); setRegRegistrationNo(''); setRegTerritory('');
            setRegLicenseFile(null);
            
            if (res.status === 'approved' || res.status === 'Active' || regRole === 'customer') {
                toast.success('Registration successful! You can now sign in.');
            } else {
                toast.success('Registration submitted! Please wait for Admin approval.');
            }
            setIsLogin(true);
        }
    } catch (err) {
        toast.error(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10 my-8">
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
          
          {/* Toggle Buttons (hide if showing forgot password) */}
          {!showForgot && (
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
          )}

          {showForgot ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgot} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Reset Password</h3>
                <p className="text-sm text-slate-500">Enter your email and a new password.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registered Email</label>
                <input 
                  type="email" 
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); setForgotErrors(p => ({ ...p, email: '' })); }}
                  className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${forgotErrors.email ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="you@example.com"
                />
                {forgotErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{forgotErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                <input 
                  type="password" 
                  value={forgotPassword}
                  onChange={(e) => { setForgotPassword(e.target.value); setForgotErrors(p => ({ ...p, password: '' })); }}
                  className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${forgotErrors.password ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="••••••••"
                />
                {forgotErrors.password && <p className="text-red-500 text-xs mt-1 font-medium">{forgotErrors.password}</p>}
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-4 py-3.5 shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all active:scale-95 mt-6">
                Reset Password
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setShowForgot(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : isLogin ? (
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
              
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</button>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-4 py-3.5 shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all active:scale-95 mt-6">
                Sign In to Portal
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Role</label>
                <div className="relative">
                  <select 
                    value={regRole}
                    onChange={(e) => { setRegRole(e.target.value); setRegErrors(p => ({ ...p, regRole: '' })); }}
                    className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer ${regErrors.regRole ? 'border-red-400' : 'border-slate-200'}`}
                  >
                    <option value="" disabled>Select a role</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="supplier">Supplier</option>
                    <option value="agent">Medical Agent</option>
                    <option value="customer">Customer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {regErrors.regRole && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regRole}</p>}
              </div>

              {regRole && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        {regRole === 'supplier' ? 'Supplier Name' : regRole === 'pharmacy' ? 'Pharmacy Name' : 'Full Name'}
                    </label>
                    <input 
                    type="text" 
                    value={regName}
                    onChange={(e) => { setRegName(e.target.value); setRegErrors(p => ({ ...p, regName: '' })); }}
                    className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regName ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="Enter name"
                    />
                    {regErrors.regName && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regName}</p>}
                  </div>
              )}

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

              {/* Dynamic Role Fields */}
              {regRole === 'pharmacy' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">License Number</label>
                        <input 
                            type="text" 
                            value={regLicenseNo}
                            onChange={(e) => { setRegLicenseNo(e.target.value); setRegErrors(p => ({ ...p, regLicenseNo: '' })); }}
                            className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regLicenseNo ? 'border-red-400' : 'border-slate-200'}`}
                            placeholder="PHARM-XXXX"
                        />
                        {regErrors.regLicenseNo && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regLicenseNo}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Physical Address</label>
                        <textarea 
                            value={regAddress}
                            onChange={(e) => { setRegAddress(e.target.value); setRegErrors(p => ({ ...p, regAddress: '' })); }}
                            className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regAddress ? 'border-red-400' : 'border-slate-200'}`}
                            placeholder="Enter full address"
                            rows="2"
                        ></textarea>
                        {regErrors.regAddress && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regAddress}</p>}
                      </div>
                  </div>
              )}

              {regRole === 'supplier' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Registration (BR) Number</label>
                        <input 
                            type="text" 
                            value={regRegistrationNo}
                            onChange={(e) => { setRegRegistrationNo(e.target.value); setRegErrors(p => ({ ...p, regRegistrationNo: '' })); }}
                            className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regRegistrationNo ? 'border-red-400' : 'border-slate-200'}`}
                            placeholder="BR-XXXX"
                        />
                        {regErrors.regRegistrationNo && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regRegistrationNo}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Supplier Address</label>
                        <textarea 
                            value={regAddress}
                            onChange={(e) => { setRegAddress(e.target.value); setRegErrors(p => ({ ...p, regAddress: '' })); }}
                            className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regAddress ? 'border-red-400' : 'border-slate-200'}`}
                            placeholder="Enter supplier address"
                            rows="2"
                        ></textarea>
                        {regErrors.regAddress && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regAddress}</p>}
                      </div>
                  </div>
              )}

              {regRole === 'agent' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Territory</label>
                      <input 
                          type="text" 
                          value={regTerritory}
                          onChange={(e) => { setRegTerritory(e.target.value); setRegErrors(p => ({ ...p, regTerritory: '' })); }}
                          className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regTerritory ? 'border-red-400' : 'border-slate-200'}`}
                          placeholder="e.g. Western Province"
                      />
                      {regErrors.regTerritory && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regTerritory}</p>}
                  </div>
              )}

              {regRole === 'customer' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Delivery Address</label>
                      <textarea 
                          value={regAddress}
                          onChange={(e) => { setRegAddress(e.target.value); setRegErrors(p => ({ ...p, regAddress: '' })); }}
                          className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${regErrors.regAddress ? 'border-red-400' : 'border-slate-200'}`}
                          placeholder="Enter delivery address"
                          rows="2"
                      ></textarea>
                      {regErrors.regAddress && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regAddress}</p>}
                  </div>
              )}

              {['pharmacy', 'supplier', 'agent'].includes(regRole) && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Verification Document (Image/PDF)</label>
                      <input 
                          type="file" 
                          accept="image/*, .pdf"
                          onChange={(e) => { setRegLicenseFile(e.target.files[0]); setRegErrors(p => ({ ...p, regLicenseFile: '' })); }}
                          className={`w-full bg-slate-50 border text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${regErrors.regLicenseFile ? 'border-red-400' : 'border-slate-200'}`}
                      />
                      {regErrors.regLicenseFile && <p className="text-red-500 text-xs mt-1 font-medium">{regErrors.regLicenseFile}</p>}
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
