import React, { useState, useEffect } from 'react';
import { Guru } from '../../types';
import { Modal } from '../common/Modal';

interface GuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guru: Omit<Guru, 'id'> | Guru) => void;
  initialData?: Guru | null;
}

export const GuruModal: React.FC<GuruModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setNip(initialData.nip || '');
      setNama(initialData.nama || '');
      setJenisKelamin(initialData.jenisKelamin || 'L');
      setNoHp(initialData.noHp || '');
      setEmail(initialData.email || '');
      setStatus(initialData.status || 'Aktif');
    } else {
      setNip('');
      setNama('');
      setJenisKelamin('L');
      setNoHp('');
      setEmail('');
      setStatus('Aktif');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!nip.trim()) newErrors.nip = 'NIP / NUPTK wajib diisi';
    if (!nama.trim()) newErrors.nama = 'Nama Lengkap Guru wajib diisi';
    if (!noHp.trim()) newErrors.noHp = 'Nomor HP/WhatsApp wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (initialData) {
      onSave({
        ...initialData,
        nip,
        nama,
        jenisKelamin,
        noHp,
        email,
        status,
      });
    } else {
      onSave({
        nip,
        nama,
        jenisKelamin,
        noHp,
        email,
        status,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Data Guru' : 'Tambah Guru Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            NIP / NUPTK <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nip}
            onChange={e => setNip(e.target.value)}
            placeholder="Contoh: 197508122003121001"
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nip && <p className="text-[11px] text-red-500 mt-1">{errors.nip}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Lengkap Guru <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nama}
            onChange={e => setNama(e.target.value)}
            placeholder="Sertakan gelar (Contoh: Drs. H. Budi Santoso, M.Pd)"
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nama && <p className="text-[11px] text-red-500 mt-1">{errors.nama}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={jenisKelamin}
              onChange={e => setJenisKelamin(e.target.value as 'L' | 'P')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status Keaktifan
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No. HP / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={noHp}
              onChange={e => setNoHp(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.noHp && <p className="text-[11px] text-red-500 mt-1">{errors.noHp}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Guru
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="budi@sekolah.sch.id"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            Simpan Guru
          </button>
        </div>
      </form>
    </Modal>
  );
};
