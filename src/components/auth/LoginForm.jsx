import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

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

const LoginForm = ({
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
    <>
      {error && (
        <div
          className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm"
          role="alert"
          tabIndex={-1}
          ref={alertRef}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
        aria-busy={pending || undefined}
      >
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
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
              className="w-full h-12 px-4 text-sm bg-background border border-input rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                transition-all duration-200 placeholder:text-muted-foreground
                disabled:cursor-not-allowed disabled:opacity-50"
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              disabled={pending}
              autoFocus
            />
          </div>
          {emailError && (
            <p id="email-error" className="text-sm text-destructive">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange?.(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 px-4 pr-12 text-sm bg-background border border-input rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                transition-all duration-200 placeholder:text-muted-foreground
                disabled:cursor-not-allowed disabled:opacity-50"
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground 
                focus:outline-none focus:ring-2 focus:ring-ring rounded-sm transition-colors disabled:opacity-50"
              disabled={pending}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {passwordError && (
            <p id="password-error" className="text-sm text-destructive">
              {passwordError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-input bg-background focus:ring-2 focus:ring-ring text-primary transition-colors"
              checked={!!remember}
              onChange={(e) => onRememberChange?.(e.target.checked)}
              disabled={pending}
            />
            <span className="text-sm text-foreground select-none">Remember me</span>
          </label>

          <button
            type="button"
            className="text-sm font-medium text-primary hover:text-primary-dark underline underline-offset-4 
              transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
            onClick={onForgotPassword}
            disabled={pending}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full h-12 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed 
            text-primary-foreground font-semibold rounded-lg text-sm transition-all duration-200 
            inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            hover:shadow-md active:scale-[0.98]"
          style={{
            background: pending ? undefined : 'var(--gradient-primary)',
          }}
        >
          {pending ? (
            <>
              <Spinner /> Processing...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </>
  );
};

LoginForm.propTypes = {
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

export default LoginForm;
