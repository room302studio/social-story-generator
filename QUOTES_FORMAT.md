# Quote Format Documentation

This document explains how to format quotes for the Room 302 Studio social media generator.

## 📝 YAML Structure

Quotes are organized in `quotes.yaml` using a structured format that enables both human readability and automated processing.

### Basic Structure

```yaml
quotes:
  - category: "Category Name"
    items:
      - title: "Short Title"
        text: "Full quote text here."
      - title: "Another Title"
        text: "Another inspiring quote."
        
  - category: "Another Category"
    items:
      - title: "Title Here"
        text: "Quote content goes here."
```

## 🎯 Title Guidelines

**Perfect titles are:**
- **2-3 words maximum** (fits in template header)
- **Punchy and memorable** ("Fail Fast", "Deep Work", "Ship Broken")
- **Action-oriented** when possible ("Break to Build", "Think Sideways")
- **Conceptual** rather than descriptive ("Hyperfocus Magic" vs "About Hyperfocus")

**Examples:**
```yaml
- title: "Fail Fast"           # ✅ Perfect
- title: "Deep Work"           # ✅ Perfect  
- title: "Break to Build"      # ✅ Perfect
- title: "Failing Quickly"     # ❌ Too descriptive
- title: "Working Deeply"      # ❌ Too wordy
```

## 💬 Quote Text Guidelines

**Great quote text:**
- **8-15 words ideal** (fits SVG text wrapping)
- **Complete thought** that stands alone
- **Room 302 Studio voice** - philosophical yet practical
- **Actionable wisdom** rather than abstract concepts
- **No quotation marks** (added automatically in display)

**Examples:**
```yaml
- text: "Fail fast, learn faster, iterate fastest."           # ✅ Perfect rhythm
- text: "Different minds see different solutions."            # ✅ Simple wisdom
- text: "Break it open, see how it works, make it better."   # ✅ Action sequence
- text: "We believe that failing quickly is important."      # ❌ Too verbose
- text: "Failure is a learning opportunity."                 # ❌ Too generic
```

## 🏷️ Category Guidelines

**Categories should be:**
- **Thematic clusters** of related concepts
- **4-8 quotes per category** (optimal for organization)
- **Philosophy-focused** names ("Hacker Philosophy" vs "Programming Tips")
- **Inspirational** rather than technical

**Current categories:**
- Core Philosophy & Values
- Neurodivergent Genius
- Hacker Philosophy  
- Rapid Prototyping
- Creative Process
- Flow State & Focus
- Unconventional Wisdom
- Building in Public

## 🤖 AI-Friendly Format

For automated quote generation, provide this exact template:

```yaml
  - category: "New Category Name"
    items:
      - title: "Title One"
        text: "Quote text here."
      - title: "Title Two" 
        text: "Another quote here."
      - title: "Title Three"
        text: "Third quote here."
```

## ✨ Room 302 Studio Voice

Our quotes embody:
- **Hacker curiosity** - "Break it open, see how it works"
- **Neurodivergent celebration** - "What others call obsession, we call thoroughness"
- **Rapid iteration** - "Ship it broken, fix it live, improve it forever"
- **Creative rebellion** - "Use the wrong tool for the job. Discover new possibilities"
- **Generous sharing** - "Give away your secrets. Abundance creates abundance"
- **Vulnerable building** - "Show your work, even when it's ugly"

## 📐 Technical Constraints

- **Title**: Max 20 characters (for SVG fitting)
- **Text**: Max 80 characters (for text wrapping)
- **YAML**: Proper indentation (2 spaces)
- **Encoding**: UTF-8 for special characters
- **Quotes**: No quote marks in YAML (breaks parsing)

## 🎨 Example Perfect Quote

```yaml
- title: "Happy Accidents"
  text: "The best features are bugs that users love."
```

**Why this works:**
- Title: Concise, memorable concept (2 words)
- Text: Complete thought, Room 302 wisdom, perfect length
- Voice: Celebrates the unexpected, hacker mindset
- Actionable: Reframes "bugs" as potential features

## 🚀 Adding New Quotes

1. **Choose a category** (or create new one)
2. **Write 2-3 word title** that captures the essence
3. **Craft 8-15 word quote** in Room 302 voice
4. **Test in generator** to ensure proper rendering
5. **Commit to repository** with descriptive message

Happy quote crafting! ✨