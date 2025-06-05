#!/usr/bin/env node

const fs = require('fs');
const sharp = require('sharp');
const { JSDOM } = require('jsdom');
const yaml = require('yaml');

// 🎨 GENERATIVE ART TOGGLES
const ENABLE_CONSTELLATIONS = true;
const ENABLE_GLITCH_EFFECTS = true;

function parseQuotes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.parse(content);
  
  const allQuotes = [];
  data.quotes.forEach(section => {
    section.items.forEach(quote => {
      allQuotes.push({
        title: quote.title,
        text: quote.text,
        category: section.category,
        slug: quote.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
      });
    });
  });
  
  return allQuotes;
}

// 🌌 CONSTELLATION GENERATOR
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function generateConstellation(quote, templateBounds) {
  if (!ENABLE_CONSTELLATIONS) return '';
  
  const seed = hashString(quote.text);
  const wordCount = quote.text.split(' ').length;
  const charCount = quote.text.length;
  
  // Seeded random number generator
  let seedValue = seed;
  function seededRandom() {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  }
  
  const starCount = Math.floor(wordCount * 1.2) + 3; // 4-17 stars
  const connectionThreshold = (charCount % 25) + 15; // 15-40px max connection distance
  const brightness = ((charCount % 50) + 30) / 255; // 0.12-0.31 opacity
  
  // Generate stars anywhere on the card
  const stars = [];
  const margin = 8;
  const cardStart = 8; // Start from top
  const cardHeight = templateBounds.height - margin * 2; // Full height minus margins
  
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: margin + seededRandom() * (templateBounds.width - margin * 2),
      y: cardStart + seededRandom() * cardHeight,
      radius: 0.3 + seededRandom() * 0.4 // 0.3-0.7px
    });
  }
  
  // Generate connections between nearby stars
  const connections = [];
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const distance = Math.sqrt(
        Math.pow(stars[i].x - stars[j].x, 2) + 
        Math.pow(stars[i].y - stars[j].y, 2)
      );
      
      if (distance < connectionThreshold) {
        connections.push({
          x1: stars[i].x,
          y1: stars[i].y,
          x2: stars[j].x,
          y2: stars[j].y
        });
      }
    }
  }
  
  // Generate SVG elements
  let svg = `\n  <!-- Procedural Constellation -->\n  <g class="constellation" opacity="${brightness}">`;
  
  // Add connections (lines)
  connections.forEach(conn => {
    svg += `\n    <line x1="${conn.x1.toFixed(2)}" y1="${conn.y1.toFixed(2)}" x2="${conn.x2.toFixed(2)}" y2="${conn.y2.toFixed(2)}" stroke="rgba(255,255,255,0.4)" stroke-width="0.2"/>`;
  });
  
  // Add stars (circles)
  stars.forEach(star => {
    svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${star.radius.toFixed(2)}" fill="rgba(255,255,255,0.6)"/>`;
  });
  
  svg += '\n  </g>';
  
  return svg;
}

