# GuauGuauCars — Landing Page

> La primera plataforma de viajes compartidos pensada al 100% para mascotas.

Landing page de captación beta, presentación del producto y recomendados con enlaces de afiliado.
Deployada en Firebase Hosting: **https://guauguaucars.com**

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5 + Tailwind CSS (Play CDN) + Vanilla JS |
| Hosting | Firebase Hosting (`guauguaucars-app-prod`) |
| Backend | Cloud Functions Gen2 Python 3.12 (repo `GuauGuauCars-Mobile`) |
| Base de datos | Firestore |
| Email | Resend (transaccional y masivo) |
| Afiliados | Amazon Afiliados — ID de seguimiento `guauguaucars.com-21` |

---

## Secciones de la página

| Sección | ID | Descripción |
|---------|----|-------------|
| Hero | `#hero` | CTA principal → formulario de captación beta |
| Cómo funciona | `#como-funciona` | 3 pasos del flujo de viaje |
| Protectoras | `#protectoras` | Plazas colaboradoras para refugios |
| Únete a la Beta | `#contacto` | Formulario de captación |
| Recomendados | `#recomendados` | Entrada al catálogo de afiliados con CTA |
| Footer | — | Nav, RRSS, T&C, Privacidad |
| Recomendados (página) | `/recomendados.html` | Catálogo curado por criterio, cinco categorías |
| Términos y Condiciones | `/terminos.html` | Borrador legal (banner de aviso activo) |
| Política de Privacidad | `/privacidad.html` | Borrador legal (banner de aviso activo) |

---

## Estructura del proyecto

```
index.html            Home: hero, cómo funciona, protectoras, recomendados, formulario beta
recomendados.html     Catálogo de afiliados, cinco categorías (indexable)
terminos.html         Términos y Condiciones (noindex, banner de borrador)
privacidad.html       Política de Privacidad + detalle de cookies (noindex)
404.html              Página de error de Firebase Hosting
robots.txt            Permite todo el rastreo y apunta al sitemap
sitemap.xml           Home y /recomendados.html; las legales quedan fuera a propósito
css/custom.css        Estilos propios y bloque de modo claro
js/site.js            Comportamiento compartido: navbar fija, menú móvil, reveal `.fade-in`
js/main.js            Lógica del home: demo de la app, formulario beta, analítica
js/consent.js         Consentimiento de cookies (`window.gcConsent`)
tools/site-check.cjs  Verificación del comportamiento compartido (sin dependencias)
tools/consent-check.cjs Verificación del bloqueo de cookies (sin dependencias)
assets/               Imágenes, logos y capturas
odd/                  Documentación interna de desarrollo (no se publica)
```

`js/site.js` existe separado de `js/main.js` para que las páginas que no cargan la lógica del home
—`recomendados.html` y las que vengan— compartan exactamente la misma navbar y el mismo reveal.

---

## Funcionalidades operativas en producción ✅

- **Formulario beta** → guarda lead en Firestore `beta_leads`
- **Email de bienvenida** al lead (Resend, template HTML personalizado)
- **Notificación interna** a `hola@guauguaucars.com` en cada nuevo lead
- **Detección automática** al registrarse en la app → descuento beta asignado
- **Sección de recomendados** → catálogo curado con enlaces de afiliado de Amazon
- **Consentimiento de cookies** → Tag Manager solo se carga con permiso de analítica
- **Licencia restrictiva** sobre marca y concepto (ver `LICENSE`)

---

## Recomendados y afiliados

La antigua sección de financiación colectiva (`#apoya`) está retirada y archivada en
`index.html` como bloque comentado. Su lugar lo ocupa `#recomendados`, que lleva a
`/recomendados.html`: cinco categorías elegidas por criterio —transporte en coche, hidratación,
descanso, higiene y senderismo— y no por catálogo.

- **Programa**: Amazon Afiliados, ID de seguimiento `guauguaucars.com-21`
- **Escaparate**: https://www.amazon.es/shop/queai04
- **Enlaces**: siempre en formato largo `www.amazon.es/...` (nunca el acortador `amzn.to`), con
  `target="_blank"` y `rel="sponsored nofollow noopener"`
