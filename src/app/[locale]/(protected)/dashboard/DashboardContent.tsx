'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Layers,
  TrendingUp,
  Clock,
  Trash2,
  Copy,
  MoreVertical,
  Eye,
  Play,
} from 'lucide-react';

interface BusinessPlan {
  id: string;
  title: string;
  description?: string;
  status: string;
  businessType?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

const translations = {
  en: {
    welcome: 'Welcome back',
    subtitle: 'Manage your business plans and track your progress',
    newPlan: 'New Plan',
    showTour: 'Show Tour',
    totalProjects: 'Total Projects',
    inProgress: 'In Progress',
    completed: 'Completed',
    lastActivity: 'Last Activity',
    createNextPlan: 'Ready to create your next plan?',
    createNextPlanDesc: 'Get started with AI-powered guidance to build a professional business plan.',
    getStarted: 'Get started',
    recentProjects: 'Recent Projects',
    noPlans: 'No plans yet',
    noPlansDesc: 'Create your first business plan to get started on your entrepreneurial journey.',
    createFirstPlan: 'Create Your First Plan',
    viewAll: 'View all',
    resume: 'Resume',
    view: 'View',
    viewPlan: 'View Plan',
    noDescription: 'No description',
    deletePlan: 'Delete',
    duplicatePlan: 'Duplicate',
    status: {
      draft: 'Draft',
      completed: 'Completed',
      active: 'Active',
      inProgress: 'In Progress',
      generating: 'Generating',
      generated: 'Generated',
      exported: 'Exported',
    },
    deleteConfirm: 'Are you sure you want to delete',
    deleteWarning: 'This action cannot be undone.',
    cancel: 'Cancel',
    deleting: 'Deleting...',
    deleteButton: 'Delete Plan',
  },
  fr: {
    welcome: 'Bon retour',
    subtitle: "Gérez vos plans d'affaires et suivez votre progression",
    newPlan: 'Nouveau plan',
    showTour: 'Visite guidée',
    totalProjects: 'Total des projets',
    inProgress: 'En cours',
    completed: 'Terminés',
    lastActivity: 'Dernière activité',
    createNextPlan: 'Prêt à créer votre prochain plan?',
    createNextPlanDesc: "Commencez avec l'accompagnement IA pour créer un plan d'affaires professionnel.",
    getStarted: 'Commencer',
    recentProjects: 'Projets récents',
    noPlans: 'Aucun plan',
    noPlansDesc: "Créez votre premier plan d'affaires pour démarrer votre parcours entrepreneurial.",
    createFirstPlan: 'Créer votre premier plan',
    viewAll: 'Voir tout',
    resume: 'Reprendre',
    view: 'Voir',
    viewPlan: 'Voir le plan',
    noDescription: 'Aucune description',
    deletePlan: 'Supprimer',
    duplicatePlan: 'Dupliquer',
    status: {
      draft: 'Brouillon',
      completed: 'Terminé',
      active: 'Actif',
      inProgress: 'En cours',
      generating: 'Génération',
      generated: 'Généré',
      exported: 'Exporté',
    },
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer',
    deleteWarning: 'Cette action est irréversible.',
    cancel: 'Annuler',
    deleting: 'Suppression...',
    deleteButton: 'Supprimer le plan',
  },
};

export default function DashboardContent({ locale }: { locale: string }) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';

  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<BusinessPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business-plans');
      if (response.ok) {
        const data = await response.json();
        const activePlans = (data.plans || data || []).filter((p: BusinessPlan) => !p.isDeleted);
        setPlans(activePlans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (plan: BusinessPlan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    try {
      setDeletingPlanId(planToDelete.id);
      await fetch(`/api/business-plans/${planToDelete.id}`, { method: 'DELETE' });
      setPlans(plans.filter(p => p.id !== planToDelete.id));
      setShowDeleteModal(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Failed to delete plan:', error);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDuplicate = async (planId: string) => {
    try {
      const response = await fetch(`/api/business-plans/${planId}/duplicate`, { method: 'POST' });
      if (response.ok) {
        const duplicated = await response.json();
        setPlans([...plans, duplicated]);
      }
    } catch (error) {
      console.error('Failed to duplicate plan:', error);
    }
    setOpenMenuId(null);
  };

  // Stats
  const totalPlans = plans.length;
  const draftCount = plans.filter(p => p.status?.toLowerCase() === 'draft').length;
  const completedCount = plans.filter(p => ['completed', 'generated', 'exported'].includes(p.status?.toLowerCase() || '')).length;
  const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-US';

  const recentActivity = (() => {
    const validDates = plans
      .map(p => new Date(p.updatedAt || p.createdAt || 0).getTime())
      .filter(time => time > 86400000);
    return validDates.length > 0
      ? new Date(Math.max(...validDates)).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
      : '—';
  })();

  const sortedPlans = [...plans].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  const recentPlans = sortedPlans.slice(0, 5);

  const getStatusLabel = (status: string) => {
    const key = status?.toLowerCase() as keyof typeof t.status;
    return t.status[key] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'generated':
      case 'exported':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      case 'generating':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-10 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-5 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.welcome}
          </h1>
          <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-xl">
            {t.subtitle}
          </p>
        </div>
        <Link
          href={`${basePath}/create-plan`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          {t.newPlan}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalProjects}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPlans}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FolderOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.inProgress}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{draftCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.completed}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.lastActivity}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentActivity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Plan CTA */}
      <Link href={`${basePath}/create-plan`} className="block group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A2B47] via-[#1A2B47] to-[#0f1a2e] p-8 lg:p-10 transition-all duration-300 hover:shadow-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FF6B00]/20 blur-3xl transition-all duration-500 group-hover:bg-[#FF6B00]/30" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF6B00] shadow-lg shadow-[#FF6B00]/30 transition-transform duration-300 group-hover:scale-105">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {t.createNextPlan}
                </h3>
                <p className="text-sm lg:text-base text-white/70 mt-1">
                  {t.createNextPlanDesc}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              <span className="text-sm font-medium text-white/80 hidden sm:inline">
                {t.getStarted}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:bg-[#FF6B00] group-hover:border-[#FF6B00] group-hover:scale-110">
                <ArrowRight className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t.recentProjects}
            </h2>
          </div>
        </div>

        {recentPlans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.noPlans}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                {t.noPlansDesc}
              </p>
              <Link
                href={`${basePath}/create-plan`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t.createFirstPlan}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {plan.title || 'Untitled Plan'}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                        {getStatusLabel(plan.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {plan.description || t.noDescription}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(plan.createdAt).toLocaleDateString(dateLocale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {plan.status?.toLowerCase() === 'draft' ? (
                      <Link
                        href={`${basePath}/questionnaire/${plan.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {t.resume}
                      </Link>
                    ) : (
                      <Link
                        href={`${basePath}/business-plan/${plan.id}/preview`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t.view}
                      </Link>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === plan.id ? null : plan.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === plan.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                            <button
                              onClick={() => handleDuplicate(plan.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                              {t.duplicatePlan}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(plan)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t.deletePlan}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowDeleteModal(false);
              setPlanToDelete(null);
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t.deletePlan}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {t.deleteConfirm} <span className="font-medium text-gray-900 dark:text-white">"{planToDelete.title}"</span>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              {t.deleteWarning}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlanToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={!!deletingPlanId}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={!!deletingPlanId}
              >
                {deletingPlanId ? t.deleting : t.deleteButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
