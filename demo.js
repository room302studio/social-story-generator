#!/usr/bin/env node

// Demo script to show toggle functionality
const fs = require('fs');

console.log('🎨 Room 302 Generative Art Demo\n');

// Read current settings
const currentCode = fs.readFileSync('./generate.js', 'utf8');
const constellationsEnabled = currentCode.includes('ENABLE_CONSTELLATIONS = true');
const glitchEnabled = currentCode.includes('ENABLE_GLITCH_EFFECTS = true');

console.log('Current settings:');
console.log(`🌌 Constellations: ${constellationsEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
console.log(`🔧 Glitch Effects: ${glitchEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);

console.log('\n🔧 To toggle features, edit generate.js:');
console.log('   ENABLE_CONSTELLATIONS = true/false');
console.log('   ENABLE_GLITCH_EFFECTS = true/false');

console.log('\n🚀 Then run: node generate.js');
console.log('\n✨ Each quote generates unique procedural patterns based on:');
console.log('   • Word count → star density');
console.log('   • Character count → brightness & connection distance');
console.log('   • Text hash → seeded randomness for consistency');
console.log('   • Quote length → glitch intensity');

console.log('\n🎯 Features are:');
console.log('   • Non-destructive (original templates unchanged)');
console.log('   • Modular (independent toggle switches)');
console.log('   • Subtle (bottom region only, low opacity)');
console.log('   • Deterministic (same quote = same pattern)');
console.log('   • Performance-optimized (minimal processing overhead)');