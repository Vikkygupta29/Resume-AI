
import React from 'react';
import { AnalysisResult } from '../types';
import ProgressBar from './ProgressBar';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from 'recharts';
import { Download, RotateCcw, CheckCircle, AlertCircle, Sparkles, FileText, Layout, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  const chartData = [
    { subject: 'Overall', A: result.overallScore, fullMark: 100 },
    { subject: 'ATS', A: result.atsCompatibility, fullMark: 100 },
    { subject: 'Format', A: result.formattingScore, fullMark: 100 },
    { subject: 'Content', A: result.contentQualityScore, fullMark: 100 },
    { 
      subject: 'Keywords', 
      A: Math.min(100, Math.round((result.matchedKeywords.length / (result.matchedKeywords.length + result.missingKeywords.length || 1)) * 100)), 
      fullMark: 100 
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8 px-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analysis Report</h2>
          <p className="text-slate-500 font-medium">Expert insights generated for your professional profile.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Save PDF
          </button>
          <button 
            onClick={onReset}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stats Card */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Competency Matrix
            </h3>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Audit</div>
          </div>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="#4f46e5"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Scores Side Bar */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center gap-8">
            <ProgressBar value={result.overallScore} label="Overall Match" size="lg" color="stroke-indigo-600" />
            <div className="grid grid-cols-2 w-full gap-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-800">{result.atsCompatibility}%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">ATS Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-800">{result.formattingScore}%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Layout</div>
              </div>
            </div>
          </div>
          <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Pro Tip</span>
            </div>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Resumes with a match rate above 80% have a 3x higher chance of landing an interview.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Keywords Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.section variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            Identified Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.matchedKeywords.length > 0 ? result.matchedKeywords.map((kw, i) => (
              <span key={i} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                {kw}
              </span>
            )) : <p className="text-slate-400 italic text-sm">No direct technical matches found.</p>}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.length > 0 ? result.missingKeywords.map((kw, i) => (
              <span key={i} className="px-4 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-100 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-400"></span>
                {kw}
              </span>
            )) : <p className="text-slate-400 italic text-sm">Excellent! Your resume covers all key domains.</p>}
          </div>
        </motion.section>
      </div>

      {/* Summary & Recommendations */}
      <motion.div variants={itemVariants} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Executive Summary</h3>
            <p className="text-slate-400 text-sm font-medium">Strategic feedback from our AI analysis engine</p>
          </div>
        </div>
        
        <p className="text-slate-600 leading-relaxed text-lg mb-12 max-w-4xl">{result.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Competitive Strengths
            </h4>
            <ul className="space-y-4">
              {result.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-colors">
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                    {i + 1}
                  </div>
                  <span className="text-slate-700 font-medium leading-snug">{str}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
              Improvement Roadmap
            </h4>
            <ul className="space-y-4">
              {result.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-amber-200 transition-colors">
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px]">
                    {i + 1}
                  </div>
                  <span className="text-slate-700 font-medium leading-snug">{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      <div className="text-center py-8 text-slate-400 text-sm font-medium italic">
        Report generated by ResumeAI v3.1 Engine • AI Ethics Verified
      </div>
    </motion.div>
  );
};

export default AnalysisView;
