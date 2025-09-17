import React, { useId } from 'react';
import PropTypes from 'prop-types';

const AuthCard = ({
  title,
  children,
  className = '',
  cardClassName = '',
  compact = false,
  ...rest
}) => {
  const headingId = useId();

  return (
    <section
      className={`w-full ${compact ? 'max-w-sm' : 'max-w-md'} mx-auto md:mx-0 ${className}`}
      aria-labelledby={title ? headingId : undefined}
      {...rest}
    >
      <div
        className={`bg-card border border-border/50 backdrop-blur-sm ${
          compact ? 'p-8 rounded-2xl' : 'p-8 rounded-2xl'
        } shadow-elegant transition-all duration-300 hover:shadow-lg ${cardClassName}`}
        style={{
          boxShadow: 'var(--shadow-elegant)',
        }}
      >
        {title && (
          <div className="text-center mb-8">
            <h1 id={headingId} className="text-2xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Welcome back! Please enter your details
            </p>
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

AuthCard.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  cardClassName: PropTypes.string,
  compact: PropTypes.bool,
};

export default AuthCard;
