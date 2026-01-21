# Live Preview Rich Text Formatting Options

## Current State
The live preview currently shows plain text with basic heading replacements. Questions are bolded, answers are plain paragraphs.

## Design Option 1: **Professional Document Style** 📄

**Concept:** Business plan document with clear typography hierarchy

**Features:**
- **Section Headers**: Large, bold, with accent underline (orange line)
- **Question Styling**: Medium-weight font, dark blue color, with question number badge
- **Answer Formatting**: 
  - Paragraphs with proper spacing (1.7 line-height)
  - Bullet points automatically detected and styled
  - Numbered lists with proper indentation
  - Bold/italic text support
  - Key terms highlighted
- **Visual Hierarchy**: Clear spacing between Q&A pairs
- **Typography**: Serif font for body text (professional feel)

**Visual Structure:**
```
┌─────────────────────────────────┐
│ Identity & Vision               │ ← Section Header (Large, Bold, Orange Underline)
├─────────────────────────────────┤
│ [1] What is the legal name...?  │ ← Question Badge + Text
│                                 │
│ Sqordia Inc. is incorporated... │ ← Answer (Well-spaced paragraphs)
│                                 │
│ • Class A common shares          │ ← Bullet points styled
│ • Class B preferred shares      │
└─────────────────────────────────┘
```

**Pros:**
- Professional, document-like appearance
- Clear visual hierarchy
- Easy to scan
- Familiar format

**Cons:**
- More traditional, less modern
- Takes more vertical space

---

## Design Option 2: **Card-Based Q&A Layout** 🎴

**Concept:** Each question-answer pair in its own card

**Features:**
- **Question Cards**: Elevated card with question number, icon, and question text
- **Answer Cards**: Separate card below with formatted answer
- **Rich Formatting**:
  - Paragraphs with proper spacing
  - Lists with custom bullet styles
  - Highlighted key phrases
  - Blockquotes for important statements
- **Visual Separation**: Clear distinction between questions
- **Interactive**: Cards can expand/collapse

**Visual Structure:**
```
┌─────────────────────────────────┐
│ [1] 📋 What is the legal name?  │ ← Question Card
│     Required                    │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Sqordia Inc. is incorporated... │ ← Answer Card
│                                 │
│ Key Points:                     │
│ • Class A shares                │
│ • Class B shares                │
└─────────────────────────────────┘
```

**Pros:**
- Modern, clean design
- Easy to scan individual Q&A pairs
- Can add expand/collapse
- Mobile-friendly

**Cons:**
- More vertical space
- Might feel fragmented

---

## Design Option 3: **Magazine-Style Layout** 📰

**Concept:** Editorial-style formatting with columns and visual elements

**Features:**
- **Section Header**: Large, magazine-style header with decorative elements
- **Question Styling**: Small caps, letter-spaced, with decorative line
- **Answer Formatting**:
  - Multi-column layout for longer answers
  - Drop caps for first paragraph
  - Pull quotes for key statements
  - Sidebar callouts for important info
  - Rich typography with varying font sizes
- **Visual Elements**: Decorative dividers, icons, visual hierarchy

**Visual Structure:**
```
┌─────────────────────────────────┐
│ IDENTITY & VISION               │ ← Magazine Header
│ ─────────────────────────────── │
│                                 │
│ Q1: What is the legal name?    │ ← Styled Question
│ ─────────────────────────────── │
│                                 │
│ S qordia Inc. is incorporated  │ ← Drop Cap + Columns
│ as a Canadian Federal...        │
│                                 │
│ ┌─────────────────────────┐    │
│ │ Key Point:              │    │ ← Pull Quote
│ │ Class A & B shares      │    │
│ └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Pros:**
- Visually engaging
- Professional editorial feel
- Great for longer content
- Stands out

**Cons:**
- More complex layout
- May not suit all content types
- Requires more CSS

---

## Design Option 4: **Minimalist Typography-Focused** ✨

**Concept:** Clean, typography-first design with subtle formatting

**Features:**
- **Section Header**: Large, minimal, with subtle color accent
- **Question Styling**: Medium weight, with subtle background highlight
- **Answer Formatting**:
  - Clean paragraphs with optimal line length
  - Subtle list styling (minimal bullets)
  - Emphasis through font weight, not color
  - Proper spacing and rhythm
- **Typography**: Sans-serif, clean, modern
- **Color Usage**: Minimal, mostly grayscale with orange accents

**Visual Structure:**
```
Identity & Vision
─────────────────

What is the legal name and business structure?

Sqordia Inc. is incorporated as a Canadian Federal
Corporation under the Canada Business Corporations Act
(CBCA). The company operates as a technology startup
with a standard share structure.

The corporate structure includes:
  • Class A common shares allocated to founders
  • Class B preferred shares reserved for future rounds
```

**Pros:**
- Very clean and modern
- Focuses on readability
- Less visual clutter
- Fast to render

**Cons:**
- Might feel too minimal
- Less visual interest
- Harder to distinguish sections

---

## Design Option 5: **Interactive Rich Text Editor Preview** 📝

**Concept:** Preview that looks like a rich text editor with formatting visible

**Features:**
- **Toolbar**: Shows formatting options (even if read-only)
- **Question Formatting**: 
  - Question number in badge
  - Question text with formatting toolbar
  - Help text in collapsible section
- **Answer Formatting**:
  - Rich text with visible formatting
  - Bold, italic, lists all styled
  - Inline formatting indicators
  - Word count, character count
- **Editor Feel**: Looks like Google Docs or Notion

**Visual Structure:**
```
┌─────────────────────────────────┐
│ [B] [I] [U] [•] [1] [Link]      │ ← Formatting Toolbar
├─────────────────────────────────┤
│ [1] What is the legal name?    │
│                                 │
│ Sqordia Inc. is incorporated    │ ← Rich formatted text
│ as a Canadian Federal...        │
│                                 │
│ • Class A shares                 │ ← Formatted lists
│ • Class B shares                │
└─────────────────────────────────┘
```

**Pros:**
- Familiar editor interface
- Shows formatting clearly
- Professional appearance
- Can add editing later

**Cons:**
- Toolbar takes space
- Might be overkill for preview
- More complex implementation

---

## Recommendation

**Option 1 (Professional Document Style)** is recommended because:
- ✅ Matches business plan expectations
- ✅ Clear hierarchy and readability
- ✅ Professional fintech aesthetic
- ✅ Works well with BDC/PME MTL standards
- ✅ Easy to implement with Tailwind prose classes

**Option 2 (Card-Based)** is a close second for:
- ✅ Modern, clean design
- ✅ Great mobile experience
- ✅ Easy to scan

Would you like me to implement one of these, or create a hybrid combining elements from multiple options?
