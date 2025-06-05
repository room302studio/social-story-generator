const nlp = require("compromise");
const Chance = require("chance");
const chroma = require("chroma-js");
const { DESIGN_CONSTANTS } = require("./design-system");
const { sophisticatedColorGlitch, createColorOrchestrator } = require("./advanced-color-system");
const { phi, tau, hashString } = require("./utils");

// 🌌 CONSTELLATION GENERATOR - Sophisticated color-theoretic patterns
function generateConstellation(quote, templateBounds, CONFIG = { ENABLE_CONSTELLATIONS: true, ENABLE_CRYPTO_PUZZLE: true, EXPORT_SVG_FOR_AE: false }) {
  if (!CONFIG.ENABLE_CONSTELLATIONS) return "";
  
  const seed = hashString(quote.text);
  const chance = new Chance(seed);
  
  // 🌟 CONSTELLATION TYPE VARIETY - Much more diverse patterns
  const constellationType = chance.weighted(
    ['simple_dots', 'golden_spiral', 'random_scatter', 'minimal_lines', 'cluster_pattern', 'arc_pattern'],
    [25, 20, 20, 15, 10, 10]  // More evenly distributed variety
  );
  
  // Simple dots - just 1px stars, no connections
  if (constellationType === 'simple_dots') {
    return generateSimpleDots(quote, templateBounds, chance);
  }
  
  // Random scatter - random positions with minimal connections
  if (constellationType === 'random_scatter') {
    return generateRandomScatter(quote, templateBounds, chance);
  }
  
  // Minimal lines - just a few connected stars
  if (constellationType === 'minimal_lines') {
    return generateMinimalLines(quote, templateBounds, chance);
  }
  
  // Cluster pattern - stars grouped in clusters
  if (constellationType === 'cluster_pattern') {
    return generateClusterPattern(quote, templateBounds, chance);
  }
  
  // Arc pattern - stars arranged in curved patterns
  if (constellationType === 'arc_pattern') {
    return generateArcPattern(quote, templateBounds, chance);
  }
  
  // Fall through to original golden spiral for remaining cases
  const wordCount = quote.text.split(" ").length;
  const charCount = quote.text.length;
  
  // Initialize color orchestrator for this constellation
  const colorOrchestrator = createColorOrchestrator(seed);
  
  // Derive everything from golden ratio
  const starCount = Math.floor(wordCount * phi) + 3;
  const connectionThreshold = charCount * phi;
  const brightness = (seed % 100) / 255;

  // Generate stars using golden spiral
  const stars = [];
  const centerX = templateBounds.width / 2;
  const centerY = templateBounds.height / 2;
  
  // Crypto star if enabled
  if (CONFIG.ENABLE_CRYPTO_PUZZLE) {
    const doc = nlp(quote.text);
    const keyWords = [...doc.nouns().out("array"), ...doc.adjectives().out("array")]
      .filter(w => w.length > 4)
      .sort((a, b) => b.length - a.length);
    
    if (keyWords[0]) {
      const charCode = keyWords[0].charCodeAt(0);
      stars.push({
        x: (charCode % templateBounds.width),
        y: ((charCode * phi) % templateBounds.height),
        radius: 0.25, // 1px diameter
        isCrypto: true
      });
    }
  }

  // Golden spiral placement
  for (let i = stars.length; i < starCount; i++) {
    const angle = i * tau / phi;
    const radius = Math.sqrt(i) * 15;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Constrain to bounds
    if (x > 0 && x < templateBounds.width && y > 0 && y < templateBounds.height) {
      stars.push({
        x: x,
        y: y,
        radius: 0.25 // 1px diameter
      });
    }
  }

  // Minimal connections - only nearest neighbors
  const connections = [];
  for (let i = 0; i < stars.length - 1; i++) {
    const dist = Math.hypot(stars[i+1].x - stars[i].x, stars[i+1].y - stars[i].y);
    if (dist < connectionThreshold) {
      connections.push({
        x1: stars[i].x,
        y1: stars[i].y,
        x2: stars[i+1].x,
        y2: stars[i+1].y
      });
    }
  }

  // Render clean SVG
  let svg = CONFIG.EXPORT_SVG_FOR_AE
    ? `\n  <g id="constellation" inkscape:groupmode="layer" inkscape:label="Constellation">`
    : `\n  <g class="constellation" opacity="${brightness}">`;

  // Lines
  connections.forEach((conn, i) => {
    const opacity = 0.1 + (i % 5) * 0.05;
    svg += `\n    <line x1="${conn.x1.toFixed(1)}" y1="${conn.y1.toFixed(1)}" x2="${conn.x2.toFixed(1)}" y2="${conn.y2.toFixed(1)}" stroke="rgba(255,255,255,${opacity})" stroke-width="0.2"/>`;
  });

  // Stars with sophisticated color theory + mathematical precision
  stars.forEach((star, i) => {
    if (star.isCrypto) {
      // Crypto stars get colors from the master palette + sophisticated enhancement
      const basePalette = colorOrchestrator.palette;
      let baseColor = basePalette[i % basePalette.length];
      
      // Sometimes use the original accent colors as a base
      if (chance.bool({ likelihood: 30 })) {
        const accentColor = chance.bool() ? DESIGN_CONSTANTS.COLORS.accent_orange : DESIGN_CONSTANTS.COLORS.accent_green;
        baseColor = chroma(accentColor); // Convert to chroma object
      }
      
      const enhancedColor = sophisticatedColorGlitch(baseColor.hex(), seed + i, 25);
      svg += `\n    <circle cx="${star.x.toFixed(1)}" cy="${star.y.toFixed(1)}" r="${star.radius}" fill="${enhancedColor}"/>`;
    } else {
      // Regular stars get subtle mathematical color precision
      let starColor = DESIGN_CONSTANTS.COLORS.constellation;
      const baseHex = chroma(starColor).hex();
      
      // Apply sophisticated color science with low probability for minimalist aesthetic
      const enhancedColor = sophisticatedColorGlitch(baseHex, seed + i + 1000, 8); // Only 8% chance
      const finalColor = chroma(enhancedColor).alpha(0.6).css();
      
      svg += `\n    <circle cx="${star.x.toFixed(1)}" cy="${star.y.toFixed(1)}" r="${star.radius}" fill="${finalColor}"/>`;
    }
  });

  svg += "\n  </g>";
  return svg;
}

