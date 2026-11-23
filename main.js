const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Hindari crash cache disk / permission lock di Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// Path to permanent local database in user's AppData
const userDataPath = app.getPath('userData');
const dbFilePath = path.join(userDataPath, 'absensi_bk_database.json');

// Ensure directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const windowConfig = {
    width: 1400,
    height: 850,
    minWidth: 1024,
    minHeight: 650,
    title: 'Dashboard Absensi Siswa Bulanan - Guru BK & Madrasah',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  };

  if (fs.existsSync(iconPath)) {
    windowConfig.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowConfig);

  const indexPath = path.join(__dirname, 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Custom Application Menu
  const menuTemplate = [
    {
      label: 'Berkas',
      submenu: [
        {
          label: 'Cadangkan Database (Backup)...',
          accelerator: 'CmdOrCtrl+B',
          click: () => handleBackup()
        },
        {
          label: 'Pulihkan Database (Restore)...',
          accelerator: 'CmdOrCtrl+R',
          click: () => handleRestore()
        },
        { type: 'separator' },
        {
          label: 'Cetak Laporan / PDF',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('trigger-print');
          }
        },
        { type: 'separator' },
        {
          label: 'Buka Folder Database',
          click: () => {
            const { shell } = require('electron');
            shell.openPath(userDataPath);
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Keluar' }
      ]
    },
    {
      label: 'Tampilan',
      submenu: [
        { role: 'reload', label: 'Muat Ulang Halaman' },
        { role: 'forceReload', label: 'Muat Ulang Paksa' },
        { role: 'toggleDevTools', label: 'Alat Pengembang (DevTools)' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Ukuran Normal (100%)' },
        { role: 'zoomIn', label: 'Perbesar' },
        { role: 'zoomOut', label: 'Perkecil' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Layar Penuh (F11)' }
      ]
    },
    {
      label: 'Bantuan',
      submenu: [
        {
          label: 'Tentang Aplikasi Absensi Guru BK',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Tentang Aplikasi',
              message: 'Aplikasi Absensi Siswa Bulanan Guru BK & Madrasah',
              detail: `Versi: 1.0.0 (Desktop Standalone)\nDatabase Lokal: ${dbFilePath}\nStatus: 100% Offline & Permanen`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Local Database Management
ipcMain.handle('db:load', async () => {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(raw);
    }
    return null;
  } catch (err) {
    console.error('Error loading local database:', err);
    return null;
  }
});

ipcMain.handle('db:save', async (event, data) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true, path: dbFilePath };
  } catch (err) {
    console.error('Error saving local database:', err);
    return { success: false, error: err.message };
  }
});

async function handleBackup() {
  if (!mainWindow) return;
  try {
    let currentData = {};
    if (fs.existsSync(dbFilePath)) {
      currentData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultName = `Backup_Absensi_BK_${todayStr}.bkdb`;

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Simpan File Cadangan Database',
      defaultPath: defaultName,
      filters: [
        { name: 'File Database Absensi BK (*.bkdb)', extensions: ['bkdb'] },
        { name: 'File JSON (*.json)', extensions: ['json'] },
        { name: 'Semua Berkas (*.*)', extensions: ['*'] }
      ]
    });

    if (!canceled && filePath) {
      fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Pencadangan Berhasil',
        message: 'Database berhasil dicadangkan!',
        detail: `Berkas tersimpan di:\n${filePath}`,
        buttons: ['OK']
      });
    }
  } catch (err) {
    dialog.showErrorBox('Gagal Mencadangkan', err.message);
  }
}

async function handleRestore() {
  if (!mainWindow) return;
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Pilih Berkas Cadangan Database untuk Dipulihkan',
      properties: ['openFile'],
      filters: [
        { name: 'File Cadangan BK (*.bkdb, *.json)', extensions: ['bkdb', 'json'] },
        { name: 'Semua Berkas (*.*)', extensions: ['*'] }
      ]
    });

    if (!canceled && filePaths.length > 0) {
      const selectedPath = filePaths[0];
      const raw = fs.readFileSync(selectedPath, 'utf8');
      const parsed = JSON.parse(raw);

      // Save to local database
      fs.writeFileSync(dbFilePath, JSON.stringify(parsed, null, 2), 'utf8');

      // Send to renderer
      mainWindow.webContents.send('db:restored', parsed);

      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Pemulihan Berhasil',
        message: 'Database berhasil dipulihkan!',
        detail: 'Semua data siswa, mutasi, presensi, dan profil telah diperbarui.',
        buttons: ['OK']
      });
    }
  } catch (err) {
    dialog.showErrorBox('Gagal Memulihkan Database', 'Format file tidak valid atau rusak: ' + err.message);
  }
}

ipcMain.handle('db:backup', async () => {
  return handleBackup();
});

ipcMain.handle('db:restore', async () => {
  return handleRestore();
});

ipcMain.handle('app:getInfo', async () => {
  return {
    isDesktop: true,
    dbPath: dbFilePath,
    userDataPath: userDataPath,
    version: app.getVersion()
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
