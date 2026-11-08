/**
 * Comportamiento compartido del sitio — GuauGuauCars
 *
 * Una sola fuente para lo que debe verse igual en todas las páginas:
 *  - Barra de navegación fija: transparente arriba, sólida con blur al hacer scroll.
 *  - Menú móvil.
 *  - Reveal de los elementos `.fade-in`.
 *
 * Vive aquí y no en main.js para que las páginas que no cargan la lógica del
 * home (recomendados, y las que vengan) se comporten exactamente igual.
 */
(function () {
  'use strict';

  // ── Barra de navegación ───────────────────────────────────────
  var navbar = document.getElementById('navbar');

  if (navbar) {
    var darkMQ = window.matchMedia('(prefers-color-scheme: dark)');

    var navBgClass = function () {
      return darkMQ.matches ? 'bg-slate-900/95' : 'bg-white/95';
    };

    var updateNavbar = function () {
      if (window.scrollY > 60) {
        navbar.classList.remove('bg-slate-900/95', 'bg-white/95', 'bg-transparent');
        navbar.classList.add(navBgClass(), 'shadow-xl');
      } else {
        navbar.classList.remove('bg-slate-900/95', 'bg-white/95', 'shadow-xl');
        navbar.classList.add('bg-transparent');
      }
    };

    window.addEventListener('scroll', updateNavbar, { passive: true });

    // Re-evaluar si el sistema cambia de modo con la página abierta.
    darkMQ.addEventListener('change', function () {
      if (window.scrollY > 60) {
        navbar.classList.remove('bg-slate-900/95', 'bg-white/95');
        navbar.classList.add(navBgClass());
      }
    });

    // Estado inicial: recargar a mitad de página no debe dejar la barra transparente.
    updateNavbar();
  }

  // ── Menú móvil ────────────────────────────────────────────────
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // ── Reveal al scroll ──────────────────────────────────────────
  var items = document.querySelectorAll('.fade-in');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) { item.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  items.forEach(function (item) { observer.observe(item); });
})();
