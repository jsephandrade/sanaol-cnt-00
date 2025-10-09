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
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setPending(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res = await register({ name, email, password });
      if (res?.success && res?.pending) {
        sessionStorage.setItem('verify_token', res.verifyToken || '');
        sessionStorage.setItem('pending_user', JSON.stringify(res.user || {}));
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

  const handleSocial = async (provider, payload) => {
    setError('');
    setPending(true);
    try {
      if (provider === 'google-credential' || provider === 'google') {
        const credential =
          provider === 'google-credential' ? payload : await signInWithGoogle();
        const res = await loginWithGoogle(credential);
        if (!res?.success) throw new Error('Google failed');
        if (res?.pending) {
          sessionStorage.setItem('verify_token', res.verifyToken || '');
          sessionStorage.setItem(
            'pending_user',
            JSON.stringify(res.user || {})
          );
        }
        navigate(res?.pending ? '/verify' : '/');
      } else {
        await socialLogin(provider);
      }
    } catch (e) {
      setError(e?.message || 'Google authentication failed. Please try again.');
    }
    setPending(false);
  };

  const signupCard = (
    <AuthCard title="Create Account" compact cardClassName="shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            required
          />
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
          required
        />

        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-10 px-3 pr-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

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
        formWrapperClassName="order-2 md:order-1 w-full flex justify-center px-4 md:px-0"
        asideWrapperClassName="order-1 md:order-2 mb-10 md:mb-0 flex justify-center"
        formSlot={signupCard}
        asideSlot={signupIntro}
      />
    </PageTransition>
  );
};

export default SignupPage;
