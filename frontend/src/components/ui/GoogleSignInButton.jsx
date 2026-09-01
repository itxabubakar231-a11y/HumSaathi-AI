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
  const [configNotice, setConfigNotice] = useState(null);

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

  // Initialize GSI if clientId is available
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

      // Render native hidden/overlay button in container if container is available
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
    } catch (err) {
      console.warn('GSI initialization error:', err);
    }
  }, [scriptLoaded, clientId, onSuccess, onError]);

  const handleCustomButtonClick = () => {
    if (!clientId) {
      setConfigNotice(
        'Google OAuth requires VITE_GOOGLE_CLIENT_ID environment variable. Please set it in your environment or use email & password.'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap is skipped/suppressed, trigger native button click if available
            const nativeBtn = googleBtnContainerRef.current?.querySelector('div[role="button"]');
            if (nativeBtn) {
              nativeBtn.click();
            }
          }
        });
      } catch (err) {
        console.warn('Google prompt invocation notice:', err);
      }
    } else {
      setConfigNotice('Google Sign-In is initializing. Please try again in a moment.');
    }
  };

  return (
    <div className="google-auth-wrapper" style={{ width: '100%' }}>
      {/* Hidden native container for Google renderButton fallback */}
      <div
        ref={googleBtnContainerRef}
        style={{
          display: clientId && scriptLoaded ? 'none' : 'none',
        }}
        aria-hidden="true"
      />

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

      {configNotice && (
        <div
          className="google-config-notice"
          role="status"
          style={{
            marginTop: '0.5rem',
            padding: '0.6rem 0.85rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            textAlign: 'left',
          }}
        >
          <span>ℹ️ {configNotice}</span>
        </div>
      )}
    </div>
  );
}
