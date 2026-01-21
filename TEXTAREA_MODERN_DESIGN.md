# Modern Textarea Design Proposal for QuestionnairePage

## Design Philosophy
Create sleek, modern textareas that feel premium, provide excellent user feedback, and work beautifully across all devices.

---

## Key Design Improvements

### 1. **Enhanced Visual Design**

#### Textarea Container
- **Floating Label Effect**: Question number or label floats above when focused
- **Smooth Border Transitions**: Animated border color changes on focus
- **Subtle Shadow**: Soft shadow that increases on focus
- **Rounded Corners**: Modern rounded-xl (12px) corners
- **Clean Background**: White in light mode, dark gray in dark mode

#### Focus States
- **Animated Border**: Orange border animates in on focus (2px solid)
- **Focus Ring**: Subtle outer glow (ring-4) in orange tint
- **Background Shift**: Slight background color change on focus
- **Scale Effect**: Minimal scale (1.01) on focus for depth

### 2. **Character Counter Enhancement**

#### Modern Counter Design
- **Floating Badge**: Small rounded badge in bottom-right
- **Color Coding**: 
  - Gray for normal state
  - Orange when approaching limit (if applicable)
  - Red if over limit
- **Smooth Transitions**: Animated number changes
- **Icon Integration**: Optional icon to indicate character count

### 3. **AI Suggestion Integration**

#### Enhanced AI Button
- **Floating Action**: Button positioned elegantly near textarea
- **Pulse Animation**: Subtle pulse when suggestion is available
- **Loading State**: Skeleton or spinner during generation
- **Success Feedback**: Smooth text insertion animation

### 4. **Save Status Indicator**

#### Modern Status Display
- **Toast-Style Badge**: Floating badge showing save status
- **Icon + Text**: Clear visual feedback
- **Auto-Hide**: Fades out after save confirmation
- **Color Coding**: Green for saved, blue for saving

### 5. **Responsive Design**

#### Mobile Optimizations
- **Larger Touch Targets**: Minimum 44px height for all interactive elements
- **Full-Width on Mobile**: Textarea spans full width on small screens
- **Larger Font Size**: 16px minimum to prevent zoom on iOS
- **Optimized Padding**: Comfortable padding for thumb typing

#### Desktop Enhancements
- **Max Width**: Constrain width for optimal reading (max-w-3xl)
- **Comfortable Line Height**: 1.7 for better readability
- **Better Spacing**: More generous padding and margins

### 6. **Advanced Features**

#### Auto-Resize
- **Dynamic Height**: Textarea grows with content (min 150px, max 400px)
- **Smooth Transitions**: Height changes animated
- **Scroll When Needed**: Scrollbar appears only when content exceeds max height

#### Placeholder Enhancement
- **Animated Placeholder**: Subtle fade-in animation
- **Contextual Hints**: Dynamic placeholder based on question type
- **Helper Text**: Additional guidance below textarea when needed

---

## Component Design Specifications

### Modern Textarea Component Structure

```tsx
<div className="relative">
  {/* Floating Label (optional) */}
  {isFocused && (
    <label className="absolute -top-2 left-3 px-2 text-xs font-semibold bg-white dark:bg-gray-800 z-10" style={{ color: momentumOrange }}>
      Question {questionNumber}
    </label>
  )}
  
  {/* Textarea Container */}
  <div className="relative">
    <textarea
      className={`
        w-full px-5 py-4
        rounded-xl border-2
        transition-all duration-200
        resize-none
        focus:outline-none focus:ring-4
        text-base
        ${isFocused 
          ? 'border-orange-400 bg-white dark:bg-gray-900 focus:ring-orange-200 dark:focus:ring-orange-900 shadow-lg' 
          : question.isAnswered
          ? 'border-green-300 dark:border-green-700 bg-gray-50 dark:bg-gray-800'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
        }
      `}
      style={{
        minHeight: '150px',
        maxHeight: '400px',
        fontSize: '16px',
        lineHeight: '1.7',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    />
    
    {/* Character Counter - Floating Badge */}
    <div className={`
      absolute bottom-3 right-3
      px-2.5 py-1
      rounded-full
      text-xs font-medium
      transition-all duration-200
      backdrop-blur-sm
      ${hasAnswer 
        ? 'bg-white/90 dark:bg-gray-800/90 shadow-sm' 
        : 'bg-transparent'
      }
    `}>
      <span className={`
        ${characterCount > 0 
          ? 'text-gray-600 dark:text-gray-400' 
          : 'text-gray-400 dark:text-gray-500'
        }
      `}>
        {characterCount} {characterCount === 1 ? 'character' : 'characters'}
      </span>
    </div>
    
    {/* Save Status Indicator - Top Right */}
    {hasAnswer && (
      <div className={`
        absolute top-3 right-3
        px-3 py-1.5
        rounded-full
        flex items-center gap-1.5
        text-xs font-medium
        shadow-lg
        transition-all duration-300
        ${saving === question.questionId
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
          : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
        }
      `}>
        {saving === question.questionId ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Check size={12} />
            <span>Saved</span>
          </>
        )}
      </div>
    )}
  </div>
  
  {/* Helper Text (if needed) */}
  {question.helpText && (
    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      💡 {question.helpText}
    </div>
  )}
</div>
```

