import { test, expect } from '@playwright/test';
import { go } from '../_support/nav.js';

const VIEWS = ['landing', 'nosotros', 'actividades', 'calendario', 'blog', 'devocional', 'evangelio', 'formacion', 'intenciones', 'encuestas', 'contacto'];

async function noOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return { w: doc.clientWidth, elem: doc.scrollWidth, body: document.body.scrollWidth };
  });
}

test.describe('Responsive · sin desborde horizontal', () => {
  for (const view of VIEWS) {
    test(`Vista ${view} sin desborde horizontal`, async ({ page }) => {
      if (view === 'calendario') {
        await page.goto('/');
        await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
        const deployed = await page.evaluate(() => typeof CalendarioView !== 'undefined');
        test.skip(!deployed, 'Calendario aún no desplegado en este entorno');
      }
      await go(page, view);
      await page.waitForTimeout(700);
      const m = await noOverflow(page);
      expect(Math.max(m.elem, m.body)).toBeLessThanOrEqual(m.w + 2);
    });
  }
});

test.describe('Responsive · header de marca', () => {
  test('El header solo muestra logo, búsqueda y tema en cualquier ancho', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');

    const header = await page.evaluate(() => {
      const visible = (el) => {
        if (!el) return false;
        const s = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return s.display !== 'none' && s.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      };
      const navbar = document.querySelector('.navbar');
      const box = navbar.getBoundingClientRect();
      const mainNav = document.querySelector('.main-nav');
      const bottomNav = document.querySelector('.bottom-nav');
      return {
        visible: visible(navbar),
        logo: visible(navbar.querySelector('.logo')),
        search: visible(navbar.querySelector('[data-search-open]')),
        theme: visible(navbar.querySelector('#theme-toggle-btn')),
        login: visible(navbar.querySelector('.login-btn')),
        profile: visible(navbar.querySelector('.user-profile-btn')),
        menu: visible(navbar.querySelector('.mobile-menu-btn')),
        userZone: !!navbar.querySelector('#user-data-zone'),
        right: Math.round(box.right),
        viewport: document.documentElement.clientWidth,
        mainNav: visible(mainNav),
        mainNavLinks: mainNav ? [...mainNav.querySelectorAll('.nav-links > li > a, .nav-links > li > .dropdown-trigger')].filter(visible).length : 0,
        bottomNav: visible(bottomNav)
      };
    });

    expect(header.visible).toBe(true);
    expect(header.logo).toBe(true);
    expect(header.search).toBe(true);
    expect(header.theme).toBe(true);
    expect(header.login).toBe(false);
    expect(header.profile).toBe(false);
    expect(header.menu).toBe(false);
    expect(header.userZone).toBe(false);
    expect(header.right).toBeLessThanOrEqual(header.viewport + 1);

    if (testInfo.project.use.viewport.width >= 1024) {
      expect(header.mainNav).toBe(true);
      expect(header.mainNavLinks).toBe(6);
      expect(header.bottomNav).toBe(false);
    } else {
      expect(header.mainNav).toBe(false);
      expect(header.bottomNav).toBe(true);
    }
  });
});

