import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CartIcon from './CartIcon';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { hash: 'story', label: 'Our Story' },
  { hash: 'collection', label: 'Collection' },
  { hash: 'connect', label: 'Connect' },
];

function isActive(link, pathname, hash) {
  if (link.to && link.end) return pathname === '/';
  if (link.to) return pathname === link.to || pathname.startsWith(`${link.to}/`);
  if (link.hash) return pathname === '/' && hash === `#${link.hash}`;
  return false;
}

function NavItem({ link, pathname, hash, onNavigate }) {
  const active = isActive(link, pathname, hash);
  const className = active ? 'active' : '';

  if (link.hash) {
    const href = pathname === '/' ? `#${link.hash}` : `/#${link.hash}`;
    return (
      <a href={href} className={className} onClick={onNavigate}>
        {link.label}
        <span className="nav-underline" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link to={link.to} className={className} onClick={onNavigate}>
      {link.label}
      <span className="nav-underline" aria-hidden="true" />
    </Link>
  );
}

function DrawerItem({ link, pathname, hash, onNavigate, delay }) {
  const active = isActive(link, pathname, hash);
  const className = `nav-drawer-item ${active ? 'active' : ''}`;

  if (link.hash) {
    const href = pathname === '/' ? `#${link.hash}` : `/#${link.hash}`;
    return (
      <a
        href={href}
        className={className}
        onClick={onNavigate}
        style={{ '--delay': delay }}
      >
        {link.label}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </a>
    );
  }

  return (
    <Link
      to={link.to}
      className={className}
      onClick={onNavigate}
      style={{ '--delay': delay }}
    >
      {link.label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hash, setHash] = useState(window.location.hash);
  const location = useLocation();

  const isLightPage =
    location.pathname.startsWith('/shop') ||
    location.pathname.startsWith('/product') ||
    location.pathname.startsWith('/cart') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/category');

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(y / docHeight, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    setHash(window.location.hash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const solid = scrolled || isLightPage || menuOpen;
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav id="navbar" className={`site-nav ${solid ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
        <div className="nav-scroll-progress" aria-hidden="true">
          <div className="nav-scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} />
        </div>

        <div className="nav-top-border" aria-hidden="true" />
        <div className="nav-glow" aria-hidden="true" />

        <div className="nav-container">
          <Link to="/" className="nav-brand" aria-label="Lidya Lifestyle Home">
            <div className="nav-logo-wrap">
              <img src="/logo.png" alt="Lidya Lifestyle" className="nav-logo-img" />
            </div>
            <span className="nav-wordmark">
              <span className="nav-name">Lidya Lifestyle</span>
              <span className="nav-tagline">God is in the Details</span>
            </span>
          </Link>

          <ul className="nav-links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <NavItem
                  link={link}
                  pathname={location.pathname}
                  hash={hash}
                  onNavigate={closeMenu}
                />
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <CartIcon />
            <Link to="/shop" className="nav-cta-btn">
              <span>Shop Now</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <button
              type="button"
              className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="nav-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}

      <aside className={`nav-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="nav-drawer-header">
          <Link to="/" className="nav-drawer-brand" onClick={closeMenu}>
            <span className="nav-drawer-brand-name">Lidya Lifestyle</span>
            <span className="nav-drawer-brand-tagline">God is in the Details</span>
          </Link>
          <button className="nav-drawer-close" onClick={closeMenu} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="nav-drawer-nav" role="list">
          {NAV_LINKS.map((link, i) => (
            <DrawerItem
              key={link.label}
              link={link}
              pathname={location.pathname}
              hash={hash}
              onNavigate={closeMenu}
              delay={`${i * 0.06}s`}
            />
          ))}
          <Link to="/shop" className="nav-drawer-cta" onClick={closeMenu} style={{ '--delay': `${NAV_LINKS.length * 0.06}s` }}>
            <span>Shop Now</span>
          </Link>
        </nav>

        <div className="nav-drawer-footer">
          <span className="nav-drawer-tagline">God is in the Details</span>
        </div>
      </aside>
    </>
  );
}
