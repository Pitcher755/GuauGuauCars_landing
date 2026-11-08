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

**S9.** Los enlaces de afiliado usan el ID de seguimiento `guauguaucars.com-21`, creado en la
cuenta para este sitio. El escaparate es `https://www.amazon.es/shop/queai04`.

**S10.** Las categorías se apoyan en listas de ideas del escaparate, que muestran el precio
actualizado en el dominio de Amazon. La página propia **no** publica precios ni imágenes de
producto, así que no puede quedar desactualizada ni incumplir la cláusula de precios.

**S11.** La sección de crowdfunding deja de renderizarse en producción ya, sin esperar al slice 3,
y sus cuatro enlaces de navegación se retiran para no dejar anclas muertas. El slice 3 reintroduce
la navegación apuntando a la sección nueva.

**S12.** Los enlaces de afiliado se publican en formato largo (`amazon.es/...`), nunca con el
acortador `amzn.to`, para que el visitante vea el destino antes de hacer clic.

## Tasks

| ID | Tarea | Specs | Commit |
|---|---|---|---|
| T1 | Banner de consentimiento, gating de GTM/GA4 y enlace para revisar la decisión | S4 | slice 1 |
| T2 | Política de cookies y cláusula de afiliados en `privacidad.html` | S5, S6 | slice 1 |
| T3 | Página `/recomendados.html` con las cinco categorías | S2 | slice 2 |
| T4 | Home: nueva sección, renombrado de navegación y archivo de tiers y modal | S1, S3, S8 | slice 3 |
| T5 | `robots.txt`, `sitemap.xml` y documentación en README y BACKLOG | S7 | slice 4 |
| T6 | Retirar la sección de crowdfunding y sus enlaces de navegación | S11 | slice 1b |
| T7 | `tools/consent-check.cjs` como primer test del repo | S4 | `f9be087` |
| T8 | `.gitignore`: caches del harness y backlog personal | — | `5235d5f` |

Entradas ya recibidas: ID de seguimiento `guauguaucars.com-21`, escaparate
`https://www.amazon.es/shop/queai04` y lista de ideas de transporte (`34XD1YSLQ6SES`).
Pendiente para cerrar T3: la lista de ideas de hidratación, descanso, higiene y senderismo.
Mientras llegan, esas cuatro categorías enlazan al escaparate con el rótulo "Ver en la tienda".

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

**L6.** "Vamos a aclarar algunos detalles de mi cuenta de afiliados, esta lleva ya un par de años en
funcionamiento, por lo tanto superé el minimo de ventas en los primeros meses que pide amazon, la
cosa es que he creado un nuevo ID en la misma cuenta para este caso concreto. El caso de la tienda
no me ha pedido redes sociales sole me permite un escaparate en amazon, este me permite agregar por
ejemplo listas con productos, no te puedo dar mas detalles porque lo acabo de crear y aun no se
como va, se llama lista de ideas y agrupa una variedad de artículos, por ejemplo una lista puede
ser transporte seguro en coche, en esa añadir todos los productos que tengan que ver con la
seguridad y el transporte de mascotas en coche... He creado esa lista de ejemplo y este es el
enlace https://amzn.to/4iBaQda Sobre los artículos en mi página, lo que da confianza, podemos añadir
los links, aunque me preocupa el precio desactualizado, comentas que se requiere la Product
Advertising API, no estoy seguro pero creo que si que la tengo, aunque nunca la he usado y no se
como hacerlo todavía. El storeID es queai04-21 y el id de seguimiento es guauguaucars.com-21, pero
hay una duda y es que me ha aparecido otro que no he creado yo, o no conscientemente que es
onamzqueai04-21. El enlace de la tienda es https://www.amazon.es/shop/queai04"

**L7.** Evidencia del enlace de la lista de ideas: `https://amzn.to/4iBaQda` responde `301` hacia
`https://www.amazon.es/shop/queai04/list/34XD1YSLQ6SES?linkCode=spc&tag=guauguaucars.com-21&domainId=influencer&asc_contentid=amzn1.ideas.34XD1YSLQ6SES`,
es decir que el ID de seguimiento viaja dentro y que el escaparate es la superficie de influencer.

**L8.** Decisiones de esta ronda: commitear el harness · añadir al `.gitignore` lo que falta ·
"la sección de crowdfunding no debe quedar visible".

**L9.** "Genial, si esperamos a que cree las cinco listas, no se si podré hacerlo hoy pero lo
intentaré y si te las paso con enlace corto no hagas caso, estoy de acuerdo en que el usuario debe
ver a donde va, usa el largo. Lo que si quiero ahora es que me permitas un enlace local para ver el
resultado actual de la landing con navegación a /recomendados.html y pueda ver el estado actual
completo antes de desplegar en firebase que lo haremos cuando lo tengamos más pulido"

**L10.** "Me gusta mucho el diseño, lo revisaré más a fondo por si veo algo que falla pero parece
que es perfecto, sin embargo hay algo que si me gustaría y es que se añada una sección pequeña en la
home que indique que comprando esos recomendados o usando nuestro enlace de afiliados colaboran con
el proyecto, concretamente una llamada a la acción para que el visitante compre desde nuestros
enlaces y conseguir un pequeño tunel de ventas"

**L11.** "Genial, me encanta, ahora, todo lo que sea independiente de las listas quiero que lo
hagas, solo dejamé al final la parte pendiente que depende unicamente de mi, lo haré lo antes
posible"

**L12.** Hallazgo de deploy: `firebase.json` publicaba el directorio entero (`"public": "."`) con
solo tres exclusiones, así que `odd/tasks/affiliate-recommendations.md` —que contiene mensajes del
usuario y decisiones internas— y `tools/consent-check.cjs` habrían quedado accesibles en
`guauguaucars.com`. Se añadieron `**/*.md`, `odd/**` y `tools/**` a las exclusiones.
