// LUMEN · Parser del RSS "Evangelio de hoy" de Vatican News (Node.js, sin deps).
// El <item> del día trae en <description> (CDATA) los bloques <p> con las
// lecturas y la meditación papal. Este módulo lo convierte en un objeto
// estructurado: lecturas clasificadas (primera/segunda, salmo, aleluya,
// evangelio) + meditación con atribución "(Papa/… - Evento, fecha)".

export const VATICAN_RSS_URL =
  "https://www.vaticannews.va/content/vaticannews/es/evangelio-de-hoy.rss.xml";

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  hellip: "\u2026", mdash: "\u2014", ndash: "\u2013", deg: "\u00b0",
  iquest: "\u00bf", iexcl: "\u00a1", laquo: "\u00ab", raquo: "\u00bb",
  ldquo: "\u201c", rdquo: "\u201d", lsquo: "\u2018", rsquo: "\u2019",
  times: "\u00d7", bull: "\u2022",
  Agrave: "\u00c0", Aacute: "\u00c1", Acirc: "\u00c2", Auml: "\u00c4",
  Egrave: "\u00c8", Eacute: "\u00c9", Euml: "\u00cb",
  Igrave: "\u00cc", Iacute: "\u00cd", Ograve: "\u00d2", Oacute: "\u00d3",
  Ouml: "\u00d6", Ugrave: "\u00d9", Uacute: "\u00da", Uuml: "\u00dc",
  Ntilde: "\u00d1", Ccedil: "\u00c7",
  agrave: "\u00e0", aacute: "\u00e1", acirc: "\u00e2", auml: "\u00e4",
  egrave: "\u00e8", eacute: "\u00e9", euml: "\u00eb",
  igrave: "\u00ec", iacute: "\u00ed", ograve: "\u00f2", oacute: "\u00f3",
  ocirc: "\u00f4", ouml: "\u00f6", ugrave: "\u00f9", uacute: "\u00fa",
  uuml: "\u00fc", ntilde: "\u00f1", ccedil: "\u00e7", yacute: "\u00fd",
};

export function decodeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z#0-9]+);/g, (m, name) => (name in ENTITIES ? ENTITIES[name] : m));
}

// Separa el contenido en bloques de párrafo. Tolera CDATA crudo y contenido
// escapado (&lt;p&gt;…&lt;/p&gt;).
export function splitParagraphs(html) {
  const decoded = decodeHtml(html);
  const out = [];
  const parts = decoded.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const p of parts) {
    const inner = p.replace(/^<p[^>]*>/i, "").replace(/<\/p>$/i, "");
    out.push(inner);
  }
  return out;
}

function blockType(t) {
  if (/^lectura del santo evangelio seg[uú]n/i.test(t)) return "gospel";
  if (/^lectura del? /i.test(t)) return "lectura";
  if (/^salmo\b/i.test(t)) return "salmo";
  if (/^al+eluya/i.test(t)) return "aleluya";
  return null;
}

// Etiqueta litúrgica que el feed intercala ANTES de la lectura en domingos y
// solemnidades (p.ej. "Segunda lectura" seguido de "Lectura de la carta…").
const LECTURA_LABEL_RE = /^(primera|segunda|tercera)\s+lectura$/i;

