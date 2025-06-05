#!/usr/bin/env node

const fs = require('fs');
const sharp = require('sharp');
const { JSDOM } = require('jsdom');
const yaml = require('yaml');

function parseQuotes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.parse(content);
  
  const allQuotes = [];
  data.quotes.forEach(section => {
    section.items.forEach(quote => {
      allQuotes.push({
        title: quote.title,
        text: quote.text,
        category: section.category,
        slug: quote.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
      });
    });
  });
  
  return allQuotes;
}

function wrapText(text, maxWidth, fontSize = 12) {
  // Simple word wrapping - split into lines that fit maxWidth
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  const estimatedCharWidth = fontSize * 0.6; // Rough estimate
  const maxCharsPerLine = Math.floor(maxWidth / estimatedCharWidth);
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

function populateTemplate(svgContent, quote) {
  const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
  const doc = dom.window.document;
  
  // Find all text elements that contain Lorem ipsum
  const textElements = doc.querySelectorAll('text');
  
  for (const textEl of textElements) {
    const tspans = textEl.querySelectorAll('tspan');
    
    // Look for the main content block (has Lorem ipsum and multiple tspans)
    if (tspans.length > 3 && textEl.textContent.includes('Lorem ipsum')) {
      
      const words = quote.text.split(' ');
      const wordsPerLine = Math.ceil(words.length / Math.min(tspans.length, 4));
      
      let wordIndex = 0;
      
      // Distribute words across existing tspans
      for (let i = 0; i < tspans.length && wordIndex < words.length; i++) {
        const lineWords = words.slice(wordIndex, wordIndex + wordsPerLine);
        tspans[i].textContent = lineWords.join(' ');
        wordIndex += wordsPerLine;
      }
      
      // Clear remaining tspans
      for (let i = Math.ceil(words.length / wordsPerLine); i < tspans.length; i++) {
        tspans[i].textContent = '';
      }
    }
    
    // Handle simple single-tspan titles - use the quote title
    else if (tspans.length <= 2 && textEl.textContent.includes('Lorem ipsum')) {
      tspans[0].textContent = quote.title;
    }
  }
  
  return dom.serialize();
}

async function main() {
  console.log('🧹 Cleaning up...');
  if (fs.existsSync('./stories')) {
    fs.rmSync('./stories', { recursive: true });
  }
  fs.mkdirSync('./stories');
  
  console.log('📚 Parsing quotes...');
  const quotes = parseQuotes('./quotes.yaml');
  
  console.log('🎨 Loading templates...');
  const templates = ['social-01.svg', 'social-05.svg'] // Skip 02 (complex spacing), 03 (static vector text), 04 (complex)
    .map(file => ({
      name: file.replace('.svg', ''),
      content: fs.readFileSync(file, 'utf8')
    }));
  
  console.log(`✅ ${quotes.length} quotes, ${templates.length} templates`);
  
  console.log('🚀 Generating stories...');
  let count = 0;
  
  // Generate all quotes with working templates!
  for (let i = 0; i < quotes.length; i++) {
    const quote = quotes[i];
    
    for (const template of templates) {
      try {
        const svg = populateTemplate(template.content, quote);
        const filename = `${template.name}_${quote.slug}.png`;
        
        // Detect format and resize accordingly
        const isSquare = svg.includes('viewBox="0 0 108 108"');
        const width = isSquare ? 1080 : 1080;
        const height = isSquare ? 1080 : 1920;
        
        await sharp(Buffer.from(svg))
          .resize(width, height)
          .png({ quality: 100 })
          .toFile(`./stories/${filename}`);
        
        console.log(`✅ ${filename}`);
        count++;
      } catch (error) {
        console.log(`❌ Failed: ${template.name} - ${error.message}`);
      }
    }
  }
  
  console.log(`🎉 ${count} stories generated in ./stories/`);
}

if (require.main === module) {
  main().catch(console.error);
}