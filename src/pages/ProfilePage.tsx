import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Building2, Phone, MapPin, Save, ArrowLeft, Shield, Lock, Key, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import { authService } from '../lib/auth-service';
import { profileService } from '../lib/profile-service';
import { securityService } from '../lib/security-service';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Landing page color theme
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');

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
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [sessions, setSessions] = useState<any[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      load2FAStatus();
    } else if (activeTab === 'sessions') {
      loadSessions();
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
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }
      
      // Upload file
      const fileUrl = await profileService.uploadProfilePicture(file);
      
      // Update profile with new picture URL
      setProfile({ ...profile, profilePictureUrl: fileUrl });
      setProfilePicturePreview(fileUrl);
      
      // Also update the profile in the backend
      await profileService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        profilePictureUrl: fileUrl
      });
      
      setSuccess('Profile picture uploaded successfully');
      
      // Reload user data to update the sidebar
      try {
        const userData = await authService.getCurrentUser();
        // The DashboardLayout will pick up the change on next render
      } catch (err) {
        console.error('Failed to reload user data:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input so the same file can be selected again
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 rounded-full dark:border-gray-700" style={{ borderColor: theme === 'dark' ? undefined : lightAIGrey }}></div>
          <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: momentumOrange }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center dark:text-gray-300 hover:opacity-80 transition-opacity"
            style={{ color: strategyBlue }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>Profile Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <p className="text-orange-800 dark:text-orange-300">{success}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-gray-200 dark:border-gray-700">
          <div className="border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'dark:text-white'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                style={activeTab === 'profile' ? {
                  borderBottomColor: momentumOrange,
                  color: theme === 'dark' ? undefined : strategyBlue
                } : {}}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'security'
                    ? 'dark:text-white'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                style={activeTab === 'security' ? {
                  borderBottomColor: momentumOrange,
                  color: theme === 'dark' ? undefined : strategyBlue
                } : {}}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sessions'
                    ? 'dark:text-white'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                style={activeTab === 'sessions' ? {
                  borderBottomColor: momentumOrange,
                  color: theme === 'dark' ? undefined : strategyBlue
                } : {}}
              >
                <Key className="w-4 h-4 inline mr-2" />
                Sessions
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Picture Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {profilePicturePreview ? (
                        <div className="relative group">
                          <img
                            src={profilePicturePreview}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                            onError={() => setProfilePicturePreview(null)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePicturePreview(null);
                              setProfile({ ...profile, profilePictureUrl: '' });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                          <User className="text-gray-400" size={40} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* File Upload Button */}
                      <div>
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
                          className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                            uploadingPicture ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploadingPicture ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm font-medium">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={16} />
                              <span className="text-sm font-medium">Upload from device</span>
                            </>
                          )}
                        </label>
                      </div>
                      
                      {/* URL Input */}
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          value={profile.profilePictureUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            setProfile({ ...profile, profilePictureUrl: url });
                            if (url) {
                              setProfilePicturePreview(url);
                            } else {
                              setProfilePicturePreview(null);
                            }
                          }}
                          placeholder="Or enter a URL to your profile picture"
                          className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent text-sm transition-colors"
                      style={{ 
                        focusRingColor: momentumOrange,
                        '--tw-ring-color': momentumOrange
                      } as React.CSSProperties & { focusRingColor?: string }}
                      onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload an image (max 5MB) or enter a URL. Supported formats: JPEG, PNG, GIF, WebP
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                        onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                        onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                      onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                      onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                      onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-6 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: momentumOrange }}
                    onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                    onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = momentumOrange)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                        onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                        onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-transparent transition-colors"
                        onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: momentumOrange }}
                      onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                      onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = momentumOrange)}
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                      <p className={`text-sm mt-1 font-medium ${twoFactorEnabled ? 'text-orange-600' : 'text-gray-500'}`}>
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your active sessions across devices</p>
                  </div>
                  <button
                    onClick={handleRevokeAllSessions}
                    className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Revoke All Other Sessions
                  </button>
                </div>

                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No active sessions</p>
                  ) : (
                    sessions.map((session, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.deviceName || 'Unknown Device'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {session.ipAddress || 'IP not available'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Last active: {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'Unknown'}
                            </p>
                          </div>
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              Revoke
                            </button>
                          )}
                          {session.isCurrent && (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
