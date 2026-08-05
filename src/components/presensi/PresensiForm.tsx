import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Camera,
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Guru,
  MasterPiket,
  Presensi,
  PengaturanSekolah,
  StatusPresensi
} from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  getCurrentDateFormatted,
  getCurrentTimeFormatted,
  getHariFromDateStr,
  calculateAttendanceStatus
} from '../../utils/dateUtils';
import { CameraModal } from './CameraModal';
import { notify } from '../../utils/helpers';

interface PresensiFormProps {
  guruList: Guru[];
  piketList: MasterPiket[];
  schoolConfig: PengaturanSekolah;
  onSavePresensi: (presensi: Omit<Presensi, 'id' | 'timestamp'>) => void;
  currentUserGuruName?: string;
}

export const PresensiForm: React.FC<PresensiFormProps> = ({
  guruList,
  piketList,
  schoolConfig,
  onSavePresensi,
  currentUserGuruName,
}) => {
  const [tanggal, setTanggal] = useState(getCurrentDateFormatted());
  const [hari, setHari] = useState(getHariFromDateStr(getCurrentDateFormatted()));
  const [jenisPiket, setJenisPiket] = useState(piketList[0]?.jenisPiket || 'Penyambutan Siswa');
  const [namaGuru, setNamaGuru] = useState(currentUserGuruName || guruList[0]?.nama || '');
  const [jamDatang, setJamDatang] = useState(getCurrentTimeFormatted());
  const [jamPulang, setJamPulang] = useState('');
  const [status, setStatus] = useState<StatusPresensi>('Tepat Waktu');
  const [keterangan, setKeterangan] = useState('');
  const [foto, setFoto] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Auto calculate status based on jamDatang and cut-off limit (e.g. 06:45)
  useEffect(() => {
    if (jamDatang) {
      const calcStatus = calculateAttendanceStatus(jamDatang, schoolConfig.jamBatasTepatWaktu || '06:45');
      setStatus(calcStatus);
    }
  }, [jamDatang, schoolConfig.jamBatasTepatWaktu]);

  // Handle GPS location auto fetch
  const handleFetchGps = () => {
    if (!navigator.geolocation) {
      notify.error('GPS Geolocation tidak didukung browser ini.');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsGettingGps(false);
        notify.success('Lokasi GPS Berhasil Dideteksi!');
      },
      err => {
        console.warn('GPS error:', err);
        // Fallback default coordinates if browser blocks geolocation
        setLatitude(-6.17511);
        setLongitude(106.827153);
        setIsGettingGps(false);
        notify.warning('Menggunakan koordinat lokasi sekolah default.');
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    handleFetchGps();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
        notify.success('Foto berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGuru) {
      notify.error('Pilih nama guru terlebih dahulu');
      return;
    }

    onSavePresensi({
      tanggal,
      hari,
      jenisPiket,
      namaGuru,
      jamDatang,
      jamPulang: jamPulang || '-',
      status,
      keterangan,
      foto,
      latitude,
      longitude,
    });

    notify.success('Presensi Piket Berhasil Disimpan!');
    setKeterangan('');
  };

  return (
    <Card className="max-w-3xl mx-auto space-y-5">
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Form Presensi Piket Guru</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Isi kehadiran piket dengan foto bukti dan verifikasi lokasi GPS
          </p>
        </div>

        <Badge variant={status === 'Tepat Waktu' ? 'success' : 'warning'}>
          Batas Tepat Waktu: {schoolConfig.jamBatasTepatWaktu || '06:45'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Presensi (Otomatis)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="date"
                value={tanggal}
                onChange={e => {
                  setTanggal(e.target.value);
                  setHari(getHariFromDateStr(e.target.value));
                }}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hari
            </label>
            <input
              type="text"
              readOnly
              value={hari}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        {/* Duty Type & Teacher Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Piket <span className="text-red-500">*</span>
            </label>
            <select
              value={jenisPiket}
              onChange={e => setJenisPiket(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {piketList.map(p => (
                <option key={p.id} value={p.jenisPiket}>
                  {p.jenisPiket} ({p.jamMulai} - {p.jamSelesai})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Guru Piket <span className="text-red-500">*</span>
            </label>
            <select
              value={namaGuru}
              onChange={e => setNamaGuru(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Guru --</option>
              {guruList
                .filter(g => g.status === 'Aktif')
                .map(g => (
                  <option key={g.id} value={g.nama}>
                    {g.nama} ({g.nip})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Arrival Time & Automated Status calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jam Datang (WIB) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="time"
                value={jamDatang}
                onChange={e => setJamDatang(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jam Pulang (Opsional)
            </label>
            <input
              type="time"
              value={jamPulang}
              onChange={e => setJamPulang(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status Kehadiran (Otomatis)
            </label>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant={status === 'Tepat Waktu' ? 'success' : 'warning'}>
                {status}
              </Badge>
              <span className="text-[10px] text-slate-500">
                {status === 'Tepat Waktu' ? '<= 06:45 WIB' : '> 06:45 WIB'}
              </span>
            </div>
          </div>
        </div>

        {/* Photo Upload / Camera Capture */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Foto Bukti Kegiatan Piket
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto Kamera Live</span>
            </button>

            <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload dari Galeri</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {foto && (
            <div className="mt-2 relative w-36 h-28 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
              <img src={foto} alt="Bukti Piket" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setFoto('')}
                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs shadow-md"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* GPS Geolocation Verification */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Koordinat GPS Lokasi
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {latitude && longitude
                  ? `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`
                  : 'Belum terdeteksi'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFetchGps}
            disabled={isGettingGps}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-lg hover:underline disabled:opacity-50"
          >
            {isGettingGps ? 'Memuat GPS...' : 'Refresh Lokasi'}
          </button>
        </div>

        {/* Remarks / Keterangan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Keterangan Tambahan / Laporan Kejadian Piket
          </label>
          <textarea
            rows={3}
            value={keterangan}
            onChange={e => setKeterangan(e.target.value)}
            placeholder="Contoh: Kondisi gerbang utama kondusif, 5 siswa terlambat dicatat..."
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all duration-150 active:scale-98"
          >
            Simpan Presensi Piket Sekarang
          </button>
        </div>
      </form>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={capturedBase64 => setFoto(capturedBase64)}
      />
    </Card>
  );
};
