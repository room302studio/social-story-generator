const chroma = require("chroma-js");
const Chance = require("chance");

// 🎨 SOPHISTICATED COLOR ORCHESTRATION SYSTEM
class ColorOrchestrator {
  constructor(seed) {
    this.chance = new Chance(seed);
    this.palette = this.generateMasterPalette();
  }

  // Generate a mathematically perfect palette using color theory
  generateMasterPalette() {
    const baseTemp = this.chance.integer({ min: 3000, max: 8000 });
    const baseColor = chroma.temperature(baseTemp);
    
    // Create sophisticated palette using different color harmony theories
    const harmonyType = this.chance.pickone(['triadic', 'tetradic', 'split_complement', 'analogous', 'monochromatic']);
    
    switch (harmonyType) {
      case 'triadic':
        return this.createTriadicHarmony(baseColor);
      case 'tetradic': 
        return this.createTetradicHarmony(baseColor);
      case 'split_complement':
        return this.createSplitComplementary(baseColor);
      case 'analogous':
        return this.createAnalogousHarmony(baseColor);
      case 'monochromatic':
        return this.createMonochromaticHarmony(baseColor);
      default:
        return [baseColor];
    }
  }

  createTriadicHarmony(base) {
    const [h, s, l] = base.hsl();
    return [
      base,
      chroma.hsl(h + 120, s * 0.9, l * 1.1),
      chroma.hsl(h + 240, s * 0.8, l * 0.9)
    ];
  }

  createTetradicHarmony(base) {
    const [h, s, l] = base.hsl();
    return [
      base,
      chroma.hsl(h + 90, s, l),
      chroma.hsl(h + 180, s * 0.7, l * 1.2),
      chroma.hsl(h + 270, s * 0.9, l * 0.8)
    ];
  }

  createSplitComplementary(base) {
    const [h, s, l] = base.hsl();
    return [
      base,
      chroma.hsl(h + 150, s * 0.8, l * 1.1),
      chroma.hsl(h + 210, s * 0.9, l * 0.9)
    ];
  }

  createAnalogousHarmony(base) {
    const [h, s, l] = base.hsl();
    return [
      chroma.hsl(h - 30, s * 0.9, l * 1.1),
      base,
      chroma.hsl(h + 30, s * 0.8, l * 0.9),
      chroma.hsl(h + 60, s * 0.7, l * 1.05)
    ];
  }

  createMonochromaticHarmony(base) {
    const [h, s, l] = base.hsl();
    return [
      chroma.hsl(h, s * 0.3, l * 1.4),
      chroma.hsl(h, s * 0.6, l * 1.2),
      base,
      chroma.hsl(h, s * 1.2, l * 0.8),
      chroma.hsl(h, s * 1.5, l * 0.6)
    ];
  }

  // Apply sophisticated color transformations
  getEnhancedColor(baseColor, intensity = 'subtle') {
    if (this.chance.bool({ likelihood: 85 })) {
      return baseColor; // Most colors stay normal for minimalist aesthetic
    }

    const technique = this.chance.pickone([
      'perceptual_shift',
      'spectral_purity', 
      'chromatic_adaptation',
      'oklab_precision',
      'temperature_evolution',
      'bezier_interpolation'
    ]);

    return this.applyTechnique(baseColor, technique, intensity);
  }

