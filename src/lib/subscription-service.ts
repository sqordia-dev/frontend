import { apiClient } from './api-client';

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface BillingPortalResponse {
  portalUrl: string;
}

class SubscriptionService {
  /**
   * Create a Stripe checkout session for a subscription
   */
  async createCheckoutSession(
    planId: string,
    organizationId: string,
    isYearly: boolean
  ): Promise<string> {
    try {
      const response = await apiClient.post<CheckoutSessionResponse>(
        '/api/v1/subscriptions/checkout',
        {
          planId,
          organizationId,
          isYearly,
        }
      );

      // Handle different response formats
      if (response.data?.checkoutUrl) {
        return response.data.checkoutUrl;
      } else if (response.data?.isSuccess && response.data.value?.checkoutUrl) {
        return response.data.value.checkoutUrl;
      } else if (typeof response.data === 'string') {
        return response.data;
      }

      throw new Error('Invalid checkout session response');
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        'Failed to create checkout session';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a Stripe billing portal session
   */
  async createBillingPortalSession(returnUrl: string): Promise<string> {
    try {
      const response = await apiClient.post<BillingPortalResponse>(
        '/api/v1/subscriptions/billing-portal',
        {
          returnUrl,
        }
      );

      // Handle different response formats
      if (response.data?.portalUrl) {
        return response.data.portalUrl;
      } else if (response.data?.isSuccess && response.data.value?.portalUrl) {
        return response.data.value.portalUrl;
      } else if (typeof response.data === 'string') {
        return response.data;
      }

      throw new Error('Invalid billing portal response');
    } catch (error: any) {
      console.error('Failed to create billing portal session:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        'Failed to create billing portal session';
      throw new Error(errorMessage);
    }
  }

  /**
   * Subscribe to a plan (for free plans that don't use Stripe)
   */
  async subscribe(
    planId: string,
    organizationId: string,
    isYearly: boolean
  ): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/subscriptions/subscribe', {
        planId,
        organizationId,
        isYearly,
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        'Failed to subscribe';
      throw new Error(errorMessage);
    }
  }

  /**
   * Change subscription plan
   */
  async changePlan(newPlanId: string, isYearly: boolean): Promise<any> {
    try {
      const response = await apiClient.put('/api/v1/subscriptions/change-plan', {
        newPlanId,
        isYearly,
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to change plan:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        'Failed to change plan';
      throw new Error(errorMessage);
    }
  }

  /**
   * Cancel subscription
   */
  async cancel(): Promise<void> {
    try {
      await apiClient.post('/api/v1/subscriptions/cancel');
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        'Failed to cancel subscription';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current subscription
   */
  async getCurrent(): Promise<any> {
    try {
      const response = await apiClient.get('/api/v1/subscriptions/current');
      
      if (response.data?.isSuccess && response.data.value) {
        return response.data.value;
      } else if (response.data?.id) {
        return response.data;
      }
      
      return null;
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        return null; // No subscription
      }
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();

