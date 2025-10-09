import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import SocialProviders from '@/components/auth/SocialProviders';
import PageTransition from '@/components/PageTransition';
import AuthCard from '@/components/auth/AuthCard';
import AuthPageShell, {
  AUTH_PAGE_DEFAULT_BACKGROUND,
} from '@/components/auth/AuthPageShell';
import AuthBrandIntro from '@/components/auth/AuthBrandIntro';
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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    try {
      const savedEmail = getRememberedEmail();
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
    } catch {}
  }, []);

  const resolveLoginErrorMessage = (result) => {
    const status = result?.status ?? null;
    const raw = result?.error || result?.message || '';
    if (status === 401 || status === 404)
      return 'Incorrect account credentials.';
    if (typeof raw === 'string') {
      if (/invalid credentials/i.test(raw))
        return 'Incorrect account credentials.';
      if (/account not found/i.test(raw))
        return 'Incorrect account credentials.';
    }
    return raw || 'Something went wrong. Please try again.';
  };

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
        setError(resolveLoginErrorMessage(res));
        return;
      }

      if (res?.otpRequired) {
        sessionStorage.setItem(
          'login_otp_context',
          JSON.stringify({
            email,
            otpToken: res?.otpToken || '',
            remember,
            user: res?.user || null,
            expiresAt: Date.now() + (res?.otpExpiresIn || 60) * 1000,
          })
        );
        remember ? rememberEmail(email) : clearRememberedEmail();
        navigate('/otp');
        return;
      }

      if (
        res?.pending ||
        (res?.user?.status || '').toLowerCase() !== 'active'
      ) {
        sessionStorage.setItem('verify_token', res.verifyToken || '');
        sessionStorage.setItem('pending_user', JSON.stringify(res.user || {}));
        navigate('/verify');
        return;
      }

      remember ? rememberEmail(email) : clearRememberedEmail();
      navigate('/');
    } catch (err) {
      setError(
        resolveLoginErrorMessage({
          error: err?.message,
          status: err?.status ?? null,
        })
      );
    } finally {
      setPending(false);
    }
  };

  const handleSocial = async (provider, payload) => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      if (provider === 'google-credential' || provider === 'google') {
        const credential =
          provider === 'google-credential' ? payload : await signInWithGoogle();
        const res = await loginWithGoogle(credential, { remember });
        if (!res?.success) throw new Error('Google login failed');
        if (res?.verifyToken) {
          sessionStorage.setItem('verify_token', res.verifyToken || '');
          sessionStorage.setItem(
            'pending_user',
            JSON.stringify(res.user || {})
          );
          navigate('/verify');
          return;
        }
      } else {
        await socialLogin(provider);
      }
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Social login failed. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const handleForgotPassword = () => {
    if (!pending) navigate('/forgot-password');
  };

  const loginCard = (
    <AuthCard title="Login" compact cardClassName="shadow-2xl">
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
      <p className="mt-6 text-sm text-gray-600 text-center">
        Don’t have an account yet?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="font-semibold text-primary hover:text-primary-dark disabled:opacity-60"
          type="button"
          disabled={pending}
        >
          Sign up now
        </button>
      </p>
    </AuthCard>
  );

  const welcomeIntro = (
    <AuthBrandIntro
      title="Welcome back"
      description="Sign in to manage orders, inventory, and your team for a smooth day at the canteen."
    />
  );

  return (
    <PageTransition>
      <AuthPageShell
        backgroundImage={AUTH_PAGE_DEFAULT_BACKGROUND}
        waveImage="/images/b1bc6b54-fe3f-45eb-8a39-005cc575deef.png"
        formWrapperClassName="order-2 md:order-1 w-full flex justify-center px-4 md:px-0"
        asideWrapperClassName="order-1 md:order-2 mb-10 md:mb-0 flex justify-center"
        formSlot={loginCard}
        asideSlot={welcomeIntro}
      />
    </PageTransition>
  );
};

export default LoginPage;
