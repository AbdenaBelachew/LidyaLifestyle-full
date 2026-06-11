import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import ProductGrid from './ProductGrid';
import './Featured.css';

const COLLECTIONS = [
  { id: 1, title: 'Summer Weaves', img: '/collection_01.png', link: '/shop?category=summer' },
  { id: 2, title: 'Heritage Classics', img: '/collection_02.png', link: '/shop?category=heritage' },
  { id: 3, title: 'Modern Elegance', img: '/collection_03.png', link: '/shop?category=modern' },
];

export default function Featured() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 6 })
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="featured-section" id="collection">
      <div className="featured-inner fade-in">
        <div className="featured-header">
          <span className="section-label">Discover</span>
          <h2 className="section-title">Curated Collections</h2>
        </div>

        <div className="curated-grid">
          {COLLECTIONS.map((c, i) => (
            <Link to={c.link} key={c.id} className={`curated-card curated-card-${i + 1}`}>
              <div className="curated-img-wrapper">
                <img src={c.img} alt={c.title} className="curated-img" loading="lazy" />
              </div>
              <div className="curated-info">
                <span className="curated-index">0{i + 1}</span>
                <h3>{c.title}</h3>
                <span className="curated-link">Explore Collection</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="featured-header" style={{ marginTop: '5rem' }}>
          <span className="section-label">New Arrivals</span>
          <h2 className="section-title">Latest Pieces</h2>
        </div>
        
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="Products coming soon."
        />
        <div className="featured-cta">
          <Link to="/shop" className="btn btn-outline">View All Products</Link>
        </div>
      </div>
    </section>
  );
}
