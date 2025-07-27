# QR-Constellation IDE - Setup & Installation Guide

## Quick Start

### For End Users

#### Windows
1. Download `QR-Constellation-IDE-Setup.exe` from the releases page
2. Run the installer and follow the setup wizard
3. Launch QR-Constellation IDE from Start Menu or Desktop shortcut

#### macOS
1. Download `QR-Constellation-IDE.dmg` from the releases page
2. Open the DMG file and drag the app to Applications folder
3. Launch from Applications or Spotlight search

#### Linux
Choose your preferred installation method:

**AppImage (Recommended)**
```bash
# Make executable and run
chmod +x QR-Constellation-IDE.AppImage
./QR-Constellation-IDE.AppImage
```

**Snap Package**
```bash
sudo snap install qr-constellation-ide --edge
```

**Debian/Ubuntu**
```bash
sudo dpkg -i qr-constellation-ide_1.0.0_amd64.deb
```

### For Developers

#### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

#### Development Setup
```bash
# Clone the repository
git clone https://github.com/MYaelMendez/commanprompt.git
cd commanprompt

# Install dependencies
npm install

# Run in development mode (with DevTools)
npm run dev

# Run production mode
npm start

# Build installers for all platforms
npm run build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run pack         # Create unpacked directory
```

## Features Overview

### 1. Cinematic Constellation Mode
Transform your QR codes into a stunning 3D constellation with:
- **Z-axis Animation**: QR codes float and rotate in 3D space
- **Dynamic Stacking**: Multiple QR layers create depth and visual interest
- **Particle Effects**: Cosmic particles enhance the cinematic experience
- **Interactive Camera**: Zoom, rotate, and explore your QR constellation

### 2. LoRA Integration
Apply Low-Rank Adaptation to your QR codes:
- **Weight Visualization**: See LoRA matrices in real-time
- **Parameter Control**: Adjust rank, alpha, and dropout values
- **Memory Optimization**: Reduce parameters by up to 90%
- **Preset Configurations**: Quick setup for different use cases

### 3. Advanced QR Management
- **Multi-layer Support**: Generate and manage QR stacks
- **Import/Export**: Save and share your QR constellations
- **Real-time Preview**: Instant QR generation and updates
- **CLI Interface**: Command-line style interaction

## Usage Instructions

### Basic Workflow
1. **Generate QR Codes**: Enter data and click "Generate QR"
2. **Build Stack**: Create multiple QR codes to form a constellation
3. **Apply LoRA** (Optional): Enhance QR layers with fine-tuned weights
4. **Activate Constellation**: Click "Constellation Mode" for 3D visualization
5. **Export/Share**: Save your QR stack for later use

### CLI Commands
Use the central command interface:
```
gen hello world          # Generate QR with "hello world"
constellation            # Toggle 3D constellation mode
lora apply               # Apply LoRA to selected layer
clear                    # Clear all QR layers
help                     # Show available commands
```

### LoRA Configuration
- **Small (Rank 4)**: Minimal memory usage, basic adaptation
- **Medium (Rank 16)**: Balanced performance and quality
- **Large (Rank 64)**: Maximum adaptation capability

## Troubleshooting

### Common Issues

**Application won't start on macOS**
```bash
# Allow unsigned app (if needed)
sudo xattr -rd com.apple.quarantine /Applications/QR-Constellation-IDE.app
```

**Linux AppImage execution issues**
```bash
# Install FUSE if missing
sudo apt install fuse libfuse2

# Or use --appimage-extract-and-run
./QR-Constellation-IDE.AppImage --appimage-extract-and-run
```

**3D visualization not working**
- Ensure WebGL is enabled in your system
- Update graphics drivers
- Try the 2D fallback mode (automatic)

**Performance issues**
- Reduce particle count in Animation Settings
- Lower the QR stack size
- Disable auto-rotate if using older hardware

### System Requirements

**Minimum**
- OS: Windows 10, macOS 10.14, Ubuntu 18.04
- RAM: 4GB
- Graphics: Integrated graphics with WebGL support
- Storage: 200MB free space

**Recommended**
- OS: Latest stable versions
- RAM: 8GB+
- Graphics: Dedicated GPU with WebGL 2.0
- Storage: 1GB free space

## Architecture Details

### Project Structure
```
commanprompt/
├── main.js                 # Electron main process
├── renderer/               # Frontend code
│   ├── index.html         # Main UI
│   ├── styles.css         # Cosmic theming
│   ├── app.js             # Core application logic
│   ├── constellation-renderer.js  # 3D visualization
│   └── lora-ui.js         # LoRA interface
├── backend/               # Backend modules
│   ├── qr-generator.js    # QR code generation
│   ├── constellation-engine.js  # Animation engine
│   └── lora-manager.js    # LoRA processing
├── web-demo.html          # Browser demo
├── web-demo-api.js        # Mock API for demo
└── dist/                  # Built installers
```

### Technology Stack
- **Electron**: Cross-platform desktop framework
- **Three.js**: 3D graphics and WebGL rendering
- **Node.js**: Backend processing and file operations
- **HTML5 Canvas**: 2D fallback rendering
- **CSS Grid/Flexbox**: Responsive UI layout

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Run linting: `npm run lint` (if available)
5. Commit changes with descriptive message
6. Push and create Pull Request

### Code Style
- Use modern ES6+ JavaScript
- Follow existing naming conventions
- Comment complex algorithms (especially LoRA math)
- Maintain responsive design principles

### Testing
- Test on multiple platforms before PR
- Verify both 3D and 2D rendering modes
- Check LoRA calculations with known test cases
- Ensure export/import functionality works

## Building Installers

### Prerequisites for Building
- **Windows**: Windows 10+ with Visual Studio Build Tools
- **macOS**: macOS 10.14+ with Xcode Command Line Tools
- **Linux**: Ubuntu 18.04+ with build-essential

### Build Commands
```bash
# Build all platforms (requires platform-specific environments)
npm run build

# Platform-specific builds
npm run build:win    # Creates .exe installer
npm run build:mac    # Creates .dmg installer
npm run build:linux  # Creates AppImage and snap

# Development builds (faster, no code signing)
npm run pack
```

### Code Signing (Optional)
For distribution, set up code signing:

**Windows**
```bash
# Set environment variables
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password
```

**macOS**
```bash
# Set Apple Developer credentials
export APPLE_ID=your.email@domain.com
export APPLE_ID_PASSWORD=app_specific_password
```

## Support

### Getting Help
- Check this documentation first
- Browse existing GitHub issues
- Create new issue with:
  - System information
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots/logs if applicable

### Feature Requests
We welcome feature requests! Please include:
- Clear description of the feature
- Use case and benefits
- Any implementation ideas
- Mockups or examples if visual

---

**Ready to transform your QR codes into constellations? Start your journey with QR-Constellation IDE!** 🚀