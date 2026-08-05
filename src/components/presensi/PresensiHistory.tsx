import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Trash2,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Presensi, PengaturanSekolah } from '../../types';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { formatDateIndonesian } from '../../utils/dateUtils';
import { exportToExcel, exportToPDF, printWindow } from '../../utils/exportUtils';
import { notify } from '../../utils/helpers';

interface PresensiHistoryProps {
  presensiList: Presensi[];
  onDeletePresensi?: (id: string) => void;
  schoolConfig?: PengaturanSekolah;
}

export const PresensiHistory: React.FC<PresensiHistoryProps> = ({
  presensiList,
  onDeletePresensi,
  schoolConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDuty, setFilterDuty] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pageSize = 8;

  const filteredItems = presensiList.filter(p => {
    const matchesSearch =
      p.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jenisPiket.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tanggal.includes(searchQuery);
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchesDuty = filterDuty === 'All' || p.jenisPiket === filterDuty;
    return matchesSearch && matchesStatus && matchesDuty;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportExcel = () => {
    const data = filteredItems.map((p, idx) => ({
      No: idx + 1,
      Tanggal: p.tanggal,
      Hari: p.hari,
      'Jenis Piket': p.jenisPiket,
      'Nama Guru': p.namaGuru,
      'Jam Datang': p.jamDatang,
      'Jam Pulang': p.jamPulang,
      Status: p.status,
      Keterangan: p.keterangan,
      GPS: p.latitude && p.longitude ? `${p.latitude}, ${p.longitude}` : '-',
    }));
    exportToExcel(data, 'Riwayat_Presensi_Piket', 'Presensi');
    notify.success('Export Excel Berhasil');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Tanggal', 'Jenis Piket', 'Nama Guru', 'Datang', 'Pulang', 'Status', 'Keterangan'];
    const rows = filteredItems.map((p, idx) => [
      idx + 1,
      `${p.hari}, ${p.tanggal}`,
      p.jenisPiket,
      p.namaGuru,
      p.jamDatang,
      p.jamPulang,
      p.status,
      p.keterangan || '-',
    ]);
    exportToPDF('LAPORAN RIWAYAT PRESENSI PIKET GURU', headers, rows, 'Riwayat_Presensi', schoolConfig);
    notify.success('Export PDF Berhasil');
  };

  const handlePrint = () => {
    const headers = ['No', 'Tanggal', 'Jenis Piket', 'Nama Guru', 'Datang', 'Pulang', 'Status', 'Keterangan'];
    const rows = filteredItems.map((p, idx) => [
      idx + 1,
      `${p.hari}, ${p.tanggal}`,
      p.jenisPiket,
      p.namaGuru,
      p.jamDatang,
      p.jamPulang,
      p.status,
      p.keterangan || '-',
    ]);
    printWindow('LAPORAN RIWAYAT PRESENSI PIKET GURU', headers, rows, schoolConfig);
  };

  return (
    <Card className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Riwayat Presensi Piket
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar lengkap rekaman kehadiran piket guru beserta bukti foto & lokasi GPS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 border border-red-200 dark:border-red-800 hover:bg-red-100"
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

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, jenis piket, atau tanggal..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">Semua Status</option>
            <option value="Tepat Waktu">Tepat Waktu</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Tidak Hadir">Tidak Hadir</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <th className="p-3">No</th>
              <th className="p-3">Tanggal / Hari</th>
              <th className="p-3">Nama Guru</th>
              <th className="p-3">Jenis Piket</th>
              <th className="p-3">Jam Datang</th>
              <th className="p-3">Status</th>
              <th className="p-3">Bukti Foto</th>
              <th className="p-3">GPS</th>
              {onDeletePresensi && <th className="p-3 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  Riwayat presensi tidak ditemukan.
                </td>
              </tr>
            ) : (
              paginatedItems.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    <div>{formatDateIndonesian(p.tanggal)}</div>
                    <span className="text-[10px] text-slate-400">{p.hari}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {p.namaGuru}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{p.jenisPiket}</td>
                  <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {p.jamDatang} WIB
                  </td>
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
                  <td className="p-3">
                    {p.foto ? (
                      <button
                        onClick={() => setSelectedImage(p.foto!)}
                        className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 group"
                      >
                        <img src={p.foto} alt="Foto" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Tidak ada</span>
                    )}
                  </td>
                  <td className="p-3">
                    {p.latitude && p.longitude ? (
                      <a
                        href={`https://maps.google.com/?q=${p.latitude},${p.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px]"
                      >
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>Map</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  {onDeletePresensi && (
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeletePresensi(p.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                        title="Hapus Presensi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan {paginatedItems.length} dari {filteredItems.length} data presensi
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo Preview Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Pratinjau Foto Bukti Piket"
        maxWidth="md"
      >
        {selectedImage && (
          <div className="p-2 flex justify-center">
            <img
              src={selectedImage}
              alt="Bukti Foto"
              className="max-h-[70vh] rounded-xl object-contain border border-slate-200 dark:border-slate-800"
            />
          </div>
        )}
      </Modal>
    </Card>
  );
};
