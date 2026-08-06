import React, { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Lock,
  Trash2,
  Edit2
} from 'lucide-react';
import { PengaturanSekolah, User, Role } from '../../types';
import { Card } from '../common/Card';
import { apiService } from '../../services/api';
import { localStorageService } from '../../services/storage';
import { Badge } from '../common/Badge';
import { notify } from '../../utils/helpers';

interface SettingsFormProps {
  config: PengaturanSekolah;
  onSaveConfig: (updated: PengaturanSekolah) => void;
  onResetData: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  config,
  onSaveConfig,
  onResetData,
}) => {
  const [namaSekolah, setNamaSekolah] = useState(config.namaSekolah || '');
  const [npsn, setNpsn] = useState(config.npsn || '');
  const [alamat, setAlamat] = useState(config.alamat || '');
  const [kepalaSekolah, setKepalaSekolah] = useState(config.kepalaSekolah || '');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState(config.nipKepalaSekolah || '');
  const [jamBatasTepatWaktu, setJamBatasTepatWaktu] = useState(config.jamBatasTepatWaktu || '06:45');
  const [gasApiUrl, setGasApiUrl] = useState(config.gasApiUrl || '');
  const [useGasBackend, setUseGasBackend] = useState(config.useGasBackend || false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Users State for Multi-Login Management
  const [userList, setUserList] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<Role>('Guru');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const users = localStorageService.getUsers();
    setUserList(users);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newUsername || !newPassword) {
      notify.error('Lengkapi semua kolom user baru');
      return;
    }
    const existing = userList.find(u => u.username.toLowerCase() === newUsername.toLowerCase());
    if (existing) {
      notify.error(`Username '${newUsername}' sudah digunakan!`);
      return;
    }

    const newUser: User = {
      id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
      nama: newNama,
      username: newUsername,
      password: newPassword,
      role: newRole,
      status: 'Aktif'
    };

    const updated = [...userList, newUser];
    localStorageService.saveUsers(updated);
    setUserList(updated);
    setIsAddingUser(false);
    setNewNama('');
    setNewUsername('');
    setNewPassword('password123');
    notify.success(`Akun ${newRole} baru '${newNama}' berhasil dibuat!`);
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (username === 'admin') {
      notify.error('Akun Admin Utama tidak dapat dihapus');
      return;
    }
    if (confirm(`Hapus akun '${username}' dari sistem multi-login?`)) {
      const updated = userList.filter(u => u.id !== id);
      localStorageService.saveUsers(updated);
      setUserList(updated);
      notify.success('Akun pengguna berhasil dihapus');
    }
  };

  const handleTestConnection = async () => {
    if (!gasApiUrl) {
      notify.error('Masukkan URL Google Apps Script Web App terlebih dahulu');
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(gasApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getDashboard' }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setTestResult({
            success: true,
            msg: 'Koneksi ke Google Apps Script REST API Berhasil!',
          });
          notify.success('Koneksi Google Apps Script Berhasil!');
        } else {
          setTestResult({
            success: false,
            msg: `Respon Server: ${json.message || 'Error'}`,
          });
        }
      } else {
        setTestResult({
          success: false,
          msg: `HTTP Status Code: ${res.status}`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        msg: `Gagal terhubung: ${e.message}`,
      });
      notify.error('Koneksi Gagal');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncData = async () => {
    if (!gasApiUrl) {
      notify.error('Masukkan URL Google Apps Script Web App terlebih dahulu');
      return;
    }
    setIsSyncing(true);
    try {
      onSaveConfig({
        namaSekolah,
        npsn,
        alamat,
        kepalaSekolah,
        nipKepalaSekolah,
        jamBatasTepatWaktu,
        gasApiUrl,
        useGasBackend: true,
      });

      const res = await apiService.syncAllLocalDataToGas();
      notify.success(res.message);
    } catch (e: any) {
      notify.error(`Gagal sync data: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      namaSekolah,
      npsn,
      alamat,
      kepalaSekolah,
      nipKepalaSekolah,
      jamBatasTepatWaktu,
      gasApiUrl,
      useGasBackend,
    });
    notify.success('Pengaturan Sekolah Berhasil Disimpan!');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* SECTION 1: MANAJEMEN AKUN MULTI-LOGIN */}
      <Card>
        <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Kelola Akun Pengguna Multi-Login (Admin & Guru)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daftar akun terdaftar yang dapat melakukan login multi-role pada sistem
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingUser(!isAddingUser)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun</span>
          </button>
        </div>

        {isAddingUser && (
          <form onSubmit={handleAddUser} className="p-4 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-200 dark:border-indigo-900 space-y-3">
            <p className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
              ➕ Tambah Akun Pengguna Baru
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Ratna, M.Pd"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="ratna"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password Default
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Hak Akses
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Admin">Admin</option>
                  <option value="Guru">Guru</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm"
              >
                Simpan Akun
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {userList.map(u => (
            <div
              key={u.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {u.nama.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{u.nama}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                    <Badge
                      variant={u.role === 'Admin' ? 'danger' : 'info'}
                      size="sm"
                    >
                      {u.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {u.username !== 'admin' && (
                <button
                  type="button"
                  onClick={() => handleDeleteUser(u.id, u.username)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Hapus Akun"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 2: PROFIL SEKOLAH */}
      <Card>
        <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pengaturan Profil Sekolah & Kop Laporan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengaturan metadata sekolah untuk identitas Kop Surat Cetak PDF / Laporan
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Sekolah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaSekolah}
                onChange={e => setNamaSekolah(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NPSN
              </label>
              <input
                type="text"
                value={npsn}
                onChange={e => setNpsn(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <input
              type="text"
              value={alamat}
              onChange={e => setAlamat(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                value={kepalaSekolah}
                onChange={e => setKepalaSekolah(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={nipKepalaSekolah}
                onChange={e => setNipKepalaSekolah(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Cut off time rule */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-blue-800 dark:text-blue-300">
              <Clock className="w-4 h-4" />
              <span>Aturan Batas Waktu Presensi Tepat Waktu</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={jamBatasTepatWaktu}
                onChange={e => setJamBatasTepatWaktu(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-blue-300 bg-white text-slate-900"
              />
              <span className="text-xs text-blue-700 dark:text-blue-300">
                WIB (Jika Jam Datang &lt;= {jamBatasTepatWaktu} maka Tepat Waktu, selebihnya Terlambat)
              </span>
            </div>
          </div>

          {/* Google Apps Script Integration Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Integrasi Google Apps Script Backend & Spreadsheet</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={useGasBackend}
                  onChange={e => setUseGasBackend(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Aktifkan GAS Backend Mode</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Google Apps Script Web App Deployment URL:
              </label>
              <input
                type="text"
                value={gasApiUrl}
                onChange={e => setGasApiUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Uji Koneksi API'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncData}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Proses Sync...' : 'Sinkronkan Data Ke Spreadsheet'}</span>
              </button>

              {testResult && (
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    testResult.success ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {testResult.msg}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 hover:bg-red-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Data Demo Awal</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

