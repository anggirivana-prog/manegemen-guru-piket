import {
  User,
  Guru,
  MasterPiket,
  Jadwal,
  Presensi,
  PengaturanSekolah,
  DashboardKPI
} from '../types';
import {
  initialUsers,
  initialGuru,
  initialMasterPiket,
  initialJadwal,
  initialPresensi,
  initialPengaturanSekolah
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'guru_piket_users_v1',
  GURU: 'guru_piket_guru_v1',
  PIKET: 'guru_piket_master_piket_v1',
  JADWAL: 'guru_piket_jadwal_v1',
  PRESENSI: 'guru_piket_presensi_v1',
  PENGATURAN: 'guru_piket_pengaturan_v1',
  SESSION: 'guru_piket_session_v1',
  THEME: 'guru_piket_theme_v1',
};

// Helper to get item with fallback
function getLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

// Helper to set item
function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export const localStorageService = {
  // Initialize default data if empty
  initDefaults(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setLocal(STORAGE_KEYS.USERS, initialUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GURU)) {
      setLocal(STORAGE_KEYS.GURU, initialGuru);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PIKET)) {
      setLocal(STORAGE_KEYS.PIKET, initialMasterPiket);
    }
    if (!localStorage.getItem(STORAGE_KEYS.JADWAL)) {
      setLocal(STORAGE_KEYS.JADWAL, initialJadwal);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRESENSI)) {
      setLocal(STORAGE_KEYS.PRESENSI, initialPresensi);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PENGATURAN)) {
      setLocal(STORAGE_KEYS.PENGATURAN, initialPengaturanSekolah);
    }
  },

  resetToDefaults(): void {
    setLocal(STORAGE_KEYS.USERS, initialUsers);
    setLocal(STORAGE_KEYS.GURU, initialGuru);
    setLocal(STORAGE_KEYS.PIKET, initialMasterPiket);
    setLocal(STORAGE_KEYS.JADWAL, initialJadwal);
    setLocal(STORAGE_KEYS.PRESENSI, initialPresensi);
    setLocal(STORAGE_KEYS.PENGATURAN, initialPengaturanSekolah);
  },

  // USERS
  getUsers(): User[] {
    return getLocal(STORAGE_KEYS.USERS, initialUsers);
  },
  saveUsers(users: User[]): void {
    setLocal(STORAGE_KEYS.USERS, users);
  },

  // GURU
  getGuruList(): Guru[] {
    return getLocal(STORAGE_KEYS.GURU, initialGuru);
  },
  saveGuruList(guruList: Guru[]): void {
    setLocal(STORAGE_KEYS.GURU, guruList);
  },

  // MASTER PIKET
  getMasterPiket(): MasterPiket[] {
    return getLocal(STORAGE_KEYS.PIKET, initialMasterPiket);
  },
  saveMasterPiket(list: MasterPiket[]): void {
    setLocal(STORAGE_KEYS.PIKET, list);
  },

  // JADWAL
  getJadwal(): Jadwal[] {
    return getLocal(STORAGE_KEYS.JADWAL, initialJadwal);
  },
  saveJadwal(jadwal: Jadwal[]): void {
    setLocal(STORAGE_KEYS.JADWAL, jadwal);
  },

  // PRESENSI
  getPresensi(): Presensi[] {
    return getLocal(STORAGE_KEYS.PRESENSI, initialPresensi);
  },
  savePresensiList(list: Presensi[]): void {
    setLocal(STORAGE_KEYS.PRESENSI, list);
  },

  // PENGATURAN
  getPengaturan(): PengaturanSekolah {
    return getLocal(STORAGE_KEYS.PENGATURAN, initialPengaturanSekolah);
  },
  savePengaturan(config: PengaturanSekolah): void {
    setLocal(STORAGE_KEYS.PENGATURAN, config);
  },

  // SESSION
  getCurrentUser(): User | null {
    return getLocal<User | null>(STORAGE_KEYS.SESSION, null);
  },
  setCurrentUser(user: User | null): void {
    setLocal(STORAGE_KEYS.SESSION, user);
  },

  // THEME
  getTheme(): 'light' | 'dark' {
    return getLocal<'light' | 'dark'>(STORAGE_KEYS.THEME, 'light');
  },
  setTheme(theme: 'light' | 'dark'): void {
    setLocal(STORAGE_KEYS.THEME, theme);
  },

  // KPI DATA COMPUTATION
  getKPIs(): DashboardKPI {
    const guru = this.getGuruList();
    const jadwal = this.getJadwal();
    const presensi = this.getPresensi();

    const todayStr = new Date().toISOString().split('T')[0];
    const presensiHariIni = presensi.filter(p => p.tanggal === todayStr);

    const tepatWaktu = presensiHariIni.filter(p => p.status === 'Tepat Waktu').length;
    const terlambat = presensiHariIni.filter(p => p.status === 'Terlambat').length;
    const tidakHadir = presensiHariIni.filter(p => p.status === 'Tidak Hadir' || p.status === 'Izin/Sakit').length;

    return {
      totalGuru: guru.length,
      totalJadwal: jadwal.length,
      totalPresensiHariIni: presensiHariIni.length,
      tepatWaktu,
      terlambat,
      tidakHadir
    };
  }
};
