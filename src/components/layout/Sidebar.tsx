import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  FileSpreadsheet,
  Settings,
  UserCircle,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { Role } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'guru'
  | 'piket'
  | 'jadwal'
  | 'presensi'
  | 'laporan'
  | 'pengaturan'
  | 'profile'
  | 'panduan';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole?: Role;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole = 'Admin',
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Guru'],
    },
    {
      id: 'guru',
      label: 'Master Guru',
      icon: Users,
      roles: ['Admin'],
    },
    {
      id: 'piket',
      label: 'Master Piket',
      icon: Clock,
      roles: ['Admin'],
    },
    {
      id: 'jadwal',
      label: 'Jadwal Piket',
      icon: CalendarDays,
      roles: ['Admin', 'Guru'],
    },
    {
      id: 'presensi',
      label: 'Presensi Piket',
      icon: CheckSquare,
      roles: ['Admin', 'Guru'],
    },
    {
      id: 'laporan',
      label: 'Laporan Rekap',
      icon: FileSpreadsheet,
      roles: ['Admin', 'Guru'],
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Sekolah',
      icon: Settings,
      roles: ['Admin'],
    },
    {
      id: 'profile',
      label: 'Profil Saya',
      icon: UserCircle,
      roles: ['Admin', 'Guru'],
    },
    {
      id: 'panduan',
      label: 'Panduan GAS & Vercel',
      icon: HelpCircle,
      roles: ['Admin', 'Guru'],
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleNavClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-[57px] left-0 z-40 h-[calc(100vh-57px)] w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col justify-between p-4 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
            Menu Utama
          </p>

          <nav className="space-y-1">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as NavTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info inside sidebar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Piket Guru v1.0</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              Next.js & GAS Integration Architecture
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
