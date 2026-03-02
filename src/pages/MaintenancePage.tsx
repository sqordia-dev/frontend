import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cog, RefreshCw, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { maintenanceService } from '../lib/maintenance-service';
import SEO from '../components/SEO';

export default function MaintenancePage() {
  const { language, theme } = useTheme();
  const { status, refetch, timeRemaining } = useMaintenance();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const isDark = theme === 'dark';
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';

  // Update last checked time on each poll
  useEffect(() => {
    if (status) {
      setLastChecked(new Date());
    }
  }, [status]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastChecked(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const content = {
    en: {
      title: 'Under Maintenance',
      heading: "We're upgrading Sqordia",
      subtitle: 'Our team is deploying improvements to make your experience even better.',
      progressLabel: 'Deployment Progress',
      estimatedTime: 'Estimated completion',
      currentStep: 'Current step',
      autoRefresh: 'Auto-refreshing',
      checkStatus: 'Check Status',
      almostDone: 'Almost done!',
      startingSoon: 'Starting soon...',
      thankYou: 'Thank you for your patience.',
    },
    fr: {
      title: 'En maintenance',
      heading: 'Nous ameliorons Sqordia',
      subtitle: 'Notre equipe deploie des ameliorations pour optimiser votre experience.',
      progressLabel: 'Progression du deploiement',
      estimatedTime: 'Fin estimee',
      currentStep: 'Etape actuelle',
      autoRefresh: 'Actualisation auto',
      checkStatus: 'Verifier le statut',
      almostDone: 'Presque termine!',
      startingSoon: 'Demarrage imminent...',
      thankYou: 'Merci de votre patience.',
    },
  };

  const t = content[language as keyof typeof content] || content.en;
  const progress = status?.progressPercent ?? 0;
  const currentStep = status?.currentStep || t.startingSoon;

  // Format time remaining
  const formatTime = () => {
    if (!timeRemaining) return t.almostDone;
    const { hours, minutes, seconds } = timeRemaining;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundColor: isDark ? '#0f1419' : '#f8fafc',
      }}
    >
      <SEO
        title={`${t.title} | Sqordia`}
        description={t.subtitle}
        noindex={true}
      />

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? 'ffffff' : '1A2B47'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs for depth */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
        style={{
          background: `radial-gradient(circle, ${momentumOrange} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
        style={{
          background: `radial-gradient(circle, ${strategyBlue} 0%, transparent 70%)`,
          transform: 'translate(-30%, 30%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 py-6 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: strategyBlue,
              boxShadow: `0 4px 14px -2px ${strategyBlue}40`,
            }}
          >
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: isDark ? '#f1f5f9' : strategyBlue }}
          >
            Sqordia
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Animated gear icon */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <div
                className="absolute w-32 h-32 rounded-full opacity-20"
                style={{
                  background: `radial-gradient(circle, ${momentumOrange}30 0%, transparent 70%)`,
                }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Cog
                  className="w-16 h-16"
                  style={{ color: momentumOrange }}
                  strokeWidth={1.5}
                />
              </motion.div>
            </div>

            {/* Heading */}
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight"
              style={{ color: isDark ? '#f1f5f9' : strategyBlue }}
            >
              {t.heading}
            </h1>
            <p
              className="text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              {t.subtitle}
            </p>

            {/* Progress card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-6 sm:p-8 mb-6"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                boxShadow: isDark
                  ? '0 4px 24px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    {t.progressLabel}
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: momentumOrange }}
                  >
                    {progress}%
                  </span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  <motion.div
                    className="h-full rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: `linear-gradient(90deg, ${momentumOrange} 0%, #ff8c40 100%)`,
                      boxShadow: `0 0 20px ${momentumOrange}60`,
                    }}
                  >
                    {/* Shimmer effect */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ borderRadius: 'inherit' }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          width: '50%',
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Current step */}
              <div
                className="flex items-center gap-3 p-4 rounded-xl mb-6"
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  {progress >= 100 ? (
                    <CheckCircle2
                      className="w-5 h-5"
                      style={{ color: '#10b981' }}
                    />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Loader2
                        className="w-5 h-5"
                        style={{ color: momentumOrange }}
                      />
                    </motion.div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-0.5"
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  >
                    {t.currentStep}
                  </p>
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                  >
                    {currentStep}
                  </p>
                </div>
              </div>

              {/* Time remaining */}
              {status?.estimatedEnd && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock
                    className="w-4 h-4"
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    {t.estimatedTime}:
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: isDark ? '#e2e8f0' : strategyBlue }}
                  >
                    {formatTime()}
                  </span>
                </div>
              )}

              {/* Auto-refresh indicator + Manual refresh */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: '#10b981' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: '#10b981' }}
                    />
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  >
                    {t.autoRefresh}
                  </span>
                </div>

                <span
                  className="text-xs"
                  style={{ color: isDark ? '#475569' : '#cbd5e1' }}
                >
                  |
                </span>

                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ color: momentumOrange }}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  {t.checkStatus}
                </button>
              </div>
            </motion.div>

            {/* Thank you message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              {t.thankYou}
            </motion.p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 sm:px-8 text-center">
        <p
          className="text-xs"
          style={{ color: isDark ? '#475569' : '#cbd5e1' }}
        >
          &copy; {new Date().getFullYear()} Sqordia. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
