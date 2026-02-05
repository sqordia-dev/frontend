import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../lib/admin-service';
import { rolesService } from '../../lib/roles-service';
import {
  ArrowLeft, AlertCircle, X, Shield, ShieldCheck, ShieldOff, Loader2,
  CheckCircle2, XCircle, KeyRound, Pencil, Ban, Check, ChevronDown,
  LogIn, LogOut, Monitor, Globe, Clock, Fingerprint, Building2, FileText,
  Mail, Phone, User, Copy, RefreshCw, Trash2, Smartphone, Laptop, Lock, Unlock
} from 'lucide-react';


const statusColors: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  Inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20',
  Suspended: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Banned: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  PendingVerification: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
};

const providerLabels: Record<string, { label: string; color: string }> = {
  local: { label: 'Local', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
  google: { label: 'Google', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  microsoft: { label: 'Microsoft', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' },
};

type Tab = 'overview' | 'organizations' | 'sessions' | 'history';

function getStatusLabel(user: any): string {
  if (user.status) return user.status;
  return user.isActive ? 'Active' : 'Inactive';
}

function fmtDate(d: string | null | undefined, withTime = false): string {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  if (withTime) return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function timeAgo(d: string | null | undefined): string {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return fmtDate(d);
}

function getDeviceIcon(deviceType: string | null | undefined) {
  if (!deviceType) return Monitor;
  const d = deviceType.toLowerCase();
  if (d.includes('mobile') || d.includes('phone')) return Smartphone;
  if (d.includes('tablet')) return Laptop;
  return Monitor;
}

export default function AdminUserDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Sessions & History
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Roles
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);

  // Edit profile
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Status dropdown
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // Copied ID
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUser();
      loadRoles();
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'sessions' && userId) loadSessions();
    if (activeTab === 'history' && userId) loadHistory();
  }, [activeTab, userId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUserDetail(userId!);
      setUser(data);
      setUserRoles(data.roles || []);
      setEditForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        userName: data.userName || '',
        userType: data.userType || 'Entrepreneur',
        phoneNumber: data.phoneNumber || '',
        emailVerified: data.emailVerified || false,
        isActive: getStatusLabel(data) === 'Active',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await rolesService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await adminService.getUserSessions(userId!);
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(`Failed to load sessions: ${err.message}`);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await adminService.getUserLoginHistory(userId!, 100);
      setLoginHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(`Failed to load login history: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      setShowStatusMenu(false);
      await adminService.updateUserStatus(userId!, status, `Admin changed status to ${status}`);
      setSuccessMsg(`User status changed to ${status}`);
      await loadUser();
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  const handleResetPassword = async () => {
    try {
      await adminService.resetUserPassword(userId!);
      setSuccessMsg('Password reset successfully. User will be required to change password on next login.');
    } catch (err: any) {
      setError(`Failed to reset password: ${err.message}`);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await adminService.updateUserProfile(userId!, editForm);
      setSuccessMsg('Profile updated successfully');
      setShowEdit(false);
      await loadUser();
    } catch (err: any) {
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignRole = async (roleId: string) => {
    try {
      await rolesService.assignRole(userId!, roleId);
      setSuccessMsg('Role assigned');
      setShowAddRole(false);
      await loadUser();
    } catch (err: any) {
      setError(`Failed to assign role: ${err.message}`);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await rolesService.removeUserRole(userId!, roleId);
      setSuccessMsg('Role removed');
      await loadUser();
    } catch (err: any) {
      setError(`Failed to remove role: ${err.message}`);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await adminService.terminateUserSession(userId!, sessionId);
      setSuccessMsg('Session terminated');
      await loadSessions();
      await loadUser();
    } catch (err: any) {
      setError(`Failed to terminate session: ${err.message}`);
    }
  };

  const handleTerminateAll = async () => {
    try {
      await adminService.terminateAllUserSessions(userId!);
      setSuccessMsg('All sessions terminated');
      await loadSessions();
      await loadUser();
    } catch (err: any) {
      setError(`Failed to terminate sessions: ${err.message}`);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(userId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  // Error state with no user
  if (!user && error) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          <button onClick={loadUser} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const status = getStatusLabel(user);
  const provider = providerLabels[user.provider] || providerLabels.local;
  const initials = (() => {
    const f = user.firstName?.[0] || '';
    const l = user.lastName?.[0] || '';
    return f && l ? `${f}${l}`.toUpperCase() : user.email?.[0]?.toUpperCase() || 'U';
  })();
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unnamed';

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'organizations', label: 'Organizations', count: user.organizationCount },
    { id: 'sessions', label: 'Sessions', count: user.activeSessionCount },
    { id: 'history', label: 'Login History' },
  ];

  const activeSessions = sessions.filter(s => s.isActive && !s.isExpired);

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Banners */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar + Info */}
          <div className="flex items-center gap-5 flex-1 min-w-0">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={fullName} className="w-[72px] h-[72px] rounded-full object-cover ring-4 ring-[#FF6B00]/10 flex-shrink-0" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-[#FF6B00]/[0.08] ring-4 ring-[#FF6B00]/10 flex-shrink-0">
                <span className="text-2xl font-bold text-[#FF6B00]">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{fullName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusColors[status] || statusColors.Inactive}`}>
                  {status}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${provider.color}`}>
                  {provider.label}
                </span>
                {user.twoFactorEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    <Fingerprint className="w-3 h-3" /> 2FA
                  </span>
                )}
                {user.isLockedOut && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-500/20">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <div ref={statusRef} className="relative">
              <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Status <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-30">
                  {['Active', 'Inactive', 'Suspended', 'Banned'].map((s) => (
                    <button key={s} onClick={() => handleStatusChange(s)} className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${status === s ? 'bg-gray-50 dark:bg-gray-700 font-medium' : ''} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                      {s === 'Active' && <Check className="w-4 h-4 text-emerald-500" />}
                      {s === 'Inactive' && <XCircle className="w-4 h-4 text-gray-400" />}
                      {s === 'Suspended' && <Ban className="w-4 h-4 text-amber-500" />}
                      {s === 'Banned' && <Ban className="w-4 h-4 text-red-500" />}
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleResetPassword} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-lg transition-colors">
              <KeyRound className="w-4 h-4" /> Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Logins', value: user.loginCount ?? 0, icon: LogIn, color: '#6366F1' },
          { label: 'Successful', value: user.successfulLoginCount ?? 0, icon: CheckCircle2, color: '#10B981' },
          { label: 'Failed', value: user.failedLoginCount ?? 0, icon: XCircle, color: '#EF4444' },
          { label: 'Active Sessions', value: user.activeSessionCount ?? 0, icon: Monitor, color: '#F59E0B' },
          { label: 'Organizations', value: user.organizationCount ?? 0, icon: Building2, color: '#8B5CF6' },
          { label: 'Business Plans', value: user.businessPlanCount ?? 0, icon: FileText, color: '#FF6B00' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}14` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <nav className="flex gap-6 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FF6B00] text-[#FF6B00]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5">
          {activeTab === 'overview' && <OverviewTab user={user} userRoles={userRoles} roles={roles} showAddRole={showAddRole} setShowAddRole={setShowAddRole} onAssignRole={handleAssignRole} onRemoveRole={handleRemoveRole} onCopyId={copyId} copied={copied} />}
          {activeTab === 'organizations' && <OrganizationsTab organizations={user.organizations || []} />}
          {activeTab === 'sessions' && <SessionsTab sessions={sessions} loading={loadingSessions} activeSessions={activeSessions} onTerminate={handleTerminateSession} onTerminateAll={handleTerminateAll} onRefresh={loadSessions} />}
          {activeTab === 'history' && <HistoryTab history={loginHistory} loading={loadingHistory} onRefresh={loadHistory} />}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <ModalOverlay onClose={() => setShowEdit(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{fullName}</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="First Name">
                  <input type="text" value={editForm.firstName} onChange={e => setEditForm((p: any) => ({ ...p, firstName: e.target.value }))} className="form-input-detail" />
                </FieldGroup>
                <FieldGroup label="Last Name">
                  <input type="text" value={editForm.lastName} onChange={e => setEditForm((p: any) => ({ ...p, lastName: e.target.value }))} className="form-input-detail" />
                </FieldGroup>
              </div>
              <FieldGroup label="Username">
                <input type="text" value={editForm.userName} onChange={e => setEditForm((p: any) => ({ ...p, userName: e.target.value }))} className="form-input-detail" />
              </FieldGroup>
              <FieldGroup label="User Type">
                <select value={editForm.userType} onChange={e => setEditForm((p: any) => ({ ...p, userType: e.target.value }))} className="form-input-detail">
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Consultant">Consultant</option>
                  <option value="OBNL">OBNL</option>
                </select>
              </FieldGroup>
              <FieldGroup label="Phone Number">
                <input type="tel" value={editForm.phoneNumber} onChange={e => setEditForm((p: any) => ({ ...p, phoneNumber: e.target.value }))} className="form-input-detail" placeholder="+1 (555) 000-0000" />
              </FieldGroup>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={editForm.emailVerified} onChange={e => setEditForm((p: any) => ({ ...p, emailVerified: e.target.checked }))} className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                  Email Verified
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm((p: any) => ({ ...p, isActive: e.target.checked }))} className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveProfile} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      <style>{`
        .form-input-detail {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          background: white;
          color: rgb(17 24 39);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .form-input-detail:focus {
          outline: none;
          border-color: #FF6B00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.15);
        }
        .dark .form-input-detail {
          background: rgb(31 41 55);
          border-color: rgb(75 85 99);
          color: rgb(243 244 246);
        }
        .dark .form-input-detail:focus {
          border-color: #FF6B00;
        }
      `}</style>
    </div>
  );
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, mono }: { label: string; value: React.ReactNode; icon?: any; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        {label}
      </div>
      <div className={`text-sm font-medium text-gray-900 dark:text-white text-right ${mono ? 'font-mono text-xs' : ''}`}>
        {value ?? '-'}
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

/* --- OVERVIEW TAB --- */
function OverviewTab({ user, userRoles, roles, showAddRole, setShowAddRole, onAssignRole, onRemoveRole, onCopyId, copied }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Account Info */}
      <SectionCard title="Account Information">
        <div className="space-y-0">
          <InfoRow label="User ID" icon={User} value={
            <button onClick={onCopyId} className="flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-[#FF6B00] transition-colors">
              {user.id?.slice(0, 8)}...
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          } />
          <InfoRow label="Username" value={user.userName || '-'} />
          <InfoRow label="User Type" value={
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
              {user.userType || '-'}
            </span>
          } />
          <InfoRow label="Persona" value={user.persona || '-'} />
          <InfoRow label="Provider" value={
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${providerLabels[user.provider]?.color || providerLabels.local.color}`}>
              {providerLabels[user.provider]?.label || 'Local'}
            </span>
          } />
          <InfoRow label="Created" icon={Clock} value={fmtDate(user.createdAt, true)} />
          <InfoRow label="Last Modified" value={fmtDate(user.lastModifiedAt, true)} />
          <InfoRow label="Last Login" value={user.lastLoginAt ? fmtDate(user.lastLoginAt, true) : 'Never'} />
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security">
        <div className="space-y-0">
          <InfoRow label="Email Verified" icon={Mail} value={
            <div className="flex items-center gap-1.5">
              {user.emailVerified
                ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400">Yes</span></>
                : <><XCircle className="w-4 h-4 text-gray-400" /> <span className="text-gray-500">No</span></>}
            </div>
          } />
          {user.emailConfirmedAt && <InfoRow label="Verified At" value={fmtDate(user.emailConfirmedAt, true)} />}
          <InfoRow label="Two-Factor Auth" icon={Fingerprint} value={
            <div className="flex items-center gap-1.5">
              {user.twoFactorEnabled
                ? <><ShieldCheck className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400">Enabled</span></>
                : <><ShieldOff className="w-4 h-4 text-gray-400" /> <span className="text-gray-500">Disabled</span></>}
            </div>
          } />
          <InfoRow label="Phone" icon={Phone} value={user.phoneNumber || '-'} />
          <InfoRow label="Phone Verified" value={user.phoneNumberVerified ? 'Yes' : 'No'} />
          <InfoRow label="Account Locked" icon={user.isLockedOut ? Lock : Unlock} value={
            user.isLockedOut
              ? <span className="text-red-500">Locked{user.lockoutEnd ? ` until ${fmtDate(user.lockoutEnd, true)}` : ''}</span>
              : <span className="text-emerald-600 dark:text-emerald-400">No</span>
          } />
          <InfoRow label="Failed Attempts" value={user.accessFailedCount ?? 0} />
          <InfoRow label="Password Changed" icon={KeyRound} value={user.passwordLastChangedAt ? fmtDate(user.passwordLastChangedAt, true) : 'Never'} />
          <InfoRow label="Require Change" value={user.requirePasswordChange ? <span className="text-amber-600 dark:text-amber-400">Yes</span> : 'No'} />
        </div>
      </SectionCard>

      {/* Onboarding */}
      <SectionCard title="Onboarding">
        <div className="space-y-0">
          <InfoRow label="Completed" value={
            user.onboardingCompleted
              ? <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Complete</span>
              : <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><Clock className="w-4 h-4" /> In Progress</span>
          } />
          <InfoRow label="Current Step" value={user.onboardingStep ?? '-'} />
        </div>
      </SectionCard>

      {/* Roles */}
      <SectionCard title="Roles" action={
        <button onClick={() => setShowAddRole(!showAddRole)} className="text-xs font-medium text-[#FF6B00] hover:underline">
          {showAddRole ? 'Cancel' : '+ Add Role'}
        </button>
      }>
        {userRoles.length === 0 && !showAddRole ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">No roles assigned</p>
        ) : (
          <div className="space-y-2">
            {userRoles.map((role: any) => (
              <div key={role.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FF6B00]" />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                    {role.isSystemRole && <span className="ml-1.5 text-[10px] text-gray-400">System</span>}
                  </div>
                </div>
                <button onClick={() => onRemoveRole(role.id)} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {showAddRole && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Available to assign:</p>
            {roles.filter((r: any) => !userRoles.some((ur: any) => ur.id === r.id)).length === 0 ? (
              <p className="text-xs text-gray-400 italic">All roles already assigned</p>
            ) : (
              roles.filter((r: any) => !userRoles.some((ur: any) => ur.id === r.id)).map((role: any) => (
                <div key={role.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
                  <button onClick={() => onAssignRole(role.id)} className="px-3 py-1 text-xs font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-md transition-colors">
                    Assign
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* --- ORGANIZATIONS TAB --- */
function OrganizationsTab({ organizations }: { organizations: any[] }) {
  if (organizations.length === 0) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Not a member of any organization</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organization</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {organizations.map((org: any) => (
            <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/[0.08] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{org.name}</span>
                </div>
              </td>
              <td className="py-3 px-3">
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">{org.role}</span>
              </td>
              <td className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">{fmtDate(org.joinedAt)}</td>
              <td className="py-3 px-3">
                {org.isActive
                  ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                  : <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400"><XCircle className="w-3.5 h-3.5" /> Inactive</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --- SESSIONS TAB --- */
function SessionsTab({ sessions, loading, activeSessions, onTerminate, onTerminateAll, onRefresh }: {
  sessions: any[]; loading: boolean; activeSessions: any[]; onTerminate: (id: string) => void; onTerminateAll: () => void; onRefresh: () => void;
}) {
  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-[#FF6B00] animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {activeSessions.length > 0 && (
            <button onClick={onTerminateAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Terminate All
            </button>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <Monitor className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: any) => {
            const DeviceIcon = getDeviceIcon(session.deviceType);
            const isAlive = session.isActive && !session.isExpired;
            return (
              <div key={session.id} className={`rounded-xl border p-4 transition-colors ${isAlive ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/50 opacity-60'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isAlive ? 'bg-emerald-500/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <DeviceIcon className={`w-5 h-5 ${isAlive ? 'text-emerald-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.browser || 'Unknown Browser'} {session.operatingSystem ? `/ ${session.operatingSystem}` : ''}
                        </span>
                        {isAlive ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Active</span>
                        ) : session.isExpired ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-500/10 text-gray-500">Expired</span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-500">Revoked</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ipAddress}</span>
                        {(session.country || session.city) && (
                          <span>{[session.city, session.country].filter(Boolean).join(', ')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                        <span>Created: {fmtDate(session.createdAt, true)}</span>
                        <span>Last: {timeAgo(session.lastActivityAt)}</span>
                        <span>Expires: {fmtDate(session.expiresAt, true)}</span>
                      </div>
                    </div>
                  </div>
                  {isAlive && (
                    <button onClick={() => onTerminate(session.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
                      <LogOut className="w-3.5 h-3.5" /> Terminate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --- HISTORY TAB --- */
function HistoryTab({ history, loading, onRefresh }: { history: any[]; loading: boolean; onRefresh: () => void }) {
  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-[#FF6B00] animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{history.length} login attempt{history.length !== 1 ? 's' : ''}</p>
        <button onClick={onRefresh} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <LogIn className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No login history available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Browser / OS</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {history.map((entry: any) => (
                <tr key={entry.id} className={`transition-colors ${entry.isSuccessful ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'bg-red-50/30 dark:bg-red-900/5 hover:bg-red-50/60 dark:hover:bg-red-900/10'}`}>
                  <td className="py-2.5 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {fmtDate(entry.loginAttemptAt, true)}
                  </td>
                  <td className="py-2.5 px-3">
                    {entry.isSuccessful ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {entry.ipAddress || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-gray-500 dark:text-gray-400 text-xs">
                    {[entry.browser, entry.operatingSystem].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-gray-500 dark:text-gray-400 text-xs">
                    {[entry.city, entry.country].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-400">
                    {entry.failureReason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
