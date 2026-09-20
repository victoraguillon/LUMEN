import { test, expect } from '@playwright/test';

// Harness de LUMENShare: garantiza que el contenido se pagina en tarjetas
// 1080×1920 (formato historia) SIN desborde, SIN perder texto y con resolución
// idéntica en cualquier viewport (escritorio / tablet / móvil).
// Nota: _measureInnerHeight muta --sc-h a un valor mínimo para leer el alto
// real, así que la geometría final debe leerse en una tarjeta recién construida,
// sin medir antes.

async function boot(page, view = 'landing') {
  await page.goto('/');
  await page.waitForFunction(() =>
    typeof LumenRouter !== 'undefined' && typeof LumenShare !== 'undefined' && !!LumenRouter.navigateTo
  );
  await page.evaluate((v) => LumenRouter.navigateTo(v), view);
  await page.evaluate(() => LumenShare._fontsReady());
}

const DEFAULT_O = {
  kind: 'Blog católico',
  theme: 'blog',
  title: 'Un título largo de artículo compartible',
  date: 'lunes, 15 de septiembre de 2026',
};

test.describe('LUMENShare · paginación multi-imagen', () => {
  test('Contenido largo se pagina, no se recorta y no pierde texto', async ({ page }) => {
    await boot(page);
    const o = Object.assign({}, DEFAULT_O);
    const res = await page.evaluate(async (base) => {
      await LumenShare._fontsReady();
      const paras = Array.from({ length: 28 }, (_, i) =>
        'Párrafo ' + (i + 1) + '. ' + ('texto '.repeat(34)).trim() + ', fin del párrafo ' + (i + 1) + '.'
      );
      const o = Object.assign({}, base, { paragraphs: paras });
      const pages = LumenShare._assignPages(o, paras);
      const stage = document.createElement('div');
      stage.className = 'share-stage';
      document.body.appendChild(stage);
      const overflow = [];
      const rebuilt = [];
      let hasIndicator = false;
      for (let i = 0; i < pages.length; i++) {
        stage.innerHTML = LumenShare.buildCard(o, { hero: pages[i].hero, texts: pages[i].texts, num: i + 1, total: pages.length });
        const h = LumenShare._measureInnerHeight(stage, 8);
        if (h > LumenShare.PAGE_H + 0.5) overflow.push({ page: i, h: Math.round(h) });
        if (pages.length > 1 && stage.querySelector('.sc-page')) hasIndicator = true;
        rebuilt.push(...pages[i].texts);
      }
      stage.innerHTML = LumenShare.buildCard(o, { hero: true, texts: pages[0].texts, num: 1, total: pages.length });
      const geom = { w: stage.offsetWidth, h: stage.offsetHeight };
      stage.remove();
      const norm = (s) => s.replace(/\s+/g, ' ').trim();
      return {
        pages: pages.length,
        overflow,
        intact: norm(rebuilt.join(' ')) === norm(paras.join(' ')),
        hasIndicator,
        geom,
      };
    }, o);
    expect(res.pages).toBeGreaterThan(1);
    expect(res.overflow).toEqual([]);
    expect(res.intact).toBe(true);
    expect(res.hasIndicator).toBe(true);
    expect(res.geom).toEqual({ w: 1080, h: 1920 });
  });

  test('Página única de tipo vistoso (cita) cabe en 1080×1920', async ({ page }) => {
    await boot(page);
    const res = await page.evaluate(async () => {
      await LumenShare._fontsReady();
      const o = { kind: 'Friendly Reminder', theme: 'reminder', quote: 'Dios nos ama y nos acompaña siempre.', cite: 'Lumen', date: 'hoy', paragraphs: [] };
      const pages = LumenShare._assignPages(o, o.paragraphs);
      const stage = document.createElement('div');
      stage.className = 'share-stage';
      document.body.appendChild(stage);
      stage.innerHTML = LumenShare.buildCard(o, { hero: pages[0].hero, texts: pages[0].texts, num: 1, total: pages.length });
      const heightOk = LumenShare._measureInnerHeight(stage, 8) <= LumenShare.PAGE_H + 0.5;
      stage.innerHTML = LumenShare.buildCard(o, { hero: pages[0].hero, texts: pages[0].texts, num: 1, total: pages.length });
      LumenShare._applyFit(stage);
      const rec = {
        pages: pages.length,
        heightOk,
        cardW: stage.offsetWidth,
        cardH: stage.offsetHeight,
        footVisible: !!stage.querySelector('.sc-foot'),
      };
      stage.remove();
      return rec;
    });
    expect(res.pages).toBe(1);
    expect(res.heightOk).toBe(true);
    expect(res.cardW).toBe(1080);
    expect(res.cardH).toBe(1920);
    expect(res.footVisible).toBe(true);
  });

  test('El footer queda anclado abajo sin gap artificial tras _applyFit', async ({ page }) => {
    await boot(page);
    const res = await page.evaluate(async (base) => {
      await LumenShare._fontsReady();
      const o = Object.assign({}, base, { paragraphs: ['Primer párrafo breve.', 'Segundo párrafo algo más largo repartido en pocas líneas.', 'Último párrafo.'] });
      const stage = document.createElement('div');
      stage.className = 'share-stage';
      document.body.appendChild(stage);
      stage.innerHTML = LumenShare.buildCard(o, { hero: true, texts: o.paragraphs, num: 1, total: 1 });
      const heightOk = LumenShare._measureInnerHeight(stage, 8) <= LumenShare.PAGE_H + 0.5;
      stage.innerHTML = LumenShare.buildCard(o, { hero: true, texts: o.paragraphs, num: 1, total: 1 });
      LumenShare._applyFit(stage);
      const inner = stage.querySelector('.sc-inner');
      const foot = stage.querySelector('.sc-foot');
      const spacer = stage.querySelector('.sc-spacer');
      const card = stage.querySelector('.share-card');
      const rec = {
        spacerHeight: spacer ? parseFloat(getComputedStyle(spacer).height) : -1,
        footBottom: foot ? foot.offsetTop + foot.offsetHeight : -1,
        innerBottom: inner ? inner.clientHeight : -1,
        heightOk,
      };
      stage.remove();
      return rec;
    }, DEFAULT_O);
    expect(res.spacerHeight).toBeGreaterThan(0);
    expect(res.footBottom).toBeLessThanOrEqual(res.innerBottom + 1);
    expect(res.heightOk).toBe(true);
  });

  test('Captura html2canvas: resolución fija 2160×3840 en este viewport', async ({ page }) => {
    await boot(page);
    const hasLib = await page.evaluate(() => typeof html2canvas !== 'undefined');
    test.skip(!hasLib, 'html2canvas no cargado en este entorno');
    const res = await page.evaluate(async (base) => {
      await LumenShare._fontsReady();
      const o = Object.assign({}, base, { paragraphs: ['Primer bloque.', 'Segundo bloque.', 'Tercer bloque.'] });
      const stage = document.createElement('div');
      stage.className = 'share-stage';
      document.body.appendChild(stage);
      stage.innerHTML = LumenShare.buildCard(o, { hero: true, texts: o.paragraphs, num: 1, total: 1 });
      LumenShare._applyFit(stage);
      const card = stage.querySelector('.share-card');
      const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      const rec = { w: canvas.width, h: canvas.height };
      stage.remove();
      return rec;
    }, DEFAULT_O);
    expect(res).toEqual({ w: 2160, h: 3840 });
  });
});

