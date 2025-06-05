#!/usr/bin/env node

const fs = require('fs');
const sharp = require('sharp');
const { JSDOM } = require('jsdom');
const yaml = require('yaml');
const nlp = require('compromise');
const Chance = require('chance');
const glitch = require('glitch-canvas');

// 🎨 GENERATIVE ART TOGGLES
const ENABLE_CONSTELLATIONS = true;
const ENABLE_GLITCH_EFFECTS = true;
const ENABLE_CRYPTO_PUZZLE = true;
const EXPORT_SVG_FOR_AE = process.argv.includes('--ae'); // Add --ae flag for After Effects export

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

// 🌟 CREATE WORD FROM STARS - spell out words with constellation points
function createWordFromStars(word, templateBounds, chance) {
  const wordStars = [];
  const letterWidth = 6; // Width per letter in template units
  const letterHeight = 8; // Height per letter
  const wordWidth = word.length * letterWidth;
  
  // Position word in background (upper area, not interfering with text)
  const startX = (templateBounds.width - wordWidth) / 2;
  const startY = templateBounds.height * 0.15; // Top 15% of card
  
  // Simple letter patterns using star coordinates (minimal but readable)
  const letterPatterns = {
    'A': [[2,7],[1,5],[3,5],[0,3],[4,3],[1,1],[3,1]],
    'B': [[0,7],[0,5],[0,3],[0,1],[2,7],[2,5],[2,3],[2,1],[4,6],[4,4],[4,2]],
    'C': [[4,6],[2,7],[0,5],[0,3],[2,1],[4,2]],
    'D': [[0,7],[0,5],[0,3],[0,1],[2,7],[2,1],[4,6],[4,4],[4,2]],
    'E': [[0,7],[0,5],[0,3],[0,1],[4,7],[2,5],[4,1]],
    'F': [[0,7],[0,5],[0,3],[0,1],[4,7],[2,5]],
    'G': [[4,6],[2,7],[0,5],[0,3],[2,1],[4,2],[4,4],[3,4]],
    'H': [[0,7],[0,5],[0,3],[0,1],[4,7],[4,5],[4,3],[4,1],[2,5]],
    'I': [[1,7],[2,7],[3,7],[2,5],[2,3],[1,1],[2,1],[3,1]],
    'J': [[0,7],[1,7],[2,7],[3,7],[2,5],[2,3],[2,1],[1,1],[0,2]],
    'K': [[0,7],[0,5],[0,3],[0,1],[4,7],[2,5],[4,1]],
    'L': [[0,7],[0,5],[0,3],[0,1],[2,1],[4,1]],
    'M': [[0,7],[0,5],[0,3],[0,1],[1,6],[2,5],[3,6],[4,7],[4,5],[4,3],[4,1]],
    'N': [[0,7],[0,5],[0,3],[0,1],[1,6],[2,5],[3,4],[4,7],[4,5],[4,3],[4,1]],
    'O': [[2,7],[0,5],[0,3],[2,1],[4,5],[4,3]],
    'P': [[0,7],[0,5],[0,3],[0,1],[2,7],[2,5],[4,6],[4,4]],
    'Q': [[2,7],[0,5],[0,3],[2,1],[4,5],[4,3],[3,2]],
    'R': [[0,7],[0,5],[0,3],[0,1],[2,7],[2,5],[4,6],[4,4],[3,2],[4,1]],
    'S': [[4,6],[2,7],[0,5],[2,5],[4,3],[2,1],[0,2]],
    'T': [[0,7],[1,7],[2,7],[3,7],[4,7],[2,5],[2,3],[2,1]],
    'U': [[0,7],[0,5],[0,3],[2,1],[4,7],[4,5],[4,3]],
    'V': [[0,7],[0,5],[1,3],[2,1],[3,3],[4,7],[4,5]],
    'W': [[0,7],[0,5],[0,3],[1,1],[2,3],[3,1],[4,7],[4,5],[4,3]],
    'X': [[0,7],[1,6],[2,5],[3,4],[4,3],[3,2],[2,1],[1,2],[0,1],[4,7]],
    'Y': [[0,7],[1,6],[2,5],[3,4],[4,7],[2,3],[2,1]],
    'Z': [[0,7],[1,7],[2,7],[3,7],[4,7],[3,6],[2,5],[1,4],[0,3],[1,2],[2,1],[3,1],[4,1]]
  };
  
  // Create stars for each letter
  word.toUpperCase().split('').forEach((letter, letterIndex) => {
    const pattern = letterPatterns[letter];
    if (pattern) {
      pattern.forEach(([x, y]) => {
        wordStars.push({
          x: startX + letterIndex * letterWidth + x,
          y: startY + y,
          radius: chance.floating({min: 0.3, max: 0.5}), // Slightly smaller for word stars
          isWordStar: true,
          wordLetter: letter
        });
      });
    }
  });
  
  return wordStars;
}

