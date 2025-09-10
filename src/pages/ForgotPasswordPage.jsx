import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '@/api/services/authService';

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const ForgotPasswordPage = () => {
  // Minimal SMS flow: request code via phone
  const [phone, setPhone] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [success, setSuccess] = useState('');
  const alertRef = useRef(null);

  useEffect(() => {
    if ((error || success) && alertRef.current) {
      alertRef.current.focus();
    }
  }, [error, success]);

  const validatePhone = (val) => {
    if (!val) return 'Phone number is required.';
    const digits = (val || '').replace(/\D+/g, '');
    return digits.length < 8 ? 'Please enter a valid phone number.' : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const err = validatePhone(phone);
    setPhoneError(err);
    if (err) return;

    setPending(true);
    try {
      await authService.forgotPasswordSMS(phone);
      setSuccess('If that phone exists, we sent a 6-digit code.');
      try {
        sessionStorage.setItem('reset_phone', phone);
      } catch {}
      setTimeout(() => {
        window.location.href = `/verify-sms?phone=${encodeURIComponent(phone)}`;
      }, 400);
    } catch (err) {
      setError(
        'Something went wrong while sending the code. Please try again.'
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your verified phone number to receive a 6-digit code.
        </p>

        {(error || success) && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm ${
              success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
            role="alert"
            tabIndex={-1}
            ref={alertRef}
          >
            {success || error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
          aria-busy={pending || undefined}
        >
          <div>
            <label className="sr-only" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoCapitalize="none"
              spellCheck={false}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError('');
              }}
              placeholder="Phone number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              required
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? 'phone-error' : undefined}
              disabled={pending}
              autoFocus
            />
            {phoneError && (
              <p id="phone-error" className="mt-1 text-sm text-red-700">
                {phoneError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 inline-flex items-center justify-center"
          >
            {pending ? (
              <>
                <Spinner /> Sending…
              </>
            ) : (
              'Send code'
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            to="/login"
            className="text-primary underline underline-offset-2"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
