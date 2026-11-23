const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  loadDatabase: () => ipcRenderer.invoke('db:load'),
  saveDatabase: (data) => ipcRenderer.invoke('db:save', data),
  backupDatabase: () => ipcRenderer.invoke('db:backup'),
  restoreDatabase: () => ipcRenderer.invoke('db:restore'),
  getInfo: () => ipcRenderer.invoke('app:getInfo'),
  onDatabaseRestored: (callback) => {
    ipcRenderer.on('db:restored', (event, data) => callback(data));
  },
  onTriggerPrint: (callback) => {
    ipcRenderer.on('trigger-print', () => callback());
  }
});
