import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FlaskConical,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import { ABTestingPanel } from '../../../components/admin/prompt-registry';
import type { PromptTemplateListDto } from '../../../types/prompt-registry';

export function AIStudioABTestingPage() {
  const { language } = useTheme();
  const [prompts, setPrompts] = useState<PromptTemplateListDto[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === 'fr' ? 'Tests A/B' : 'A/B Testing',
    subtitle: language === 'fr'
      ? 'Comparez deux prompts côte à côte pour identifier les plus performants'
      : 'Compare two prompts side-by-side to identify top performers',
    back: language === 'fr' ? 'Retour à AI Studio' : 'Back to AI Studio',
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const result = await promptRegistryService.getAll({ pageSize: 100, isActive: true });
      setPrompts(result.items);
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/ai-studio"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-sm font-medium text-amber-400">Beta</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <ABTestingPanel
            isOpen={true}
            onClose={() => {}}
            prompts={prompts}
            language={language as 'en' | 'fr'}
            embedded={true}
          />
        )}
      </div>
    </div>
  );
}

export default AIStudioABTestingPage;
