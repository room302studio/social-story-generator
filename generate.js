#!/usr/bin/env node

/**
 * Room 302 Studio - Social Media Generator v2.0
 * 
 * Production-ready design system for generating sophisticated social media assets
 * with organic glitch effects, mathematical color theory, and generative constellations.
 * 
 * Features:
 * - Perlin noise-based organic glitch effects
 * - Advanced color theory harmonies (triadic, tetradic, etc.)
 * - Golden ratio-based constellation generation  
 * - Professional typography and grid system
 * - Batch processing with progress tracking
 * - After Effects-compatible SVG export
 * 
 * @author Room 302 Studio
 * @version 2.0.0
 */

'use strict';

// =============================================================================
// DEPENDENCIES
// =============================================================================

// Core Node.js modules
const fs = require('fs');
const path = require('path');

// Third-party libraries
const sharp = require('sharp');
const { JSDOM } = require('jsdom');
const nlp = require('compromise');
const Chance = require('chance');
const glitch = require('glitch-canvas');

// Internal modules
const { DESIGN_CONSTANTS } = require('./lib/design-system');
const { sophisticatedColorGlitch } = require('./lib/advanced-color-system');
const { phi, tau, hashString, parseQuotes } = require('./lib/utils');
const { generateConstellation } = require('./lib/constellation');
const { applyGlitchEffects, PerlinNoise } = require('./lib/pixel-glitch');

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Application configuration object
 * Controls feature flags and output settings
 */
const CONFIG = {
  // Feature toggles
  ENABLE_CONSTELLATIONS: true,
  ENABLE_GLITCH_EFFECTS: true,
  ENABLE_CRYPTO_PUZZLE: true,
  
  // Export settings
  EXPORT_SVG_FOR_AE: process.argv.includes('--ae'),
  
  // Templates and directories
  TEMPLATES: ['social-01.svg', 'social-05.svg'],
  OUTPUT_DIR: './stories',
  SVG_EXPORT_DIR: './svg-exports',
  
  // Processing options
  HIGH_QUALITY: true,
  BATCH_SIZE: 50, // Process in batches to manage memory
};

// =============================================================================
// BRANDING SYSTEM
// =============================================================================

/**
 * Generate professional branding elements with strategic positioning
 * Uses golden ratio and design grid for optimal placement
 * 
 * @param {Object} quote - Quote object with text and metadata
 * @param {boolean} isSquare - Whether template is square format
 * @returns {string} SVG markup for branding elements
 */
function generateBranding(quote, isSquare) {
  const seed = hashString(quote.text);
  const charCount = quote.text.length;
  
  // Strategic positioning based on design grid and golden ratio
  const height = isSquare ? 108 : 192;
  const positions = [
    // Bottom corners - classic placement
    { x: DESIGN_CONSTANTS.GRID.golden_section, y: height - DESIGN_CONSTANTS.GRID.margin * 1.5 },
    { x: 108 - DESIGN_CONSTANTS.GRID.golden_section, y: height - DESIGN_CONSTANTS.GRID.margin * 1.5 },
    // Top strategic positions  
    { x: DESIGN_CONSTANTS.GRID.margin * 2, y: DESIGN_CONSTANTS.GRID.margin * 2 },
    { x: 108 - DESIGN_CONSTANTS.GRID.margin * 3, y: DESIGN_CONSTANTS.GRID.margin * 2 },
    // Vertical center - subtle
    { x: DESIGN_CONSTANTS.GRID.margin, y: height / 2 }
  ];
  
  const pos = positions[seed % positions.length];
  const rotation = ((seed % 11) - 5) * 0.4; // Subtle rotation
  
  return `
  <g id="branding" transform="translate(${pos.x}, ${pos.y}) rotate(${rotation})">
    <text font-family="IBM Plex Sans" 
          font-size="${DESIGN_CONSTANTS.FONT_SIZES.metadata}" 
          fill="${DESIGN_CONSTANTS.COLORS.metadata}" 
          opacity="0.7">302</text>
  </g>`;
}

