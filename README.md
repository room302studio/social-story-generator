# Room 302 Studio Social Media Generator v2.0 ✨

An absolutely unhinged Instagram story generator that turns philosophy into viral content using SVG templates, organic glitch effects, and mathematical art systems that hit different.

## 🎯 What It Does

Generates Instagram-ready content that actually slaps from 269 curated Room 302 Studio quotes. Takes our best philosophical hot takes about hacking, prototyping, neurodivergent genius energy, and creative chaos, then renders them across 2 clean templates with:

- **Organic Glitch Effects**: Chromatic aberration, pixel sorting, data corruption, scanlines, interlacing with Perlin noise masking
- **1px Constellation Stars**: Mathematically perfect tiny dots in 6 unique pattern types (0.25px radius = true 1px diameter)
- **Seeded Randomness**: Deterministic art generation using Chance.js for reproducible results
- **Production Architecture**: Modular lib/ structure with Winston logging and comprehensive error handling
- **Advanced Color Theory**: Mathematical color harmonies (triadic, tetradic, split-complementary)

Creates **1076+ unique assets** (2 formats × 269 quotes × 2 variants) that will make your followers stop scrolling.

## ⚡ Quick Start

```bash
npm install
node generate.js           # Full production run (1076 assets)
node generate.js --test    # Quick test (10 assets)
```

Your content drops into the `./stories/` folder ready to post and watch the engagement go brrrr.

## 🎨 Features v2.0

### 🔥 **New in v2.0 (Session Complete)**
- **Dramatic Glitch Effects**: Chromatic aberration, pixel sorting, data corruption, scanlines, interlacing, noise injection, mirror effects
- **Proper 1px Stars**: 0.25 radius constellation dots for perfect tiny stars (finally fixed!)
- **Big Perlin Noise**: Organic masking patterns with corrected scale ranges (smaller values = bigger patterns)
- **Seeded Glitch Systems**: All effects use Chance.js for deterministic, reproducible randomness
- **Test Mode**: `--test` flag generates 10 images for rapid iteration vs full 1076 production run
- **Senior Dev Architecture**: Professional lib/ structure with Winston logging, JSDoc, and comprehensive error handling
- **Advanced Color Mathematics**: ColorOrchestrator class with triadic, tetradic, split-complementary harmonies
- **Shared Perlin Noise**: Visual correlation between effects using shared noise masking
- **Template Format Detection**: Automatic square vs story format detection with proper font scaling

### 🎯 **Core Features**
- **Smart Text System**: Proper title/body from quotes.yaml with preserved font sizing
- **Format Detection**: Automatically exports square (1080x1080) vs story (1080x1920) formats  
- **Advanced Text Wrapping**: Multi-line tspan generation with proper line heights
- **6 Constellation Types**: Simple dots, golden spiral, scatter, lines, clusters, arcs
- **Mathematical Precision**: Golden ratio positioning and design grid alignment
- **Dual Variants**: Clean + glitch version of every image (1076 total assets)
- **Production Ready**: Batch processing with progress tracking and error recovery

## 📁 Structure v2.0 (Production Ready)

```
├── generate.js          # Main orchestration script (complete v2.0 rewrite)
├── lib/                 # Modular architecture with senior dev practices
│   ├── pixel-glitch.js  # Complete glitch suite: chromatic aberration, pixel sorting, data corruption, etc.
│   ├── constellation.js # 6 constellation types with proper 1px stars (0.25 radius)
│   ├── design-system.js # Typography, colors, golden ratio constants
│   ├── advanced-color-system.js # Mathematical color theory with ColorOrchestrator
│   └── utils.js         # Shared utilities, parsers, and Perlin noise functions
├── quotes.yaml          # 269 curated quotes with proper title/body structure
├── social-01.svg        # Story format template (1080x1920) - fixed text replacement
├── social-05.svg        # Square format template (1080x1080) - fixed font scaling
├── stories/             # Generated PNG images (production: 1076 assets)
├── svg-exports/         # After Effects-ready SVG files (--ae flag)
├── node_modules/        # Dependencies: chance, sharp, jsdom, winston, compromise, glitch-canvas
└── package.json         # Project configuration and scripts
```

