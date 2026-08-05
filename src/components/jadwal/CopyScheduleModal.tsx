import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { getCurrentDateFormatted } from '../../utils/dateUtils';
import { Copy } from 'lucide-react';

interface CopyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (fromDate: string, toDate: string) => void;
}

export const CopyScheduleModal: React.FC<CopyScheduleModalProps> = ({
  isOpen,
  onClose,
  onCopy,
}) => {
  const [fromDate, setFromDate] = useState(getCurrentDateFormatted());
  const [toDate, setToDate] = useState(getCurrentDateFormatted());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return;
    onCopy(fromDate, toDate);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplikasi / Copy Jadwal Piket"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300">
          Gunakan fitur ini untuk menyalin seluruh jadwal piket pada tanggal tertentu ke tanggal tujuan berikutnya (misalnya minggu/bulan berikutnya).
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Salin dari Tanggal Sumber:
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tempel ke Tanggal Tujuan:
          </label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
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
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Proses Duplikasi</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
