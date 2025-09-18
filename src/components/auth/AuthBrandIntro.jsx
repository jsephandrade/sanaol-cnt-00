import React from 'react';
import PropTypes from 'prop-types';

const AuthBrandIntro = ({
  badgeText = 'TM',
  badgeClassName = 'inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10',
  badgeTextClassName = 'text-primary font-semibold text-xl',
  title,
  description,
  className = 'text-center md:text-left space-y-3',
  contentClassName = 'space-y-2',
  children,
}) => {
  return (
    <div className={className}>
      {badgeText && (
        <div className={badgeClassName}>
          <span className={badgeTextClassName}>{badgeText}</span>
        </div>
      )}
      <div className={contentClassName}>
        {title && (
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-sm text-gray-600 max-w-sm mx-auto md:mx-0">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

AuthBrandIntro.propTypes = {
  badgeText: PropTypes.string,
  badgeClassName: PropTypes.string,
  badgeTextClassName: PropTypes.string,
  title: PropTypes.node,
  description: PropTypes.node,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  children: PropTypes.node,
};

export default AuthBrandIntro;
