import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCart, clearCart } from '../utils/cart';
import { getProducts, getImageUrl, placeGuestOrder } from '../api';
import './shop.css';

const EMPTY_FORM = { first_name: '', last_name: '', email: '', phone: '' };

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const cart = getCart();
    if (!cart.length) {
      setLoading(false);
      return;
    }
    getProducts({ limit: 200 })
      .then((data) => {
        const detailed = cart
          .map((item) => ({
            ...item,
            product: (data.products || []).find((p) => p.id === item.productId),
          }))
          .filter((i) => i.product);
        setItems(detailed);
      })
      .finally(() => setLoading(false));
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const res = await placeGuestOrder({
        ...form,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      setSuccess(res.order_number || res.message);
    } catch (err) {
      setError(err.message || 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="shop-container checkout-page"><p>Loading…</p></div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="shop-container checkout-page">
          <div className="checkout-success">
            <div className="checkout-success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order <strong>{success}</strong> has been received.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              We&apos;ll send a confirmation to your email shortly.
            </p>
            <Link to="/shop" className="cart-btn cart-btn-primary" style={{ marginTop: '1.5rem' }}>
              Continue Shopping
            </Link>
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
        <div className="shop-container checkout-page">
          <div className="cart-empty">
            <h2>Nothing to checkout</h2>
            <Link to="/shop" className="cart-btn cart-btn-primary">Go to Shop</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="shop-container checkout-page">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">No account needed — just your contact details.</p>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <h2>Contact Information</h2>
            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-form-row">
              <label>
                First Name
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </label>
              <label>
                Last Name
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </label>
            </div>

            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
            </label>

            <label>
              Phone <span className="checkout-optional">(optional)</span>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
            </label>

            <button type="submit" className="cart-btn cart-btn-primary checkout-submit" disabled={placing}>
              {placing ? 'Placing Order…' : `Place Order — $${subtotal.toFixed(2)}`}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.productId} className="checkout-item">
                  {item.product.primary_image ? (
                    <img src={getImageUrl(item.product.primary_image)} alt="" className="checkout-item-img" />
                  ) : (
                    <div className="checkout-item-img" />
                  )}
                  <div className="checkout-item-info">
                    <span className="cart-item-name">{item.product.name}</span>
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-total-row checkout-total-final">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/cart" className="checkout-back-link">← Back to cart</Link>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
