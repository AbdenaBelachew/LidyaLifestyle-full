import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const STATS = [
  { value: '15+', label: 'Years of Craft' },
  { value: '500+', label: 'Artisan Partners' },
  { value: '100%', label: 'Handwoven' },
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-image-container">
        <img src="/hero_model.png" alt="Lidya Lifestyle — Ethiopian Heritage Fashion" className="hero-main-image" />
        <div className="hero-image-overlay" />
      </div>

      <div className="hero-content fade-in">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Ethiopian Heritage Fashion
          <span className="hero-badge-dot" />
        </div>

        <h1 className="hero-title">
          Where<br />
          <em>Tradition</em><br />
          Meets Tomorrow
        </h1>

        <p className="hero-desc">
          Every thread weaves a story of timeless elegance and masterful craftsmanship,
          born from centuries of Ethiopian artistry.
        </p>

        <div className="hero-actions">
          <Link to="/shop" className="hero-btn-primary">
            <span>Explore Collection</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <a href="#story" className="hero-btn-ghost">Our Story</a>
        </div>
      </div>

      <div className="hero-stats-strip">
        {STATS.map((stat, i) => (
          <React.Fragment key={stat.label}>
            <div className="hero-stat-item">
              <span className="hero-stat-value">{stat.value}</span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
            {i < STATS.length - 1 && <div className="hero-stat-divider" />}
          </React.Fragment>
        ))}
      </div>

      <div className="hero-scroll-indicator">
        <div className="hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
