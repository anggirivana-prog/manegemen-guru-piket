import { localStorageService } from './storage';
import {
  User,
  Guru,
  MasterPiket,
  Jadwal,
  Presensi,
  PengaturanSekolah,
  DashboardKPI
} from '../types';
import { getCurrentDateFormatted } from '../utils/dateUtils';
import { notify } from '../utils/helpers';

// Helper for fetching GAS REST API
async function callGasApi(action: string, payload: Record<string, any> = {}) {
  const config = localStorageService.getPengaturan();
  const gasUrl = config.gasApiUrl;

  if (!gasUrl || !config.useGasBackend) {
    throw new Error('Google Apps Script Backend tidak diaktifkan atau URL belum dikonfigurasi.');
  }

  const response = await fetch(gasUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!response.ok) {
    throw new Error(`Gagal menghubungi server GAS (${response.status})`);
  }

  const result = await response.json();
  if (result.status === 'error') {
    throw new Error(result.message || 'Terjadi kesalahan pada Apps Script');
  }

  return result;
}

export const apiService = {
  // LOGIN
  async login(username: string, password: string, roleInput?: string): Promise<{ user: User; token: string }> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('login', { username, password });
        return { user: res.data, token: res.token };
      } catch (err: any) {
        console.warn('GAS login error, checking local fallback:', err.message);
      }
    }

    // Local authentication fallback
    const users = localStorageService.getUsers();
    const found = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!found) {
      if (roleInput) {
        const roleUser = users.find(u => u.role === roleInput);
        if (roleUser) {
          return {
            user: roleUser,
            token: 'LOCAL-TOKEN-' + Date.now()
          };
        }
      }
      throw new Error('Username atau password tidak cocok.');
    }

    if (found.status !== 'Aktif') {
      throw new Error('Akun Anda dalam status nonaktif. Hubungi Admin.');
    }

    return {
      user: found,
      token: 'LOCAL-TOKEN-' + Date.now()
    };
  },

  // DASHBOARD KPI
  async getDashboardData(): Promise<{ kpi: DashboardKPI; recentPresensi: Presensi[] }> {
    const presensi = await apiService.getPresensiList();
    const gurus = await apiService.getGuruList();
    const jadwals = await apiService.getJadwalList();

    const todayStr = getCurrentDateFormatted();
    const presensiHariIni = presensi.filter(p => p.tanggal === todayStr);

    const tepatWaktu = presensiHariIni.filter(p => p.status === 'Tepat Waktu').length;
    const terlambat = presensiHariIni.filter(p => p.status === 'Terlambat').length;
    const tidakHadir = presensiHariIni.filter(p => p.status === 'Tidak Hadir').length;

    const kpi: DashboardKPI = {
      totalGuru: gurus.length,
      totalJadwal: jadwals.length,
      totalPresensiHariIni: presensiHariIni.length,
      tepatWaktu,
      terlambat,
      tidakHadir,
    };

    const recentPresensi = [...presensi].reverse().slice(0, 10);
    return { kpi, recentPresensi };
  },

  // GURU CRUD
  async getGuruList(): Promise<Guru[]> {
    const local = localStorageService.getGuruList();
    const config = localStorageService.getPengaturan();

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getGuru');
        if (res.data && Array.isArray(res.data)) {
          const gasData: Guru[] = res.data;
          const gasIds = new Set(gasData.map(item => item.id));
          const localOnly = local.filter(item => !gasIds.has(item.id));
          const merged = [...localOnly, ...gasData];
          localStorageService.saveGuruList(merged);
          return merged;
        }
      } catch (e) {
        console.warn('GAS Get Guru failed, fallback to local store');
      }
    }
    return local;
  },

  async addGuru(guru: Omit<Guru, 'id'>): Promise<Guru> {
    const config = localStorageService.getPengaturan();
    const id = 'GRU-' + Math.floor(1000 + Math.random() * 9000);
    const newGuru: Guru = { ...guru, id };

    // 1. Save locally FIRST
    const current = localStorageService.getGuruList();
    localStorageService.saveGuruList([newGuru, ...current]);

    // 2. Sync to GAS if enabled
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('addGuru', newGuru);
      } catch (e: any) {
        console.warn('GAS Add Guru error:', e.message);
        notify.warning(`Data tersimpan lokal, namun gagal terkirim ke Sheet: ${e.message}`);
      }
    }

    return newGuru;
  },

  async updateGuru(guru: Guru): Promise<Guru> {
    const config = localStorageService.getPengaturan();
    const current = localStorageService.getGuruList();
    const updated = current.map(g => (g.id === guru.id ? guru : g));
    localStorageService.saveGuruList(updated);

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('updateGuru', guru);
      } catch (e: any) {
        console.warn('GAS Update Guru error:', e.message);
      }
    }

    return guru;
  },

  async deleteGuru(id: string): Promise<void> {
    const config = localStorageService.getPengaturan();
    const current = localStorageService.getGuruList();
    localStorageService.saveGuruList(current.filter(g => g.id !== id));

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('deleteGuru', { id });
      } catch (e: any) {
        console.warn('GAS Delete Guru error:', e.message);
      }
    }
  },

  // MASTER PIKET
  async getMasterPiketList(): Promise<MasterPiket[]> {
    const local = localStorageService.getMasterPiket();
    const config = localStorageService.getPengaturan();

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getMasterPiket');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const gasData: MasterPiket[] = res.data;
          const gasIds = new Set(gasData.map(item => item.id));
          const localOnly = local.filter(item => !gasIds.has(item.id));
          const merged = [...localOnly, ...gasData];
          localStorageService.saveMasterPiket(merged);
          return merged;
        }
      } catch (e) {
        console.warn('GAS Get Master Piket failed, fallback to local store');
      }
    }
    return local;
  },

  async saveMasterPiketList(list: MasterPiket[]): Promise<void> {
    localStorageService.saveMasterPiket(list);

    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('saveMasterPiket', { list });
      } catch (e: any) {
        console.warn('GAS Save Master Piket error:', e.message);
      }
    }
  },

  // JADWAL CRUD
  async getJadwalList(): Promise<Jadwal[]> {
    const local = localStorageService.getJadwal();
    const config = localStorageService.getPengaturan();

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getJadwal');
        if (res.data && Array.isArray(res.data)) {
          const gasData: Jadwal[] = res.data;
          const gasIds = new Set(gasData.map(item => item.id));
          const localOnly = local.filter(item => !gasIds.has(item.id));
          const merged = [...localOnly, ...gasData];
          localStorageService.saveJadwal(merged);
          return merged;
        }
      } catch (e) {
        console.warn('GAS Get Jadwal failed');
      }
    }
    return local;
  },

  async addJadwal(jadwal: Omit<Jadwal, 'id'>): Promise<Jadwal> {
    const config = localStorageService.getPengaturan();
    const id = 'JDW-' + Math.floor(1000 + Math.random() * 9000);
    const newJadwal: Jadwal = { ...jadwal, id };

    // 1. Save locally FIRST
    const current = localStorageService.getJadwal();
    localStorageService.saveJadwal([newJadwal, ...current]);

    // 2. Sync to GAS if enabled
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('addJadwal', newJadwal);
      } catch (e: any) {
        console.warn('GAS Add Jadwal error:', e.message);
        notify.warning(`Jadwal tersimpan lokal, namun gagal terkirim ke Sheet: ${e.message}`);
      }
    }

    return newJadwal;
  },

  async updateJadwal(jadwal: Jadwal): Promise<Jadwal> {
    const config = localStorageService.getPengaturan();
    const current = localStorageService.getJadwal();
    const updated = current.map(j => (j.id === jadwal.id ? jadwal : j));
    localStorageService.saveJadwal(updated);

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('updateJadwal', jadwal);
      } catch (e: any) {
        console.warn('GAS Update Jadwal error:', e.message);
      }
    }

    return jadwal;
  },

  async deleteJadwal(id: string): Promise<void> {
    const config = localStorageService.getPengaturan();
    const current = localStorageService.getJadwal();
    localStorageService.saveJadwal(current.filter(j => j.id !== id));

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('deleteJadwal', { id });
      } catch (e: any) {
        console.warn('GAS Delete Jadwal error:', e.message);
      }
    }
  },

  async duplicateWeekSchedule(fromDate: string, toDate: string): Promise<number> {
    const current = localStorageService.getJadwal();
    const sourceSchedules = current.filter(j => j.tanggal === fromDate);

    if (sourceSchedules.length === 0) return 0;

    const newItems: Jadwal[] = sourceSchedules.map(item => ({
      ...item,
      id: 'JDW-' + Math.floor(1000 + Math.random() * 9000),
      tanggal: toDate,
    }));

    for (const item of newItems) {
      await apiService.addJadwal(item);
    }

    return newItems.length;
  },

  // PRESENSI
  async getPresensiList(): Promise<Presensi[]> {
    const local = localStorageService.getPresensi();
    const config = localStorageService.getPengaturan();

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getPresensi');
        if (res.data && Array.isArray(res.data)) {
          const gasData: Presensi[] = res.data;
          const gasIds = new Set(gasData.map(item => item.id));
          const localOnly = local.filter(item => !gasIds.has(item.id));
          const merged = [...localOnly, ...gasData];
          localStorageService.savePresensiList(merged);
          return merged;
        }
      } catch (e) {
        console.warn('GAS Get Presensi failed');
      }
    }
    return local;
  },

  async savePresensi(presensi: Omit<Presensi, 'id' | 'timestamp'>): Promise<Presensi> {
    const config = localStorageService.getPengaturan();
    const id = 'PRS-' + Math.floor(10000 + Math.random() * 90000);
    const timestamp = new Date().toISOString();

    // Sanitize photo string length to max 25,000 chars for Google Sheets cell safety
    let fotoClean = presensi.foto || '';
    if (fotoClean.length > 25000) {
      fotoClean = fotoClean.substring(0, 25000);
    }

    const record: Presensi = {
      ...presensi,
      foto: fotoClean,
      id,
      timestamp,
    };

    // 1. Save locally FIRST
    const current = localStorageService.getPresensi();
    localStorageService.savePresensiList([record, ...current]);

    // 2. Try sending to GAS backend
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('savePresensi', record);
      } catch (e: any) {
        console.warn('GAS Save Presensi error:', e.message);
        notify.warning(`Presensi tersimpan lokal, namun gagal terkirim ke Sheet: ${e.message}`);
      }
    }

    return record;
  },

  async updatePresensi(presensi: Presensi): Promise<Presensi> {
    const config = localStorageService.getPengaturan();
    const current = localStorageService.getPresensi();
    const updated = current.map(p => (p.id === presensi.id ? presensi : p));
    localStorageService.savePresensiList(updated);

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('updatePresensi', presensi);
      } catch (e: any) {
        console.warn('GAS Update Presensi error:', e.message);
      }
    }

    return presensi;
  },

  async deletePresensi(id: string): Promise<void> {
    const config = localStorageService.getPengaturan();
    const current = localStorageService.getPresensi();
    localStorageService.savePresensiList(current.filter(p => p.id !== id));

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('deletePresensi', { id });
      } catch (e: any) {
        console.warn('GAS Delete Presensi error:', e.message);
      }
    }
  },

  // PENGATURAN
  async getPengaturan(): Promise<PengaturanSekolah> {
    return localStorageService.getPengaturan();
  },

  async savePengaturan(settings: PengaturanSekolah): Promise<void> {
    localStorageService.savePengaturan(settings);
  },

  // USERS CRUD
  async getUsers(): Promise<User[]> {
    return localStorageService.getUsers();
  },

  async saveUsers(users: User[]): Promise<void> {
    localStorageService.saveUsers(users);
  },

  // SYNC TO GOOGLE SPREADSHEET
  async syncAllLocalDataToGas(): Promise<{ success: boolean; message: string }> {
    const config = localStorageService.getPengaturan();
    if (!config.gasApiUrl) {
      throw new Error('URL Web App Google Apps Script belum diisi');
    }

    // 1. Init Database Structure in Spreadsheet
    await callGasApi('initDatabase');

    // 2. Sync Master Piket
    const piketList = localStorageService.getMasterPiket();
    if (piketList.length > 0) {
      await callGasApi('saveMasterPiket', { list: piketList });
    }

    // 3. Sync Master Guru
    const guruList = localStorageService.getGuruList();
    for (const guru of guruList) {
      try {
        await callGasApi('addGuru', guru);
      } catch (e) {
        // Continue syncing remaining items
      }
    }

    // 4. Sync Jadwal
    const jadwalList = localStorageService.getJadwal();
    for (const j of jadwalList) {
      try {
        await callGasApi('addJadwal', j);
      } catch (e) {
        // Continue
      }
    }

    // 5. Sync Presensi
    const presensiList = localStorageService.getPresensi();
    for (const p of presensiList) {
      try {
        await callGasApi('savePresensi', p);
      } catch (e) {
        // Continue
      }
    }

    return {
      success: true,
      message: 'Seluruh data Master (Guru, Piket, Jadwal, Presensi) berhasil disinkronisasi ke Google Spreadsheet!'
    };
  }
};
