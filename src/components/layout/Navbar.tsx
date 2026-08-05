import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  ShieldCheck,
  CheckCircle2,
  Database,
  CalendarCheck,
  ChevronDown,
  Users,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { User, PengaturanSekolah, Role } from '../../types';
import { Badge } from '../common/Badge';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchUser?: (username: string, role: Role) => Promise<void>;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleMobileSidebar: () => void;
  schoolConfig: PengaturanSekolah;
  onOpenPresensiForm: () => void;
  onOpenGasGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  theme,
  onToggleTheme,
  onToggleMobileSidebar,
  schoolConfig,
  onOpenPresensiForm,
  onOpenGasGuide,
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSwitch = async (accUser: string, accRole: Role) => {
    setIsAccountMenuOpen(false);
    if (onSwitchUser) {
      await onSwitchUser(accUser, accRole);
    }
  };
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & School Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {schoolConfig.namaSekolah || 'Sistem Guru Piket'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Sistem Manajemen Guru Piket
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action, GAS Badge, Theme, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Presensi Button */}
          <button
            onClick={onOpenPresensiForm}
            className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Presensi Piket</span>
          </button>

          {/* GAS Status Badge / Button */}
          <button
            onClick={onOpenGasGuide}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Integrasi Google Apps Script & Vercel"
          >
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">GAS API:</span>
            {schoolConfig.useGasBackend ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="text-slate-500 font-semibold">Local Demo</span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile Info & Multi-Account Dropdown */}
          {currentUser && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 p-1.5 rounded-xl transition-all"
                title="Ganti Akun / Switch User"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                    {currentUser.nama}
                  </p>
                  <div className="flex justify-end mt-0.5">
                    <Badge
                      variant={
                        currentUser.role === 'Admin'
                          ? 'danger'
                          : currentUser.role === 'Operator'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentUser.nama.charAt(0)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Account Switcher Dropdown Modal/Popover */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Akun Aktif Saat Ini:
                    </p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {currentUser.nama}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Role: <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUser.role}</span>
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 my-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Ganti Akun Cepat (Multi-Login):
                    </p>

                    <button
                      onClick={() => handleQuickSwitch('admin', 'Admin')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        currentUser.role === 'Admin'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5 text-red-500" />
                      <div>
                        <p className="truncate font-semibold">Administrator Utama</p>
                        <p className="text-[10px] text-slate-400">Akses Penuh Admin</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickSwitch('operator', 'Operator')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        currentUser.role === 'Operator'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <p className="truncate font-semibold">Siti Rahmawati</p>
                        <p className="text-[10px] text-slate-400">Akses Staff Operator</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickSwitch('budi', 'Guru')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        currentUser.username === 'budi'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      <div>
                        <p className="truncate font-semibold">Drs. H. Budi Santoso</p>
                        <p className="text-[10px] text-slate-400">Akses Guru Piket</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickSwitch('ani', 'Guru')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        currentUser.username === 'ani'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      <div>
                        <p className="truncate font-semibold">Dra. Hj. Ani Wijaya</p>
                        <p className="text-[10px] text-slate-400">Akses Guru Piket</p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 px-2">
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
