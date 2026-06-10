import React from 'react';
import { Link } from 'react-router-dom';
import './BrandLogo.css';

export const BRAND_NAME = 'Lidya Lifestyle';
export const BRAND_TAGLINE = 'God is in the Details';

export default function BrandLogo({
  variant = 'nav',
  asLink = true,
  className = '',
  showTagline = false,
}) {
  const content = (
    <div className={`brand-logo brand-logo--${variant} ${className}`.trim()}>
      <img src="/logo.png" alt={BRAND_NAME} className="brand-logo-img" />
      {variant !== 'mark' && (
        <div className="brand-logo-text">
          <span className="brand-logo-name">{BRAND_NAME}</span>
          {showTagline && <span className="brand-logo-tagline">{BRAND_TAGLINE}</span>}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return <Link to="/" className="brand-logo-link">{content}</Link>;
  }
  return content;
}
