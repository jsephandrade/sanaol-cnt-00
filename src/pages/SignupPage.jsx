import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/auth/Header';
import HeroImage from '@/components/auth/HeroImage';
import SocialProviders from '@/components/auth/SocialProviders';
import { Eye, EyeOff } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const SignupPage = () => {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(''); // 🔹 error state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🔹 Check password length
  if (password.length < 8) {
    setError("Password must be at least 8 characters long.");
    return;
  }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setPending(true);

    // Simulated signup - just pretend it worked
    setTimeout(() => {
      navigate('/login');
      alert('Account created successfully! Please log in.');
    }, 1000);

    setPending(false);
  };

  const handleSocial = async (provider) => {
    setPending(true);
    
    if (provider === 'facescan') {
      // Handle face scan authentication
      try {
        // Simulate face scan process
        alert('Face scan authentication initiated...');
        // In a real implementation, you would integrate with a face recognition API
        setTimeout(() => {
          alert('Face scan authentication successful!');
          navigate('/dashboard'); // or wherever you want to redirect after successful auth
        }, 2000);
      } catch (error) {
        alert('Face scan authentication failed. Please try again.');
      }
    } else {
      await socialLogin(provider);
    }
    
    setPending(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-1 flex flex-col md:flex-row items-center px-4 md:px-6 gap-8 max-w-7xl mx-auto w-full py-8">
        <div className="w-full md:w-1/2 flex flex-col gap-6 max-w-lg order-2 md:order-1">
          <div className="w-full max-w-md mx-auto md:mx-0">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Create Account</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contact Number"
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />

                {/* Password with toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2 pr-9 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {!showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm Password with toggle */}
                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full p-2 pr-9 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {!showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-300"
                >
                  {pending ? 'Processing...' : 'Sign Up'}
                </button>
              </form>

              {/* Only show Google social login */}
<SocialProviders 
  onSocial={handleSocial} 
  pending={pending} 
  providers={['google']} 
/>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                  type="button"
                >
                  Already have an account? Log in
                </button>
              </div>
            </div>
          </div>
        </div>
          <HeroImage src="/images/b1bc6b54-fe3f-45eb-8a39-005cc575deef.png" />
        </main>
      </div>
    </PageTransition>
  );
};

export default SignupPage;