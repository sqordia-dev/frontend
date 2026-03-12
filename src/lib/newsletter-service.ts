import axios from 'axios';

const getApiBaseUrl = (): string => {
  const mode = import.meta.env.MODE;
  const envUrl = import.meta.env.VITE_API_URL;

  if (mode === 'development') {
    return '';
  }

  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }

  return 'https://sqordia-production-api.proudwater-90136d2c.canadacentral.azurecontainerapps.io';
};

const newsletterClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export interface NewsletterSubscribeResponse {
  id: string;
  email: string;
  isActive: boolean;
  language: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export async function subscribeToNewsletter(
  email: string,
  language: string = 'fr'
): Promise<{ success: boolean; alreadySubscribed?: boolean; error?: string }> {
  try {
    await newsletterClient.post<NewsletterSubscribeResponse>(
      '/api/v1/newsletter/subscribe',
      { email, language }
    );
    return { success: true };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 409) {
        return { success: false, alreadySubscribed: true };
      }

      if (status === 400) {
        const message = data?.message || data?.Message || 'Invalid email';
        return { success: false, error: message };
      }
    }
    return { success: false, error: 'Network error' };
  }
}

export async function unsubscribeFromNewsletter(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await newsletterClient.post('/api/v1/newsletter/unsubscribe', { email });
    return { success: true };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;
      const message = data?.message || data?.Message || 'Failed to unsubscribe';
      return { success: false, error: message };
    }
    return { success: false, error: 'Network error' };
  }
}
