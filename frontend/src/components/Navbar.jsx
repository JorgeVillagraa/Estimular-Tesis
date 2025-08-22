// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';

import '../styles/Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <a href="#home" className="navbar__logo">Estimular</a>

        <input type="checkbox" id="nav-toggle" className="navbar__toggle" />
        <label htmlFor="nav-toggle" className="navbar__hamburger">
          <span></span>
          <span></span>
          <span></span>
        </label>

        <ul className="navbar__menu">
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Servicios</a></li>
          <li><a href="#testimonials">Testimonios</a></li>
          <li><a href="#gallery">Galería</a></li>
          <li><a href="#contact">Contacto</a></li>
          <li className="navbar__cta" onClick={() => navigate('/formulario-entrevista')}> <a> Solicitar Entrevista </a></li>
        </ul>
      </div>
    </nav>
  );
}
// 