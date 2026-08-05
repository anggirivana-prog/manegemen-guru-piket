import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  IdCard
} from 'lucide-react';
import { Guru, PengaturanSekolah } from '../../types';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { exportToExcel, exportToPDF, printWindow, exportToCSV } from '../../utils/exportUtils';
import { notify } from '../../utils/helpers';
import { GuruProfileCardModal } from './GuruProfileCardModal';

interface GuruTableProps {
  guruList: Guru[];
  onAddGuru: () => void;
  onEditGuru: (guru: Guru) => void;
  onDeleteGuru: (id: string) => void;
  schoolConfig?: PengaturanSekolah;
}

export const GuruTable: React.FC<GuruTableProps> = ({
  guruList,
  onAddGuru,
  onEditGuru,
  onDeleteGuru,
  schoolConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'All' | 'L' | 'P'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Aktif' | 'Nonaktif'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Profile Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCardGuru, setSelectedCardGuru] = useState<Guru | null>(null);

  const handleOpenCardModal = (guru?: Guru) => {
    setSelectedCardGuru(guru || guruList[0] || null);
    setIsCardModalOpen(true);
  };

  // Filtered
  const filteredGuru = guruList.filter(g => {
    const matchesSearch =
      g.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === 'All' || g.jenisKelamin === filterGender;
    const matchesStatus = filterStatus === 'All' || g.status === filterStatus;
    return matchesSearch && matchesGender && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGuru.length / pageSize) || 1;
  const paginatedGuru = filteredGuru.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportExcel = () => {
    const data = filteredGuru.map((g, idx) => ({
      No: idx + 1,
      NIP: g.nip,
      'Nama Guru': g.nama,
      'Jenis Kelamin': g.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'No. HP': g.noHp,
      Email: g.email,
      Status: g.status,
    }));
    exportToExcel(data, 'Master_Guru_Piket', 'Master Guru');
    notify.success('Export Excel Berhasil');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'NIP', 'Nama Guru', 'JK', 'No HP', 'Email', 'Status'];
    const rows = filteredGuru.map((g, idx) => [
      idx + 1,
      g.nip,
      g.nama,
      g.jenisKelamin,
      g.noHp,
      g.email,
      g.status,
    ]);
    exportToPDF('DATA MASTER GURU PIKET', headers, rows, 'Master_Guru', schoolConfig);
    notify.success('Export PDF Berhasil');
  };

  const handlePrint = () => {
    const headers = ['No', 'NIP', 'Nama Guru', 'JK', 'No HP', 'Email', 'Status'];
    const rows = filteredGuru.map((g, idx) => [
      idx + 1,
      g.nip,
      g.nama,
      g.jenisKelamin,
      g.noHp,
      g.email,
      g.status,
    ]);
    printWindow('DATA MASTER GURU PIKET', headers, rows, schoolConfig);
  };

  return (
    <Card className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Master Data Guru Piket
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola daftar guru piket, NIP, serta status keaktifan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenCardModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Kartu ID Guru</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={onAddGuru}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari NIP, nama guru, atau email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value as 'All' | 'L' | 'P')}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">Semua JK</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'All' | 'Aktif' | 'Nonaktif')}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <th className="p-3">No</th>
              <th className="p-3">NIP / NUPTK</th>
              <th className="p-3">Nama Guru</th>
              <th className="p-3">JK</th>
              <th className="p-3">No. HP</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedGuru.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Data guru tidak ditemukan.
                </td>
              </tr>
            ) : (
              paginatedGuru.map((guru, index) => (
                <tr
                  key={guru.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 font-semibold text-slate-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                    {guru.nip}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {guru.nama}
                  </td>
                  <td className="p-3 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] ${
                        guru.jenisKelamin === 'L'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300'
                      }`}
                    >
                      {guru.jenisKelamin === 'L' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {guru.noHp}
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">
                    {guru.email || '-'}
                  </td>
                  <td className="p-3">
                    <Badge variant={guru.status === 'Aktif' ? 'success' : 'danger'} size="sm">
                      {guru.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenCardModal(guru)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        title="Lihat Kartu ID / Profil Guru"
                      >
                        <IdCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditGuru(guru)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        title="Edit Data Guru"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGuru(guru.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        title="Hapus Data Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan {paginatedGuru.length} dari {filteredGuru.length} data guru
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
            Halaman {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Profile Card ID Guru */}
      <GuruProfileCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        guru={selectedCardGuru}
        allGuruList={guruList}
        schoolConfig={schoolConfig}
      />
    </Card>
  );
};
