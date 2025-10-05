import React from 'react';
import PropTypes from 'prop-types';

export const AUTH_BRAND_BADGE_IMAGE = '/src/assets/technomart-logo.png';

const AuthBrandIntro = ({
  badgeImageSrc = AUTH_BRAND_BADGE_IMAGE,
  badgeImageAlt = 'Technomart logo',
  badgeImageClassName = 'h-12 w-12 object-contain rounded-xl',
  badgeText = '',
  badgeClassName = 'h-12 w-12',
  badgeTextClassName = 'text-primary font-semibold text-xl',
  title,
  description,
  className = 'text-center md:text-left space-y-3',
  contentClassName = 'space-y-2',
  children,
}) => {
  const badgeImageClasses = [badgeClassName, badgeImageClassName]
    .filter(Boolean)
    .join(' ');
  const badgeTextClasses = [badgeClassName, badgeTextClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {(badgeImageSrc || badgeText) &&
        (badgeImageSrc ? (
          <img
            src={badgeImageSrc}
            alt={badgeImageAlt}
            className={badgeImageClasses}
          />
        ) : (
          <span className={badgeTextClasses}>{badgeText}</span>
        ))}
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
  badgeImageSrc: PropTypes.string,
  badgeImageAlt: PropTypes.string,
  badgeImageClassName: PropTypes.string,
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
