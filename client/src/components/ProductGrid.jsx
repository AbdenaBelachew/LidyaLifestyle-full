import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

function SkeletonCard() {
  return (
    <div className="product-skeleton">
      <div className="product-skeleton-image" />
      <div className="product-skeleton-line" />
      <div className="product-skeleton-line short" />
    </div>
  );
}

export default function ProductGrid({ products, loading, emptyMessage = 'No products found.' }) {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="product-grid-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
