# Feature: beta-backlog-completion

Cierre del backlog beta de GuauGuauCars: completar las issues que el agente puede ejecutar por sí
solo, cada una en su propia rama y con su PR a `develop`, para que el titular las revise y mergee.

Repos: `GuauGuauCars_landing` (esta doc, README y #17) y `GuauGuauCars-Mobile` (#8, #9, #14, #15, #16).
Base: `develop` de cada repo (`landing` bd79897, `mobile` da92a8e).

## Specs

**S1. #8 `revokeUserBetaDiscount`** — callable de revocación individual. Solo con claim `admin=true`;
sin admin responde `PERMISSION_DENIED` *antes* de validar el payload. Payload `{ uid: string }`;
`uid` ausente, vacío o no-string → `INVALID_ARGUMENT`; `uid` inexistente → `NOT_FOUND`. Escribe en
`users/{uid}`: `betaDiscount = false`, `betaRevokedAt = now()`, `betaRevokedBy = invoker_uid`. Loguea
la acción. Archivos: `functions/main.py`, `functions/beta_leads.py`.

**S2. #9 Badge de descuento beta en perfil** — si `betaDiscount=true` y no hay caducidad: badge verde
"Descuento beta activo · Sin caducidad". Si hay `betaDiscountExpiresAt`: "Descuento beta activo ·
Válido hasta [fecha]" con la fecha formateada en locale ES (ej. "15 de enero de 2027"). Si
`betaDiscount=false`: no se muestra nada.

**S3. #14 Doc flujo completo** — `formulario → Firestore → emails → descuento`, en
`GuauGuauCars-Mobile/doc/guides/`.

**S4. #16 Doc procedimiento de broadcast** — cómo ejecutar `broadcastBetaAccess` de forma segura.

**S5. #15 Doc lifecycle del descuento** — `grant → expiry → revocation`; se redacta después de S1
porque documenta la revocación que introduce S1.

**S6. #17 Doc de funcionalidades de la landing** — el README de este repo describe todas las
funcionalidades reales: estructura de archivos, analítica, comprobaciones locales, páginas legales,
robots/sitemap y el orden de implementación vigente del backlog.

## Tasks

| ID | Spec | Tarea | Rama | Repo |
|---|---|---|---|---|
| T1 | S1 | Callable `revokeUserBetaDiscount` + servicio + repo + 14 tests | `feature/gh-8-revoke-user-beta-discount` | mobile |
| T2 | S2 | `betaDiscount`/`betaDiscountExpiresAt` en `User`+`UserModel`, `BetaDiscountBadge`, l10n ×5, 11 tests | `feature/gh-9-beta-discount-badge` | mobile |
| T3 | S3 | `doc/guides/BETA-LEADS-FLOW.md` + índice | `docs/gh-14-lead-to-discount-flow` | mobile |
| T4 | S4 | `doc/guides/BETA-BROADCAST-PROCEDURE.md` + índice | `docs/gh-16-broadcast-procedure` | mobile |
| T5 | S5 | `doc/guides/BETA-DISCOUNT-LIFECYCLE.md` + índice | `docs/gh-15-discount-lifecycle` | mobile |
| T6 | S6 | README completo + esta doc | `docs/gh-17-landing-readme` | landing |

## Log

**L1** (pedido original del usuario, literal): "genial, pues ahora las issues que esten en tu mano
quiero wue las comoletes, cada una en su propia branch y que una vez finalizadas hagas push y PR,
esta tarde cuando dalga dwl trabajo las revisare y hare los merges si todo es correcto o en su
defecto pedire correcciones, estas de acuerdo?"

**L2** (decisiones del usuario en esta sesión): autentica `gh` él mismo para que el agente abra los
PRs; pide instalar Flutter para completar #9 con tests (ya estaba instalado en `~/flutter`).

**L3** (evidencia T1): `pytest` 173 passed / 9 skipped; 14 casos nuevos. Commit `2bfc879`.

**L4** (evidencia T2): `flutter test` 763 passed; `flutter analyze` sin issues. Commit `0e1b1d3`.

**L5** (desvío registrado, T2): la issue #9 condiciona el texto a `betaTier == "standard" |
"crowdfunding"`, pero el backend guarda el origen en `betaDiscountTier` y `betaTier` contiene
`protectora|dueno`. El badge deriva el texto de `betaDiscount` + presencia de
`betaDiscountExpiresAt`, que es la fuente de verdad legible. El badge gris de "expirado" quedó fuera
a propósito (la issue lo marca como opcional).

**L6** (desvío registrado, T2): el commit de T2 mide 492 líneas autoradas, por encima del slice de
~400. Se mantiene en un solo commit porque es un único comportamiento (modelo + widget + l10n
generada) y así el PR se revisa como una unidad; las líneas generadas de `app_localizations*`
explican la mayor parte del exceso.
