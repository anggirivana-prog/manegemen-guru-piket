import React from 'react';
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserX
} from 'lucide-react';
import { DashboardKPI } from '../../types';
import { Card } from '../common/Card';

interface KpiCardsProps {
  kpi: DashboardKPI;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpi }) => {
  const cards = [
    {
      title: 'Total Guru Master',
      value: kpi.totalGuru,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    },
    {
      title: 'Total Jadwal Piket',
      value: kpi.totalJadwal,
      icon: CalendarCheck,
      color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    },
    {
      title: 'Presensi Hari Ini',
      value: kpi.totalPresensiHariIni,
      icon: CheckCircle2,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    },
    {
      title: 'Tepat Waktu (<=06:45)',
      value: kpi.tepatWaktu,
      icon: Clock,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    },
    {
      title: 'Terlambat (>06:45)',
      value: kpi.terlambat,
      icon: AlertTriangle,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    },
    {
      title: 'Tidak Hadir / Izin',
      value: kpi.tidakHadir,
      icon: UserX,
      color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="!p-4 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {card.value}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
