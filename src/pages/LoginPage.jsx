import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/auth/Header';
import HeroImage from '@/components/auth/HeroImage';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import SocialProviders from '@/components/auth/SocialProviders';
import PageTransition from '@/components/PageTransition';

const LoginPage = () => {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  // field-level errors for a11y
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      const ok = await login(email, password, { remember });
      if (!ok) {
        setError('Invalid credentials.');
        return;
      }
      // navigate on success if desired:
      // navigate("/dashboard");
      navigate('/');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  // SocialProviders now calls onSocial(provider, event).
  const handleSocial = async (provider /* , e */) => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await socialLogin(provider);
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
      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-1 flex flex-col md:flex-row items-center px-4 md:px-6 gap-8 max-w-7xl mx-auto w-full py-8">
        <div className="w-full md:w-1/2 flex flex-col gap-6 max-w-lg order-2 md:order-1">
          <AuthCard title="Login">
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

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/signup')}
                className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-60"
                type="button"
                disabled={pending}
              >
                Create New Account
              </button>
            </div>
          </AuthCard>
        </div>

        {/* Ensure HeroImage includes meaningful alt text in its component */}
        <HeroImage src="/images/b1bc6b54-fe3f-45eb-8a39-005cc575deef.png" />
      </main>

        <footer className="py-6 text-gray-500 text-xs text-center border-t border-gray-100">
          &copy; {new Date().getFullYear()} TechnoMart Canteen System
        </footer>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