- **Precios**: la web no publica precios ni imágenes de producto. El precio y el stock los muestra
  Amazon en sus listas de ideas, así que nunca quedan desactualizados y no hace falta la Product
  Advertising API
- **Divulgación**: obligatoria en cualquier página con enlaces, incluida la home

Los detalles de la feature —specs, tareas y decisiones— están en
`odd/tasks/affiliate-recommendations.md`; ese directorio no se publica.

---

## Cookies y consentimiento

`js/consent.js` bloquea todo lo no esencial hasta que el visitante decide:

- **Analítica**: Google Tag Manager (`GTM-M38485DD`) no se inyecta sin permiso, y `pushEvent()`
  deja de emitir eventos mientras no haya consentimiento
- **Afiliación**: se declara en el banner y en `privacidad.html#cookies`; las cookies de Amazon
  solo se aceptan con permiso explícito
- La decisión se guarda en `localStorage['guauguau-consent/v1']` y se revisa desde el enlace
  **Cookies** del pie de página

Verificación sin dependencias:

```bash
node tools/consent-check.cjs   # 15 aserciones sobre el gating; sale 0 si todo pasa
```

---

## Analítica y eventos

Google Tag Manager (`GTM-M38485DD`) es el único contenedor; GA4 (`G-3J490P05RV`) se configura como
etiqueta dentro de GTM. No se añade `gtag.js` directo al HTML: duplicaría los page views.

`pushEvent()` en `js/main.js` no emite nada sin consentimiento de analítica, y GTM ni siquiera se
carga hasta entonces. Eventos instrumentados:

| Evento | Cuándo |
|---|---|
| `demo_carousel_interacted` | Navegación del carrusel de la app (`action`: dot, prev, next, swipe_prev, swipe_next) |
| `section_visible` | Sección visible en el viewport (`section_id`) |
| `beta_form_started` | Primer foco en el formulario beta |
| `lead_type_selected` | Selección de tipo de lead (`lead_type`) |
| `beta_form_submitted` | Envío correcto (`lead_type`) |
| `beta_form_error` | Fallo de red o de API (`error_type`, `error_message`) |
| `apoya_modal_opened` | Apertura del modal de la sección de apoyo |
| `social_link_clicked` | Clic en un enlace social (`platform`) |

---

## Comprobaciones locales

Ambas corren sin dependencias y salen con código 1 si algo falla:

```bash
node tools/site-check.cjs      # navbar, menú móvil y reveal
node tools/consent-check.cjs   # bloqueo de cookies y persistencia de la decisión
```

---

## Desarrollo local

```bash
python3 -m http.server 8080 --bind 127.0.0.1
# http://127.0.0.1:8080/
```

El deploy excluye los archivos internos (`odd/**`, `tools/**` y todos los `.md`) mediante
`firebase.json`; el servidor local sí los muestra.

---

## Orden de implementación — Backlog

Las issues están en: https://github.com/Pitcher755/GuauGuauCars_landing/issues
Estado revisado el 2026-11-09 contra `GuauGuauCars-Mobile/develop`. Todo el backend de esta
sección vive en `GuauGuauCars-Mobile/functions/`, nunca en este repo.

### ✅ Implementado en `develop` — solo falta cerrar la issue

