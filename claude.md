# Instagram Story Maker - Technical Plan

## Overview
Create an elegant batch IG story generator that processes all Room 302 Studio quotes through SVG templates. Similar to the 2011 visual.ly technique using d3.js and Illustrator groups, but modernized as a Node.js script that outputs a folder of ready-to-post images.

## Architecture

### Core Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Quote Parser  │────│  Template Engine │────│  Export Engine  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ quotes.md file  │    │   SVG Templates  │    │   PNG/SVG out   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Template Analysis

### Current SVG Templates
1. **social-01.svg** (Story format - 108x192)
   - Long-form quote layout with title + body text
   - IBM Plex Sans Light body, Bold title
   - Target elements: title text, body text spans

2. **social-02.svg** (Story format - 108x192) 
   - Dense text layout with orange background
   - Complex multi-span text structure
   - Target elements: title text, body paragraph spans

3. **social-03.svg** (Story format - 108x192)
   - Dark theme with "Give credit, take blame" styled text
   - Vector text elements for clean scaling
   - Target elements: path text elements

4. **social-04.svg** (Story format - 108x192)
   - Minimal/empty template - perfect for custom designs
   - Could be populated with large quote + minimal styling

5. **social-05.svg** (Square format - 108x108)
   - Compact quote format for square posts
   - Simple text layout
   - Target elements: multi-line text spans

## Implementation Strategy

### Phase 1: Core Functionality (MVP)
```javascript
// generate-stories.js - Single script, batch processing
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const sharp = require('sharp'); // For high-quality PNG export

async function main() {
  console.log('📚 Parsing quotes...');
  const quotes = await parseQuotes('./quotes.md');
  
  console.log('🎨 Loading templates...');
  const templates = await loadTemplates('./');
  
  console.log('🚀 Generating stories...');
  await generateAllStories(quotes, templates);
  
  console.log('✅ Done! Check ./output/ folder');
}

async function parseQuotes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sections = content.split('##').slice(1);
  
  const allQuotes = [];
  sections.forEach(section => {
    const lines = section.split('\n').filter(Boolean);
    const category = lines[0].trim();
    const quotes = lines.slice(1).map(line => 
      line.replace(/^\d+\.\s*/, '').replace(/"/g, '').trim()
    ).filter(Boolean);
    
    quotes.forEach(quote => {
      allQuotes.push({ text: quote, category, slug: slugify(quote) });
    });
  });
  
  return allQuotes;
}

async function loadTemplates(dir) {
  const svgFiles = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  return svgFiles.map(file => ({
    name: file.replace('.svg', ''),
    content: fs.readFileSync(path.join(dir, file), 'utf8')
  }));
}

async function generateAllStories(quotes, templates) {
  if (!fs.existsSync('./output')) fs.mkdirSync('./output');
  
  let count = 0;
  for (const quote of quotes) {
    for (const template of templates) {
      const svg = populateTemplate(template.content, quote.text);
      const filename = `${template.name}_${quote.slug.slice(0,20)}_${count++}.png`;
      
      await svgToPNG(svg, `./output/${filename}`);
      process.stdout.write(`\r🎬 Generated ${count} images...`);
    }
  }
  console.log(`\n📊 Total: ${count} images created`);
}

function populateTemplate(svgContent, quoteText) {
  const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
  const doc = dom.window.document;
  
  // Strategy 1: Replace Lorem ipsum text
  const textElements = doc.querySelectorAll('text, tspan');
  textElements.forEach(el => {
    if (el.textContent.includes('Lorem ipsum')) {
      el.textContent = quoteText;
    }
  });
  
  return dom.serialize();
}

async function svgToPNG(svgContent, outputPath) {
  // Convert SVG to high-res PNG (Instagram story: 1080x1920)
  await sharp(Buffer.from(svgContent))
    .resize(1080, 1920)
    .png({ quality: 100 })
    .toFile(outputPath);
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

main().catch(console.error);
```

**Usage:**
```bash
npm install jsdom sharp
node generate-stories.js
# → outputs 300 images (60 quotes × 5 templates) to ./output/
```

### Phase 2: Enhanced Features
- Quote categorization and filtering
- Template-quote smart matching
- Real-time preview
- Multiple export formats
- Keyboard shortcuts for rapid iteration

### Phase 3: Advanced Features  
- Custom text styling
- Color scheme variations
- Font loading and swapping
- Batch generation
- Social media API integration

## Technical Implementation

### Quote Processing
```javascript
// Parse quotes.md structure
const parseQuotes = (markdownContent) => {
  const sections = markdownContent.split('##').slice(1);
  return sections.map(section => {
    const [title, ...quotes] = section.split('\n').filter(Boolean);
    return {
      category: title.trim(),
      quotes: quotes.map(q => q.replace(/^\d+\.\s*/, '').replace(/"/g, ''))
    };
  });
};
```

