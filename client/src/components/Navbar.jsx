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
      </a>
    );
  }

  return (
    <Link to={link.to} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 50);
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
        <div className="nav-glow" aria-hidden="true" />
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <img src="/logo.png" alt="Lidya Lifestyle" className="nav-logo-img" />
            <span className="nav-wordmark">
              <span className="nav-name">Lidya Lifestyle</span>
              <span className="nav-tagline">God is in the Details</span>
            </span>
          </Link>

          <ul className="nav-links">
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
        <nav className="nav-drawer-nav">
          {NAV_LINKS.map((link) => (
            <NavItem
              key={link.label}
              link={link}
              pathname={location.pathname}
              hash={hash}
              onNavigate={closeMenu}
            />
          ))}
          <Link to="/shop" className="nav-drawer-cta" onClick={closeMenu}>
            Shop Now
          </Link>
        </nav>
      </aside>
    </>
  );
}
