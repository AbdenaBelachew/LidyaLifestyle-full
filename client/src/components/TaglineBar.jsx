import React from 'react';
import { BRAND_TAGLINE } from './BrandLogo';
import './TaglineBar.css';

const ITEMS = [
  BRAND_TAGLINE,
  'Handwoven in Ethiopia',
  'Ethically Sourced Cotton',
  'Artisan Craftsmanship',
];

export default function TaglineBar() {
  return (
    <div className="tagline-bar">
      <div className="tagline-track">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="tagline-item">
            <span className="tagline-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
