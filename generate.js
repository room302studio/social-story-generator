#!/usr/bin/env node

const fs = require('fs');
const sharp = require('sharp');
const { JSDOM } = require('jsdom');
const yaml = require('yaml');
const nlp = require('compromise');

// 🎨 GENERATIVE ART TOGGLES
const ENABLE_CONSTELLATIONS = true;
const ENABLE_GLITCH_EFFECTS = true;
const ENABLE_CRYPTO_PUZZLE = true;

// 🔐 CRYPTO PUZZLE STATE
let cryptoChainHash = '302'; // Starting seed
// 🔓 DECODER: Orange stars encode the quote's most important word in ASCII coordinates

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

function generateConstellation(quote, templateBounds, cardIndex = 0) {
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
  
  // Generate stars across ENTIRE card with bottom preference
  const stars = [];
  const margin = 4; // Smaller margin for more coverage
  const cardStart = 0; // Start from very top
  const cardHeight = templateBounds.height; // Full height
  
  // 🏷️ Logo-influenced stars (15% chance to trace logo shapes)
  const logoInfluence = seededRandom() < 0.15;
  const logoPoints = logoInfluence ? [
    // Rough key points from the "302" logo shapes, scaled to template
    { x: templateBounds.width * 0.2, y: templateBounds.height * 0.15 }, // "3" top curve
    { x: templateBounds.width * 0.25, y: templateBounds.height * 0.25 }, // "3" middle  
    { x: templateBounds.width * 0.2, y: templateBounds.height * 0.35 },  // "3" bottom curve
    { x: templateBounds.width * 0.45, y: templateBounds.height * 0.15 }, // "0" top
    { x: templateBounds.width * 0.4, y: templateBounds.height * 0.25 },  // "0" left
    { x: templateBounds.width * 0.5, y: templateBounds.height * 0.25 },  // "0" right
    { x: templateBounds.width * 0.45, y: templateBounds.height * 0.35 }, // "0" bottom
    { x: templateBounds.width * 0.7, y: templateBounds.height * 0.15 },  // "2" top
    { x: templateBounds.width * 0.75, y: templateBounds.height * 0.25 }, // "2" middle
    { x: templateBounds.width * 0.65, y: templateBounds.height * 0.35 }  // "2" bottom
  ] : [];

  // 🔐 CRYPTO STEGANOGRAPHY - Encode quote's key word in star coordinates
  let cryptoStars = [];
  if (ENABLE_CRYPTO_PUZZLE) {
    // Find the most important word from the quote to encode
    const doc = nlp(quote.text);
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    const keyWord = [...nouns, ...adjectives]
      .filter(word => word.length > 4)
      .sort((a, b) => b.length - a.length)[0];
    
    if (keyWord) {
      const charCode = keyWord.charCodeAt(0); // First letter of key word
      cryptoStars.push({
        x: (charCode % (templateBounds.width - 20)) + 10, // Anywhere across width
        y: ((charCode * 3) % (templateBounds.height - 20)) + 10, // Anywhere across height
        radius: 0.5,
        isCrypto: true,
        encodedWord: keyWord
      });
    }
  }

  for (let i = 0; i < starCount; i++) {
    let x, y;
    
    // Use crypto star for first position if available
    if (i === 0 && cryptoStars.length > 0) {
      stars.push(cryptoStars[0]);
      continue;
    }
    
    // Use logo points for some stars if enabled (40% chance per star)
    if (logoInfluence && i < logoPoints.length && seededRandom() < 0.4) {
      const point = logoPoints[i];
      x = point.x + (seededRandom() - 0.5) * 6; // Add slight variation
      y = point.y + (seededRandom() - 0.5) * 6;
      // Keep within bounds
      x = Math.max(margin, Math.min(templateBounds.width - margin, x));
      y = Math.max(cardStart, Math.min(cardStart + cardHeight, y));
    } else {
      // Random placement with bottom preference
      x = margin + seededRandom() * (templateBounds.width - margin * 2);
      
      // Bias toward bottom 60% of card
      let yRandom = seededRandom();
      if (yRandom < 0.7) { // 70% chance for bottom area
        y = cardStart + (templateBounds.height * 0.4) + (yRandom / 0.7) * (templateBounds.height * 0.6);
      } else { // 30% chance for top area
        y = cardStart + ((yRandom - 0.7) / 0.3) * (templateBounds.height * 0.4);
      }
    }
    
    stars.push({
      x: x,
      y: y,
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
  
  // Generate dynamic transforms and style variations based on content
  const skewX = ((seed % 15) - 7) * 0.3; // Subtler for constellation
  const skewY = ((charCount % 8) - 4) * 0.2;  
  const rotation = ((wordCount % 21) - 10) * 0.4;
  const perspective = Math.max(0.95, 1 - (charCount % 20) / 200); // Very subtle scale
  
  // Varied connection styles based on quote characteristics
  const connectionStyle = seed % 4;
  const strokeWidth = 0.1 + (charCount % 6) * 0.05; // 0.1-0.35px variety
  const connectionOpacity = 0.2 + (wordCount % 8) * 0.05; // 0.2-0.55 variety
  
  // Generate SVG elements with dynamic transform
  let svg = `\n  <!-- Dynamic Procedural Constellation -->\n  <g class="constellation" opacity="${brightness}" transform="scale(${perspective}) rotate(${rotation}) skewX(${skewX}) skewY(${skewY})">`;
  
  // Add connections with varied styles
  connections.forEach((conn, index) => {
    let strokeStyle = `stroke="rgba(255,255,255,${connectionOpacity})" stroke-width="${strokeWidth}"`;
    
    // Varied connection styles
    switch(connectionStyle) {
      case 0: // Solid lines (default)
        break;
      case 1: // Dashed lines
        strokeStyle += ` stroke-dasharray="${strokeWidth * 8},${strokeWidth * 4}"`;
        break;
      case 2: // Dotted lines
        strokeStyle += ` stroke-dasharray="${strokeWidth * 2},${strokeWidth * 3}"`;
        break;
      case 3: // Mixed pattern - alternate every 3rd line
        if (index % 3 === 0) strokeStyle += ` stroke-dasharray="${strokeWidth * 6},${strokeWidth * 2}"`;
        break;
    }
    
    svg += `\n    <line x1="${conn.x1.toFixed(2)}" y1="${conn.y1.toFixed(2)}" x2="${conn.x2.toFixed(2)}" y2="${conn.y2.toFixed(2)}" ${strokeStyle}/>`;
  });
  
  // Add stars with SVG-specific effects (impossible without SVG!)
  const svgMagic = seed % 4;
  stars.forEach((star, index) => {
    const opacity = star.isCrypto ? '0.8' : '0.6';
    const fill = star.isCrypto ? 'rgba(243,156,107,0.8)' : 'rgba(255,255,255,0.6)';
    const sizeMultiplier = 0.7 + (index % 5) * 0.2; // 0.7x to 1.5x size variety
    
    // SVG-specific magic that's impossible with raster graphics
    switch(svgMagic) {
      case 0: // Animated pulsing (SVG only!)
        svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${(star.radius * sizeMultiplier).toFixed(2)}" fill="${fill}">`;
        svg += `\n      <animate attributeName="opacity" values="${opacity};${opacity*0.3};${opacity}" dur="${2 + (index % 4)}s" repeatCount="indefinite"/>`;
        svg += `\n    </circle>`;
        break;
      case 1: // Gradient fills (SVG superpower!)
        const gradientId = `star-gradient-${index}`;
        svg += `\n    <defs><radialGradient id="${gradientId}"><stop offset="0%" stop-color="${fill}" stop-opacity="${opacity}"/><stop offset="100%" stop-color="${fill}" stop-opacity="0"/></radialGradient></defs>`;
        svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${(star.radius * sizeMultiplier * 1.5).toFixed(2)}" fill="url(#${gradientId})"/>`;
        break;
      case 2: // Vector blur filters (impossible in CSS!)
        svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${(star.radius * sizeMultiplier).toFixed(2)}" fill="${fill}" filter="url(#brand-glow)"/>`;
        break;
      case 3: // Morphing circles (pure SVG magic!)
        const morphRadius = star.radius * sizeMultiplier;
        svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${morphRadius.toFixed(2)}" fill="${fill}">`;
        svg += `\n      <animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="${3 + (index % 3)}s" repeatCount="indefinite"/>`;
        svg += `\n    </circle>`;
        break;
    }
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

function populateTemplate(svgContent, quote, quoteIndex = 0) {
  const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
  const doc = dom.window.document;
  
  // Find all text elements that contain Lorem ipsum
  const textElements = doc.querySelectorAll('text');
  
  for (const textEl of textElements) {
    const tspans = textEl.querySelectorAll('tspan');
    
    // NUKE ALL LOREM IPSUM - if ANY tspan contains Lorem ipsum keywords, replace the whole element
    const hasLoremIpsum = Array.from(tspans).some(tspan => 
      tspan.textContent.includes('Lorem') || 
      tspan.textContent.includes('ipsum') || 
      tspan.textContent.includes('dolor') || 
      tspan.textContent.includes('consectetur') ||
      tspan.textContent.includes('adipiscing') ||
      tspan.textContent.includes('euismod')
    );
    
    if (hasLoremIpsum) {
      // Multi-line content block - replace with quote text
      if (tspans.length > 3) {
        const words = quote.text.split(' ');
        const isSquare = svgContent.includes('viewBox="0 0 108 108"');
        const maxCharsPerLine = isSquare ? 12 : 25;
        
        // Simple word distribution
        let wordIndex = 0;
        for (let i = 0; i < tspans.length; i++) {
          if (wordIndex < words.length) {
            // Take 1-3 words per line based on length
            let lineWords = [];
            let lineLength = 0;
            
            while (wordIndex < words.length && lineLength < maxCharsPerLine) {
              const nextWord = words[wordIndex];
              if (lineLength + nextWord.length + 1 <= maxCharsPerLine || lineWords.length === 0) {
                lineWords.push(nextWord);
                lineLength += nextWord.length + (lineWords.length > 1 ? 1 : 0);
                wordIndex++;
              } else {
                break;
              }
            }
            
            tspans[i].textContent = lineWords.join(' ');
          } else {
            tspans[i].textContent = '';
          }
        }
      }
      // Single-line - replace with title
      else if (tspans.length <= 2) {
        tspans[0].textContent = quote.title;
        if (tspans[1]) tspans[1].textContent = '';
      }
      // Fallback - just clear everything
      else {
        for (let i = 0; i < tspans.length; i++) {
          tspans[i].textContent = '';
        }
      }
    }
  }
  
  // Determine template format
  const isSquare = svgContent.includes('viewBox="0 0 108 108"');
  
  // 🌌 Add constellation if enabled
  let finalSvg = dom.serialize();
  if (ENABLE_CONSTELLATIONS) {
    const templateBounds = {
      width: 108,
      height: isSquare ? 108 : 192,
      isSquare: isSquare
    };
    
    const constellation = generateConstellation(quote, templateBounds, quoteIndex);
    if (constellation) {
      // Insert constellation before closing </svg> tag
      const insertIndex = finalSvg.lastIndexOf('</svg>');
      finalSvg = finalSvg.slice(0, insertIndex) + constellation + '\n</svg>';
    }
  }
  
  // 🏷️ Add dynamic 3D-ish branding based on quote characteristics
  const seed = hashString(quote.text);
  const wordCount = quote.text.split(' ').length;
  const charCount = quote.text.length;
  
  // Generate transformations based on content
  const skewX = ((seed % 15) - 7) * 0.8; // -5.6 to 5.6 degrees
  const skewY = ((charCount % 8) - 4) * 0.6; // -2.4 to 2.4 degrees  
  const rotation = ((wordCount % 21) - 10) * 1.2; // -12 to 12 degrees
  const perspective = Math.max(0.7, 1 - (charCount % 20) / 100); // 0.7-0.9 scale
  
  // Varied branding positioning and style based on content
  const brandVariation = seed % 6;
  const offsetX = (seed % 20) - 10;
  const offsetY = (charCount % 16) - 8;
  
  let branding = `\n  <!-- Dynamic 3D Branding -->\n  <defs>\n    <filter id="brand-glow">\n      <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>\n      <feMerge>\n        <feMergeNode in="coloredBlur"/>\n        <feMergeNode in="SourceGraphic"/>\n      </feMerge>\n    </filter>\n  </defs>`;
  
  // Varied positioning
  let brandX, brandY;
  switch(brandVariation) {
    case 0: // Bottom right (default)
      brandX = isSquare ? 54 + offsetX : 54 + offsetX;
      brandY = isSquare ? 90 + offsetY : 170 + offsetY;
      break;
    case 1: // Bottom left
      brandX = isSquare ? 20 + offsetX : 20 + offsetX;
      brandY = isSquare ? 90 + offsetY : 170 + offsetY;
      break;
    case 2: // Top right
      brandX = isSquare ? 54 + offsetX : 54 + offsetX;
      brandY = isSquare ? 20 + offsetY : 30 + offsetY;
      break;
    case 3: // Center bottom
      brandX = isSquare ? 54 + offsetX : 54 + offsetX;
      brandY = isSquare ? 100 + offsetY : 180 + offsetY;
      break;
    case 4: // Side middle
      brandX = isSquare ? 100 + offsetX : 100 + offsetX;
      brandY = isSquare ? 54 + offsetY : 96 + offsetY;
      break;
    case 5: // Floating
      brandX = isSquare ? 35 + offsetX : 35 + offsetX;
      brandY = isSquare ? 70 + offsetY : 130 + offsetY;
      break;
  }
  
  const brandOpacity = 0.08 + (wordCount % 8) * 0.02; // 0.08-0.22 variety
  const fontSize = 3.5 + (charCount % 6) * 0.3; // 3.5-5.0 variety
  
  branding += `\n  <g transform="translate(${brandX}, ${brandY}) scale(${perspective}) rotate(${rotation}) skewX(${skewX}) skewY(${skewY})" opacity="${brandOpacity}">`;
  branding += `\n    <text x="0" y="0" font-family="ui-monospace, 'SF Mono', monospace" font-size="${fontSize}" font-weight="300" fill="rgba(255,255,255,0.8)" text-anchor="middle" letter-spacing="0.8" filter="url(#brand-glow)">302</text>`;
  branding += `\n  </g>`;
  const insertIndex = finalSvg.lastIndexOf('</svg>');
  finalSvg = finalSvg.slice(0, insertIndex) + branding + '\n</svg>';
  
  return finalSvg;
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
        const svg = populateTemplate(template.content, quote, i);
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