// 🌟 Simple star dots - classic look
function generateSimpleDots(quote, templateBounds, chance) {
  const starCount = Math.floor(chance.floating({ min: 0.3, max: 0.8 }) * 15) + chance.integer({ min: 3, max: 12 });
  let svg = '\n  <g id="constellation">';
  
  for (let i = 0; i < starCount; i++) {
    const x = chance.floating({ min: 5, max: templateBounds.width - 5 });
    const y = chance.floating({ min: 5, max: templateBounds.height - 5 });
    const radius = 0.25; // Actually 1px diameter (0.5px radius)
    const color = DESIGN_CONSTANTS.COLORS.constellation;
    
    svg += `\n    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${color}"/>`;
  }
  
  svg += '\n  </g>';
  return svg;
}

// 🌟 Random scatter - random positions with minimal connections
function generateRandomScatter(quote, templateBounds, chance) {
  const starCount = Math.floor(chance.floating({ min: 0.4, max: 0.7 }) * 20) + 5;
  let svg = '\n  <g id="constellation">';
  
  for (let i = 0; i < starCount; i++) {
    const x = chance.floating({ min: 10, max: templateBounds.width - 10 });
    const y = chance.floating({ min: 10, max: templateBounds.height - 10 });
    const radius = 0.25; // Actually 1px diameter
    const color = DESIGN_CONSTANTS.COLORS.constellation;
    
    svg += `\n    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${color}"/>`;
  }
  
  svg += '\n  </g>';
  return svg;
}

