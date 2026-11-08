# Feature: affiliate-recommendations

Reemplaza la financiación colectiva de la landing por un sistema de recomendados con enlaces de
afiliado de Amazon: una tarjeta de entrada en el home y una página propia con catálogo curado.

Rama: `feat/affiliate-recommendations` · Base: `develop` (`dd51606`)

## Specs

**S1.** La sección `#apoya` deja de pedir financiación colectiva. Pasa a ser la entrada a
recomendados con encuadre **híbrido explícito**: título de utilidad y una línea honesta de que
comprar por los enlaces deja una comisión de Amazon al proyecto, sin coste extra para el usuario.
El ancla `#apoya` y la regla de light mode de `css/custom.css` se conservan para no romper la
navegación existente (header, menú móvil, footer).

**S2.** El catálogo vive en una página propia `/recomendados.html`, **indexable** (a diferencia de
las legales, que llevan `noindex`), con canonical y Open Graph, y cinco categorías curadas:
transporte seguro en coche, hidratación y comida de viaje, descanso y cama portátil, higiene y
limpieza, senderismo y paseo largo. La tarjeta "Toda la tienda de Amazon" apunta a la tienda de
Amazon del titular. Los enlaces de afiliado llevan `rel="sponsored nofollow noopener"` y
`target="_blank"`.

**S3.** Los cuatro tiers de crowdfunding (10 / 25 / 50 / 100 €) y el modal "Próximamente" se
**archivan en el código**: dejan de renderizarse, pero permanecen como bloque comentado y
etiquetado para poder recuperarlos.

**S4.** Se implementa un banner de consentimiento previo en este mismo cambio, con bloqueo de
cookies no esenciales hasta que el usuario consienta: GTM/GA4 no se cargan sin consentimiento de
analítica, y la decisión se puede revisar después desde un enlace permanente.

**S5.** Toda publicación de enlaces de afiliado incluye divulgación visible, incluida la home.

**S6.** `privacidad.html` deja de afirmar "No utilizamos cookies de terceros con fines
publicitarios" y pasa a describir las cookies de afiliación de Amazon y el consentimiento previo.

**S7.** Se añaden `robots.txt` y `sitemap.xml`, que hoy no existen.

**S8.** Las cuatro apariciones del texto "Apoya el proyecto" (header, menú móvil, `h2` de la
sección, footer) se renombran al nuevo encuadre.

## Tasks

| ID | Tarea | Specs | Commit |
|---|---|---|---|
| T1 | Banner de consentimiento, gating de GTM/GA4 y enlace para revisar la decisión | S4 | slice 1 |
| T2 | Política de cookies y cláusula de afiliados en `privacidad.html` | S5, S6 | slice 1 |
| T3 | Página `/recomendados.html` con las cinco categorías | S2 | — |
| T4 | Home: nueva sección, renombrado de navegación y archivo de tiers y modal | S1, S3, S8 | — |
| T5 | `robots.txt`, `sitemap.xml` y documentación en README y BACKLOG | S7 | — |

Pendiente de entrada del usuario: tag de afiliado y URL de la tienda de Amazon (necesarios para T3).

### Límites de slice

Los slices se miden contra la base de la rama, `develop` (`dd51606`). El contador automático
compara contra `main`, que está 27 commits atrás, así que reporta el acumulado histórico del
proyecto y no el tamaño del slice.

- Slice 1: 374 líneas añadidas, 31 eliminadas, commit `feat(consent)`. Cierra T1 y T2.
- El hash del propio slice no se escribe aquí: cualquier `--amend` lo cambia. Se registra en el PR.


## Log

**L1.** "Necesito que pongamos orden a una idea que tengo para la landing. Te cuento un poco por
encima y me ayudas iterando poco a poco a bajarla a tierra. Resulta que la landing tiene un
apartado para colaborar económicamente con el proyecto, con una financiación colectiva, esto a mi
me cuesta mucho, en el sentido de que me da cosa pedir dinero y más si el proyecto ni siquiera
tiene una fecha de salida clara. Entonces me gustaría cambiar ese apartado de apoya el proyecto y
añadir ahí una sección de enlaces de afiliados de amazon, no directamente en la pagina inicial que
afearía un poco el diseño, asi que básicamente cambiar el modelo de crowdfunding a enlaces de
afiliados, no se si me entiendes. Ahí se puede incluir por ejemplo una tarjeta de enlace de
afiliados global, es decir de toda la tienda de amazon, y un apartado de artículos para mascotas en
otra tarjeta, esta es la idea en bruto, que te parece la refinamos?"

**L2.** Decisiones de encuadre: `Híbrido explícito` · `Página propia /recomendados + tarjeta en
home` · `Ya tengo cuenta aprobada` (Amazon Afiliados) · `Se archivan en el código` (tiers).

**L3.** "Sobre el catalogo necesito ver más detalles, Si me gusta la opción de tus 5 recomendados,
sin embargo también veo que amazon afiliados me permíte crear una tienda, la estoy creando ahora
mismo, esta permitiría que añadamos productos de esas secciones sin sobrecargar el home, no es asi?
Estoy un poco indeciso o no lo veo todo lo claro que me gustaría, afinemos un poco antes de comenzar
los cambios"

**L4.** Decisiones finales: `Híbrido: página propia + tienda` · `Banner de verdad en este cambio`
(consentimiento) · `Sí, añadir robots y sitemap`.

**L5.** Evidencia del estado de partida: `#apoya` se renderiza públicamente con la barra de progreso
en 0 € y objetivo 4.500 €, aunque el comentario del código la declara oculta; los cuatro CTAs abren
el modal "Próximamente"; `privacidad.html:295` afirma que no se usan cookies de terceros con fines
publicitarios.
