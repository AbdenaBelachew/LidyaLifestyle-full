import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartCount } from '../utils/cart';

export default function CartIcon() {
  const navigate = useNavigate();
  const [count, setCount] = useState(getCartCount());

  useEffect(() => {
    const update = () => setCount(getCartCount());
    window.addEventListener('cart-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('cart-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return (
    <button
      type="button"
      className="cart-icon-btn"
      onClick={() => navigate('/cart')}
      aria-label={`Cart, ${count} items`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M6 6L5 3H2" />
      </svg>
      {count > 0 && <span className="cart-badge">{count > 99 ? '99+' : count}</span>}
    </button>
  );
}
