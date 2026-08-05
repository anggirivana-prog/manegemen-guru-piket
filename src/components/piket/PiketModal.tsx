import React, { useState } from 'react';
import { MasterPiket } from '../../types';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { notify } from '../../utils/helpers';

interface PiketModalProps {
  piketList: MasterPiket[];
  onSaveList: (list: MasterPiket[]) => void;
}

export const PiketManagement: React.FC<PiketModalProps> = ({ piketList, onSaveList }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterPiket | null>(null);

  const [jenisPiket, setJenisPiket] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jamMulai, setJamMulai] = useState('06:15');
  const [jamSelesai, setJamSelesai] = useState('07:00');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setJenisPiket('');
    setDeskripsi('');
    setJamMulai('06:15');
    setJamSelesai('07:00');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MasterPiket) => {
    setEditingItem(item);
    setJenisPiket(item.jenisPiket);
    setDeskripsi(item.deskripsi);
    setJamMulai(item.jamMulai);
    setJamSelesai(item.jamSelesai);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = piketList.filter(p => p.id !== id);
    onSaveList(updated);
    notify.success('Jenis Piket Berhasil Dihapus');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisPiket.trim()) {
      notify.error('Jenis piket wajib diisi');
      return;
    }

    if (editingItem) {
      const updated = piketList.map(p =>
        p.id === editingItem.id
          ? { ...p, jenisPiket, deskripsi, jamMulai, jamSelesai }
          : p
      );
      onSaveList(updated);
      notify.success('Jenis piket diperbarui');
    } else {
      const newItem: MasterPiket = {
        id: 'PKT-' + Math.floor(100 + Math.random() * 900),
        jenisPiket,
        deskripsi,
        jamMulai,
        jamSelesai,
      };
      onSaveList([...piketList, newItem]);
      notify.success('Jenis piket ditambahkan');
    }

    setIsModalOpen(false);
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Master Jenis Piket
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atur kategori tugas piket guru (Penyambutan Siswa, Penggerak Sholat, Kepulangan)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jenis Piket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {piketList.map(p => (
          <div
            key={p.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 relative group"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {p.jenisPiket}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1 text-slate-400 hover:text-blue-600"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {p.deskripsi || 'Tidak ada deskripsi'}
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 p-2 rounded-lg border border-blue-100 dark:border-blue-900">
              <Clock className="w-3.5 h-3.5" />
              <span>Jam Operasional: {p.jamMulai} - {p.jamSelesai} WIB</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Jenis Piket' : 'Tambah Jenis Piket Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama / Jenis Piket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jenisPiket}
              onChange={e => setJenisPiket(e.target.value)}
              placeholder="Contoh: Penyambutan Siswa"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Tugas
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
              placeholder="Tuliskan perincian tugas piket..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={jamMulai}
                onChange={e => setJamMulai(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={jamSelesai}
                onChange={e => setJamSelesai(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
