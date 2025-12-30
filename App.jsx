
import React, { useState, useEffect } from 'react';
import { analyzeResume } from './services/geminiService.js';
import AnalysisView from './components/AnalysisView.jsx';
import { FileUp, Search, Briefcase, ChevronRight, Zap, ShieldCheck, Sparkles, Loader2, AlertCircle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Status Constants
const STATUS = {
  IDLE: 'IDLE',
  ANALYZING: 'ANALYZING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};

const App = () => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const loadingMessages = [
    "Scanning document structure...",
    "Extracting technical competencies...",
    "Comparing keywords with Job Description...",
    "Benchmarking against industry standards...",
    "Formatting professional recommendations..."
  ];

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        setNeedsApiKey(true);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval;
    if (status === STATUS.ANALYZING) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        setResumeFile({
          base64,
          mimeType: file.type,
          name: file.name
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('A resume file is required.');
      return;
    }

    setStatus(STATUS.ANALYZING);
    setError(null);

    try {
      const analysis = await analyzeResume(resumeFile, jobDescription);
      setResult(analysis);
      setStatus(STATUS.COMPLETED);
    } catch (err) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes("Requested entity was not found")) {
        setError("API Key configuration error. Please refresh your project connection.");
        setNeedsApiKey(true);
      } else {
        setError(msg || 'An unexpected error occurred.');
      }
      setStatus(STATUS.ERROR);
    }
  };

  const reset = () => {
    setStatus(STATUS.IDLE);
    setResumeFile(null);
    setJobDescription('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
              Resume<span className="text-indigo-600">AI</span>
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-md align-top">Pro</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {needsApiKey && (
              <button onClick={handleSelectKey} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                <Key className="w-3.5 h-3.5" /> Connect Cloud
              </button>
            )}
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">Sign In</button>
          </div>
        </div>
      </header>

      <main className="flex-grow py-16">
        <AnimatePresence mode="wait">
          {status === STATUS.COMPLETED && result ? (
            <AnalysisView key="result" result={result} onReset={reset} />
          ) : status === STATUS.ANALYZING ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center p-12 space-y-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-600 animate-pulse" /></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{loadingMessages[loadingStep]}</h3>
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-16 px-6">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase border border-indigo-100"><Zap className="w-3 h-3" /> Gemini 3 Pro Powered</div>
                <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-tight">Optimize your <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">career</span>.</h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Beat applicant tracking systems with AI-driven keyword matching and professional resume auditing.</p>
              </div>

              <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-8 sm:p-12 space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">1</div><label className="text-lg font-bold">Resume Upload</label></div>
                      <div className={`relative border-2 border-dashed rounded-3xl p-10 group ${resumeFile ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
                        <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="flex flex-col items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${resumeFile ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'}`}><FileUp className="w-8 h-8" /></div>
                          <p className="font-bold text-slate-800">{resumeFile ? resumeFile.name : "Drop or click to upload"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">2</div><label className="text-lg font-bold">Job Description</label></div>
                      <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the JD here..." className="w-full h-56 p-6 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none resize-none font-medium bg-slate-50/30" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-6 pt-6">
                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 w-full max-w-xl"><AlertCircle className="w-5 h-5 shrink-0" /><span className="text-sm font-bold">{error}</span></div>}
                    <button onClick={handleAnalyze} disabled={!resumeFile || needsApiKey} className={`w-full sm:w-80 py-5 rounded-2xl font-black text-lg tracking-tight shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${!resumeFile || needsApiKey ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white'}`}>
                      <Search className="w-5 h-5" /> Run AI Analysis
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer className="bg-white border-t border-slate-200 py-12 text-center text-slate-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} ResumeAI Pro. Verified AI Security.
      </footer>
    </div>
  );
};

export default App;
