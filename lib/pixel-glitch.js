const sharp = require("sharp");
const Chance = require("chance");
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const { hashString } = require("./utils");

// 📝 Professional logging setup
const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Clear previous log file
const logFile = path.join(logDir, 'glitch-settings.log');
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: logFile })
  ]
});

// 🌊 PERLIN NOISE IMPLEMENTATION
class PerlinNoise {
  constructor(seed) {
    this.chance = new Chance(seed);
    this.permutation = this.generatePermutation();
  }
  
  generatePermutation() {
    const p = Array.from({length: 256}, (_, i) => i);
    // Fisher-Yates shuffle with seeded random
    for (let i = p.length - 1; i > 0; i--) {
      const j = this.chance.integer({ min: 0, max: i });
      [p[i], p[j]] = [p[j], p[i]];
    }
    return [...p, ...p]; // Duplicate for easier indexing
  }
  
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  lerp(a, b, t) {
    return a + t * (b - a);
  }
  
  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.permutation[X] + Y;
    const AA = this.permutation[A];
    const AB = this.permutation[A + 1];
    const B = this.permutation[X + 1] + Y;
    const BA = this.permutation[B];
    const BB = this.permutation[B + 1];
    
    return this.lerp(
      this.lerp(
        this.grad(this.permutation[AA], x, y),
        this.grad(this.permutation[BA], x - 1, y),
        u
      ),
      this.lerp(
        this.grad(this.permutation[AB], x, y - 1),
        this.grad(this.permutation[BB], x - 1, y - 1),
        u
      ),
      v
    );
  }
  
  // Generate noise mask for entire image
  generateMask(width, height, scale = 0.05, octaves = 3) {
    const mask = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let value = 0;
        let amplitude = 1;
        let frequency = scale;
        
        // Multiple octaves for more complex patterns
        for (let octave = 0; octave < octaves; octave++) {
          value += this.noise(x * frequency, y * frequency) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        // Normalize to 0-1 range
        mask[y * width + x] = (value + 1) * 0.5;
      }
    }
    
    return mask;
  }
}

// 🔥 PIXEL GLITCH EFFECTS
const GLITCH_TYPES = {
  CHANNEL_SHIFT: 'channel_shift',
  PIXEL_SORT_H: 'pixel_sort_horizontal', 
  PIXEL_SORT_V: 'pixel_sort_vertical',
  DATA_MOSH: 'data_mosh',
  SCANLINES: 'scanlines',
  INTERLACE: 'interlace',
  NOISE: 'noise',
  MIRROR: 'mirror',
  COLOR_SHIFT: 'color_shift'  // NEW: Wild color manipulation
};

function getGlitchMix(seed) {
  const chance = new Chance(seed);
  const mix = {};
  
  // Weighted glitch effects - bring back the cool stuff!
  const effectWeights = {
    [GLITCH_TYPES.CHANNEL_SHIFT]: 80,   // Chromatic aberration - BACK!
    [GLITCH_TYPES.PIXEL_SORT_H]: 60,    // Pixel sorting horizontal
    [GLITCH_TYPES.PIXEL_SORT_V]: 50,    // Pixel sorting vertical  
    [GLITCH_TYPES.DATA_MOSH]: 45,       // Data corruption
    [GLITCH_TYPES.COLOR_SHIFT]: 40,     // Color effects
    [GLITCH_TYPES.SCANLINES]: 30,       // Scanline effects
    [GLITCH_TYPES.NOISE]: 25,           // Noise injection
    [GLITCH_TYPES.INTERLACE]: 20,       // Interlacing
    [GLITCH_TYPES.MIRROR]: 15,          // Mirror effects
  };
  
  // Apply each effect based on its weight
  Object.entries(effectWeights).forEach(([effect, weight]) => {
    if (chance.bool({ likelihood: weight })) {
      mix[effect] = true;
    }
  });
  
  // Ensure at least one effect is selected
  if (Object.keys(mix).length === 0) {
    mix[GLITCH_TYPES.COLOR_SHIFT] = true; // Fallback to our safe implemented effect
  }
  
  return mix;
}