### SVG Template Engine
```javascript
// Smart text replacement based on template structure
const populateTemplate = (svgContent, quote) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  
  // Strategy 1: Replace "Lorem ipsum" placeholder text
  const textElements = doc.querySelectorAll('text, tspan');
  textElements.forEach(el => {
    if (el.textContent.includes('Lorem ipsum')) {
      el.textContent = quote;
    }
  });
  
  // Strategy 2: Target specific classes/IDs for quote content
  const quoteElement = doc.querySelector('.quote-text, #main-quote');
  if (quoteElement) {
    quoteElement.textContent = quote;
  }
  
  return new XMLSerializer().serializeToString(doc);
};
```

### Export Engine
```javascript
// Convert SVG to high-quality PNG
const exportToPNG = (svgElement, scale = 4) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  // Instagram Story dimensions: 1080x1920
  canvas.width = 1080;
  canvas.height = 1920;
  
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      const link = document.createElement('a');
      link.download = 'story.png';
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  };
  
  img.src = url;
};
```

## UI/UX Design

### Minimal Interface
```
┌─────────────────────────────────────────────────┐
│  Room 302 Story Maker                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌───────────────────────────┐ │
│  │             │  │ "Give credit, take blame"  │ │
│  │   Template  │  │                           │ │
│  │   Preview   │  │ Category: Core Philosophy │ │
│  │             │  │                           │ │
│  │             │  │ ← Previous    Next →      │ │
│  └─────────────┘  └───────────────────────────┘ │
│                                                 │
│  Templates: ○ ○ ● ○ ○                          │
│                                                 │
│  [Generate Random] [Export PNG] [Export SVG]    │
└─────────────────────────────────────────────────┘
```

### Keyboard Shortcuts
- `Space`: Next quote
- `Shift+Space`: Previous quote  
- `T`: Next template
- `Shift+T`: Previous template
- `E`: Export
- `R`: Random combination

## File Structure
```
/
├── index.html              # Main interface
├── js/
│   ├── story-maker.js       # Core functionality
│   ├── quote-parser.js      # Markdown processing
│   ├── template-engine.js   # SVG manipulation  
│   └── export-utils.js      # Download/export
├── css/
│   └── styles.css          # Minimal styling
├── templates/              # SVG templates
│   ├── social-01.svg
│   ├── social-02.svg
│   ├── social-03.svg
│   ├── social-04.svg
│   └── social-05.svg
└── data/
    └── quotes.md           # Quote source
```

## Development Approach

### Start Simple
1. **Svelte SPA** - Minimal build step, reactive updates
2. **Single component prototype** - Prove the concept in <100 lines
3. **Local file loading** - Use fetch() for quotes.md and SVGs
4. **Manual text replacement** - Simple string manipulation first

### Iterate Rapidly  
1. Add template cycling
2. Add quote categorization
3. Add export functionality
4. Polish UI/animations
5. Add advanced features

## Technical Considerations

### Font Loading
- Ensure IBM Plex Sans loads properly
- Consider web font fallbacks
- Handle font rendering in exported images

### SVG Scaling
- Maintain crisp vector graphics
- Handle different viewBox dimensions
- Scale appropriately for Instagram (1080x1920)

### Text Fitting
- Implement text wrapping for long quotes
- Adjust font sizes dynamically
- Handle overflow gracefully

### Performance
- Lazy load templates
- Cache parsed quotes
- Optimize SVG manipulation

## Success Metrics

### MVP Success
- [ ] Load all 5 templates
- [ ] Parse all 60 quotes
- [ ] Generate template+quote combinations
- [ ] Export to PNG format
- [ ] Works offline

### Enhanced Success  
- [ ] Smart quote-template matching
- [ ] Smooth transitions between combinations
- [ ] High-quality exports (Instagram-ready)
- [ ] Keyboard shortcuts working
- [ ] Responsive design

## Future Extensions

### Content Management
- Add new templates via drag-drop
- Edit quotes in-app
- Import quotes from other sources

### Customization
- Color scheme editor
- Typography controls
- Layout adjustments

### Integration
- Direct Instagram posting
- Batch generation
- Brand guideline enforcement
- Team collaboration features

## Why This Approach Works

1. **Leverages existing assets** - Your SVG templates are perfect
2. **Minimal dependencies** - Can be built with vanilla JS
3. **Rapid iteration** - Easy to test different quote/template combos
4. **High quality output** - Vector-based, scales perfectly
5. **Extensible** - Easy to add new templates and features

This builds on the same principles you used in 2011 but with modern web APIs and better SVG support. The key insight is treating the SVG templates as data structures that can be programmatically populated, just like Illustrator groups.