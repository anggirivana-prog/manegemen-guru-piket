import React, { useState, useEffect } from 'react';
import { Jadwal, Guru, MasterPiket } from '../../types';
import { Modal } from '../common/Modal';
import { getHariFromDateStr, getCurrentDateFormatted } from '../../utils/dateUtils';

interface JadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jadwal: Omit<Jadwal, 'id'> | Jadwal) => void;
  initialData?: Jadwal | null;
  guruList: Guru[];
  piketList: MasterPiket[];
}

export const JadwalModal: React.FC<JadwalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  guruList,
  piketList,
}) => {
  const [tanggal, setTanggal] = useState(getCurrentDateFormatted());
  const [hari, setHari] = useState('Rabu');
  const [jenisPiket, setJenisPiket] = useState('Penyambutan Siswa');
  const [guru1, setGuru1] = useState('');
  const [guru2, setGuru2] = useState('');
  const [guru3, setGuru3] = useState('');
  const [guru4, setGuru4] = useState('');

  useEffect(() => {
    if (initialData) {
      setTanggal(initialData.tanggal);
      setHari(initialData.hari);
      setJenisPiket(initialData.jenisPiket);
      setGuru1(initialData.guru1);
      setGuru2(initialData.guru2);
      setGuru3(initialData.guru3);
      setGuru4(initialData.guru4);
    } else {
      const today = getCurrentDateFormatted();
      setTanggal(today);
      setHari(getHariFromDateStr(today));
      setJenisPiket(piketList[0]?.jenisPiket || 'Penyambutan Siswa');
      const activeGurus = guruList.filter(g => g.status === 'Aktif');
      setGuru1(activeGurus[0]?.nama || '');
      setGuru2(activeGurus[1]?.nama || '');
      setGuru3(activeGurus[2]?.nama || '');
      setGuru4(activeGurus[3]?.nama || '');
    }
  }, [initialData, isOpen, guruList, piketList]);

  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTanggal(newDate);
    setHari(getHariFromDateStr(newDate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !jenisPiket || !guru1) {
      return;
    }

    if (initialData) {
      onSave({
        ...initialData,
        tanggal,
        hari,
        jenisPiket,
        guru1,
        guru2,
        guru3,
        guru4,
      });
    } else {
      onSave({
        tanggal,
        hari,
        jenisPiket,
        guru1,
        guru2,
        guru3,
        guru4,
      });
    }
    onClose();
  };

  const activeGurus = guruList.filter(g => g.status === 'Aktif');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Jadwal Piket' : 'Tambah Jadwal Piket Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Piket <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={handleTanggalChange}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hari (Otomatis)
            </label>
            <input
              type="text"
              readOnly
              value={hari}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

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

        {/* Guru 1 to 4 */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            Petugas Guru Piket (Maksimal 4 Guru):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Guru 1 (Ketua Tim Piket) *
              </label>
              <select
                value={guru1}
                onChange={e => setGuru1(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Guru 1 --</option>
                {activeGurus.map(g => (
                  <option key={g.id} value={g.nama}>
                    {g.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Guru 2
              </label>
              <select
                value={guru2}
                onChange={e => setGuru2(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Kosong / Pilih Guru 2 --</option>
                {activeGurus.map(g => (
                  <option key={g.id} value={g.nama}>
                    {g.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Guru 3
              </label>
              <select
                value={guru3}
                onChange={e => setGuru3(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Kosong / Pilih Guru 3 --</option>
                {activeGurus.map(g => (
                  <option key={g.id} value={g.nama}>
                    {g.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Guru 4
              </label>
              <select
                value={guru4}
                onChange={e => setGuru4(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Kosong / Pilih Guru 4 --</option>
                {activeGurus.map(g => (
                  <option key={g.id} value={g.nama}>
                    {g.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Simpan Jadwal
          </button>
        </div>
      </form>
    </Modal>
  );
};
