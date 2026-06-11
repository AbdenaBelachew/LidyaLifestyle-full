import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', to: '/shop' },
    { label: 'New Arrivals', to: '/shop?filter=new' },
    { label: 'Bestsellers', to: '/shop?filter=bestseller' },
    { label: 'Gift Cards', to: '/shop?filter=gift' },
  ],
  Company: [
    { label: 'Our Story', to: '/#story' },
    { label: 'Collection', to: '/#collection' },
    { label: 'Journal', to: '/blog' },
    { label: 'Press', to: '/press' },
  ],
  Support: [
    { label: 'Contact Us', to: 'mailto:hello@lidyalifestyle.com' },
    { label: 'Shipping & Returns', to: '/shipping' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Size Guide', to: '/size-guide' },
  ],
};

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    href: 'https://pinterest.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.23-5.22 1.23-5.22s-.31-.63-.31-1.57c0-1.47.85-2.57 1.91-2.57.9 0 1.34.68 1.34 1.49 0 .91-.58 2.27-.88 3.53-.25 1.05.52 1.9 1.55 1.9 1.86 0 3.11-2.39 3.11-5.22 0-2.15-1.45-3.66-3.52-3.66-2.4 0-3.8 1.8-3.8 3.65 0 .72.28 1.5.63 1.92a.25.25 0 01.06.24l-.24.96c-.04.14-.12.17-.27.1C7.43 13.6 7 12.3 7 11.2c0-2.52 1.83-4.84 5.28-4.84 2.77 0 4.93 1.97 4.93 4.61 0 2.75-1.73 4.96-4.13 4.96-.81 0-1.57-.42-1.83-.91l-.5 1.86c-.18.69-.67 1.55-1 2.07.75.23 1.54.35 2.36.35 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer" id="connect">
      {/* Decorative top border */}
      <div className="footer-top-border" aria-hidden="true" />

      <div className="footer-main">
        <div className="footer-inner">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand" aria-label="Lidya Lifestyle">
              <img src="/logo.png" alt="Lidya Lifestyle" className="footer-logo-img" />
              <div className="footer-brand-text">
                <span className="footer-brand-name">Lidya Lifestyle</span>
                <span className="footer-brand-tagline">God is in the Details</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Curating timeless elegance through thoughtfully crafted pieces that celebrate African heritage and contemporary design.
            </p>
            <div className="footer-social">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={social.name}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="footer-links-col">
              <h3 className="footer-col-title">{category}</h3>
              <ul className="footer-nav" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.to.startsWith('mailto:') ? (
                      <a href={link.to} className="footer-link">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className="footer-link">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="footer-newsletter-col">
            <h3 className="footer-col-title">Stay Connected</h3>
            <p className="footer-newsletter-desc">
              Join our community for exclusive previews, stories, and special offers.
            </p>
            {subscribed ? (
              <div className="footer-subscribed">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Welcome to the family! 🌟</span>
              </div>
            ) : (
              <form className="footer-newsletter-form" onSubmit={handleSubscribe} noValidate>
                <div className="footer-input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="footer-input"
                    aria-label="Email address"
                    required
                  />
                  <button type="submit" className="footer-subscribe-btn" aria-label="Subscribe">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Lidya Lifestyle. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="/privacy" className="footer-legal-link">Privacy Policy</a>
            <span className="footer-legal-sep" aria-hidden="true">·</span>
            <a href="/terms" className="footer-legal-link">Terms of Service</a>
            <span className="footer-legal-sep" aria-hidden="true">·</span>
            <a href="/cookies" className="footer-legal-link">Cookie Policy</a>
            <span className="footer-legal-sep" aria-hidden="true">·</span>
            <Link to="/admin/login" className="footer-legal-link">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
