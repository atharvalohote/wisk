const sharp = require('sharp');
const path = require('path');

async function generateIcons() {
  try {
    console.log('🔄 Generating app icons...');
    
    // Read the original logo
    const originalLogo = path.join(__dirname, 'assets', 'mylogo.png');
    
    // Create a 1024x1024 icon with padding
    await sharp(originalLogo)
      .resize(800, 800, { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: 112,
        bottom: 112,
        left: 112,
        right: 112,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, 'assets', 'icon-1024.png'));
    
    console.log('✅ Generated icon-1024.png');
    
    // Create adaptive icon (foreground)
    await sharp(originalLogo)
      .resize(700, 700, { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: 162,
        bottom: 162,
        left: 162,
        right: 162,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, 'assets', 'adaptive-icon-foreground.png'));
    
    console.log('✅ Generated adaptive-icon-foreground.png');
    
    console.log('🎉 Icon generation complete!');
    console.log('📁 Check the assets folder for new icons');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons(); 