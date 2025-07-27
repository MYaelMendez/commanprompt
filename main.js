const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const QRCodeGenerator = require('./backend/qr-generator');
const ConstellationEngine = require('./backend/constellation-engine');
const LoRAManager = require('./backend/lora-manager');

class QRConstellationIDE {
  constructor() {
    this.mainWindow = null;
    this.qrGenerator = new QRCodeGenerator();
    this.constellationEngine = new ConstellationEngine();
    this.loraManager = new LoRAManager();
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'renderer/preload.js')
      },
      titleBarStyle: 'hiddenInset',
      show: false,
      backgroundColor: '#0a0a2a'
    });

    this.mainWindow.loadFile('renderer/index.html');

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Enable DevTools in development
    if (process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  setupIPC() {
    // QR Code Generation
    ipcMain.handle('generate-qr', async (event, data, options) => {
      try {
        return await this.qrGenerator.generate(data, options);
      } catch (error) {
        throw error;
      }
    });

    // QR Code Import/Export
    ipcMain.handle('import-qr-stack', async (event) => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow, {
          properties: ['openFile'],
          filters: [
            { name: 'QR Stack Files', extensions: ['qrs'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled) {
          return await this.qrGenerator.importStack(result.filePaths[0]);
        }
        return null;
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle('export-qr-stack', async (event, stackData) => {
      try {
        const result = await dialog.showSaveDialog(this.mainWindow, {
          filters: [
            { name: 'QR Stack Files', extensions: ['qrs'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled) {
          return await this.qrGenerator.exportStack(stackData, result.filePath);
        }
        return null;
      } catch (error) {
        throw error;
      }
    });

    // Constellation Visualization
    ipcMain.handle('start-constellation-animation', async (event, qrStack) => {
      try {
        return await this.constellationEngine.startAnimation(qrStack);
      } catch (error) {
        throw error;
      }
    });

    // LoRA Operations
    ipcMain.handle('apply-lora-weights', async (event, qrLayer, loraWeights) => {
      try {
        return await this.loraManager.applyWeights(qrLayer, loraWeights);
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle('extract-lora-weights', async (event, qrLayer) => {
      try {
        return await this.loraManager.extractWeights(qrLayer);
      } catch (error) {
        throw error;
      }
    });
  }

  init() {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIPC();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }
}

const qrIDE = new QRConstellationIDE();
qrIDE.init();