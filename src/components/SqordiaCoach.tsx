import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { apiClient } from '../lib/api-client';

interface AuditIssue {
  category: 'Financial' | 'Strategic' | 'Legal';
  severity: 'error' | 'warning' | 'info';
  message: string;
  nudge?: string;
  suggestions?: {
    optionA: string;
    optionB: string;
    optionC: string;
  };
}

interface SqordiaCoachProps {
  planId: string;
  currentSection?: string;
  persona?: string;
  location?: { city: string; province: string };
}

export default function SqordiaCoach({
  planId,
  currentSection,
  persona,
  location
}: SqordiaCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Financial' | 'Strategic' | 'Legal' | 'All'>('All');
  const [selectedIssue, setSelectedIssue] = useState<AuditIssue | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && planId) {
      analyzeSection();
    }
  }, [isOpen, planId, currentSection]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [issues]);

  const analyzeSection = async () => {
    if (!planId || !currentSection) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/api/v1/ai/analyze-section', {
        sectionName: currentSection,
        persona: persona || 'Entrepreneur',
        location: location || { city: 'Montreal', province: 'Quebec' }
      });

      const data = response.data?.value || response.data;
      const auditIssues: AuditIssue[] = data.issues || data.gaps || [];
      setIssues(auditIssues);
    } catch (err: any) {
      console.error('Failed to analyze section:', err);
      // Fallback: Show sample issues for demo
      setIssues([
        {
          category: 'Financial',
          severity: 'warning',
          message: 'Marketing budget may not support projected sales volume.',
          nudge: 'How will you ensure your marketing spend generates enough leads?',
          suggestions: {
            optionA: 'Reduce marketing budget to align with conservative projections',
            optionB: 'Increase sales projections with detailed acquisition strategy',
            optionC: 'Provide data on conversion rates and customer acquisition costs'
          }
        },
        {
          category: 'Strategic',
          severity: 'info',
          message: 'Consider adding competitive analysis section.',
          nudge: 'What makes your offering unique compared to competitors?',
          suggestions: {
            optionA: 'Add detailed competitor comparison table',
            optionB: 'Emphasize unique value proposition more strongly',
            optionC: 'Include market positioning strategy'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = selectedCategory === 'All'
    ? issues
    : issues.filter(issue => issue.category === selectedCategory);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center transition-all
          ${isOpen 
            ? 'bg-gray-600 dark:bg-gray-700' 
            : 'bg-orange-500 hover:bg-orange-600'
          }
        `}
        style={!isOpen ? { backgroundColor: '#FF6B00' } : {}}
        title="Sqordia Coach"
      >
        <MessageSquare size={24} className="text-white" />
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 z-50 flex flex-col shadow-2xl" style={{
          backgroundColor: 'var(--bg-color, #FFFFFF)'
        }}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <MessageSquare size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Sqordia Coach</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered audit</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['All', 'Financial', 'Strategic', 'Legal'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  flex-1 px-3 py-2 text-xs font-medium transition-colors
                  ${selectedCategory === category
                    ? 'border-b-2 text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                style={selectedCategory === category ? { borderBottomColor: '#FF6B00' } : {}}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin" style={{ color: '#FF6B00' }} />
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No issues found in this section. Great work!
                </p>
              </div>
            ) : (
              filteredIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${getSeverityBg(issue.severity)}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle 
                      size={18} 
                      className={`flex-shrink-0 mt-0.5 ${getSeverityColor(issue.severity)}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          {issue.category}
                        </span>
                        <span className={`text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-2">{issue.message}</p>
                      
                      {issue.nudge && (
                        <div className="mb-3 p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold mb-1">💡 Socratic Nudge:</p>
                          <p className="text-xs">{issue.nudge}</p>
                        </div>
                      )}

                      {issue.suggestions && (
                        <div className="space-y-2">
                          <button
                            onClick={() => setSelectedIssue(selectedIssue === issue ? null : issue)}
                            className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                          >
                            {selectedIssue === issue ? 'Hide' : 'Show'} Options
                          </button>
                          
                          {selectedIssue === issue && (
                            <div className="space-y-2 mt-2">
                              <div className="p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold mb-1">Option A (Conservative):</p>
                                <p className="text-xs">{issue.suggestions.optionA}</p>
                              </div>
                              <div className="p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold mb-1">Option B (Aggressive):</p>
                                <p className="text-xs">{issue.suggestions.optionB}</p>
                              </div>
                              <div className="p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold mb-1">Option C (Data Request):</p>
                                <p className="text-xs">{issue.suggestions.optionC}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={analyzeSection}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#FF6B00' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </span>
              ) : (
                'Re-analyze Section'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