| Issue | Qué entrega | PR mobile |
|---|---|---|
| [#5](../../issues/5) | Kill-switch `config/beta.grantNewDiscounts` | #307 |
| [#7](../../issues/7) | Scheduler `autoExpireBetaDiscounts` (diario, crowdfunding > 12 meses) | #311 |
| [#11](../../issues/11) | Campo `betaAccessSentAt` + idempotencia del broadcast | #312 |
| [#10](../../issues/10) | Template HTML "¡La Beta está abierta!" | #314 |
| [#12](../../issues/12) | `sendBetaAccessEmail` — envío individual | #315 |
| [#13](../../issues/13) | `broadcastBetaAccess` — envío masivo con rate limiting | #317 |

### ✅ Cerradas

[#1](../../issues/1) · [#2](../../issues/2) · [#3](../../issues/3) · [#4](../../issues/4) ·
[#6](../../issues/6) · [#18](../../issues/18) · [#19](../../issues/19)

### 🔲 Pendientes, en orden de implementación

| Orden | Issue | Qué es | Dónde | Depende de | Prioridad |
|---|---|---|---|---|---|
| 1 | [#8](../../issues/8) | `revokeUserBetaDiscount`: revocación individual de descuento | 📱 Mobile (functions/) | — | 🟡 Media |
| 2 | [#9](../../issues/9) | Flutter: badge de descuento beta en perfil con fecha de caducidad | 📱 Mobile (Flutter) | #2 (cerrada) | 🟡 Media |
| 3 | [#14](../../issues/14) | Doc: flujo completo formulario → Firestore → emails → descuento | 📝 Docs | #12, #13 (hechas) | 🟢 Baja |
| 4 | [#16](../../issues/16) | Doc: procedimiento de broadcast de apertura de beta | 📝 Docs | #13 (hecha) | 🟢 Baja |
| 5 | [#15](../../issues/15) | Doc: lifecycle del descuento (grant → expiry → revocation) | 📝 Docs | #7 (hecha), #8 | 🟢 Baja |
| 6 | [#17](../../issues/17) | Doc: funcionalidades de la landing en README | 📝 Docs | Todo lo anterior | 🟢 Baja |

Orden razonado: primero se cierra el código del lifecycle (#8), porque su documentación (#15)
no puede describir una revocación que todavía no existe; después la única pieza de UI visible
para el usuario (#9); y al final la documentación, que se apoya sobre el estado final y termina
con el README del repo (#17).

---

## Diagrama del flujo completo

```
CAPTACIÓN
──────────────────────────────────────────────────────────────
Landing form ──► submitBetaLead (HTTP Function)
                       │
                       └─► beta_leads/{docId} creado en Firestore
                                     │
                           onBetaLeadCreated (trigger)
                           ├── send_welcome_email_service
                           │       └─► email bienvenida al LEAD
                           └── send_admin_notification_service
                                   └─► notif a hola@guauguaucars.com

REGISTRO EN APP
──────────────────────────────────────────────────────────────
users/{uid} creado ──► onUserDocumentCreated (trigger)
                               │
                   mark_user_as_beta_service
                   ├── verifica config/beta.grantNewDiscounts
                   ├── lee discountTier de beta_leads
                   └── set_beta_fields(uid, tier, months)
                           ├── betaUser = true
                           ├── betaDiscount = true
                           ├── betaGrantedAt = now()
                           ├── betaTier = "standard" | "crowdfunding"
                           └── betaDiscountExpiresAt = null | +12 meses

PAGO
──────────────────────────────────────────────────────────────
createPaymentIntent ──► valida betaDiscount && !expirado
                               └─► comisión 0% | comisión normal

APERTURA DE BETA
──────────────────────────────────────────────────────────────
broadcastBetaAccess ──► itera beta_leads donde betaAccessSentAt = null
                               └─► sendBetaAccessEmail
                                       └─► email "¡La Beta está abierta!"

CONTROL OPERATIVO
──────────────────────────────────────────────────────────────
config/beta.grantNewDiscounts = false  → bloquea nuevas asignaciones
revokeUserBetaDiscount(uid)            → revoca descuento individual
expireBetaDiscounts (cron diario)      → auto-expira crowdfunding > 12 meses
```

---

## Deploy

```bash
# Instalar Firebase CLI (si no lo tenés)
npm install -g firebase-tools

# Login
firebase login

# Deploy solo hosting
firebase deploy --only hosting --project guauguaucars-app-prod
```

---

## Seguridad

- **Nunca** subas `.env`, `.env.*`, `*.key`, `*.pem` ni `service-account*.json` al repo
- Los secrets del backend (Resend, Stripe) están en **Google Cloud Secret Manager**, no en este repo
- El repo es público — el código de la landing lo es, los secrets nunca
- Ver `.gitignore` para la lista completa de exclusiones

---

## Licencia

Copyright © 2026 GuauGuauCars · Javier Fernández Guerra — ver [`LICENSE`](./LICENSE)

El código es visible pero **no** se puede copiar, usar comercialmente ni crear productos derivados.
La marca **GuauGuauCars** y el concepto de plataforma de viajes para mascotas están protegidos.
