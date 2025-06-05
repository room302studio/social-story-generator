const fs = require("fs");
const yaml = require("yaml");

// 🧮 UTILITY FUNCTIONS
const phi = 1.618034;
const tau = Math.PI * 2;

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0x7fffffff;
  }
  return Math.abs(hash);
}

function parseQuotes(filePaths) {
  const allQuotes = [];
  
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const data = yaml.parse(content);
      
      const quotes = data.quotes.flatMap(section => 
        section.items.map(quote => ({
          title: quote.title,
          text: quote.text,
          category: section.category,
          slug: quote.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30),
          source: filePath
        }))
      );
      
      allQuotes.push(...quotes);
    }
  });
  
  return allQuotes;
}

module.exports = { phi, tau, hashString, parseQuotes };