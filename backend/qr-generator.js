const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const Jimp = require('jimp');

class QRCodeGenerator {
  constructor() {
    this.defaultOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    };
  }

  async generate(data, options = {}) {
    const qrOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Generate QR code as buffer
      const qrBuffer = await QRCode.toBuffer(data, qrOptions);
      
      // Create QR layer object with metadata
      const qrLayer = {
        id: this.generateId(),
        data: data,
        buffer: qrBuffer,
        options: qrOptions,
        timestamp: Date.now(),
        size: qrOptions.width,
        metadata: {
          encoding: 'UTF-8',
          version: this.detectQRVersion(data),
          errorCorrectionLevel: qrOptions.errorCorrectionLevel
        }
      };

      return qrLayer;
    } catch (error) {
      throw new Error(`QR generation failed: ${error.message}`);
    }
  }

  async generateStack(dataArray, options = {}) {
    const qrStack = {
      id: this.generateId(),
      layers: [],
      timestamp: Date.now(),
      metadata: {
        totalLayers: dataArray.length,
        stackType: 'constellation'
      }
    };

    for (let i = 0; i < dataArray.length; i++) {
      const layerOptions = {
        ...options,
        zIndex: i,
        opacity: this.calculateOpacity(i, dataArray.length)
      };
      
      const qrLayer = await this.generate(dataArray[i], layerOptions);
      qrLayer.zIndex = i;
      qrLayer.opacity = layerOptions.opacity;
      
      qrStack.layers.push(qrLayer);
    }

    return qrStack;
  }

  async importStack(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const stackData = JSON.parse(fileContent);
      
      // Validate stack structure
      if (!stackData.layers || !Array.isArray(stackData.layers)) {
        throw new Error('Invalid QR stack format');
      }

      // Reconstruct QR layers with buffers
      for (let layer of stackData.layers) {
        if (layer.data) {
          const regenerated = await this.generate(layer.data, layer.options);
          layer.buffer = regenerated.buffer;
        }
      }

      return stackData;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  async exportStack(stackData, filePath) {
    try {
      // Create export-safe version without buffers
      const exportData = {
        ...stackData,
        layers: stackData.layers.map(layer => ({
          ...layer,
          buffer: null // Remove buffer for JSON serialization
        }))
      };

      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
      return { success: true, path: filePath };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  generateId() {
    return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  detectQRVersion(data) {
    const length = data.length;
    if (length <= 25) return 1;
    if (length <= 47) return 2;
    if (length <= 77) return 3;
    if (length <= 114) return 4;
    if (length <= 154) return 5;
    return Math.min(40, Math.ceil(length / 30));
  }

  calculateOpacity(index, total) {
    return Math.max(0.3, 1 - (index / total) * 0.7);
  }
}

module.exports = QRCodeGenerator;