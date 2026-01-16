/**
 * Google OAuth utility using Google Identity Services
 * https://developers.google.com/identity/gsi/web
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          prompt: (callback?: (notification: PromptMomentNotification) => void) => void;
          renderButton: (parent: HTMLElement, config: GsiButtonConfiguration) => void;
          disableAutoSelect: () => void;
          storeCredential: (credentials: { id: string; password: string }) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (accessToken: string, done: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
          hasGrantedAllScopes: (tokenResponse: TokenResponse, ...scopes: string[]) => boolean;
          hasGrantedAnyScope: (tokenResponse: TokenResponse, ...scopes: string[]) => boolean;
          revoke: (accessToken: string, done: () => void) => void;
        };
      };
    };
  }
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  itp_support?: boolean;
  login_uri?: string;
  native_callback?: (response: { credential: string }) => void;
  nonce?: string;
  context?: 'signin' | 'signup' | 'use';
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
  skip_non_cookie_iframe?: boolean;
  hosted_domain?: string;
}

interface CredentialResponse {
  credential: string;
  select_by?: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm' | 'brn_add_session' | 'btn_confirm_add_session';
  client_id?: string;
}

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => 'browser_not_supported' | 'invalid_client' | 'missing_client_id' | 'opt_out_or_no_session' | 'secure_http_required' | 'suppressed_by_user' | 'unregistered_origin' | 'unknown_reason';
  isSkippedMoment: () => boolean;
  getSkippedReason: () => 'auto_select' | 'user_cancel' | 'tap_outside' | 'issuing_failed';
  isDismissedMoment: () => boolean;
  getDismissedReason: () => 'credential_returned' | 'cancel_called' | 'flow_restarted';
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
  locale?: string;
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: TokenErrorResponse) => void;
  state?: string;
  enable_granular_consent?: boolean;
  hint?: string;
  hosted_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  redirect_uri?: string;
  select_account?: boolean;
}

interface TokenResponse {
  access_token: string;
  authuser: string;
  expires_in: number;
  hd?: string;
  prompt: string;
  scope: string;
  token_type: string;
}

interface TokenErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
}

interface TokenClient {
  requestAccessToken: (overrideConfig?: Partial<TokenClientConfig>) => void;
}

export interface GoogleAuthResult {
  idToken: string;
  accessToken: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    sub: string;
  };
}

/**
 * Get Google Client ID from environment or use default
 */
const getGoogleClientId = (): string => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (clientId) {
    return clientId;
  }
  // Default client ID from Google Cloud Console
  return '787375969256-cdmhthionst8nslm063vdh730chdkqgm.apps.googleusercontent.com';
};

/**
 * Wait for Google Identity Services to load
 */
const waitForGoogle = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const google = window.google;
    if (!google) {
      window.google = {
        accounts: {
          id: {} as any,
          oauth2: {} as any
        }
      } as any;
    }
    const googleAfterInit = window.google;
    if (googleAfterInit && !googleAfterInit.accounts) {
      googleAfterInit.accounts = {
        id: {} as any,
        oauth2: {} as any
      } as any;
    }
    if (googleAfterInit && googleAfterInit.accounts && !googleAfterInit.accounts.id) {
      googleAfterInit.accounts.id = {} as any;
    }

    const checkGoogle = setInterval(() => {
      const googleCheck = window.google;
      if (googleCheck && googleCheck.accounts && googleCheck.accounts.id && typeof googleCheck.accounts.id.initialize === 'function') {
        clearInterval(checkGoogle);
        resolve();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkGoogle);
      const googleFinal = window.google;
      if (!googleFinal || !googleFinal.accounts || !googleFinal.accounts.id || typeof googleFinal.accounts.id.initialize !== 'function') {
        console.error('Google Identity Services failed to load');
      }
      resolve();
    }, 10000);
  });
};

/**
 * Decode JWT token to extract user information
 */
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Initialize Google Sign-In and return a promise that resolves with the credential
 * Uses Google's button rendering API for reliable button-based sign-in
 */
