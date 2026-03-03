import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import {
  PromptImprovementFocusArea,
  PromptImprovementResultDto,
  FOCUS_AREA_OPTIONS,
} from '../../../types/prompt-registry';
import { ImprovementPreview } from './ImprovementPreview';

interface PromptImproverProps {
  systemPrompt: string;
  userPromptTemplate: string;
  onApply: (improvedSystem: string, improvedUser: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

type ImproverStep = 'select' | 'loading' | 'preview' | 'error';

export const PromptImprover: React.FC<PromptImproverProps> = ({
  systemPrompt,
  userPromptTemplate,
  onApply,
  onClose,
  isOpen,
}) => {
  const [step, setStep] = useState<ImproverStep>('select');
  const [focusArea, setFocusArea] = useState<PromptImprovementFocusArea>('all');
  const [customInstructions, setCustomInstructions] = useState('');
  const [result, setResult] = useState<PromptImprovementResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImprove = useCallback(async () => {
    setStep('loading');
    setError(null);

    try {
      const response = await promptRegistryService.improvePrompt({
        systemPrompt,
        userPromptTemplate,
        focusArea,
        customInstructions: customInstructions || null,
        targetLanguage: null, // Auto-detect
      });

      setResult(response);
      setStep('preview');
    } catch (err: any) {
      console.error('Error improving prompt:', err);
      setError(err.message || 'Failed to improve prompt');
      setStep('error');
    }
  }, [systemPrompt, userPromptTemplate, focusArea, customInstructions]);

  const handleApply = useCallback(() => {
    if (result) {
      onApply(result.improvedSystemPrompt, result.improvedUserPromptTemplate);
    }
    onClose();
  }, [result, onApply, onClose]);

  const handleReset = useCallback(() => {
    setStep('select');
    setResult(null);
    setError(null);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  AI Prompt Improver
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Enhance your prompts with AI-powered suggestions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {step === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Focus Area Selection */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      Focus Area
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {FOCUS_AREA_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFocusArea(option.value)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            focusArea === option.value
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                focusArea === option.value
                                  ? 'border-violet-500 bg-violet-500'
                                  : 'border-zinc-300 dark:border-zinc-600'
                              }`}
                            >
                              {focusArea === option.value && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span
                              className={`font-medium ${
                                focusArea === option.value
                                  ? 'text-violet-700 dark:text-violet-400'
                                  : 'text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {option.label}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 pl-6">
                            {option.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Custom Instructions (Optional)
                    </label>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Add specific instructions for the improvement, e.g., 'Make it more formal' or 'Add more detail about output format'"
                      className="w-full h-24 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Preview of current prompts */}
                  <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Current Prompts
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">System: </span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {systemPrompt.length > 100
                            ? `${systemPrompt.substring(0, 100)}...`
                            : systemPrompt || '(empty)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">User Template: </span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {userPromptTemplate.length > 100
                            ? `${userPromptTemplate.substring(0, 100)}...`
                            : userPromptTemplate || '(empty)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
                    <Loader2 className="w-12 h-12 text-violet-500 animate-spin relative" />
                  </div>
                  <p className="mt-6 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                    Analyzing and improving your prompts...
                  </p>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    This may take a few seconds
                  </p>
                </motion.div>
              )}

              {step === 'preview' && result && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ImprovementPreview
                    originalSystem={systemPrompt}
                    originalUser={userPromptTemplate}
                    improvedSystem={result.improvedSystemPrompt}
                    improvedUser={result.improvedUserPromptTemplate}
                    improvements={result.improvements}
                    summary={result.summary}
                    model={result.model}
                    tokensUsed={result.tokensUsed}
                  />
                </motion.div>
              )}

              {step === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="p-4 rounded-full bg-red-100 dark:bg-red-500/10">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="mt-4 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                    Failed to improve prompt
                  </p>
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400 text-center max-w-md">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {step === 'preview' && result && (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Powered by {result.model} · {result.tokensUsed} tokens used
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step === 'select' && (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImprove}
                    disabled={!systemPrompt && !userPromptTemplate}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Wand2 className="w-4 h-4" />
                    Improve Prompt
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {step === 'preview' && (
                <>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply Improvements
                  </button>
                </>
              )}
              {step === 'error' && (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-600 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptImprover;