async function applyGlitchEffects(imageBuffer, quote, useMix = false) {
  // Validate inputs
  if (!Buffer.isBuffer(imageBuffer)) {
    console.warn('⚠️  Invalid imageBuffer input:', typeof imageBuffer);
    throw new Error('imageBuffer must be a Buffer');
  }
  
  try {
    const { data, info } = await sharp(imageBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const pixels = new Uint8Array(data);
    const seed = hashString(quote.text);
    const chance = new Chance(seed);

    // Generate new noise mask
    const perlin = new PerlinNoise(seed);
    
    // Simplified scale selection
    const scaleType = chance.weighted(
      ['macro', 'large', 'medium'], 
      [50, 40, 10]
    );
    
    let scale, octaves;
    switch (scaleType) {
      case 'macro':
        scale = chance.floating({ min: 0.0001, max: 0.0005 }); // SMALLER values = BIGGER patterns!
        octaves = chance.integer({ min: 1, max: 2 });
        break;
      case 'large':
        scale = chance.floating({ min: 0.0005, max: 0.002 });  // Still small values for large patterns
        octaves = chance.integer({ min: 1, max: 2 });
        break;
      case 'medium':
        scale = chance.floating({ min: 0.002, max: 0.008 });   // Medium scale values
        octaves = chance.integer({ min: 1, max: 2 });
        break;
    }
    
    const noiseMask = perlin.generateMask(width, height, scale, octaves);

    // Get glitch mix based on quote - SAFE FALLBACK (no DATA_MOSH!)
    const mix = useMix ? getGlitchMix(seed) : { 
      [GLITCH_TYPES.COLOR_SHIFT]: true  // Only use our implemented Perlin-based color effects
    };

    // Apply each effect if selected (with Perlin noise mask)
    if (mix[GLITCH_TYPES.CHANNEL_SHIFT]) {
      applyChannelShift(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.PIXEL_SORT_H]) {
      applyPixelSortH(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.PIXEL_SORT_V]) {
      applyPixelSortV(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.DATA_MOSH]) {
      applyDataMosh(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.SCANLINES]) {
      applyScanlines(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.INTERLACE]) {
      applyInterlace(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.NOISE]) {
      applyNoise(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.COLOR_SHIFT]) {
      applyColorShift(pixels, width, height, channels, chance, noiseMask);
    }
    
    if (mix[GLITCH_TYPES.MIRROR]) {
      applyMirror(pixels, width, height, channels, chance, noiseMask);
    }

    // 📊 Collect glitch metadata for debugging
    const activeEffects = Object.entries(mix)
      .filter(([_, active]) => active)
      .map(([effect, _]) => effect);
    
    const glitchMetadata = {
      seed: seed,
      quote_hash: hashString(quote.text),
      quote_length: quote.text.length,
      perlin_scale: scale,
      perlin_octaves: octaves,
      perlin_type: scaleType,
      active_effects: activeEffects.join(','),
      effect_count: activeEffects.length,
      use_mix: useMix,
      timestamp: new Date().toISOString()
    };
    
    logger.info('Glitch settings applied', {
      filename: `${quote.text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.glitch.png`,
      ...glitchMetadata
    });
    
    // 💾 Simple PNG output - skip complex metadata for now to avoid buffer issues
    return await sharp(pixels, {
      raw: { width, height, channels }
    })
    .png({
      compressionLevel: 6,
      adaptiveFiltering: false
    })
    .toBuffer();
    
  } catch (error) {
    console.warn(`⚠️  Glitch failed: ${error.message}`);
    return imageBuffer; // Always return the original buffer on error
  }
}

function applyChannelShift(pixels, width, height, channels, chance) {
  let redShift = chance.floating({ min: 0.8, max: 4.2 });
  let blueShift = chance.floating({ min: 0.5, max: 3.8 });
  
  // Rare dramatic shift (0.5% chance)
  if (chance.bool({ likelihood: 0.5 })) redShift *= 8;
  if (chance.bool({ likelihood: 0.5 })) blueShift *= 8;
  
  redShift = Math.round(redShift);
  blueShift = Math.round(blueShift);
  
  const redDirection = chance.bool() ? 1 : -1;
  const blueDirection = chance.bool() ? 1 : -1;
  
  // Apply to random regions instead of whole image
  const regionCount = chance.integer({ min: 1, max: 3 });
  
  for (let region = 0; region < regionCount; region++) {
    const startY = chance.integer({ min: 0, max: height * 0.7 });
    const endY = Math.min(height, startY + chance.integer({ min: 50, max: 200 }));
    
    for (let y = startY; y < endY; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        
        // Shift red channel
        const redX = Math.max(0, Math.min(width - 1, x + redShift * redDirection));
        const redIdx = (y * width + redX) * channels;
        pixels[idx] = pixels[redIdx];
        
        // Shift blue channel independently 
        const blueX = Math.max(0, Math.min(width - 1, x + blueShift * blueDirection));
        const blueIdx = (y * width + blueX) * channels;
        pixels[idx + 2] = pixels[blueIdx + 2];
      }
    }
  }
}

