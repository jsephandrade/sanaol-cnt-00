import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/auth/Header';
import HeroImage from '@/components/auth/HeroImage';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import SocialProviders from '@/components/auth/SocialProviders';
import PageTransition from '@/components/PageTransition';
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/30">
        <Header />

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 md:px-8 gap-12 max-w-7xl mx-auto w-full py-8 lg:py-16">
          <div className="w-full lg:w-1/2 flex flex-col gap-8 max-w-md order-2 lg:order-1">
            <AuthCard title="Sign In">
              <LoginForm
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

              <SocialProviders onSocial={handleSocial} pending={pending} />

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => navigate('/signup')}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors 
                      focus:outline-none focus:ring-2 focus:ring-ring rounded-sm disabled:opacity-60"
                    type="button"
                    disabled={pending}
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </AuthCard>
          </div>

          {/* Ensure HeroImage includes meaningful alt text in its component */}
          <HeroImage src="/images/b1bc6b54-fe3f-45eb-8a39-005cc575deef.png" />
        </main>

        <footer className="py-8 text-muted-foreground text-xs text-center border-t border-border/50">
          &copy; {new Date().getFullYear()} TechnoMart Canteen System. All rights reserved.
        </footer>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
