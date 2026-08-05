import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../common/Card';

const dutyData = [
  { name: 'Penyambutan Siswa', value: 45, color: '#2563EB' },
  { name: 'Penggerak Sholat', value: 35, color: '#10B981' },
  { name: 'Kepulangan', value: 20, color: '#F59E0B' },
];

export const DutyChart: React.FC = () => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Grafik Jenis Piket
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribusi persentase jenis tugas piket
        </p>
      </div>

      <div className="h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dutyData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {dutyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