// Additional glitch functions would go here...
// (I'll include a few key ones to demonstrate the pattern)

function applyDataMosh(pixels, width, height, channels, chance) {
  let moshCount = chance.integer({ min: 1, max: 2 });
  let blockSizeMin = chance.floating({ min: 8, max: 15 });
  let blockSizeMax = chance.floating({ min: 20, max: 35 });
  
  // Rare chaos mode (0.2% chance)
  if (chance.bool({ likelihood: 0.2 })) {
    moshCount *= 6;
    blockSizeMin *= 3;
    blockSizeMax *= 3;
  }
  
  for (let i = 0; i < moshCount; i++) {
    const blockSize = Math.round(chance.floating({ min: blockSizeMin, max: blockSizeMax }));
    
    // Enhanced safety checks for interesting content
    let sourceX, sourceY, destX, destY;
    let attempts = 0;
    let hasGoodSource = false;
    
    do {
      sourceX = chance.integer({ min: 0, max: width - blockSize });
      sourceY = chance.integer({ min: 0, max: height - blockSize });
      destX = chance.integer({ min: 0, max: width - blockSize });
      destY = chance.integer({ min: 0, max: height - blockSize });
      
      // Enhanced variation detection
      let variationCount = 0;
      const sampleSize = Math.min(blockSize, 8);
      
      for (let sy = 0; sy < sampleSize; sy += 2) {
        for (let sx = 0; sx < sampleSize; sx += 2) {
          const idx1 = ((sourceY + sy) * width + (sourceX + sx)) * channels;
          const idx2 = ((sourceY + sy + 1) * width + (sourceX + sx + 1)) * channels;
          
          if (idx1 < pixels.length - 3 && idx2 < pixels.length - 3) {
            const brightness1 = (pixels[idx1] + pixels[idx1 + 1] + pixels[idx1 + 2]) / 3;
            const brightness2 = (pixels[idx2] + pixels[idx2 + 1] + pixels[idx2 + 2]) / 3;
            
            if (Math.abs(brightness1 - brightness2) > 20) {
              variationCount++;
            }
          }
        }
      }
      
      hasGoodSource = variationCount >= 3; // Need multiple variation points
      attempts++;
    } while (!hasGoodSource && attempts < 8);
    
    // Only proceed if we found interesting content
    if (!hasGoodSource) continue;
    
    // Subtle blend instead of hard copy
    const blendStrength = chance.floating({ min: 0.4, max: 0.8 });
    
    for (let dy = 0; dy < blockSize; dy++) {
      for (let dx = 0; dx < blockSize; dx++) {
        const srcIdx = ((sourceY + dy) * width + (sourceX + dx)) * channels;
        const destIdx = ((destY + dy) * width + (destX + dx)) * channels;
        
        for (let c = 0; c < channels; c++) {
          pixels[destIdx + c] = Math.floor(
            pixels[destIdx + c] * (1 - blendStrength) + 
            pixels[srcIdx + c] * blendStrength
          );
        }
      }
    }
  }
}

// Placeholder functions for other effects
// 🌈 ORGANIC COLOR SHIFT - Perlin-noise-masked organic manipulation
function applyColorShift(pixels, width, height, channels, chance, noiseMask) {
  const strategy = chance.pickone([
    'hue_rotate_perlin',     // Hue rotation following Perlin noise patterns
    'luminance_perlin',      // Luminance inversion with noise mask
    'saturation_perlin'      // Saturation variations following noise
  ]);
  
  switch (strategy) {
    case 'hue_rotate_perlin':
      applyHueRotatePerlin(pixels, width, height, channels, chance, noiseMask);
      break;
      
    case 'luminance_perlin':
      applyLuminancePerlin(pixels, width, height, channels, chance, noiseMask);
      break;
      
    case 'saturation_perlin':
      applySaturationPerlin(pixels, width, height, channels, chance, noiseMask);
      break;
  }
}

