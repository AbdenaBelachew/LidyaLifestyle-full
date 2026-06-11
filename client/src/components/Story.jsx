import React from 'react';
import './Story.css';

export default function Story() {
  return (
    <section className="story-section light-section" id="story">
      <div className="story-inner fade-in">
        <div className="story-visual">
          <div className="story-image story-image-primary">
            <img src="/hero_model.png" alt="Artisan wearing traditional Ethiopian dress" loading="lazy" />
          </div>
          <div className="story-image story-image-secondary">
            <img src="/hero_modelr.jpg" alt="Close-up of handwoven fabric detail" loading="lazy" />
          </div>
          <div className="story-accent" aria-hidden="true" />
          <span className="story-badge">Est. 2009</span>
          <span className="story-caption">Handwoven in Addis Ababa</span>
        </div>
        <div className="story-content">
          <span className="section-label">Our Story</span>
          <h2 className="section-title">Rooted in Ethiopian Heritage</h2>
          <div className="story-divider" />
          <p>
            Lidya Lifestyle was born from a deep reverence for Ethiopia&apos;s rich textile traditions.
            For centuries, artisans across the highlands and lowlands have woven stories into every thread —
            geometric patterns that speak of identity, landscape, and community.
          </p>
          <p>
            We partner directly with master weavers, ensuring fair wages and preserving techniques
            that might otherwise fade. Each piece carries the warmth of human hands and the soul of a culture.
          </p>
          <blockquote className="story-quote">
            &ldquo;Every weave is a conversation between past and present.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
