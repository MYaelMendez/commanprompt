class ConstellationRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = null;
    this.qrLayers = [];
    this.animationId = null;
    this.isPlaying = false;
    this.currentFrame = 0;
    this.animationFrames = [];
    
    // Check if THREE.js is available, fallback to 2D if not
    this.use3D = typeof THREE !== 'undefined';
    
    if (this.use3D) {
      this.init3D();
    } else {
      this.init2D();
    }
  }

  init2D() {
    // 2D Canvas fallback when Three.js is not available
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    
    // Start render loop
    this.animate2D();
  }

  init3D() {
  init3D() {
    // Original 3D initialization code
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a2a);

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 300);

    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas, 
      alpha: true,
      antialias: true 
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
    this.setupControls();
    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  animate2D() {
    this.animationId = requestAnimationFrame(() => this.animate2D());
    
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.fillStyle = '#0a0a2a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw cosmic background
    this.drawCosmicBackground();
    
    // Draw QR layers with 2D animation
    this.qrLayers.forEach((layer, index) => {
      this.drawQRLayer2D(layer, index);
    });
    
    // Draw particles
    this.drawParticles2D();
  }

  drawCosmicBackground() {
    const time = Date.now() * 0.001;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Create radial gradient
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(this.canvas.width, this.canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(26, 26, 58, 0.8)');
    gradient.addColorStop(0.5, 'rgba(10, 10, 42, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add animated stars
    for (let i = 0; i < 100; i++) {
      const x = (Math.sin(time * 0.1 + i) * 0.5 + 0.5) * this.canvas.width;
      const y = (Math.cos(time * 0.05 + i * 2) * 0.5 + 0.5) * this.canvas.height;
      const brightness = Math.sin(time + i) * 0.5 + 0.5;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 1, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawQRLayer2D(layer, index) {
    if (!layer.img) return;
    
    const time = Date.now() * 0.001;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Calculate position for constellation effect
    const radius = 100 + (index * 30);
    const angle = (index / this.qrLayers.length) * Math.PI * 2 + time * 0.5;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Calculate scale and rotation
    const scale = 0.3 + Math.sin(time + index) * 0.1;
    const rotation = time + index;
    
    // Draw QR code with transformation
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.scale(scale, scale);
    this.ctx.globalAlpha = 0.8 - (index / this.qrLayers.length) * 0.3;
    
    const size = 80;
    this.ctx.drawImage(layer.img, -size/2, -size/2, size, size);
    
    // Add glow effect
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 20;
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-size/2, -size/2, size, size);
    
    this.ctx.restore();
  }

  drawParticles2D() {
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 50; i++) {
      const x = Math.cos(time * 0.5 + i) * (200 + i * 5) + this.canvas.width / 2;
      const y = Math.sin(time * 0.3 + i) * (150 + i * 3) + this.canvas.height / 2;
      const size = Math.sin(time + i) * 2 + 3;
      const alpha = Math.sin(time * 2 + i) * 0.5 + 0.5;
      
      this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.6})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  startAnimation(animationData) {
    // Clear existing layers
    this.qrLayers = [];
    
    // Convert QR data to images for 2D rendering
    animationData.stack.layers.forEach((layer, index) => {
      const img = new Image();
      img.onload = () => {
        layer.img = img;
      };
      img.src = layer.dataURL || layer.buffer;
      this.qrLayers.push(layer);
    });
    
    this.animationFrames = animationData.frames || [];
    this.currentFrame = 0;
    this.isPlaying = true;
    
    document.getElementById('animation-controls').classList.remove('hidden');
    document.getElementById('animation-status').textContent = 'Running';
    
    if (this.use3D) {
      this.startAnimation3D(animationData);
    } else {
      this.playAnimationFrames2D();
    }
  }

  playAnimationFrames2D() {
    if (!this.isPlaying || this.currentFrame >= this.animationFrames.length) {
      return;
    }

    const progress = (this.currentFrame / this.animationFrames.length) * 100;
    document.getElementById('animation-progress').style.width = `${progress}%`;

    this.currentFrame++;
    setTimeout(() => this.playAnimationFrames2D(), 50);
  }

  startAnimation3D(animationData) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a2a);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 300);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas, 
      alpha: true,
      antialias: true 
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Setup lighting
    this.setupLighting();

    // Setup controls
    this.setupControls();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  startAnimation3D(animationData) {
    // Clear existing meshes
    this.clearQRMeshes();

    // Create QR meshes
    animationData.stack.layers.forEach((layer, index) => {
      const mesh = this.createQRMesh(layer, index, animationData.stack.layers.length);
      this.qrMeshes.push(mesh);
      this.scene.add(mesh);
    });

    // Create particle system
    if (document.getElementById('show-particles').checked) {
      this.particleSystem = this.createParticleSystem(animationData.stack.layers.length);
      this.scene.add(this.particleSystem);
    }

    // Start 3D animation loop
    this.playAnimationFrames3D();
  }

  playAnimationFrames3D() {
    if (!this.isPlaying || this.currentFrame >= this.animationFrames.length) {
      return;
    }

    const frame = this.animationFrames[this.currentFrame];
    
    // Apply transformations to each QR mesh
    frame.layers.forEach((layerFrame, index) => {
      if (this.qrMeshes[index]) {
        const mesh = this.qrMeshes[index];
        const transform = layerFrame.transform;

        mesh.position.set(
          transform.translateX,
          transform.translateY,
          transform.translateZ
        );

        mesh.rotation.set(
          THREE.MathUtils.degToRad(transform.rotateX),
          THREE.MathUtils.degToRad(transform.rotateY),
          THREE.MathUtils.degToRad(transform.rotateZ)
        );

        mesh.scale.setScalar(transform.scale);
        mesh.material.opacity = layerFrame.opacity;
      }
    });

    const progress = (this.currentFrame / this.animationFrames.length) * 100;
    document.getElementById('animation-progress').style.width = `${progress}%`;

    this.currentFrame++;
    setTimeout(() => this.playAnimationFrames3D(), 50);
  }

  play() {
    this.isPlaying = true;
    if (this.use3D) {
      this.playAnimationFrames3D();
    } else {
      this.playAnimationFrames2D();
    }
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentFrame = 0;
    if (this.use3D) {
      this.clearQRMeshes();
    } else {
      this.qrLayers = [];
    }
    document.getElementById('animation-progress').style.width = '0%';
  }

  setZoom(zoom) {
    if (this.use3D && this.camera) {
      this.camera.position.z = 300 / zoom;
    }
  }

  animate() {
    if (!this.use3D) return;
    
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now();

    // Animate lighting
    if (this.animateLight) {
      this.animateLight(time);
    }

    // Animate particles
    if (this.particleSystem && this.particleSystem.material.uniforms) {
      this.particleSystem.material.uniforms.time.value = time * 0.001;
    }

    // Auto-rotate camera if enabled
    if (document.getElementById('auto-rotate') && document.getElementById('auto-rotate').checked) {
      this.camera.position.x = Math.cos(time * 0.0005) * 300;
      this.camera.position.z = Math.sin(time * 0.0005) * 300;
      this.camera.lookAt(0, 0, 0);
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  // Keep existing 3D methods for when THREE.js is available
  clearQRMeshes() {
    if (!this.use3D) return;
    
    this.qrMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.qrMeshes = [];

    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
      this.particleSystem = null;
    }
  }

  onWindowResize() {
    if (this.use3D && this.camera && this.renderer) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    } else if (!this.use3D) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
    }
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.use3D) {
      this.clearQRMeshes();
      if (this.renderer) this.renderer.dispose();
    }
  }
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.4);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point light for constellation effect
    const pointLight = new THREE.PointLight(0x00ffff, 0.6, 200);
    pointLight.position.set(0, 0, 100);
    this.scene.add(pointLight);

    // Add light animation
    this.animateLight = (time) => {
      pointLight.position.x = Math.sin(time * 0.001) * 50;
      pointLight.position.y = Math.cos(time * 0.001) * 50;
      pointLight.intensity = 0.6 + Math.sin(time * 0.003) * 0.2;
    };
  }

  setupControls() {
    // Mouse controls for camera
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    this.canvas.addEventListener('mousedown', (event) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    this.canvas.addEventListener('mouseup', () => {
      mouseDown = false;
    });

    this.canvas.addEventListener('mousemove', (event) => {
      if (!mouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      this.camera.position.x += deltaX * 0.5;
      this.camera.position.y -= deltaY * 0.5;

      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    // Wheel zoom
    this.canvas.addEventListener('wheel', (event) => {
      const delta = event.deltaY * 0.1;
      this.camera.position.z += delta;
      this.camera.position.z = Math.max(50, Math.min(800, this.camera.position.z));
    });
  }

  createQRMesh(qrLayer, index, totalLayers) {
    // Create texture from QR code data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = qrLayer.size || 256;
    canvas.height = qrLayer.size || 256;

    // Create QR pattern (simplified for demo)
    this.drawQRPattern(ctx, qrLayer.data, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create material
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      opacity: qrLayer.opacity || (1 - index / totalLayers * 0.5),
      side: THREE.DoubleSide
    });

    // Create geometry
    const geometry = new THREE.PlaneGeometry(80, 80);
    const mesh = new THREE.Mesh(geometry, material);

    // Initial position
    const radius = 50 + (index * 20);
    const angle = (index / totalLayers) * Math.PI * 2;
    mesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      index * 30
    );

    mesh.userData = {
      layerId: qrLayer.id,
      originalPosition: mesh.position.clone(),
      index: index
    };

    return mesh;
  }

  drawQRPattern(ctx, data, width, height) {
    // Simple QR-like pattern generation
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#000000';
    
    const moduleSize = Math.floor(width / 25); // 25x25 grid
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
  }

  drawCornerMarker(ctx, x, y, size) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, size * 7, size * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + size, y + size, size * 5, size * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + size * 2, y + size * 2, size * 3, size * 3);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  createParticleSystem(layerCount) {
    const particleCount = layerCount * 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color(0x00ff00),
      new THREE.Color(0xffa500),
      new THREE.Color(0x800080),
      new THREE.Color(0x00ffff),
      new THREE.Color(0xff00ff),
      new THREE.Color(0xffff00)
    ];

    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = Math.random() * 200;

      // Color
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Size
      sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time + position.x * 0.01) * 0.3);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float distance = length(gl_PointCoord - vec2(0.5));
          if (distance > 0.5) discard;
          
          float alpha = 1.0 - distance * 2.0;
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
  }

  startAnimation(animationData) {
    // Clear existing meshes
    this.clearQRMeshes();

    // Create QR meshes
    animationData.stack.layers.forEach((layer, index) => {
      const mesh = this.createQRMesh(layer, index, animationData.stack.layers.length);
      this.qrMeshes.push(mesh);
      this.scene.add(mesh);
    });

    // Create particle system
    if (document.getElementById('show-particles').checked) {
      this.particleSystem = this.createParticleSystem(animationData.stack.layers.length);
      this.scene.add(this.particleSystem);
    }

    // Store animation frames
    this.animationFrames = animationData.frames || [];
    this.currentFrame = 0;
    this.isPlaying = true;

    // Start animation loop
    this.playAnimationFrames();
  }

  playAnimationFrames() {
    if (!this.isPlaying || this.currentFrame >= this.animationFrames.length) {
      return;
    }

    const frame = this.animationFrames[this.currentFrame];
    
    // Apply transformations to each QR mesh
    frame.layers.forEach((layerFrame, index) => {
      if (this.qrMeshes[index]) {
        const mesh = this.qrMeshes[index];
        const transform = layerFrame.transform;

        mesh.position.set(
          transform.translateX,
          transform.translateY,
          transform.translateZ
        );

        mesh.rotation.set(
          THREE.MathUtils.degToRad(transform.rotateX),
          THREE.MathUtils.degToRad(transform.rotateY),
          THREE.MathUtils.degToRad(transform.rotateZ)
        );

        mesh.scale.setScalar(transform.scale);
        mesh.material.opacity = layerFrame.opacity;
      }
    });

    // Update progress
    const progress = (this.currentFrame / this.animationFrames.length) * 100;
    document.getElementById('animation-progress').style.width = `${progress}%`;

    this.currentFrame++;

    // Schedule next frame
    setTimeout(() => this.playAnimationFrames(), 50); // 20 FPS
  }

  play() {
    this.isPlaying = true;
    this.playAnimationFrames();
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.clearQRMeshes();
    document.getElementById('animation-progress').style.width = '0%';
  }

  clearQRMeshes() {
    this.qrMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.qrMeshes = [];

    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
      this.particleSystem = null;
    }
  }

  setZoom(zoom) {
    this.camera.position.z = 300 / zoom;
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now();

    // Animate lighting
    if (this.animateLight) {
      this.animateLight(time);
    }

    // Animate particles
    if (this.particleSystem && this.particleSystem.material.uniforms) {
      this.particleSystem.material.uniforms.time.value = time * 0.001;
    }

    // Auto-rotate camera if enabled
    if (document.getElementById('auto-rotate') && document.getElementById('auto-rotate').checked) {
      this.camera.position.x = Math.cos(time * 0.0005) * 300;
      this.camera.position.z = Math.sin(time * 0.0005) * 300;
      this.camera.lookAt(0, 0, 0);
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.clearQRMeshes();
    this.renderer.dispose();
  }
}

// Make it available globally
window.ConstellationRenderer = ConstellationRenderer;