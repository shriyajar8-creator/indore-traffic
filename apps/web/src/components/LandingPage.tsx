import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Navigation, 
  GitFork, 
  BrainCircuit, 
  Siren, 
  BarChart3, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Building2 
} from 'lucide-react';

interface LandingPageProps {
  onOpenCommandCenter: () => void;
  onOpenCivilianApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenCommandCenter, onOpenCivilianApp }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-wider font-sans uppercase">
              Indore Traffic Intelligence
            </h1>
            <p className="text-[10px] text-slate-400">Urban Decision Support Platform • SIH 2026 Core</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenCivilianApp}
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700"
          >
            Civilian App
          </button>
          <button
            onClick={onOpenCommandCenter}
            className="text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-1.5"
          >
            <span>COMMAND CENTER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-bold">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>SMART INDIA HACKATHON INNOVATION</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight font-sans">
          INDORE TRAFFIC INTELLIGENCE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            & RESPONSE PLATFORM
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
          &quot;Real-time traffic intelligence for a smarter, safer, and faster Indore.&quot; <br />
          Connecting traffic authorities, municipal departments, emergency responders, and civilians through a unified command-and-response loop.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onOpenCommandCenter}
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-2xl shadow-blue-600/30 flex items-center space-x-2 uppercase tracking-wider"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>ENTER COMMAND CENTER</span>
          </button>

          <button
            onClick={onOpenCivilianApp}
            className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-100 font-extrabold text-sm shadow-xl flex items-center space-x-2 uppercase tracking-wider"
          >
            <Navigation className="w-5 h-5 text-emerald-400" />
            <span>EXPLORE CIVILIAN APP</span>
          </button>
        </div>
      </section>

      {/* Core Innovation Loop */}
      <section className="py-16 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">THE CORE INNOVATION</h2>
            <h3 className="text-2xl font-bold text-white">The Command-and-Response Loop</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-center text-xs font-bold">
            {['MONITOR', 'DETECT', 'DECIDE', 'INTERVENE', 'REROUTE', 'NOTIFY', 'ANALYZE'].map((step, idx) => (
              <div key={step} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 shadow-lg">
                <span className="text-[10px] text-blue-400 font-mono">0{idx + 1}</span>
                <p className="text-white tracking-wider">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Feature Cards */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <Activity className="w-8 h-8 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Real-time Traffic Monitoring</h3>
            <p className="text-xs text-slate-400">Live corridor speed analytics, congestion percentages, and speed delta comparisons across Indore arterial networks.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <GitFork className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Authority Dynamic Rerouting</h3>
            <p className="text-xs text-slate-400">Calculates optimal alternate corridors (Route A/B/C) with capacity analysis and saves users up to 11 minutes per incident.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <Siren className="w-8 h-8 text-red-400" />
            <h3 className="text-lg font-bold text-white">Emergency Green Corridors</h3>
            <p className="text-xs text-slate-400">Future-ready 108 Ambulance green wave priority routing, bypassing closed roads and congestion automatically.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 bg-[#0F172A]">
        Indore Traffic Intelligence & Response Platform • Built for Smart India Hackathon 2026
      </footer>
    </div>
  );
};
