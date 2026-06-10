import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer" id="connect">
      <div className="footer-inner">
        <div className="footer-brand">
          <BrandLogo variant="footer" showTagline />
        </div>

        <div className="footer-links">
          <Link to="/shop">Shop</Link>
          <Link to="/cart">Cart</Link>
          <a href="mailto:hello@lidya.com">Contact</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LIDIYA LIFESTYLE</p>
      </div>
    </footer>
  );
}
