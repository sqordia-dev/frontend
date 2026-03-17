import { useState, useEffect } from 'react';
import { Building2, Save, RefreshCw, Check } from 'lucide-react';
import { useOrganizationProfile } from '../../hooks/useOrganizationProfile';
import ProfileCompletionBadge from './ProfileCompletionBadge';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { INDUSTRY_OPTIONS, GOAL_OPTIONS } from '../../types/onboarding';
import type { UpdateOrganizationProfileRequest } from '../../types/organization-profile';

const TEAM_SIZES = ['Solo', '2-5', '6-20', '20+'];
const BUSINESS_STAGES = ['Idea', 'Startup', 'Established'];
const FUNDING_STATUSES = ['Bootstrapped', 'Seeking', 'Funded'];
const TARGET_MARKETS = ['B2B', 'B2C', 'B2B2C', 'B2G'];

export default function OrganizationProfileTab() {
  const { t } = useTheme();
  const { profile, isLoading, error, updateProfile, refreshProfile, completionInfo } = useOrganizationProfile();
  const { success: showSuccess, error: showError } = useToast();

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    sector: '',
    teamSize: '',
    fundingStatus: '',
    targetMarket: '',
    businessStage: '',
    city: '',
    province: '',
    country: '',
    goals: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      let parsedGoals: string[] = [];
      if (profile.goalsJson) {
        try { parsedGoals = JSON.parse(profile.goalsJson); } catch { /* ignore */ }
      }
      setForm({
        name: profile.name || '',
        description: profile.description || '',
        website: profile.website || '',
        industry: profile.industry || '',
        sector: profile.sector || '',
        teamSize: profile.teamSize || '',
        fundingStatus: profile.fundingStatus || '',
        targetMarket: profile.targetMarket || '',
        businessStage: profile.businessStage || '',
        city: profile.city || '',
        province: profile.province || '',
        country: profile.country || '',
        goals: parsedGoals,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError('Validation Error', 'Organization name is required');
      return;
    }

    setIsSaving(true);
    try {
      const request: UpdateOrganizationProfileRequest = {
        name: form.name,
        description: form.description || undefined,
        website: form.website || undefined,
        industry: form.industry || undefined,
        sector: form.sector || undefined,
        teamSize: form.teamSize || undefined,
        fundingStatus: form.fundingStatus || undefined,
        targetMarket: form.targetMarket || undefined,
        businessStage: form.businessStage || undefined,
        goalsJson: form.goals.length > 0 ? JSON.stringify(form.goals) : undefined,
        city: form.city || undefined,
        province: form.province || undefined,
        country: form.country || undefined,
      };
      await updateProfile(request);
      showSuccess('Profile Updated', 'Organization profile saved successfully.');
    } catch (err: any) {
      showError('Update Failed', err.message || 'Failed to update organization profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setForm(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="text-center py-12">
        <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 mb-4">No organization found. Complete onboarding to create one.</p>
        <button onClick={refreshProfile} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with completion badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organization Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your organization's business context</p>
        </div>
        <div className="flex items-center gap-3">
          <ProfileCompletionBadge score={completionInfo.score} size="md" />
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{completionInfo.score}% Complete</p>
            <p className="text-xs text-gray-500">{completionInfo.filled.length}/{completionInfo.filled.length + completionInfo.missing.length} fields</p>
          </div>
        </div>
      </div>

      {/* Name + Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            autoComplete="organization"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://..."
            autoComplete="url"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Business Context */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select industry...</option>
              {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sector</label>
            <input
              type="text"
              value={form.sector}
              onChange={(e) => setForm(prev => ({ ...prev, sector: e.target.value }))}
              placeholder="e.g., SaaS, E-commerce..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Stage</label>
            <div className="flex gap-2">
              {BUSINESS_STAGES.map(stage => (
                <button
                  key={stage}
                  onClick={() => setForm(prev => ({ ...prev, businessStage: prev.businessStage === stage ? '' : stage }))}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.businessStage === stage
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Size</label>
            <div className="flex gap-2">
              {TEAM_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setForm(prev => ({ ...prev, teamSize: prev.teamSize === size ? '' : size }))}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.teamSize === size
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Status</label>
            <div className="flex gap-2">
              {FUNDING_STATUSES.map(f => (
                <button
                  key={f}
                  onClick={() => setForm(prev => ({ ...prev, fundingStatus: prev.fundingStatus === f ? '' : f }))}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.fundingStatus === f
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Market</label>
            <div className="flex gap-2">
              {TARGET_MARKETS.map(m => (
                <button
                  key={m}
                  onClick={() => setForm(prev => ({ ...prev, targetMarket: prev.targetMarket === m ? '' : m }))}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.targetMarket === m
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
              autoComplete="address-level2"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province</label>
            <input
              type="text"
              value={form.province}
              onChange={(e) => setForm(prev => ({ ...prev, province: e.target.value }))}
              autoComplete="address-level1"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))}
              placeholder="Canada"
              autoComplete="country-name"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Goals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {GOAL_OPTIONS.map(goal => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`relative px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                form.goals.includes(goal)
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {form.goals.includes(goal) && <Check size={14} className="absolute top-1.5 right-1.5 text-orange-500" />}
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all ${
            isSaving ? 'bg-orange-400 cursor-wait' : 'bg-momentum-orange hover:bg-[#E56000] shadow-md shadow-momentum-orange/20'
          }`}
        >
          {isSaving ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
          ) : (
            <><Save size={18} /> Update Profile</>
          )}
        </button>
      </div>
    </div>
  );
}
