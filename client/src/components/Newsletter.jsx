import React, { useState } from 'react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-inner fade-in">
        <span className="section-label">Stay Connected</span>
        <h2 className="section-title">Join Our Community</h2>
        <p className="section-subtitle">
          Be the first to know about new collections, artisan stories, and exclusive offers.
        </p>
        {submitted ? (
          <p className="newsletter-success">
            ✓ &nbsp;Thank you! You&rsquo;re now part of the Lidya community.
          </p>
        ) : (
          <>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
            <p className="newsletter-trust">No spam, ever. Unsubscribe at any time.</p>
          </>
        )}
      </div>
    </section>
  );
}
