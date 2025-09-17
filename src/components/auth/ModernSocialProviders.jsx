import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { renderGoogleButton } from '@/lib/google';

const ModernSocialProviders = ({ onSocial, pending }) => {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const renderButton = async () => {
      if (googleButtonRef.current) {
        try {
          await renderGoogleButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: '100%',
            },
            (credential) => onSocial?.('google-credential', credential)
          );
        } catch (error) {
          console.warn('Google button render failed:', error);
        }
      }
    };

    if (!pending) {
      renderButton();
    }
  }, [onSocial, pending]);

  const handleAppleLogin = () => {
    if (!pending) {
      onSocial?.('apple');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
        </div>
      </div>

      <div className="space-y-3">
        <div ref={googleButtonRef} className="w-full" />
        
        <button
          type="button"
          onClick={handleAppleLogin}
          disabled={pending}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continue with Apple
        </button>
      </div>
    </div>
  );
};

ModernSocialProviders.propTypes = {
  onSocial: PropTypes.func.isRequired,
  pending: PropTypes.bool,
};

export default ModernSocialProviders;