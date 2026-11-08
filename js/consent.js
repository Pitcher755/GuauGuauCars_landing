/**
 * Consentimiento de cookies — GuauGuauCars
 *
 * Bloquea las cookies no esenciales hasta que el usuario consienta:
 *  - analítica: Google Tag Manager / GA4 no se cargan sin permiso.
 *  - afiliación: las cookies de Amazon solo se aceptan con permiso explícito.
 *
 * La decisión se guarda en localStorage y puede revisarse desde cualquier
 * enlace marcado con [data-consent-open].
 *
 * API pública: window.gcConsent.analytics(), .affiliate(), .open()
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'guauguau-consent/v1';
  var GTM_ID = 'GTM-M38485DD';
  var PRIVACY_URL = 'privacidad.html#cookies';

  var state = { analytics: false, affiliate: false, decided: false };
  var gtmLoaded = false;

  function readStored() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        analytics: parsed.analytics === true,
        affiliate: parsed.affiliate === true,
        decided: parsed.decided === true,
      };
    } catch (error) {
      return null;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        analytics: state.analytics,
        affiliate: state.affiliate,
        decided: true,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      /* Sin almacenamiento la decisión vive solo en esta página. */
    }
  }

  function loadTagManager() {
    if (gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID + '&l=dataLayer';
    document.head.appendChild(script);
  }

  function apply() {
    if (state.analytics) loadTagManager();
  }

  // -- Interfaz del banner ----------------------------------------------------

  var banner = null;

  function style(element, rules) {
    for (var key in rules) {
      if (Object.prototype.hasOwnProperty.call(rules, key)) element.style[key] = rules[key];
    }
    return element;
  }

  function button(label, primary) {
    var element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    style(element, {
      padding: '10px 16px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: primary ? '700' : '600',
      cursor: 'pointer',
      border: primary ? 'none' : '1px solid #334155',
      background: primary ? '#44a682' : 'transparent',
      color: primary ? '#ffffff' : '#cbd5e1',
    });
    return element;
  }

  function preferencesPanel() {
    var wrapper = document.createElement('div');
    style(wrapper, { display: 'none', marginTop: '14px', gap: '10px', flexDirection: 'column' });

    var rows = [
      { key: 'analytics', title: 'Analítica', detail: 'Google Analytics 4 mediante Tag Manager. Nos dice qué secciones se usan.' },
      { key: 'affiliate', title: 'Afiliación', detail: 'Cookies que Amazon instala si compras desde nuestros enlaces de recomendados.' },
    ];

    rows.forEach(function (row) {
      var label = document.createElement('label');
      style(label, { display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' });

      var input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = state[row.key] === true;
      input.dataset.consentPurpose = row.key;
      style(input, { marginTop: '3px', accentColor: '#44a682' });

      var text = document.createElement('span');
      var strong = document.createElement('strong');
      strong.textContent = row.title;
      style(strong, { color: '#f8fafc', display: 'block', marginBottom: '2px' });
      text.appendChild(strong);
      text.appendChild(document.createTextNode(row.detail));

      label.appendChild(input);
      label.appendChild(text);
      wrapper.appendChild(label);
    });

    return wrapper;
  }

  function show() {
    if (banner) {
      banner.style.display = 'block';
      return;
    }

    banner = document.createElement('div');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Preferencias de cookies');
    style(banner, {
      position: 'fixed',
      left: '16px',
      right: '16px',
      bottom: '16px',
      zIndex: '70',
      maxWidth: '640px',
      margin: '0 auto',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid #334155',
      background: '#0f172a',
      color: '#e2e8f0',
      boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
      fontFamily: 'inherit',
    });

    var title = document.createElement('p');
    title.textContent = 'Cookies y enlaces de afiliado';
    style(title, { margin: '0 0 8px', fontSize: '16px', fontWeight: '800', color: '#ffffff' });

    var body = document.createElement('p');
    body.textContent = 'Usamos cookies propias necesarias para que la página funcione. Con tu permiso, también analítica y de afiliación: las de Amazon solo aparecen si compras desde nuestros enlaces. Puedes cambiar la decisión cuando quieras.';
    style(body, { margin: '0 0 14px', fontSize: '13px', lineHeight: '1.6', color: '#94a3b8' });

    var more = document.createElement('a');
    more.href = PRIVACY_URL;
    more.textContent = 'Más información';
    style(more, { display: 'inline-block', marginBottom: '14px', fontSize: '13px', color: '#44a682', textDecoration: 'underline' });

    var actions = document.createElement('div');
    style(actions, { display: 'flex', flexWrap: 'wrap', gap: '8px' });

    var acceptAll = button('Aceptar todo', true);
    var essentialsOnly = button('Solo esenciales', false);
    var preferences = button('Preferencias', false);

    var panel = preferencesPanel();

    var save = button('Guardar preferencias', true);
    style(save, { display: 'none', marginTop: '4px' });

    function decide(next) {
      state.analytics = next.analytics;
      state.affiliate = next.affiliate;
      state.decided = true;
      persist();
      apply();
      banner.style.display = 'none';
    }

    acceptAll.addEventListener('click', function () {
      decide({ analytics: true, affiliate: true });
    });

    essentialsOnly.addEventListener('click', function () {
      decide({ analytics: false, affiliate: false });
    });

    preferences.addEventListener('click', function () {
      var isOpen = panel.style.display === 'flex';
      panel.style.display = isOpen ? 'none' : 'flex';
      save.style.display = isOpen ? 'none' : 'inline-block';
    });

    save.addEventListener('click', function () {
      var checked = {};
      panel.querySelectorAll('[data-consent-purpose]').forEach(function (input) {
        checked[input.dataset.consentPurpose] = input.checked === true;
      });
      decide({ analytics: checked.analytics === true, affiliate: checked.affiliate === true });
    });

    actions.appendChild(acceptAll);
    actions.appendChild(essentialsOnly);
    actions.appendChild(preferences);

    banner.appendChild(title);
    banner.appendChild(body);
    banner.appendChild(more);
    banner.appendChild(actions);
    banner.appendChild(panel);
    banner.appendChild(save);
    document.body.appendChild(banner);

    acceptAll.focus();
  }

  // -- Arranque ---------------------------------------------------------------

  var stored = readStored();
  if (stored) {
    state = stored;
    apply();
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-consent-open]');
    if (!trigger) return;
    event.preventDefault();
    show();
    if (banner) banner.style.display = 'block';
  });

  window.gcConsent = {
    analytics: function () { return state.analytics === true; },
    affiliate: function () { return state.affiliate === true; },
    open: show,
  };
})();
