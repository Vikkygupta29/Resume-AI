
import React, { useState, useEffect } from 'react';
import { AnalysisResult, FileData, AnalysisStatus } from './types';
import { analyzeResume } from './services/geminiService';
import AnalysisView from './components/AnalysisView';
import { FileUp, Search, Briefcase, ChevronRight, Zap, ShieldCheck, Sparkles, Loader2, AlertCircle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [resumeFile, setResumeFile] = useState<FileData | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    // Check if API key selection is required on mount
    const checkKey = async () => {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        setNeedsApiKey(true);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (status === AnalysisStatus.ANALYZING) {
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit. Please compress your resume.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
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
      setError('A resume file is required to proceed.');
      return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);

    try {
      const analysis = await analyzeResume(resumeFile, jobDescription);
      setResult(analysis);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || '';
      
      // Mandatory requirement: Handle "Requested entity was not found" by prompting key selection again
      if (errorMessage.includes("Requested entity was not found")) {
        setError("Your API key configuration needs to be refreshed. Please select a valid project.");
        setNeedsApiKey(true);
      } else {
        setError(errorMessage || 'The AI service is temporarily unavailable. Please try again later.');
      }
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AnalysisStatus.IDLE);
    setResumeFile(null);
    setJobDescription('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transform group-hover:rotate-6 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
              Resume<span className="text-indigo-600">AI</span>
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-md tracking-widest align-top">Pro</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {needsApiKey && (
              <button 
                onClick={handleSelectKey}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                Select API Project
              </button>
            )}
            <div className="flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest px-4">
              <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Enterprise</a>
            </div>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-16">
        <AnimatePresence mode="wait">
          {status === AnalysisStatus.COMPLETED && result ? (
            <AnalysisView key="result" result={result} onReset={reset} />
          ) : status === AnalysisStatus.ANALYZING ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center p-12 space-y-8"
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">AI at work...</h3>
                <div className="h-6 overflow-hidden">
                   <AnimatePresence mode="wait">
                    <motion.p 
                      key={loadingStep}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-slate-500 font-medium"
                    >
                      {loadingMessages[loadingStep]}
                    </motion.p>
                   </AnimatePresence>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xs">
                <motion.div 
                  className="h-full bg-indigo-600"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-16 px-6"
            >
              {/* API Key Selection Call-to-Action */}
              {needsApiKey && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900">API Key Selection Required</p>
                      <p className="text-sm text-amber-700">Please connect a billing-enabled Google Cloud project to use Gemini 3 Pro.</p>
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 underline font-semibold mt-1 inline-block">Learn about billing</a>
                    </div>
                  </div>
                  <button 
                    onClick={handleSelectKey}
                    className="px-6 py-3 bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all active:scale-95 whitespace-nowrap"
                  >
                    Select Project Key
                  </button>
                </motion.div>
              )}

              {/* Hero Header */}
              <div className="text-center space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100"
                >
                  <Zap className="w-3 h-3" />
                  Now with Gemini 3 Pro
                </motion.div>
                <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                  Optimize your <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">career path</span>.
                </h2>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                  Join 50,000+ professionals using AI to beat applicant tracking systems and secure more interviews.
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
                <div className="p-8 sm:p-12 space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Step 1: File Selection */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">1</div>
                        <label className="text-lg font-bold text-slate-800 tracking-tight">Upload Resume</label>
                      </div>
                      
                      <div className={`relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 group ${
                        resumeFile ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'
                      }`}>
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                            resumeFile ? 'bg-indigo-600 text-white scale-110' : 'bg-white text-slate-300 group-hover:text-indigo-500 group-hover:scale-105'
                          }`}>
                            <FileUp className="w-8 h-8" />
                          </div>
                          {resumeFile ? (
                            <div className="space-y-1">
                              <p className="text-indigo-900 font-bold text-lg truncate max-w-[280px]">{resumeFile.name}</p>
                              <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">Document Ready</p>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-1">
                                <p className="text-slate-800 font-bold text-lg">Drop resume here</p>
                                <p className="text-slate-400 text-sm font-medium">Click to browse your files</p>
                              </div>
                              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">PDF • DOCX • Images</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Context */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">2</div>
                        <label className="text-lg font-bold text-slate-800 tracking-tight">Job Description</label>
                      </div>
                      <div className="relative">
                        <textarea 
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the target job description here to get specific matching keywords..."
                          className="w-full h-56 p-6 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none text-slate-700 font-medium placeholder:text-slate-300 bg-slate-50/30"
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          {jobDescription.length > 0 ? `${jobDescription.length} chars` : 'Optional'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error & Action Area */}
                  <div className="flex flex-col items-center gap-6 pt-6">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 w-full max-w-xl"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-bold tracking-tight">{error}</span>
                      </motion.div>
                    )}

                    <button 
                      onClick={handleAnalyze}
                      disabled={!resumeFile || needsApiKey}
                      className={`group relative w-full sm:w-80 py-5 rounded-2xl font-black text-lg tracking-tight shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden ${
                        !resumeFile || needsApiKey
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <Search className="w-5 h-5" />
                      Run Analysis
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-xs text-slate-400 font-medium text-center">
                      Professional analysis powered by Google Gemini.<br/>
                      By clicking "Run Analysis", you agree to our processing of your professional data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust & Features Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12">
                {[
                  { icon: ShieldCheck, title: "Data Security", text: "Your files are encrypted and processed in-memory. We never store personal data.", color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: Briefcase, title: "Market Ready", text: "Benchmarks against over 10,000 real-world job categories for maximum relevance.", color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: Zap, title: "Instant Result", text: "Get your comprehensive 5-page analysis report in less than 20 seconds.", color: "text-amber-500", bg: "bg-amber-50" }
                ].map((feature, idx) => (
                  <div key={idx} className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:-rotate-6 transition-transform`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 no-print">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-900 font-black tracking-tighter text-xl">ResumeAI</span>
            </div>
            <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Career Blog</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 text-center text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} ResumeAI Pro. Built with cutting-edge AI for modern professionals.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