// 🌊 Hue rotation following Perlin noise patterns - MORE SUBTLE
function applyHueRotatePerlin(pixels, width, height, channels, chance, noiseMask) {
  const maxHueShift = chance.integer({ min: 60, max: 180 });     // More dramatic
  const threshold = chance.floating({ min: 0.2, max: 0.8 });     // Wider range
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * channels;
      const maskIndex = y * width + x;
      const noiseValue = noiseMask[maskIndex];
      
      // More subtle masking - gradual falloff instead of hard threshold
      if (noiseValue > threshold) {
        const [h, s, l] = rgbToHsl(pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]);
        
        // Gentler hue shift with smooth intensity
        const intensity = (noiseValue - threshold) / (1 - threshold);  // 0-1 range
        const hueShift = intensity * maxHueShift * 1.2;  // Increased intensity
        const newHue = (h + hueShift) % 360;
        const [r, g, b] = hslToRgb(newHue, s, l);
        
        pixels[pixelIndex] = r;
        pixels[pixelIndex + 1] = g;
        pixels[pixelIndex + 2] = b;
      }
    }
  }
}

// Swap colors with their exact complements
function applyComplementSwap(pixels, width, height, channels, chance) {
  const threshold = chance.integer({ min: 20, max: 80 }); // Color similarity threshold
  
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1]; 
    const b = pixels[i + 2];
    
    // Calculate complement color
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    // Only swap if original color has enough saturation
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s > 0.3 && chance.bool({ likelihood: 25 })) {
      pixels[i] = compR;
      pixels[i + 1] = compG;
      pixels[i + 2] = compB;
    }
  }
}

// Invert specific color channels in geometric regions
function applyChannelInvertRegions(pixels, width, height, channels, chance) {
  const regionType = chance.pickone(['stripes', 'checkerboard', 'circles']);
  const invertChannels = chance.pickone([
    [true, false, false],   // Red only
    [false, true, false],   // Green only  
    [false, false, true],   // Blue only
    [true, true, false],    // Red + Green
    [false, true, true]     // Green + Blue
  ]);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let shouldInvert = false;
      
      switch (regionType) {
        case 'stripes':
          shouldInvert = (x % 20) < 10;
          break;
        case 'checkerboard':
          shouldInvert = ((x / 15) + (y / 15)) % 2 < 1;
          break;
        case 'circles':
          const centerDist = Math.sqrt((x - width/2) ** 2 + (y - height/2) ** 2);
          shouldInvert = (centerDist % 30) < 15;
          break;
      }
      
      if (shouldInvert) {
        const pixelIndex = (y * width + x) * channels;
        if (invertChannels[0]) pixels[pixelIndex] = 255 - pixels[pixelIndex];
        if (invertChannels[1]) pixels[pixelIndex + 1] = 255 - pixels[pixelIndex + 1];
        if (invertChannels[2]) pixels[pixelIndex + 2] = 255 - pixels[pixelIndex + 2];
      }
    }
  }
}

// Find and replace the most dominant color
function applyDominantColorReplace(pixels, width, height, channels, chance) {
  // Analyze color frequency (simplified)
  const colorCount = {};
  
  for (let i = 0; i < pixels.length; i += channels) {
    // Quantize to reduce color space
    const r = Math.floor(pixels[i] / 32) * 32;
    const g = Math.floor(pixels[i + 1] / 32) * 32;
    const b = Math.floor(pixels[i + 2] / 32) * 32;
    const colorKey = `${r},${g},${b}`;
    
    colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
  }
  
  // Find most dominant color
  let dominantColor = null;
  let maxCount = 0;
  
  for (const [color, count] of Object.entries(colorCount)) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color.split(',').map(Number);
    }
  }
  
  if (dominantColor) {
    // Generate wild replacement color
    const [newR, newG, newB] = [
      chance.integer({ min: 0, max: 255 }),
      chance.integer({ min: 0, max: 255 }),
      chance.integer({ min: 0, max: 255 })
    ];
    
    // Replace all instances of dominant color
    for (let i = 0; i < pixels.length; i += channels) {
      const r = Math.floor(pixels[i] / 32) * 32;
      const g = Math.floor(pixels[i + 1] / 32) * 32;
      const b = Math.floor(pixels[i + 2] / 32) * 32;
      
      if (r === dominantColor[0] && g === dominantColor[1] && b === dominantColor[2]) {
        pixels[i] = newR;
        pixels[i + 1] = newG;
        pixels[i + 2] = newB;
      }
    }
  }
}

