import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

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

const ModernLoginForm = ({
  email,
  password,
  pending,
  error,
  emailError,
  passwordError,
  remember = false,
  onEmailChange,
  onPasswordChange,
  onRememberChange,
  onSubmit,
  onForgotPassword,
}) => {
  const alertRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error && alertRef.current) {
      alertRef.current.focus();
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <div className="w-full max-w-md">
      {error && (
        <div
          className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200"
          role="alert"
          tabIndex={-1}
          ref={alertRef}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
        aria-busy={pending || undefined}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => onEmailChange?.(e.target.value)}
              placeholder="Enter your email"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-gray-900 placeholder-gray-500"
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              disabled={pending}
              autoFocus
            />
          </div>
          {emailError && (
            <p id="email-error" className="mt-2 text-sm text-red-600">
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange?.(e.target.value)}
              placeholder="Enter your password"
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-gray-900 placeholder-gray-500"
              required
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              disabled={pending}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
              disabled={pending}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="mt-2 text-sm text-red-600">
              {passwordError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
              checked={!!remember}
              onChange={(e) => onRememberChange?.(e.target.checked)}
              disabled={pending}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>

          <button
            type="button"
            className="text-sm text-brand-teal hover:text-brand-teal-light font-medium disabled:opacity-60"
            onClick={onForgotPassword}
            disabled={pending}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-teal hover:bg-brand-teal-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {pending ? (
            <>
              <Spinner /> Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

ModernLoginForm.propTypes = {
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  pending: PropTypes.bool,
  error: PropTypes.string,
  emailError: PropTypes.string,
  passwordError: PropTypes.string,
  remember: PropTypes.bool,
  onEmailChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onRememberChange: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  onForgotPassword: PropTypes.func,
};

export default ModernLoginForm;