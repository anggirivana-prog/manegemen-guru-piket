import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { Jadwal, Guru, MasterPiket, PengaturanSekolah } from '../../types';
import { Card } from '../common/Card';
import { formatDateIndonesian } from '../../utils/dateUtils';
import { notify } from '../../utils/helpers';

interface JadwalTableProps {
  jadwalList: Jadwal[];
  guruList: Guru[];
  piketList: MasterPiket[];
  onAddJadwal: () => void;
  onEditJadwal: (jadwal: Jadwal) => void;
  onDeleteJadwal: (id: string) => void;
  onOpenCopyModal: () => void;
  schoolConfig?: PengaturanSekolah;
}

export const JadwalTable: React.FC<JadwalTableProps> = ({
  jadwalList,
  guruList,
  piketList,
  onAddJadwal,
  onEditJadwal,
  onDeleteJadwal,
  onOpenCopyModal,
}) => {
  const [filterDuty, setFilterDuty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJadwal = jadwalList.filter(j => {
    const matchesDuty = filterDuty === 'All' || j.jenisPiket === filterDuty;
    const matchesSearch =
      j.hari.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.tanggal.includes(searchQuery) ||
      j.guru1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.guru2.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.guru3.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.guru4.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDuty && matchesSearch;
  });

  return (
    <Card className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Jadwal Piket Guru
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atur pembagian piket harian guru per jenis kegiatan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCopyModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span>Duplikasi Jadwal</span>
          </button>

          <button
            onClick={onAddJadwal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tanggal, hari, atau nama guru..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={filterDuty}
            onChange={e => setFilterDuty(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">Semua Jenis Piket</option>
            {piketList.map(p => (
              <option key={p.id} value={p.jenisPiket}>
                {p.jenisPiket}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJadwal.length === 0 ? (
          <div className="col-span-full py-10 text-center text-slate-500 text-xs">
            Tidak ada jadwal piket yang sesuai filter.
          </div>
        ) : (
          filteredJadwal.map(j => (
            <div
              key={j.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 relative hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 inline-block mb-1">
                    {j.hari}, {formatDateIndonesian(j.tanggal)}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {j.jenisPiket}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditJadwal(j)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                    title="Edit Jadwal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteJadwal(j.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" /> Tim Piket Bertugas:
                </p>
                <ul className="text-xs space-y-1 pl-2 text-slate-800 dark:text-slate-200">
                  {j.guru1 && <li className="font-semibold text-blue-700 dark:text-blue-400">1. {j.guru1} (Ketua)</li>}
                  {j.guru2 && <li>2. {j.guru2}</li>}
                  {j.guru3 && <li>3. {j.guru3}</li>}
                  {j.guru4 && <li>4. {j.guru4}</li>}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
