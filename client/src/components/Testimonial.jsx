import React from 'react';
import './Testimonial.css';

const TESTIMONIALS = [
  {
    quote: 'The quality is extraordinary. You can feel the care in every thread — these pieces transformed our living room.',
    author: 'Sarah M.',
    location: 'New York',
  },
  {
    quote: 'Finally, home décor with a story. The Omo Valley throw is the centerpiece of our bedroom.',
    author: 'James & Amara K.',
    location: 'London',
  },
];

export default function Testimonial() {
  return (
    <section className="testimonial-section">
      <div className="testimonial-inner fade-in">
        <span className="section-label">Testimonials</span>
        <h2 className="section-title">Loved by Homes Worldwide</h2>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.author} className="testimonial-card reveal-item">
              <p>&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <cite>{t.author}</cite>
                <span>{t.location}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
