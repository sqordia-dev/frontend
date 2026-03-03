import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  X,
  ChevronDown,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import type { PromptTemplateListDto, PromptTestResultDto } from '../../../types/prompt-registry';
import { PromptComparisonCard } from './PromptComparisonCard';
import { cn } from '../../../lib/utils';

interface ABTestingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: PromptTemplateListDto[];
  language?: 'en' | 'fr';
  embedded?: boolean; // When true, renders without modal wrapper
}

interface TestResults {
  promptA: PromptTestResultDto | null;
  promptB: PromptTestResultDto | null;
}

export const ABTestingPanel: React.FC<ABTestingPanelProps> = ({
  isOpen,
  onClose,
  prompts,
  language = 'en',
  embedded = false,
}) => {
  const [selectedPromptA, setSelectedPromptA] = useState<PromptTemplateListDto | null>(null);
  const [selectedPromptB, setSelectedPromptB] = useState<PromptTemplateListDto | null>(null);
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);
  const [testVariables, setTestVariables] = useState('{}');
  const [testResults, setTestResults] = useState<TestResults>({ promptA: null, promptB: null });
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    title: language === 'fr' ? 'Test A/B' : 'A/B Testing',
    subtitle: language === 'fr' ? 'Comparer deux prompts côte à côte' : 'Compare two prompts side by side',
    selectPromptA: language === 'fr' ? 'Sélectionner Prompt A' : 'Select Prompt A',
    selectPromptB: language === 'fr' ? 'Sélectionner Prompt B' : 'Select Prompt B',
    testVariables: language === 'fr' ? 'Variables de test' : 'Test Variables',
    runTest: language === 'fr' ? 'Exécuter le test' : 'Run Test',
    running: language === 'fr' ? 'Test en cours...' : 'Running test...',
    results: language === 'fr' ? 'Résultats' : 'Results',
    metrics: language === 'fr' ? 'Métriques historiques' : 'Historical Metrics',
    output: language === 'fr' ? 'Sortie générée' : 'Generated Output',
    tokens: language === 'fr' ? 'Tokens utilisés' : 'Tokens Used',
    responseTime: language === 'fr' ? 'Temps de réponse' : 'Response Time',
    copyOutput: language === 'fr' ? 'Copier' : 'Copy',
    copied: language === 'fr' ? 'Copié!' : 'Copied!',
    reset: language === 'fr' ? 'Réinitialiser' : 'Reset',
    selectBoth: language === 'fr' ? 'Sélectionnez deux prompts pour comparer' : 'Select two prompts to compare',
    sameSection: language === 'fr' ? 'Les prompts doivent être du même type de section' : 'Prompts must be of the same section type',
  };

  // Filter prompts for dropdown B to show same section type
  const filteredPromptsB = selectedPromptA
    ? prompts.filter(p => p.sectionType === selectedPromptA.sectionType && p.id !== selectedPromptA.id)
    : prompts;

  const canRunTest = selectedPromptA && selectedPromptB && !testing;

  const handleRunTest = useCallback(async () => {
    if (!selectedPromptA || !selectedPromptB) return;

    setTesting(true);
    setError(null);
    setTestResults({ promptA: null, promptB: null });

    try {
      // Run tests in parallel
      const [resultA, resultB] = await Promise.all([
        promptRegistryService.testPrompt(selectedPromptA.id, {
          sampleVariables: testVariables,
        }),
        promptRegistryService.testPrompt(selectedPromptB.id, {
          sampleVariables: testVariables,
        }),
      ]);

      setTestResults({ promptA: resultA, promptB: resultB });
    } catch (err: any) {
      console.error('Error running A/B test:', err);
      setError(err.message || 'Failed to run test');
    } finally {
      setTesting(false);
    }
  }, [selectedPromptA, selectedPromptB, testVariables]);

  const handleReset = () => {
    setTestResults({ promptA: null, promptB: null });
    setError(null);
  };

  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  const copyToClipboard = (text: string, side: 'A' | 'B') => {
    navigator.clipboard.writeText(text);
    if (side === 'A') {
      setCopiedA(true);
      setTimeout(() => setCopiedA(false), 2000);
    } else {
      setCopiedB(true);
      setTimeout(() => setCopiedB(false), 2000);
    }
  };

  if (!isOpen && !embedded) return null;

  // Shared content for both modal and embedded modes
  const content = (
    <>
      {/* Prompt Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Prompt A Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Prompt A
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDropdownA(!showDropdownA)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
            >
              <span className={cn(
                'text-sm truncate',
                selectedPromptA ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
              )}>
                {selectedPromptA?.name || t.selectPromptA}
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
            </button>

            {showDropdownA && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => {
                      setSelectedPromptA(prompt);
                      setShowDropdownA(false);
                      if (selectedPromptB?.id === prompt.id || selectedPromptB?.sectionType !== prompt.sectionType) {
                        setSelectedPromptB(null);
                      }
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors',
                      selectedPromptA?.id === prompt.id && 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    )}
                  >
                    <div className="font-medium truncate">{prompt.name}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {prompt.sectionTypeName} • {prompt.planTypeName}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Prompt B Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Prompt B
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDropdownB(!showDropdownB)}
              disabled={!selectedPromptA}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-colors',
                selectedPromptA
                  ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 cursor-not-allowed'
              )}
            >
              <span className={cn(
                'text-sm truncate',
                selectedPromptB ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
              )}>
                {selectedPromptB?.name || t.selectPromptB}
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
            </button>

            {showDropdownB && selectedPromptA && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {filteredPromptsB.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-zinc-400 text-center">
                    {t.sameSection}
                  </div>
                ) : (
                  filteredPromptsB.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => {
                        setSelectedPromptB(prompt);
                        setShowDropdownB(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors',
                        selectedPromptB?.id === prompt.id && 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'
                      )}
                    >
                      <div className="font-medium truncate">{prompt.name}</div>
                      <div className="text-xs text-zinc-400 truncate">
                        v{prompt.version} • {prompt.planTypeName}
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Test Variables */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          {t.testVariables}
        </label>
        <textarea
          value={testVariables}
          onChange={(e) => setTestVariables(e.target.value)}
          className="w-full h-24 px-4 py-3 font-mono text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          placeholder='{"companyName": "Acme Inc", "industry": "Technology"}'
        />
      </div>

      {/* Run Test Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleRunTest}
          disabled={!canRunTest}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all',
            canRunTest
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
          )}
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.running}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {t.runTest}
            </>
          )}
        </button>

        {(testResults.promptA || testResults.promptB) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t.reset}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Historical Metrics Comparison */}
      {selectedPromptA && selectedPromptB && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            {t.metrics}
          </h3>
          <PromptComparisonCard
            promptA={{
              id: selectedPromptA.id,
              name: selectedPromptA.name,
              usageCount: selectedPromptA.totalUsageCount,
              acceptanceRate: selectedPromptA.acceptanceRate,
              editRate: 0,
              regenerateRate: 0,
              averageRating: selectedPromptA.averageRating,
            }}
            promptB={{
              id: selectedPromptB.id,
              name: selectedPromptB.name,
              usageCount: selectedPromptB.totalUsageCount,
              acceptanceRate: selectedPromptB.acceptanceRate,
              editRate: 0,
              regenerateRate: 0,
              averageRating: selectedPromptB.averageRating,
            }}
            language={language}
          />
        </div>
      )}

      {/* Test Results */}
      {(testResults.promptA || testResults.promptB) && (
        <div>
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            {t.results}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prompt A Result */}
            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                  Prompt A: {selectedPromptA?.name}
                </span>
                {testResults.promptA && (
                  <button
                    onClick={() => copyToClipboard(testResults.promptA!.output, 'A')}
                    className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700"
                  >
                    {copiedA ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedA ? t.copied : t.copyOutput}
                  </button>
                )}
              </div>
              {testResults.promptA ? (
                <>
                  <div className="flex items-center gap-4 mb-3 text-xs text-purple-600 dark:text-purple-400">
                    <span>{t.tokens}: {testResults.promptA.tokensUsed}</span>
                    <span>{t.responseTime}: {testResults.promptA.responseTimeMs}ms</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg max-h-60 overflow-y-auto">
                    <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {testResults.promptA.output}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Prompt B Result */}
            <div className="p-4 bg-pink-50 dark:bg-pink-500/10 rounded-xl border border-pink-200 dark:border-pink-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-pink-700 dark:text-pink-400">
                  Prompt B: {selectedPromptB?.name}
                </span>
                {testResults.promptB && (
                  <button
                    onClick={() => copyToClipboard(testResults.promptB!.output, 'B')}
                    className="flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700"
                  >
                    {copiedB ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedB ? t.copied : t.copyOutput}
                  </button>
                )}
              </div>
              {testResults.promptB ? (
                <>
                  <div className="flex items-center gap-4 mb-3 text-xs text-pink-600 dark:text-pink-400">
                    <span>{t.tokens}: {testResults.promptB.tokensUsed}</span>
                    <span>{t.responseTime}: {testResults.promptB.responseTimeMs}ms</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg max-h-60 overflow-y-auto">
                    <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {testResults.promptB.output}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedPromptA && !selectedPromptB && (
        <div className="text-center py-12">
          <FlaskConical className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">{t.selectBoth}</p>
        </div>
      )}
    </>
  );

  // Embedded mode: render content directly without modal wrapper
  if (embedded) {
    return <div className="space-y-6">{content}</div>;
  }

  // Modal mode: wrap content in modal overlay
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
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {t.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t.subtitle}
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {content}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ABTestingPanel;
