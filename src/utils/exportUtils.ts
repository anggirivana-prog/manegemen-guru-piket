import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateIndonesian } from './dateUtils';
import { PengaturanSekolah } from '../types';

export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToCSV(data: any[], fileName: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row =>
    Object.values(row)
      .map(val => `"${String(val ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  fileName: string,
  schoolConfig?: PengaturanSekolah
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Add Kop Surat Sekolah if available
  if (schoolConfig) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(schoolConfig.namaSekolah.toUpperCase(), 148, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`NPSN: ${schoolConfig.npsn} | ${schoolConfig.alamat}`, 148, 21, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(15, 25, 282, 25);
  }

  const startY = schoolConfig ? 32 : 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), 148, startY, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Cetak: ${formatDateIndonesian(new Date().toISOString().split('T')[0])}`, 15, startY + 6);

  autoTable(doc, {
    startY: startY + 10,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
  });

  // Tanda Tangan
  const finalY = (doc as any).lastAutoTable.finalY || startY + 50;
  if (finalY + 40 < 200 && schoolConfig) {
    const signY = finalY + 15;
    doc.text(`Mengetahui,`, 220, signY);
    doc.text(`Kepala Sekolah`, 220, signY + 5);
    doc.text(schoolConfig.kepalaSekolah, 220, signY + 25);
    doc.text(`NIP. ${schoolConfig.nipKepalaSekolah}`, 220, signY + 30);
  }

  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function printWindow(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  schoolConfig?: PengaturanSekolah
) {
  const printWin = window.open('', '_blank');
  if (!printWin) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
        .kop { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; }
        .kop h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .kop p { margin: 4px 0 0; font-size: 12px; color: #475569; }
        .title { text-align: center; margin-bottom: 15px; font-size: 16px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #2563eb; color: white; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer-sign { margin-top: 40px; float: right; text-align: center; width: 250px; font-size: 12px; }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      ${
        schoolConfig
          ? `
        <div class="kop">
          <h2>${schoolConfig.namaSekolah}</h2>
          <p>NPSN: ${schoolConfig.npsn} - ${schoolConfig.alamat}</p>
        </div>
      `
          : ''
      }
      <div class="title">${title}</div>
      <p style="font-size: 11px; color: #64748b;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(r => `<tr>${r.map(c => `<td>${c ?? '-'}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      ${
        schoolConfig
          ? `
        <div class="footer-sign">
          <p>Mengetahui,<br>Kepala Sekolah</p>
          <br><br><br>
          <p><strong>${schoolConfig.kepalaSekolah}</strong><br>NIP. ${schoolConfig.nipKepalaSekolah}</p>
        </div>
      `
          : ''
      }
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWin.document.write(htmlContent);
  printWin.document.close();
}
