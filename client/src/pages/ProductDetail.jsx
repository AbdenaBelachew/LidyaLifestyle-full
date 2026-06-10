import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProduct, getImageUrl } from '../api';
import { addToCart } from '../utils/cart';
import './shop.css';

function getStockBadge(qty) {
  if (qty <= 0) return { label: 'Out of Stock', className: 'stock-out' };
  if (qty <= 5) return { label: `Low Stock (${qty} left)`, className: 'stock-low' };
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
        <div className="shop-container product-detail"><p>Loading…</p></div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="shop-container product-detail">
          <p>Product not found.</p>
          <Link to="/shop">Back to Shop</Link>
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

  const handleAddToCart = () => {
    addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Navbar />
      <div className="product-detail">
        <div className="shop-container">
          <nav className="shop-breadcrumb">
            <Link to="/">Home</Link> &rsaquo; <Link to="/shop">Shop</Link> &rsaquo; {product.name}
          </nav>

          <div className="product-detail-grid">
            <div className="product-detail-images">
              <div className="product-detail-main-image">
                {images[activeImage] ? (
                  <img src={getImageUrl(images[activeImage].image_path)} alt={product.name} />
                ) : (
                  <div className="product-card-placeholder" style={{ width: '100%', height: '100%' }} />
                )}
              </div>
              {images.length > 1 && (
                <div className="product-detail-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={img.id || i}
                      type="button"
                      className={`product-detail-thumb ${i === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(i)}
                    >
                      <img src={getImageUrl(img.image_path)} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-detail-info">
              <h1>{product.name}</h1>
              <div className="product-detail-prices">
                <p className="product-detail-price">${parseFloat(product.price).toFixed(2)}</p>
                {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                  <p className="product-detail-compare">${parseFloat(product.compare_price).toFixed(2)}</p>
                )}
              </div>
              {product.short_description && (
                <p className="product-detail-short">{product.short_description}</p>
              )}
              {product.description && (
                <p className="product-detail-desc">{product.description}</p>
              )}
              <span className={`stock-badge ${stock.className}`}>{stock.label}</span>

              {product.stock_qty > 0 && (
                <div className="qty-selector">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
                </div>
              )}

              <button
                type="button"
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock_qty <= 0}
              >
                {added ? 'Added!' : product.stock_qty <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
