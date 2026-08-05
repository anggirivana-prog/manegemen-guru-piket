import React from 'react';
import { Clock, MapPin, Camera, User, ArrowRight } from 'lucide-react';
import { Presensi } from '../../types';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface RecentActivityProps {
  items: Presensi[];
  onViewAll: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ items, onViewAll }) => {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Aktivitas Presensi Terbaru
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log kehadiran piket guru secara real-time
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Belum ada aktivitas presensi hari ini.</p>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
            >
              {/* Photo or Avatar */}
              {item.foto ? (
                <img
                  src={item.foto}
                  alt={item.namaGuru}
                  className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800">
                  <User className="w-5 h-5" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.namaGuru}
                  </h4>
                  <Badge
                    variant={
                      item.status === 'Tepat Waktu'
                        ? 'success'
                        : item.status === 'Terlambat'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.jenisPiket}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.jamDatang} WIB
                  </span>
                  {item.latitude && item.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <MapPin className="w-3 h-3" /> GPS
                    </a>
                  )}
                </div>

                {item.keterangan && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic line-clamp-1">
                    "{item.keterangan}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
