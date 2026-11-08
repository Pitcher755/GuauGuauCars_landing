#!/usr/bin/env node
/**
 * Verificación del comportamiento compartido — sin dependencias.
 *
 *   node tools/site-check.cjs
 *
 * Monta un DOM mínimo en un contexto `vm` y comprueba la barra de navegación
 * (transparente arriba, sólida al hacer scroll, respetando el modo del sistema),
 * el menú móvil y el reveal de `.fade-in`. Falla con código 1 si algo no cumple.
 */
'use strict';

const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE = path.join(__dirname, '..', 'js', 'site.js');
const code = fs.readFileSync(SOURCE, 'utf8');

function classList() {
  const set = new Set();
  return {
    add(...names) { names.forEach((name) => set.add(name)); },
    remove(...names) { names.forEach((name) => set.delete(name)); },
    contains(name) { return set.has(name); },
    toggle(name) { set.has(name) ? set.delete(name) : set.add(name); },
    names() { return [...set]; },
  };
}

function element(id) {
  return { id, classList: classList(), listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } };
}

let failures = 0;
function check(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`);
  if (!condition) failures++;
}

function boot({ dark = true, scrollY = 0 } = {}) {
  const navbar = element('navbar');
  const menuBtn = element('menu-btn');
  const mobileMenu = element('mobile-menu');
  mobileMenu.classList.add('hidden');

  const fadeItems = [element('a'), element('b')].map((item) => ({ classList: item.classList }));
  const observed = [];
  const scrollHandlers = [];

  class IntersectionObserver {
    constructor(callback) { this.callback = callback; }
    observe(target) { observed.push({ target, callback: this.callback }); }
    unobserve() {}
  }

  const window = {
    scrollY,
    matchMedia: () => ({ matches: dark, addEventListener() {} }),
    addEventListener(type, fn) { if (type === 'scroll') scrollHandlers.push(fn); },
    // En el navegador IntersectionObserver cuelga de window; replicarlo aquí.
    IntersectionObserver,
  };

  const document = {
    getElementById: (id) => ({ navbar, 'menu-btn': menuBtn, 'mobile-menu': mobileMenu }[id] ?? null),
    querySelectorAll: (selector) => (selector === '.fade-in' ? fadeItems : []),
  };

  vm.runInNewContext(code, { window, document, IntersectionObserver, console });
  return {
    navbar, menuBtn, mobileMenu, fadeItems, observed,
    scrollTo(value) { window.scrollY = value; scrollHandlers.forEach((fn) => fn()); },
  };
}

// 1. Estado inicial en el tope de la página.
let page = boot();
check('arriba: navbar transparente', page.navbar.classList.contains('bg-transparent'));
check('arriba: sin sombra', !page.navbar.classList.contains('shadow-xl'));

// 2. Scroll hacia abajo (modo oscuro).
page.scrollTo(120);
check('scroll: fondo sólido de modo oscuro', page.navbar.classList.contains('bg-slate-900/95'));
check('scroll: sombra activa', page.navbar.classList.contains('shadow-xl'));
check('scroll: ya no es transparente', !page.navbar.classList.contains('bg-transparent'));

// 3. Volver al tope.
page.scrollTo(0);
check('volver arriba: transparente otra vez', page.navbar.classList.contains('bg-transparent'));
check('volver arriba: sin fondo sólido', !page.navbar.classList.contains('bg-slate-900/95'));
check('volver arriba: sin sombra', !page.navbar.classList.contains('shadow-xl'));

// 4. Modo claro.
page = boot({ dark: false });
page.scrollTo(120);
check('scroll en modo claro: fondo blanco', page.navbar.classList.contains('bg-white/95'));
check('scroll en modo claro: no usa el fondo oscuro', !page.navbar.classList.contains('bg-slate-900/95'));

// 5. Recarga a mitad de página: el estado inicial ya es sólido.
page = boot({ scrollY: 300 });
check('recarga a mitad de página: arranca sólido', page.navbar.classList.contains('bg-slate-900/95'));

// 6. Menú móvil.
page = boot();
page.menuBtn.listeners.click();
check('menú móvil: abre', !page.mobileMenu.classList.contains('hidden'));
page.menuBtn.listeners.click();
check('menú móvil: cierra', page.mobileMenu.classList.contains('hidden'));

// 7. Reveal: los .fade-in se observan y reciben .visible al entrar en pantalla.
page = boot();
check('reveal: todos los .fade-in observados', page.observed.length === 2);
page.observed.forEach(({ target, callback }) => callback([{ isIntersecting: true, target }]));
check('reveal: reciben .visible', page.fadeItems.every((item) => item.classList.contains('visible')));

console.log(failures === 0 ? '\nTodo verde' : `\n${failures} fallo(s)`);
process.exit(failures === 0 ? 0 : 1);