  applyTechnique(color, technique, intensity) {
    try {
      const chromaColor = chroma(color);
      
      switch (technique) {
        case 'perceptual_shift':
          // Shift in perceptually uniform space for mathematically perfect transitions
          const [l, a, b] = chromaColor.lab();
          return chroma.lab(
            l + this.chance.floating({ min: -8, max: 8 }),
            a + this.chance.floating({ min: -12, max: 12 }),
            b + this.chance.floating({ min: -12, max: 12 })
          ).hex();

        case 'spectral_purity':
          // Convert to pure spectral wavelength then back (creates impossible saturation)
          const wavelength = this.chance.integer({ min: 420, max: 680 });
          const spectralColor = this.wavelengthToRGB(wavelength);
          return chroma.mix(chromaColor, spectralColor, 0.3, 'lab').hex();

        case 'chromatic_adaptation':
          // Simulate viewing under different illuminants
          const illuminants = [
            { temp: 2856, name: 'tungsten' },
            { temp: 5003, name: 'daylight' },
            { temp: 6504, name: 'monitor' },
            { temp: 9300, name: 'blue_sky' }
          ];
          const illuminant = this.chance.pickone(illuminants);
          const adaptedColor = this.chromaticAdaptation(chromaColor, illuminant.temp);
          return chroma.mix(chromaColor, adaptedColor, 0.4, 'lch').hex();

        case 'oklab_precision':
          // Use modern OKLab for perceptually accurate shifts
          const [ok_l, ok_a, ok_b] = chromaColor.oklab();
          return chroma.oklab(
            Math.max(0.1, Math.min(0.9, ok_l + this.chance.floating({ min: -0.1, max: 0.1 }))),
            ok_a + this.chance.floating({ min: -0.05, max: 0.05 }),
            ok_b + this.chance.floating({ min: -0.05, max: 0.05 })
          ).hex();

        case 'temperature_evolution':
          // Evolve color temperature like a star's lifecycle
          const currentTemp = this.rgbToTemperature(chromaColor);
          const evolution = this.chance.pickone([
            currentTemp * 0.7,  // Cooling red giant
            currentTemp * 1.3,  // Heating up
            currentTemp * 0.4   // Cool dwarf
          ]);
          const tempColor = chroma.temperature(Math.max(2000, Math.min(10000, evolution)));
          return chroma.mix(chromaColor, tempColor, 0.35, 'lch').hex();

        case 'bezier_interpolation':
          // Create smooth color transitions through color space
          if (this.palette.length < 2) {
            return color; // Fallback if palette is insufficient
          }
          const anchor1 = this.palette[this.chance.integer({ min: 0, max: this.palette.length - 1 })];
          const anchor2 = this.palette[this.chance.integer({ min: 0, max: this.palette.length - 1 })];
          const bezierFunc = chroma.bezier([chromaColor, anchor1, anchor2]);
          const t = this.chance.floating({ min: 0.2, max: 0.8 });
          return bezierFunc(t).hex();

        default:
          return color;
      }
    } catch (error) {
      return color;
    }
  }

  // Convert wavelength to RGB (simplified but mathematically accurate)
  wavelengthToRGB(wavelength) {
    let r = 0, g = 0, b = 0;
    
    if (wavelength >= 380 && wavelength < 440) {
      r = -1 * (wavelength - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
      r = 0;
      g = (wavelength - 440) / (490 - 440);
      b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
      r = 0;
      g = 1;
      b = -1 * (wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1;
      g = -1 * (wavelength - 645) / (645 - 580);
      b = 0;
    } else if (wavelength >= 645 && wavelength <= 780) {
      r = 1;
      g = 0;
      b = 0;
    }

    // Intensity adjustment for edge wavelengths
    let intensity = 1;
    if (wavelength >= 380 && wavelength < 420) {
      intensity = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 700 && wavelength <= 780) {
      intensity = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    }

    return chroma.rgb(r * intensity * 255, g * intensity * 255, b * intensity * 255);
  }

  // Simplified chromatic adaptation
  chromaticAdaptation(color, targetTemp) {
    const sourceTemp = this.rgbToTemperature(color);
    const ratio = targetTemp / sourceTemp;
    const [r, g, b] = color.rgb();
    
    return chroma.rgb(
      Math.min(255, r * (ratio > 1 ? Math.sqrt(ratio) : ratio)),
      Math.min(255, g),
      Math.min(255, b * (ratio < 1 ? Math.sqrt(1/ratio) : 1/ratio))
    );
  }

  // Approximate RGB to color temperature
  rgbToTemperature(color) {
    const [r, g, b] = color.rgb();
    // Simplified approximation - not scientifically accurate but visually effective
    const intensity = (r + g + b) / 3;
    const colorTemp = r > b ? 
      2000 + (r / 255) * 4000 :  // Warmer colors
      4000 + (b / 255) * 4000;   // Cooler colors
    return colorTemp;
  }
}

// Factory function for easy use
function createColorOrchestrator(seed) {
  return new ColorOrchestrator(seed);
}

// Enhanced glitch function that uses the orchestrator
function sophisticatedColorGlitch(baseColor, seed, likelihood = 15) {
  const chance = new Chance(seed);
  
  if (!chance.bool({ likelihood })) {
    return baseColor;
  }

  const orchestrator = new ColorOrchestrator(seed);
  const intensity = chance.pickone(['subtle', 'moderate', 'bold']);
  
  return orchestrator.getEnhancedColor(baseColor, intensity);
}

module.exports = { 
  ColorOrchestrator, 
  createColorOrchestrator, 
  sophisticatedColorGlitch 
};