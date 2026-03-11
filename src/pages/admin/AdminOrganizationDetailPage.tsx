import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/admin-service';
import {
  ArrowLeft, Building2, Users, FileText, Calendar, Globe, MapPin,
  CheckCircle2, XCircle, AlertCircle, Mail, Shield, Crown, Eye, UserCheck,
  Loader2, X, Pencil, Trash2, Save,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { Button } from '../../components/ui/button';
import { SqordiaLoader } from '../../components/ui/SqordiaLoader';
import type { AdminOrganizationDetail } from '../../types/organization';

const ORG_TYPES = ['Startup', 'OBNL', 'ConsultingFirm', 'Company'] as const;

const ROLE_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  Owner: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', icon: Crown },
  Admin: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: Shield },
  Member: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: UserCheck },
  Viewer: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', icon: Eye },
};

export default function AdminOrganizationDetailPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { language } = useTheme();
  const toast = useToast();

  const [org, setOrg] = useState<AdminOrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members'>('overview');

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', organizationType: 'Startup', website: '', maxMembers: 10, allowMemberInvites: true, requireEmailVerification: false });
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOrganizationDetail(organizationId);
      setOrg(data);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleStatusChange = async () => {
    if (!org) return;
    try {
      setUpdatingStatus(true);
      await adminService.updateOrganizationStatus(org.id, !org.isActive, statusReason);
      toast.success('Status Updated', `Organization ${!org.isActive ? 'activated' : 'deactivated'} successfully.`);
      setShowStatusModal(false);
      setStatusReason('');
      await loadDetail();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openEditModal = () => {
    if (!org) return;
    setEditForm({
      name: org.name,
      description: org.description || '',
      organizationType: org.organizationType || 'Startup',
      website: org.website || '',
      maxMembers: org.maxMembers,
      allowMemberInvites: org.allowMemberInvites,
      requireEmailVerification: org.requireEmailVerification,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!org || !editForm.name.trim()) return;
    try {
      setSaving(true);
      await adminService.updateOrganization(org.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        organizationType: editForm.organizationType,
        website: editForm.website.trim() || undefined,
        maxMembers: editForm.maxMembers,
        allowMemberInvites: editForm.allowMemberInvites,
        requireEmailVerification: editForm.requireEmailVerification,
      });
      toast.success(language === 'fr' ? 'Sauvegardé' : 'Saved', language === 'fr' ? 'Organisation mise à jour.' : 'Organization updated.');
      setShowEditModal(false);
      await loadDetail();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!org) return;
    try {
      setDeleting(true);
      await adminService.deleteOrganization(org.id);
      toast.success(language === 'fr' ? 'Supprimée' : 'Deleted', language === 'fr' ? 'Organisation supprimée.' : 'Organization deleted.');
      navigate('/admin/organizations');
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'delete'));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <SqordiaLoader size="lg" message="Loading organization..." />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/admin/organizations')} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Organizations
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-800 dark:text-red-300">{error || 'Organization not found'}</p>
          <Button variant="brand" className="mt-4" onClick={() => navigate('/admin/organizations')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: language === 'fr' ? 'Apercu' : 'Overview' },
    { id: 'members' as const, label: `${language === 'fr' ? 'Membres' : 'Members'} (${org.memberCount})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/admin/organizations')} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> {language === 'fr' ? 'Retour aux organisations' : 'Back to Organizations'}
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
                {org.isActive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEditModal} className="gap-1.5">
              <Pencil className="w-4 h-4" /> {language === 'fr' ? 'Modifier' : 'Edit'}
            </Button>
            <Button
              variant={org.isActive ? 'destructive' : 'brand'}
              onClick={() => setShowStatusModal(true)}
            >
              {org.isActive ? (language === 'fr' ? 'Désactiver' : 'Deactivate') : (language === 'fr' ? 'Activer' : 'Activate')}
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)} className="gap-1.5">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: language === 'fr' ? 'Membres' : 'Members', value: org.memberCount, icon: Users },
          { label: language === 'fr' ? 'Plans' : 'Business Plans', value: org.businessPlanCount, icon: FileText },
          { label: language === 'fr' ? 'Invitations' : 'Pending Invites', value: org.pendingInvitationCount, icon: Mail },
          { label: language === 'fr' ? 'Abonnement' : 'Subscription', value: org.subscriptionPlan || 'Free', icon: Shield, isText: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Informations' : 'Information'}</h3>
            <div className="space-y-3 text-sm">
              {org.description && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Description' : 'Description'}</span>
                  <p className="text-gray-900 dark:text-white mt-0.5">{org.description}</p>
                </div>
              )}
              {org.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={org.website} target="_blank" rel="noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline">{org.website}</a>
                </div>
              )}
              {(org.city || org.province || org.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{[org.city, org.province, org.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{language === 'fr' ? 'Créé le' : 'Created'} {formatDate(org.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Paramètres' : 'Settings'}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Max membres' : 'Max Members'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{org.maxMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Invitations' : 'Allow Invites'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{org.allowMemberInvites ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Vérification email' : 'Email Verification'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{org.requireEmailVerification ? 'Required' : 'Not required'}</span>
              </div>
              {org.industry && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Industrie' : 'Industry'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{org.industry}</span>
                </div>
              )}
              {org.teamSize && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Taille équipe' : 'Team Size'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{org.teamSize}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Complétude profil' : 'Profile Completeness'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(org.profileCompletenessScore)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {org.members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No members</td>
                </tr>
              ) : (
                org.members.map((member) => {
                  const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.Member;
                  const RoleIcon = roleStyle.icon;
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                            {(member.firstName?.[0] || '') + (member.lastName?.[0] || '')}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {member.firstName} {member.lastName}
                          </span>
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
                        <button
                          onClick={() => navigate(`/admin/users/${member.userId}`)}
                          className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          View User
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {org.isActive ? 'Deactivate' : 'Activate'} Organization
              </h3>
              <button onClick={() => { setShowStatusModal(false); setStatusReason(''); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {org.isActive
                ? `Deactivating "${org.name}" will restrict access for all ${org.memberCount} members.`
                : `Reactivating "${org.name}" will restore access for all members.`}
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (required)</label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowStatusModal(false); setStatusReason(''); }}>Cancel</Button>
              <Button
                variant={org.isActive ? 'destructive' : 'brand'}
                className="flex-1"
                onClick={handleStatusChange}
                disabled={!statusReason.trim() || updatingStatus}
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Modifier l\'organisation' : 'Edit Organization'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Nom *' : 'Name *'}
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={editForm.organizationType}
                  onChange={(e) => setEditForm({ ...editForm, organizationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Site web' : 'Website'}
                </label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Max membres' : 'Max Members'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={editForm.maxMembers}
                    onChange={(e) => setEditForm({ ...editForm, maxMembers: Number(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={editForm.allowMemberInvites}
                      onChange={(e) => setEditForm({ ...editForm, allowMemberInvites: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    {language === 'fr' ? 'Invitations' : 'Allow Invites'}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={editForm.requireEmailVerification}
                      onChange={(e) => setEditForm({ ...editForm, requireEmailVerification: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    {language === 'fr' ? 'Vérif. email' : 'Require Email Verification'}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="brand" className="flex-1 gap-1.5" onClick={handleSaveEdit} disabled={!editForm.name.trim() || saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {language === 'fr' ? 'Sauvegarder' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                {language === 'fr' ? 'Supprimer l\'organisation' : 'Delete Organization'}
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {language === 'fr'
                ? `Êtes-vous sûr de vouloir supprimer "${org.name}" ? Cette action est irréversible.`
                : `Are you sure you want to permanently delete "${org.name}"? This action cannot be undone.`}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mb-4">
              {language === 'fr'
                ? 'Tous les membres et invitations seront supprimés. Les organisations avec des plans d\'affaires ne peuvent pas être supprimées.'
                : 'All members and invitations will be removed. Organizations with business plans cannot be deleted.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="destructive" className="flex-1 gap-1.5" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
