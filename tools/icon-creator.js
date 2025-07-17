const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const csv = require('csv-parser');

// Color mapping from the CSV data
const colorMap = {
  'All 2': '#FFFFFF',
  'All Games': '#FFFFFF',
  All: '#FFFFFF',
  'Amazon Prime Gaming': '#00A8E1',
  Amazon: '#FF9900',
  Apps: '#4CAF50',
  'Battle.Net': '#148EFF',
  Bethesda: '#D4AF37',
  Bookmark: '#FFD700',
  'Commodore Amiga': '#FF6B6B',
  'Controller Enabled': '#00E676',
  'Controller Support': '#00E676',
  'Couch Gaming': '#FF7043',
  'Critically Acclaimed': '#FFD700',
  Demos: '#9C27B0',
  'EA app': '#FF6C00',
  'EA Play': '#FF6C00',
  EAplay: '#FF6C00',
  'Epic Games Store': '#FFFFFF',
  'Epic Games': '#FFFFFF',
  Epic: '#FFFFFF',
  Fanatical: '#E91E63',
  Favoriten: '#F44336',
  'Favorites 2': '#F44336',
  Favorites: '#F44336',
  Friends: '#4CAF50',
  'Game Boy Advance': '#8E24AA',
  'Game Boy Color': '#FFD54F',
  'Game Boy Colour': '#FFD54F',
  'Game Boy': '#CCCCCC',
  'Gameboy Colour': '#FFD54F',
  Gameboy: '#CCCCCC',
  Gamecube: '#9C4DCC',
  Gba: '#8E24AA',
  Gbc: '#FFD54F',
  'Geforce Now': '#76B900',
  'Gog Galaxy': '#B764CE',
  Gog: '#B764CE',
  'Happy Halloween': '#FF5722',
  Humble: '#FF4444',
  Installed: '#2196F3',
  'Itch.Io': '#FA5C5C',
  'Legacy Games': '#A1887F',
  'Library 1': '#2196F3',
  Library: '#2196F3',
  Media: '#FF9800',
  'Most Played': '#FFD700',
  'My Library': '#2196F3',
  'My List': '#2196F3',
  N3ds: '#E53935',
  N64: '#2196F3',
  Nds: '#607D8B',
  'Neo Geo': '#FFD600',
  'Neo•Geo': '#FFD600',
  Nes: '#F44336',
  'New Releases': '#00E676',
  New: '#00E676',
  New2: '#00E676',
  'Nintendo 3ds': '#E53935',
  'Nintendo 64': '#2196F3',
  'Nintendo Ds': '#607D8B',
  'Nintendo Entertainment System': '#F44336',
  'Nintendo Game Boy Advance': '#8E24AA',
  'Nintendo Game Boy Color': '#FFD54F',
  'Nintendo Game Boy': '#CCCCCC',
  'Nintendo Gamecube': '#9C4DCC',
  'Nintendo Switch': '#E60012',
  'Nintendo Wii U': '#00BCD4',
  'Nintendo Wii': '#2196F3',
  'Not Installed': '#9E9E9E',
  'Nvidia Geforce Now': '#76B900',
  Nvidia: '#76B900',
  Origin: '#FF6600',
  'PC (Windows)': '#00BCF2',
  'Pc-Games': '#00BCF2',
  Pc: '#00BCF2',
  Play: '#4CAF50',
  Playnite: '#2196F3',
  Playstation: '#2196F3',
  'Playstation 2': '#2196F3',
  'Playstation 3': '#2196F3',
  'Playstation 4': '#2196F3',
  'Playstation 5': '#2196F3',
  'Playstation Portable': '#2196F3',
  'Prime Gaming': '#00A8E1',
  Ps1: '#2196F3',
  Ps2: '#2196F3',
  Ps3: '#2196F3',
  Ps4: '#2196F3',
  Ps5: '#2196F3',
  Psp: '#2196F3',
  'Recently Added 2': '#FF4444',
  'Recently Added': '#FF4444',
  'Recently Played': '#FF9800',
  Riot: '#FF6B6B',
  'Rockstar Games': '#FCAF17',
  'Sega Dreamcast': '#0099FF',
  'Sega Genesis': '#FF4444', // Changed from black #000000 to bright red
  'Sega Mega Drive': '#FF4444', // Changed from black #000000 to bright red
  'Sega Saturn': '#9575CD',
  'Sega Master System': '#FF4444',
  Snes: '#9575CD',
  'Sony Playsation Portable': '#2196F3',
  'Sony Playstation': '#2196F3',
  'Sony Playstation 2': '#2196F3',
  'Sony Playstation 3': '#2196F3',
  'Sony Playstation 4': '#2196F3',
  'Sony Playstation 5': '#2196F3',
  'Sony Playstation': '#2196F3',
  'Steam Deck': '#4A90E2',
  Steam: '#4A90E2',
  'Super Nintendo Entertainment System': '#9575CD',
  Switch: '#E60012',
  Todo: '#FF9800',
  'Top Rated': '#FFD700',
  'Trending Now': '#FF5722',
  'Ubisoft Connect': '#0084FF',
  'Up Next': '#9C27B0',
  Vrgames: '#00E676',
  'Wii U': '#00BCD4',
  Wii: '#2196F3',
  Windows: '#00BCF2',
  'Xbox 360': '#32CD32',
  'Xbox Cloud Gaming': '#32CD32',
  'Xbox One': '#32CD32',
  Xbox: '#32CD32',
  Xcloud: '#32CD32',
};

