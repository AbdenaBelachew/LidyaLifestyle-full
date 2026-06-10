import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Story from '../components/Story';
import Featured from '../components/Featured';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import '../App.css';

export default function HomePage() {
  useEffect(() => {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => fadeObserver.observe(el));
    return () => fadeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, []);

  return (
    <>
      <Seo />
      <Navbar />
      <main>
        <Hero />
        <Story />
        <Featured />
      </main>
      <Footer />
    </>
  );
}
