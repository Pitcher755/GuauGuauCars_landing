# GuauGuauCars — Landing Page

> La primera plataforma de viajes compartidos pensada al 100% para mascotas.

Landing page de captación beta, crowdfunding y presentación del producto.
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

---

## Secciones de la página

| Sección | ID | Descripción |
|---------|----|-------------|
| Hero | `#hero` | CTA principal → formulario de captación beta |
| Cómo funciona | `#como-funciona` | 3 pasos del flujo de viaje |
| Protectoras | `#protectoras` | Plazas colaboradoras para refugios |
| Únete a la Beta | `#contacto` | Formulario de captación |
| Apoya el proyecto | `#apoya` | Tiers de crowdfunding (modal "Próximamente") |
| Footer | — | Nav, RRSS, T&C, Privacidad |
| Términos y Condiciones | `/terminos.html` | Borrador legal (banner de aviso activo) |
| Política de Privacidad | `/privacidad.html` | Borrador legal (banner de aviso activo) |

---

## Funcionalidades operativas en producción ✅

- **Formulario beta** → guarda lead en Firestore `beta_leads`
- **Email de bienvenida** al lead (Resend, template HTML personalizado)
- **Notificación interna** a `hola@guauguaucars.com` en cada nuevo lead
- **Detección automática** al registrarse en la app → descuento beta asignado
- **Modal "Próximamente"** en sección `#apoya` (todos los tiers)
- **Licencia restrictiva** sobre marca y concepto (ver `LICENSE`)

---

## Orden de implementación — Backlog

Las issues están en: https://github.com/Pitcher755/GuauGuauCars_landing/issues

### 🗂️ EPIC 1 — Schema y fundamentos del descuento (base de todo lo demás)

| # | Issue | Prioridad |
|---|-------|-----------|
| 1 | [#1 — Añadir `discountTier` a `beta_leads`](../../issues/1) | 🔴 Alta |
| 2 | [#2 — Añadir `betaTier` y `betaDiscountExpiresAt` a `users`](../../issues/2) | 🔴 Alta |
| 3 | [#3 — Crear `config/beta` en Firestore](../../issues/3) | 🔴 Alta |
| 4 | [#11 — Añadir `betaAccessSentAt` a `beta_leads`](../../issues/11) | 🔴 Alta |

### 🗂️ EPIC 2 — Detección y asignación automática

| # | Issue | Prioridad | Depende de |
|---|-------|-----------|-----------|
| 5 | [#4 — `mark_user_as_beta_service`: leer y propagar `discountTier`](../../issues/4) | 🔴 Alta | #1, #2 |
| 6 | [#5 — `mark_user_as_beta_service`: verificar `grantNewDiscounts`](../../issues/5) | 🔴 Alta | #3 |
| 7 | [#6 — `createPaymentIntent`: validar descuento no expirado](../../issues/6) | 🔴 Alta | #2 |

### 🗂️ EPIC 3 — Control de descuentos (activar / desactivar)

| # | Issue | Prioridad | Depende de |
|---|-------|-----------|-----------|
| 8 | [#7 — Scheduler: auto-expirar descuentos crowdfunding](../../issues/7) | 🟡 Media | #2 |
| 9 | [#8 — `revokeUserBetaDiscount`: revocación individual](../../issues/8) | 🟡 Media | — |
| 10 | [#9 — Flutter: badge de descuento beta en perfil](../../issues/9) | 🟡 Media | #2 |

### 🗂️ EPIC 4 — Envío masivo: apertura de la beta

| # | Issue | Prioridad | Depende de |
|---|-------|-----------|-----------|
| 11 | [#10 — Template HTML "¡La Beta está abierta!"](../../issues/10) | 🔴 Alta | — |
| 12 | [#12 — `sendBetaAccessEmail`: envío individual](../../issues/12) | 🔴 Alta | #10, #11 |
| 13 | [#13 — `broadcastBetaAccess`: envío masivo con rate limiting](../../issues/13) | 🔴 Alta | #12, #3 |

### 🗂️ EPIC 5 — Documentación

| # | Issue | Prioridad |
|---|-------|-----------|
| 14 | [#14 — Documentar flujo completo lead → descuento](../../issues/14) | 🟢 Baja |
| 15 | [#15 — Documentar lifecycle del descuento](../../issues/15) | 🟢 Baja |
| 16 | [#16 — Documentar procedimiento de broadcast](../../issues/16) | 🟢 Baja |
| 17 | [#17 — Documentar funcionalidades de la landing](../../issues/17) | 🟢 Baja |

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