// 🔧 GLITCH EFFECTS PROCESSOR
async function applyGlitchEffects(imageBuffer, quote) {
  if (!ENABLE_GLITCH_EFFECTS) return imageBuffer;
  
  const charCount = quote.text.length;
  const wordCount = quote.text.split(' ').length;
  
  // Calculate glitch parameters based on quote characteristics
  const glitchParams = {
    scanLineIntensity: Math.min((charCount % 7) / 20, 0.3), // 0-0.3 pixel shift
    chromaticOffset: (wordCount % 3) + 1,                   // 1-3 pixel RGB separation  
    noiseSparsity: 0.998 + (charCount % 3) / 1000,         // 99.8-99.9% clean pixels
    tearProbability: wordCount > 12 ? 0.08 : 0              // Longer quotes get tears
  };
  
  try {
    const { data, info } = await sharp(imageBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    const pixelArray = new Uint8Array(data);
    
    // Apply subtle scan line displacement
    if (glitchParams.scanLineIntensity > 0) {
      const seed = hashString(quote.text);
      let seedValue = seed;
      function seededRandom() {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      }
      
      for (let y = Math.floor(height * 0.7); y < height; y++) { // Bottom 30% only
        if (seededRandom() < 0.1) { // 10% of lines affected
          const shift = Math.floor((seededRandom() - 0.5) * glitchParams.scanLineIntensity * 10);
          if (Math.abs(shift) > 0) {
            const rowStart = y * width * channels;
            const rowEnd = rowStart + width * channels;
            const shiftedRow = new Uint8Array(width * channels);
            
            // Copy row with horizontal shift
            for (let x = 0; x < width; x++) {
              const sourceX = Math.max(0, Math.min(width - 1, x + shift));
              const destIndex = x * channels;
              const sourceIndex = sourceX * channels;
              
              for (let c = 0; c < channels; c++) {
                shiftedRow[destIndex + c] = pixelArray[rowStart + sourceIndex + c];
              }
            }
            
            // Apply shifted row back
            for (let i = 0; i < width * channels; i++) {
              pixelArray[rowStart + i] = shiftedRow[i];
            }
          }
        }
      }
    }
    
    // Apply sparse digital noise in constellation region
    if (glitchParams.noiseSparsity < 1) {
      const seed = hashString(quote.text + 'noise');
      let seedValue = seed;
      function seededRandom() {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      }
      
      for (let i = Math.floor(pixelArray.length * 0.7); i < pixelArray.length; i += channels) {
        if (seededRandom() > glitchParams.noiseSparsity) {
          const intensity = seededRandom() * 100 + 155; // 155-255 brightness
          pixelArray[i] = pixelArray[i + 1] = pixelArray[i + 2] = intensity; // RGB
        }
      }
    }
    
    // Create glitched image
    return await sharp(pixelArray, {
      raw: {
        width: width,
        height: height,
        channels: channels
      }
    })
    .png()
    .toBuffer();
    
  } catch (error) {
    console.warn(`⚠️  Glitch processing failed for "${quote.title}": ${error.message}`);
    return imageBuffer; // Return original on error
  }
}

function wrapText(text, maxWidth, fontSize = 12) {
  // Simple word wrapping - split into lines that fit maxWidth
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  const estimatedCharWidth = fontSize * 0.6; // Rough estimate
  const maxCharsPerLine = Math.floor(maxWidth / estimatedCharWidth);
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

function populateTemplate(svgContent, quote) {
  const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
  const doc = dom.window.document;
  
  // Find all text elements that contain Lorem ipsum
  const textElements = doc.querySelectorAll('text');
  
  for (const textEl of textElements) {
    const tspans = textEl.querySelectorAll('tspan');
    
    // Look for the main content block (has Lorem ipsum and multiple tspans)
    if (tspans.length > 3 && textEl.textContent.includes('Lorem ipsum')) {
      
      const words = quote.text.split(' ');
      const wordsPerLine = Math.ceil(words.length / Math.min(tspans.length, 4));
      
      let wordIndex = 0;
      
      // Distribute words across existing tspans
      for (let i = 0; i < tspans.length && wordIndex < words.length; i++) {
        const lineWords = words.slice(wordIndex, wordIndex + wordsPerLine);
        tspans[i].textContent = lineWords.join(' ');
        wordIndex += wordsPerLine;
      }
      
      // Clear remaining tspans
      for (let i = Math.ceil(words.length / wordsPerLine); i < tspans.length; i++) {
        tspans[i].textContent = '';
      }
    }
    
    // Handle simple single-tspan titles - use the quote title
    else if (tspans.length <= 2 && textEl.textContent.includes('Lorem ipsum')) {
      tspans[0].textContent = quote.title;
    }
  }
  
  // 🌌 Add constellation if enabled
  if (ENABLE_CONSTELLATIONS) {
    const isSquare = svgContent.includes('viewBox="0 0 108 108"');
    const templateBounds = {
      width: 108,
      height: isSquare ? 108 : 192,
      isSquare: isSquare
    };
    
    const constellation = generateConstellation(quote, templateBounds);
    if (constellation) {
      // Insert constellation before closing </svg> tag
      const serialized = dom.serialize();
      const insertIndex = serialized.lastIndexOf('</svg>');
      return serialized.slice(0, insertIndex) + constellation + '\n</svg>';
    }
  }
  
  return dom.serialize();
}

async function main() {
  console.log('🧹 Cleaning up...');
  if (fs.existsSync('./stories')) {
    fs.rmSync('./stories', { recursive: true });
  }
  fs.mkdirSync('./stories');
  
  console.log('📚 Parsing quotes...');
  const quotes = parseQuotes('./quotes.yaml');
  
  console.log('🎨 Loading templates...');
  const templates = ['social-01.svg', 'social-05.svg'] // Skip 02 (complex spacing), 03 (static vector text), 04 (complex)
    .map(file => ({
      name: file.replace('.svg', ''),
      content: fs.readFileSync(file, 'utf8')
    }));
  
  console.log(`✅ ${quotes.length} quotes, ${templates.length} templates`);
  
  // Show generative art status
  const artFeatures = [];
  if (ENABLE_CONSTELLATIONS) artFeatures.push('🌌 constellations');
  if (ENABLE_GLITCH_EFFECTS) artFeatures.push('🔧 glitch effects');
  if (artFeatures.length > 0) {
    console.log(`🎨 Generative art: ${artFeatures.join(', ')}`);
  }
  
  console.log('🚀 Generating stories...');
  let count = 0;
  
  // Generate all quotes with working templates!
  for (let i = 0; i < quotes.length; i++) {
    const quote = quotes[i];
    
    for (const template of templates) {
      try {
        const svg = populateTemplate(template.content, quote);
        const filename = `${template.name}_${quote.slug}.png`;
        
        // Detect format and resize accordingly
        const isSquare = svg.includes('viewBox="0 0 108 108"');
        const width = isSquare ? 1080 : 1080;
        const height = isSquare ? 1080 : 1920;
        
        // Convert SVG to PNG
        let pngBuffer = await sharp(Buffer.from(svg))
          .resize(width, height)
          .png({ quality: 100 })
          .toBuffer();
        
        // 🔧 Apply glitch effects if enabled
        if (ENABLE_GLITCH_EFFECTS) {
          pngBuffer = await applyGlitchEffects(pngBuffer, quote);
        }
        
        fs.writeFileSync(`./stories/${filename}`, pngBuffer);
        
        console.log(`✅ ${filename}`);
        count++;
      } catch (error) {
        console.log(`❌ Failed: ${template.name} - ${error.message}`);
      }
    }
  }
  
  console.log(`🎉 ${count} stories generated in ./stories/`);
}

if (require.main === module) {
  main().catch(console.error);
}