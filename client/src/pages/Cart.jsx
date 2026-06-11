import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCart, updateCartQuantity, removeFromCart } from '../utils/cart';
import { getProducts, getImageUrl } from '../api';
import './shop.css';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    const cart = getCart();
    if (!cart.length) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getProducts({ limit: 200 });
      const detailed = cart
        .map((item) => ({
          ...item,
          product: (data.products || []).find((p) => p.id === item.productId),
        }))
        .filter((i) => i.product);
      setItems(detailed);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    const onUpdate = () => loadCart();
    window.addEventListener('cart-updated', onUpdate);
    return () => window.removeEventListener('cart-updated', onUpdate);
  }, []);

  const handleQtyChange = (productId, delta) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    updateCartQuantity(productId, newQty);
    loadCart();
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    loadCart();
  };

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="shop-container cart-page">
          <div className="cart-empty">
            <p>Loading your cart…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!items.length) {
    return (
      <>
        <Navbar />
        <div className="shop-container cart-page">
          <div className="cart-header">
            <div className="cart-header-left">
              <span className="cart-eyebrow">Review Your Selections</span>
              <h1 className="cart-title">Shopping Cart</h1>
            </div>
          </div>
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Discover our handwoven textiles and artisan pieces crafted with care.</p>
            <Link to="/shop" className="cart-btn cart-btn-primary">Start Shopping</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="shop-container cart-page">
        <div className="cart-header">
          <div className="cart-header-left">
            <span className="cart-eyebrow">Review Your Selections</span>
            <h1 className="cart-title">Shopping Cart</h1>
          </div>
          <span className="cart-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                {item.product.primary_image ? (
                  <img
                    src={getImageUrl(item.product.primary_image)}
                    alt={item.product.name}
                    className="cart-item-image"
                  />
                ) : (
                  <div className="cart-item-image" />
                )}
                <div className="cart-item-details">
                  <Link to={`/product/${item.product.slug}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <p className="cart-item-price">${parseFloat(item.product.price).toFixed(2)}</p>
                </div>
                <div className="qty-selector">
                  <button type="button" onClick={() => handleQtyChange(item.productId, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => handleQtyChange(item.productId, 1)}>+</button>
                </div>
                <div className="cart-item-total">
                  ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </div>
                <button type="button" className="cart-remove" onClick={() => handleRemove(item.productId)} aria-label="Remove item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-header">
              <h2>Order Summary</h2>
            </div>
            <div className="cart-summary-body">
              <div className="cart-summary-row">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-total">
                <span className="cart-summary-total-label">Total</span>
                <span className="cart-summary-total-value">${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-actions">
                <Link to="/checkout" className="cart-btn cart-btn-primary">
                  <span>Proceed to Checkout</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link to="/shop" className="cart-btn cart-btn-outline">Continue Shopping</Link>
              </div>
              <div className="cart-trust-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Secure checkout • Free returns
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
