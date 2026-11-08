#!/usr/bin/env node
/**
 * Verificación del consentimiento de cookies — sin dependencias.
 *
 *   node tools/consent-check.cjs
 *
 * Monta un DOM mínimo en un contexto `vm` y comprueba que Google Tag Manager no
 * se carga antes del consentimiento y que la decisión se persiste. Falla con
 * código 1 si alguna aserción no se cumple.
 */
'use strict';

const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const CONSENT_SOURCE = path.join(__dirname, '..', 'js', 'consent.js');
const STORAGE_KEY = 'guauguau-consent/v1';
const code = fs.readFileSync(CONSENT_SOURCE, 'utf8');

function element(tagName) {
  return {
    tagName,
    style: {},
    dataset: {},
    children: [],
    listeners: {},
    textContent: '',
    checked: false,
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener(type, handler) {
      (this.listeners[type] = this.listeners[type] || []).push(handler);
    },
    setAttribute() {},
    focus() {},
    closest() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    click() {
      (this.listeners.click || []).forEach((handler) => handler({ preventDefault() {}, target: this }));
    },
  };
}

function flatten(node, out = []) {
  out.push(node);
  (node.children || []).forEach((child) => flatten(child, out));
  return out;
}

function boot(preloaded) {
  const storage = new Map();
  if (preloaded) storage.set(STORAGE_KEY, JSON.stringify(preloaded));

  const head = element('head');
  const body = element('body');
  const window = {
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, value),
    },
    location: {},
  };
  const document = {
    readyState: 'complete',
    head,
    body,
    createElement: element,
    createTextNode: (text) => ({ textContent: text, children: [] }),
    addEventListener() {},
  };

  vm.runInNewContext(code, { window, document, console, JSON, Object, Date, Map });
  return { window, head, body, storage };
}

const tagManagerScripts = (head) =>
  flatten(head).filter((node) => typeof node.src === 'string' && node.src.includes('googletagmanager'));

const byText = (body, text) => flatten(body).find((node) => node.textContent === text);

let failures = 0;
function check(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`);
  if (!condition) failures++;
}

// 1. Primera visita: banner visible, nada cargado.
let page = boot();
check('sin decisión previa: banner renderizado', Boolean(byText(page.body, 'Cookies y enlaces de afiliado')));
check('sin decisión previa: GTM no se carga', tagManagerScripts(page.head).length === 0);
check('sin decisión previa: analytics() es false', page.window.gcConsent.analytics() === false);

// 2. Aceptar todo.
byText(page.body, 'Aceptar todo').click();
check('aceptar todo: GTM se inyecta', tagManagerScripts(page.head).length === 1);
check('aceptar todo: analytics() es true', page.window.gcConsent.analytics() === true);
check('aceptar todo: afiliación es true', page.window.gcConsent.affiliate() === true);
check('aceptar todo: decisión persistida', JSON.parse(page.storage.get(STORAGE_KEY)).analytics === true);
check('aceptar todo: banner oculto', page.body.children[0].style.display === 'none');
check('aceptar todo: no se duplica el banner', page.body.children.length === 1);

// 3. Solo esenciales.
page = boot();
byText(page.body, 'Solo esenciales').click();
check('solo esenciales: GTM no se carga', tagManagerScripts(page.head).length === 0);
check('solo esenciales: analytics() es false', page.window.gcConsent.analytics() === false);
check('solo esenciales: rechazo persistido', JSON.parse(page.storage.get(STORAGE_KEY)).analytics === false);

// 4. Visitas posteriores con decisión guardada.
page = boot({ version: 1, analytics: true, affiliate: true, decided: true });
check('consentimiento guardado: GTM se carga sin banner', tagManagerScripts(page.head).length === 1);
check('consentimiento guardado: no reaparece el banner', !byText(page.body, 'Cookies y enlaces de afiliado'));

page = boot({ version: 1, analytics: false, affiliate: false, decided: true });
check('rechazo guardado: GTM no se carga', tagManagerScripts(page.head).length === 0);

console.log(failures === 0 ? '\nTodo verde' : `\n${failures} fallo(s)`);
process.exit(failures === 0 ? 0 : 1);