## 🧠 Quote Categories That Actually Hit

The quotes span 16 themes that capture the full Room 302 Studio energy:

- **Neurodivergent Genius** - "Our brains just hit different and that's the whole point"
- **Hacker Philosophy** - "Every system has cheat codes. Your job is finding them"
- **Rapid Prototyping** - "Ship it messy, patch it live, glow up forever"
- **Creative Process** - "Make it work first, make it pretty later"
- **Building in Public** - "Post your ugly drafts. Vulnerability is the vibe"
- **Core Philosophy** - "Give credit, take blame. Period"
- **Crow Wisdom** - "Under digital skies, corvids dance with untold tales"
- **Creative Amplification** - "Humans + AI = creativity that absolutely sends"

## 🛠 How It Works (Production Pipeline)

1. **Parse Quotes**: Loads structured quotes from YAML with proper title/body separation
2. **Template Processing**: Uses JSDOM to manipulate SVG text elements with fixed text replacement logic
3. **Smart Text Distribution**: Distributes words across existing tspan elements for perfect wrapping
4. **Template Format Detection**: Early detection of square vs story format for proper font scaling
5. **Procedural Art Generation**: Creates unique constellations using seeded Chance.js (6 pattern types)
6. **Mathematical Positioning**: Golden ratio and baseline grid alignment for invisible precision
7. **Advanced Color Theory**: ColorOrchestrator generates mathematical color harmonies
8. **Organic Glitch Effects**: Full suite including chromatic aberration, pixel sorting, data corruption
9. **Shared Perlin Noise**: Visual correlation between effects using shared noise masking
10. **NLP Processing**: Uses compromise.js to identify key words for intelligent star formation
11. **Format Detection**: Reads viewBox to determine export dimensions (square vs story)
12. **High-Quality Export**: Sharp.js for production-ready PNG rendering at Instagram dimensions

### Advanced Features (v2.0 Complete)

- **`--test` flag**: Rapid iteration mode (10 images vs full 1076 production run)
- **`--ae` flag**: Exports clean SVG files for After Effects motion graphics
- **Deterministic Randomness**: Same quote always generates identical constellation (seeded Chance.js)
- **Perlin Noise Masking**: Organic glitch patterns with corrected scale ranges
- **Template Format Detection**: Automatic square vs story detection with proper font preservation
- **Error Recovery**: Comprehensive error handling with Winston logging
- **Buffer Validation**: Safe glitch-canvas integration with proper buffer type checking
- **Senior Dev Practices**: JSDoc documentation, modular architecture, professional logging

## 🎭 Design Philosophy

Inspired by the 2011 visual.ly technique of using D3 and Illustrator groups, but modernized for batch processing. The approach prioritizes:

- **Minimal Code**: As little code as possible
- **Elegant Solutions**: Simple text replacement over complex DOM manipulation
- **Batch Efficiency**: Generate hundreds of images quickly
- **Design Consistency**: Templates maintain visual brand coherence

## 🚀 Room 302 Studio Ethos

This tool embodies our core beliefs:
- Hacker-prototyping approach to creative problems
- Celebrating neurodivergent thinking and hyperfocus
- Building tools that center joy and kindness
- Working in public and sharing generously
- Making advanced tech accessible to everyone

## 🚀 Session Complete - Production Ready!

**All v2.0 goals achieved:**
- ✅ Organic glitch effects with Perlin noise masking
- ✅ True 1px constellation stars (0.25 radius)
- ✅ Seeded Chance.js for deterministic randomness  
- ✅ Advanced color theory with mathematical harmonies
- ✅ Senior dev architecture with modular lib/ structure
- ✅ Comprehensive error handling and Winston logging
- ✅ Fixed template format detection and font scaling
- ✅ Production pipeline generating 1076 unique assets
- ✅ Git workflow with detailed documentation

**Run Commands:**
```bash
node generate.js --test    # Quick test (10 images)
node generate.js           # Full production (1076 assets)
```

---

*Built with joy at Room 302 Studio - where different minds create different solutions* ✨

*v2.0 Production Release - Session Complete 🎉*