test.describe('LUMENShare · formatos: historia / post 4:5 / cuadrado', () => {
  const FORMATS = {
    post: { w: 2160, h: 2700 },
    cuadrado: { w: 2160, h: 2160 },
  };

  for (const [fmt, out] of Object.entries(FORMATS)) {
    test(`Formato ${fmt}: paginación sin desborde, texto intacto y captura ${out.w}×${out.h}`, async ({ page }) => {
      await boot(page);
      const hasLib = await page.evaluate(() => typeof html2canvas !== 'undefined');
      test.skip(!hasLib, 'html2canvas no cargado en este entorno');
      const res = await page.evaluate(async ({ fmt, out, base }) => {
        await LumenShare._fontsReady();
        LumenShare.setFormat(fmt);
        const o = Object.assign({}, base, {
          paragraphs: Array.from({ length: 20 }, (_, i) =>
            'Párrafo ' + (i + 1) + '. ' + ('texto '.repeat(30)).trim() + ', fin del párrafo ' + (i + 1) + '.'
          ),
        });
        const paras = o.paragraphs;
        const pages = LumenShare._assignPages(o, paras);
        const stage = document.createElement('div');
        stage.className = 'share-stage';
        document.body.appendChild(stage);
        const overflow = [];
        const rebuilt = [];
        for (let i = 0; i < pages.length; i++) {
          stage.innerHTML = LumenShare.buildCard(o, { hero: pages[i].hero, texts: pages[i].texts, num: i + 1, total: pages.length });
          const h = LumenShare._measureInnerHeight(stage, 8);
          if (h > LumenShare.PAGE_H + 0.5) overflow.push({ page: i, h: Math.round(h) });
          rebuilt.push(...pages[i].texts);
        }
        stage.innerHTML = LumenShare.buildCard(o, { hero: true, texts: pages[0].texts, num: 1, total: pages.length });
        const card = stage.querySelector('.share-card');
        card.style.setProperty('--sc-h', LumenShare.PAGE_H + 'px');
        LumenShare._applyFit(stage);
        const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
        const geom = { w: card.offsetWidth, h: card.offsetHeight };
        const norm = (s) => s.replace(/\s+/g, ' ').trim();
        const rec = {
          pageCount: pages.length,
          overflow,
          intact: norm(rebuilt.join(' ')) === norm(paras.join(' ')),
          card: geom,
          canvas: { w: canvas.width, h: canvas.height },
          fmt: LumenShare._fmtKey,
        };
        stage.remove();
        return rec;
      }, { fmt, out, base: DEFAULT_O });
      expect(res.pageCount).toBeGreaterThan(1);
      expect(res.overflow).toEqual([]);
      expect(res.intact).toBe(true);
      expect(res.card).toEqual({ w: 1080, h: out.h / 2 });
      expect(res.canvas).toEqual(out);
      expect(res.fmt).toBe(fmt);
    });
  }

  test('Nombres de archivo: sufijo solo para formatos que no son historia', async ({ page }) => {
    await boot(page);
    const res = await page.evaluate(() => ({
      historia: LumenShare._filenameFor('historia', 'alimento-de-hoy-2026-09-19.png'),
      post: LumenShare._filenameFor('post', 'alimento-de-hoy-2026-09-19.png'),
      cuadrado: LumenShare._filenameFor('cuadrado', 'santo-del-dia.png'),
      paginadaPost: LumenShare._pageFilename(LumenShare._filenameFor('post', 'articulo-x.png'), 2, 3),
    }));
    expect(res.historia).toBe('alimento-de-hoy-2026-09-19.png');
    expect(res.post).toBe('alimento-de-hoy-2026-09-19-post.png');
    expect(res.cuadrado).toBe('santo-del-dia-cuadrado.png');
    expect(res.paginadaPost).toBe('articulo-x-post-pag-2de3.png');
  });
});