test.describe('Responsive · navegación', () => {
  test('Nav del escritorio comparte tipografía y agrupa Actividades en Comunidad', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width < 1024, 'Solo escritorio (≥1024px)');
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');

    const nav = await page.evaluate(() => {
      const link = document.querySelector('.main-nav .nav-links > li > a.nav-link');
      const trigger = document.querySelector('.main-nav .nav-links .dropdown-trigger');
      const typography = (el) => {
        if (!el) return null;
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          padding: style.padding,
          height: Math.round(box.height)
        };
      };
      return {
        link: typography(link),
        trigger: typography(trigger),
        topLevelActividades: !!document.querySelector('.main-nav .nav-links > li > a[data-view="actividades"]'),
        communityActividades: !!document.querySelector('#comunidad-dropdown a[data-view="actividades"]'),
        communityDescargas: !!document.querySelector('#comunidad-dropdown a[data-view="offline"]'),
        oracionDescargas: !!document.querySelector('#oracion-dropdown a[data-view="offline"]')
      };
    });

    expect(nav.trigger).toEqual(nav.link);
    expect(nav.link.fontSize).toBe('16px');
    expect(nav.link.fontWeight).toBe('500');
    expect(nav.topLevelActividades).toBe(false);
    expect(nav.communityActividades).toBe(true);
    expect(nav.communityDescargas).toBe(true);
    expect(nav.oracionDescargas).toBe(false);
  });

  test('Nav del escritorio abre el dropdown Espiritualidad', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width < 1024, 'Solo escritorio (≥1024px)');
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
    await page.evaluate(() => { document.getElementById('espiritualidad-dropdown')?.classList.add('active'); });
    await page.locator(`.main-nav .nav-link[data-view="formacion"]`).click();
    await expect(page.getByText('Catecismo', { exact: true })).toBeVisible();
  });

  test('La hoja de Comunidad reúne los accesos y abre el menú completo', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width >= 1024, 'Solo móvil/tablet (<1024px)');
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');

    await page.locator('.bottom-nav-item[data-nav="comunidad"]').click();
    const sheet = page.locator('#community-sheet');
    await expect(sheet).toHaveClass(/active/);
    await expect(sheet.locator('.prayer-sheet-link')).toHaveCount(10);
    await expect(sheet.locator('.prayer-sheet-link[data-view="offline"]')).toContainText('Descargas');
    await expect(sheet.locator('.prayer-sheet-link[data-view="offline"]')).toHaveAttribute('href', '/offline');

    await sheet.locator('.sheet-more').click();
    await expect(page.locator('#side-drawer')).toHaveClass(/active/);
    await expect(page.locator('#side-drawer .drawer-link[data-view="offline"]')).toContainText('Descargas');
    await expect(page.locator('#side-drawer .drawer-link[data-view="perfil"]')).toContainText('Mi perfil');
  });

  test('El drawer móvil navega a una vista', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width >= 1024, 'Solo móvil/tablet (<1024px)');
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
    await page.locator('.bottom-nav-item[data-nav="comunidad"]').click();
    await page.locator('#community-sheet .sheet-more').click();
    await expect(page.locator('#side-drawer')).toBeVisible();
    await page.locator('.drawer-link[data-view="nosotros"]').first().click();
    await page.waitForTimeout(600);
    await expect(page.locator('.about-hero-title')).toBeVisible();
    expect(await page.locator('#side-drawer').evaluate(el => el.classList.contains('active'))).toBe(false);
  });

  test('Componentes clave visibles en vista móvil/tablet', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width >= 1024, 'Solo móvil/tablet (<1024px)');
    await page.goto('/');
    await expect(page.locator('#app-header')).toBeVisible();
    await expect(page.locator('#bottom-nav')).toBeVisible();
    await expect(page.locator('.main-nav')).toBeHidden();
  });

  test('En escritorio la barra principal es la vía de navegación', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.viewport.width < 1024, 'Solo escritorio (≥1024px)');
    await page.goto('/');
    await expect(page.locator('#app-header')).toBeVisible();
    await expect(page.locator('.main-nav')).toBeVisible();
    await expect(page.locator('#bottom-nav')).toBeHidden();
    for (const view of ['inicio', 'formacion', 'nosotros', 'perfil']) {
      await expect(page.locator(`.main-nav .nav-links > li > a[data-view="${view}"]`)).toBeVisible();
    }
  });
});

test.describe('Responsive · safe areas (notch/isla dinámica)', () => {
  async function assertSafeTop(page, width, height) {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      try {
        localStorage.setItem('lumen-cookie-consent', JSON.stringify({ level: 'essential', ts: Date.now() }));
        localStorage.setItem('lumen_pwa_dismissed', '1');
      } catch (e) {}
    });
    await page.goto('/');
    await page.waitForFunction(() => typeof LumenRouter !== 'undefined');
    await page.addStyleTag({ content: ':root{--safe-top:59px!important;--safe-right:0px!important;--safe-bottom:34px!important;--safe-left:0px!important;}' });
    await page.waitForTimeout(120);

    const m = await page.evaluate(() => {
      const doc = document.documentElement;
      const navbar = document.querySelector('.navbar');
      const logo = document.querySelector('.navbar .logo');
      const search = document.querySelector('.navbar [data-search-open]');
      const mainNav = document.querySelector('.main-nav');
      const app = document.getElementById('app-container');
      const navBox = navbar.getBoundingClientRect();
      const logoBox = logo.getBoundingClientRect();
      const searchBox = search.getBoundingClientRect();
      const mainNavStyle = mainNav ? getComputedStyle(mainNav) : null;
      const first = app && app.firstElementChild ? app.firstElementChild.getBoundingClientRect() : null;
      return {
        overflow: Math.max(doc.scrollWidth, document.body.scrollWidth) <= doc.clientWidth + 2,
        navTop: navBox.top,
        logoTop: Math.round(logoBox.top),
        searchTop: Math.round(searchBox.top),
        navHeight: Math.round(navBox.height),
        mainNavDisplay: mainNavStyle ? mainNavStyle.display : null,
        mainNavTop: mainNav ? Math.round(mainNav.getBoundingClientRect().top) : null,
        firstContentTop: first ? Math.round(first.top) : null
      };
    });

    expect(m.overflow).toBe(true);
    expect(m.navTop).toBe(0);
    expect(m.logoTop).toBeGreaterThanOrEqual(59);
    expect(m.searchTop).toBeGreaterThanOrEqual(59);
    expect(m.navHeight).toBeGreaterThanOrEqual(127);
    if (width >= 1024) {
      expect(m.mainNavDisplay).not.toBe('none');
      expect(m.mainNavTop).toBe(127);
    } else {
      expect(m.mainNavDisplay).toBe('none');
      expect(m.firstContentTop).toBeGreaterThanOrEqual(127);
    }
  }

  test('Header respeta safe area superior en 430×932', async ({ page }) => {
    await assertSafeTop(page, 430, 932);
  });

  test('Header respeta safe area superior en 932×430 (horizontal)', async ({ page }) => {
    await assertSafeTop(page, 932, 430);
  });
});
