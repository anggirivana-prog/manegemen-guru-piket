export type Role = 'Admin' | 'Guru';

export interface User {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: Role;
  status: 'Aktif' | 'Nonaktif';
}

export interface Guru {
  id: string;
  nip: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  noHp: string;
  email: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface MasterPiket {
  id: string;
  jenisPiket: string;
  deskripsi: string;
  jamMulai: string;
  jamSelesai: string;
}

export interface Jadwal {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;    // Senin, Selasa, etc.
  jenisPiket: string;
  guru1: string;
  guru2: string;
  guru3: string;
  guru4: string;
}

export type StatusPresensi = 'Tepat Waktu' | 'Terlambat' | 'Tidak Hadir' | 'Izin/Sakit';

export interface Presensi {
  id: string;
  tanggal: string;   // YYYY-MM-DD
  hari: string;
  jenisPiket: string;
  namaGuru: string;
  jamDatang: string;  // HH:mm
  jamPulang: string;  // HH:mm
  status: StatusPresensi;
  keterangan: string;
  foto?: string;       // Base64 or URL
  latitude?: number;
  longitude?: number;
  timestamp: string;  // ISO string or formatted datetime
}

export interface PengaturanSekolah {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  jamBatasTepatWaktu: string; // Default: '06:45'
  gasApiUrl: string;          // Google Apps Script Web App Deployment URL
  useGasBackend: boolean;     // Toggle between local demo storage and live GAS API
}

export interface DashboardKPI {
  totalGuru: number;
  totalJadwal: number;
  totalPresensiHariIni: number;
  tepatWaktu: number;
  terlambat: number;
  tidakHadir: number;
}

export interface MonthlyAttendanceChartData {
  bulan: string;
  tepatWaktu: number;
  terlambat: number;
  tidakHadir: number;
}

export interface DutyDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface TeacherLeaderboardData {
  nama: string;
  jumlahHadir: number;
}
