// ============================================
// GuauGuauCars — main.js
// ============================================

// ── Analytics (GTM dataLayer) ───────────────────────────────────────
function pushEvent(event, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

// ── 1. Flujo de la app (7 pantallas en orden narrativo) ──────────────
const APP_FLOW = [
  {
    src: 'assets/stitch_guauguaucars/splash_screen/screen.png',
    label: '1 / 7 · Inicio',
    title: 'GuauGuauCars',
    desc: 'La app que estabas esperando para viajar con tu mascota.',
    tapX: 50, tapY: 80,
  },
  {
    src: 'assets/stitch_guauguaucars/registro_o_inicio_de_sesi_n/screen.png',
    label: '2 / 7 · Registro',
    title: 'Accede a tu cuenta',
    desc: 'Regístrate en segundos o inicia sesión con Google.',
    tapX: 50, tapY: 66,
  },
  {
    src: 'assets/stitch_guauguaucars/dashboard_principal/screen.png',
    label: '3 / 7 · Dashboard',
    title: 'Tu panel principal',
    desc: 'Todos los viajes disponibles cerca de ti, de un vistazo.',
    tapX: 50, tapY: 42,
  },
  {
    src: 'assets/stitch_guauguaucars/b_squeda_de_viajes/screen.png',
    label: '4 / 7 · Búsqueda',
    title: 'Busca tu viaje',
    desc: 'Filtra por destino, fecha y conductores pet-friendly.',
    tapX: 60, tapY: 58,
  },
  {
    src: 'assets/stitch_guauguaucars/detalles_del_viaje_y_pago/screen.png',
    label: '5 / 7 · Detalle',
    title: 'Detalle y reserva',
    desc: 'Perfil del conductor, precio y plazas disponibles. ¡Reserva!',
    tapX: 50, tapY: 84,
  },
  {
    src: 'assets/stitch_guauguaucars/mis_reservas_pasajero_listado/screen.png',
    label: '6 / 7 · Reservas',
    title: '¡Plaza confirmada! 🎉',
    desc: 'Tu viaje está listo. Solo queda preparar a tu perro.',
    tapX: 50, tapY: 48,
  },
  {
    src: 'assets/stitch_guauguaucars/chat_interno/screen.png',
    label: '7 / 7 · Chat',
    title: 'Habla con el conductor',
    desc: 'Coordina punto de recogida y cualquier detalle extra.',
    tapX: 72, tapY: 88,
  },
];

// ── Estado del demo ─────────────────────────────────────────────────
let demoIndex      = 0;
let isTransition   = false;
let autoplayTimer  = null;
let tapTimer       = null;
let autoplayPaused = false;

// ── 2. Inicializar demo de pantallas ────────────────────────────────
function initPhoneDemo() {
  const screensContainer = document.getElementById('app-screens');
  const dotsContainer    = document.getElementById('step-dots');
  if (!screensContainer || !dotsContainer) return;

  // Inyectar imágenes
  APP_FLOW.forEach((step, i) => {
    const div = document.createElement('div');
    div.className = 'app-screen';
    div.dataset.index = i;
    div.style.cssText = i === 0
      ? 'transform:translateX(0); opacity:1; z-index:2;'
      : 'transform:translateX(100%); opacity:1; z-index:1;';

    const img = document.createElement('img');
    img.src = step.src;
    img.alt = step.title;
    img.loading = i <= 1 ? 'eager' : 'lazy';
    img.draggable = false;
    div.appendChild(img);
    screensContainer.appendChild(div);

    // Dot
    const dot = document.createElement('button');
    dot.className = 'demo-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Pantalla ${i + 1}`);
    dot.addEventListener('click', () => {
      if (i === demoIndex) return;
      pauseAutoplay();
      pushEvent('demo_carousel_interacted', { action: 'dot', step: i + 1 });
      goToStep(i, i > demoIndex ? 'forward' : 'back');
    });
    dotsContainer.appendChild(dot);
  });

  updateStepUI(0);

  // Pausar al pasar el cursor por el teléfono
  const phoneMockup = document.getElementById('phone-mockup');
  phoneMockup?.addEventListener('mouseenter', pauseAutoplay);
  phoneMockup?.addEventListener('mouseleave', () => {
    autoplayPaused = false;
    scheduleAutoplay();
  });

  // Botones prev / next
  document.getElementById('demo-prev')?.addEventListener('click', () => {
    pauseAutoplay();
    const prev = (demoIndex - 1 + APP_FLOW.length) % APP_FLOW.length;
    pushEvent('demo_carousel_interacted', { action: 'prev' });
    goToStep(prev, 'back');
  });
  document.getElementById('demo-next')?.addEventListener('click', () => {
    pauseAutoplay();
    const next = (demoIndex + 1) % APP_FLOW.length;
    pushEvent('demo_carousel_interacted', { action: 'next' });
    goToStep(next, 'forward');
  });

  // Swipe touch en mobile
  initSwipe();

  // Arrancar autoplay
  scheduleAutoplay();
}

// ── 3. Navegar entre pantallas con animación iOS push ───────────────
function goToStep(nextIndex, direction = 'forward') {
  if (isTransition || nextIndex === demoIndex) return;
  isTransition = true;

  const allScreens = document.querySelectorAll('.app-screen');
  const current    = allScreens[demoIndex];
  const next       = allScreens[nextIndex];

  const enterFrom = direction === 'forward' ? '100%'  : '-100%';
  const exitTo    = direction === 'forward' ? '-28%'  : '100%';

  // Posicionar la pantalla entrante SIN transición
  next.style.transition = 'none';
  next.style.transform  = `translateX(${enterFrom})`;
  next.style.opacity    = '1';
  next.style.zIndex     = '3';

  // Reflow forzado para que el browser registre el estado inicial
  void next.getBoundingClientRect();

  // Activar transición en ambas pantallas
  const ease = 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.42s ease';
  next.style.transition    = ease;
  current.style.transition = ease;

  next.style.transform    = 'translateX(0)';
  next.style.zIndex       = '3';

  current.style.transform = `translateX(${exitTo})`;
  current.style.opacity   = direction === 'forward' ? '0.3' : '1';
  current.style.zIndex    = '2';

  setTimeout(() => {
    current.style.zIndex  = '1';
    next.style.zIndex     = '2';
    current.style.opacity = '1';
    demoIndex = nextIndex;
    updateStepUI(nextIndex);
    isTransition = false;

    // Reanudar autoplay si no está en pausa por hover
    if (!autoplayPaused) scheduleAutoplay();
  }, 440);
}

// ── 4. Actualizar UI del paso actual ────────────────────────────────
function updateStepUI(index) {
  const step = APP_FLOW[index];

  // Dots
  document.querySelectorAll('.demo-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  // Textos con fade
  const labelEl = document.getElementById('step-label');
  const titleEl = document.getElementById('step-title');
  const descEl  = document.getElementById('step-desc');

  [labelEl, titleEl, descEl].forEach(el => {
    if (!el) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(8px)';
  });

  setTimeout(() => {
    if (labelEl) labelEl.textContent = step.label;
    if (titleEl) titleEl.textContent = step.title;
    if (descEl)  descEl.textContent  = step.desc;

    [labelEl, titleEl, descEl].forEach(el => {
      if (!el) return;
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    });
  }, 180);
}

// ── 5. Tap ripple: simula un toque en la pantalla ───────────────────
function showTapRipple() {
  const container = document.getElementById('phone-screen-inner');
  if (!container) return;

  const step   = APP_FLOW[demoIndex];
  const ripple = document.createElement('div');
  ripple.className = 'tap-ripple';
  ripple.style.left = `${step.tapX}%`;
  ripple.style.top  = `${step.tapY}%`;

  container.appendChild(ripple);
  setTimeout(() => ripple.remove(), 750);
}

// ── 6. Autoplay ─────────────────────────────────────────────────────
function scheduleAutoplay() {
  clearTimeout(autoplayTimer);
  clearTimeout(tapTimer);

  if (autoplayPaused) return;

  // Tap ripple 700ms antes de la transición
  tapTimer = setTimeout(showTapRipple, 3200);

  // Transición
  autoplayTimer = setTimeout(() => {
    const next = (demoIndex + 1) % APP_FLOW.length;
    goToStep(next, 'forward');
  }, 3900);
}

function pauseAutoplay() {
  autoplayPaused = true;
  clearTimeout(autoplayTimer);
  clearTimeout(tapTimer);
}

// ── 7. Swipe táctil en mobile ────────────────────────────────────────
function initSwipe() {
  const frame = document.querySelector('.phone-frame');
  if (!frame) return;

  let startX = 0;
  frame.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  frame.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    pauseAutoplay();
    if (diff > 0) {
      pushEvent('demo_carousel_interacted', { action: 'swipe_next' });
      goToStep((demoIndex + 1) % APP_FLOW.length, 'forward');
    } else {
      pushEvent('demo_carousel_interacted', { action: 'swipe_prev' });
      goToStep((demoIndex - 1 + APP_FLOW.length) % APP_FLOW.length, 'back');
    }
  }, { passive: true });
}

