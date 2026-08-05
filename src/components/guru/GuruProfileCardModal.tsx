import React, { useState } from 'react';
import {
  IdCard,
  Printer,
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Palette
} from 'lucide-react';
import { Guru, PengaturanSekolah } from '../../types';
import { Modal } from '../common/Modal';

interface GuruProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  guru: Guru | null;
  allGuruList?: Guru[];
  schoolConfig?: PengaturanSekolah;
}

export const GuruProfileCardModal: React.FC<GuruProfileCardModalProps> = ({
  isOpen,
  onClose,
  guru,
  allGuruList = [],
  schoolConfig,
}) => {
  const [selectedGuruId, setSelectedGuruId] = useState<string>(guru?.id || '');
  const [cardTheme, setCardTheme] = useState<'blue' | 'emerald' | 'navy' | 'amber'>('blue');
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>('both');

  // Keep track of current teacher when selecting or cycling
  const activeGuru =
    allGuruList.find(g => g.id === selectedGuruId) || guru || allGuruList[0];

  if (!isOpen || !activeGuru) return null;

  const currentIdx = allGuruList.findIndex(g => g.id === activeGuru.id);
  const handlePrev = () => {
    if (currentIdx > 0) setSelectedGuruId(allGuruList[currentIdx - 1].id);
  };
  const handleNext = () => {
    if (currentIdx < allGuruList.length - 1) setSelectedGuruId(allGuruList[currentIdx + 1].id);
  };

  const handlePrintCard = () => {
    const printContent = document.getElementById('printable-guru-card');
    if (!printContent) return;

    const win = window.open('', '', 'width=800,height=900');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu Tugas Guru Piket - ${activeGuru.nama}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
              .card-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body class="bg-white flex flex-col items-center justify-center min-h-screen p-6 font-sans">
          <div className="no-print mb-4 text-center">
            <button onclick="window.print()" style="padding: 10px 24px; background: #2563eb; color: white; border-none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              🖨️ Cetak Kartu Sekarang
            </button>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Theme Styles mapping
  const themeStyles = {
    blue: {
      headerBg: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      accentColor: 'text-blue-700',
      borderColor: 'border-blue-600',
      qrColor: '#1e40af',
    },
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accentColor: 'text-emerald-700',
      borderColor: 'border-emerald-600',
      qrColor: '#065f46',
    },
    navy: {
      headerBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      accentColor: 'text-indigo-900',
      borderColor: 'border-indigo-900',
      qrColor: '#1e1b4b',
    },
    amber: {
      headerBg: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      accentColor: 'text-amber-700',
      borderColor: 'border-amber-600',
      qrColor: '#78350f',
    },
  }[cardTheme];

  const namaSekolah = schoolConfig?.namaSekolah || 'SMA NEGERI 1 DEMO';
  const npsn = schoolConfig?.npsn || '20109999';
  const kepalaSekolah = schoolConfig?.kepalaSekolah || 'Drs. H. M. Supriyadi, M.Pd';
  const nipKepala = schoolConfig?.nipKepalaSekolah || '196805121993031004';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kartu Profil & ID Tugas Guru Piket" size="xl">
      <div className="space-y-6">
        {/* Top Action Bar & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          {/* Guru Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrev}
              disabled={currentIdx <= 0}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              title="Guru Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={activeGuru.id}
              onChange={e => setSelectedGuruId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none flex-1 sm:w-64"
            >
              {allGuruList.map(g => (
                <option key={g.id} value={g.id}>
                  {g.nama} ({g.nip})
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={currentIdx >= allGuruList.length - 1}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              title="Guru Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Controls: Theme & Side & Print */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Side Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold">
              <button
                onClick={() => setCardSide('front')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  cardSide === 'front' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Depan
              </button>
              <button
                onClick={() => setCardSide('back')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  cardSide === 'back' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Belakang
              </button>
              <button
                onClick={() => setCardSide('both')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  cardSide === 'both' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Semua
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-slate-600">
              <button
                onClick={() => setCardTheme('blue')}
                className={`w-5 h-5 rounded-full bg-blue-600 ring-2 ${cardTheme === 'blue' ? 'ring-blue-400 scale-110' : 'ring-transparent'}`}
                title="Tema Biru Royal"
              />
              <button
                onClick={() => setCardTheme('emerald')}
                className={`w-5 h-5 rounded-full bg-emerald-600 ring-2 ${cardTheme === 'emerald' ? 'ring-emerald-400 scale-110' : 'ring-transparent'}`}
                title="Tema Hijau Emerald"
              />
              <button
                onClick={() => setCardTheme('navy')}
                className={`w-5 h-5 rounded-full bg-slate-900 ring-2 ${cardTheme === 'navy' ? 'ring-slate-400 scale-110' : 'ring-transparent'}`}
                title="Tema Dark Navy"
              />
              <button
                onClick={() => setCardTheme('amber')}
                className={`w-5 h-5 rounded-full bg-amber-600 ring-2 ${cardTheme === 'amber' ? 'ring-amber-400 scale-110' : 'ring-transparent'}`}
                title="Tema Amber Gold"
              />
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrintCard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all ml-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu ID</span>
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div id="printable-guru-card" className="flex flex-col md:flex-row items-center justify-center gap-6 p-4">
          {/* TAMPAK DEPAN (FRONT) */}
          {(cardSide === 'front' || cardSide === 'both') && (
            <div className="card-container w-[350px] h-[520px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between relative transition-all">
              {/* Header Gradient */}
              <div className={`${themeStyles.headerBg} p-5 text-white text-center relative`}>
                <div className="absolute top-3 left-3 flex items-center gap-1 opacity-80">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">RESMI</span>
                </div>
                <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Award className="w-7 h-7 text-amber-300" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide line-clamp-1 leading-tight">
                  {namaSekolah}
                </h3>
                <p className="text-[10px] text-white/80 font-medium tracking-wider">
                  NPSN: {npsn} • KARTU TUGAS GURU PIKET
                </p>
                <div className="w-full h-1 bg-gradient-to-r from-amber-400 via-white to-amber-400 mt-3 rounded-full opacity-70" />
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col items-center justify-between text-center relative z-10">
                {/* Photo Badge */}
                <div className="relative -mt-10 mb-2">
                  <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center text-slate-400">
                    <img
                      src={
                        activeGuru.jenisKelamin === 'L'
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
                      }
                      alt={activeGuru.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm border border-amber-300 whitespace-nowrap">
                    GURU PIKET
                  </span>
                </div>

                {/* Name & NIP */}
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {activeGuru.nama}
                  </h4>
                  <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    NIP: {activeGuru.nip}
                  </p>
                </div>

                {/* Details Badges */}
                <div className="w-full grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium my-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Jenis Kelamin</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeGuru.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Status Kedinasan</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {activeGuru.status || 'Aktif'}
                    </span>
                  </div>
                </div>

                {/* QR Code & Barcode Verification */}
                <div className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="text-left space-y-0.5">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      VERIFIKASI DIGITAL
                    </span>
                    <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 font-bold">
                      ID: {activeGuru.id}
                    </p>
                    <p className="text-[9px] text-slate-500">Sistem Presensi Piket</p>
                  </div>

                  {/* SVG QR Code */}
                  <div className="w-12 h-12 bg-white p-1 rounded-xl shadow-inner border border-slate-200 flex items-center justify-center">
                    <QrCode className="w-10 h-10" style={{ color: themeStyles.qrColor }} />
                  </div>
                </div>
              </div>

              {/* Card Footer Stamp */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Berlaku T.A 2025/2026</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ttd. Kepala Sekolah
                </span>
              </div>
            </div>
          )}

          {/* TAMPAK BELAKANG (BACK) */}
          {(cardSide === 'back' || cardSide === 'both') && (
            <div className="card-container w-[350px] h-[520px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between relative transition-all">
              {/* Top Bar */}
              <div className={`${themeStyles.headerBg} p-4 text-white text-center`}>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">
                  TATA TERTIB & HAK GURU PIKET
                </h4>
                <p className="text-[10px] text-white/80 font-medium">
                  {namaSekolah}
                </p>
              </div>

              {/* Rules & Duties List */}
              <div className="p-4 flex-1 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Tugas & Kewajiban Utama:
                </div>

                <ul className="space-y-2 text-[11px] leading-tight">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Hadir 15 menit sebelum bel masuk dan menyambut kedatangan siswa di gerbang sekolah.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Mengawasi ketertiban KBM serta mencatat kelas kosong atau guru yang berhalangan hadir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Memberikan izin keluar lingkungan sekolah bagi siswa dengan alasan khusus/valid.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Melakukan rekapitulasi presensi piket harian pada aplikasi E-Piket Sekolah.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Mengatur kelancaran dan ketertiban penjemputan/kepulangan siswa akhir jam pelajaran.</span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3 h-3 text-blue-500" />
                    <span>No. HP Guru: <strong className="text-slate-900 dark:text-white">{activeGuru.noHp}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3 h-3 text-blue-500" />
                    <span>Email: <strong className="text-slate-900 dark:text-white">{activeGuru.email || '-'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Signature & Seal */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-left">
                <div>
                  <p className="text-[9px] text-slate-400">Ditetapkan Oleh:</p>
                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{kepalaSekolah}</p>
                  <p className="text-[9px] text-slate-500 font-mono">NIP: {nipKepala}</p>
                </div>
                <div className="w-14 h-14 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-400 text-center leading-tight p-1">
                  STAMP
                  <br />
                  SEKOLAH
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
