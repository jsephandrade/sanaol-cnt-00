import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import SocialProviders from '@/components/auth/SocialProviders';
import AuthCard from '@/components/auth/AuthCard';
import AuthPageShell, {
  AUTH_PAGE_DEFAULT_BACKGROUND,
} from '@/components/auth/AuthPageShell';
import AuthBrandIntro from '@/components/auth/AuthBrandIntro';
import { Eye, EyeOff } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { signInWithGoogle } from '@/lib/google';

const SignupPage = () => {
  const { socialLogin, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(''); // 🔹 error state
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🔹 Check password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setPending(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res = await register({ name, email, password });
      if (res?.success && res?.pending) {
        try {
          sessionStorage.setItem('verify_token', res.verifyToken || '');
          sessionStorage.setItem(
            'pending_user',
            JSON.stringify(res.user || {})
          );
        } catch {}
        navigate('/verify');
      } else if (res?.success) {
        navigate('/');
      } else {
        setError(res?.error || 'Signup failed. Please try again.');
      }
    } finally {
      setPending(false);
    }
  };

  const handleSocial = async (provider, payload /* e or credential */) => {
    setError('');
    setPending(true);

    if (provider === 'google-credential') {
      try {
        const res = await loginWithGoogle(payload);
        if (!res?.success) throw new Error('Google failed');
        if (res?.pending) {
          try {
            sessionStorage.setItem('verify_token', res.verifyToken || '');
            sessionStorage.setItem(
              'pending_user',
              JSON.stringify(res.user || {})
            );
          } catch {}
        }
        navigate(res?.pending ? '/verify' : '/');
      } catch (e) {
        setError(
          e?.message || 'Google authentication failed. Please try again.'
        );
      }
    } else if (provider === 'google') {
      try {
        const credential = await signInWithGoogle();
        const res = await loginWithGoogle(credential);
        if (!res?.success) throw new Error('Google failed');
        if (res?.pending) {
          try {
            sessionStorage.setItem('verify_token', res.verifyToken || '');
            sessionStorage.setItem(
              'pending_user',
              JSON.stringify(res.user || {})
            );
          } catch {}
        }
        navigate(res?.pending ? '/verify' : '/');
      } catch (e) {
        setError(
          e?.message || 'Google authentication failed. Please try again.'
        );
      }
    } else {
      await socialLogin(provider);
    }

    setPending(false);
  };

  const signupCard = (
    <AuthCard
      title="Create Account"
      compact
      className="mx-auto"
      cardClassName="shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder=" "
              className="peer w-full h-10 px-3 pt-3 pb-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
            <label
              htmlFor="firstName"
              className="absolute left-3 text-muted-foreground pointer-events-none transition-all top-0 -translate-y-1/2 text-xs px-1 bg-white peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:px-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-white"
            >
              First Name
            </label>
          </div>
          <div className="relative">
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder=" "
              className="peer w-full h-10 px-3 pt-3 pb-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
            <label
              htmlFor="lastName"
              className="absolute left-3 text-muted-foreground pointer-events-none transition-all top-0 -translate-y-1/2 text-xs px-1 bg-white peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:px-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-white"
            >
              Last Name
            </label>
          </div>
        </div>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            className="peer w-full h-10 px-3 pt-3 pb-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
          <label
            htmlFor="email"
            className="absolute left-3 text-muted-foreground pointer-events-none transition-all top-0 -translate-y-1/2 text-xs px-1 bg-white peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:px-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-white"
          >
            Email
          </label>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            className="peer w-full h-10 px-3 pt-3 pb-3 pr-9 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            required
            minLength={8}
          />
          <label
            htmlFor="password"
            className="absolute left-3 text-muted-foreground pointer-events-none transition-all top-0 -translate-y-1/2 text-xs px-1 bg-white peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:px-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-white"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {!showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          The password should be at least 8 characters.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-300"
        >
          {pending ? 'Processing...' : 'Sign Up'}
        </button>
      </form>

      <SocialProviders
        onSocial={handleSocial}
        pending={pending}
        providers={['google']}
      />

      <p className="mt-4 text-sm text-gray-600 text-center">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="font-semibold text-primary hover:text-primary-dark"
          type="button"
        >
          Log in here
        </button>
      </p>
    </AuthCard>
  );

  const signupIntro = (
    <AuthBrandIntro
      title="Create your account"
      description="Unlock dashboards for orders, stock alerts, and staff scheduling the moment you join the TechnoMart team."
    />
  );

  return (
    <PageTransition>
      <AuthPageShell
        backgroundImage={AUTH_PAGE_DEFAULT_BACKGROUND}
        waveImage="/images/b1bc6b54-fe3f-45eb-8a39-005cc575deef.png"
        formWrapperClassName="max-w-md mr-auto md:mr-[min(8rem,14vw)] md:ml-0"
        formSlot={signupCard}
        asideSlot={signupIntro}
      />
    </PageTransition>
  );
};

export default SignupPage;
