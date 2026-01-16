import { apiClient } from './api-client';

export const activityLogger = {
  async log(activity: {
    action: string;
    entity_type?: string;
    entity_id?: string;
    description: string;
    metadata?: any;
  }) {
    try {
      await apiClient.post('/api/v1/activity-logs', {
        action: activity.action,
        entityType: activity.entity_type,
        entityId: activity.entity_id,
        description: activity.description,
        metadata: activity.metadata || {},
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  async logLogin() {
    await this.log({
      action: 'user_login',
      entity_type: 'auth',
      description: 'User logged in'
    });
  },

  async logLogout() {
    await this.log({
      action: 'user_logout',
      entity_type: 'auth',
      description: 'User logged out'
    });
  },

  async logBusinessPlanCreated(planId: string, planTitle: string) {
    await this.log({
      action: 'business_plan_created',
      entity_type: 'business_plan',
      entity_id: planId,
      description: `Created business plan: ${planTitle}`
    });
  },

  async logBusinessPlanUpdated(planId: string, planTitle: string) {
    await this.log({
      action: 'business_plan_updated',
      entity_type: 'business_plan',
      entity_id: planId,
      description: `Updated business plan: ${planTitle}`
    });
  },

  async logOrganizationCreated(orgId: string, orgName: string) {
    await this.log({
      action: 'organization_created',
      entity_type: 'organization',
      entity_id: orgId,
      description: `Created organization: ${orgName}`
    });
  },

  async logProfileUpdated() {
    await this.log({
      action: 'profile_updated',
      entity_type: 'profile',
      description: 'Updated profile information'
    });
  },

  async logPasswordChanged() {
    await this.log({
      action: 'password_changed',
      entity_type: 'auth',
      description: 'Password changed'
    });
  }
};
