// Mock Electron API for web demo
class MockQRGenerator {
  async generate(data, options = {}) {
    const qrOptions = {
      width: options.width || 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    // Generate simple QR-like pattern since external library is blocked
    const qrDataURL = this.generateSimpleQR(data, qrOptions);
    
    // Convert to buffer-like object for compatibility
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const qrLayer = {
          id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: data,
          buffer: canvas.toDataURL(),
          dataURL: qrDataURL,
          options: qrOptions,
          timestamp: Date.now(),
          size: qrOptions.width,
          metadata: {
            encoding: 'UTF-8',
            version: Math.min(40, Math.ceil(data.length / 25)),
            errorCorrectionLevel: qrOptions.errorCorrectionLevel || 'M'
          }
        };
        
        resolve(qrLayer);
      };
      img.src = qrDataURL;
    });
  }

  async importStack() {
    // Simulate file dialog
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.qrs';
      
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        try {
          const text = await file.text();
          const stackData = JSON.parse(text);
          
          // Regenerate QR codes for imported data
          for (let layer of stackData.layers) {
            if (layer.data) {
              const regenerated = await this.generate(layer.data, layer.options);
              layer.buffer = regenerated.buffer;
              layer.dataURL = regenerated.dataURL;
            }
          }
          
          resolve(stackData);
        } catch (error) {
          console.error('Import failed:', error);
          resolve(null);
        }
      };
      
      input.click();
    });
  }

  async exportStack(stackData) {
    // Create export-safe version
    const exportData = {
      ...stackData,
      layers: stackData.layers.map(layer => ({
        ...layer,
        buffer: null, // Remove buffer for JSON serialization
        dataURL: null
      }))
    };

    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-stack-export.json';
    a.click();
    
    URL.revokeObjectURL(url);
    return { success: true, path: 'download' };
  }
}

class MockConstellationEngine {
  async startAnimation(qrStack) {
    const animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate animation frames
    const frames = this.generateAnimationFrames(qrStack);
    
    return {
      animationId,
      frames: frames,
      duration: 3000,
      stack: qrStack
    };
  }

  generateAnimationFrames(qrStack) {
    const frames = [];
    const totalFrames = 60;
    const layers = qrStack.layers;

    for (let frame = 0; frame < totalFrames; frame++) {
      const progress = frame / (totalFrames - 1);
      const frameData = {
        frame,
        progress,
        timestamp: Date.now() + (frame * 50),
        layers: []
      };

      layers.forEach((layer, index) => {
        const layerFrame = this.calculateLayerTransform(layer, index, progress, layers.length);
        frameData.layers.push(layerFrame);
      });

      frames.push(frameData);
    }

    return frames;
  }

  calculateLayerTransform(layer, index, progress, totalLayers) {
    const maxZ = 200;
    const initialZ = (index / totalLayers) * maxZ;
    const targetZ = initialZ + (Math.sin(progress * Math.PI * 2) * 50);

    const rotationX = progress * 360 * (index % 2 === 0 ? 1 : -1);
    const rotationY = progress * 180;
    const rotationZ = Math.sin(progress * Math.PI) * 15;

    const baseScale = 1 - (index / totalLayers) * 0.3;
    const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
    const scale = baseScale * pulseScale;

    const baseOpacity = layer.opacity || (1 - index / totalLayers * 0.5);
    const fadeOpacity = Math.sin(progress * Math.PI) * 0.3 + 0.7;
    const opacity = Math.min(1, baseOpacity * fadeOpacity);

    const radius = 100 + (index * 20);
    const angle = (index / totalLayers) * Math.PI * 2 + (progress * Math.PI);
    const x = Math.cos(angle) * radius * progress;
    const y = Math.sin(angle) * radius * progress;

    return {
      layerId: layer.id,
      transform: {
        translateX: x,
        translateY: y,
        translateZ: targetZ,
        rotateX: rotationX,
        rotateY: rotationY,
        rotateZ: rotationZ,
        scale: scale
      },
      opacity: opacity,
      zIndex: Math.floor(targetZ) + 1000
    };
  }
}

class MockLoRAManager {
  async applyWeights(qrLayer, loraWeights) {
    const weightId = `lora_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enhancedLayer = {
      ...qrLayer,
      lora: {
        id: weightId,
        weights: loraWeights,
        config: loraWeights.config,
        applied: true,
        timestamp: Date.now()
      },
      enhanced: true
    };

    // Simulate LoRA encoding
    enhancedLayer.encodedData = this.mockEncodeWithLoRA(qrLayer.data, loraWeights);
    
    return enhancedLayer;
  }

  async extractWeights(qrLayer) {
    if (!qrLayer.lora || !qrLayer.lora.applied) {
      throw new Error('No LoRA weights found in QR layer');
    }

    return {
      weights: qrLayer.lora.weights,
      config: qrLayer.lora.config,
      metadata: {
        extractedFrom: qrLayer.id,
        originalTimestamp: qrLayer.lora.timestamp,
        extractedTimestamp: Date.now()
      }
    };
  }

  generateSimpleQR(data, options) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = options.width || 256;
    
    canvas.width = size;
    canvas.height = size;
    
    // Fill background
    ctx.fillStyle = options.color.light;
    ctx.fillRect(0, 0, size, size);
    
    // Generate QR-like pattern
    ctx.fillStyle = options.color.dark;
    const moduleSize = size / 25;
    const hash = this.simpleHash(data);
    
    for (let x = 0; x < 25; x++) {
      for (let y = 0; y < 25; y++) {
        const index = x * 25 + y;
        if ((hash >> (index % 32)) & 1) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add corner markers
    this.drawCornerMarker(ctx, 0, 0, moduleSize);
    this.drawCornerMarker(ctx, 18 * moduleSize, 0, moduleSize);
    this.drawCornerMarker(ctx, 0, 18 * moduleSize, moduleSize);
    
    return canvas.toDataURL();
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  drawCornerMarker(ctx, x, y, size) {
    ctx.fillRect(x, y, size * 7, size * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + size, y + size, size * 5, size * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + size * 2, y + size * 2, size * 3, size * 3);
  }
}

  mockEncodeWithLoRA(data, loraWeights) {
    // Simulate LoRA transformation
    return data + `[LoRA:${loraWeights.config.rank}:${loraWeights.config.alpha}]`;
  }
const mockQRGenerator = new MockQRGenerator();
const mockConstellationEngine = new MockConstellationEngine();
const mockLoRAManager = new MockLoRAManager();

// Mock Electron API
window.electronAPI = {
  generateQR: (data, options) => mockQRGenerator.generate(data, options),
  importQRStack: () => mockQRGenerator.importStack(),
  exportQRStack: (stackData) => mockQRGenerator.exportStack(stackData),
  startConstellationAnimation: (qrStack) => mockConstellationEngine.startAnimation(qrStack),
  applyLoRAWeights: (qrLayer, loraWeights) => mockLoRAManager.applyWeights(qrLayer, loraWeights),
  extractLoRAWeights: (qrLayer) => mockLoRAManager.extractWeights(qrLayer),
  onAnimationFrame: (callback) => {}, // Stub
  offAnimationFrame: (callback) => {} // Stub
};

console.log('Mock Electron API initialized for web demo');