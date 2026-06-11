import React from 'react';
import './Testimonial.css';

const TESTIMONIALS = [
  {
    quote: 'The quality is extraordinary. You can feel the care in every thread — these pieces transformed our living room.',
    author: 'Sarah M.',
    location: 'New York, USA',
  },
  {
    quote: 'Finally, home décor with a story. The Omo Valley throw is the centerpiece of our bedroom — we get compliments every single day.',
    author: 'James & John K.',
    location: 'London, UK',
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
                <div className="testimonial-card-avatar" aria-hidden="true" />
                <div>
                  <cite>{t.author}</cite>
                  <span>{t.location}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
