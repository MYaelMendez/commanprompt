class QRConstellationApp {
  constructor() {
    this.qrStack = { layers: [] };
    this.selectedLayer = null;
    this.animationActive = false;
    this.currentAnimation = null;
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.updateUI();
    
    // Initialize constellation renderer
    if (window.ConstellationRenderer) {
      this.constellationRenderer = new ConstellationRenderer('constellation-canvas');
    }
    
    console.log('QR-Constellation IDE initialized');
  }

  setupEventListeners() {
    // QR Generation
    document.getElementById('generate-qr-btn').addEventListener('click', () => {
      this.generateQR();
    });

    // Import/Export
    document.getElementById('import-btn').addEventListener('click', () => {
      this.importStack();
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportStack();
    });

    // Constellation mode
    document.getElementById('constellation-btn').addEventListener('click', () => {
      this.toggleConstellationMode();
    });

    // LoRA
    document.getElementById('apply-lora-btn').addEventListener('click', () => {
      this.applyLoRA();
    });

    // Animation controls
    document.getElementById('play-animation').addEventListener('click', () => {
      this.playAnimation();
    });

    document.getElementById('pause-animation').addEventListener('click', () => {
      this.pauseAnimation();
    });

    document.getElementById('stop-animation').addEventListener('click', () => {
      this.stopAnimation();
    });

    // CLI input
    document.getElementById('input').addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        this.processCommand(event.target.value);
        event.target.value = '';
      }
    });

    // Range input updates
    document.getElementById('qr-size').addEventListener('input', (e) => {
      document.getElementById('size-value').textContent = e.target.value + 'px';
    });

    document.getElementById('lora-dropout').addEventListener('input', (e) => {
      document.getElementById('dropout-value').textContent = e.target.value;
    });

    document.getElementById('animation-speed').addEventListener('input', (e) => {
      document.getElementById('speed-value').textContent = e.target.value + 'x';
    });

    document.getElementById('camera-zoom').addEventListener('input', (e) => {
      document.getElementById('zoom-value').textContent = e.target.value + 'x';
      if (this.constellationRenderer) {
        this.constellationRenderer.setZoom(parseFloat(e.target.value));
      }
    });

    // Modal controls
    document.getElementById('modal-close').addEventListener('click', () => {
      this.hideModal();
    });

    document.getElementById('modal-cancel').addEventListener('click', () => {
      this.hideModal();
    });

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.hideModal();
      }
    });
  }

  async generateQR() {
    const data = document.getElementById('qr-input').value.trim();
    if (!data) {
      this.showNotification('Please enter data to encode', 'warning');
      return;
    }

    const size = parseInt(document.getElementById('qr-size').value);
    const options = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    try {
      const qrLayer = await window.electronAPI.generateQR(data, options);
      this.qrStack.layers.push(qrLayer);
      this.updateLayersList();
      this.updateStatusBar();
      this.showNotification('QR code generated successfully', 'success');
      
      // Update CLI visual feedback
      this.updateCLIVisuals();
    } catch (error) {
      this.showNotification(`Error generating QR: ${error.message}`, 'error');
    }
  }

  async importStack() {
    try {
      const stackData = await window.electronAPI.importQRStack();
      if (stackData) {
        this.qrStack = stackData;
        this.updateLayersList();
        this.updateStatusBar();
        this.showNotification('QR stack imported successfully', 'success');
      }
    } catch (error) {
      this.showNotification(`Error importing stack: ${error.message}`, 'error');
    }
  }

  async exportStack() {
    if (this.qrStack.layers.length === 0) {
      this.showNotification('No QR layers to export', 'warning');
      return;
    }

    try {
      const result = await window.electronAPI.exportQRStack(this.qrStack);
      if (result) {
        this.showNotification('QR stack exported successfully', 'success');
      }
    } catch (error) {
      this.showNotification(`Error exporting stack: ${error.message}`, 'error');
    }
  }

  async toggleConstellationMode() {
    if (this.qrStack.layers.length === 0) {
      this.showNotification('Generate QR codes first to enable Constellation Mode', 'warning');
      return;
    }

    if (this.animationActive) {
      await this.stopAnimation();
    } else {
      await this.startConstellationAnimation();
    }
  }

  async startConstellationAnimation() {
    try {
      const animationData = await window.electronAPI.startConstellationAnimation(this.qrStack);
      this.currentAnimation = animationData;
      this.animationActive = true;
      
      document.getElementById('animation-controls').classList.remove('hidden');
      document.getElementById('animation-status').textContent = 'Running';
      
      if (this.constellationRenderer) {
        this.constellationRenderer.startAnimation(animationData);
      }
      
      this.showNotification('Cinematic Constellation Mode activated', 'success');
    } catch (error) {
      this.showNotification(`Animation error: ${error.message}`, 'error');
    }
  }

  async applyLoRA() {
    if (!this.selectedLayer) {
      this.showNotification('Select a QR layer first', 'warning');
      return;
    }

    const rank = parseInt(document.getElementById('lora-rank').value);
    const alpha = parseInt(document.getElementById('lora-alpha').value);
    const dropout = parseFloat(document.getElementById('lora-dropout').value);

    const loraConfig = { rank, alpha, dropout };

    try {
      // Create LoRA weights
      const loraWeights = await this.createLoRAWeights(loraConfig);
      
      // Apply weights to selected layer
      const enhancedLayer = await window.electronAPI.applyLoRAWeights(this.selectedLayer, loraWeights);
      
      // Update layer in stack
      const layerIndex = this.qrStack.layers.findIndex(l => l.id === this.selectedLayer.id);
      if (layerIndex !== -1) {
        this.qrStack.layers[layerIndex] = enhancedLayer;
        this.selectedLayer = enhancedLayer;
      }
      
      this.updateLayersList();
      this.updateLoRAStatus();
      this.showNotification('LoRA weights applied successfully', 'success');
    } catch (error) {
      this.showNotification(`LoRA error: ${error.message}`, 'error');
    }
  }

  async createLoRAWeights(config) {
    // Generate LoRA weight matrices
    const rank = config.rank;
    const dim = 256; // QR data dimension
    
    const weights = {
      config: config,
      matrices: {
        A: this.generateRandomMatrix(rank, dim),
        B: this.generateRandomMatrix(dim, rank)
      },
      scaling: config.alpha / config.rank,
      metadata: {
        created: Date.now(),
        rank: rank,
        parameters: rank * dim * 2
      }
    };
    
    return weights;
  }

  generateRandomMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push((Math.random() - 0.5) * 2 / Math.sqrt(cols));
      }
      matrix.push(row);
    }
    return matrix;
  }

  processCommand(command) {
    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];
    
    switch (cmd) {
      case 'generate':
      case 'gen':
        if (parts[1]) {
          document.getElementById('qr-input').value = parts.slice(1).join(' ');
          this.generateQR();
        }
        break;
        
      case 'constellation':
      case 'const':
        this.toggleConstellationMode();
        break;
        
      case 'lora':
        if (parts[1] === 'apply') {
          this.applyLoRA();
        }
        break;
        
      case 'clear':
        this.clearStack();
        break;
        
      case 'help':
        this.showHelp();
        break;
        
      default:
        this.showNotification(`Unknown command: ${cmd}`, 'warning');
    }
    
    this.updateCLIVisuals();
  }

  updateCLIVisuals() {
    const colors = ['#fff', '#00FF00', '#FFA500', '#800080', '#00FFFF', '#FF00FF'];
    const emojis = ['⚫️', '🟢', '🍊', '🟣', '⚪️', '🗝️'];
    
    const idx = Math.floor(Math.random() * colors.length);
    const cursor = document.getElementById('cursor');
    const cli = document.getElementById('cli');
    const input = document.getElementById('input');
    
    cursor.style.color = colors[idx];
    input.style.borderColor = colors[idx];
    cursor.textContent = emojis[idx];
    cli.style.borderColor = colors[idx];
    cli.style.boxShadow = `0 0 30px ${colors[idx]}`;
    
    // Create particle effect
    this.createParticles(colors[idx]);
  }

  createParticles(color) {
    const universe = document.getElementById('universe');
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * window.innerWidth}px`;
      particle.style.top = `${Math.random() * window.innerHeight}px`;
      particle.style.color = color;
      particle.style.fontSize = '1rem';
      particle.textContent = '✦';
      particle.style.opacity = Math.random() * 0.8 + 0.2;
      
      universe.appendChild(particle);
      
      // Animate particle
      const duration = Math.random() * 3000 + 2000;
      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: particle.style.opacity },
        { transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0)`, opacity: 0 }
      ], {
        duration: duration,
        easing: 'ease-out'
      }).onfinish = () => {
        if (universe.contains(particle)) {
          universe.removeChild(particle);
        }
      };
    }
  }

  updateLayersList() {
    const layersList = document.getElementById('layers-list');
    layersList.innerHTML = '';
    
    this.qrStack.layers.forEach((layer, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = 'layer-item';
      layerElement.dataset.layerId = layer.id;
      
      if (this.selectedLayer && this.selectedLayer.id === layer.id) {
        layerElement.classList.add('selected');
      }
      
      layerElement.innerHTML = `
        <div class="layer-header">
          <span class="layer-title">Layer ${index + 1}</span>
          <span class="layer-meta">${layer.lora ? '🔗 LoRA' : ''}</span>
        </div>
        <div class="layer-meta">
          ${layer.data.substring(0, 30)}${layer.data.length > 30 ? '...' : ''}
        </div>
      `;
      
      layerElement.addEventListener('click', () => {
        this.selectLayer(layer);
      });
      
      layersList.appendChild(layerElement);
    });
  }

  selectLayer(layer) {
    this.selectedLayer = layer;
    this.updateLayersList();
    this.updateQRInfo();
  }

  updateQRInfo() {
    const qrInfo = document.getElementById('qr-info');
    
    if (this.selectedLayer) {
      qrInfo.innerHTML = `
        <p><strong>Data:</strong> ${this.selectedLayer.data}</p>
        <p><strong>Size:</strong> ${this.selectedLayer.size}px</p>
        <p><strong>Created:</strong> ${new Date(this.selectedLayer.timestamp).toLocaleTimeString()}</p>
        <p><strong>Version:</strong> ${this.selectedLayer.metadata.version}</p>
      `;
    } else {
      qrInfo.innerHTML = '<p>No QR code selected</p>';
    }
  }

  updateLoRAStatus() {
    const loraStatus = document.getElementById('lora-status');
    const loraCount = this.qrStack.layers.filter(layer => layer.lora && layer.lora.applied).length;
    
    document.getElementById('lora-count').textContent = loraCount;
    
    if (this.selectedLayer && this.selectedLayer.lora) {
      loraStatus.innerHTML = `
        <p><strong>Status:</strong> Applied</p>
        <p><strong>Rank:</strong> ${this.selectedLayer.lora.config.rank}</p>
        <p><strong>Alpha:</strong> ${this.selectedLayer.lora.config.alpha}</p>
        <p><strong>Parameters:</strong> ${this.selectedLayer.lora.weights.metadata.parameters}</p>
      `;
    } else {
      loraStatus.innerHTML = '<p>No LoRA weights applied</p>';
    }
  }

  updateStatusBar() {
    document.getElementById('layer-count').textContent = this.qrStack.layers.length;
  }

  updateUI() {
    this.updateLayersList();
    this.updateStatusBar();
    this.updateQRInfo();
    this.updateLoRAStatus();
  }

  playAnimation() {
    if (this.constellationRenderer && this.currentAnimation) {
      this.constellationRenderer.play();
      document.getElementById('animation-status').textContent = 'Running';
    }
  }

  pauseAnimation() {
    if (this.constellationRenderer) {
      this.constellationRenderer.pause();
      document.getElementById('animation-status').textContent = 'Paused';
    }
  }

  async stopAnimation() {
    if (this.constellationRenderer) {
      this.constellationRenderer.stop();
    }
    
    this.animationActive = false;
    this.currentAnimation = null;
    document.getElementById('animation-controls').classList.add('hidden');
    document.getElementById('animation-status').textContent = 'Stopped';
  }

  showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa00' : type === 'success' ? '#00aa00' : '#0066ff',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '6px',
      zIndex: '3000',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  clearStack() {
    this.qrStack.layers = [];
    this.selectedLayer = null;
    this.updateUI();
    this.showNotification('QR stack cleared', 'info');
  }

  showHelp() {
    const helpContent = `
      <h4>Available Commands:</h4>
      <ul>
        <li><strong>generate [data]</strong> - Generate QR code</li>
        <li><strong>constellation</strong> - Toggle constellation mode</li>
        <li><strong>lora apply</strong> - Apply LoRA weights</li>
        <li><strong>clear</strong> - Clear all QR layers</li>
        <li><strong>help</strong> - Show this help</li>
      </ul>
    `;
    this.showModal('Help', helpContent);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.qrApp = new QRConstellationApp();
});