'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Building2,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Briefcase,
  Heart,
  Rocket,
} from 'lucide-react';

type TabId = 'profile' | 'security' | 'privacy';

const translations = {
  en: {
    back: 'Back to Dashboard',
    title: 'Account Settings',
    tabs: {
      profile: 'Profile',
      security: 'Security',
      privacy: 'Privacy',
    },
    profile: {
      title: 'Profile Information',
      subtitle: 'Update your personal information and profile picture.',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      company: 'Company',
      address: 'Address',
      persona: 'Profile Type',
      personaTypes: {
        entrepreneur: 'Entrepreneur',
        consultant: 'Consultant',
        obnl: 'Non-profit',
      },
      save: 'Save Changes',
      saving: 'Saving...',
      saved: 'Changes saved successfully',
    },
    security: {
      title: 'Security Settings',
      subtitle: 'Manage your password and security preferences.',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      updatePassword: 'Update Password',
      updating: 'Updating...',
      passwordUpdated: 'Password updated successfully',
      twoFactor: 'Two-Factor Authentication',
      twoFactorDesc: 'Add an extra layer of security to your account.',
      enabled: 'Enabled',
      disabled: 'Disabled',
    },
    privacy: {
      title: 'Privacy & Data',
      subtitle: 'Manage your data and privacy preferences.',
      dataExport: 'Export Your Data',
      dataExportDesc: 'Download a copy of all your data.',
      exportButton: 'Export Data',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'Permanently delete your account and all associated data.',
      deleteButton: 'Delete Account',
    },
    errors: {
      loadFailed: 'Failed to load profile',
      saveFailed: 'Failed to save changes',
      passwordMismatch: 'Passwords do not match',
      passwordRequired: 'All password fields are required',
    },
  },
  fr: {
    back: 'Retour au tableau de bord',
    title: 'Paramètres du compte',
    tabs: {
      profile: 'Profil',
      security: 'Sécurité',
      privacy: 'Confidentialité',
    },
    profile: {
      title: 'Informations du profil',
      subtitle: 'Mettez à jour vos informations personnelles et votre photo de profil.',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Courriel',
      phone: 'Téléphone',
      company: 'Entreprise',
      address: 'Adresse',
      persona: 'Type de profil',
      personaTypes: {
        entrepreneur: 'Entrepreneur',
        consultant: 'Consultant',
        obnl: 'OBNL',
      },
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      saved: 'Modifications enregistrées',
    },
    security: {
      title: 'Paramètres de sécurité',
      subtitle: 'Gérez votre mot de passe et vos préférences de sécurité.',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      updatePassword: 'Mettre à jour',
      updating: 'Mise à jour...',
      passwordUpdated: 'Mot de passe mis à jour',
      twoFactor: 'Authentification à deux facteurs',
      twoFactorDesc: 'Ajoutez une couche de sécurité supplémentaire à votre compte.',
      enabled: 'Activée',
      disabled: 'Désactivée',
    },
    privacy: {
      title: 'Confidentialité et données',
      subtitle: 'Gérez vos données et préférences de confidentialité.',
      dataExport: 'Exporter vos données',
      dataExportDesc: 'Téléchargez une copie de toutes vos données.',
      exportButton: 'Exporter',
      deleteAccount: 'Supprimer le compte',
      deleteAccountDesc: 'Supprimez définitivement votre compte et toutes les données associées.',
      deleteButton: 'Supprimer',
    },
    errors: {
      loadFailed: 'Échec du chargement du profil',
      saveFailed: 'Échec de la sauvegarde',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordRequired: 'Tous les champs de mot de passe sont requis',
    },
  },
};

const personaIcons = {
  entrepreneur: Rocket,
  consultant: Briefcase,
  obnl: Heart,
};

export default function ProfileContent({ locale }: { locale: string }) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    company: '',
    address: '',
    persona: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          company: data.company || '',
          address: data.address || '',
          persona: data.persona || localStorage.getItem('userPersona') || '',
        });
      }
    } catch (err) {
      setError(t.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error('Failed to save');
      setSuccess(t.profile.saved);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t.errors.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError(t.errors.passwordRequired);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t.errors.passwordMismatch);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to update password');
      setSuccess(t.security.passwordUpdated);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t.errors.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: t.tabs.profile, icon: User },
    { id: 'security' as const, label: t.tabs.security, icon: Shield },
    { id: 'privacy' as const, label: t.tabs.privacy, icon: Lock },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href={`${basePath}/dashboard`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t.title}
      </h1>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.profile.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.profile.subtitle}
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.profile.firstName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.profile.lastName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t.profile.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.profile.phone}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.profile.company}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t.profile.address}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>
            </div>

            {profile.persona && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.profile.persona}
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  {(() => {
                    const Icon = personaIcons[profile.persona as keyof typeof personaIcons] || User;
                    return <Icon className="h-5 w-5 text-[#FF6B00]" />;
                  })()}
                  <span className="text-gray-900 dark:text-white font-medium">
                    {t.profile.personaTypes[profile.persona as keyof typeof t.profile.personaTypes] || profile.persona}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? t.profile.saving : t.profile.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.security.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.security.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {/* Change Password */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                {t.security.changePassword}
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t.security.currentPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t.security.newPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t.security.confirmPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? t.security.updating : t.security.updatePassword}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.privacy.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.privacy.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {/* Export Data */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {t.privacy.dataExport}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t.privacy.dataExportDesc}
              </p>
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                {t.privacy.exportButton}
              </button>
            </div>

            {/* Delete Account */}
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">
                {t.privacy.deleteAccount}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                {t.privacy.deleteAccountDesc}
              </p>
              <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                {t.privacy.deleteButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
