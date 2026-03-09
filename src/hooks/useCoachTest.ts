import { useState, useCallback } from 'react';
import { adminQuestionTemplateService, type TestCoachPromptResponse } from '../lib/admin-question-template-service';

export function useCoachTest(questionId: string | null) {
  const [testAnswer, setTestAnswer] = useState('');
  const [testLanguage, setTestLanguage] = useState<'fr' | 'en'>('fr');
  const [testResult, setTestResult] = useState<TestCoachPromptResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = useCallback(async () => {
    if (!questionId || !testAnswer.trim()) return;

    setIsRunning(true);
    setTestError(null);
    setTestResult(null);

    try {
      const result = await adminQuestionTemplateService.testCoachPrompt(questionId, {
        answer: testAnswer,
        language: testLanguage,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestError(err?.message || 'Test failed');
    } finally {
      setIsRunning(false);
    }
  }, [questionId, testAnswer, testLanguage]);

  const reset = useCallback(() => {
    setTestAnswer('');
    setTestResult(null);
    setTestError(null);
  }, []);

  return {
    testAnswer,
    setTestAnswer,
    testLanguage,
    setTestLanguage,
    testResult,
    testError,
    isRunning,
    runTest,
    reset,
  };
}