// =============================================================================
// CONTEXTUAL TEXT GENERATION
// =============================================================================

/**
 * Generate contextual text elements using NLP analysis
 * Creates dynamic typography based on quote characteristics
 * 
 * @param {Object} quote - Quote object
 * @param {string} type - Type of contextual text to generate
 * @param {number} seed - Random seed for consistency
 * @param {number} quoteIndex - Current quote index
 * @param {number} totalQuotes - Total number of quotes
 * @param {Array} allQuotes - All available quotes for context
 * @returns {string} Generated contextual text
 */
function generateContextualText(quote, type, seed, quoteIndex, totalQuotes, allQuotes = []) {
  const chance = new Chance(seed);
  const doc = nlp(quote.text);
  
  // Extract linguistic features
  const verbs = doc.verbs().out('array');
  const nouns = doc.nouns().out('array');
  const adjectives = doc.adjectives().out('array');
  const wordCount = quote.text.split(' ').length;
  
  // Generate contextual elements based on quote analysis
  switch (type) {
    case 'progress':
      return `${quoteIndex + 1}/${totalQuotes}`;
      
    case 'mood':
      const mood = adjectives.length > 0 ? 
        chance.pickone(adjectives).toLowerCase() : 
        chance.pickone(['inspired', 'focused', 'creative', 'determined']);
      return mood;
      
    case 'theme':
      if (verbs.length > 0) {
        const verb = chance.pickone(verbs);
        return `on ${verb.toLowerCase()}`;
      }
      return chance.pickone(['on growth', 'on craft', 'on purpose', 'on vision']);
      
    case 'related':
      if (allQuotes.length > 10) {
        const related = findRelatedQuotes(quote, allQuotes, quoteIndex);
        if (related.length > 0) {
          const relatedQuote = chance.pickone(related);
          return `"${relatedQuote.text.substring(0, 50)}..."`;
        }
      }
      return '';
      
    default:
      return '';
  }
}

/**
 * Find semantically related quotes using simple keyword matching
 * 
 * @param {Object} currentQuote - Current quote object
 * @param {Array} allQuotes - All available quotes
 * @param {number} currentIndex - Current quote index to exclude
 * @returns {Array} Array of related quotes
 */
