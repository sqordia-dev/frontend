import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Building2, Phone, MapPin, Save, ArrowLeft, Shield, Lock, Key, AlertCircle, Upload, Image as ImageIcon, X, Rocket, Briefcase, Heart, ExternalLink, Download, Trash2, FileText, CheckCircle, Clock, Monitor, Smartphone, Globe, Eye, EyeOff } from 'lucide-react';
import { authService } from '../lib/auth-service';
import { profileService } from '../lib/profile-service';
import { securityService } from '../lib/security-service';
import { privacyService, ConsentItem, DeletionType } from '../lib/privacy-service';
import { PersonaType } from '../lib/types';
import SEO from '../components/SEO';
import { useCmsContent } from '../hooks/useCmsContent';
import { getUserFriendlyError } from '../utils/error-messages';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'sessions', label: 'Sessions', icon: Monitor },
  { id: 'privacy', label: 'Privacy & Data', icon: Lock },
] as const;

type TabId = typeof tabs[number]['id'];

export default function ProfilePage() {
  const { getContent: cms } = useCmsContent('profile');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Privacy & Data state
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionType, setDeletionType] = useState<DeletionType | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePasswordField, setShowDeletePasswordField] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    company: '',
    address: '',
    profilePictureUrl: ''
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [sessions, setSessions] = useState<any[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [userPersona, setUserPersona] = useState<PersonaType | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      load2FAStatus();
    } else if (activeTab === 'sessions') {
      loadSessions();
    } else if (activeTab === 'privacy') {
      loadConsents();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        company: data.company || '',
        address: data.address || '',
        profilePictureUrl: data.profilePictureUrl || ''
      });
      setProfilePicturePreview(data.profilePictureUrl || null);
      setProfileImageError(false);

      const userData = await authService.getCurrentUser();
      const persona = userData?.persona || localStorage.getItem('userPersona') as PersonaType | null;
      setUserPersona(persona);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const load2FAStatus = async () => {
    try {
      const status = await authService.get2FAStatus();
      setTwoFactorEnabled(status.isEnabled);
    } catch (err: any) {
      console.error('Failed to load 2FA status:', err);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await securityService.getSessions();
      setSessions(data);
    } catch (err: any) {
      console.error('Failed to load sessions:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingPicture(true);
      setError(null);

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      const fileUrl = await profileService.uploadProfilePicture(file);

      if (fileUrl.includes('mock-storage.local')) {
        console.warn('Profile picture uploaded to mock storage.');
      }

      setProfile({ ...profile, profilePictureUrl: fileUrl });
      setProfilePicturePreview(fileUrl);
      setProfileImageError(false);

      await profileService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        profilePictureUrl: fileUrl
      });

      setSuccess('Profile picture uploaded successfully');
      setTimeout(() => setSuccess(null), 5000);

      try {
        await authService.getCurrentUser();
      } catch (err) {
        console.error('Failed to reload user data:', err);
      }
    } catch (err: any) {
      console.error('Profile picture upload error:', err);
      setError(getUserFriendlyError(err, 'upload'));
      setProfileImageError(true);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await profileService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        profilePictureUrl: profile.profilePictureUrl || undefined
      });
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await profileService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;
    try {
      await securityService.revokeSession(sessionId);
      await loadSessions();
      setSuccess('Session revoked successfully');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('This will log you out from all devices. Continue?')) return;
    try {
      await securityService.revokeOtherSessions();
      setSuccess('All other sessions revoked successfully');
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadConsents = async () => {
    try {
      setLoadingConsents(true);
      const data = await privacyService.getConsents();
      setConsents(data.consents);
    } catch (err: any) {
      console.error('Failed to load consents:', err);
    } finally {
      setLoadingConsents(false);
    }
  };

  const handleUpdateConsent = async (consentType: string, version: string) => {
    try {
      setSaving(true);
      setError(null);
      await privacyService.updateConsent(consentType, version, true);
      await loadConsents();
      setSuccess(`${consentType === 'TermsOfService' ? 'Terms of Service' : 'Privacy Policy'} accepted`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      setError(null);
      const data = await privacyService.exportData();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sqordia-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Your data has been exported successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExportingData(false);
    }
  };

  const openDeleteModal = (type: DeletionType) => {
    setDeletionType(type);
    setDeletePassword('');
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!deletionType || !deletePassword) return;

    try {
      setDeletingAccount(true);
      setError(null);
      const response = await privacyService.deleteAccount(deletionType, deletePassword, deleteReason || undefined);

      setShowDeleteModal(false);

      if (response.success) {
        await authService.logout();
        navigate('/login', {
          state: {
            message: deletionType === 'Deactivate'
              ? 'Your account has been deactivated. You can reactivate it by logging in within 30 days.'
              : 'Your account has been permanently deleted.'
          }
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingAccount(false);
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    if (!deviceType) return Globe;
    const lower = deviceType.toLowerCase();
    if (lower === 'mobile' || lower === 'tablet') return Smartphone;
    return Monitor;
  };

  const getDeviceName = (session: any): string => {
    const parts: string[] = [];

    if (session.browser) parts.push(session.browser);
    if (session.operatingSystem) parts.push(`on ${session.operatingSystem}`);

    if (parts.length > 0) return parts.join(' ');
    if (session.deviceType) return session.deviceType;

    return 'Unknown Device';
  };

  const formatIpAddress = (ip: string | null): string => {
    if (!ip) return 'IP not available';
    // Remove IPv4-mapped IPv6 prefix (::ffff:)
    return ip.replace(/^::ffff:/i, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-momentum-orange animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <SEO
        title={`${cms('profile.page_title', '') || 'Profile Settings'} | Sqordia`}
        description={cms('profile.page_description', '') || 'Manage your profile, security settings, and account preferences'}
        noindex={true}
        nofollow={true}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-strategy-blue dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {cms('profile.back_to_dashboard', '') || 'Back to Dashboard'}
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-display-sm text-strategy-blue dark:text-white font-heading">
            {cms('profile.page_title', '') || 'Settings'}
          </h1>
          <p className="mt-2 text-body-md text-gray-600 dark:text-gray-400">
            {cms('profile.page_description', '') || 'Manage your account settings and preferences'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 animate-fade-in-up">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 animate-fade-in-up">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-body-sm font-medium text-emerald-800 dark:text-emerald-300">{success}</p>
              <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-card border border-gray-200/80 dark:border-gray-700/50 overflow-hidden backdrop-blur-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
            <nav className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-hide" aria-label="Settings tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-md whitespace-nowrap transition-all duration-200
                      ${isActive
                        ? 'bg-white dark:bg-gray-700 text-strategy-blue dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-strategy-blue dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cms(`profile.tab_${tab.id}`, '') || tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-8 animate-fade-in">
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative group">
                    {(profile.profilePictureUrl || profilePicturePreview) && !profileImageError ? (
                      <div className="relative">
                        <img
                          src={profilePicturePreview || profile.profilePictureUrl}
                          alt="Profile"
                          className="w-28 h-28 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-700 shadow-soft"
                          onError={() => {
                            setProfileImageError(true);
                            setProfilePicturePreview(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePicturePreview(null);
                            setProfile({ ...profile, profilePictureUrl: '' });
                            setProfileImageError(false);
                          }}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <User size={36} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-heading-sm text-strategy-blue dark:text-white">
                        {cms('profile.profile_picture_label', '') || 'Profile Picture'}
                      </h3>
                      <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                        {cms('profile.picture_help', '') || 'Upload an image (max 5MB) or enter a URL. Supported: JPEG, PNG, GIF, WebP'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="profile-picture-upload"
                        disabled={uploadingPicture}
                      />
                      <label
                        htmlFor="profile-picture-upload"
                        className={`
                          inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-md cursor-pointer transition-all duration-200
                          bg-momentum-orange text-white hover:bg-[#E55F00] shadow-sm hover:shadow-md
                          ${uploadingPicture ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                      >
                        {uploadingPicture ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{cms('profile.uploading', '') || 'Uploading...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>{cms('profile.upload_from_device', '') || 'Upload Photo'}</span>
                          </>
                        )}
                      </label>
                    </div>

                    <div className="relative max-w-md">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={profile.profilePictureUrl}
                        onChange={(e) => {
                          const url = e.target.value.trim();
                          setProfile({ ...profile, profilePictureUrl: url });
                          setError(null);
                          setProfileImageError(false);
                          if (url) {
                            try {
                              new URL(url);
                              setProfilePicturePreview(url);
                            } catch {
                              setProfilePicturePreview(null);
                            }
                          } else {
                            setProfilePicturePreview(null);
                          }
                        }}
                        onBlur={(e) => {
                          const url = e.target.value.trim();
                          if (url) {
                            try {
                              new URL(url);
                            } catch {
                              setError('Please enter a valid URL');
                              setProfilePicturePreview(null);
                            }
                          }
                        }}
                        placeholder={cms('profile.url_placeholder', '') || 'Or paste image URL...'}
                        className="w-full pl-10 pr-4 py-2.5 text-body-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-label-md text-gray-700 dark:text-gray-300">
                      {cms('profile.first_name_label', '') || 'First Name'}
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full px-4 py-3 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-label-md text-gray-700 dark:text-gray-300">
                      {cms('profile.last_name_label', '') || 'Last Name'}
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full px-4 py-3 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-label-md text-gray-700 dark:text-gray-300">
                    {cms('profile.email_label', '') || 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 text-body-md rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-body-xs text-gray-500 dark:text-gray-500">
                    {cms('profile.email_cant_change', '') || 'Email address cannot be changed'}
                  </p>
                </div>

                {/* Phone & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-label-md text-gray-700 dark:text-gray-300">
                      {cms('profile.phone_number_label', '') || 'Phone Number'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-label-md text-gray-700 dark:text-gray-300">
                      {cms('profile.company_label', '') || 'Company'}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-label-md text-gray-700 dark:text-gray-300">
                    {cms('profile.address_label', '') || 'Address'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Profile Type */}
                <div className="space-y-4">
                  <label className="block text-label-md text-gray-700 dark:text-gray-300">
                    {cms('profile.profile_type_label', '') || 'Profile Type'}
                  </label>
                  {userPersona ? (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            w-12 h-12 rounded-xl flex items-center justify-center shadow-sm
                            ${userPersona === 'Entrepreneur' ? 'bg-gradient-to-br from-momentum-orange to-orange-600' :
                              userPersona === 'Consultant' ? 'bg-gradient-to-br from-strategy-blue to-blue-800' :
                              'bg-gradient-to-br from-emerald-500 to-emerald-600'}
                          `}
                        >
                          {userPersona === 'Entrepreneur' && <Rocket size={22} className="text-white" />}
                          {userPersona === 'Consultant' && <Briefcase size={22} className="text-white" />}
                          {userPersona === 'OBNL' && <Heart size={22} className="text-white" />}
                        </div>
                        <div>
                          <p className="text-heading-sm text-strategy-blue dark:text-white">
                            {userPersona === 'Entrepreneur' && (cms('profile.entrepreneur_label', '') || 'Entrepreneur')}
                            {userPersona === 'Consultant' && (cms('profile.consultant_label', '') || 'Consultant')}
                            {userPersona === 'OBNL' && (cms('profile.obnl_label', '') || 'Non-Profit')}
                          </p>
                          <p className="text-body-sm text-gray-500 dark:text-gray-400">
                            {userPersona === 'Entrepreneur' && (cms('profile.entrepreneur_desc', '') || 'Building your own business')}
                            {userPersona === 'Consultant' && (cms('profile.consultant_desc', '') || 'Managing multiple clients')}
                            {userPersona === 'OBNL' && (cms('profile.obnl_desc', '') || 'Non-profit organization planning')}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/persona-selection"
                        className="flex items-center gap-1.5 px-4 py-2 text-label-md text-momentum-orange hover:text-[#E55F00] transition-colors"
                      >
                        {cms('profile.change', '') || 'Change'}
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600">
                      <p className="text-body-sm text-gray-500 dark:text-gray-400">
                        {cms('profile.no_profile_type', '') || 'No profile type selected'}
                      </p>
                      <Link
                        to="/persona-selection"
                        className="flex items-center gap-1.5 px-4 py-2 text-label-md text-momentum-orange hover:text-[#E55F00] transition-colors"
                      >
                        {cms('profile.select_profile_type', '') || 'Select type'}
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 text-label-md text-white bg-momentum-orange rounded-lg shadow-sm hover:bg-[#E55F00] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {cms('profile.saving', '') || 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {cms('profile.save_changes_button', '') || 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                {/* Change Password */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-heading-lg text-strategy-blue dark:text-white">
                      {cms('profile.change_password_heading', '') || 'Change Password'}
                    </h3>
                    <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="block text-label-md text-gray-700 dark:text-gray-300">
                        {cms('profile.current_password_label', '') || 'Current Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-label-md text-gray-700 dark:text-gray-300">
                        {cms('profile.new_password_label', '') || 'New Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-label-md text-gray-700 dark:text-gray-300">
                        {cms('profile.confirm_new_password_label', '') || 'Confirm New Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-label-md text-white bg-momentum-orange rounded-lg shadow-sm hover:bg-[#E55F00] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {saving ? 'Updating...' : (cms('profile.update_password_button', '') || 'Update Password')}
                    </button>
                  </form>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Two-Factor Authentication */}
                <div className="flex items-start justify-between gap-6 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${twoFactorEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <Shield className={`w-5 h-5 ${twoFactorEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>
                    <div>
                      <h4 className="text-heading-sm text-strategy-blue dark:text-white">
                        {cms('profile.two_factor_heading', '') || 'Two-Factor Authentication'}
                      </h4>
                      <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                        {cms('profile.two_factor_description', '') || 'Add an extra layer of security to your account'}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 mt-2 text-label-sm ${twoFactorEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {twoFactorEnabled ? (cms('profile.enabled', '') || 'Enabled') : (cms('profile.disabled', '') || 'Disabled')}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2.5 text-label-md rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-heading-lg text-strategy-blue dark:text-white">
                      {cms('profile.active_sessions_heading', '') || 'Active Sessions'}
                    </h3>
                    <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                      {cms('profile.active_sessions_description', '') || 'Manage your active sessions across devices'}
                    </p>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={handleRevokeAllSessions}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-label-md rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {cms('profile.revoke_all_sessions_button', '') || 'Revoke All Others'}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <Monitor className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-body-md text-gray-500 dark:text-gray-400">
                        {cms('profile.no_sessions', '') || 'No active sessions found'}
                      </p>
                    </div>
                  ) : (
                    sessions.map((session, index) => {
                      const DeviceIcon = getDeviceIcon(session.deviceType);
                      const isCurrent = session.isCurrentSession;
                      return (
                        <div
                          key={index}
                          className={`
                            flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                            ${isCurrent
                              ? 'bg-momentum-orange/5 dark:bg-momentum-orange/10 border-momentum-orange/30'
                              : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-momentum-orange/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                              <DeviceIcon className={`w-5 h-5 ${isCurrent ? 'text-momentum-orange' : 'text-gray-500 dark:text-gray-400'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-heading-sm text-strategy-blue dark:text-white">
                                  {getDeviceName(session)}
                                </p>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 text-label-sm text-momentum-orange bg-momentum-orange/10 rounded-full">
                                    {cms('profile.current_session_badge', '') || 'Current'}
                                  </span>
                                )}
                              </div>
                              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                                {formatIpAddress(session.ipAddress)}
                                {session.lastActivityAt && ` · Last active ${new Date(session.lastActivityAt).toLocaleDateString()}`}
                              </p>
                            </div>
                          </div>
                          {!isCurrent && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="px-3 py-1.5 text-label-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            >
                              {cms('profile.revoke_session_button', '') || 'Revoke'}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-8 animate-fade-in">
                {/* Consent Management */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-heading-lg text-strategy-blue dark:text-white">
                      {cms('profile.consent_heading', '') || 'Consent Management'}
                    </h3>
                    <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                      {cms('profile.consent_description', '') || 'Manage your consent for Terms of Service and Privacy Policy'}
                    </p>
                  </div>

                  {loadingConsents ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-momentum-orange rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consents.map((consent) => (
                        <div
                          key={consent.type}
                          className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${consent.isAccepted ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                              {consent.isAccepted ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-heading-sm text-strategy-blue dark:text-white">
                                {consent.type === 'TermsOfService' ? 'Terms of Service' : 'Privacy Policy'}
                              </p>
                              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                                {consent.isAccepted
                                  ? `Accepted v${consent.version} on ${new Date(consent.acceptedAt!).toLocaleDateString()}`
                                  : 'Not yet accepted'}
                              </p>
                              {consent.requiresUpdate && (
                                <p className="text-label-sm text-amber-600 dark:text-amber-400 mt-1">
                                  New version available (v{consent.latestVersion})
                                </p>
                              )}
                            </div>
                          </div>
                          {(!consent.isAccepted || consent.requiresUpdate) && (
                            <button
                              onClick={() => handleUpdateConsent(consent.type, consent.latestVersion)}
                              disabled={saving}
                              className="px-4 py-2 text-label-md text-white bg-momentum-orange rounded-lg hover:bg-[#E55F00] disabled:opacity-60 transition-colors"
                            >
                              {saving ? 'Accepting...' : 'Accept'}
                            </button>
                          )}
                        </div>
                      ))}
                      {consents.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-body-md text-gray-500 dark:text-gray-400">No consent records found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Data Export */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-heading-lg text-strategy-blue dark:text-white">
                      {cms('profile.export_heading', '') || 'Export Your Data'}
                    </h3>
                    <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                      {cms('profile.export_description', '') || 'Download a copy of your personal data in a machine-readable format (JSON).'}
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={exportingData}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-label-md rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 transition-colors"
                  >
                    {exportingData ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{cms('profile.download_data_button', '') || 'Download My Data'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Account Deletion */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-heading-lg text-strategy-blue dark:text-white">
                      {cms('profile.delete_heading', '') || 'Delete Account'}
                    </h3>
                    <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                      {cms('profile.delete_description', '') || 'You can deactivate your account temporarily or permanently delete it.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Deactivate */}
                    <div className="p-5 rounded-xl border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-heading-sm text-strategy-blue dark:text-white">
                            {cms('profile.deactivate_heading', '') || 'Deactivate Account'}
                          </h4>
                          <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                            {cms('profile.deactivate_description', '') || 'Account disabled for 30 days. Log in to reactivate.'}
                          </p>
                          <button
                            onClick={() => openDeleteModal('Deactivate')}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-label-md rounded-lg border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                            Deactivate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Permanent Delete */}
                    <div className="p-5 rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-heading-sm text-strategy-blue dark:text-white">
                            {cms('profile.permanent_delete_heading', '') || 'Permanently Delete'}
                          </h4>
                          <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                            {cms('profile.permanent_delete_description', '') || 'All data permanently deleted. Cannot be recovered.'}
                          </p>
                          <button
                            onClick={() => openDeleteModal('Permanent')}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-label-md rounded-lg border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && deletionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-elevated max-w-md w-full overflow-hidden animate-scale-in">
            <div className={`px-6 py-4 ${deletionType === 'Deactivate' ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deletionType === 'Deactivate' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {deletionType === 'Deactivate' ? (
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h3 className="text-heading-lg text-strategy-blue dark:text-white">
                  {deletionType === 'Deactivate' ? 'Deactivate Account' : 'Delete Account'}
                </h3>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {deletionType === 'Permanent' && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-body-sm text-red-800 dark:text-red-300">
                    <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              )}

              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                {deletionType === 'Deactivate'
                  ? 'Your account will be deactivated. You can reactivate it within 30 days by logging in.'
                  : 'Enter your password to confirm permanent deletion.'}
              </p>

              <div className="space-y-2">
                <label className="block text-label-md text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showDeletePasswordField ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePasswordField(!showDeletePasswordField)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showDeletePasswordField ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-label-md text-gray-700 dark:text-gray-300">
                  Reason (optional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Help us improve..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 text-body-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-momentum-orange focus:ring-2 focus:ring-momentum-orange/20 outline-none transition-all resize-none"
                />
                <p className="text-body-xs text-gray-500 dark:text-gray-500 text-right">{deleteReason.length}/500</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-label-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || deletingAccount}
                className={`
                  px-4 py-2.5 text-label-md text-white rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed
                  ${deletionType === 'Deactivate'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }
                `}
              >
                {deletingAccount
                  ? 'Processing...'
                  : deletionType === 'Deactivate'
                  ? 'Deactivate Account'
                  : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
