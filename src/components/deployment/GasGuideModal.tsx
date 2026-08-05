import React, { useState } from 'react';
import { Card } from '../common/Card';
import {
  Code,
  FileSpreadsheet,
  Globe,
  Copy,
  Check,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import {
  GAS_CODE_GS,
  SPREADSHEET_TEMPLATE_INFO,
  VERCEL_DEPLOYMENT_STEPS
} from '../../data/gasScriptCode';
import { notify } from '../../utils/helpers';

export const GasGuideModal: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSheet, setCopiedSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'gas' | 'sheet' | 'vercel'>('gas');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopiedCode(true);
    notify.success('Kode Apps Script berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopySheet = () => {
    navigator.clipboard.writeText(SPREADSHEET_TEMPLATE_INFO);
    setCopiedSheet(true);
    notify.success('Struktur Spreadsheet berhasil disalin!');
    setTimeout(() => setCopiedSheet(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card className="space-y-4">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Panduan Deployment Google Apps Script & Vercel</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Panduan lengkap untuk meng-host backend REST API di Google Apps Script dan deploy frontend ke Vercel
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('gas')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold ${
              activeTab === 'gas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>1. Google Apps Script (Code.gs)</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold ${
              activeTab === 'sheet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>2. Structure Google Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold ${
              activeTab === 'vercel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3. Deployment Vercel</span>
          </button>
        </div>

        {/* TAB 1: CODE.GS */}
        {activeTab === 'gas' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-bold">Langkah Deployment Google Apps Script:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Buka Google Spreadsheet baru di Google Drive Anda.</li>
                <li>Klik menu <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Salin seluruh source code <code>Code.gs</code> di bawah ini dan tempel di editor Apps Script.</li>
                <li>Klik tombol <strong>Deploy &gt; New deployment</strong>.</li>
                <li>Pilih type: <strong>Web App</strong>.</li>
                <li>Set "Execute as": <strong>Me</strong>.</li>
                <li>Set "Who has access": <strong>Anyone</strong> (Wajib agar frontend Vercel/Next.js dapat mengakses).</li>
                <li>Salin Web App URL dan masukkan ke menu <strong>Pengaturan Sekolah</strong>.</li>
              </ol>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Source Code Code.gs:</span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Semua Kode.gs'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono max-h-96 overflow-y-auto border border-slate-800">
              {GAS_CODE_GS}
            </pre>
          </div>
        )}

        {/* TAB 2: SHEET STRUCTURE */}
        {activeTab === 'sheet' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Struktur Sheet & Kolom Google Spreadsheet:
              </p>
              <button
                onClick={handleCopySheet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white"
              >
                {copiedSheet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Info Struktur</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono max-h-96 overflow-y-auto border border-slate-800 leading-relaxed whitespace-pre-wrap">
              {SPREADSHEET_TEMPLATE_INFO}
            </pre>
          </div>
        )}

        {/* TAB 3: VERCEL DEPLOYMENT */}
        {activeTab === 'vercel' && (
          <div className="space-y-3">
            <pre className="p-4 rounded-xl bg-slate-900 text-blue-300 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
              {VERCEL_DEPLOYMENT_STEPS}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};
