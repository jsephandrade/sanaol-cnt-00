import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import AuthCard from '@/components/auth/AuthCard';
import AuthPageShell from '@/components/auth/AuthPageShell';
import AuthBrandIntro from '@/components/auth/AuthBrandIntro';
import authService from '@/api/services/authService';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const SetNewPasswordPage = () => {
  const query = useQuery();
  const alertRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = useMemo(() => {
    const q = query.get('token') || '';
    if (q) return q;
    try {
      return sessionStorage.getItem('reset_token') || '';
    } catch {
      return '';
    }
  }, [query]);

  useEffect(() => {
    if ((error || success) && alertRef.current) {
      alertRef.current.focus();
    }
  }, [error, success]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    try {
      const res = await authService.confirmPasswordReset(token, password);
      if (res?.success) {
        setSuccess('Your password has been reset. You can now log in.');
        try {
          sessionStorage.removeItem('reset_token');
        } catch {}
      } else {
        setError(res?.message || 'Reset failed. The link may have expired.');
      }
    } catch (err) {
      setError(err?.message || 'Could not reset password.');
    } finally {
      setPending(false);
    }
  };

  const formCard = (
    <AuthCard
      title="Set New Password"
      compact
      className="mx-auto"
      cardClassName="shadow-2xl"
    >
      <p className="text-sm text-gray-600 mb-4">
        Create a secure password to finish resetting your account.
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
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
        aria-busy={pending || undefined}
      >
        <div>
          <label className="sr-only" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
            required
            minLength={8}
            disabled={pending}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="confirm-password">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Confirm new password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
            required
            minLength={8}
            disabled={pending}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
        >
          {pending ? 'Saving...' : 'Set Password'}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600 text-center">
        <Link to="/login" className="text-primary underline underline-offset-2">
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );

  const introContent = (
    <AuthBrandIntro
      title="Almost there"
      description="Set a new password so you can sign in and keep the canteen running smoothly."
    />
  );

  return (
    <PageTransition>
      <AuthPageShell
        backgroundImage="/images/campus-building.png"
        waveImage="/images/b1bc6b54-fe3f-45eb-8a39-005cc575deef.png"
        formWrapperClassName="max-w-md mr-auto md:mr-[min(8rem,14vw)] md:ml-0"
        formSlot={formCard}
        asideSlot={introContent}
      />
    </PageTransition>
  );
};

export default SetNewPasswordPage;
