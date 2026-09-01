import { useEffect, useRef, useState } from 'react';
import { GoogleIcon } from './Icons';

export default function GoogleSignInButton({
  onSuccess,
  onError,
  text = 'Continue with Google',
  disabled = false,
}) {
  const googleBtnContainerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    (typeof window !== 'undefined' && window.__GOOGLE_CLIENT_ID__) ||
    '';

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load.');
    };
    document.head.appendChild(script);
  }, []);

  // Initialize GSI and render button if clientId is available
  useEffect(() => {
    if (!scriptLoaded || !clientId || typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess?.(response.credential);
          } else {
            onError?.(new Error('Google did not return an authentication credential.'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render native button in container if container is available
      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          width: '100%',
          logo_alignment: 'left',
        });
      }

      // Optionally attempt One Tap prompt if supported
      try {
        window.google.accounts.id.prompt();
      } catch {
        // One Tap suppression handled silently
      }
    } catch (err) {
      console.warn('GSI initialization error:', err);
    }
  }, [scriptLoaded, clientId, onSuccess, onError]);

  const handleCustomButtonClick = () => {
    if (!clientId) {
      onError?.(
        new Error('Google Sign-In is temporarily unavailable. Please use your email and password to sign in.')
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('Google prompt invocation notice:', err);
      }
    } else {
      onError?.(new Error('Google Sign-In is initializing. Please try again in a moment.'));
    }
  };

  return (
    <div className="google-auth-wrapper" style={{ width: '100%', position: 'relative' }}>
      {/* Interactive Google Render Button overlay when clientId and script are loaded */}
      {clientId && scriptLoaded && (
        <div
          ref={googleBtnContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.001,
            zIndex: 2,
            overflow: 'hidden',
            pointerEvents: disabled ? 'none' : 'auto',
          }}
          aria-hidden="true"
        />
      )}

      {/* Styled accessible Google Auth Button */}
      <button
        type="button"
        className="google-signin-btn"
        onClick={handleCustomButtonClick}
        disabled={disabled}
        aria-label="Continue with Google"
      >
        <GoogleIcon size={20} className="google-icon-svg" />
        <span className="google-btn-label">{text}</span>
      </button>
    </div>
  );
}
