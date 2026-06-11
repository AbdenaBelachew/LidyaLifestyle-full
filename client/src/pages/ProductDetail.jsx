import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProduct, getImageUrl } from '../api';
import { addToCart } from '../utils/cart';
import './ProductDetail.css';

function getStockBadge(qty) {
  if (qty <= 0) return { label: 'Out of Stock', className: 'stock-out' };
  if (qty <= 5) return { label: `Only ${qty} left`, className: 'stock-low' };
  return { label: 'In Stock', className: 'stock-in' };
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getProduct(slug)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pd-loading">
          <div className="pd-loading-spinner" />
          <p>Loading product…</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pd-not-found">
          <h2>Product not found</h2>
          <Link to="/shop" className="pd-back-link">← Back to Shop</Link>
        </div>
        <Footer />
      </>
    );
  }

  let images = [];
  try {
    if (Array.isArray(product.images)) {
      images = product.images;
    } else if (typeof product.images === 'string' && product.images) {
      images = JSON.parse(product.images);
    }
    images = (images || []).filter(Boolean);
  } catch {
    images = [];
  }
  if (!images.length && product.primary_image) {
    images = [{ image_path: product.primary_image, is_primary: true }];
  }

  const stock = getStockBadge(product.stock_qty);
  const maxQty = Math.min(10, product.stock_qty);
  const hasDiscount = product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_price)) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="pd-page">
        <div className="pd-container">

          {/* Breadcrumb */}
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link to="/shop">Shop</Link>
            <span aria-hidden="true">›</span>
            <span>{product.name}</span>
          </nav>

          <div className="pd-grid">
            {/* ── IMAGE GALLERY ── */}
            <div className="pd-gallery">
              <div className="pd-main-image">
                {images[activeImage] ? (
                  <img
                    src={getImageUrl(images[activeImage].image_path)}
                    alt={product.name}
                  />
                ) : (
                  <div className="pd-placeholder" />
                )}
                {hasDiscount && (
                  <span className="pd-discount-badge">−{discountPct}%</span>
                )}
              </div>

              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={img.id || i}
                      type="button"
                      className={`pd-thumb ${i === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={getImageUrl(img.image_path)} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── PRODUCT INFO ── */}
            <div className="pd-info">
              {product.category_name && (
                <span className="pd-category">{product.category_name}</span>
              )}

              <h1 className="pd-name">{product.name}</h1>

              {/* Prices */}
              <div className="pd-prices">
                <span className="pd-price">${parseFloat(product.price).toFixed(2)}</span>
                {hasDiscount && (
                  <span className="pd-compare">${parseFloat(product.compare_price).toFixed(2)}</span>
                )}
              </div>

              {/* Divider */}
              <div className="pd-divider" />

              {/* Description */}
              {product.short_description && (
                <p className="pd-short">{product.short_description}</p>
              )}
              {product.description && (
                <p className="pd-desc">{product.description}</p>
              )}

              {/* Stock */}
              <span className={`pd-stock ${stock.className}`}>{stock.label}</span>

              {/* Quantity + Add to Cart */}
              {product.stock_qty > 0 && (
                <div className="pd-qty-row">
                  <span className="pd-qty-label">Qty</span>
                  <div className="pd-qty-controls">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
              )}

              <button
                type="button"
                className={`pd-add-btn ${added ? 'pd-add-btn--added' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock_qty <= 0}
              >
                {added
                  ? '✓ Added to Cart'
                  : product.stock_qty <= 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>

              {/* Artisan trust strip */}
              <div className="pd-trust">
                <div className="pd-trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Handcrafted in Ethiopia</span>
                </div>
                <div className="pd-trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <span>Free shipping over $75</span>
                </div>
                <div className="pd-trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
