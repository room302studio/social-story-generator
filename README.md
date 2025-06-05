# Room 302 Studio Social Media Generator

An elegant Instagram story generator that transforms quotes into beautiful social media content using SVG templates and modern web technologies.

## 🎯 What It Does

Generates Instagram-ready images (stories and posts) from a curated collection of Room 302 Studio quotes. Takes 116 philosophical quotes about hacking, prototyping, neurodivergent thinking, and creative process, then renders them across 2 SVG templates to create 232 unique social media images.

## ⚡ Quick Start

```bash
npm install
node generate.js
```

That's it! Your social media content will be in the `./stories/` folder.

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

## 🧠 Quote Categories

The quotes span 8 core themes that define the Room 302 Studio ethos:

- **Neurodivergent Genius** - "Different minds see different solutions"
- **Hacker Philosophy** - "Break it open, see how it works, make it better"
- **Rapid Prototyping** - "Fail fast, learn faster, iterate fastest"
- **Creative Process** - "Creativity is messy. Clean up later"
- **Flow State & Focus** - "Three hours of flow beats eight hours of meetings"
- **Unconventional Wisdom** - "Use the wrong tool for the job. Discover new possibilities"
- **Building in Public** - "Show your work, even when it's ugly"
- **Core Philosophy** - "Give credit, take blame"

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