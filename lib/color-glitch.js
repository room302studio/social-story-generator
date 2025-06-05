const chroma = require("chroma-js");
const Chance = require("chance");

// 🌈 ADVANCED COLOR SCIENCE GLITCH SYSTEM
function glitchColor(baseColor, seed, likelihood = 25) {
  const chance = new Chance(seed);
  
  if (!chance.bool({ likelihood })) {
    return baseColor;
  }
  
  try {
    const color = chroma(baseColor);
    const glitchType = chance.integer({ min: 1, max: 12 });
    
    switch (glitchType) {
      case 1: // LAB SPACE DISTORTION - impossible colors
        const [l, a, b] = color.lab();
        return chroma.lab(
          l + chance.floating({ min: -30, max: 30 }),
          a + chance.floating({ min: -40, max: 40 }), // Green-red axis
          b + chance.floating({ min: -40, max: 40 })  // Blue-yellow axis
        ).hex();
        
      case 2: // LCH CHROMA EXPLOSION - pure saturation science
        const [lch_l, lch_c, lch_h] = color.lch();
        return chroma.lch(
          lch_l,
          Math.min(130, lch_c * chance.floating({ min: 2, max: 5 })), // Impossible saturation
          lch_h + chance.floating({ min: -20, max: 20 })
        ).hex();
        
      case 3: // OKLAB MODERN PERCEPTUAL SHIFT - human vision hacking
        const [ok_l, ok_a, ok_b] = color.oklab();
        return chroma.oklab(
          Math.max(0, Math.min(1, ok_l + chance.floating({ min: -0.3, max: 0.3 }))),
          ok_a + chance.floating({ min: -0.2, max: 0.2 }),
          ok_b + chance.floating({ min: -0.2, max: 0.2 })
        ).hex();
        
      case 4: // CUBEHELIX ROTATION - scientific color spirals
        const start = chance.floating({ min: 0, max: 2 });
        const rotations = chance.floating({ min: -2, max: 2 });
        const gamma = chance.floating({ min: 0.5, max: 2 });
        return chroma.cubehelix(start, rotations, gamma, 0.5).hex();
        
      case 5: // TEMPERATURE SHIFT - blackbody radiation simulation
        const temp = chance.integer({ min: 2000, max: 10000 }); // Kelvin temperature
        return chroma.temperature(temp).hex();
        
      case 6: // BEZIER INTERPOLATION CHAOS - curved color space paths
        const color1 = chroma.random();
        const color2 = chroma.random();
        const t = chance.floating({ min: 0, max: 1 });
        return chroma.bezier([color, color1, color2])(t).hex();
        
      case 7: // DELTA E NEIGHBOR - perceptually similar but wrong
        const [ref_l, ref_a, ref_b] = color.lab();
        // Find a color that's perceptually close but visually different
        return chroma.lab(
          ref_l + chance.floating({ min: -5, max: 5 }),
          ref_a + chance.floating({ min: -10, max: 10 }),
          ref_b + chance.floating({ min: -10, max: 10 })
        ).hex();
        
      case 8: // CHROMATIC ADAPTATION - simulate different light sources
        const illuminant = chance.pickone(['d50', 'd65', 'a', 'c', 'e']);
        // Simulate how the color would look under different lighting
        const [x, y, z] = color.xyz();
        return chroma.xyz(
          x * chance.floating({ min: 0.8, max: 1.2 }),
          y * chance.floating({ min: 0.9, max: 1.1 }),
          z * chance.floating({ min: 0.7, max: 1.3 })
        ).hex();
        
      case 9: // CONTRAST RATIO MANIPULATION - accessibility math gone wrong
        const contrastTarget = chance.floating({ min: 0.1, max: 21 });
        const white = chroma('#ffffff');
        // Calculate what luminance would give us this contrast ratio
        const targetLum = (white.luminance() + 0.05) / contrastTarget - 0.05;
        return chroma.hsl(color.hsl()[0], color.hsl()[1], targetLum).hex();
        
      case 10: // SPECTRAL WAVELENGTH MAPPING - pure light frequencies
        const wavelength = chance.integer({ min: 380, max: 750 }); // Visible spectrum
        // Map wavelength to RGB (simplified)
        let r = 0, g = 0, b = 0;
        if (wavelength < 440) {
          r = (440 - wavelength) / (440 - 380);
          b = 1;
        } else if (wavelength < 490) {
          g = (wavelength - 440) / (490 - 440);
          b = 1;
        } else if (wavelength < 510) {
          g = 1;
          b = (510 - wavelength) / (510 - 490);
        } else if (wavelength < 580) {
          r = (wavelength - 510) / (580 - 510);
          g = 1;
        } else if (wavelength < 645) {
          r = 1;
          g = (645 - wavelength) / (645 - 580);
        } else {
          r = 1;
        }
        return chroma.rgb(r * 255, g * 255, b * 255).hex();
        
      case 11: // CMYK SEPARATION GLITCH - printing press errors
        const [c, m, y, k] = color.cmyk();
        return chroma.cmyk(
          Math.max(0, Math.min(1, c + chance.floating({ min: -0.3, max: 0.3 }))),
          Math.max(0, Math.min(1, m + chance.floating({ min: -0.3, max: 0.3 }))),
          Math.max(0, Math.min(1, y + chance.floating({ min: -0.3, max: 0.3 }))),
          Math.max(0, Math.min(1, k + chance.floating({ min: -0.2, max: 0.2 })))
        ).hex();
        
      case 12: // HUMAN VISION CONE RESPONSE - simulate color blindness variations
        const [r, g, b] = color.rgb();
        // Simulate L/M/S cone responses with random variations
        const l_response = r * 0.4124 + g * 0.3576 + b * 0.1805;
        const m_response = r * 0.2126 + g * 0.7152 + b * 0.0722;
        const s_response = r * 0.0193 + g * 0.1192 + b * 0.9505;
        
        return chroma.rgb(
          Math.max(0, Math.min(255, l_response * chance.floating({ min: 0.7, max: 1.3 }))),
          Math.max(0, Math.min(255, m_response * chance.floating({ min: 0.8, max: 1.2 }))),
          Math.max(0, Math.min(255, s_response * chance.floating({ min: 0.6, max: 1.4 })))
        ).hex();
        
      default:
        return baseColor;
    }
  } catch (error) {
    return baseColor;
  }
}

module.exports = { glitchColor };