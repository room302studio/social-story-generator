# Room 302 Studio Social Media Generator v2.0

An absolutely unhinged Instagram story generator that turns philosophy into viral content using SVG templates, organic glitch effects, and mathematical art systems that hit different.

## 🎯 What It Does

Generates Instagram-ready content that actually slaps from 269 curated Room 302 Studio quotes. Takes our best philosophical hot takes about hacking, prototyping, neurodivergent genius energy, and creative chaos, then renders them across 2 clean templates with:

- **Organic Glitch Effects**: Chromatic aberration, pixel sorting, data corruption with Perlin noise masking
- **1px Constellation Stars**: Mathematically perfect tiny dots in 6 unique pattern types  
- **Seeded Randomness**: Deterministic art generation using Chance.js
- **Production Architecture**: Modular lib/ structure with professional error handling

Creates **1076+ unique assets** (2 formats × 269 quotes × 2 variants) that will make your followers stop scrolling.

## ⚡ Quick Start

```bash
npm install
node generate.js           # Full production run (1076 assets)
node generate.js --test    # Quick test (10 assets)
```

Your content drops into the `./stories/` folder ready to post and watch the engagement go brrrr.

## 🎨 Features v2.0

### 🔥 **New in v2.0**
- **Dramatic Glitch Effects**: Chromatic aberration, pixel sorting, data corruption, scanlines, interlacing
- **Proper 1px Stars**: 0.25 radius constellation dots for perfect tiny stars
- **Big Perlin Noise**: Organic masking patterns with proper scale ranges
- **Seeded Glitch Systems**: All effects use Chance.js for reproducible randomness
- **Test Mode**: `--test` flag generates 10 images for rapid iteration
- **Modular Architecture**: Professional lib/ structure with error handling

### 🎯 **Core Features**
- **Smart Text System**: Proper title/body from quotes.yaml with preserved font sizing
- **Format Detection**: Automatically exports square (1080x1080) vs story (1080x1920) formats  
- **Advanced Text Wrapping**: Multi-line tspan generation with proper line heights
- **6 Constellation Types**: Simple dots, golden spiral, scatter, lines, clusters, arcs
- **Mathematical Precision**: Golden ratio positioning and design grid alignment
- **Dual Variants**: Clean + glitch version of every image (1076 total assets)
- **Production Ready**: Batch processing with progress tracking and error recovery

## 📁 Structure v2.0

```
├── generate.js          # Main orchestration script (v2.0 rewrite)
├── lib/                 # Modular architecture
│   ├── pixel-glitch.js  # Chromatic aberration, pixel sorting, data corruption
│   ├── constellation.js # 6 types: dots, spiral, scatter, lines, clusters, arcs  
│   ├── design-system.js # Typography, colors, golden ratio constants
│   ├── advanced-color-system.js # Mathematical color theory
│   └── utils.js         # Shared utilities and parsers
├── quotes.yaml          # 269 curated quotes with title/body structure
├── social-01.svg        # Story format template (1080x1920)
├── social-05.svg        # Square format template (1080x1080)
├── stories/             # Generated PNG images (1076 assets)
└── svg-exports/         # After Effects-ready SVG files (--ae flag)
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

## 🛠 How It Works

1. **Parse Quotes**: Loads structured quotes from Markdown with titles and body text
2. **Template Processing**: Uses JSDOM to manipulate SVG text elements
3. **Smart Text Distribution**: Distributes words across existing tspan elements for perfect wrapping
4. **Procedural Art Generation**: Creates unique constellations using Chance.js seeded randomness
5. **Mathematical Positioning**: Golden ratio and baseline grid alignment for invisible precision
6. **NLP Processing**: Uses compromise.js to identify key words for star formation
7. **Rare Effects**: 0.3% chance glitch-canvas effects for subtle digital texture
8. **Format Detection**: Reads viewBox to determine export dimensions
9. **PNG Export**: Uses Sharp for high-quality image rendering

### Advanced Features

- **`--ae` flag**: Exports clean SVG files for After Effects motion graphics
- **Deterministic Randomness**: Same quote always generates same constellation
- **Crypto Steganography**: Hidden coordinate encoding (when enabled)
- **Square Format Enhancements**: Constellation lines connect to text anchor points

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

---

*Built with joy at Room 302 Studio - where different minds create different solutions* ✨