function findRelatedQuotes(currentQuote, allQuotes, currentIndex) {
  const currentDoc = nlp(currentQuote.text);
  const currentKeywords = currentDoc.nouns().out('array')
    .concat(currentDoc.verbs().out('array'))
    .map(word => word.toLowerCase());
  
  return allQuotes
    .filter((_, index) => index !== currentIndex)
    .map(quote => {
      const doc = nlp(quote.text);
      const keywords = doc.nouns().out('array')
        .concat(doc.verbs().out('array'))
        .map(word => word.toLowerCase());
      
      const commonWords = currentKeywords.filter(word => keywords.includes(word));
      return { quote, similarity: commonWords.length };
    })
    .filter(item => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(item => item.quote);
}

// =============================================================================
// TEXT UTILITIES
// =============================================================================

/**
 * Wrap text to fit within specified width
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} fontSize - Font size for character width estimation
 * @returns {Array} Array of text lines
 */
function wrapText(text, maxWidth, fontSize = 12) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  const estimatedCharWidth = fontSize * 0.6; // Rough estimate
  const maxCharsPerLine = Math.floor(maxWidth / estimatedCharWidth);

  for (const word of words) {
    if ((currentLine + " " + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

// =============================================================================
// TEMPLATE PROCESSING
// =============================================================================

/**
 * Populate SVG template with quote content and dynamic elements
 * Handles typography, contextual text, and design system integration
 * 
 * @param {string} svgContent - Raw SVG template content
 * @param {Object} quote - Quote object with text and metadata
 * @param {number} quoteIndex - Current quote index
 * @param {number} totalQuotes - Total number of quotes
 * @param {Array} allQuotes - All available quotes for context
 * @returns {string} Populated SVG content
 */
function populateTemplate(svgContent, quote, quoteIndex, totalQuotes = 249, allQuotes = []) {
  const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
  const doc = dom.window.document;
  const svg = doc.querySelector('svg');
  
  if (!svg) {
    console.warn('⚠️  Invalid SVG template');
    return svgContent;
  }
  
  const seed = hashString(quote.text + quoteIndex);
  const chance = new Chance(seed);
  const wordCount = quote.text.split(' ').length;
  
  // Determine template format early
  const isSquareTemplate = !svgContent.includes('height="192"');
  
  // =============================================================================
  // TEXT REPLACEMENT SYSTEM
  // =============================================================================
  
  // Text replacement system
  const textElements = doc.querySelectorAll('text, tspan');
  let quotePlaced = false;
  let titlePlaced = false;
  
  textElements.forEach(el => {
    const content = el.textContent.trim();
    const parentEl = el.parentNode;
    const parentClass = parentEl ? parentEl.getAttribute('class') : null;
    
    // Replace BODY text (the long Lorem ipsum content)
    if ((content.includes('Lorem ipsum dolor sit amet') || content.includes('Lorem ipsum dolor')) && !quotePlaced) {
      // Keep original font size from template - DON'T TOUCH IT
      const originalFontSize = parseFloat(el.getAttribute('font-size')) || 9.2;
      
      // Text wrapping based on template format
      const maxWidth = isSquareTemplate ? 80 : 100; // Narrower for square templates
      const lines = wrapText(quote.text, maxWidth, originalFontSize);
      
      if (lines.length === 1) {
        // Single line - just set text content
        el.textContent = quote.text;
      } else {
        // Multiple lines - create tspan elements
        el.textContent = ''; // Clear existing content
        const lineHeight = originalFontSize * 1.2;
        
        lines.forEach((line, index) => {
          const tspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.textContent = line;
          tspan.setAttribute('x', el.getAttribute('x') || '0');
          tspan.setAttribute('dy', index === 0 ? '0' : lineHeight);
          el.appendChild(tspan);
        });
      }
      
      quotePlaced = true;
    } 
    // Replace TITLE text (just "Lorem ipsum" in social-01)
    else if (content === 'Lorem ipsum' && !titlePlaced) {
      // Use the actual title from the quote data
      el.textContent = quote.title;
      titlePlaced = true;
    }
    // Keep other text as-is (decorative/branding text)
  });
  
  // =============================================================================
  // AFTER EFFECTS LAYER ORGANIZATION
  // =============================================================================
  
  if (CONFIG.EXPORT_SVG_FOR_AE) {
    // Organize content into named layers for After Effects import
    const existingContent = svg.innerHTML;
    svg.innerHTML = `<g id="base" inkscape:groupmode="layer" inkscape:label="Base">${existingContent}</g>`;
  }
  
  let finalSvg = dom.serialize();
  
  // =============================================================================
  // CONSTELLATION GENERATION
  // =============================================================================
  
  const templateBounds = {
    width: 108,
    height: finalSvg.includes('height="192"') ? 192 : 108,
    isSquare: !finalSvg.includes('height="192"')
  };
  
  // Simplified - no shared noise mask for now
  const sharedNoiseMask = null;
  
  const constellation = generateConstellation(quote, templateBounds, CONFIG);
  if (constellation) {
    const insertIndex = finalSvg.lastIndexOf('</svg>');
    finalSvg = finalSvg.slice(0, insertIndex) + constellation + '\n';
  }
  
  // =============================================================================
  // PROFESSIONAL BRANDING
  // =============================================================================
  
  const branding = generateBranding(quote, templateBounds.isSquare);
  const brandingIndex = finalSvg.lastIndexOf('</svg>');
  finalSvg = finalSvg.slice(0, brandingIndex) + branding + '\n</svg>';
  
  return { svg: finalSvg, sharedNoiseMask, templateBounds };
}

// =============================================================================
// MAIN PROCESSING PIPELINE
// =============================================================================

/**
 * Main application entry point
 * Orchestrates the entire generation pipeline with progress tracking
 */
async function main() {
  // Check for test flag
  const isTestMode = process.argv.includes('--test');
  const testLimit = 10;
  
  console.log('🎨 Room 302 Studio - Social Media Generator v2.0');
  console.log('📐 Production-ready design system initialized');
  if (isTestMode) {
    console.log(`🧪 Test mode: generating only ${testLimit} images`);
  }
  
  // =============================================================================
  // ENVIRONMENT SETUP
  // =============================================================================
  
  console.log('🧹 Preparing output directories...');
  [CONFIG.OUTPUT_DIR, CONFIG.SVG_EXPORT_DIR].forEach(dir => {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
    fs.mkdirSync(dir, { recursive: true });
  });
  
  // =============================================================================
  // CONTENT LOADING
  // =============================================================================
  
  console.log('📚 Loading quote corpus...');
  const quotes = parseQuotes([
    './quotes.yaml',
    './quotes-FR.yaml'
  ]);
  
  console.log('🎨 Initializing templates...');
  const templates = CONFIG.TEMPLATES.map(file => ({
    name: file.replace('.svg', ''),
    content: fs.readFileSync(file, 'utf8')
  }));
  
  // =============================================================================
  // GENERATION STATISTICS
  // =============================================================================
  
  const totalAssets = quotes.length * templates.length * 2; // 2x for glitch variants
  console.log(`✅ Corpus: ${quotes.length} quotes | Templates: ${templates.length} formats`);
  console.log(`📊 Expected output: ${totalAssets} total assets`);
  
  const features = [];
  if (CONFIG.ENABLE_CONSTELLATIONS) features.push('🌌 generative constellations');
  if (CONFIG.ENABLE_GLITCH_EFFECTS) features.push('🔥 tasteful glitch variants');
  console.log(`⚡ Active systems: ${features.join(' | ')}`);
  
  // =============================================================================
  // BATCH PROCESSING PIPELINE
  // =============================================================================
  
  console.log('🚀 Batch generation started...');
  const startTime = Date.now();
  let count = 0;
  
  try {
    for (const [quoteIndex, quote] of quotes.entries()) {
      for (const template of templates) {
        await processQuoteTemplate(quote, template, quoteIndex, quotes.length, quotes, count);
        count += 2; // Each quote generates 2 files (normal + glitch)
        
        // Test mode: stop after limit
        if (isTestMode && count >= testLimit) {
          console.log(`🧪 Test mode complete: generated ${count} images`);
          break;
        }
        
        // Progress indicator
        if (count % 20 === 0) {
          const progress = Math.round((count / totalAssets) * 100);
          console.log(`📈 Progress: ${progress}% (${count}/${totalAssets})`);
        }
      }
      
      // Break outer loop too in test mode
      if (isTestMode && count >= testLimit) {
        break;
      }
    }
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
  
  // =============================================================================
  // COMPLETION STATISTICS
  // =============================================================================
  
  const duration = (Date.now() - startTime) / 1000;
  const rate = Math.round(count / (duration / 60));
  
  console.log('🎉 Production complete!');
  console.log(`📈 Generated: ${count} high-resolution assets`);
  console.log(`⏱️  Duration: ${duration.toFixed(1)}s | Rate: ${rate} assets/min`);
  console.log(`💾 Output: ${CONFIG.OUTPUT_DIR}/`);
  console.log('🎨 Ready for deployment to social media platforms');
}

/**
 * Process a single quote-template combination
 * Generates both standard and glitch variants with shared visual correlation
 * 
 * @param {Object} quote - Quote object
 * @param {Object} template - Template object with name and content
 * @param {number} quoteIndex - Current quote index
 * @param {number} totalQuotes - Total number of quotes
 * @param {Array} allQuotes - All quotes for context
 * @param {number} count - Current asset count for naming
 */
async function processQuoteTemplate(quote, template, quoteIndex, totalQuotes, allQuotes, count) {
  const filename = `${template.name}_${quote.text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
  const glitchFilename = `${template.name}_${quote.text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.glitch.png`;
  
  try {
    // =============================================================================
    // SVG GENERATION WITH SHARED NOISE
    // =============================================================================
    
    const { svg: populatedSvg, sharedNoiseMask, templateBounds } = populateTemplate(
      template.content, 
      quote, 
      quoteIndex, 
      totalQuotes, 
      allQuotes
    );
    
    // Optional SVG export for After Effects
    if (CONFIG.EXPORT_SVG_FOR_AE) {
      const svgFilename = `${CONFIG.SVG_EXPORT_DIR}/${template.name}_${quote.text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.svg`;
      fs.writeFileSync(svgFilename, populatedSvg);
    }
    
    // =============================================================================
    // HIGH-QUALITY PNG RENDERING
    // =============================================================================
    
    const width = templateBounds.isSquare ? 1080 : 1080;
    const height = templateBounds.isSquare ? 1080 : 1920;
    
    // Standard version with subtle enhancement
    let pngBuffer = await sharp(Buffer.from(populatedSvg))
      .resize(width, height)
      .png({ quality: 100 })
      .toBuffer();
    
    // Skip glitch effects for now to debug
    const seed = hashString(quote.text + template.name);
    const chance = new Chance(seed);
    
    if (chance.bool({ likelihood: 50 })) {
      pngBuffer = await applyGlitchEffects(pngBuffer, quote, false);
    }
    
    fs.writeFileSync(`${CONFIG.OUTPUT_DIR}/${filename}`, pngBuffer);
    console.log(`✅ ${filename}`);
    
    // =============================================================================
    // GLITCH VARIANT WITH SHARED VISUAL CORRELATION
    // =============================================================================
    
    let glitchBuffer = await sharp(Buffer.from(populatedSvg))
      .resize(width, height)
      .png({ quality: 100 })
      .toBuffer();
    
    // Re-enable glitch effects
    glitchBuffer = await applyGlitchEffects(glitchBuffer, quote, true);
    
    // Apply glitch-canvas effect with proper Promise handling
    try {
      const glitchParams = {
        seed: chance.integer({ min: 1, max: 99 }),
        quality: chance.integer({ min: 30, max: 60 }),
        amount: chance.integer({ min: 5, max: 15 }),
        iterations: 1
      };
      
      if (Buffer.isBuffer(glitchBuffer) && glitchBuffer.length > 0) {
        // glitch-canvas returns a Promise
        const glitchedResult = await new Promise((resolve, reject) => {
          glitch(glitchParams)
            .fromBuffer(glitchBuffer)
            .toBuffer()
            .then(buffer => resolve(buffer))
            .catch(error => reject(error));
        });
        
        if (Buffer.isBuffer(glitchedResult) && glitchedResult.length > 0) {
          glitchBuffer = glitchedResult;
        } else {
          console.warn(`⚠️  Glitch-canvas returned invalid buffer`);
        }
      } else {
        console.warn(`⚠️  Skipping canvas glitch - invalid buffer`);
      }
    } catch (glitchError) {
      console.warn(`⚠️  Canvas glitch failed for ${glitchFilename}: ${glitchError.message}`);
    }
    
    fs.writeFileSync(`${CONFIG.OUTPUT_DIR}/${glitchFilename}`, glitchBuffer);
    console.log(`🔥 ${glitchFilename}`);
    
  } catch (error) {
    console.warn(`❌ Failed: ${template.name} - ${error.message}`);
  }
}

// =============================================================================
// APPLICATION BOOTSTRAP
// =============================================================================

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  generateBranding,
  generateContextualText,
  populateTemplate,
  processQuoteTemplate,
  CONFIG
};