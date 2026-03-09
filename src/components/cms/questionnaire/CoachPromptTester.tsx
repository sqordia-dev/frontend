import { Play, Loader2, AlertCircle, Clock, Zap } from 'lucide-react';
import { useCoachTest } from '@/hooks/useCoachTest';
import { cn } from '@/lib/utils';

interface CoachPromptTesterProps {
  questionId: string | null;
}

export function CoachPromptTester({ questionId }: CoachPromptTesterProps) {
  const { testAnswer, setTestAnswer, testLanguage, setTestLanguage, testResult, testError, isRunning, runTest } =
    useCoachTest(questionId);

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Test Coach Prompt</p>
        <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
          {(['fr', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setTestLanguage(lang)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                testLanguage === lang
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Sample Answer</label>
        <textarea
          value={testAnswer}
          onChange={(e) => setTestAnswer(e.target.value)}
          placeholder="Enter a sample answer to test the coach prompt..."
          rows={3}
          className={cn(
            'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background',
            'focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none transition-all',
          )}
        />
      </div>

      <button
        onClick={runTest}
        disabled={isRunning || !testAnswer.trim() || !questionId}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg transition-colors',
          'bg-emerald-500 text-white hover:bg-emerald-600',
          (isRunning || !testAnswer.trim() || !questionId) && 'opacity-50 cursor-not-allowed',
        )}
      >
        {isRunning ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play size={14} />
            Test Prompt
          </>
        )}
      </button>

      {testError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 dark:text-red-400">{testError}</p>
        </div>
      )}

      {testResult && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-background border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Coach Response</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{testResult.output}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 text-xs">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">{testResult.responseTimeMs}ms</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 text-xs">
              <Zap size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">{testResult.tokensUsed} tokens</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 text-xs truncate">
              <span className="text-muted-foreground truncate">{testResult.provider}</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Model: {testResult.model}
          </p>
        </div>
      )}
    </div>
  );
}