### Enhanced Focus States

```css
/* Focus Animation */
@keyframes focus-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 0, 0);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 0, 0);
  }
}

.focus-ring-animation {
  animation: focus-ring 0.3s ease-out;
}
```

### Auto-Resize Implementation

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);

const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const textarea = e.target;
  
  // Reset height to auto to get correct scrollHeight
  textarea.style.height = 'auto';
  
  // Set new height based on content
  const newHeight = Math.min(Math.max(textarea.scrollHeight, 150), 400);
  textarea.style.height = `${newHeight}px`;
  
  // Call original onChange handler
  handleAnswerChange(question.questionId, textarea.value);
};
```

---

## Color Specifications

### Light Mode
- **Background (Empty)**: `#F9FAFB` (gray-50)
- **Background (Focused)**: `#FFFFFF` (white)
- **Background (Answered)**: `#F0FDF4` (green-50)
- **Border (Default)**: `#E5E7EB` (gray-200)
- **Border (Focused)**: `#FF6B00` (momentumOrange)
- **Border (Answered)**: `#86EFAC` (green-300)
- **Text**: `#1A2B47` (strategyBlue)
- **Placeholder**: `#9CA3AF` (gray-400)

### Dark Mode
- **Background (Empty)**: `#111827` (gray-900)
- **Background (Focused)**: `#1F2937` (gray-800)
- **Background (Answered)**: `#064E3B` (green-900)
- **Border (Default)**: `#374151` (gray-700)
- **Border (Focused)**: `#FF6B00` (momentumOrange)
- **Border (Answered)**: `#059669` (green-600)
- **Text**: `#F9FAFB` (gray-50)
- **Placeholder**: `#6B7280` (gray-500)

---

## Responsive Breakpoints

### Mobile (< 640px)
- Full-width textarea
- Larger padding (px-4 py-4)
- Font size: 16px (prevents iOS zoom)
- Character counter: Bottom-right, always visible
- Save status: Top-right, compact

### Tablet (640px - 1024px)
- Constrained width with max-w-2xl
- Standard padding (px-5 py-4)
- Font size: 16px
- All features visible

### Desktop (> 1024px)
- Max width: max-w-3xl
- Comfortable padding (px-6 py-5)
- Font size: 16px
- Enhanced hover states
- Better spacing

---

## Accessibility Features

1. **Keyboard Navigation**: Full keyboard support
2. **Screen Reader**: Proper ARIA labels
3. **Focus Indicators**: Clear, visible focus states
4. **Color Contrast**: WCAG AA compliance
5. **Touch Targets**: Minimum 44px height
6. **Font Size**: 16px minimum to prevent zoom

---

## Animation Specifications

### Focus Animation
- Duration: 200ms
- Easing: ease-out
- Properties: border-color, background-color, box-shadow, scale

### Save Status Animation
- Duration: 300ms
- Easing: ease-in-out
- Properties: opacity, transform

### Character Counter Animation
- Duration: 200ms
- Easing: ease-out
- Properties: color, background-color

---

## Implementation Priority

### Phase 1: Core Enhancements (High Priority)
1. ✅ Enhanced border and focus states
2. ✅ Improved character counter design
3. ✅ Better save status indicator
4. ✅ Responsive sizing

### Phase 2: Advanced Features (Medium Priority)
1. ✅ Auto-resize functionality
2. ✅ Floating label effect
3. ✅ Enhanced placeholder
4. ✅ Smooth animations

### Phase 3: Polish (Low Priority)
1. ✅ Advanced hover effects
2. ✅ Keyboard shortcuts
3. ✅ Copy/paste enhancements
4. ✅ Undo/redo support
