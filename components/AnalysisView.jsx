
import React from 'react';
import ProgressBar from './ProgressBar.jsx';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Download, RotateCcw, CheckCircle, AlertCircle, Sparkles, FileText, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalysisView = ({ result, onReset }) => {
  const chartData = [
    { subject: 'Overall', A: result.overallScore },
    { subject: 'ATS', A: result.atsCompatibility },
    { subject: 'Format', A: result.formattingScore },
    { subject: 'Content', A: result.contentQualityScore },
    { subject: 'Keywords', A: Math.round((result.matchedKeywords.length / (result.matchedKeywords.length + result.missingKeywords.length || 1)) * 100) },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print bg-white p-6 rounded-3xl border border-slate-200">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Audit Report</h2>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-2"><Download className="w-4 h-4" /> Save PDF</button>
          <button onClick={onReset} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Restart</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-8"><Target className="w-5 h-5 text-indigo-500" /> Competency Matrix</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid stroke="#f1f5f9" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <Radar dataKey="A" stroke="#4f46e5" strokeWidth={3} fill="#4f46e5" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center gap-8">
            <ProgressBar value={result.overallScore} label="Match Rate" size="lg" />
            <div className="grid grid-cols-2 w-full gap-4 pt-4 border-t">
              <div className="text-center"><div className="text-2xl font-black">{result.atsCompatibility}%</div><div className="text-[10px] text-slate-400 uppercase font-bold">ATS</div></div>
              <div className="text-center"><div className="text-2xl font-black">{result.formattingScore}%</div><div className="text-[10px] text-slate-400 uppercase font-bold">Format</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600"><FileText /></div><h3 className="text-2xl font-black">Executive Summary</h3></div>
        <p className="text-slate-600 text-lg leading-relaxed mb-12">{result.summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Strengths</h4>
            <ul className="space-y-4">{result.strengths.map((s, i) => <li key={i} className="flex gap-4 p-4 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-sm">{s}</li>)}</ul>
          </div>
          <div><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Quick Wins</h4>
            <ul className="space-y-4">{result.improvements.map((im, i) => <li key={i} className="flex gap-4 p-4 rounded-2xl bg-amber-50 text-amber-800 font-bold text-sm">{im}</li>)}</ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisView;
