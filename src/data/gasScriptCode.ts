export const GAS_CODE_GS = `/**
 * GOOGLE APPS SCRIPT REST API
 * Backend for Sistem Manajemen Guru Piket
 * Spreadsheet ID: Auto-detected from Active Spreadsheet
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  var output = {};
  try {
    var action = e.parameter.action || '';
    var postData = {};
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = e.parameter;
      }
    }
    
    // Combine parameters
    var params = Object.assign({}, e.parameter, postData);
    if (!action && params.action) action = params.action;

    switch (action) {
      case 'login':
        output = login(params.username, params.password);
        break;
      case 'getDashboard':
        output = getDashboard();
        break;
      case 'getGuru':
        output = getGuru();
        break;
      case 'addGuru':
        output = addGuru(params);
        break;
      case 'updateGuru':
        output = updateGuru(params);
        break;
      case 'deleteGuru':
        output = deleteGuru(params.id);
        break;
      case 'getMasterPiket':
        output = getMasterPiket();
        break;
      case 'saveMasterPiket':
        output = saveMasterPiket(params);
        break;
      case 'getJadwal':
        output = getJadwal();
        break;
      case 'addJadwal':
        output = addJadwal(params);
        break;
      case 'updateJadwal':
        output = updateJadwal(params);
        break;
      case 'deleteJadwal':
        output = deleteJadwal(params.id);
        break;
      case 'getPresensi':
        output = getPresensi();
        break;
      case 'savePresensi':
        output = savePresensi(params);
        break;
      case 'updatePresensi':
        output = updatePresensi(params);
        break;
      case 'deletePresensi':
        output = deletePresensi(params.id);
        break;
      case 'getPengaturan':
        output = getPengaturan();
        break;
      case 'updatePengaturan':
        output = updatePengaturan(params);
        break;
      case 'initDatabase':
        output = initDatabase();
        break;
      default:
        output = { status: 'error', message: 'Action tidak ditemukan: ' + action };
    }
  } catch (error) {
    output = { status: 'error', message: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Get Sheet by Name
function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// Convert sheet data to Array of Objects
function sheetToObjects(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

// 1. LOGIN
function login(username, password) {
  var users = sheetToObjects('Users');
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      if (users[i].status !== 'Aktif') {
        return { status: 'error', message: 'Akun Anda sedang nonaktif' };
      }
      return {
        status: 'success',
        message: 'Login berhasil',
        token: 'TOKEN-' + Math.random().toString(36).substring(2),
        data: {
          id: users[i].id,
          username: users[i].username,
          nama: users[i].nama,
          role: users[i].role,
          status: users[i].status
        }
      };
    }
  }
  return { status: 'error', message: 'Username atau password salah' };
}

// 2. DASHBOARD
function getDashboard() {
  var guru = sheetToObjects('Master_Guru');
  var jadwal = sheetToObjects('Jadwal');
  var presensi = sheetToObjects('Presensi');
  
  var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var presensiHariIni = presensi.filter(function(p) { return p.tanggal === todayStr; });
  
  var tepatWaktu = presensiHariIni.filter(function(p) { return p.status === 'Tepat Waktu'; }).length;
  var terlambat = presensiHariIni.filter(function(p) { return p.status === 'Terlambat'; }).length;
  var tidakHadir = presensiHariIni.filter(function(p) { return p.status === 'Tidak Hadir'; }).length;

  return {
    status: 'success',
    data: {
      kpi: {
        totalGuru: guru.length,
        totalJadwal: jadwal.length,
        totalPresensiHariIni: presensiHariIni.length,
        tepatWaktu: tepatWaktu,
        terlambat: terlambat,
        tidakHadir: tidakHadir
      },
      recentPresensi: presensi.slice(-10).reverse()
    }
  };
}

// 3. MASTER GURU
function getGuru() {
  return { status: 'success', data: sheetToObjects('Master_Guru') };
}

function addGuru(params) {
  params = params || {};
  var data = params.data || params;
  var sheet = getSheet('Master_Guru');
  var id = data.id || ('GRU-' + Math.floor(1000 + Math.random() * 9000));
  var nip = data.nip || '';
  var nama = data.nama || '';
  var jenisKelamin = data.jenisKelamin || 'L';
  var noHp = data.noHp || '';
  var email = data.email || '';
  var status = data.status || 'Aktif';

  sheet.appendRow([id, nip, nama, jenisKelamin, noHp, email, status]);
  return { status: 'success', message: 'Guru berhasil ditambahkan', id: id };
}

function updateGuru(params) {
  params = params || {};
  var data = params.data || params;
  if (!data.id) return { status: 'error', message: 'ID Guru tidak ditemukan' };

  var sheet = getSheet('Master_Guru');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[
        data.nip || '', data.nama || '', data.jenisKelamin || 'L', data.noHp || '', data.email || '', data.status || 'Aktif'
      ]]);
      return { status: 'success', message: 'Data guru berhasil diperbarui' };
    }
  }
  return { status: 'error', message: 'Guru tidak ditemukan' };
}

function deleteGuru(params) {
  var id = params;
  if (typeof params === 'object' && params !== null) {
    id = params.id || params.data;
  }
  if (!id) return { status: 'error', message: 'ID Guru tidak valid' };

  var sheet = getSheet('Master_Guru');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Guru berhasil dihapus' };
    }
  }
  return { status: 'error', message: 'Guru tidak ditemukan' };
}

// 3B. MASTER PIKET
function getMasterPiket() {
  return { status: 'success', data: sheetToObjects('Master_Piket') };
}

function saveMasterPiket(params) {
  params = params || {};
  var sheet = getSheet('Master_Piket');
  sheet.clearContents();
  sheet.appendRow(['id', 'jenisPiket', 'deskripsi', 'jamMulai', 'jamSelesai']);
  
  var list = params.list || params.data || params;
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch(e) {}
  }
  
  if (Array.isArray(list)) {
    list.forEach(function(item) {
      if (item) {
        sheet.appendRow([
          item.id || ('PKT-' + Math.floor(1000 + Math.random() * 9000)),
          item.jenisPiket || '',
          item.deskripsi || '',
          item.jamMulai || '',
          item.jamSelesai || ''
        ]);
      }
    });
  }
  return { status: 'success', message: 'Master Piket berhasil disimpan' };
}

// 4. JADWAL
function getJadwal() {
  return { status: 'success', data: sheetToObjects('Jadwal') };
}

function addJadwal(params) {
  params = params || {};
  var data = params.data || params;
  var sheet = getSheet('Jadwal');
  var id = data.id || ('JDW-' + Math.floor(1000 + Math.random() * 9000));
  sheet.appendRow([
    id, data.tanggal || '', data.hari || '', data.jenisPiket || '',
    data.guru1 || '', data.guru2 || '', data.guru3 || '', data.guru4 || ''
  ]);
  return { status: 'success', message: 'Jadwal berhasil ditambahkan', id: id };
}

function updateJadwal(params) {
  params = params || {};
  var data = params.data || params;
  if (!data.id) return { status: 'error', message: 'ID Jadwal tidak ditemukan' };

  var sheet = getSheet('Jadwal');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.getRange(i + 1, 2, 1, 7).setValues([[
        data.tanggal || '', data.hari || '', data.jenisPiket || '',
        data.guru1 || '', data.guru2 || '', data.guru3 || '', data.guru4 || ''
      ]]);
      return { status: 'success', message: 'Jadwal berhasil diperbarui' };
    }
  }
  return { status: 'error', message: 'Jadwal tidak ditemukan' };
}

function deleteJadwal(params) {
  var id = params;
  if (typeof params === 'object' && params !== null) {
    id = params.id || params.data;
  }
  if (!id) return { status: 'error', message: 'ID Jadwal tidak valid' };

  var sheet = getSheet('Jadwal');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Jadwal berhasil dihapus' };
    }
  }
  return { status: 'error', message: 'Jadwal tidak ditemukan' };
}

// 5. PRESENSI
function getPresensi() {
  return { status: 'success', data: sheetToObjects('Presensi') };
}

function savePresensi(params) {
  params = params || {};
  var data = params.data || params;
  var sheet = getSheet('Presensi');
  var id = data.id || ('PRS-' + Math.floor(10000 + Math.random() * 90000));
  var now = new Date().toISOString();
  
  var fotoStr = data.foto || '';
  if (fotoStr.length > 25000) {
    fotoStr = fotoStr.substring(0, 25000);
  }

  sheet.appendRow([
    id, data.tanggal || '', data.hari || '', data.jenisPiket || '', data.namaGuru || '',
    data.jamDatang || '', data.jamPulang || '', data.status || 'Hadir', data.keterangan || '',
    fotoStr, data.latitude || '', data.longitude || '', now
  ]);
  return { status: 'success', message: 'Presensi berhasil disimpan', id: id };
}

function updatePresensi(params) {
  params = params || {};
  var data = params.data || params;
  if (!data.id) return { status: 'error', message: 'ID Presensi tidak ditemukan' };

  var sheet = getSheet('Presensi');
  var values = sheet.getDataRange().getValues();
  var fotoStr = data.foto || '';
  if (fotoStr.length > 25000) {
    fotoStr = fotoStr.substring(0, 25000);
  }

  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.getRange(i + 1, 2, 1, 11).setValues([[
        data.tanggal || '', data.hari || '', data.jenisPiket || '', data.namaGuru || '',
        data.jamDatang || '', data.jamPulang || '', data.status || 'Hadir', data.keterangan || '',
        fotoStr, data.latitude || '', data.longitude || ''
      ]]);
      return { status: 'success', message: 'Presensi berhasil diperbarui' };
    }
  }
  return { status: 'error', message: 'Presensi tidak ditemukan' };
}

function deletePresensi(params) {
  var id = params;
  if (typeof params === 'object' && params !== null) {
    id = params.id || params.data;
  }
  if (!id) return { status: 'error', message: 'ID Presensi tidak valid' };

  var sheet = getSheet('Presensi');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Presensi berhasil dihapus' };
    }
  }
  return { status: 'error', message: 'Presensi tidak ditemukan' };
}

// 6. INITIALIZE DATABASE & SHEETS
function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var defaultUsers = [
    ['USR-001', 'admin', 'password123', 'Admin Utama', 'Admin', 'Aktif'],
    ['USR-002', 'operator', 'password123', 'Siti Rahma, S.Pd', 'Operator', 'Aktif'],
    ['USR-003', 'budi', 'password123', 'Drs. H. Budi Santoso, M.Pd', 'Guru', 'Aktif']
  ];

  var defaultGuru = [
    ['GRU-001', '197508122003121001', 'Drs. H. Budi Santoso, M.Pd', 'L', '081234567890', 'budi@sekolah.sch.id', 'Aktif'],
    ['GRU-002', '198203152009022003', 'Dra. Hj. Ani Wijaya', 'P', '081398765432', 'ani@sekolah.sch.id', 'Aktif'],
    ['GRU-003', '199005202018011002', 'Ahmad Fauzi, S.Pd', 'L', '085678901234', 'fauzi@sekolah.sch.id', 'Aktif'],
    ['GRU-004', '199411102020122005', 'Dewi Lestari, S.Si', 'P', '087812345678', 'dewi@sekolah.sch.id', 'Aktif']
  ];

  var defaultPiket = [
    ['PKT-001', 'Penyambutan Siswa', 'Menyambut kehadiran siswa di gerbang utama sekolah', '06:15', '07:00'],
    ['PKT-002', 'Piket Ketertiban & KBM', 'Mengawasi ketertiban KBM dan mencatat guru ijin/kosong', '07:00', '14:00'],
    ['PKT-003', 'Piket Kepulangan Siswa', 'Mengatur ketertiban dan kelancaran arus kepulangan siswa', '14:00', '15:00']
  ];

  var sheets = [
    { name: 'Users', headers: ['id', 'username', 'password', 'nama', 'role', 'status'], defaultRows: defaultUsers },
    { name: 'Master_Guru', headers: ['id', 'nip', 'nama', 'jenisKelamin', 'noHp', 'email', 'status'], defaultRows: defaultGuru },
    { name: 'Master_Piket', headers: ['id', 'jenisPiket', 'deskripsi', 'jamMulai', 'jamSelesai'], defaultRows: defaultPiket },
    { name: 'Jadwal', headers: ['id', 'tanggal', 'hari', 'jenisPiket', 'guru1', 'guru2', 'guru3', 'guru4'], defaultRows: [] },
    { name: 'Presensi', headers: ['id', 'tanggal', 'hari', 'jenisPiket', 'namaGuru', 'jamDatang', 'jamPulang', 'status', 'keterangan', 'foto', 'latitude', 'longitude', 'timestamp'], defaultRows: [] },
    { name: 'Pengaturan', headers: ['key', 'value'], defaultRows: [] }
  ];

  sheets.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(item.headers);
      if (item.defaultRows && item.defaultRows.length > 0) {
        item.defaultRows.forEach(function(row) {
          sheet.appendRow(row);
        });
      }
    }
  });

  return { status: 'success', message: 'Database Google Sheet berhasil diinisialisasi' };
}
`;

