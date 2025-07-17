const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { createCanvas, loadImage } = require('canvas');

// Function to generate SVG with color substitution
function generateSvgWithColor(color) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="640" height="360" viewBox="0 0 640 360" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g transform="matrix(0.996535,0,0,0.9986,2.61991,1.45072)">
        <rect x="-2.685" y="-1.416" width="642.135" height="360.407" style="fill:rgb(36,36,36);"/>
    </g>
    <path d="M205.225,54.635C205.225,45.488 197.799,38.062 188.652,38.062L76.381,38.062C67.235,38.062 59.809,45.488 59.809,54.635L59.809,216.861C59.809,226.007 67.235,233.433 76.381,233.433L188.652,233.433C197.799,233.433 205.225,226.007 205.225,216.861L205.225,54.635Z" style="fill:rgb(128,128,128);stroke:${color};stroke-width:5.92px;"/>
    <g transform="matrix(0.762798,0,0,0.762798,174.017,32.1996)">
        <path d="M205.225,54.635C205.225,45.488 197.799,38.062 188.652,38.062L76.381,38.062C67.235,38.062 59.809,45.488 59.809,54.635L59.809,216.861C59.809,226.007 67.235,233.433 76.381,233.433L188.652,233.433C197.799,233.433 205.225,226.007 205.225,216.861L205.225,54.635Z" style="fill:rgb(128,128,128);"/>
    </g>
    <g transform="matrix(0.762798,0,0,0.762798,318.22,32.1996)">
        <path d="M205.225,54.635C205.225,45.488 197.799,38.062 188.652,38.062L76.381,38.062C67.235,38.062 59.809,45.488 59.809,54.635L59.809,216.861C59.809,226.007 67.235,233.433 76.381,233.433L188.652,233.433C197.799,233.433 205.225,226.007 205.225,216.861L205.225,54.635Z" style="fill:rgb(128,128,128);"/>
    </g>
    <g transform="matrix(0.762798,0,0,0.762798,464.444,32.1996)">
        <path d="M205.225,54.635C205.225,45.488 197.799,38.062 188.652,38.062L76.381,38.062C67.235,38.062 59.809,45.488 59.809,54.635L59.809,216.861C59.809,226.007 67.235,233.433 76.381,233.433L188.652,233.433C197.799,233.433 205.225,226.007 205.225,216.861L205.225,54.635Z" style="fill:rgb(128,128,128);"/>
    </g>
    <g transform="matrix(0.593629,0,0,1,123.262,-8.69664)">
        <path d="M595.966,315.748C595.966,303.023 578.563,292.691 557.127,292.691L113.008,292.691C91.572,292.691 74.169,303.023 74.169,315.748C74.169,328.473 91.572,338.804 113.008,338.804L557.127,338.804C578.563,338.804 595.966,328.473 595.966,315.748Z" style="fill:rgb(51,51,51);stroke:rgb(66,66,66);stroke-width:4.53px;"/>
    </g>
    <g transform="matrix(0.215722,0,0,0.403783,41.003,126.31)">
        <path d="M595.966,315.748C595.966,303.023 576.629,292.691 552.81,292.691L117.324,292.691C93.506,292.691 74.169,303.023 74.169,315.748C74.169,328.473 93.506,338.804 117.324,338.804L552.81,338.804C576.629,338.804 595.966,328.473 595.966,315.748Z" style="fill:${color};"/>
    </g>
    <g transform="matrix(0.745455,0,0,0.745455,173.916,70.9035)">
        <circle cx="105.337" cy="316.414" r="21.726" style="fill:${color};fill-opacity:0;stroke:${color};stroke-width:5.24px;"/>
    </g>
    <g transform="matrix(0.745455,0,0,0.745455,122.09,70.5875)">
        <circle cx="105.337" cy="316.414" r="21.726" style="fill:white;fill-opacity:0.14;"/>
    </g>
</svg>`;
}

// Function to generate image from SVG
async function generateImageFromSvg(svgString, filename, outputDir) {
  try {
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
    const img = await loadImage(svgDataUrl);

    const canvas = createCanvas(640, 360); // Using original SVG dimensions
    const ctx = canvas.getContext('2d');

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, 640, 360);

    // Draw the SVG image
    ctx.drawImage(img, 0, 0, 640, 360);

    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(outputDir, `${filename}.png`);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Generated: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating image for ${filename}:`, error);
  }
}

// Main function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-color-swatches.js <path-to-yaml-file>');
    console.error('Example: node generate-color-swatches.js ./options.yaml');
    process.exit(1);
  }

  const yamlFilePath = args[0];

  try {
    // Check if file exists
    if (!fs.existsSync(yamlFilePath)) {
      console.error(`Error: File not found: ${yamlFilePath}`);
      process.exit(1);
    }

    // Read and parse the YAML file
    const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
    const data = yaml.load(fileContents);

    // Create output directory based on the YAML file location
    const yamlDir = path.dirname(yamlFilePath);
    const outputDir = path.join(yamlDir, 'color-swatches');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Extract colors from the YAML structure
    const presets = data.Presets.AccentColorOption.Presets;

    if (!presets) {
      console.error('Error: Invalid YAML structure. Expected Presets.AccentColorOption.Presets');
      process.exit(1);
    }

    // Generate images for each color
    let generatedCount = 0;
    for (const [key, preset] of Object.entries(presets)) {
      const name = preset.Name;
      const color = preset.Constants?.PrimaryBrush?.Value || preset.Constants?.PrimaryBrush?.Default;

      if (color && name) {
        const svgWithColor = generateSvgWithColor(color);
        await generateImageFromSvg(svgWithColor, name, outputDir);
        generatedCount++;
      } else {
        console.warn(`Warning: Skipping ${key} - missing name or color`);
      }
    }

    console.log(`\nSuccessfully generated ${generatedCount} color preview images in: ${outputDir}`);
  } catch (error) {
    throw error;
    process.exit(1);
  }
}

// Run the script
main();
