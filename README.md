# QR-Constellation IDE

A revolutionary Electron-based IDE that combines QR code generation with cinematic 3D visualization and LoRA (Low-Rank Adaptation) support. Experience your QR codes in a whole new dimension with animated Z-axis constellation displays.

## 🌟 Features

### 1. **Cinematic Constellation Mode**
- **3D QR Visualization**: Experience QR codes in a stunning 3D space with animated Z-axis stacking
- **Dynamic Animations**: Smooth transitions and rotations create a cinematic viewing experience  
- **Interactive Controls**: Zoom, rotate, and control animation speed in real-time
- **Particle Effects**: Cosmic particle systems enhance the visual experience
- **Auto-Rotate Mode**: Automatic camera movement for continuous constellation display

### 2. **Advanced QR Generation**
- **Multi-Layer Support**: Generate and manage multiple QR codes in a single stack
- **Customizable Properties**: Adjust size, colors, and error correction levels
- **Real-time Preview**: Instant QR code generation with live preview
- **Export/Import**: Save and load QR stacks for collaboration and reuse

### 3. **LoRA Integration**
- **Fine-Tuned Weights**: Apply Low-Rank Adaptation to QR layers for enhanced encoding
- **Configurable Parameters**: Adjust rank, alpha, and dropout values
- **Weight Visualization**: Real-time display of LoRA weight matrices
- **Parameter Statistics**: Monitor memory usage, parameter count, and reduction ratios
- **Preset Configurations**: Quick setup with small, medium, and large LoRA presets

### 4. **Cross-Platform Distribution**
- **Electron Framework**: Native desktop application for Windows, macOS, and Linux
- **Automated Installers**: One-click installation packages for all platforms
- **Web Demo**: Browser-based demonstration version available
- **Offline Capability**: Full functionality without internet connection

## 🚀 Installation

### Desktop Application

#### Windows
```bash
# Download and run the installer
QR-Constellation-IDE-Setup.exe
```

#### macOS
```bash
# Download and install
QR-Constellation-IDE.dmg
```

#### Linux
```bash
# AppImage (Universal)
./QR-Constellation-IDE.AppImage

# Snap Package
sudo snap install qr-constellation-ide

# Debian/Ubuntu
sudo dpkg -i qr-constellation-ide_1.0.0_amd64.deb
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/MYaelMendez/commanprompt.git
cd commanprompt

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for distribution
npm run build
```

## 🎮 Usage

### Basic QR Generation
1. Enter your data in the QR Generation panel
2. Adjust size and properties as needed
3. Click "Generate QR" to create your QR code
4. The QR code will appear in the layers list

### Constellation Mode
1. Generate multiple QR codes to create a stack
2. Click "Constellation Mode" to activate 3D visualization
3. Use animation controls to play, pause, or stop the animation
4. Adjust camera zoom and enable particle effects for enhanced visuals

### LoRA Configuration
1. Select a QR layer from the stack
2. Configure LoRA parameters (rank, alpha, dropout)
3. Click "Apply LoRA" to enhance the QR layer with fine-tuned weights
4. View the applied LoRA statistics in the status panel

### CLI Commands
The central command interface supports:
- `gen [data]` - Generate QR code with specified data
- `constellation` - Toggle constellation mode
- `lora apply` - Apply LoRA weights to selected layer
- `clear` - Clear all QR layers
- `help` - Show available commands

## 🛠️ Technical Architecture

### Frontend (Renderer Process)
- **HTML5 Canvas**: 2D fallback rendering for maximum compatibility
- **Three.js Integration**: 3D WebGL rendering when available
- **Modern CSS**: Responsive design with cosmic theming
- **Real-time Updates**: Live parameter adjustment and visualization

### Backend (Main Process)
- **QR Code Generation**: High-quality QR code creation with customizable options
- **LoRA Processing**: Advanced mathematical operations for weight application
- **File System Integration**: Import/export functionality for QR stacks
- **IPC Communication**: Secure communication between processes

### Build System
- **Electron Builder**: Cross-platform packaging and distribution
- **Code Signing**: Signed installers for security and trust
- **Auto-updater**: Seamless updates for end users
- **Asset Optimization**: Minimized bundle sizes for faster distribution

## 🔧 Configuration

### LoRA Parameters
- **Rank**: Controls the complexity of the adaptation (4, 8, 16, 32, 64)
- **Alpha**: Scaling factor for LoRA weights (1-128)
- **Dropout**: Regularization parameter (0.0-0.5)

### Animation Settings
- **Speed**: Animation playback speed (0.1x - 3x)
- **Zoom**: Camera zoom level (0.5x - 5x)
- **Particles**: Toggle particle effects on/off
- **Auto-Rotate**: Enable automatic camera rotation

## 📊 Performance

- **Memory Usage**: Optimized for low memory footprint with LoRA compression
- **Rendering**: 60 FPS smooth animations with hardware acceleration
- **Startup Time**: Fast initialization under 3 seconds
- **File Size**: Compact QR stack files for efficient storage

## 🔒 Security

- **Sandboxed Rendering**: Secure renderer process isolation
- **Context Isolation**: Protected IPC communication
- **Code Signing**: Verified application integrity
- **No Network Dependencies**: Fully offline operation

## 🌐 Web Demo

Experience the QR-Constellation IDE in your browser:
- Open `web-demo.html` in a modern web browser
- Full feature set available without installation
- Compatible with Chrome, Firefox, Safari, and Edge

![QR-Constellation IDE Interface](https://github.com/user-attachments/assets/c060b212-f091-44e7-83c2-ce8697f06130)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron Team**: For the excellent desktop application framework
- **Three.js Community**: For the powerful 3D graphics library
- **QR Code Libraries**: For reliable QR code generation algorithms
- **LoRA Research**: For the innovative adaptation techniques

---

**🚀 Transform your QR codes into constellations. Experience the future of QR visualization with QR-Constellation IDE!**
