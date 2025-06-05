# Room 302 Studio Social Media Generator

An absolutely unhinged Instagram story generator that turns philosophy into viral content using SVG templates and procedural art that hits different.

## 🎯 What It Does

Generates Instagram-ready content that actually slaps from 156 curated Room 302 Studio quotes. Takes our best philosophical hot takes about hacking, prototyping, neurodivergent genius energy, and creative chaos, then renders them across 2 clean templates with procedural constellation art to create 312 unique posts that will make your followers stop scrolling.

## ⚡ Quick Start

```bash
npm install
node generate.js
```

That's literally it! Your content drops into the `./stories/` folder ready to post and watch the engagement go brrrr.

## 🎨 Features

- **Two-Part Text System**: Each quote has a punchy title and deeper body text
- **Format Detection**: Automatically exports square (1080x1080) vs story (1080x1920) formats
- **Clean YAML Parsing**: Quotes organized by philosophical categories
- **SVG Text Replacement**: Sophisticated text wrapping using existing tspan elements
- **Batch Processing**: Generates hundreds of images in seconds
- **Instagram-Ready**: Perfect sizing for stories and posts

## 📁 Structure

```
├── quotes.yaml          # 116 curated quotes organized by theme
├── social-01.svg        # Story format template (1080x1920)
├── social-05.svg        # Square format template (1080x1080)
├── generate.js          # Main generation script
└── stories/             # Generated PNG images
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

1. **Parse Quotes**: Loads structured quotes from YAML with titles and body text
2. **Template Processing**: Uses JSDOM to manipulate SVG text elements
3. **Smart Text Distribution**: Distributes words across existing tspan elements for perfect wrapping
4. **Format Detection**: Reads viewBox to determine export dimensions
5. **PNG Export**: Uses Sharp for high-quality image rendering

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