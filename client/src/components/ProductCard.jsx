import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';
import { addToCart } from '../utils/cart';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_qty <= 0) return;
    addToCart(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const price = parseFloat(product.price);
  const comparePrice = product.compare_price ? parseFloat(product.compare_price) : null;

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-image">
          {product.primary_image ? (
            <img src={getImageUrl(product.primary_image)} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-card-placeholder" />
          )}
          {product.is_featured && <span className="product-badge">Featured</span>}
          {product.stock_qty <= 0 && <span className="product-badge product-badge-sold">Sold Out</span>}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-prices">
            <span className="product-card-price">${price.toFixed(2)}</span>
            {comparePrice && comparePrice > price && (
              <span className="product-card-compare">${comparePrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={`product-card-cart ${added ? 'added' : ''}`}
        onClick={handleAdd}
        disabled={product.stock_qty <= 0}
        aria-label={`Add ${product.name} to cart`}
      >
        {added ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6h15l-1.5 9h-12z" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        )}
      </button>
    </article>
  );
}
