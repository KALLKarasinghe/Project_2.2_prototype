import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SystemProvider } from './SystemContext';

// Import all the page components
import Home from './Home';
import AdminDashboard from './AdminDashboard';
import Auth from './Auth';
import AdminLogin from './AdminLogin';
import SupplierDashboard from './SupplierDashboard';
import PharmacyDashboard from './PharmacyDashboard';
import AgentDashboard from './AgentDashboard';
import CustomerDashboard from './CustomerDashboard';
import ProtectedRoute from './ProtectedRoute';
import Products from './Products';
import SuppliersList from './SuppliersList';
import About from './About';
import SpecialMedicine from './SpecialMedicine';
import HelpCenter from './HelpCenter';
import MyOrders from './MyOrders';

import { Toaster } from 'react-hot-toast';

function App() {
  // Main app component rendering routes
  return (
    <SystemProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontWeight: '600', fontSize: '14px' } }} />
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/suppliers" element={<SuppliersList />} />
            <Route path="/about" element={<About />} />
            <Route path="/special-medicine" element={<SpecialMedicine />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/admin" element={<AdminLogin />} />
            
            {/* Protected Routes for different roles */}
            <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/supplier" element={<ProtectedRoute><SupplierDashboard /></ProtectedRoute>} />
            <Route path="/pharmacy" element={<ProtectedRoute><PharmacyDashboard /></ProtectedRoute>} />
            <Route path="/agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/customer" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </SystemProvider>
  );
}

export default App;
