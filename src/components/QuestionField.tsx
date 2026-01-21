import { useState, useRef, useEffect } from 'react';
import { Sparkles, Check, Loader2, MessageCircle, Send } from 'lucide-react';
import AIActionMenu from './AIActionMenu';
import AIStrengthFeedback from './AIStrengthFeedback';
import { useTheme } from '../contexts/ThemeContext';

interface QuestionFieldProps {
  questionId: string;
  questionText: string;
  helpText?: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  isRequired?: boolean;
  isSaving?: boolean;
  placeholder?: string;
  context?: string;
  persona?: string;
  location?: { city?: string; province?: string };
  enableAIFeedback?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
}

export default function QuestionField({
  questionId,
  questionText,
  helpText,
  value,
  onChange,
  onSave,
  isRequired = false,
  isSaving = false,
  placeholder = 'Share your thoughts here... Be as detailed as you\'d like.',
  context,
  persona = 'Entrepreneur',
  location,
  enableAIFeedback = true,
  questionNumber,
  totalQuestions
}: QuestionFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSaveStatus, setShowSaveStatus] = useState(false);

  // Auto-resize textarea with min/max constraints
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 150; // 150px minimum
      const maxHeight = 400; // 400px maximum
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Show save status temporarily
  useEffect(() => {
    if (isSaving) {
      setShowSaveStatus(true);
    } else if (value.trim() && !isSaving) {
      setShowSaveStatus(true);
      const timer = setTimeout(() => setShowSaveStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, value]);

  const handlePolish = (polishedText: string) => {
    onChange(polishedText);
    if (onSave) {
      setTimeout(() => onSave(), 100);
    }
  };

  const characterCount = value.length;
  const minLength = 10;
  const isTooShort = characterCount > 0 && characterCount < minLength;
  const hasAnswer = value.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Question Bubble - Left Aligned */}
      <div className="flex items-start gap-3">
        {/* Question Number Badge */}
        {questionNumber !== undefined && (
          <div className="flex-shrink-0 mt-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
              transition-all duration-200
              ${focused
                ? 'bg-orange-500 text-white shadow-lg scale-110'
                : hasAnswer
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}>
              {questionNumber}
            </div>
          </div>
        )}

        {/* Question Message Bubble */}
        <div className="flex-1">
          <div className={`
            inline-block max-w-[85%] md:max-w-[75%]
            px-4 py-3
            rounded-2xl
            transition-all duration-200
            ${focused
              ? 'bg-gray-100 dark:bg-gray-800 shadow-md'
              : 'bg-gray-50 dark:bg-gray-800/50'
            }
          `}>
            <div className="flex items-start gap-2">
              <MessageCircle size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {questionText}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                {helpText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {helpText}
                  </p>
                )}
                {totalQuestions && questionNumber !== undefined && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Question {questionNumber} of {totalQuestions}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Bubble - Right Aligned */}
      <div className="flex items-start gap-3 justify-end">
        <div className="flex-1 max-w-[85%] md:max-w-[75%]">
          {/* Answer Bubble Container */}
          <div className={`
            relative
            rounded-2xl
            transition-all duration-300 ease-out
            ${focused
              ? 'shadow-xl scale-[1.02]'
              : hasAnswer
              ? 'shadow-md'
              : 'shadow-sm'
            }
            ${focused
              ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700'
              : hasAnswer
              ? 'bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800'
              : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
            }
            ${isTooShort ? 'border-yellow-300 dark:border-yellow-700' : ''}
          `}
          style={{
            borderRadius: '18px 18px 4px 18px' // Chat bubble tail on bottom-right
          }}>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                if (onSave && value.trim()) {
                  onSave();
                }
              }}
              placeholder={placeholder}
              rows={6}
              className={`
                w-full px-5 py-4 pr-12
                resize-none overflow-y-auto
                transition-all duration-200
                bg-transparent
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none
                text-base
              `}
              style={{
                minHeight: '120px',
                maxHeight: '400px',
                lineHeight: '1.7',
                fontSize: '16px',
                borderRadius: '18px 18px 4px 18px'
              }}
            />

            {/* Character Counter - Bottom Left */}
            {hasAnswer && (
              <div className={`
                absolute bottom-3 left-3
                px-2 py-1
                rounded-full
                text-xs font-medium
                transition-all duration-200
                z-10
                ${focused
                  ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}>
                {characterCount}
              </div>
            )}

            {/* Save Status Indicator - Top Right */}
            {showSaveStatus && (
              <div className="absolute top-3 right-3 z-20">
                <div className={`
                  w-2 h-2 rounded-full
                  transition-all duration-300
                  ${isSaving
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-green-500'
                  }
                  shadow-sm
                `} />
              </div>
            )}

            {/* AI Action Menu Button - Bottom Right (Always Visible) */}
            <div className="absolute bottom-3 right-3 z-10">
              <div className={`
                bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border border-gray-200 dark:border-gray-700
                transition-all duration-200
                ${value.trim().length >= minLength 
                  ? 'hover:scale-110 opacity-100 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
                }
              `}
              title={value.trim().length < minLength ? "Type at least 10 characters for AI actions" : "AI Actions"}
              >
                <AIActionMenu
                  text={value}
                  context={context || questionText}
                  onPolished={handlePolish}
                  disabled={!value.trim() || value.trim().length < minLength}
                />
              </div>
            </div>
          </div>

          {/* Typing Indicator / Status Below Bubble */}
          <div className="flex items-center justify-end gap-2 mt-2 px-2">
            {isSaving && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <Loader2 size={12} className="animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {!isSaving && hasAnswer && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <Check size={12} />
                <span>Saved</span>
              </div>
            )}
          </div>
        </div>

        {/* User Avatar/Icon - Right Side */}
        <div className="flex-shrink-0">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-200
            ${focused
              ? 'bg-orange-500 text-white shadow-lg scale-110'
              : hasAnswer
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }
          `}>
            <Send size={16} />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs min-h-[20px] px-2">
        <div className="flex items-center gap-4">
          {isTooShort && (
            <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
              Minimum {minLength} characters recommended
            </span>
          )}
        </div>
      </div>

      {/* AI Strength Feedback - Field Level */}
      {enableAIFeedback && (
        <AIStrengthFeedback
          questionId={questionId}
          answer={value}
          context={context || questionText}
          persona={persona}
          location={location}
          triggerType="field"
          onPolishApplied={(polishedText) => {
            onChange(polishedText);
            if (onSave) {
              setTimeout(() => onSave(), 100);
            }
          }}
        />
      )}
    </div>
  );
}