function getColorForIcon(filename) {
  // Remove file extension
  const name = path.parse(filename).name;

  // Try exact match first
  if (colorMap[name]) {
    return colorMap[name];
  }

  // Try case-insensitive match
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  // Default to white if no match found
  return '#FFFFFF';
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r, g, b) {
  // Convert RGB to relative luminance using WCAG formula
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function shouldUseBlackIcon(backgroundColor) {
  const bgColor = hexToRgb(backgroundColor);
  const whiteColor = { r: 255, g: 255, b: 255 };

  // Calculate contrast ratio between white icon and background
  const contrastRatio = getContrastRatio(whiteColor, bgColor);

  // WCAG recommends minimum 3:1 for large text/icons
  // Use black icon if contrast is insufficient
  return contrastRatio < 2;
}

async function processIcons(iconsPath) {
  const defaultDir = path.join(iconsPath, 'Default');
  const activeDir = path.join(iconsPath, 'Active');

  // Create output directories
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  if (!fs.existsSync(activeDir)) {
    fs.mkdirSync(activeDir, { recursive: true });
  }

  // Get all PNG files in the icons directory
  const files = fs
    .readdirSync(iconsPath)
    .filter((file) => path.extname(file).toLowerCase() === '.png')
    .filter((file) => fs.statSync(path.join(iconsPath, file)).isFile());

  console.log(`Found ${files.length} icon files to process...`);

  for (const file of files) {
    const iconPath = path.join(iconsPath, file);
    const color = getColorForIcon(file);

    console.log(`Processing ${file} with color ${color}...`);

    try {
      // Create default icon (recolored)
      const defaultCanvas = await createDefaultIcon(iconPath, color);
      const defaultOutput = path.join(defaultDir, file);
      const defaultBuffer = defaultCanvas.toBuffer('image/png');
      fs.writeFileSync(defaultOutput, defaultBuffer);

      // Create active icon (white icon in colored circle)
      const activeCanvas = await createActiveIcon(iconPath, color);
      const activeOutput = path.join(activeDir, file);
      const activeBuffer = activeCanvas.toBuffer('image/png');
      fs.writeFileSync(activeOutput, activeBuffer);

      console.log(`✓ Created ${file}`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  console.log('Processing complete!');
}

function resizeIconToFit(originalImage, maxWidth = 256, maxHeight = 256) {
  const originalWidth = originalImage.width;
  const originalHeight = originalImage.height;

  // If already the right size, return as-is
  if (originalWidth === maxWidth && originalHeight === maxHeight) {
    return originalImage;
  }

  // Calculate scaling factor to fit within bounds while maintaining aspect ratio
  const scaleX = maxWidth / originalWidth;
  const scaleY = maxHeight / originalHeight;
  const scale = Math.min(scaleX, scaleY);

  const newWidth = Math.round(originalWidth * scale);
  const newHeight = Math.round(originalHeight * scale);

  // Create a new canvas with the resized image
  const canvas = createCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d');

  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

  return canvas;
}

function recolorIcon(originalImage, color) {
  // First resize the image to fit within 256x256
  const resizedImage = resizeIconToFit(originalImage, 256, 256);

  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Center the resized image in the 256x256 canvas
  const offsetX = (256 - resizedImage.width) / 2;
  const offsetY = (256 - resizedImage.height) / 2;

  // Draw the resized image centered
  ctx.drawImage(resizedImage, offsetX, offsetY);

  // Apply color overlay using composite operation
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);

  return canvas;
}

async function createDefaultIcon(iconPath, color) {
  const canvas = createCanvas(384, 384);
  const ctx = canvas.getContext('2d');

  // Load and recolor the original icon
  const originalImage = await loadImage(iconPath);
  const recoloredIcon = recolorIcon(originalImage, color);

  // Center the 256x256 icon in the 384x384 canvas
  const offsetX = (384 - 256) / 2;
  const offsetY = (384 - 256) / 2;

  ctx.drawImage(recoloredIcon, offsetX, offsetY);

  return canvas;
}

async function createActiveIcon(iconPath, color) {
  const canvas = createCanvas(384, 384);
  const ctx = canvas.getContext('2d');

  // Draw colored circle
  const centerX = 192;
  const centerY = 192;
  const radius = 192;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  // Load and resize the original icon
  const originalImage = await loadImage(iconPath);
  const resizedImage = resizeIconToFit(originalImage, 256, 256);

  // Calculate centering within the 384x384 canvas
  const iconX = (384 - resizedImage.width) / 2;
  const iconY = (384 - resizedImage.height) / 2;

  // Check if we need to use black icon for better contrast
  if (shouldUseBlackIcon(color)) {
    // Recolor the resized icon to black
    const blackIcon = recolorIcon(originalImage, '#000000');
    ctx.drawImage(blackIcon, 64, 64); // Center the 256x256 recolored icon
  } else {
    // Use the original resized icon (white)
    ctx.drawImage(resizedImage, iconX, iconY);
  }

  return canvas;
}

// Main execution
if (process.argv.length < 3) {
  console.log('Usage: node script.js <path-to-icons-directory>');
  process.exit(1);
}

const iconsPath = process.argv[2];

if (!fs.existsSync(iconsPath)) {
  console.error('Error: Icons directory does not exist:', iconsPath);
  process.exit(1);
}

processIcons(iconsPath).catch(console.error);
