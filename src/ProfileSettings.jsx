import React, { useState, useEffect } from 'react';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { currentUser, updateUserContext } = useSystemStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bank_details: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bank_details: currentUser.bank_details || '',
      });
      setPreviewPic(currentUser.profile_pic ? `http://localhost${currentUser.profile_pic}` : null);
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    const data = new FormData();
    data.append('user_id', currentUser.id);
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('bank_details', formData.bank_details);
    if (profilePic) {
      data.append('profile_pic', profilePic);
    }

    try {
      const response = await fetch('http://localhost/pharma_backend/api/profile.php', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Profile updated successfully!");
        updateUserContext(result.user);
      } else {
        toast.error(result.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Network error. Could not update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // profile display logic
  let profileDisplay = null;
  if (previewPic) {
    profileDisplay = <img src={previewPic} alt="Profile" className="w-full h-full object-cover" />;
  } else {
    profileDisplay = <span className="text-5xl font-bold text-slate-300">{formData.name.charAt(0) || '?'}</span>;
  }

  // button content logic
  let buttonContent = null;
  if (isSubmitting) {
    buttonContent = 'Saving...';
  } else {
    buttonContent = (
      <>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        Save Changes
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 pr-20">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Profile Settings</h2>
          <p className="text-blue-100 mt-2 font-medium">Manage your personal or company details and payment preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4 md:w-1/3 border-r border-slate-100 pr-4">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 shadow-xl flex items-center justify-center">
                  {profileDisplay}
                </div>
                <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-sm font-medium text-slate-500 text-center">Click the camera icon to upload a logo or profile picture.</p>
            </div>

            {/* Details Section */}
            <div className="flex-1 space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name / Company Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium" placeholder="+94 77 ..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Role / Account Type</label>
                    <input type="text" value={currentUser?.role || ''} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-semibold cursor-not-allowed capitalize" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Registered Address</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium resize-none"></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 mt-8">Payment & Bank Details</h3>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Bank Account Information</label>
                    <p className="text-xs text-slate-500 mb-2">Used for processing withdrawals and payments.</p>
                    <textarea name="bank_details" value={formData.bank_details} onChange={handleInputChange} rows="3" placeholder="e.g. Bank of Ceylon, Acc No: 123456789, Branch: Colombo" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium resize-none"></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                  {buttonContent}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
