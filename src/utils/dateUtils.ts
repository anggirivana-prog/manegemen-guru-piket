export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getHariFromDateStr(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return NAMA_HARI[date.getDay()];
}

export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const tgl = date.getDate();
  const bln = NAMA_BULAN[date.getMonth()];
  const thn = date.getFullYear();
  return `${tgl} ${bln} ${thn}`;
}

export function getCurrentTimeFormatted(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getCurrentDateFormatted(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check attendance status based on arrival time & cut-off limit
 * Default cut-off limit: "06:45"
 */
export function calculateAttendanceStatus(
  jamDatang: string,
  jamBatasStr: string = '06:45'
): 'Tepat Waktu' | 'Terlambat' {
  if (!jamDatang) return 'Tepat Waktu';

  const [hDatang, mDatang] = jamDatang.split(':').map(Number);
  const [hBatas, mBatas] = jamBatasStr.split(':').map(Number);

  const minsDatang = hDatang * 60 + (mDatang || 0);
  const minsBatas = hBatas * 60 + (mBatas || 0);

  if (minsDatang <= minsBatas) {
    return 'Tepat Waktu';
  } else {
    return 'Terlambat';
  }
}
