import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { medicines, specialMedicines, logoutUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('special_request');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reqMedicine, setReqMedicine] = useState('');
  const [reqAgent, setReqAgent] = useState('');
  const [reqFile, setReqFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const agents = Array.from(new Set(['Global Health Oncology Agents', 'RareMeds Dispatch', 'Specialty Pharma Connect', ...(specialMedicines?.map(m => m.agentName) || [])]));

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          inlineData: {
            data: reader.result.split(',')[1],
            mimeType: file.type
          }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const analyzePrescription = async () => {
    if (!reqFile) {
      toast.error('Please upload a prescription first.');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      toast.error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to .env file.');
      return;
    }

    setIsAnalyzing(true);
    const toastId = toast.loading('AI is analyzing your prescription...');

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const imagePart = await fileToGenerativePart(reqFile);
      
      const prompt = `Analyze this medical prescription. 
We have a catalog of special critical care medicines available. Here is the JSON list of available medicines and their assigned agents:
${JSON.stringify(specialMedicines?.map(m => ({ name: m.name, usedFor: m.usedFor, agentName: m.agentName })) || [])}

Please identify the medicine requested in the prescription. If it matches or is closely related to any medicine in our catalog, recommend that medicine and its agent.
Respond strictly in JSON format without any markdown wrappers or code blocks:
{
  "medicineName": "Extracted or matched medicine name",
  "agentName": "The corresponding agentName from the catalog if matched, otherwise empty",
  "confidence": "High/Medium/Low",
  "reasoning": "Brief explanation of the match"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt, imagePart],
        config: {
            responseMimeType: "application/json"
        }
      });

      const resultText = response.text();
      const result = JSON.parse(resultText);

      if (result.medicineName) {
         setReqMedicine(result.medicineName);
      }
      if (result.agentName) {
         setReqAgent(result.agentName);
      }

      toast.success(`Analysis complete! ${result.reasoning}`, { id: toastId, duration: 5000 });
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze prescription.', { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };



  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const navItems = [
    { id: 'special_request', label: 'Special Requests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-sky-950 text-white flex flex-col shadow-xl transition-transform duration-300`}>
      <div className="p-5 border-b border-sky-900 flex items-center justify-between">
        <div><h2 className="text-lg font-black text-white">Patient Portal</h2><p className="text-xs text-sky-300 mt-0.5 uppercase tracking-wider">Global Medicine</p></div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-sky-300 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-sky-600 text-white shadow-md' : 'text-sky-200 hover:text-white hover:bg-sky-800'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-sky-900">
        <button onClick={handleLogout} className="flex items-center gap-3 text-sky-200 hover:text-white w-full px-4 py-3 rounded-xl font-medium hover:bg-sky-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <span className="font-bold text-slate-800">Patient Portal</span>
        </div>
        <div className="p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Request Specialized Treatment</h1>
            <p className="text-slate-500 mt-1">Submit your prescription securely to our verified Medical Agents.</p>
          </header>

          {activeTab === 'special_request' && (
            <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-sky-50/30">
                <h2 className="text-xl font-bold text-slate-800">New Special Request</h2>
                <p className="text-slate-500 mt-1 text-sm">Submit your prescription for high-tier or restricted medications.</p>
              </div>
              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Upload Valid Prescription <span className="text-red-500">*</span></label>
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-sky-400 hover:bg-sky-50/30 transition-colors cursor-pointer border-slate-300 bg-slate-50`}>
                    <svg className="mx-auto h-10 w-10 text-slate-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <label htmlFor="rx-upload" className="cursor-pointer text-sky-600 font-semibold hover:text-sky-700 text-sm">
                      {reqFile ? reqFile.name : <span>Click to upload <span className="text-slate-400 font-normal">or drag and drop</span></span>}
                    </label>
                    <input id="rx-upload" type="file" className="sr-only" onChange={e => setReqFile(e.target.files[0])} />
                    {!reqFile && <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>}
                  </div>

                  <div className="mt-3">
                    <button 
                      type="button" 
                      onClick={analyzePrescription}
                      disabled={isAnalyzing || !reqFile}
                      className={`w-full font-bold py-2.5 px-4 rounded-xl border transition-colors flex items-center justify-center gap-2 ${reqFile ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          {reqFile ? 'Analyze Prescription' : 'Upload prescription to use AI Analysis'}
                        </>
                      )}
                    </button>
                  </div>

                  {reqMedicine && reqAgent && (
                    <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Analysis Result
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Identified Medicine</p>
                          <p className="text-lg font-black text-slate-800">{reqMedicine}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Matched Agent</p>
                          <p className="text-lg font-black text-slate-800">{reqAgent}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