function generateConstellation(quote, templateBounds, cardIndex = 0, textElements = null) {
  if (!ENABLE_CONSTELLATIONS) return '';
  
  const seed = hashString(quote.text);
  const wordCount = quote.text.split(' ').length;
  const charCount = quote.text.length;
  const isSquare = templateBounds.isSquare;
  
  // Initialize Chance with deterministic seed for consistent results
  const chance = new Chance(seed);
  
  // Using Chance.js for sophisticated probability distributions
  
  const starCount = Math.floor(wordCount * 1.2) + 3; // 4-17 stars
  const connectionThreshold = (charCount % 25) + 15; // 15-40px max connection distance
  const brightness = ((charCount % 50) + 30) / 255; // 0.12-0.31 opacity
  
  // Generate stars with golden ratio positioning and baseline grid
  const stars = [];
  const margin = 4;
  const cardStart = 0;
  const cardHeight = templateBounds.height;
  
  // Golden ratio and baseline grid constants
  const phi = 1.618034; // Golden ratio
  const baselineGrid = 6; // 6px baseline grid (matches typography)
  
  // Golden ratio anchor points for sophisticated positioning
  const goldenPoints = [
    { x: templateBounds.width / phi, y: templateBounds.height / phi }, // Primary golden point
    { x: templateBounds.width * (1 - 1/phi), y: templateBounds.height / phi }, // Secondary
    { x: templateBounds.width / phi, y: templateBounds.height * (1 - 1/phi) }, // Tertiary
    { x: templateBounds.width * (1 - 1/phi), y: templateBounds.height * (1 - 1/phi) }, // Quaternary
    { x: templateBounds.width * 0.5, y: templateBounds.height / phi }, // Central vertical golden
    { x: templateBounds.width / phi, y: templateBounds.height * 0.5 }, // Central horizontal golden
  ];
  
  // Logo-influenced stars use golden ratio positioning
  const logoInfluence = chance.bool({likelihood: 20}); // Increased chance for golden positioning

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
    
    // Golden ratio positioning with baseline grid alignment
    if (logoInfluence && i < goldenPoints.length && chance.bool({likelihood: 40})) {
      const point = goldenPoints[i];
      x = point.x + (chance.floating({min: -0.5, max: 0.5})) * baselineGrid; // Snap to baseline grid
      y = point.y + (chance.floating({min: -0.5, max: 0.5})) * baselineGrid;
      // Align to baseline grid
      x = Math.round(x / baselineGrid) * baselineGrid;
      y = Math.round(y / baselineGrid) * baselineGrid;
      // Keep within bounds
      x = Math.max(margin, Math.min(templateBounds.width - margin, x));
      y = Math.max(cardStart, Math.min(cardStart + cardHeight, y));
    } else {
      // Random placement with bottom preference and baseline alignment
      x = margin + chance.floating({min: 0, max: 1}) * (templateBounds.width - margin * 2);
      
      // Bias toward bottom 60% of card
      if (chance.bool({likelihood: 70})) { // 70% chance for bottom area
        y = cardStart + (templateBounds.height * 0.4) + chance.floating({min: 0, max: 1}) * (templateBounds.height * 0.6);
      } else { // 30% chance for top area
        y = cardStart + chance.floating({min: 0, max: 1}) * (templateBounds.height * 0.4);
      }
      
      // Snap to baseline grid for mathematical precision
      x = Math.round(x / baselineGrid) * baselineGrid;
      y = Math.round(y / baselineGrid) * baselineGrid;
    }
    
    stars.push({
      x: x,
      y: y,
      radius: chance.floating({min: 0.3, max: 0.7}) // 0.3-0.7px
    });
  }
  
  // Generate connections - for square format, connect to text areas
  const connections = [];
  
  if (isSquare) {
    // 🌟 STAR WORD FORMATION - spell out key word with stars
    const doc = nlp(quote.text);
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    const verbs = doc.verbs().out('array');
    
    // Pick the most impactful word (shortest for better star formation)
    const keyWord = [...nouns, ...adjectives, ...verbs]
      .filter(word => word.length >= 3 && word.length <= 6) // Good length for star letters
      .sort((a, b) => b.length - a.length)[0];
    
    if (keyWord && chance.bool({likelihood: 40})) { // 40% chance for word formation
      const wordStars = createWordFromStars(keyWord, templateBounds, chance);
      stars.push(...wordStars);
    }
    
    // For square cards, create precise connections between stars and text areas
    const textAnchorPoints = [
      { x: templateBounds.width * 0.5, y: templateBounds.height * 0.35 }, // Title center
      { x: templateBounds.width * 0.15, y: templateBounds.height * 0.55 }, // Left text edge
      { x: templateBounds.width * 0.85, y: templateBounds.height * 0.55 }, // Right text edge
      { x: templateBounds.width * 0.5, y: templateBounds.height * 0.75 }, // Bottom text center
    ];
    
    // Connect original stars to text anchor points (exclude word stars)
    const originalStars = stars.filter(star => !star.isWordStar);
    for (let i = 0; i < Math.min(originalStars.length, 4); i++) {
      const anchor = textAnchorPoints[i];
      connections.push({
        x1: originalStars[i].x,
        y1: originalStars[i].y,
        x2: anchor.x,
        y2: anchor.y,
        isTextConnection: true
      });
    }
    
    // Minimal star-to-star connections - only adjacent original stars
    for (let i = 0; i < Math.min(originalStars.length - 1, 3); i++) {
      const nextStar = i + 1;
      if (nextStar < originalStars.length) {
        connections.push({
          x1: originalStars[i].x,
          y1: originalStars[i].y,
          x2: originalStars[nextStar].x,
          y2: originalStars[nextStar].y,
          isTextConnection: false
        });
      }
    }
  } else {
    // Standard story format - star-to-star connections only
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
            y2: stars[j].y,
            isTextConnection: false
          });
        }
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
  const strokeWidth = 0.2; // Keep it light and consistent
  const connectionOpacity = 0.2 + (wordCount % 8) * 0.05; // 0.2-0.55 variety
  
  // Generate SVG elements with After Effects grouping or standard transform
  let svg = EXPORT_SVG_FOR_AE 
    ? `\n  <!-- AE Constellation Group -->\n  <g id="constellation-group" class="constellation" opacity="${brightness}">`
    : `\n  <!-- Dynamic Procedural Constellation -->\n  <g class="constellation" opacity="${brightness}" transform="scale(${perspective}) rotate(${rotation}) skewX(${skewX}) skewY(${skewY})">`;
  
  // Add connections with After Effects grouping
  if (EXPORT_SVG_FOR_AE) {
    svg += `\n    <g id="constellation-lines">`;
  }
  
  connections.forEach((conn, index) => {
    // Text connections get different styling
    const opacity = conn.isTextConnection ? connectionOpacity * 0.6 : connectionOpacity;
    const width = conn.isTextConnection ? strokeWidth * 0.7 : strokeWidth;
    let strokeStyle = `stroke="rgba(255,255,255,${opacity})" stroke-width="${width}"`;
    
    // Text connections get subtle dotted style
    if (conn.isTextConnection) {
      strokeStyle += ` stroke-dasharray="${width * 3},${width * 2}"`;
    } else if (!EXPORT_SVG_FOR_AE) {
      // Varied connection styles for star-to-star (simplified for AE)
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
    }
    
    const lineId = EXPORT_SVG_FOR_AE ? ` id="line-${index}"` : '';
    const lineClass = conn.isTextConnection && EXPORT_SVG_FOR_AE ? ` class="text-connection"` : '';
    svg += `\n    <line${lineId}${lineClass} x1="${conn.x1.toFixed(2)}" y1="${conn.y1.toFixed(2)}" x2="${conn.x2.toFixed(2)}" y2="${conn.y2.toFixed(2)}" ${strokeStyle}/>`;
  });
  
  if (EXPORT_SVG_FOR_AE) {
    svg += `\n    </g>`;
  }
  
  // Add stars with After Effects grouping
  if (EXPORT_SVG_FOR_AE) {
    svg += `\n    <g id="constellation-stars">`;
  }
  
  const svgMagic = EXPORT_SVG_FOR_AE ? 0 : seed % 4; // Simplify for AE
  stars.forEach((star, index) => {
    // Word stars get special styling
    let opacity, fill, sizeMultiplier;
    if (star.isWordStar) {
      opacity = '0.4';
      fill = 'rgba(255,255,255,0.4)';
      sizeMultiplier = 0.8; // Consistent size for word formation
    } else if (star.isCrypto) {
      opacity = '0.8';
      fill = 'rgba(243,156,107,0.8)';
      sizeMultiplier = 0.7 + (index % 5) * 0.2;
    } else {
      opacity = '0.6';
      fill = 'rgba(255,255,255,0.6)';
      sizeMultiplier = 0.7 + (index % 5) * 0.2;
    }
    
    const starId = EXPORT_SVG_FOR_AE ? ` id="star-${index}"` : '';
    let starClass = '';
    if (EXPORT_SVG_FOR_AE) {
      if (star.isCrypto) starClass = ` class="crypto-star"`;
      else if (star.isWordStar) starClass = ` class="word-star"`;
    }
    
    if (EXPORT_SVG_FOR_AE) {
      // Clean circles for After Effects
      svg += `\n      <circle${starId}${starClass} cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${(star.radius * sizeMultiplier).toFixed(2)}" fill="${fill}"/>`;
    } else {
      // SVG-specific magic for web
      switch(svgMagic) {
        case 0: // Animated pulsing
          svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${(star.radius * sizeMultiplier).toFixed(2)}" fill="${fill}">`;
          svg += `\n      <animate attributeName="opacity" values="${opacity};${opacity*0.3};${opacity}" dur="${2 + (index % 4)}s" repeatCount="indefinite"/>`;
          svg += `\n    </circle>`;
          break;
        case 1: // Gradient fills
          const gradientId = `star-gradient-${index}`;
          svg += `\n    <defs><radialGradient id="${gradientId}"><stop offset="0%" stop-color="${fill}" stop-opacity="${opacity}"/><stop offset="100%" stop-color="${fill}" stop-opacity="0"/></radialGradient></defs>`;
          svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${(star.radius * sizeMultiplier * 1.5).toFixed(2)}" fill="url(#${gradientId})"/>`;
          break;
        case 2: // Vector blur filters
          svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${(star.radius * sizeMultiplier).toFixed(2)}" fill="${fill}" filter="url(#brand-glow)"/>`;
          break;
        case 3: // Morphing circles
          const morphRadius = star.radius * sizeMultiplier;
          svg += `\n    <circle cx="${star.x.toFixed(2)}" cy="${star.y.toFixed(2)}" r="${morphRadius.toFixed(2)}" fill="${fill}">`;
          svg += `\n      <animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="${3 + (index % 3)}s" repeatCount="indefinite"/>`;
          svg += `\n    </circle>`;
          break;
      }
    }
  });
  
  if (EXPORT_SVG_FOR_AE) {
    svg += `\n    </g>`;
  }
  
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
      const glitchChance = new Chance(seed);
      
      for (let y = Math.floor(height * 0.7); y < height; y++) { // Bottom 30% only
        if (glitchChance.bool({likelihood: 10})) { // 10% of lines affected
          const shift = Math.floor((glitchChance.floating({min: -0.5, max: 0.5})) * glitchParams.scanLineIntensity * 10);
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
      const noiseChance = new Chance(seed);
      
      for (let i = Math.floor(pixelArray.length * 0.7); i < pixelArray.length; i += channels) {
        if (noiseChance.floating({min: 0, max: 1}) > glitchParams.noiseSparsity) {
          const intensity = noiseChance.floating({min: 155, max: 255}); // 155-255 brightness
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
    
    // Add After Effects grouping to text elements
    if (EXPORT_SVG_FOR_AE && textEl.getAttribute('class')) {
      textEl.setAttribute('id', `text-${textEl.getAttribute('class').replace(/\s+/g, '-')}`);
    }
    
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
        
        if (EXPORT_SVG_FOR_AE) {
          // Export clean SVG for After Effects in separate folder
          if (!fs.existsSync('./svg-exports')) {
            fs.mkdirSync('./svg-exports');
          }
          const filename = `${template.name}_${quote.slug}.svg`;
          fs.writeFileSync(`./svg-exports/${filename}`, svg);
          console.log(`✅ ${filename} (AE-ready)`);
        } else {
          // Export PNG as usual
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
          
          // 🎲 ULTRA-RARE GLITCH CANVAS EFFECT (0.5% chance)
          const seed = hashString(quote.text + template.name);
          const chance = new Chance(seed);
          if (chance.bool({likelihood: 0.3})) { // 0.3% chance - super rare
            try {
              console.log(`✨ Subtle glitch canvas effect`);
              const glitchParams = {
                seed: chance.integer({min: 20, max: 60}),
                quality: chance.integer({min: 85, max: 95}), // High quality = subtle
                amount: chance.integer({min: 5, max: 15}), // Low amount = barely noticeable
                iterations: chance.integer({min: 1, max: 3}) // Few iterations = gentle
              };
              
              const dataURL = await glitch(glitchParams)
                .fromBuffer(pngBuffer)
                .toDataURL();
              
              // Convert back to buffer
              const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
              pngBuffer = Buffer.from(base64Data, 'base64');
            } catch (error) {
              console.log(`⚠️  Glitch canvas failed: ${error.message}`);
            }
          }
          
          // 🔧 Apply custom glitch effects if enabled
          if (ENABLE_GLITCH_EFFECTS) {
            pngBuffer = await applyGlitchEffects(pngBuffer, quote);
          }
          
          fs.writeFileSync(`./stories/${filename}`, pngBuffer);
          console.log(`✅ ${filename}`);
        }
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