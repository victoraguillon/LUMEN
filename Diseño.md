# Diseño LUMEN

Guía viva del sistema visual. La fuente de verdad son los tokens de `css/styles.css`; este documento los explica y fija el criterio para nuevas pantallas.

## 1. Identidad

LUMEN es una comunidad juvenil católica. La interfaz debe sentirse **solemne, cercana y luminosa**: papel limpio, azul profundo, azul litúrgico y oro cálido. Nada de estridencia ni decoración vacía; cada acento debe ayudar a leer o a orientarse.

Principios:

1. **La Palabra primero.** El contenido y las citas mandan; el cromo desaparece.
2. **Calma visual.** Fondos limpios, sombras suaves, una sola idea por bloque.
3. **Jerarquía clara.** Título display, cuerpo sans, cita serif.
4. **Móvil de verdad.** Navegación inferior, áreas táctiles de 44 px y una mano.
5. **Accesible por defecto.** Contraste WCAG AA, foco visible, movimiento reducible.

## 2. Paleta

### Modo claro

| Token | HEX / valor | Uso |
| --- | --- | --- |
| `--azul-profundo` | `#0B2545` | Marca, heroes, texto sobre claro |
| `--azul-noche` | `#071A33` | Profundidad del degradado |
| `--primary` | `#245888` | Acción principal |
| `--primary-strong` | `#1B466D` | Hover de acción principal |
| `--primary-ink` | `#8FBFE8` | Azul claro para modo oscuro |
| `--liturgico` | `#005F8A` | Acento litúrgico |
| `--gold` | `#C9A84C` | Oro decorativo y líneas |
| `--gold-ink` | `#8A6118` | Oro legible sobre claro |
| `--gold-soft` | `rgba(201,168,76,.14)` | Fondos dorados suaves |
| `--gold-line` | `rgba(201,168,76,.34)` | Bordes dorados |
| `--paper` | `#F6F8FB` | Fondo de la app |
| `--surface` | `#FFFFFF` | Tarjetas y barras |
| `--surface-sunken` | `#EDF2F8` | Zonas hundidas, chips |
| `--ink` | `#0F172A` | Texto principal |
| `--ink-soft` | `#34465C` | Texto secundario fuerte |
| `--muted` | `#5D6E82` | Texto secundario |
| `--hairline` | `rgba(15,23,42,.09)` | Bordes finos |
| `--hairline-strong` | `rgba(15,23,42,.15)` | Bordes de controles |

### Modo oscuro

| Token | Valor |
| --- | --- |
| `--paper` | `#080D15` |
| `--surface` | `#0F1622` |
| `--surface-raised` | `#141D2B` |
| `--surface-sunken` | `#0B1220` |
| `--ink` | `#F3F7FC` |
| `--ink-soft` | `#D2DDEB` |
| `--muted` | `#9AAABF` |
| `--accent-text` | `#8FBFE8` |
| `--accent-text-2` | `#A9D0EA` |
| `--gold` | `#D8B968` |
| `--gold-ink` | `#E8CE8A` |
| `--hairline` | `rgba(255,255,255,.09)` |

> Regla: sobre fondos claros usa `--gold-ink`; sobre fondos oscuros usa `--gold` o el `--gold-ink` redefinido en oscuro (`#E8CE8A`). Nunca uses `--gold` puro como texto pequeño sobre blanco.

### Gradiente de marca

```css
--gradiente-lumen: linear-gradient(135deg, #0B2545 0%, #123A63 48%, #005F8A 100%);
```

En oscuro arranca en `#071A33`. Los heroes añaden radiales suaves de oro y azul litúrgico.

## 3. Tipografía

| Familia | Token | Uso |
| --- | --- | --- |
| **Sora** | `--font-display` | Títulos, cifras grandes, nombres de sección |
| **Inter** | `--font-ui` | Cuerpo, UI, botones, formularios |
| **Cormorant Garamond** | `--font-liturgical` | Citas, pasajes, oraciones, versículos |

Carga en `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap" rel="stylesheet">
```

Escala:

```css
--text-2xs: 0.6875rem;   /* 11 px */
--text-xs:  0.75rem;     /* 12 px */
--text-sm:  0.875rem;    /* 14 px */
--text-base:1rem;        /* 16 px */
--text-md:  1.0625rem;   /* 17 px */
--text-lg:  1.25rem;     /* 20 px */
--text-xl:  1.5rem;      /* 24 px */
--text-2xl: clamp(1.75rem, 1.4vw + 1.3rem, 2.4rem);
--text-3xl: clamp(2.15rem, 2.6vw + 1.35rem, 3.4rem);
```

