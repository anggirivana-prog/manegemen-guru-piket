import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User as UserIcon,
  ArrowRight,
  Sun,
  Moon,
  Users,
  CheckCircle2,
  Sparkles,
  KeyRound,
  GraduationCap,
  Eye,
  EyeOff
} from 'lucide-react';
import { Role } from '../../types';
import { Card } from '../common/Card';
import { localStorageService } from '../../services/storage';
import { notify } from '../../utils/helpers';

interface LoginViewProps {
  onLogin: (username: string, pass: string, roleInput?: string) => Promise<void>;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  theme,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'guru'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<Role>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorageService.initDefaults();
  }, []);

  const handleTabChange = (tab: 'admin' | 'guru') => {
    setActiveTab(tab);
    setShowPassword(false);
    if (tab === 'admin') {
      setRole('Admin');
      setUsername('admin');
      setPassword('password123');
    } else {
      setRole('Guru');
      setUsername('budi');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      notify.error('Isi username dan password');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username, password, role);
      notify.success('Login Berhasil!', `Selamat datang sebagai ${role}`);
    } catch (err: any) {
      notify.error('Login Gagal', err.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPresetLogin = async (presetRole: Role, user: string) => {
    setIsLoading(true);
    try {
      await onLogin(user, 'password123', presetRole);
      notify.success('Quick Multi-Login Berhasil!', `Login sebagai ${presetRole}`);
    } catch (err: any) {
      notify.error('Gagal Quick Login', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-lg z-10 space-y-5 my-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Multi-Login E-Piket Sekolah
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Akses Terpadu Multi-User Administrator, Operator & Guru Piket
          </p>
        </div>

        {/* Tab Selector */}
        <div className="p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 grid grid-cols-2 gap-2 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Login Admin & Operator</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('guru')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'guru'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Login Guru Piket</span>
          </button>
        </div>

        {/* Main Glassmorphism Card */}
        <Card className="!p-6 space-y-5 shadow-xl border-slate-200/80 dark:border-slate-800">
          {activeTab === 'admin' ? (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-extrabold text-blue-900 dark:text-blue-200">Mode Akses Administrator / Operator</p>
                <p className="text-blue-700/80 dark:text-blue-300/80 text-[11px]">
                  Kelola data guru, jadwal piket, presensi, dan sync ke Google Sheets.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-extrabold text-emerald-900 dark:text-emerald-200">Mode Akses Guru Piket Mandiri</p>
                  <p className="text-emerald-700/80 dark:text-emerald-300/80 text-[11px]">
                    Pilih nama akun guru Anda di bawah ini untuk melakukan presensi piket.
                  </p>
                </div>
              </div>

              {/* Multi Teacher Selector */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Pilih Akun Guru Terdaftar:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { u: 'budi', name: 'Drs. H. Budi Santoso, M.Pd' },
                    { u: 'ani', name: 'Dra. Hj. Ani Wijaya' },
                    { u: 'dewi', name: 'Dewi Lestari, S.Si' },
                    { u: 'fauzi', name: 'Ahmad Fauzi, S.Pd' },
                  ].map(item => (
                    <button
                      key={item.u}
                      type="button"
                      onClick={() => {
                        setUsername(item.u);
                        setPassword('password123');
                        setRole('Guru');
                      }}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        username === item.u
                          ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 font-extrabold text-emerald-900 dark:text-emerald-200 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <p className="truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">@{item.u}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username Akun
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hak Akses Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Admin', 'Operator', 'Guru'] as Role[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      role === r
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Proses Autentikasi...' : `Masuk Sebagai ${role}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Preset Login Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Switch Multi-Account Demo:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPresetLogin('Admin', 'admin')}
                className="py-1.5 px-2 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-100 text-center transition-all"
              >
                🔴 Admin Utama
              </button>

              <button
                type="button"
                onClick={() => handleQuickPresetLogin('Operator', 'operator')}
                className="py-1.5 px-2 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-100 text-center transition-all"
              >
                🟡 Operator
              </button>

              <button
                type="button"
                onClick={() => handleQuickPresetLogin('Guru', 'budi')}
                className="py-1.5 px-2 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 text-center transition-all"
              >
                🔵 Guru Piket
              </button>
            </div>
          </div>
        </Card>

        <p className="text-[11px] text-slate-400 text-center">
          Powered by Multi-User Authentication Engine & Google Sheets Backend
        </p>
      </div>
    </div>
  );
};

