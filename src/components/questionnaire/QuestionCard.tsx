import React from 'react';
import { Lightbulb, FileText, Asterisk } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCardProps, Answer } from '../../types/questionnaire';
import QuestionInput from './QuestionInput';

/**
 * QuestionCard Component
 * Displays a question with its input, tip, and example
 * Supports framer-motion animations
 */
export default function QuestionCard({
  question,
  value,
  onChange,
  isActive = true,
  questionNumber,
}: QuestionCardProps) {
  const descriptionId = `question-description-${question.id}`;
  const tipId = `question-tip-${question.id}`;
  const exampleId = `question-example-${question.id}`;

  // Combine all aria descriptions
  const ariaDescribedBy = [
    question.description && descriptionId,
    question.tip && tipId,
    question.example && exampleId,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        w-full max-w-3xl mx-auto
        bg-white dark:bg-gray-800
        rounded-2xl
        border-2 border-gray-100 dark:border-gray-700
        shadow-lg
        p-6 md:p-8
        transition-all duration-300
        ${isActive ? 'ring-2 ring-orange-500/20' : ''}
      `}
    >
      {/* Question Header */}
      <div className="mb-6">
        {/* Question Number Badge */}
        {questionNumber !== undefined && (
          <div className="mb-4">
            <span
              className="
                inline-flex items-center justify-center
                w-10 h-10
                rounded-full
                bg-orange-100 dark:bg-orange-900/30
                text-orange-600 dark:text-orange-400
                font-bold text-lg
              "
            >
              {questionNumber}
            </span>
          </div>
        )}

        {/* Question Text */}
        <h2
          className="
            text-2xl md:text-3xl
            font-bold
            text-gray-900 dark:text-white
            leading-tight
            mb-2
          "
        >
          {question.text}
          {question.required && (
            <span
              className="inline-flex items-center ml-2 text-red-500"
              aria-label="Required"
            >
              <Asterisk size={16} className="align-middle" />
            </span>
          )}
        </h2>

        {/* Description */}
        {question.description && (
          <p
            id={descriptionId}
            className="
              text-base
              text-gray-600 dark:text-gray-400
              leading-relaxed
            "
          >
            {question.description}
          </p>
        )}
      </div>

      {/* Input Field */}
      <div className="mb-6" role="group" aria-labelledby={`question-${question.id}`}>
        <QuestionInput
          question={question}
          value={value}
          onChange={onChange}
          autoFocus={isActive}
        />
      </div>

      {/* Tip Box */}
      <AnimatePresence>
        {question.tip && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            id={tipId}
            className="
              mb-4
              p-4
              rounded-xl
              bg-amber-50 dark:bg-amber-900/20
              border border-amber-200 dark:border-amber-800/50
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Lightbulb
                  size={18}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">
                  Tip
                </span>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  {question.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example Box */}
      <AnimatePresence>
        {question.example && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            id={exampleId}
            className="
              p-4
              rounded-xl
              bg-gray-50 dark:bg-gray-900/50
              border border-gray-200 dark:border-gray-700
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <FileText
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Example
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{question.example}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
