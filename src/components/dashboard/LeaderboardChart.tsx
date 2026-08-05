import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Card } from '../common/Card';
import { Award } from 'lucide-react';

interface LeaderboardChartProps {
  data?: Array<{ nama: string; jumlahHadir: number }>;
}

const defaultTeacherData = [
  { nama: 'Drs. H. Budi Santoso', jumlahHadir: 18 },
  { nama: 'Dra. Hj. Ani Wijaya', jumlahHadir: 16 },
  { nama: 'Bambang Sugianto, S.Ag', jumlahHadir: 15 },
  { nama: 'Dewi Lestari, S.Si', jumlahHadir: 14 },
  { nama: 'Ahmad Fauzi, S.Pd', jumlahHadir: 12 },
];

export const LeaderboardChart: React.FC<LeaderboardChartProps> = ({ data = defaultTeacherData }) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Grafik Guru Teraktif</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Top 5 guru paling rajin melaksanakan piket
          </p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis dataKey="nama" type="category" width={120} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="jumlahHadir" fill="#2563EB" radius={[0, 6, 6, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#2563EB'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