// 🌟 Minimal lines - just a few connected stars
function generateMinimalLines(quote, templateBounds, chance) {
  const starCount = chance.integer({ min: 3, max: 8 });
  const stars = [];
  let svg = '\n  <g id="constellation">';
  
  // Generate stars
  for (let i = 0; i < starCount; i++) {
    const star = {
      x: chance.floating({ min: 15, max: templateBounds.width - 15 }),
      y: chance.floating({ min: 15, max: templateBounds.height - 15 }),
      radius: 0.25 // Always 1px diameter
    };
    stars.push(star);
  }
  
  // Draw connections (very minimal)
  const maxConnections = Math.min(2, starCount - 1);
  for (let i = 0; i < maxConnections; i++) {
    const star1 = stars[i];
    const star2 = stars[i + 1];
    svg += `\n    <line x1="${star1.x}" y1="${star1.y}" x2="${star2.x}" y2="${star2.y}" stroke="${DESIGN_CONSTANTS.COLORS.constellation_line}" stroke-width="0.2"/>`;
  }
  
  // Draw stars on top
  stars.forEach(star => {
    svg += `\n    <circle cx="${star.x.toFixed(1)}" cy="${star.y.toFixed(1)}" r="${star.radius}" fill="${DESIGN_CONSTANTS.COLORS.constellation}"/>`;
  });
  
  svg += '\n  </g>';
  return svg;
}

// 🌟 Cluster pattern - stars grouped in small clusters
function generateClusterPattern(quote, templateBounds, chance) {
  const clusterCount = chance.integer({ min: 2, max: 4 });
  let svg = '\n  <g id="constellation">';
  
  for (let c = 0; c < clusterCount; c++) {
    // Random cluster center
    const centerX = chance.floating({ min: 20, max: templateBounds.width - 20 });
    const centerY = chance.floating({ min: 20, max: templateBounds.height - 20 });
    const starsInCluster = chance.integer({ min: 3, max: 7 });
    
    for (let i = 0; i < starsInCluster; i++) {
      // Stars scattered around cluster center
      const angle = chance.floating({ min: 0, max: Math.PI * 2 });
      const distance = chance.floating({ min: 5, max: 15 });
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Keep within bounds
      if (x > 5 && x < templateBounds.width - 5 && y > 5 && y < templateBounds.height - 5) {
        svg += `\n    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.5" fill="${DESIGN_CONSTANTS.COLORS.constellation}"/>`;
      }
    }
  }
  
  svg += '\n  </g>';
  return svg;
}

// 🌟 Arc pattern - stars arranged in curved patterns
function generateArcPattern(quote, templateBounds, chance) {
  const arcCount = chance.integer({ min: 1, max: 3 });
  let svg = '\n  <g id="constellation">';
  
  for (let a = 0; a < arcCount; a++) {
    const centerX = chance.floating({ min: 30, max: templateBounds.width - 30 });
    const centerY = chance.floating({ min: 30, max: templateBounds.height - 30 });
    const radius = chance.floating({ min: 15, max: 40 });
    const startAngle = chance.floating({ min: 0, max: Math.PI * 2 });
    const arcLength = chance.floating({ min: Math.PI * 0.3, max: Math.PI * 1.2 });
    const starsInArc = chance.integer({ min: 5, max: 12 });
    
    for (let i = 0; i < starsInArc; i++) {
      const angle = startAngle + (arcLength * i / (starsInArc - 1));
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Keep within bounds
      if (x > 5 && x < templateBounds.width - 5 && y > 5 && y < templateBounds.height - 5) {
        svg += `\n    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.5" fill="${DESIGN_CONSTANTS.COLORS.constellation}"/>`;
      }
    }
  }
  
  svg += '\n  </g>';
  return svg;
}

module.exports = { generateConstellation };