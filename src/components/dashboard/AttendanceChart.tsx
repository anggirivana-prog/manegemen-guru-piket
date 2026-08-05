import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Card } from '../common/Card';

interface AttendanceChartProps {
  data?: Array<{ bulan: string; tepatWaktu: number; terlambat: number; tidakHadir: number }>;
}

const defaultChartData = [
  { bulan: 'Jan', tepatWaktu: 45, terlambat: 6, tidakHadir: 2 },
  { bulan: 'Feb', tepatWaktu: 50, terlambat: 4, tidakHadir: 1 },
  { bulan: 'Mar', tepatWaktu: 48, terlambat: 8, tidakHadir: 3 },
  { bulan: 'Apr', tepatWaktu: 52, terlambat: 3, tidakHadir: 0 },
  { bulan: 'Mei', tepatWaktu: 42, terlambat: 5, tidakHadir: 2 },
  { bulan: 'Jun', tepatWaktu: 55, terlambat: 2, tidakHadir: 1 },
  { bulan: 'Jul', tepatWaktu: 58, terlambat: 3, tidakHadir: 1 },
  { bulan: 'Agt', tepatWaktu: 40, terlambat: 5, tidakHadir: 2 },
];

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data = defaultChartData }) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Grafik Kehadiran Bulanan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perbandingan status kehadiran guru piket per bulan
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="tepatWaktu" name="Tepat Waktu" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="terlambat" name="Terlambat" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
