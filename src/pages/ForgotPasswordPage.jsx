import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '@/components/AuthContext'; // Uncomment if you have a real auth method

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  // const { sendPasswordResetEmail } = useAuth(); // <-- if available

  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const alertRef = useRef(null);

  useEffect(() => {
    if ((error || success) && alertRef.current) {
      alertRef.current.focus();
    }
  }, [error, success]);

  const validateEmail = (val) => {
    if (!val) return 'Email is required.';
    // Simple email format check
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    return ok ? '' : 'Please enter a valid email address.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const emailErr = validateEmail(email);
    setEmailError(emailErr);
    if (emailErr) return;

    setPending(true);
    try {
      // --- Replace this block with your real API call ---
      // await sendPasswordResetEmail(email);
      await new Promise((res) => setTimeout(res, 1200)); // simulate network
      // --------------------------------------------------

      setSuccess('If an account exists for this email, a password reset link has been sent.');
    } catch (err) {
      setError('Something went wrong while sending the reset email. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email and we’ll send you a link to reset your password.
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={pending || undefined}>
          <div>
            <label className="sr-only" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              disabled={pending}
              autoFocus
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-700">
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 inline-flex items-center justify-center"
          >
            {pending ? (<><Spinner /> Sending…</>) : 'Send reset link'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to="/login" className="text-primary underline underline-offset-2">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
