import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { UserCircle, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { notify } from '../../utils/helpers';

interface ProfileViewProps {
  currentUser: User | null;
  onUpdatePassword: (newPass: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdatePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      notify.error('Password baru minimal 4 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify.error('Konfirmasi password tidak cocok');
      return;
    }

    onUpdatePassword(newPassword);
    notify.success('Password berhasil diperbarui!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20">
            {currentUser.nama.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentUser.nama}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Username: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">@{currentUser.username}</span>
            </p>
            <Badge
              variant={
                currentUser.role === 'Admin'
                  ? 'danger'
                  : currentUser.role === 'Operator'
                  ? 'warning'
                  : 'info'
              }
            >
              Hak Akses: {currentUser.role}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Key className="w-4 h-4 text-blue-600" />
            <span>Ubah Password Akun</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimal 4 karakter"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Konfirmasi Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Simpan Password Baru
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
