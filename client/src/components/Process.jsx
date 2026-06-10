import React from 'react';
import './Process.css';

const STEPS = [
  {
    num: '01',
    title: 'Source',
    desc: 'We source premium Ethiopian cotton and natural fibers from local farmers and cooperatives.',
  },
  {
    num: '02',
    title: 'Dye',
    desc: 'Traditional plant-based dyes create rich, lasting colors — indigo, madder, and earth tones.',
  },
  {
    num: '03',
    title: 'Weave',
    desc: 'Master weavers work on handlooms, creating intricate patterns passed down through generations.',
  },
  {
    num: '04',
    title: 'Finish',
    desc: 'Each piece is inspected, finished by hand, and prepared for its new home.',
  },
];

export default function Process() {
  return (
    <section className="process-section" id="process">
      <div className="process-inner fade-in">
        <div className="process-header">
          <span className="section-label">Craftsmanship</span>
          <h2 className="section-title">From Fiber to Home</h2>
        </div>
        <div className="process-steps">
          {STEPS.map((step, i) => (
            <div key={step.num} className="process-step reveal-item" style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="process-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
