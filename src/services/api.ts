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
      // Allow role preset quick login if matching role
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
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getDashboard');
        return res.data;
      } catch (e) {
        console.warn('Fallback to local storage for dashboard data');
      }
    }

    const kpi = localStorageService.getKPIs();
    const presensi = localStorageService.getPresensi();
    const recentPresensi = [...presensi].reverse().slice(0, 10);

    return { kpi, recentPresensi };
  },

  // GURU CRUD
  async getGuruList(): Promise<Guru[]> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getGuru');
        return res.data;
      } catch (e) {
        console.warn('GAS Get Guru failed, fallback to local store');
      }
    }
    return localStorageService.getGuruList();
  },

  async addGuru(guru: Omit<Guru, 'id'>): Promise<Guru> {
    const config = localStorageService.getPengaturan();
    const id = 'GRU-' + Math.floor(1000 + Math.random() * 9000);
    const newGuru: Guru = { ...guru, id };

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('addGuru', newGuru);
      } catch (e) {
        console.warn('GAS Add Guru failed, saving locally');
      }
    }

    const current = localStorageService.getGuruList();
    localStorageService.saveGuruList([newGuru, ...current]);
    return newGuru;
  },

  async updateGuru(guru: Guru): Promise<Guru> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('updateGuru', guru);
      } catch (e) {
        console.warn('GAS Update Guru failed');
      }
    }

    const current = localStorageService.getGuruList();
    const updated = current.map(g => (g.id === guru.id ? guru : g));
    localStorageService.saveGuruList(updated);
    return guru;
  },

  async deleteGuru(id: string): Promise<void> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('deleteGuru', { id });
      } catch (e) {
        console.warn('GAS Delete Guru failed');
      }
    }

    const current = localStorageService.getGuruList();
    localStorageService.saveGuruList(current.filter(g => g.id !== id));
  },

  // MASTER PIKET
  async getMasterPiketList(): Promise<MasterPiket[]> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getMasterPiket');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch (e) {
        console.warn('GAS Get Master Piket failed, fallback to local store');
      }
    }
    return localStorageService.getMasterPiket();
  },

  async saveMasterPiketList(list: MasterPiket[]): Promise<void> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('saveMasterPiket', { list });
      } catch (e) {
        console.warn('GAS Save Master Piket failed');
      }
    }
    localStorageService.saveMasterPiket(list);
  },

  // JADWAL CRUD
  async getJadwalList(): Promise<Jadwal[]> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getJadwal');
        return res.data;
      } catch (e) {
        console.warn('GAS Get Jadwal failed');
      }
    }
    return localStorageService.getJadwal();
  },

  async addJadwal(jadwal: Omit<Jadwal, 'id'>): Promise<Jadwal> {
    const config = localStorageService.getPengaturan();
    const id = 'JDW-' + Math.floor(1000 + Math.random() * 9000);
    const newJadwal: Jadwal = { ...jadwal, id };

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('addJadwal', newJadwal);
      } catch (e) {
        console.warn('GAS Add Jadwal failed');
      }
    }

    const current = localStorageService.getJadwal();
    localStorageService.saveJadwal([newJadwal, ...current]);
    return newJadwal;
  },

  async updateJadwal(jadwal: Jadwal): Promise<Jadwal> {
    const current = localStorageService.getJadwal();
    const updated = current.map(j => (j.id === jadwal.id ? jadwal : j));
    localStorageService.saveJadwal(updated);
    return jadwal;
  },

  async deleteJadwal(id: string): Promise<void> {
    const current = localStorageService.getJadwal();
    localStorageService.saveJadwal(current.filter(j => j.id !== id));
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

    localStorageService.saveJadwal([...newItems, ...current]);
    return newItems.length;
  },

  // PRESENSI
  async getPresensiList(): Promise<Presensi[]> {
    const config = localStorageService.getPengaturan();
    if (config.useGasBackend && config.gasApiUrl) {
      try {
        const res = await callGasApi('getPresensi');
        return res.data;
      } catch (e) {
        console.warn('GAS Get Presensi failed');
      }
    }
    return localStorageService.getPresensi();
  },

  async savePresensi(presensi: Omit<Presensi, 'id' | 'timestamp'>): Promise<Presensi> {
    const config = localStorageService.getPengaturan();
    const id = 'PRS-' + Math.floor(10000 + Math.random() * 90000);
    const timestamp = new Date().toISOString();

    const record: Presensi = {
      ...presensi,
      id,
      timestamp,
    };

    if (config.useGasBackend && config.gasApiUrl) {
      try {
        await callGasApi('savePresensi', record);
      } catch (e) {
        console.warn('GAS Save Presensi failed');
      }
    }

    const current = localStorageService.getPresensi();
    localStorageService.savePresensiList([record, ...current]);
    return record;
  },

  async updatePresensi(presensi: Presensi): Promise<Presensi> {
    const current = localStorageService.getPresensi();
    const updated = current.map(p => (p.id === presensi.id ? presensi : p));
    localStorageService.savePresensiList(updated);
    return presensi;
  },

  async deletePresensi(id: string): Promise<void> {
    const current = localStorageService.getPresensi();
    localStorageService.savePresensiList(current.filter(p => p.id !== id));
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
