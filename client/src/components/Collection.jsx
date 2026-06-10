import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api';
import './Collection.css';

const FALLBACK = [
  { slug: 'pillows', name: 'Pillows', desc: 'Accent & lumbar cushions' },
  { slug: 'throws-blankets', name: 'Throws & Blankets', desc: 'Cozy layered warmth' },
  { slug: 'table-linens', name: 'Table Linens', desc: 'Runners & placemats' },
  { slug: 'bath', name: 'Bath', desc: 'Towels & robes' },
];

export default function Collection() {
  const [categories, setCategories] = useState(FALLBACK);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        const top = cats.filter((c) => !c.parent_id && c.slug !== 'shop-all');
        if (top.length) {
          setCategories(top.slice(0, 4).map((c) => ({
            slug: c.slug,
            name: c.name,
            desc: c.description || 'Explore the collection',
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="collection-section" id="collections">
      <div className="collection-inner fade-in">
        <div className="collection-header">
          <span className="section-label">Collections</span>
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <div className="collection-grid">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="collection-card reveal-item"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="collection-card-bg" />
              <div className="collection-card-content">
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <span className="collection-link">Shop now →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
