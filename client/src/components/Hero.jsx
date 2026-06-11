import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const STATS = [
  { value: 15, suffix: '+', label: 'Years of Craft' },
  { value: 500, suffix: '+', label: 'Artisan Partners' },
  { value: 100, suffix: '%', label: 'Handwoven' },
];

// Animated counter hook
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatItem({ value, suffix, label, animate }) {
  const count = useCounter(value, 1600, animate);
  return (
    <div className="hero-stat-item">
      <span className="hero-stat-value">
        {count}{suffix}
      </span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

// Woven SVG pattern overlay
function WovenPattern() {
  return (
    <svg className="hero-woven-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="woven" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="12" y2="6" stroke="rgba(201,168,112,0.035)" strokeWidth="0.5" />
          <line x1="6" y1="0" x2="6" y2="12" stroke="rgba(201,168,112,0.025)" strokeWidth="0.5" />
          <rect x="5" y="5" width="2" height="2" fill="rgba(201,168,112,0.02)" />
        </pattern>
        <pattern id="woven2" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="48" height="48" fill="url(#woven)" />
          <line x1="0" y1="0" x2="48" y2="48" stroke="rgba(201,168,112,0.012)" strokeWidth="0.5" />
          <line x1="48" y1="0" x2="0" y2="48" stroke="rgba(201,168,112,0.012)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#woven2)" />
    </svg>
  );
}

// Floating textile swatch cards (desktop only)
function SwatchCard({ label, color, pos, delay }) {
  return (
    <div
      className="hero-swatch-card"
      style={{ ...pos, animationDelay: delay }}
      aria-hidden="true"
    >
      <div className="hero-swatch-color" style={{ background: color }} />
      <span className="hero-swatch-label">{label}</span>
    </div>
  );
}

const SWATCHES = [
  { label: 'Habesha Crimson', color: 'linear-gradient(135deg,#8B1A1A,#C0392B)', pos: { right: '3%', top: '18%' }, delay: '1.2s' },
  { label: 'Tilet Gold', color: 'linear-gradient(135deg,#C9A870,#E2C99A)', pos: { right: '8.5%', top: '31%' }, delay: '1.45s' },
  { label: 'Injera Linen', color: 'linear-gradient(135deg,#D4B896,#E8D5BC)', pos: { right: '2%', top: '44%' }, delay: '1.65s' },
];

export default function Hero() {
  const heroRef = useRef(null);
  const bgRef = useRef(null);
  const midRef = useRef(null);
  const cursorRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Entrance reveal
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Parallax scroll — desktop/tablet only
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sy = window.scrollY;
          if (bgRef.current) bgRef.current.style.transform = `translateY(${sy * 0.38}px)`;
          if (midRef.current) midRef.current.style.transform = `translateY(${sy * 0.16}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Magnetic cursor
  useEffect(() => {
    const btn = primaryBtnRef.current;
    if (!btn) return;
    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const pull = (100 - dist) / 100;
        btn.style.transform = `translate(${dx * pull * 0.35}px, ${dy * pull * 0.35}px) translateY(-3px)`;
      } else {
        btn.style.transform = '';
      }
    };
    const onLeave = () => { btn.style.transform = ''; };
    window.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Custom cursor glow
  useEffect(() => {
    const c = cursorRef.current;
    if (!c) return;
    let raf;
    let tx = 0, ty = 0, cx2 = 0, cy2 = 0;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    const animate = () => {
      cx2 += (tx - cx2) * 0.12;
      cy2 += (ty - cy2) * 0.12;
      c.style.transform = `translate(${cx2 - 20}px, ${cy2 - 20}px)`;
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // Stats intersection observer
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Ambient mouse parallax — desktop only
  const handleMouseMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const { innerWidth: w, innerHeight: h } = window;
    setMousePos({ x: (e.clientX / w - 0.5) * 2, y: (e.clientY / h - 0.5) * 2 });
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    style: {
      left: `${(i * 3.7 + 1.5) % 88}%`,
      top: `${(i * 10.3 + 4) % 82}%`,
      width: `${1 + (i % 4) * 0.5}px`,
      height: `${1 + (i % 4) * 0.5}px`,
      animationDelay: `${(i * 0.28) % 6}s`,
      animationDuration: `${4 + (i % 6)}s`,
      '--op': 0.15 + (i % 6) * 0.07,
    },
  }));

  return (
    <section
      className={`hero${revealed ? ' hero--revealed' : ''}`}
      id="top"
      ref={heroRef}
      onMouseMove={handleMouseMove}
    >
      {/* Custom cursor glow — desktop only */}
      <div ref={cursorRef} className="hero-cursor-glow" aria-hidden="true" />

      {/* ── BACKGROUND — deepest parallax layer ── */}
      <div className="hero-image-container">
        <img
          ref={bgRef}
          src="/hero_model.png"
          alt="Lidya Lifestyle — Ethiopian Heritage Fashion"
          className="hero-main-image"
          style={{
            '--mx': mousePos.x,
            '--my': mousePos.y,
          }}
        />
        <div className="hero-image-overlay" />
        <div className="hero-bottom-fade" aria-hidden="true" />
      </div>

      {/* ── WOVEN TEXTURE LAYER ── */}
      <WovenPattern />

      {/* ── MID PARALLAX LAYER — particles move at different speed ── */}
      <div ref={midRef} className="hero-particles" aria-hidden="true">
        {particles.map((p) => (
          <div key={p.id} className="hero-particle" style={p.style} />
        ))}
      </div>

      {/* ── FLOATING SWATCH CARDS — desktop only ── */}
      {SWATCHES.map((s) => (
        <SwatchCard key={s.label} {...s} />
      ))}

      {/* ── LEFT EDGE ACCENT ── */}
      <div className="hero-left-accent" aria-hidden="true">
        <div className="hero-left-line-top" />
        <div className="hero-left-dot" />
        <div className="hero-left-line-bottom" />
      </div>

      {/* ── VERTICAL HERITAGE TAG — right edge ── */}
      <div className="hero-heritage-tag" aria-hidden="true">
        <span>ሊዲያ ላይፍስታይል</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="hero-content">
        <div className="hero-content-inner">

          {/* Eyebrow */}
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <span className="hero-eyebrow-text">Ethiopian Heritage Fashion</span>
            <div className="hero-eyebrow-dot" aria-hidden="true" />
          </div>

          {/* Split-reveal title */}
          <h1 className="hero-title">
            <span className="hero-title-line hero-title-where">
              <span className="hero-title-clip">Where</span>
            </span>
            <span className="hero-title-line">
              <em className="hero-title-clip hero-title-tradition">Tradition</em>
            </span>
            <span className="hero-title-line hero-title-meets">
              <span className="hero-title-clip">Meets Tomorrow</span>
            </span>
          </h1>

          {/* Ornamental divider */}
          <div className="hero-ornament" aria-hidden="true">
            <svg width="120" height="14" viewBox="0 0 120 14" fill="none">
              <line x1="0" y1="7" x2="44" y2="7" stroke="rgba(201,168,112,0.4)" strokeWidth="0.75" />
              <path d="M50 7 L54 3 L58 7 L54 11Z" fill="none" stroke="rgba(201,168,112,0.6)" strokeWidth="0.75" />
              <circle cx="60" cy="7" r="1.5" fill="rgba(201,168,112,0.8)" />
              <path d="M62 7 L66 3 L70 7 L66 11Z" fill="none" stroke="rgba(201,168,112,0.6)" strokeWidth="0.75" />
              <line x1="76" y1="7" x2="120" y2="7" stroke="rgba(201,168,112,0.4)" strokeWidth="0.75" />
            </svg>
          </div>

          {/* Description */}
          <p className="hero-desc">
            Every thread weaves a story of timeless elegance and masterful craftsmanship,
            born from centuries of Ethiopian artistry.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <Link to="/shop" className="hero-btn-primary" ref={primaryBtnRef}>
              <span className="hero-btn-bg" aria-hidden="true" />
              <span className="hero-btn-label">Explore Collection</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#story" className="hero-btn-ghost">
              <span>Our Story</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2" />
              </svg>
            </a>
          </div>

          {/* Trust signal */}
          <div className="hero-trust">
            <div className="hero-trust-avatars" aria-hidden="true">
              {[1, 2, 3].map(i => (
                <div key={i} className="hero-trust-avatar" style={{ '--i': i }} />
              ))}
            </div>
            <span className="hero-trust-text">Trusted by 2,000+ women across Ethiopia & diaspora</span>
          </div>
        </div>
      </div>



      {/* ── SCROLL INDICATOR ── */}
      <div className="hero-scroll-indicator" aria-hidden="true">
        <div className="hero-scroll-line" />
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-wheel" />
        </div>
        <span>Scroll</span>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="hero-stats-strip" ref={statsRef}>
        <div className="hero-stats-inner">
          <div className="hero-stats-left">
            <span className="hero-stats-eyebrow">Our Impact</span>
            <div className="hero-stats-rule" />
          </div>
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="hero-stat-divider" aria-hidden="true" />}
              <StatItem {...stat} animate={statsVisible} />
            </React.Fragment>
          ))}
          <div className="hero-stats-right" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}