export const signInWithGoogle = (): Promise<GoogleAuthResult> => {
  return new Promise(async (resolve, reject) => {
    let resolved = false;
    
    try {
      await waitForGoogle();

      if (!window.google?.accounts?.id?.initialize || !window.google?.accounts?.id?.renderButton) {
        reject(new Error('Google Identity Services not available'));
        return;
      }

      const clientId = getGoogleClientId();

      // Create a hidden container for the Google button
      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'google-signin-button-container';
      buttonContainer.style.position = 'fixed';
      buttonContainer.style.left = '-9999px';
      buttonContainer.style.top = '-9999px';
      buttonContainer.style.opacity = '0';
      buttonContainer.style.pointerEvents = 'none';
      document.body.appendChild(buttonContainer);

      // Initialize Google Identity Services for ID token flow
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: CredentialResponse) => {
          if (resolved) return;
          resolved = true;

          try {
            const idToken = response.credential;
            
            // Decode the ID token to get user info
            const tokenPayload = decodeJWT(idToken);
            
            if (!tokenPayload) {
              reject(new Error('Failed to decode Google ID token'));
              return;
            }

            // Clean up the button container
            if (buttonContainer.parentNode) {
              buttonContainer.parentNode.removeChild(buttonContainer);
            }

            // Only use ID token - backend validates it directly
            // No need for access token which causes CORS issues
            const result: GoogleAuthResult = {
              idToken,
              accessToken: idToken, // Backend only needs ID token
              user: {
                email: tokenPayload.email || '',
                firstName: tokenPayload.given_name || '',
                lastName: tokenPayload.family_name || '',
                picture: tokenPayload.picture,
                sub: tokenPayload.sub || '',
              },
            };

            resolve(result);
          } catch (error) {
            // Clean up on error
            if (buttonContainer.parentNode) {
              buttonContainer.parentNode.removeChild(buttonContainer);
            }
            reject(error);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup',
        context: 'signin',
        allowed_parent_origin: window.location.origin,
      });

      // Render the Google button in the hidden container
      window.google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: '250',
      });

      // Wait a moment for the button to render, then click it programmatically
      setTimeout(() => {
        const googleButton = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          // Make button visible temporarily for click to work
          buttonContainer.style.position = 'fixed';
          buttonContainer.style.left = '50%';
          buttonContainer.style.top = '50%';
          buttonContainer.style.transform = 'translate(-50%, -50%)';
          buttonContainer.style.opacity = '0.01'; // Nearly invisible but clickable
          buttonContainer.style.zIndex = '9999';
          buttonContainer.style.pointerEvents = 'auto';
          
          // Click the button
          googleButton.click();
          
          // Hide it again immediately
          setTimeout(() => {
            buttonContainer.style.opacity = '0';
            buttonContainer.style.pointerEvents = 'none';
          }, 100);
        } else {
          // Fallback: if button didn't render, try prompt
          if (!resolved && window.google?.accounts?.id) {
            window.google.accounts.id.prompt((notification) => {
              if (notification.isNotDisplayed() && !resolved) {
                resolved = true;
                if (buttonContainer.parentNode) {
                  buttonContainer.parentNode.removeChild(buttonContainer);
                }
                const reason = notification.getNotDisplayedReason();
                reject(new Error(`Google sign-in not available: ${reason}. Please check your browser settings and try again.`));
              }
            });
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (buttonContainer.parentNode) {
            buttonContainer.parentNode.removeChild(buttonContainer);
          }
          reject(new Error('Google sign-in timed out. Please try again.'));
        }
      }, 30000);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        reject(error);
      }
    }
  });
};

/**
 * Get OAuth2 access token
 */
const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google OAuth2 not available'));
        return;
      }

      const clientId = getGoogleClientId();
      let tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (response: TokenResponse) => {
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to get access token'));
          }
        },
        error_callback: (error: TokenErrorResponse) => {
          reject(new Error(error.error_description || error.error || 'Failed to get access token'));
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * One-tap sign-in (automatic prompt)
 */
export const promptOneTap = (onSuccess: (result: GoogleAuthResult) => void, onError?: (error: Error) => void): void => {
  waitForGoogle().then(() => {
    if (!window.google?.accounts?.id?.initialize) {
      onError?.(new Error('Google Identity Services not available'));
      return;
    }

    const clientId = getGoogleClientId();

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: CredentialResponse) => {
        try {
          const idToken = response.credential;
          const tokenPayload = decodeJWT(idToken);
          
          if (!tokenPayload) {
            onError?.(new Error('Failed to decode Google ID token'));
            return;
          }

          const accessToken = await getAccessToken();

          const result: GoogleAuthResult = {
            idToken,
            accessToken,
            user: {
              email: tokenPayload.email || '',
              firstName: tokenPayload.given_name || '',
              lastName: tokenPayload.family_name || '',
              picture: tokenPayload.picture,
              sub: tokenPayload.sub || '',
            },
          };

          onSuccess(result);
        } catch (error) {
          onError?.(error as Error);
        }
      },
      auto_select: true,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt();
  });
};

