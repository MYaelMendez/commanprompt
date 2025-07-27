const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // QR Code Operations
  generateQR: (data, options) => ipcRenderer.invoke('generate-qr', data, options),
  importQRStack: () => ipcRenderer.invoke('import-qr-stack'),
  exportQRStack: (stackData) => ipcRenderer.invoke('export-qr-stack', stackData),

  // Constellation Animation
  startConstellationAnimation: (qrStack) => ipcRenderer.invoke('start-constellation-animation', qrStack),

  // LoRA Operations
  applyLoRAWeights: (qrLayer, loraWeights) => ipcRenderer.invoke('apply-lora-weights', qrLayer, loraWeights),
  extractLoRAWeights: (qrLayer) => ipcRenderer.invoke('extract-lora-weights', qrLayer),

  // Event listeners
  onAnimationFrame: (callback) => ipcRenderer.on('animation-frame', callback),
  offAnimationFrame: (callback) => ipcRenderer.removeListener('animation-frame', callback)
});