Criterios:

- Títulos de vista: Sora, 30–46 px, `letter-spacing: -0.035em`, línea 1.08.
- Cuerpo: Inter 15–16 px, línea 1.65–1.75.
- Citas litúrgicas: Cormorant 500, 18–36 px, línea 1.35–1.75.
- Kickers/eyebrows: Inter 10.5–12 px, mayúsculas, tracking `0.16em–0.18em`.

## 4. Estructura

### Shell

```
body
├── header.navbar            barra de marca fija: logo, búsqueda y tema (68 px)
├── nav.main-nav             enlaces de escritorio (54 px, ≥1024 px)
├── main#app-container       contenido con padding de shell
├── footer.app-footer
├── aside.side-drawer        menú lateral completo (≤1023 px)
├── nav.bottom-nav           navegación inferior (≤1023 px)
├── section.prayer-sheet     hoja de oración
└── section.community-sheet  hoja de Comunidad (móvil/tablet)
```

### Navegación

- **Header de marca (todos los anchos):** solo logo LUMEN, búsqueda y selector claro/oscuro. El perfil y la sesión ya no viven aquí.
- **Escritorio (≥1024 px):** `nav.main-nav` bajo el header con Inicio, Formación, Oración, Comunidad, Nosotros y Mi perfil. Descargas se agrupa dentro del desplegable de Comunidad.
- **Móvil/tablet (≤1023 px):** barra inferior de 5 destinos: Inicio · Formación · **Orar** · Comunidad · Perfil. El botón central eleva una hoja de oración; **Comunidad** abre una hoja con Actividades, Calendario, Blog, Avisos, Intenciones, Encuestas, Recursos, Descargas, Contacto y Nosotros, más “Ver todo el menú” para el drawer completo.
- Altura de referencia: `--nav-h: 68px`, `--main-nav-h: 54px`, `--bottom-nav-h: 64px`.
- La barra superior usa `backdrop-filter` y un borde hairline; no compite con el contenido.
- Los avisos PWA se colocan por encima de la barra inferior, nunca encima de ella.

### Contenedor

```css
#app-container {
    max-width: var(--page-max); /* 1180px */
    padding: calc(var(--nav-h) + var(--main-nav-h) + 34px) var(--page-pad) 64px;
}
@media (max-width: 1023px) {
    #app-container {
        padding: calc(var(--nav-h) + 20px) 16px
                 calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 30px);
    }
}
```

## 5. Componentes

### Botones

- `.btn` base: 44–48 px de alto, radio 12–13 px, icono + texto, transición 160 ms.
- `.btn-primary`: azul de marca, texto blanco.
- `.btn-outline`: superficie + borde hairline; hover dorado suave.
- `.btn-block`: ancho completo, solo para acciones principales en móvil.
- `.btn-row`: acciones pareadas; nunca estirar un botón secundario a todo el ancho sin motivo.
- Foco: `outline: 2px solid var(--accent-text); outline-offset: 3px`.

### Tarjetas

- Superficie `--surface`, borde `--hairline`, radio `--radius-lg` (20 px), sombra `--shadow-xs`.
- Hover solo en puntero fino: `translateY(-3px)` y `--shadow-md`; en táctil no hay hover persistente.
- Tarjeta de contenido: barra vertical dorada de 3 px solo al interactuar.
- Tarjetas de oración/santo: imagen arriba, cuerpo 22 px, acciones al pie.

### Chips, tabs y campos

- Chips: píldora, 30 px mínimo, fondo `--surface-sunken`.
- Tabs: contenedor tipo píldora; en móvil scroll horizontal con `scroll-snap`.
- Inputs: 46 px, radio 12 px, foco con anillo dorado `0 0 0 4px var(--gold-soft)`.
- Badges litúrgicos: punto de color + etiqueta en mayúsculas, fondo suave por tiempo.

### Modales y hojas

- Overlay `rgba(5,14,28,.52)` + blur 6 px.
- Modal centrado, radio 26 px, cabecera display. Los `.modal.glass` usan 0.94 de opacidad para que el texto no herede el fondo.
- Hoja de oración y hoja de Comunidad: suben desde abajo, radio superior 28 px, `env(safe-area-inset-bottom)`.
- Focus trap y cierre con `Esc`; el scroll del body se bloquea con `.sheet-open`.

### Skeletons y estados

- Skeleton con shimmer de 1.6 s; respeta `prefers-reduced-motion`.
- Vacíos: borde discontinuo, icono, título y una acción clara.
- Errores: mensaje humano + reintento; nunca solo un código.

