import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import TestimonialSection from '@/components/auth/TestimonialSection';
import ModernLoginForm from '@/components/auth/ModernLoginForm';
import ModernSocialProviders from '@/components/auth/ModernSocialProviders';
import { signInWithGoogle } from '@/lib/google';
import {
  getRememberedEmail,
  rememberEmail,
  clearRememberedEmail,
} from '@/lib/credentials';

const LoginPage = () => {
  const { login, socialLogin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  // field-level errors for a11y
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Prefill email from localStorage (we do not store passwords)
  useEffect(() => {
    try {
      const savedEmail = getRememberedEmail();
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
    } catch {}
  }, []);

  const validate = () => {
    let ok = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required.');
      ok = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      ok = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      ok = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      ok = false;
    }

    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError('');

    if (!validate()) return;

    setPending(true);
    try {
      const res = await login(email, password, { remember });
      if (!res?.success) {
        setError(res?.error || 'Invalid credentials.');
        return;
      }
      // If pending, stash verify token and route to verification
      if (
        res?.pending ||
        (res?.user?.status || '').toLowerCase() !== 'active'
      ) {
        try {
          sessionStorage.setItem('verify_token', res.verifyToken || '');
          sessionStorage.setItem(
            'pending_user',
            JSON.stringify(res.user || {})
          );
        } catch {}
        navigate('/verify');
        return;
      }
      // Persist or clear remembered email based on the checkbox
      try {
        if (remember) {
          rememberEmail(email);
        } else {
          clearRememberedEmail();
        }
      } catch {}

      navigate('/');
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  // SocialProviders now calls onSocial(provider, event).
  const handleSocial = async (provider, payload /* e or credential */) => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      if (provider === 'google-credential') {
        const res = await loginWithGoogle(payload, { remember });
        if (!res?.success) throw new Error('Google login failed');
        if (res?.token) {
          // approved path -> handled below by navigate('/')
        } else if (res?.verifyToken) {
          // pending path -> send to verification
          try {
            sessionStorage.setItem('verify_token', res.verifyToken || '');
            sessionStorage.setItem(
              'pending_user',
              JSON.stringify(res.user || {})
            );
          } catch {}
          navigate('/verify');
          return;
        } else {
          setError(
            'Your Google account is not registered or not yet approved.'
          );
          return;
        }
      } else if (provider === 'google') {
        const credential = await signInWithGoogle();
        const res = await loginWithGoogle(credential, { remember });
        if (!res?.success) throw new Error('Google login failed');
        if (res?.token) {
          // approved path -> continue to home
        } else if (res?.verifyToken) {
          try {
            sessionStorage.setItem('verify_token', res.verifyToken || '');
            sessionStorage.setItem(
              'pending_user',
              JSON.stringify(res.user || {})
            );
          } catch {}
          navigate('/verify');
          return;
        } else {
          setError(
            'Your Google account is not registered or not yet approved.'
          );
          return;
        }
      } else {
        await socialLogin(provider);
      }
      // navigate("/dashboard");
      navigate('/');
    } catch (err) {
      setError('Social login failed. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const handleForgotPassword = () => {
    if (pending) return;
    navigate('/forgot-password');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex bg-white">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TechnoMart</span>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600">
                Sign in to access your dashboard and continue optimizing your QA process.
              </p>
            </div>

            {/* Login Form */}
            <ModernLoginForm
              email={email}
              password={password}
              pending={pending}
              error={error}
              emailError={emailError}
              passwordError={passwordError}
              remember={remember}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onRememberChange={setRemember}
              onForgotPassword={handleForgotPassword}
              onSubmit={handleSubmit}
            />

            {/* Social Login */}
            <div className="mt-6">
              <ModernSocialProviders onSocial={handleSocial} pending={pending} />
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <span className="text-gray-600 text-sm">Don't have an Account? </span>
              <button
                onClick={() => navigate('/signup')}
                className="text-brand-teal hover:text-brand-teal-light text-sm font-semibold disabled:opacity-60"
                type="button"
                disabled={pending}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Testimonial */}
        <TestimonialSection />
      </div>
    </PageTransition>
  );
};

export default LoginPage;
