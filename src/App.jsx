import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SystemProvider, useSystemStore } from './SystemContext';
import Home from './Home';
import AdminDashboard from './AdminDashboard';
import Auth from './Auth';
import AdminLogin from './AdminLogin';

import SupplierDashboard from './SupplierDashboard';

import AgentDashboard from './AgentDashboard';
import CustomerDashboard from './CustomerDashboard';
import ProtectedRoute from './ProtectedRoute';
import Products from './Products';
import SuppliersList from './SuppliersList';
import About from './About';
import SpecialMedicine from './SpecialMedicine';
import MyOrders from './MyOrders';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <SystemProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontWeight: '600', fontSize: '14px' } }} />
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/suppliers" element={<SuppliersList />} />
            <Route path="/about" element={<About />} />
            <Route path="/special-medicine" element={<SpecialMedicine />} />
            <Route path="/my-orders" element={<MyOrders />} />

            <Route path="/login" element={<Auth />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/supplier" element={<ProtectedRoute><SupplierDashboard /></ProtectedRoute>} />
            <Route path="/agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/customer" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center text-slate-800">
                <h1 className="text-6xl font-black text-rose-500 mb-4">404</h1>
                <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
                <p className="text-slate-500 mb-6">The page you are looking for does not exist.</p>
                <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Go Home</Link>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </SystemProvider>
  );
}

export default App;
