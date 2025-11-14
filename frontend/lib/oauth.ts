export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export interface OAuthUser {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google user ID
}

export const initGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Auth can only be initialized in the browser'));
      return;
    }

    // Check if already loaded
    if ((window as any).google) {
      resolve();
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
    document.head.appendChild(script);
  });
};

export const signInWithGoogle = (): Promise<OAuthUser> => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    const google = (window as any).google;
    if (!google) {
      reject(new Error('Google Sign-In not initialized'));
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        try {
          // Decode JWT token to get user info
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          
          const user: OAuthUser = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub,
          };

          resolve(user);
        } catch (error) {
          reject(error);
        }
      },
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to button click flow
        google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'outline', 
            size: 'large',
            width: 350,
          }
        );
      }
    });
  });
};

export const renderGoogleButton = (elementId: string, callback: (credential: string) => void) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID not configured');
    return;
  }

  const google = (window as any).google;
  if (!google) {
    console.error('Google Sign-In not initialized');
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: any) => {
      try {
        // Pass the raw credential token to the callback
        callback(response.credential);
      } catch (error) {
        console.error('Failed to process Google Sign-In response:', error);
      }
    },
  });

  const buttonElement = document.getElementById(elementId);
  if (buttonElement) {
    google.accounts.id.renderButton(buttonElement, { 
      theme: 'outline', 
      size: 'large',
      width: buttonElement.offsetWidth,
      text: 'signin_with',
    });
  }
};
