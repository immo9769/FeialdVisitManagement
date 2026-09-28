import { Configuration, PublicClientApplication, LogLevel } from '@azure/msal-browser';

export const getCurrentRedirectUri = (): string => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/login`;
  }
  return 'https://fieldvisit.iqraitacademy.com/login';
};

// Microsoft Entra ID Configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '63af8748-b960-4f66-9ef7-e6be3b13e0d1',
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_TENANT_ID || '5adb2e4c-71ad-431a-81fa-d48da6fe6b40'
    }`,
    redirectUri: getCurrentRedirectUri(),
    postLogoutRedirectUri: getCurrentRedirectUri(),
  },
  cache: {
    cacheLocation: 'localStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL Error]', message);
            return;
          case LogLevel.Warning:
            console.warn('[MSAL Warning]', message);
            return;
          default:
            return;
        }
      },
    },
  },
};

// Request scopes for login
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  redirectUri: getCurrentRedirectUri(),
};

// Singleton instance of PublicClientApplication
export const msalInstance = new PublicClientApplication(msalConfig);
