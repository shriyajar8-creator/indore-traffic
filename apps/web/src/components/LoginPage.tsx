import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Activity, ShieldCheck, Lock, Mail, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, signup, quickLogin } = useAuth();
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CIVILIAN');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authMode === 'LOGIN') {
        await login(email, password);
      } else {
        await signup({ name, email, pass: password, role, department });
      }
    } catch (err: any) {
      setError(err.message || `${authMode === 'LOGIN' ? 'Login' : 'Registration'} failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (selectedRole: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(selectedRole);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between font-sans select-none relative overflow-hidden">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <img src="/gatiraksha-logo.png" alt="GatiRaksha Logo" className="w-10 h-10 rounded-xl border border-blue-500/40 object-cover shadow-md" />
          <div>
            <h1 className="font-extrabold text-base text-white tracking-wider font-sans uppercase flex items-center gap-1.5">
              <span className="text-blue-400">GatiRaksha</span> Intelligence
            </h1>
            <p className="text-[10px] text-slate-400">Urban Decision Support & Incident Response Platform</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-beacon"></span>
          <span>SYSTEM ONLINE</span>
        </span>
      </header>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="bg-[#0F172A]/90 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-5 backdrop-blur-xl">
          <div className="text-center space-y-2">
            <img src="/gatiraksha-logo.png" alt="GatiRaksha Logo" className="w-14 h-14 rounded-2xl border border-blue-500/40 mx-auto object-cover shadow-xl" />
            <h2 className="text-xl font-extrabold text-white tracking-tight font-sans">
              GATIRAKSHA COMMAND
            </h2>
            <p className="text-xs text-slate-400">
              Smart Traffic Command & Incident Response Platform
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('LOGIN'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition ${authMode === 'LOGIN' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('SIGNUP'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition ${authMode === 'SIGNUP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {authMode === 'SIGNUP' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Inspector Ramesh Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authMode === 'LOGIN' ? "admin@indoretraffic.demo" : "officer@gatiraksha.gov.in"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {authMode === 'SIGNUP' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                  >
                    <option value="CIVILIAN">Civilian / Commuter</option>
                    <option value="TRAFFIC_POLICE">Traffic Police</option>
                    <option value="ROAD_DEPARTMENT">Road Dept (PWD)</option>
                    <option value="EMERGENCY_RESPONSE">Emergency 108</option>
                    <option value="ADMIN">Command Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Zone 1 Police"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl shadow-xl flex items-center justify-center space-x-2 uppercase tracking-wider text-xs transition"
            >
              <span>{loading ? 'AUTHENTICATING...' : authMode === 'LOGIN' ? 'LOGIN TO PLATFORM' : 'REGISTER & START'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Role Selectors for SIH Judges */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Demo Role Quick Switch</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSelect('ADMIN')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-blue-400 font-semibold transition"
              >
                1. Admin Command
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('TRAFFIC_POLICE')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-emerald-400 font-semibold transition"
              >
                2. Traffic Police
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('ROAD_DEPARTMENT')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-orange-400 font-semibold transition"
              >
                3. Road Dept (PWD)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('EMERGENCY_RESPONSE')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-red-400 font-semibold transition"
              >
                4. Emergency 108
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleQuickSelect('CIVILIAN')}
              className="w-full p-2.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 font-bold text-center text-xs transition mt-1"
            >
              5. Civilian Application (Public Navigation)
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 bg-slate-950/60 z-10">
        Indore Municipal Traffic Intelligence & Response Platform • Smart India Hackathon Core
      </footer>
    </div>
  );
};
