class LoRAUI {
  constructor() {
    this.loraWeights = new Map();
    this.presetConfigs = {
      'small': { rank: 4, alpha: 8, dropout: 0.05 },
      'medium': { rank: 16, alpha: 32, dropout: 0.1 },
      'large': { rank: 64, alpha: 128, dropout: 0.15 }
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.createLoRAVisualizer();
  }

  setupEventListeners() {
    // Preset selection
    document.addEventListener('change', (e) => {
      if (e.target.id === 'lora-preset') {
        this.applyPresetConfig(e.target.value);
      }
    });

    // Real-time parameter updates
    ['lora-rank', 'lora-alpha', 'lora-dropout'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', () => this.updateParameterDisplay());
        element.addEventListener('change', () => this.calculateLoRAStats());
      }
    });

    // Weight visualization toggle
    document.addEventListener('change', (e) => {
      if (e.target.id === 'show-weight-viz') {
        this.toggleWeightVisualization(e.target.checked);
      }
    });
  }

  createLoRAVisualizer() {
    // Add preset selector to LoRA section
    const loraSection = document.querySelector('.panel-section h3').parentNode;
    if (loraSection && loraSection.querySelector('h3').textContent === 'LoRA Configuration') {
      
      // Add preset selector
      const presetGroup = document.createElement('div');
      presetGroup.className = 'input-group';
      presetGroup.innerHTML = `
        <label for="lora-preset">Preset:</label>
        <select id="lora-preset">
          <option value="">Custom</option>
          <option value="small">Small (Rank 4)</option>
          <option value="medium">Medium (Rank 16)</option>
          <option value="large">Large (Rank 64)</option>
        </select>
      `;
      
      // Insert after h3
      loraSection.insertBefore(presetGroup, loraSection.children[1]);

      // Add parameter stats display
      const statsGroup = document.createElement('div');
      statsGroup.className = 'input-group';
      statsGroup.innerHTML = `
        <div id="lora-stats">
          <div class="stat-item">
            <span class="stat-label">Parameters:</span>
            <span id="param-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Memory:</span>
            <span id="memory-size">0 KB</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Reduction:</span>
            <span id="reduction-ratio">0%</span>
          </div>
        </div>
      `;

      // Add stats styles
      const style = document.createElement('style');
      style.textContent = `
        #lora-stats {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 0.85rem;
        }
        .stat-label {
          color: rgba(255, 255, 255, 0.7);
        }
        #weight-visualization {
          margin-top: 15px;
          max-height: 200px;
          overflow-y: auto;
        }
        .weight-matrix {
          display: grid;
          gap: 1px;
          margin-bottom: 10px;
          background: rgba(255, 255, 255, 0.1);
          padding: 5px;
          border-radius: 3px;
        }
        .matrix-cell {
          width: 8px;
          height: 8px;
          border-radius: 1px;
        }
        .matrix-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3px;
        }
      `;
      document.head.appendChild(style);

      loraSection.appendChild(statsGroup);

      // Add weight visualization
      const vizGroup = document.createElement('div');
      vizGroup.className = 'input-group';
      vizGroup.innerHTML = `
        <label>
          <input type="checkbox" id="show-weight-viz">
          Show Weight Visualization
        </label>
        <div id="weight-visualization" class="hidden"></div>
      `;
      
      loraSection.appendChild(vizGroup);

      // Initial calculation
      this.calculateLoRAStats();
    }
  }

  applyPresetConfig(presetName) {
    if (!presetName || !this.presetConfigs[presetName]) return;

    const config = this.presetConfigs[presetName];
    
    document.getElementById('lora-rank').value = config.rank;
    document.getElementById('lora-alpha').value = config.alpha;
    document.getElementById('lora-dropout').value = config.dropout;
    
    // Update display values
    document.getElementById('dropout-value').textContent = config.dropout;
    
    this.calculateLoRAStats();
  }

  updateParameterDisplay() {
    const dropout = document.getElementById('lora-dropout').value;
    document.getElementById('dropout-value').textContent = dropout;
  }

  calculateLoRAStats() {
    const rank = parseInt(document.getElementById('lora-rank').value) || 16;
    const alpha = parseInt(document.getElementById('lora-alpha').value) || 32;
    const dropout = parseFloat(document.getElementById('lora-dropout').value) || 0.1;
    
    // Calculate parameters (assuming 256 dim QR data)
    const originalParams = 256 * 256; // Full weight matrix
    const loraParams = rank * 256 * 2; // A and B matrices
    const paramReduction = ((originalParams - loraParams) / originalParams * 100).toFixed(1);
    
    // Calculate memory size (4 bytes per float32)
    const memorySizeKB = (loraParams * 4 / 1024).toFixed(1);
    
    // Update display
    document.getElementById('param-count').textContent = loraParams.toLocaleString();
    document.getElementById('memory-size').textContent = `${memorySizeKB} KB`;
    document.getElementById('reduction-ratio').textContent = `${paramReduction}%`;
    
    // Update weight visualization if enabled
    if (document.getElementById('show-weight-viz').checked) {
      this.visualizeWeights(rank, 256);
    }
  }

  visualizeWeights(rank, dim) {
    const visualization = document.getElementById('weight-visualization');
    
    // Clear existing visualization
    visualization.innerHTML = '';
    
    // Create A matrix visualization
    const aMatrixDiv = document.createElement('div');
    aMatrixDiv.innerHTML = '<div class="matrix-label">Matrix A (rank × dim)</div>';
    const aMatrix = this.createMatrixVisualization(rank, Math.min(dim, 32), 'A'); // Limit display size
    aMatrixDiv.appendChild(aMatrix);
    visualization.appendChild(aMatrixDiv);
    
    // Create B matrix visualization  
    const bMatrixDiv = document.createElement('div');
    bMatrixDiv.innerHTML = '<div class="matrix-label">Matrix B (dim × rank)</div>';
    const bMatrix = this.createMatrixVisualization(Math.min(dim, 32), rank, 'B');
    bMatrixDiv.appendChild(bMatrix);
    visualization.appendChild(bMatrixDiv);
    
    visualization.classList.remove('hidden');
  }

  createMatrixVisualization(rows, cols, matrixName) {
    const matrix = document.createElement('div');
    matrix.className = 'weight-matrix';
    matrix.style.gridTemplateColumns = `repeat(${cols}, 8px)`;
    
    // Generate random weights for visualization
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        
        // Random weight value for visualization
        const weight = (Math.random() - 0.5) * 2;
        const intensity = Math.abs(weight);
        const hue = weight > 0 ? 240 : 0; // Blue for positive, red for negative
        
        cell.style.backgroundColor = `hsla(${hue}, 70%, 50%, ${intensity})`;
        cell.title = `${matrixName}[${i},${j}] = ${weight.toFixed(3)}`;
        
        matrix.appendChild(cell);
      }
    }
    
    return matrix;
  }

  toggleWeightVisualization(show) {
    const visualization = document.getElementById('weight-visualization');
    if (show) {
      this.calculateLoRAStats(); // This will create the visualization
    } else {
      visualization.classList.add('hidden');
    }
  }

  // Advanced LoRA operations
  async createLoRAFromLayer(qrLayer) {
    const rank = parseInt(document.getElementById('lora-rank').value) || 16;
    const alpha = parseInt(document.getElementById('lora-alpha').value) || 32;
    const dropout = parseFloat(document.getElementById('lora-dropout').value) || 0.1;
    
    const config = { rank, alpha, dropout };
    
    // Generate LoRA weights optimized for the specific QR layer data
    const dataVector = this.qrDataToVector(qrLayer.data);
    const weights = this.generateOptimizedWeights(dataVector, config);
    
    return {
      config: config,
      weights: weights,
      metadata: {
        created: Date.now(),
        sourceLayer: qrLayer.id,
        optimization: 'qr-specific'
      }
    };
  }

  qrDataToVector(data) {
    // Convert QR data to numerical vector for LoRA optimization
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    const vector = new Array(256).fill(0);
    
    for (let i = 0; i < bytes.length && i < 256; i++) {
      vector[i] = bytes[i] / 255;
    }
    
    // Add pattern-based features for QR optimization
    const patterns = this.extractQRPatterns(data);
    for (let i = 0; i < patterns.length && i + bytes.length < 256; i++) {
      vector[bytes.length + i] = patterns[i];
    }
    
    return vector;
  }

  extractQRPatterns(data) {
    // Extract patterns specific to QR code optimization
    const patterns = [];
    
    // Character frequency patterns
    const charFreq = {};
    for (let char of data) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }
    
    // Most common characters (normalized)
    const sortedChars = Object.entries(charFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    for (let [char, freq] of sortedChars) {
      patterns.push(freq / data.length);
    }
    
    // Length-based patterns
    patterns.push(data.length / 1000); // Normalized length
    patterns.push(data.split(' ').length / 100); // Word count
    
    // Character type patterns
    const digits = (data.match(/\d/g) || []).length / data.length;
    const letters = (data.match(/[a-zA-Z]/g) || []).length / data.length;
    const symbols = (data.match(/[^\w\s]/g) || []).length / data.length;
    
    patterns.push(digits, letters, symbols);
    
    return patterns;
  }

  generateOptimizedWeights(dataVector, config) {
    const rank = config.rank;
    const dim = dataVector.length;
    
    // Initialize matrices with Xavier initialization, optimized for data patterns
    const A = this.generateOptimizedMatrix(rank, dim, dataVector, 'A');
    const B = this.generateOptimizedMatrix(dim, rank, dataVector, 'B');
    
    return {
      matrices: { A, B },
      bias: this.generateOptimizedBias(dim, dataVector),
      scaling: config.alpha / config.rank
    };
  }

  generateOptimizedMatrix(rows, cols, dataVector, matrixType) {
    const matrix = [];
    const dataVariance = this.calculateVariance(dataVector);
    const scaleFactor = Math.sqrt(2.0 / cols) * (1 + dataVariance);
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        // Add data-aware initialization
        let weight = (Math.random() - 0.5) * 2 * scaleFactor;
        
        // Adjust based on data patterns
        if (j < dataVector.length) {
          weight *= (1 + Math.abs(dataVector[j]) * 0.1);
        }
        
        row.push(weight);
      }
      matrix.push(row);
    }
    
    return matrix;
  }

  generateOptimizedBias(dim, dataVector) {
    const bias = [];
    for (let i = 0; i < dim; i++) {
      let biasValue = 0;
      if (i < dataVector.length) {
        biasValue = dataVector[i] * 0.01; // Small bias based on data
      }
      bias.push(biasValue);
    }
    return bias;
  }

  calculateVariance(vector) {
    const mean = vector.reduce((sum, val) => sum + val, 0) / vector.length;
    const variance = vector.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vector.length;
    return Math.sqrt(variance);
  }

  // Export/Import LoRA weights
  async exportLoRAWeights(weights, filename) {
    const data = JSON.stringify(weights, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'lora-weights.json';
    a.click();
    
    URL.revokeObjectURL(url);
  }

  async importLoRAWeights() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const weights = JSON.parse(e.target.result);
            resolve(weights);
          } catch (error) {
            reject(new Error('Invalid LoRA weights file'));
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    });
  }

  // Utility methods for LoRA management
  getLoRAStats(weights) {
    if (!weights || !weights.matrices) return null;
    
    const A = weights.matrices.A;
    const B = weights.matrices.B;
    const totalParams = A.length * A[0].length + B.length * B[0].length;
    const memorySize = totalParams * 4; // 4 bytes per float32
    
    return {
      parameters: totalParams,
      memorySize: memorySize,
      rank: A.length,
      dimension: B.length,
      sparsity: this.calculateMatrixSparsity([A, B])
    };
  }

  calculateMatrixSparsity(matrices) {
    let totalElements = 0;
    let zeroElements = 0;
    
    matrices.forEach(matrix => {
      matrix.forEach(row => {
        row.forEach(val => {
          totalElements++;
          if (Math.abs(val) < 1e-6) zeroElements++;
        });
      });
    });
    
    return zeroElements / totalElements;
  }
}

// Initialize LoRA UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.loraUI = new LoRAUI();
});