import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TaglineBar from '../components/TaglineBar';
import Story from '../components/Story';
import Process from '../components/Process';
import Featured from '../components/Featured';
import Testimonial from '../components/Testimonial';
import Newsletter from '../components/Newsletter';
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
            entry.target.querySelectorAll('.reveal-item').forEach((child, i) => {
              child.style.transitionDelay = `${i * 0.08}s`;
              child.classList.add('visible');
            });
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
        <TaglineBar />
        <Story />
        <Process />
        <Featured />
        <Testimonial />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
