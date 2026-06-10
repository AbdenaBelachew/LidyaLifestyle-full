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
        <div className="shop-container cart-page"><p>Loading cart…</p></div>
        <Footer />
      </>
    );
  }

  if (!items.length) {
    return (
      <>
        <Navbar />
        <div className="shop-container cart-page">
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Discover our handwoven textiles and artisan pieces.</p>
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
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Your Cart</h1>
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
              <div>
                <Link to={`/product/${item.product.slug}`} className="cart-item-name">
                  {item.product.name}
                </Link>
                <p className="cart-item-price">${parseFloat(item.product.price).toFixed(2)} each</p>
              </div>
              <div className="qty-selector">
                <button type="button" onClick={() => handleQtyChange(item.productId, -1)}>−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => handleQtyChange(item.productId, 1)}>+</button>
              </div>
              <div className="cart-item-total">
                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
              </div>
              <button type="button" className="cart-remove" onClick={() => handleRemove(item.productId)}>×</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <p className="cart-subtotal">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
          <div className="cart-actions">
            <Link to="/shop" className="cart-btn cart-btn-outline">Continue Shopping</Link>
            <Link to="/checkout" className="cart-btn cart-btn-primary">Checkout</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
