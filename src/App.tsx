import React, { useState, useEffect } from 'react';
import {
  User,
  Guru,
  MasterPiket,
  Jadwal,
  Presensi,
  PengaturanSekolah,
  DashboardKPI
} from './types';
import { localStorageService } from './services/storage';
import { apiService } from './services/api';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';

import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';

import { KpiCards } from './components/dashboard/KpiCards';
import { AttendanceChart } from './components/dashboard/AttendanceChart';
import { DutyChart } from './components/dashboard/DutyChart';
import { LeaderboardChart } from './components/dashboard/LeaderboardChart';
import { RecentActivity } from './components/dashboard/RecentActivity';

import { GuruTable } from './components/guru/GuruTable';
import { GuruModal } from './components/guru/GuruModal';

import { PiketManagement } from './components/piket/PiketModal';

import { JadwalTable } from './components/jadwal/JadwalTable';
import { JadwalModal } from './components/jadwal/JadwalModal';
import { CopyScheduleModal } from './components/jadwal/CopyScheduleModal';

import { PresensiForm } from './components/presensi/PresensiForm';
import { PresensiHistory } from './components/presensi/PresensiHistory';

import { ReportTables } from './components/laporan/ReportTables';
import { SettingsForm } from './components/pengaturan/SettingsForm';
import { ProfileView } from './components/profile/ProfileView';
import { GasGuideModal } from './components/deployment/GasGuideModal';
import { notify } from './utils/helpers';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, setCurrentUser, logout, role } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Data States
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [piketList, setPiketList] = useState<MasterPiket[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [presensiList, setPresensiList] = useState<Presensi[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<PengaturanSekolah>(
    localStorageService.getPengaturan()
  );
  const [kpiData, setKpiData] = useState<DashboardKPI>({
    totalGuru: 0,
    totalJadwal: 0,
    totalPresensiHariIni: 0,
    tepatWaktu: 0,
    terlambat: 0,
    tidakHadir: 0,
  });

  // Modals States
  const [isGuruModalOpen, setIsGuruModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);

  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  // Initialize defaults on mount
  useEffect(() => {
    localStorageService.initDefaults();
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    try {
      const config = await apiService.getPengaturan();
      setSchoolConfig(config);

      const gurus = await apiService.getGuruList();
      setGuruList(gurus);

      const pikets = await apiService.getMasterPiketList();
      setPiketList(pikets);

      const jadwals = await apiService.getJadwalList();
      setJadwalList(jadwals);

      const presensis = await apiService.getPresensiList();
      setPresensiList(presensis);

      const dashData = await apiService.getDashboardData();
      setKpiData(dashData.kpi);
    } catch (err: any) {
      console.error('Error refreshing data:', err);
    }
  };

  // Auth Handlers
  const handleLogin = async (username: string, pass: string, roleInput?: string) => {
    const res = await apiService.login(username, pass, roleInput);
    setCurrentUser(res.user);
    await refreshAllData();
  };

  // Guru Handlers
  const handleOpenAddGuru = () => {
    setEditingGuru(null);
    setIsGuruModalOpen(true);
  };

  const handleOpenEditGuru = (guru: Guru) => {
    setEditingGuru(guru);
    setIsGuruModalOpen(true);
  };

  const handleSaveGuru = async (guruData: Omit<Guru, 'id'> | Guru) => {
    if ('id' in guruData && guruData.id) {
      await apiService.updateGuru(guruData as Guru);
      notify.success('Data guru berhasil diperbarui');
    } else {
      await apiService.addGuru(guruData as Omit<Guru, 'id'>);
      notify.success('Guru baru berhasil ditambahkan');
    }
    await refreshAllData();
  };

  const handleDeleteGuru = async (id: string) => {
    if (confirm('Yakin ingin menghapus data guru ini?')) {
      await apiService.deleteGuru(id);
      notify.success('Data guru berhasil dihapus');
      await refreshAllData();
    }
  };

  // Master Piket Handlers
  const handleSavePiketList = async (list: MasterPiket[]) => {
    await apiService.saveMasterPiketList(list);
    await refreshAllData();
  };

  // Jadwal Handlers
  const handleOpenAddJadwal = () => {
    setEditingJadwal(null);
    setIsJadwalModalOpen(true);
  };

  const handleOpenEditJadwal = (jadwal: Jadwal) => {
    setEditingJadwal(jadwal);
    setIsJadwalModalOpen(true);
  };

  const handleSaveJadwal = async (jadwalData: Omit<Jadwal, 'id'> | Jadwal) => {
    if ('id' in jadwalData && jadwalData.id) {
      await apiService.updateJadwal(jadwalData as Jadwal);
      notify.success('Jadwal piket berhasil diperbarui');
    } else {
      await apiService.addJadwal(jadwalData as Omit<Jadwal, 'id'>);
      notify.success('Jadwal piket baru berhasil ditambahkan');
    }
    await refreshAllData();
  };

  const handleDeleteJadwal = async (id: string) => {
    if (confirm('Yakin ingin menghapus jadwal piket ini?')) {
      await apiService.deleteJadwal(id);
      notify.success('Jadwal piket berhasil dihapus');
      await refreshAllData();
    }
  };

  const handleCopyJadwal = async (fromDate: string, toDate: string) => {
    const count = await apiService.duplicateWeekSchedule(fromDate, toDate);
    if (count > 0) {
      notify.success(`Berhasil menduplikasi ${count} jadwal ke tanggal ${toDate}`);
    } else {
      notify.warning(`Tidak ada jadwal piket pada tanggal sumber ${fromDate}`);
    }
    await refreshAllData();
  };

  // Presensi Handlers
  const handleSavePresensi = async (presensiData: Omit<Presensi, 'id' | 'timestamp'>) => {
    await apiService.savePresensi(presensiData);
    await refreshAllData();
  };

  const handleDeletePresensi = async (id: string) => {
    if (confirm('Yakin ingin menghapus rekam presensi ini?')) {
      await apiService.deletePresensi(id);
      notify.success('Data presensi berhasil dihapus');
      await refreshAllData();
    }
  };

  // Settings Handlers
  const handleSaveConfig = async (updatedConfig: PengaturanSekolah) => {
    await apiService.savePengaturan(updatedConfig);
    setSchoolConfig(updatedConfig);
    await refreshAllData();
  };

  const handleResetData = async () => {
    if (confirm('APAKAH ANDA YAKIN? Seluruh data akan dikembalikan ke data demo awal.')) {
      localStorageService.resetToDefaults();
      notify.success('Seluruh data berhasil direset ke versi demo awal');
      await refreshAllData();
    }
  };

  // Password Handler
  const handleUpdatePassword = (newPass: string) => {
    if (currentUser) {
      const users = localStorageService.getUsers();
      const updated = users.map(u => (u.id === currentUser.id ? { ...u, password: newPass } : u));
      localStorageService.saveUsers(updated);
      setCurrentUser({ ...currentUser, password: newPass });
    }
  };

  // Show Login View if unauthenticated
  if (!currentUser) {
    return (
      <LoginView
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onLogout={logout}
        onSwitchUser={async (u, r) => {
          await handleLogin(u, 'password123', r);
          notify.success(`Beralih ke akun ${r}!`);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleMobileSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
        schoolConfig={schoolConfig}
        onOpenPresensiForm={() => setActiveTab('presensi')}
        onOpenGasGuide={() => setActiveTab('panduan')}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={role}
          isOpenMobile={isOpenMobileSidebar}
          onCloseMobile={() => setIsOpenMobileSidebar(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 space-y-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <KpiCards kpi={kpiData} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <AttendanceChart />
                </div>
                <div>
                  <DutyChart />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <LeaderboardChart />
                <RecentActivity
                  items={presensiList.slice(0, 5)}
                  onViewAll={() => setActiveTab('presensi')}
                />
              </div>
            </div>
          )}

          {activeTab === 'guru' && (
            <GuruTable
              guruList={guruList}
              onAddGuru={handleOpenAddGuru}
              onEditGuru={handleOpenEditGuru}
              onDeleteGuru={handleDeleteGuru}
              schoolConfig={schoolConfig}
            />
          )}

          {activeTab === 'piket' && (
            <PiketManagement
              piketList={piketList}
              onSaveList={handleSavePiketList}
            />
          )}

          {activeTab === 'jadwal' && (
            <JadwalTable
              jadwalList={jadwalList}
              guruList={guruList}
              piketList={piketList}
              onAddJadwal={handleOpenAddJadwal}
              onEditJadwal={handleOpenEditJadwal}
              onDeleteJadwal={handleDeleteJadwal}
              onOpenCopyModal={() => setIsCopyModalOpen(true)}
              schoolConfig={schoolConfig}
            />
          )}

          {activeTab === 'presensi' && (
            <div className="space-y-6">
              <PresensiForm
                guruList={guruList}
                piketList={piketList}
                schoolConfig={schoolConfig}
                onSavePresensi={handleSavePresensi}
                currentUserGuruName={currentUser.nama}
              />

              <PresensiHistory
                presensiList={presensiList}
                onDeletePresensi={role === 'Admin' ? handleDeletePresensi : undefined}
                schoolConfig={schoolConfig}
              />
            </div>
          )}

          {activeTab === 'laporan' && (
            <ReportTables
              presensiList={presensiList}
              guruList={guruList}
              piketList={piketList}
              schoolConfig={schoolConfig}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsForm
              config={schoolConfig}
              onSaveConfig={handleSaveConfig}
              onResetData={handleResetData}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onUpdatePassword={handleUpdatePassword}
            />
          )}

          {activeTab === 'panduan' && <GasGuideModal />}
        </main>
      </div>

      {/* Modals */}
      <GuruModal
        isOpen={isGuruModalOpen}
        onClose={() => setIsGuruModalOpen(false)}
        onSave={handleSaveGuru}
        initialData={editingGuru}
      />

      <JadwalModal
        isOpen={isJadwalModalOpen}
        onClose={() => setIsJadwalModalOpen(false)}
        onSave={handleSaveJadwal}
        initialData={editingJadwal}
        guruList={guruList}
        piketList={piketList}
      />

      <CopyScheduleModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        onCopy={handleCopyJadwal}
      />
    </div>
  );
}
