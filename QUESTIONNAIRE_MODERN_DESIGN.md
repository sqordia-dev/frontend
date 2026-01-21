# Modern Design Proposal for QuestionnairePage

## Design Philosophy
Transform the questionnaire into a sleek, modern, and user-friendly experience that guides users smoothly through the process with clear visual feedback and delightful interactions.

---

## Key Design Improvements

### 1. **Enhanced Visual Hierarchy**

#### Section Header Redesign
- **Solid Background**: Use strategyBlue (#1A2B47) with subtle texture pattern
- **Glassmorphism Effect**: Add backdrop blur and semi-transparent overlay (optional)
- **Animated Progress Indicator**: Circular progress ring around section icon
- **Better Typography**: Larger, bolder section titles with improved spacing

#### Question Cards
- **Elevated Cards**: Increase shadow depth and add hover lift effect
- **Solid Color Borders**: Clean solid color borders (momentumOrange for active, green for completed)
- **Smooth Transitions**: All state changes animated (300ms ease-out)
- **Visual Completion States**: Clear visual distinction between answered/unanswered

### 2. **Modern Input Design**

#### Textarea Enhancement
- **Floating Label Effect**: Question number floats above when focused
- **Character Counter**: Show character count with visual feedback
- **Auto-resize**: Textarea grows with content (max height)
- **Focus Ring**: Animated orange glow on focus
- **Placeholder Animation**: Subtle fade-in for placeholder text

#### Input States
- **Empty State**: Light gray background with subtle border
- **Focused State**: White background with orange border and shadow
- **Filled State**: Slight green tint border when answered
- **Error State**: Red border with shake animation (if validation added)

### 3. **Improved Progress Visualization**

#### Header Progress Bar
- **Solid Color Progress**: Use momentumOrange (#FF6B00) for progress bar
- **Animated Shimmer**: Continuous shimmer effect on progress bar (white overlay)
- **Milestone Markers**: Show section completion milestones
- **Percentage Badge**: Floating badge showing exact percentage

#### Section Sidebar
- **Progress Rings**: Circular progress indicators for each section
- **Completion Animation**: Checkmark animation when section completes
- **Hover Previews**: Show question count on hover
- **Smooth Scrolling**: Auto-scroll to active section

### 4. **Enhanced Micro-interactions**

#### Button Interactions
- **Ripple Effect**: Material Design-inspired ripple on click
- **Scale Animation**: Subtle scale on hover (1.05x)
- **Icon Animations**: Icons rotate/scale on hover
- **Loading States**: Skeleton loaders instead of spinners

#### Card Interactions
- **Hover Lift**: Cards lift 4px on hover with shadow increase
- **Focus Ring**: Animated ring around focused question
- **Completion Celebration**: Subtle confetti/checkmark animation on answer save

### 5. **Modern Color & Typography**

#### Color Enhancements
- **Solid Color Accents**: Use momentumOrange (#FF6B00) for CTAs and highlights
- **Better Contrast**: Ensure WCAG AA compliance
- **Dark Mode Polish**: Refined dark mode colors
- **Status Colors**: 
  - Answered: Green (#10B981)
  - In Progress: Orange (#FF6B00)
  - Pending: Gray (#6B7280)

#### Typography Improvements
- **Font Sizes**: Larger, more readable question text (18px base)
- **Line Height**: Increased to 1.7 for better readability
- **Font Weight**: Bolder headings (700-800)
- **Letter Spacing**: Tighter for headings, normal for body

### 6. **Mobile-First Enhancements**

#### Mobile Optimizations
- **Bottom Sheet Navigation**: Slide-up section selector on mobile
- **Swipe Gestures**: Swipe between questions
- **Sticky Actions**: Fixed bottom bar with navigation
- **Touch Targets**: Minimum 44px for all interactive elements
- **Simplified Layout**: Single column, larger inputs

#### Responsive Breakpoints
- **Mobile (< 640px)**: Single column, full-width cards
- **Tablet (640-1024px)**: Sidebar becomes drawer, 2-column where appropriate
- **Desktop (> 1024px)**: Full sidebar, optimized spacing

### 7. **AI Suggestion Enhancement**

#### Suggestion Button
- **Solid Background**: momentumOrange (#FF6B00) background
- **Pulse Animation**: Subtle pulse when available
- **Loading State**: Skeleton text preview while generating
- **Success Animation**: Text slides in smoothly when suggestion appears

#### Suggestion Display
- **Card Overlay**: Suggestion appears in elegant card overlay
- **Accept/Reject**: Clear buttons to accept or modify
- **Diff View**: Show what changed (if replacing existing answer)

### 8. **Visual Feedback Improvements**

#### Save States
- **Toast Notifications**: Elegant toast for save confirmations
- **Progress Indicators**: Show save progress (if applicable)
- **Error Handling**: Inline error messages with retry option
- **Success Animations**: Checkmark with scale animation

#### Completion States
- **Section Completion**: Celebration animation when section done
- **Overall Progress**: Visual milestone celebrations
- **Next Section Preview**: Show preview of next section

---

## Specific Component Redesigns

### Section Header Component
```tsx
// Modern header with solid colors
<div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#1A2B47' }}>
  {/* Subtle Background Pattern */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0" style={{
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
      backgroundSize: '40px 40px'
    }} />
  </div>
  
  {/* Content */}
  <div className="relative z-10 p-8">
    {/* Section Icon with Progress Ring */}
    <div className="relative w-20 h-20 mb-6">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="4"
          strokeDasharray={`${sectionProgress * 2.26} 226`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={32} className="text-white" />
      </div>
    </div>
    
    {/* Section Title */}
    <h2 className="text-4xl font-bold text-white mb-2">
      {sectionTitle}
    </h2>
    
    {/* Progress Text */}
    <p className="text-white/80 text-lg">
      {answered} of {total} questions completed
    </p>
  </div>
</div>
```

### Modern Question Card
```tsx
<div className={`
  group relative
  bg-white dark:bg-gray-800
  rounded-2xl
  shadow-lg hover:shadow-2xl
  border-2
  transition-all duration-300
  overflow-hidden
  ${isAnswered ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'}
  ${isFocused ? 'scale-[1.02] shadow-xl border-orange-400' : ''}
  hover:-translate-y-1
`}>
  {/* Accent Bar */}
  {isAnswered && (
    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#10B981' }} />
  )}
  
  {/* Question Number Badge */}
  <div className="absolute top-6 left-6">
    <div       className={`
        w-14 h-14 rounded-xl
        flex items-center justify-center
        font-bold text-lg
        transition-all duration-300
        ${isAnswered 
          ? 'text-white shadow-lg' 
          : isFocused
          ? 'text-white shadow-lg scale-110'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }
      `}
      style={isAnswered 
        ? { backgroundColor: '#10B981' }
        : isFocused
        ? { backgroundColor: '#FF6B00' }
        : {}
      }>
      {questionNumber}
    </div>
  </div>
  
  {/* Question Content */}
  <div className="pt-24 px-6 pb-6">
    {/* Question Text */}
    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
      {questionText}
    </h3>
    
    {/* Help Text */}
    {helpText && (
      <div className="mb-6 p-4 rounded-xl border" style={{ 
        backgroundColor: theme === 'dark' ? '#1F2937' : '#F4F7FA',
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
      }}>
        <div className="flex items-start gap-3">
          <Lightbulb className="flex-shrink-0 mt-0.5" size={20} style={{ color: '#FF6B00' }} />
          <p className="text-sm" style={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}>{helpText}</p>
        </div>
      </div>
    )}
    
    {/* Enhanced Textarea */}
    <div className="relative">
      <textarea
        className={`
          w-full px-5 py-4
          rounded-xl border-2
          transition-all duration-200
          resize-none
          focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900
          ${isFocused ? 'border-orange-400 bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}
        `}
        style={{
          minHeight: '150px',
          fontSize: '16px',
          lineHeight: '1.7'
        }}
      />
      
      {/* Character Counter */}
      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
        {characterCount} characters
      </div>
      
      {/* Save Status Indicator */}
      {hasAnswer && (
        <div className="absolute top-3 right-3">
          {saving ? (
            <Loader2 className="animate-spin text-blue-500" size={18} />
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/50">
              <Check size={14} className="text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-700 dark:text-green-300">Saved</span>
            </div>
          )}
        </div>
      )}
    </div>
    
    {/* Action Buttons */}
    <div className="flex items-center gap-3 mt-6">
      {/* Save Button */}
      <button className={`
        flex items-center gap-2 px-6 py-3
        rounded-xl font-semibold
        transition-all duration-200
        border-2
        ${hasAnswer 
          ? 'border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
          : 'border-gray-300 text-gray-400 cursor-not-allowed'
        }
      `}>
        <Save size={18} />
        <span>Save</span>
      </button>
      
      {/* AI Suggestion Button */}
      <button 
        className={`
          flex items-center gap-2 px-6 py-3
          rounded-xl font-semibold text-white
          transition-all duration-200
          shadow-lg hover:shadow-xl
          hover:scale-105 active:scale-95
          ${suggesting ? 'opacity-75 cursor-not-allowed' : ''}
        `}
        style={{ 
          backgroundColor: '#FF6B00'
        }}
        onMouseEnter={(e) => {
          if (!suggesting) e.currentTarget.style.backgroundColor = '#E55F00';
        }}
        onMouseLeave={(e) => {
          if (!suggesting) e.currentTarget.style.backgroundColor = '#FF6B00';
        }}
      >
        {suggesting ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>AI Suggestion</span>
          </>
        )}
      </button>
    </div>
  </div>
  
  {/* Completion Badge */}
  {isAnswered && (
    <div className="absolute top-6 right-6">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#10B981' }}>
        <CheckCircle2 className="text-white" size={24} />
      </div>
    </div>
  )}
</div>
```

### Enhanced Sidebar Navigation
```tsx
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 sticky top-32">
  {/* Sidebar Header */}
  <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      Sections
    </h3>
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${overallProgress}%`,
            backgroundColor: '#FF6B00'
          }}
        />
      </div>
      <span className="text-sm font-bold text-orange-600">{Math.round(overallProgress)}%</span>
    </div>
  </div>
  
  {/* Section List */}
  <nav className="space-y-3">
    {sections.map((section, index) => {
      const { answered, total, percentage } = getSectionProgress(section);
      const isComplete = answered === total && total > 0;
      const isCurrent = index === currentSection;
      
      return (
        <button
          key={section}
          onClick={() => handleSectionNavigation(index)}
          className={`
            w-full text-left p-4 rounded-xl
            transition-all duration-200
            group border-2
            ${isCurrent 
              ? 'shadow-lg' 
              : isComplete
              ? ''
              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }
          `}
          style={isCurrent 
            ? { 
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF4E6',
                borderColor: '#FF6B00'
              }
            : isComplete
            ? {
                backgroundColor: theme === 'dark' ? '#064E3B' : '#F0FDF4',
                borderColor: theme === 'dark' ? '#059669' : '#86EFAC'
              }
            : {}
          }
        >
          <div className="flex items-center gap-4">
            {/* Progress Ring */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={isComplete ? '#10B981' : '#FF6B00'}
                  strokeWidth="3"
                  strokeDasharray={`${percentage * 1.26} 126`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                ) : (
                  <Icon className={isCurrent ? 'text-orange-600' : 'text-gray-400'} size={20} />
                )}
              </div>
            </div>
            
            {/* Section Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Section {index + 1}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {section}
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                {answered}/{total} questions
              </div>
            </div>
            
            {/* Current Indicator */}
            {isCurrent && (
              <ChevronRight className="text-orange-600 flex-shrink-0" size={20} />
            )}
          </div>
        </button>
      );
    })}
  </nav>
</div>
```

---

## Animation Enhancements

### CSS Animations to Add
```css
/* Smooth fade-in for questions */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse animation for active elements */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Shimmer effect for progress bars */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Ripple effect for buttons */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* Celebration animation */
@keyframes celebrate {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
}
```

---

## Implementation Priority

### Phase 1: Core Visual Improvements (High Priority)
1. ✅ Enhanced section header with gradient
2. ✅ Modern question card design
3. ✅ Improved progress visualization
4. ✅ Better button styling

### Phase 2: Interactions & Animations (Medium Priority)
1. ✅ Smooth transitions and hover effects
2. ✅ Loading states and animations
3. ✅ Completion celebrations
4. ✅ Focus states and rings

### Phase 3: Advanced Features (Low Priority)
1. ✅ Swipe gestures for mobile
2. ✅ Keyboard shortcuts
3. ✅ Advanced progress analytics
4. ✅ Question hints and tips

---

## Accessibility Considerations

1. **Keyboard Navigation**: Full keyboard support for all interactions
2. **Screen Reader**: Proper ARIA labels and roles
3. **Focus Indicators**: Clear, visible focus states
4. **Color Contrast**: WCAG AA compliance for all text
5. **Touch Targets**: Minimum 44px for mobile interactions
6. **Reduced Motion**: Respect prefers-reduced-motion

---

## Performance Optimizations

1. **Lazy Loading**: Load questions as user scrolls
2. **Debounced Saves**: Optimize auto-save frequency
3. **Memoization**: Cache computed values
4. **Virtual Scrolling**: For long question lists
5. **Code Splitting**: Load components on demand

---

## Testing Checklist

- [ ] Visual design matches mockups
- [ ] All animations work smoothly
- [ ] Responsive on all devices
- [ ] Dark mode works correctly
- [ ] Accessibility standards met
- [ ] Performance is optimal
- [ ] Cross-browser compatibility
- [ ] User testing feedback incorporated
