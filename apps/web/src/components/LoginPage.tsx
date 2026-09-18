import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, signup } = useAuth();

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
        await signup({
          name,
          email,
          pass: password,
          role,
          department
        });
      }
    } catch (err: any) {
      setError(
        err.message ||
          `${authMode === 'LOGIN' ? 'Login' : 'Registration'} failed.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between font-sans select-none relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/gatiraksha-logo.png"
            alt="GatiRaksha Logo"
            className="w-10 h-10 rounded-xl border border-blue-500/40 object-cover shadow-md"
          />

          <div>
            <h1 className="font-extrabold text-base text-white tracking-wider font-sans uppercase flex items-center gap-1.5">
              <span className="text-blue-400">GatiRaksha</span>
            </h1>

            <p className="text-[10px] text-slate-400">
              Urban Decision Support & Incident Response Platform
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-beacon"></span>
          <span>SYSTEM ONLINE</span>
        </span>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="bg-[#0F172A]/90 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-5 backdrop-blur-xl">

          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <img
              src="/gatiraksha-logo.png"
              alt="GatiRaksha Logo"
              className="w-14 h-14 rounded-2xl border border-blue-500/40 mx-auto object-cover shadow-xl"
            />

            <h2 className="text-xl font-extrabold text-white tracking-tight font-sans">
              GatiRaksha
            </h2>

            <p className="text-xs text-slate-400">
              Smart Traffic Command & Incident Response Platform
            </p>
          </div>

          {/* Sign In / Create Account */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition ${
                authMode === 'LOGIN'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SIGN IN
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('SIGNUP');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition ${
                authMode === 'SIGNUP'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">

            {/* Full Name - Signup Only */}
            {authMode === 'SIGNUP' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Email Address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Signup Role & Department */}
            {authMode === 'SIGNUP' && (
              <div className="grid grid-cols-2 gap-2">

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Account Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as UserRole)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                  >
                    <option value="CIVILIAN">
                      Civilian / Commuter
                    </option>

                    <option value="TRAFFIC_POLICE">
                      Traffic Police
                    </option>

                    <option value="ROAD_DEPARTMENT">
                      Road Dept (PWD)
                    </option>

                    <option value="EMERGENCY_RESPONSE">
                      Emergency 108
                    </option>

                    <option value="ADMIN">
                      Command Admin
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Department
                  </label>

                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Enter department"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl shadow-xl flex items-center justify-center space-x-2 uppercase tracking-wider text-xs transition"
            >
              <span>
                {loading
                  ? 'AUTHENTICATING...'
                  : authMode === 'LOGIN'
                  ? 'LOGIN TO PLATFORM'
                  : 'REGISTER & START'}
              </span>

              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 bg-slate-950/60 z-10">
        GatiRaksha • Urban Traffic Intelligence & Incident Response Platform
      </footer>

    </div>
  );
};
