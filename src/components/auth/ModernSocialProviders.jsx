import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { renderGoogleButton } from '@/lib/google';
import { Scan } from 'lucide-react';

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

  const handleFaceScan = () => {
    if (!pending) {
      window.location.href = '/face-scan';
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
          onClick={handleFaceScan}
          disabled={pending}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <Scan className="w-5 h-5 mr-3" />
          Continue with Face Scan
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