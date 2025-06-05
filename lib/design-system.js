// 🎨 DESIGN SYSTEM CONSTANTS
const DESIGN_CONSTANTS = {
  // Typography scale - professional base-4 system
  FONT_SIZES: {
    primary: 6,      // Main quote text
    reduced: 5,      // Long quotes  
    minimal: 4,      // Very long quotes
    metadata: 1,     // Technical annotations
    title: 8         // Quote titles
  },
  
  // Semantic color system
  COLORS: {
    background: '#2a3944',
    text: '#ffffff',
    accent_orange: '#e17055',   // Orange from social-02.svg background
    accent_green: '#55e170',    // Complement green for variety
    metadata: '#8a9ba8',        // Muted blue-gray for technical text
    constellation: 'rgba(255,255,255,0.6)',
    constellation_line: 'rgba(255,255,255,0.1)'
  },
  
  // Layout grid (based on 108px width)
  GRID: {
    margin: 12,
    gutter: 6,
    baseline: 6.8,
    golden_section: 108 / 1.618034  // ~66.8px
  }
};

module.exports = { DESIGN_CONSTANTS };