// 🌊 Saturation variations following Perlin noise patterns
function applySaturationPerlin(pixels, width, height, channels, chance, noiseMask) {
  const saturationRange = chance.floating({ min: 0.3, max: 0.7 }); // How much to vary saturation
  const threshold = chance.floating({ min: 0.2, max: 0.6 });
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * channels;
      const maskIndex = y * width + x;
      const noiseValue = noiseMask[maskIndex];
      
      // Apply saturation changes where noise meets conditions
      if (noiseValue > threshold) {
        const [h, s, l] = rgbToHsl(pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]);
        
        // Map noise value to saturation multiplier (0.7 to 1.3 range)
        const noiseStrength = (noiseValue - threshold) / (1 - threshold);
        const saturationMultiplier = 0.7 + (0.6 * noiseStrength);
        
        const newSaturation = Math.max(0, Math.min(1, s * saturationMultiplier));
        const [r, g, b] = hslToRgb(h, newSaturation, l);
        
        pixels[pixelIndex] = r;
        pixels[pixelIndex + 1] = g;
        pixels[pixelIndex + 2] = b;
      }
    }
  }
}

// 🌊 Luminance inversion following Perlin noise patterns
function applyLuminancePerlin(pixels, width, height, channels, chance, noiseMask) {
  const threshold = chance.floating({ min: 0.4, max: 0.8 });
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * channels;
      const maskIndex = y * width + x;
      const noiseValue = noiseMask[maskIndex];
      
      // Apply luminance inversion where noise is above threshold
      if (noiseValue > threshold) {
        const [h, s, l] = rgbToHsl(pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]);
        
        // Invert lightness with intensity based on noise value
        const inversionStrength = (noiseValue - threshold) / (1 - threshold);
        const invertedL = l + (1.0 - 2 * l) * inversionStrength;
        const [r, g, b] = hslToRgb(h, s, Math.max(0, Math.min(1, invertedL)));
        
        pixels[pixelIndex] = r;
        pixels[pixelIndex + 1] = g;
        pixels[pixelIndex + 2] = b;
      }
    }
  }
}

// Color conversion utilities
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  
  return [r, g, b];
}

// 🎨 DRAMATIC PIXEL SORTING HORIZONTAL
function applyPixelSortH(pixels, width, height, channels, chance, noiseMask) {
  const sortLines = chance.integer({ min: 3, max: 8 });
  for (let i = 0; i < sortLines; i++) {
    const y = chance.integer({ min: 0, max: height - 1 });
    const startX = chance.integer({ min: 0, max: Math.floor(width * 0.3) });
    const endX = chance.integer({ min: Math.floor(width * 0.7), max: width });
    
    // Extract pixels for this line segment
    const linePixels = [];
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * channels;
      linePixels.push([pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3] || 255]);
    }
    
    // Sort by brightness with chance-based direction
    const sortDirection = chance.bool() ? 1 : -1;
    linePixels.sort((a, b) => sortDirection * ((a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2])));
    
    // Put sorted pixels back
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * channels;
      const pixelData = linePixels[x - startX];
      pixels[idx] = pixelData[0];
      pixels[idx + 1] = pixelData[1];
      pixels[idx + 2] = pixelData[2];
    }
  }
}

