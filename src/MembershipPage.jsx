import React from 'react';
import Navbar from './Navbar';
import SubscriptionPanel from './SubscriptionPanel';
import { useSystemStore } from './SystemContext';
import { Navigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';

const MembershipPage = () => {
  const { currentUser } = useSystemStore();

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <CartSidebar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">Platform Membership</h1>
          <p className="text-slate-500 font-medium">Manage your subscription to access premium B2B features.</p>
        </div>
        <SubscriptionPanel currentUser={currentUser} />
      </main>
    </div>
  );
};

export default MembershipPage;