export const SPREADSHEET_TEMPLATE_INFO = `
STRUCTURE TABEL GOOGLE SPREADSHEET:

1. Sheet "Users"
   Kolom: id | username | password | nama | role | status
   Contoh:
   USR-001 | admin | password123 | Admin Utama | Admin | Aktif
   USR-002 | operator | password123 | Siti Rahma, S.Pd | Operator | Aktif

2. Sheet "Master_Guru"
   Kolom: id | nip | nama | jenisKelamin | noHp | email | status
   Contoh:
   GRU-001 | 197508122003121001 | Drs. H. Budi Santoso, M.Pd | L | 081234567890 | budi@sekolah.sch.id | Aktif

3. Sheet "Master_Piket"
   Kolom: id | jenisPiket | deskripsi | jamMulai | jamSelesai
   Contoh:
   PKT-001 | Penyambutan Siswa | Menyambut siswa di gerbang | 06:15 | 07:00

4. Sheet "Jadwal"
   Kolom: id | tanggal | hari | jenisPiket | guru1 | guru2 | guru3 | guru4
   Contoh:
   JDW-001 | 2026-08-05 | Rabu | Penyambutan Siswa | Drs. H. Budi Santoso, M.Pd | Dra. Hj. Ani Wijaya | Ahmad Fauzi, S.Pd | Dewi Lestari, S.Si

5. Sheet "Presensi"
   Kolom: id | tanggal | hari | jenisPiket | namaGuru | jamDatang | jamPulang | status | keterangan | foto | latitude | longitude | timestamp

6. Sheet "Pengaturan"
   Kolom: key | value
`;

export const VERCEL_DEPLOYMENT_STEPS = `
PANDUAN DEPLOYMENT VERCEL:

1. Push repository ini ke GitHub / GitLab Anda.
2. Login ke Vercel Dashboard (https://vercel.com).
3. Klik "Add New Project" dan pilih repository project ini.
4. Pada bagian Environment Variables di Vercel:
   - Tambahkan Key: NEXT_PUBLIC_API_URL
   - Value: [URL Web App Google Apps Script Anda] (contoh: https://script.google.com/macros/s/AKfycb.../exec)
5. Klik "Deploy". Vercel akan otomatis membundel dan mempublikasikan aplikasi ini.
`;