// 🎨 DRAMATIC PIXEL SORTING VERTICAL  
function applyPixelSortV(pixels, width, height, channels, chance, noiseMask) {
  const sortLines = chance.integer({ min: 2, max: 5 });
  for (let i = 0; i < sortLines; i++) {
    const x = chance.integer({ min: 0, max: width - 1 });
    const startY = chance.integer({ min: 0, max: Math.floor(height * 0.3) });
    const endY = chance.integer({ min: Math.floor(height * 0.7), max: height });
    
    // Extract pixels for this column segment
    const linePixels = [];
    for (let y = startY; y < endY; y++) {
      const idx = (y * width + x) * channels;
      linePixels.push([pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3] || 255]);
    }
    
    // Sort by brightness with chance-based direction
    const sortDirection = chance.bool() ? 1 : -1;
    linePixels.sort((a, b) => sortDirection * ((a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2])));
    
    // Put sorted pixels back
    for (let y = startY; y < endY; y++) {
      const idx = (y * width + x) * channels;
      const pixelData = linePixels[y - startY];
      pixels[idx] = pixelData[0];
      pixels[idx + 1] = pixelData[1];
      pixels[idx + 2] = pixelData[2];
    }
  }
}

// 🔥 DATA CORRUPTION GLITCH
function applyDataMosh(pixels, width, height, channels, chance, noiseMask) {
  const corruptionCount = chance.integer({ min: 20, max: 100 });
  for (let i = 0; i < corruptionCount; i++) {
    const srcIdx = chance.integer({ min: 0, max: Math.max(0, pixels.length - channels) });
    const destIdx = chance.integer({ min: 0, max: Math.max(0, pixels.length - channels) });
    const blockSize = chance.integer({ min: 1, max: 20 });
    
    for (let j = 0; j < blockSize && srcIdx + j < pixels.length && destIdx + j < pixels.length; j++) {
      pixels[destIdx + j] = pixels[srcIdx + j];
    }
  }
}

// 📺 SCANLINE EFFECTS
function applyScanlines(pixels, width, height, channels, chance, noiseMask) {
  const scanlineSpacing = chance.integer({ min: 2, max: 6 });
  const intensity = chance.floating({ min: 0.3, max: 0.8 });
  const startY = chance.integer({ min: 0, max: 3 }); // Random start offset
  
  for (let y = startY; y < height; y += scanlineSpacing) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      pixels[idx] = Math.floor(pixels[idx] * intensity);
      pixels[idx + 1] = Math.floor(pixels[idx + 1] * intensity);
      pixels[idx + 2] = Math.floor(pixels[idx + 2] * intensity);
    }
  }
}

// 📼 INTERLACE EFFECTS
function applyInterlace(pixels, width, height, channels, chance, noiseMask) {
  for (let y = 0; y < height; y += 2) {
    const offset = chance.integer({ min: -3, max: 3 });
    for (let x = 0; x < width; x++) {
      const srcX = Math.max(0, Math.min(width - 1, x + offset));
      const srcIdx = (y * width + srcX) * channels;
      const destIdx = (y * width + x) * channels;
      
      pixels[destIdx] = pixels[srcIdx];
      pixels[destIdx + 1] = pixels[srcIdx + 1];
      pixels[destIdx + 2] = pixels[srcIdx + 2];
    }
  }
}

// 🌪️ NOISE INJECTION
function applyNoise(pixels, width, height, channels, chance, noiseMask) {
  const noiseCount = chance.integer({ min: 100, max: 500 });
  for (let i = 0; i < noiseCount; i++) {
    const idx = chance.integer({ min: 0, max: Math.max(0, pixels.length - channels) });
    const noiseValue = chance.integer({ min: 0, max: 255 });
    const channelChoice = chance.integer({ min: 0, max: 2 });
    pixels[idx + channelChoice] = noiseValue;
  }
}

// 🪞 MIRROR EFFECTS
function applyMirror(pixels, width, height, channels, chance, noiseMask) {
  const mirrorY = chance.integer({ min: Math.floor(height * 0.3), max: Math.floor(height * 0.7) });
  const mirrorDirection = chance.bool() ? 1 : -1; // Mirror up or down
  
  for (let y = 0; y < mirrorY; y++) {
    const srcY = mirrorDirection > 0 ? mirrorY + (mirrorY - y) : Math.abs(mirrorY - y);
    if (srcY >= 0 && srcY < height) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (srcY * width + x) * channels;
        const destIdx = (y * width + x) * channels;
        pixels[destIdx] = pixels[srcIdx];
        pixels[destIdx + 1] = pixels[srcIdx + 1];
        pixels[destIdx + 2] = pixels[srcIdx + 2];
      }
    }
  }
}

module.exports = { 
  GLITCH_TYPES, 
  getGlitchMix, 
  applyGlitchEffects,
  PerlinNoise  // Export for shared noise generation
};