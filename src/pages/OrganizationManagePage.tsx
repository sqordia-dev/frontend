import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationService } from '../lib/organization-service';
import { authService } from '../lib/auth-service';
import {
  ArrowLeft, Building2, Users, Mail, Shield, Crown, Eye, UserCheck,
  Settings, UserPlus, X, Loader2, Trash2, ChevronDown, Clock, CheckCircle2,
  XCircle, AlertCircle, Save, Globe, MapPin,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { getUserFriendlyError } from '../utils/error-messages';
import { Button } from '../components/ui/button';
import { SqordiaLoader } from '../components/ui/SqordiaLoader';
import type { OrganizationDetail, OrganizationMember, OrganizationInvitation } from '../types/organization';

const ROLE_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  Owner: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', icon: Crown },
  Admin: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: Shield },
  Member: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: UserCheck },
  Viewer: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', icon: Eye },
};

const ROLE_OPTIONS = ['Admin', 'Member', 'Viewer'] as const;
const INVITE_ROLE_OPTIONS = ['Admin', 'Member', 'Viewer'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Tab = 'members' | 'invitations' | 'settings';

export default function OrganizationManagePage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { language } = useTheme();
  const toast = useToast();

  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [canManage, setCanManage] = useState(false);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviting, setInviting] = useState(false);

  // Change role modal
  const [roleModalMember, setRoleModalMember] = useState<OrganizationMember | null>(null);
  const [newRole, setNewRole] = useState('');
  const [changingRole, setChangingRole] = useState(false);

  // Remove member modal
  const [removeModalMember, setRemoveModalMember] = useState<OrganizationMember | null>(null);
  const [removing, setRemoving] = useState(false);

  // Settings
  const [settingsForm, setSettingsForm] = useState({ maxMembers: 10, allowMemberInvites: true, requireEmailVerification: false });
  const [savingSettings, setSavingSettings] = useState(false);

  const loadAll = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      setError(null);
      const [orgData, membersData, currentUser] = await Promise.all([
        organizationService.getOrganizationDetail(organizationId),
        organizationService.getOrganizationMembers(organizationId),
        authService.getCurrentUser(),
      ]);
      setOrg(orgData);
      setMembers(membersData);
      setSettingsForm({
        maxMembers: orgData.maxMembers || 10,
        allowMemberInvites: orgData.allowMemberInvites ?? true,
        requireEmailVerification: orgData.requireEmailVerification ?? false,
      });
      // Determine if current user can manage (Owner or Admin)
      const myMembership = membersData.find((m: OrganizationMember) => m.userId === currentUser.id);
      setCanManage(myMembership?.role === 'Owner' || myMembership?.role === 'Admin');
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadInvitations = useCallback(async () => {
    if (!organizationId) return;
    try {
      const data = await organizationService.getPendingInvitations(organizationId);
      setInvitations(data);
    } catch {
      // Non-critical
    }
  }, [organizationId]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (activeTab === 'invitations') loadInvitations(); }, [activeTab, loadInvitations]);

  const handleInvite = async () => {
    if (!organizationId || !inviteEmail.trim()) return;
    if (!EMAIL_RE.test(inviteEmail.trim())) {
      toast.error('Error', language === 'fr' ? 'Veuillez entrer un email valide.' : 'Please enter a valid email address.');
      return;
    }
    try {
      setInviting(true);
      await organizationService.inviteMemberByEmail(organizationId, inviteEmail.trim(), inviteRole);
      toast.success(language === 'fr' ? 'Invité' : 'Invited', language === 'fr' ? 'Invitation envoyée.' : 'Invitation sent.');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('Member');
      await loadInvitations();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async () => {
    if (!organizationId || !roleModalMember || !newRole) return;
    try {
      setChangingRole(true);
      await organizationService.updateMemberRole(organizationId, roleModalMember.id, newRole);
      toast.success(language === 'fr' ? 'Rôle mis à jour' : 'Role Updated', `${roleModalMember.firstName} is now ${newRole}`);
      setRoleModalMember(null);
      await loadAll();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setChangingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!organizationId || !removeModalMember) return;
    try {
      setRemoving(true);
      await organizationService.removeOrganizationMember(organizationId, removeModalMember.id);
      toast.success(language === 'fr' ? 'Retiré' : 'Removed', `${removeModalMember.firstName} ${removeModalMember.lastName} removed.`);
      setRemoveModalMember(null);
      await loadAll();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'delete'));
    } finally {
      setRemoving(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!organizationId) return;
    try {
      await organizationService.cancelInvitation(organizationId, invitationId);
      toast.success(language === 'fr' ? 'Annulée' : 'Cancelled', language === 'fr' ? 'Invitation annulée.' : 'Invitation cancelled.');
      await loadInvitations();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'delete'));
    }
  };

  const handleSaveSettings = async () => {
    if (!organizationId) return;
    try {
      setSavingSettings(true);
      await organizationService.updateOrganizationSettings(organizationId, settingsForm);
      toast.success(language === 'fr' ? 'Sauvegardé' : 'Saved', language === 'fr' ? 'Paramètres mis à jour.' : 'Settings updated.');
      await loadAll();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setSavingSettings(false);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <SqordiaLoader size="lg" message={language === 'fr' ? 'Chargement...' : 'Loading...'} />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" /> {language === 'fr' ? 'Retour' : 'Back'}
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-800 dark:text-red-300">{error || 'Organization not found'}</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'members', label: `${language === 'fr' ? 'Membres' : 'Members'} (${members.length})` },
    ...(canManage ? [{ id: 'invitations' as Tab, label: language === 'fr' ? 'Invitations' : 'Invitations' }] : []),
    ...(canManage ? [{ id: 'settings' as Tab, label: language === 'fr' ? 'Paramètres' : 'Settings' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> {language === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard'}
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{org.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {org.organizationType}
                </span>
                {org.website && (
                  <a href={org.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline">
                    <Globe className="w-3 h-3" /> {language === 'fr' ? 'Site web' : 'Website'}
                  </a>
                )}
              </div>
            </div>
          </div>
          {canManage && (
            <Button variant="brand" onClick={() => setShowInviteModal(true)} className="gap-1.5">
              <UserPlus className="w-4 h-4" /> {language === 'fr' ? 'Inviter' : 'Invite Member'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: language === 'fr' ? 'Membres' : 'Members', value: members.length, icon: Users },
          { label: language === 'fr' ? 'Max membres' : 'Max Members', value: org.maxMembers, icon: Shield },
          { label: language === 'fr' ? 'Profil complet' : 'Profile Complete', value: `${Math.round(org.profileCompletenessScore)}%`, icon: CheckCircle2 },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Membre' : 'Member'}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Rôle' : 'Role'}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">{language === 'fr' ? 'Rejoint' : 'Joined'}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {language === 'fr' ? 'Aucun membre' : 'No members yet'}
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.Member;
                  const RoleIcon = roleStyle.icon;
                  const isOwner = member.role === 'Owner';
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                            {(member.firstName?.[0] || '') + (member.lastName?.[0] || '')}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-600 dark:text-gray-400">{member.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
                          <RoleIcon className="w-3 h-3" /> {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400 text-xs">{formatDate(member.joinedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {canManage && !isOwner && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setRoleModalMember(member); setNewRole(member.role); }}
                              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title={language === 'fr' ? 'Changer le rôle' : 'Change Role'}
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRemoveModalMember(member)}
                              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title={language === 'fr' ? 'Retirer' : 'Remove'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'fr' ? 'Invitations en attente' : 'Pending Invitations'}
            </h3>
            {canManage && (
              <Button variant="brand" size="sm" onClick={() => setShowInviteModal(true)} className="gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> {language === 'fr' ? 'Inviter' : 'Invite'}
              </Button>
            )}
          </div>
          {invitations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'fr' ? 'Aucune invitation en attente' : 'No pending invitations'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{inv.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Rôle' : 'Role'}: {inv.role}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expire' : 'Expires'} {formatDate(inv.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelInvitation(inv.id)}
                    className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {language === 'fr' ? 'Paramètres de l\'organisation' : 'Organization Settings'}
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {language === 'fr' ? 'Nombre max de membres' : 'Maximum Members'}
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={settingsForm.maxMembers}
              onChange={(e) => setSettingsForm({ ...settingsForm, maxMembers: Number(e.target.value) || 10 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settingsForm.allowMemberInvites}
              onChange={(e) => setSettingsForm({ ...settingsForm, allowMemberInvites: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {language === 'fr' ? 'Autoriser les invitations' : 'Allow Member Invites'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'fr' ? 'Les admins peuvent inviter de nouveaux membres.' : 'Admins can send invitation emails.'}
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settingsForm.requireEmailVerification}
              onChange={(e) => setSettingsForm({ ...settingsForm, requireEmailVerification: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {language === 'fr' ? 'Exiger la vérification email' : 'Require Email Verification'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'fr' ? 'Les membres doivent vérifier leur email.' : 'Members must verify email before joining.'}
              </p>
            </div>
          </label>
          <Button variant="brand" onClick={handleSaveSettings} disabled={savingSettings} className="gap-1.5">
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {language === 'fr' ? 'Sauvegarder' : 'Save Settings'}
          </Button>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Inviter un membre' : 'Invite Member'}
              </h3>
              <button onClick={() => { setShowInviteModal(false); setInviteEmail(''); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  autoComplete="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Rôle' : 'Role'}
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {INVITE_ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => { setShowInviteModal(false); setInviteEmail(''); }}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="brand" className="flex-1 gap-1.5" onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}>
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {language === 'fr' ? 'Envoyer' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleModalMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Changer le rôle' : 'Change Role'}
              </h3>
              <button onClick={() => setRoleModalMember(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {language === 'fr' ? 'Modifier le rôle de' : 'Change role for'} <strong>{roleModalMember.firstName} {roleModalMember.lastName}</strong>
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm mb-4"
            >
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRoleModalMember(null)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="brand" className="flex-1" onClick={handleChangeRole} disabled={newRole === roleModalMember.role || changingRole}>
                {changingRole && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {language === 'fr' ? 'Confirmer' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {removeModalMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                {language === 'fr' ? 'Retirer le membre' : 'Remove Member'}
              </h3>
              <button onClick={() => setRemoveModalMember(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {language === 'fr'
                ? `Retirer "${removeModalMember.firstName} ${removeModalMember.lastName}" de l'organisation ? Ils perdront l'accès.`
                : `Remove "${removeModalMember.firstName} ${removeModalMember.lastName}" from the organization? They will lose access.`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRemoveModalMember(null)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="destructive" className="flex-1 gap-1.5" onClick={handleRemoveMember} disabled={removing}>
                {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {language === 'fr' ? 'Retirer' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
