import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserX
} from 'lucide-react';
import { Presensi, Guru, MasterPiket, PengaturanSekolah } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDateIndonesian } from '../../utils/dateUtils';
import { exportToExcel, exportToPDF, printWindow } from '../../utils/exportUtils';
import { notify } from '../../utils/helpers';

interface ReportTablesProps {
  presensiList: Presensi[];
  guruList: Guru[];
  piketList: MasterPiket[];
  schoolConfig?: PengaturanSekolah;
}

export const ReportTables: React.FC<ReportTablesProps> = ({
  presensiList,
  guruList,
  piketList,
  schoolConfig,
}) => {
  const [reportType, setReportType] = useState<
    'harian' | 'mingguan' | 'bulanan' | 'tahunan' | 'rekap_guru' | 'rekap_piket'
  >('bulanan');

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedGuru, setSelectedGuru] = useState('All');
  const [selectedDuty, setSelectedDuty] = useState('All');

  // Compute Rekap Guru statistics
  const guruRecap = guruList.map(g => {
    const guruPresensi = presensiList.filter(p => p.namaGuru === g.nama);
    const tepatWaktu = guruPresensi.filter(p => p.status === 'Tepat Waktu').length;
    const terlambat = guruPresensi.filter(p => p.status === 'Terlambat').length;
    const tidakHadir = guruPresensi.filter(p => p.status === 'Tidak Hadir' || p.status === 'Izin/Sakit').length;
    return {
      nama: g.nama,
      nip: g.nip,
      totalPiket: guruPresensi.length,
      tepatWaktu,
      terlambat,
      tidakHadir,
      persentase: guruPresensi.length > 0 ? Math.round((tepatWaktu / guruPresensi.length) * 100) : 0,
    };
  });

  // Filter presensi based on criteria
  const filteredPresensi = presensiList.filter(p => {
    const pDate = new Date(p.tanggal);
    const pMonth = String(pDate.getMonth() + 1).padStart(2, '0');
    const pYear = String(pDate.getFullYear());

    if (reportType === 'harian' && p.tanggal !== selectedDate) return false;
    if (reportType === 'bulanan' && (pMonth !== selectedMonth || pYear !== selectedYear)) return false;
    if (reportType === 'tahunan' && pYear !== selectedYear) return false;

    if (selectedGuru !== 'All' && p.namaGuru !== selectedGuru) return false;
    if (selectedDuty !== 'All' && p.jenisPiket !== selectedDuty) return false;

    return true;
  });

  const handleExportExcel = () => {
    if (reportType === 'rekap_guru') {
      const data = guruRecap.map((g, i) => ({
        No: i + 1,
        NIP: g.nip,
        'Nama Guru': g.nama,
        'Total Tugas': g.totalPiket,
        'Tepat Waktu': g.tepatWaktu,
        Terlambat: g.terlambat,
        'Tidak Hadir': g.tidakHadir,
        'Persentase Ketepatan': `${g.persentase}%`,
      }));
      exportToExcel(data, 'Rekap_Kinerja_Guru_Piket');
    } else {
      const data = filteredPresensi.map((p, i) => ({
        No: i + 1,
        Tanggal: p.tanggal,
        Hari: p.hari,
        'Jenis Piket': p.jenisPiket,
        'Nama Guru': p.namaGuru,
        'Jam Datang': p.jamDatang,
        Status: p.status,
        Keterangan: p.keterangan || '-',
      }));
      exportToExcel(data, `Laporan_${reportType}_Guru_Piket`);
    }
    notify.success('Export Excel Berhasil!');
  };

  const handleExportPDF = () => {
    if (reportType === 'rekap_guru') {
      const headers = ['No', 'NIP', 'Nama Guru', 'Total', 'Tepat Waktu', 'Terlambat', 'Absen', 'Ketepatan'];
      const rows = guruRecap.map((g, i) => [
        i + 1,
        g.nip,
        g.nama,
        g.totalPiket,
        g.tepatWaktu,
        g.terlambat,
        g.tidakHadir,
        `${g.persentase}%`,
      ]);
      exportToPDF('REKAPITULASI KINERJA PRESENSI GURU PIKET', headers, rows, 'Rekap_Guru_Piket', schoolConfig);
    } else {
      const headers = ['No', 'Tanggal', 'Jenis Piket', 'Nama Guru', 'Jam Datang', 'Status', 'Keterangan'];
      const rows = filteredPresensi.map((p, i) => [
        i + 1,
        `${p.hari}, ${p.tanggal}`,
        p.jenisPiket,
        p.namaGuru,
        p.jamDatang,
        p.status,
        p.keterangan || '-',
      ]);
      exportToPDF(`LAPORAN ${reportType.toUpperCase()} PRESENSI GURU PIKET`, headers, rows, 'Laporan_Presensi', schoolConfig);
    }
    notify.success('Export PDF Berhasil!');
  };

  const handlePrint = () => {
    if (reportType === 'rekap_guru') {
      const headers = ['No', 'NIP', 'Nama Guru', 'Total', 'Tepat Waktu', 'Terlambat', 'Absen', 'Ketepatan'];
      const rows = guruRecap.map((g, i) => [
        i + 1,
        g.nip,
        g.nama,
        g.totalPiket,
        g.tepatWaktu,
        g.terlambat,
        g.tidakHadir,
        `${g.persentase}%`,
      ]);
      printWindow('REKAPITULASI KINERJA PRESENSI GURU PIKET', headers, rows, schoolConfig);
    } else {
      const headers = ['No', 'Tanggal', 'Jenis Piket', 'Nama Guru', 'Jam Datang', 'Status', 'Keterangan'];
      const rows = filteredPresensi.map((p, i) => [
        i + 1,
        `${p.hari}, ${p.tanggal}`,
        p.jenisPiket,
        p.namaGuru,
        p.jamDatang,
        p.status,
        p.keterangan || '-',
      ]);
      printWindow(`LAPORAN ${reportType.toUpperCase()} PRESENSI GURU PIKET`, headers, rows, schoolConfig);
    }
  };

  return (
    <Card className="space-y-4">
      {/* Report Type Selector Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Laporan Rekapitulasi Presensi Piket
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cetak rekap harian, bulanan, tahunan, serta evaluasi kinerja guru
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 border border-emerald-200 hover:bg-emerald-100"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 border border-red-200 hover:bg-red-100"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'harian', label: 'Laporan Harian' },
          { id: 'bulanan', label: 'Laporan Bulanan' },
          { id: 'tahunan', label: 'Laporan Tahunan' },
          { id: 'rekap_guru', label: 'Rekap Kinerja Guru' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              reportType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
        {reportType === 'harian' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Pilih Tanggal:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        )}

        {(reportType === 'bulanan' || reportType === 'rekap_guru') && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Bulan:
            </label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Tahun:
          </label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Filter Guru:
          </label>
          <select
            value={selectedGuru}
            onChange={e => setSelectedGuru(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">Semua Guru</option>
            {guruList.map(g => (
              <option key={g.id} value={g.nama}>
                {g.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render Tables */}
      {reportType === 'rekap_guru' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">No</th>
                <th className="p-3">NIP</th>
                <th className="p-3">Nama Guru</th>
                <th className="p-3">Total Piket</th>
                <th className="p-3">Tepat Waktu</th>
                <th className="p-3">Terlambat</th>
                <th className="p-3">Tidak Hadir</th>
                <th className="p-3">Tingkat Ketepatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {guruRecap.map((g, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-500">{index + 1}</td>
                  <td className="p-3 font-mono text-slate-500">{g.nip}</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{g.nama}</td>
                  <td className="p-3 font-bold">{g.totalPiket}</td>
                  <td className="p-3 text-emerald-600 font-semibold">{g.tepatWaktu}</td>
                  <td className="p-3 text-amber-600 font-semibold">{g.terlambat}</td>
                  <td className="p-3 text-red-600 font-semibold">{g.tidakHadir}</td>
                  <td className="p-3 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        g.persentase >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : g.persentase >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {g.persentase}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">No</th>
                <th className="p-3">Tanggal / Hari</th>
                <th className="p-3">Jenis Piket</th>
                <th className="p-3">Nama Guru</th>
                <th className="p-3">Jam Datang</th>
                <th className="p-3">Status</th>
                <th className="p-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPresensi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    Tidak ada rekaman presensi pada kriteria laporan ini.
                  </td>
                </tr>
              ) : (
                filteredPresensi.map((p, index) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-500">{index + 1}</td>
                    <td className="p-3 font-medium">
                      {formatDateIndonesian(p.tanggal)} ({p.hari})
                    </td>
                    <td className="p-3">{p.jenisPiket}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {p.namaGuru}
                    </td>
                    <td className="p-3 font-mono font-bold">{p.jamDatang} WIB</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          p.status === 'Tepat Waktu'
                            ? 'success'
                            : p.status === 'Terlambat'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-500">{p.keterangan || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