// ════════════════════════════════════════════════════════════
// BOOTSTRAP — esperar DOM
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll ──────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');

  function getNavBgClass() {
    return darkMQ.matches ? 'bg-slate-900/95' : 'bg-white/95';
  }

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.remove('bg-slate-900/95', 'bg-white/95', 'bg-transparent');
      navbar.classList.add(getNavBgClass(), 'shadow-xl');
    } else {
      navbar.classList.remove('bg-slate-900/95', 'bg-white/95', 'shadow-xl');
      navbar.classList.add('bg-transparent');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });

  // Re-evaluar si el usuario cambia el modo del sistema con la landing abierta
  darkMQ.addEventListener('change', () => {
    if (window.scrollY > 60) {
      navbar.classList.remove('bg-slate-900/95', 'bg-white/95');
      navbar.classList.add(getNavBgClass());
    }
  });

  // ── Menú mobile ─────────────────────────────────────────────
  const menuBtn    = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  menuBtn?.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });

  // ── Inicializar demo del teléfono ───────────────────────────
  initPhoneDemo();

  // ── Fade-in al scroll + section_visible ─────────────────────
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => observer.observe(el));

  // Observar secciones con id para section_visible (una sola vez por sesión)
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        pushEvent('section_visible', { section_id: entry.target.id });
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ── Formulario ──────────────────────────────────────────────
  const FIREBASE_FUNCTION_URL =
    'https://us-central1-guauguaucars-app-prod.cloudfunctions.net/submitBetaLead';

  const form  = document.getElementById('lead-form');
  const toast = document.getElementById('toast');

  // beta_form_started: primer foco en cualquier campo (una sola vez)
  form?.addEventListener('focusin', () => {
    pushEvent('beta_form_started');
  }, { once: true });

  // lead_type_selected: cuando el usuario elige su tipo
  form?.querySelector('select[name="tipo"]')?.addEventListener('change', e => {
    pushEvent('lead_type_selected', { lead_type: e.target.value });
  });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.disabled  = true;
    btn.innerHTML = '<span class="opacity-70">Enviando...</span>';

    const fd = new FormData(form);
    const payload = {
      name:    (fd.get('nombre')  ?? '').toString().trim(),
      email:   (fd.get('email')   ?? '').toString().trim(),
      type:    (fd.get('tipo')    ?? '').toString().trim(),
      message: (fd.get('mensaje') ?? '').toString().trim(),
      rgpd:    fd.get('rgpd') !== null,
    };

    try {
      const res  = await fetch(FIREBASE_FUNCTION_URL, {
        method:  'POST',
        body:    JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        pushEvent('beta_form_submitted', { lead_type: payload.type });
        showToast('✅ ¡Apuntado! Te avisaremos cuando abramos la Beta.');
        form.reset();
      } else {
        pushEvent('beta_form_error', { error_type: 'api', error_message: data.error || 'unknown' });
        showToast(`❌ ${data.error || 'Algo falló. Inténtalo de nuevo.'}`, true);
      }
    } catch {
      pushEvent('beta_form_error', { error_type: 'network', error_message: 'no_connection' });
      showToast('❌ Sin conexión. Inténtalo de nuevo.', true);
    } finally {
      btn.disabled  = false;
      btn.innerHTML = orig;
    }
  });

  function showToast(msg, err = false) {
    toast.textContent    = msg;
    toast.style.background = err ? '#EF4444' : '#10B981';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4200);
  }

  // ── Smooth scroll ────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' });
    });
  });

  // ── Modal "Próximamente" (sección #apoya) ────────────────────
  const comingSoonModal    = document.getElementById('coming-soon-modal');
  const comingSoonBackdrop = document.getElementById('coming-soon-backdrop');
  const comingSoonClose    = document.getElementById('coming-soon-close');
  const comingSoonCta      = document.getElementById('coming-soon-cta');

  function openComingSoon() {
    comingSoonModal.classList.remove('hidden');
    comingSoonModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    pushEvent('apoya_modal_opened');
  }

  function closeComingSoon() {
    comingSoonModal.classList.add('hidden');
    comingSoonModal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-coming-soon]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openComingSoon();
    });
  });

  comingSoonClose?.addEventListener('click', closeComingSoon);
  comingSoonBackdrop?.addEventListener('click', closeComingSoon);
  comingSoonCta?.addEventListener('click', closeComingSoon); // cierra y deja que el smooth scroll actúe

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeComingSoon();
  });

  // ── Social links ─────────────────────────────────────────────
  const SOCIAL_PATTERNS = {
    'x.com': 'x',
    'twitter.com': 'x',
    'instagram.com': 'instagram',
    'facebook.com': 'facebook',
    'linkedin.com': 'linkedin',
    'tiktok.com': 'tiktok',
  };
  document.querySelectorAll('a[href]').forEach(a => {
    const match = Object.entries(SOCIAL_PATTERNS).find(([domain]) => a.href.includes(domain));
    if (!match) return;
    a.addEventListener('click', () => {
      pushEvent('social_link_clicked', { platform: match[1] });
    });
  });

});
