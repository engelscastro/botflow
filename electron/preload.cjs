const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url) => ipcRenderer.send('open-external-url', url),
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  
  // Automator API
  openAutomatorWindow: () => ipcRenderer.send('automator-open'),
  startAutomatorCampaign: (data) => ipcRenderer.send('automator-start', data),
  stopAutomatorCampaign: () => ipcRenderer.send('automator-stop'),
  onAutomatorLog: (callback) => {
    // Prevent memory leaks by removing old listeners
    ipcRenderer.removeAllListeners('automator-log');
    ipcRenderer.on('automator-log', (event, data) => callback(data));
  }
});