## 6. Vistas de referencia

| Vista | Patrón |
| --- | --- |
| **Landing** | Hero con gradiente y CTA, intro de comunidad, módulos, cita litúrgica, pasos, CTA final |
| **Inicio** | Panel “Hoy” con 4 tarjetas (Evangelio, Rosario, Planes, Formación), racha, badge litúrgico, bloque “Friendly Reminder” |
| **Formación** | Cabecera centrada, acciones favoritos/racha, grid de módulos 2 columnas (1 en móvil), lector con progreso |
| **Actividades** | Avisos push, búsqueda, tabs Próximas/Historial/Únicos/Recurrentes, grid de tarjetas |
| **Evangelio** | Hero oscuro con fecha, acciones Copiar/Compartir, lecturas en tarjetas, Evangelio destacado, meditación |
| **Devocional** | Hero con cita serif, reflexión, acciones, santo del día, tabs de oración |
| **Perfil** | Estado invitado con tarjeta amable y CTA; estado miembro con progreso y datos |

## 7. Responsive

| Breakpoint | Cambios |
| --- | --- |
| `≤349px` | Logo, búsqueda y tema siguen visibles; controles a 36 px |
| `≤639px` | Una columna en grids, heroes compactos, acciones apiladas, bottom nav activa |
| `640–1023px` | Bottom nav, drawer y hoja de Comunidad, grids de 2 columnas |
| `≥1024px` | Header de marca + `main-nav`; se oculta bottom nav; grids de 3–4 columnas |
| `1024–1180px` | La nav de escritorio reduce padding y tipografía para caber |
| `1181–1279px` | Compactación intermedia de la nav |
| `≥1280px` | Nav completa a 16 px/500 |

Reglas:

- `scroll-padding-top/bottom` en móvil para que `scrollIntoView` no deje elementos bajo las barras.
- Ningún contenedor debe provocar `scrollWidth > clientWidth`.
- Textos secundarios pueden usar `line-clamp` de 2 líneas solo si el título sigue siendo comprensible.

## 8. Movimiento

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
--ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
```

- Entradas de vista: 220–320 ms, opacidad + `translateY(8px)`.
- Hover: 160–220 ms; nunca animar `width` ni `height`.
- Drawer/hoja: 420 ms con `--ease-drawer`.
- `prefers-reduced-motion`: desactivar shimmer, parallax y transforms de tarjetas.

## 9. Accesibilidad

- Contraste mínimo AA: cuerpo `--ink` sobre `--paper`; secundarios `--muted` sobre `--surface`; nunca gris claro sobre blanco.
- Texto de error: `--error-text` (`#C81E42` en claro, `#FF8A9A` en oscuro). `--error` se reserva para fondos sólidos y bordes.
- Sobre degradados, los botones usan `.on-gradient` con texto blanco y velo blanco ≤0.18; el hover nunca sube de 0.18 para no perder contraste.
- Áreas táctiles ≥44×44 px (botones de barra 42 px con padding suficiente).
- Un solo `h1` por vista; el resto en orden.
- `aria-label` en iconos sin texto; `aria-hidden="true"` en decorativos.
- Foco visible en todos los interactivos; skip link al inicio.
- Modales con `role="dialog"`, `aria-modal`, foco inicial y retorno al disparador.
- Enlaces con subrayado o cambio de color perceptible, no solo color.
- Formularios con `label` real, `autocomplete` y mensajes de error asociados.

## 10. Archivos clave

| Archivo | Responsabilidad |
| --- | --- |
| `css/styles.css` | Tokens, base, componentes y capa final de overrides |
| `index.html` | Fuentes, anti-flash de tema, header de marca, `main-nav`, bottom nav, drawer, hojas de oración y Comunidad |
| `js/ui.js` | Tema, drawer, modales, focus trap, hojas de oración y Comunidad, racha |
| `js/app.js` | Router SPA, grupos de navegación, transiciones, gating |
| `js/views/*.js` | Render de cada vista |
| `sw.js` | Caché del shell y recursos |

## 11. Al añadir una vista

1. Usa `.view`, `.v-header`, `.v-eyebrow`, `.v-title`, `.v-sub` para la cabecera.
2. Usa `.v-card` o `.btn` existentes antes de crear clases nuevas.
3. Verifica claro/oscuro, 390×844, 820×1180 y 1280×800.
4. Comprueba `scrollWidth === clientWidth` y foco con teclado.
5. No dupliques tokens: si falta un color, añádelo a `:root` y a `body.dark-theme`.
6. Actualiza la versión de caché de `sw.js` si cambian assets del shell.