function lecturaLabel(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function looksLikeRef(t) {
  if (t.length > 130 || t.length < 3) return false;
  if (/[«“”"\n]/.test(t)) return false;
  if (!/\d/.test(t)) return false;
  if ((t.endsWith(".") || t.endsWith(":") || t.endsWith(";")) && !/ \d+([.,:;-]\s*\d+)*$/.test(t)) {
    return false;
  }
  return true;
}

// Detecta la atribución al final del párrafo de meditación:
//   "(León XIV - Ángelus, 1° de febrero de 2026)" | "(Papa Francisco, …)"
function extractAttr(block) {
  const m = block.match(/\(([^()]*)\)\s*$/);
  if (!m) return null;
  const inner = m[1].trim();
  if (inner.length < 4 || inner.length > 170) return null;
  if (/^cf\./i.test(inner)) return null;
  const hasYear = /\b\d{4}\b/.test(inner);
  const hasDash = /[\u2013\u2014-]/.test(inner);
  const hasEvent = /,| del\b| de la\b|\d{1,2}\s*(\u00b0|\u00ba)|\b(santo|santa|san )/i.test(inner);
  if (!hasYear && !hasDash) return null;
  if (!hasEvent && !hasDash) return null;
  return {
    cite: inner,
    text: block.slice(0, block.length - m[0].length).replace(/\s+$/, ""),
  };
}

function normalizeBlock(inner) {
  return inner
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function deriveDate(source, title) {
  const fromUrl = source && source.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (fromUrl) return `${fromUrl[1]}-${fromUrl[2]}-${fromUrl[3]}`;
  const t = title && title.match(/(\d{1,2})\s+([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1]+)\s+(\d{4})/i);
  if (t) {
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
      "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    const mi = months.indexOf(t[2].toLowerCase());
    if (mi >= 0) {
      return `${t[3]}-${String(mi + 1).padStart(2, "0")}-${String(t[1]).padStart(2, "0")}`;
    }
  }
  return "";
}

export function parseEvangelioRss(xml) {
  const item = (xml.match(/<item>[\s\S]*?<\/item>/i) || [])[0];
  if (!item) {
    const title = (xml.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
    throw new Error(`No se encontró el ítem del día (${title.slice(0, 80) || "RSS vacío"})`);
  }

  const title = (item.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
  const source =
    (item.match(/<guid>([\s\S]*?)<\/guid>/i) || [])[1] ||
    (item.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] ||
    "";

  const cdata = (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || [])[1];
  const raw = typeof cdata === "string" ? cdata : (item.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || "";

  const blocks = splitParagraphs(raw)
    .map(normalizeBlock)
    .filter((b) => b.length > 0);

  let reflection = { text: "", cite: "" };
  let medIndex = -1;
  if (blocks.length) {
    const attr = extractAttr(blocks[blocks.length - 1]);
    if (attr && attr.text.trim()) {
      reflection = attr;
      medIndex = blocks.length - 1;
    }
  }

  const spans = [];
  let start = -1;
  for (let i = 0; i < blocks.length; i++) {
    if (blockType(blocks[i])) {
      if (start >= 0) spans.push([start, i]);
      start = i;
    }
  }
  if (start >= 0) spans.push([start, blocks.length]);

  const readings = [];
  for (const [s, e] of spans) {
    const heading = blocks[s];
    const reading = {
      type: blockType(heading),
      heading,
      label:
        s > 0 && LECTURA_LABEL_RE.test(blocks[s - 1])
          ? lecturaLabel(blocks[s - 1])
          : null,
      ref: "",
      text: "",
    };
    const body = [];
    for (let i = s + 1; i < e; i++) {
      if (i === medIndex) continue;
      const t = blocks[i];
      if (LECTURA_LABEL_RE.test(t)) continue;
      if (!reading.ref && looksLikeRef(t)) {
        reading.ref = t;
      } else {
        body.push(t);
      }
    }
    reading.text = body.join("\n\n");
    readings.push(reading);
  }

  // Etiqueta ordinal de las lecturas cuando el feed no trae la etiqueta
  // explícita: la 1ª lectura del día es "Primera lectura", la 2ª "Segunda".
  const lecciones = readings.filter((r) => r.type === "lectura");
  lecciones.forEach((r, i) => {
    r.label =
      r.label ||
      (i === 0 ? "Primera lectura" : i === 1 ? "Segunda lectura" : i === 2 ? "Tercera lectura" : null);
  });

  return {
    date: deriveDate(source, title),
    source: source || "",
    title: title.replace(/\s+/g, " ").trim(),
    readings: readings.filter((r) => r.text || r.ref),
    reflection,
  };
}