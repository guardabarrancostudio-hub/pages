/**
 * YADEMAR — BOUTIQUE DE TEMPORADA & ESTUDIO DE TARJETAS DE REGALO
 * Catálogo Dinámico JSON + Bolsa WhatsApp + Perfiles Cliente/Admin + Canvas HD 1800x1125
 */

document.addEventListener('DOMContentLoaded', async () => {
  const STORAGE_KEY = 'yademarStoreState_v2';
  const IMG_FALLBACK_SVG =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><rect width="600" height="800" fill="#FCF9F7"/><rect x="24" y="24" width="552" height="752" rx="18" fill="none" stroke="#D90429" stroke-opacity="0.25" stroke-width="2"/><text x="300" y="385" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#141216">YADEMAR</text><text x="300" y="425" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#57535A">Boutique Chinandega</text></svg>`
    );

  // ==========================================================================
  // 1. TOAST HELPER
  // ==========================================================================
  const ydToast = document.getElementById('ydToast');
  let toastTimer = null;

  function showToast(msg, isError = false) {
    if (!ydToast) return;
    ydToast.style.borderLeftColor = isError ? '#EF4444' : '#D90429';
    const icon = isError ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';
    ydToast.innerHTML = `<i class="bi ${icon}" style="color:${isError ? '#FCA5A5' : '#E5C16C'}"></i><span>${escapeHtml(msg)}</span>`;
    ydToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ydToast.classList.remove('show'), 3300);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // 2. NAVEGACIÓN MÓVIL, SCROLL SPY & TELÉFONO EN ESCRITORIO
  // ==========================================================================
  const menuToggle = document.getElementById('ydMenuToggle');
  const navMenu = document.getElementById('ydNavMenu');
  const navbar = document.getElementById('ydNavbar');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('show');
      const icon = menuToggle.querySelector('i');
      if (icon) icon.className = open ? 'bi bi-x-lg' : 'bi bi-list';
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'bi bi-list';
      });
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY || window.pageYOffset;
      if (navbar) navbar.classList.toggle('scrolled', y > 24);
      document.querySelectorAll('section[id]').forEach(sec => {
        const top = sec.offsetTop - 130;
        const h = sec.offsetHeight;
        const link = document.querySelector(`.yd-nav-menu a[href="#${sec.id}"]`);
        if (link) link.classList.toggle('active', y >= top && y < top + h);
      });
    },
    { passive: true }
  );

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const isDesktopFine = window.innerWidth >= 992 && window.matchMedia('(pointer: fine)').matches;
      if (isDesktopFine && navigator.clipboard && navigator.clipboard.writeText) {
        e.preventDefault();
        const phone = link.getAttribute('href').replace('tel:', '').trim();
        navigator.clipboard
          .writeText(phone)
          .then(() => showToast(`Teléfono copiado (${phone}). Disponible en WhatsApp.`))
          .catch(() => {
            window.location.href = link.getAttribute('href');
          });
      }
    });
  });

  // ==========================================================================
  // 3. MOTOR DE DATOS JSON + PERSISTENCIA EN LOCALSTORAGE
  // ==========================================================================
  async function loadBaseStore() {
    if (window.location.protocol !== 'file:') {
      try {
        const res = await fetch('data/store-data.json', { cache: 'no-store' });
        if (res.ok) return await res.json();
      } catch (_) {
        // fallback below
      }
    }
    return JSON.parse(JSON.stringify(window.YADEMAR_STORE_FALLBACK || { config: {}, temporadas: [], productos: [], usuarios: [] }));
  }

  const baseData = await loadBaseStore();
  let savedState = {};
  try {
    savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch (_) {
    savedState = {};
  }

  const store = {
    config: { ...(baseData.config || {}) },
    temporadas: Array.isArray(baseData.temporadas) ? [...baseData.temporadas] : [],
    deletedProductIds: Array.isArray(savedState.deletedProductIds) ? savedState.deletedProductIds : [],
    productos: [],
    usuarios: mergeUsers(baseData.usuarios || [], savedState.usuarios || []),
    activeUserId: savedState.activeUserId || null,
    guestFavorites: Array.isArray(savedState.guestFavorites) ? savedState.guestFavorites : [],
    bag: Array.isArray(savedState.bag) ? savedState.bag : [],
    appliedGiftCode: savedState.appliedGiftCode || null,
    globalCurr: savedState.globalCurr || 'C$',
    ultimoFolio: Number(savedState.ultimoFolio || baseData.config?.ultimoFolio || 1)
  };

  store.productos = mergeById(baseData.productos || [], savedState.addedProductos || [])
    .filter(p => !store.deletedProductIds.includes(p.id));
  store.config.ultimoFolio = store.ultimoFolio;

  function mergeById(baseArr, extraArr) {
    const map = new Map();
    baseArr.forEach(item => map.set(item.id, item));
    extraArr.forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  }

  function mergeUsers(baseUsers, savedUsers) {
    const map = new Map();
    baseUsers.forEach(u => map.set(u.correo.toLowerCase(), u));
    savedUsers.forEach(u => map.set(u.correo.toLowerCase(), u));
    return Array.from(map.values());
  }

  function persistState() {
    const baseMap = new Map((baseData.productos || []).map(p => [p.id, p]));
    const addedProductos = store.productos.filter(p => !baseMap.has(p.id) || JSON.stringify(baseMap.get(p.id)) !== JSON.stringify(p));
    const payload = {
      addedProductos,
      deletedProductIds: store.deletedProductIds,
      usuarios: store.usuarios,
      activeUserId: store.activeUserId,
      guestFavorites: store.guestFavorites,
      bag: store.bag,
      appliedGiftCode: store.appliedGiftCode,
      globalCurr: store.globalCurr,
      ultimoFolio: store.ultimoFolio
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function getActiveUser() {
    if (!store.activeUserId) return null;
    return store.usuarios.find(u => u.id === store.activeUserId) || null;
  }

  function isAdminSession() {
    const user = getActiveUser();
    return Boolean(user && user.rol === 'admin');
  }

  function requireAdmin(actionLabel) {
    if (isAdminSession()) return true;
    showToast(`Acceso exclusivo del Administrador para ${actionLabel || 'esta acción'}.`, true);
    if (typeof openAccountModal === 'function') openAccountModal(false);
    return false;
  }

  function getFavoritesList() {
    const u = getActiveUser();
    return u ? (u.favoritos || []) : store.guestFavorites;
  }

  function getAllIssuedGiftCards() {
    const list = [];
    store.usuarios.forEach(u => {
      if (Array.isArray(u.giftCards)) {
        u.giftCards.forEach(gc => list.push(gc));
      }
    });
    return list;
  }

  function formatMoney(nioAmount, curr = store.globalCurr) {
    const nio = Math.round(Number(nioAmount) || 0);
    if (curr === '$') {
      const usd = (nio / (store.config.tasaCambio || 36.62)).toFixed(1).replace(/\.0$/, '');
      return `$${usd} USD`;
    }
    return `C$ ${nio.toLocaleString('en-US')}`;
  }

  // Hero Photo Setup from JSON config
  const ydHeroImg = document.getElementById('ydHeroImg');
  if (ydHeroImg && store.config.heroImagenUrl) {
    ydHeroImg.src = store.config.heroImagenUrl;
    ydHeroImg.onerror = () => {
      ydHeroImg.src = IMG_FALLBACK_SVG;
    };
  }

  // ==========================================================================
  // 4. TEMPORADAS, CATÁLOGO DINÁMICO, FAVORITOS & MONEDA GLOBAL
  // ==========================================================================
  let activeCatFilter = 'all';
  let activeSeasonFilter = 'all';
  let activeSearchQuery = '';
  let activeSort = 'featured';

  const seasonsGrid = document.getElementById('ydSeasonsGrid');
  const seasonPillsWrap = document.getElementById('ydSeasonPills');
  const productGrid = document.getElementById('ydProductGrid');
  const catalogCountEl = document.getElementById('ydCatalogCount');
  const favCountEl = document.getElementById('ydFavCount');
  const bagCountEl = document.getElementById('ydBagCount');
  const userBadgeLabelEl = document.getElementById('ydUserBadgeLabel');
  const globalCurrBtns = document.querySelectorAll('#ydGlobalCurrToggle [data-global-curr]');
  const catFilterBtns = document.querySelectorAll('[data-cat-filter]');
  const searchInput = document.getElementById('ydSearchInput');
  const sortSelect = document.getElementById('ydSortSelect');

  function updateHeaderCounters() {
    const favs = getFavoritesList();
    if (favCountEl) favCountEl.textContent = String(favs.length);
    const bagQty = store.bag.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (bagCountEl) bagCountEl.textContent = String(bagQty);
    const user = getActiveUser();
    if (userBadgeLabelEl) {
      if (user && user.rol === 'admin') {
        userBadgeLabelEl.textContent = 'Admin';
      } else {
        userBadgeLabelEl.textContent = user ? user.nombre.split(' ')[0] : 'Mi Cuenta';
      }
    }
  }

  function applyRoleVisibility() {
    const admin = isAdminSession();
    document.body.classList.toggle('yd-is-admin', admin);

    const adminRibbon = document.getElementById('ydAdminRibbon');
    const catalogAdminBar = document.getElementById('ydCatalogAdminBar');
    const giftAdminStudio = document.getElementById('ydGiftAdminStudio');
    const giftClientView = document.getElementById('ydGiftClientView');

    if (adminRibbon) adminRibbon.hidden = !admin;
    if (catalogAdminBar) catalogAdminBar.hidden = !admin;
    if (giftAdminStudio) giftAdminStudio.hidden = !admin;
    if (giftClientView) giftClientView.hidden = admin;

    updateHeaderCounters();
    renderCatalog();
  }

  function renderSeasons() {
    if (!seasonsGrid) return;
    seasonsGrid.innerHTML = store.temporadas
      .filter(t => t.activa !== false)
      .map(t => `
        <button type="button" class="yd-season-card" data-jump-season="${escapeHtml(t.id)}">
          <img src="${escapeHtml(t.imagenUrl)}" alt="${escapeHtml(t.nombre)}" loading="lazy" onerror="this.src='${IMG_FALLBACK_SVG}'">
          <div class="yd-season-overlay">
            <span class="yd-season-tag">${escapeHtml(t.etiqueta)}</span>
            <div class="yd-season-info">
              <h3>${escapeHtml(t.nombre)}</h3>
              <p>${escapeHtml(t.subtitulo)}</p>
              <span class="yd-season-cta">Explorar temporada <i class="bi bi-arrow-right"></i></span>
            </div>
          </div>
        </button>
      `)
      .join('');

    seasonsGrid.querySelectorAll('[data-jump-season]').forEach(card => {
      card.addEventListener('click', () => {
        activeSeasonFilter = card.getAttribute('data-jump-season');
        activeCatFilter = 'all';
        syncCatalogControlsUI();
        renderCatalog();
        const catSec = document.getElementById('catalogo');
        if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function renderSeasonPills() {
    if (!seasonPillsWrap) return;
    const pills = [
      { id: 'all', nombre: 'Todas las temporadas' },
      ...store.temporadas.map(t => ({ id: t.id, nombre: t.nombre }))
    ];
    seasonPillsWrap.innerHTML = pills
      .map(
        p => `<button type="button" class="yd-filter-pill is-sm ${activeSeasonFilter === p.id ? 'active' : ''}" data-season-pill="${escapeHtml(p.id)}">${escapeHtml(p.nombre)}</button>`
      )
      .join('');

    seasonPillsWrap.querySelectorAll('[data-season-pill]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSeasonFilter = btn.getAttribute('data-season-pill');
        renderSeasonPills();
        renderCatalog();
      });
    });
  }

  function syncCatalogControlsUI() {
    catFilterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-cat-filter') === activeCatFilter));
    renderSeasonPills();
  }

  function toggleFavorite(productId) {
    const user = getActiveUser();
    const list = user ? (user.favoritos = user.favoritos || []) : store.guestFavorites;
    const idx = list.indexOf(productId);
    let added = false;
    if (idx === -1) {
      list.push(productId);
      added = true;
    } else {
      list.splice(idx, 1);
    }
    persistState();
    updateHeaderCounters();
    renderCatalog();
    showToast(added ? 'Guardado en tus Favoritos' : 'Retirado de Favoritos');
    return added;
  }

  function getFilteredProducts() {
    const favSet = new Set(getFavoritesList());
    let list = store.productos.filter(p => p.disponible !== false);

    if (activeCatFilter === 'favoritos') {
      list = list.filter(p => favSet.has(p.id));
    } else if (activeCatFilter !== 'all') {
      list = list.filter(p => p.categoria === activeCatFilter);
    }

    if (activeSeasonFilter !== 'all') {
      list = list.filter(p => p.temporada === activeSeasonFilter);
    }

    if (activeSearchQuery) {
      const q = activeSearchQuery.toLowerCase();
      list = list.filter(p => {
        const colorsTxt = (p.colores || []).map(c => c.nombre).join(' ').toLowerCase();
        const tallasTxt = (p.tallas || []).join(' ').toLowerCase();
        return (
          p.nombre.toLowerCase().includes(q) ||
          (p.descripcion || '').toLowerCase().includes(q) ||
          (p.temporada || '').toLowerCase().includes(q) ||
          colorsTxt.includes(q) ||
          tallasTxt.includes(q)
        );
      });
    }

    if (activeSort === 'price-asc') {
      list = [...list].sort((a, b) => a.precio - b.precio);
    } else if (activeSort === 'price-desc') {
      list = [...list].sort((a, b) => b.precio - a.precio);
    }
    return list;
  }

  function renderCatalog() {
    if (!productGrid) return;
    const items = getFilteredProducts();
    const favSet = new Set(getFavoritesList());

    if (catalogCountEl) {
      catalogCountEl.textContent = `Mostrando ${items.length} de ${store.productos.length} prendas`;
    }

    if (items.length === 0) {
      productGrid.innerHTML = `
        <div class="yd-empty-catalog">
          <i class="bi bi-search" style="font-size:2.1rem; color:var(--yd-slate);"></i>
          <h3 style="margin:10px 0 6px;">Sin prendas con esos filtros</h3>
          <p style="font-size:0.9rem; color:var(--yd-slate); margin-bottom:16px;">Prueba restablecer la temporada o buscar otro término.</p>
          <button type="button" class="yd-btn yd-btn-noir yd-btn-sm" id="btnResetCatalogFilters">Ver Todo el Catálogo</button>
        </div>
      `;
      const rstBtn = document.getElementById('btnResetCatalogFilters');
      if (rstBtn) {
        rstBtn.addEventListener('click', () => {
          activeCatFilter = 'all';
          activeSeasonFilter = 'all';
          activeSearchQuery = '';
          if (searchInput) searchInput.value = '';
          syncCatalogControlsUI();
          renderCatalog();
        });
      }
      return;
    }

    const isAdmin = isAdminSession();
    productGrid.innerHTML = items
      .map(p => {
        const isFav = favSet.has(p.id);
        const swatches = (p.colores || [])
          .slice(0, 4)
          .map(c => `<span class="yd-swatch-circle" style="background:${escapeHtml(c.hex)};" title="${escapeHtml(c.nombre)}"></span>`)
          .join('');
        const oldPriceHtml = p.precioAnterior
          ? `<span class="yd-prod-old-price">${escapeHtml(formatMoney(p.precioAnterior))}</span>`
          : '';
        const adminControlsHtml = isAdmin
          ? `<div class="yd-prod-admin-actions">
               <button type="button" class="yd-prod-admin-btn" data-admin-edit="${escapeHtml(p.id)}"><i class="bi bi-pencil"></i> Editar</button>
               <button type="button" class="yd-prod-admin-btn is-del" data-admin-del="${escapeHtml(p.id)}"><i class="bi bi-trash"></i> Quitar</button>
             </div>`
          : '';
        return `
          <article class="yd-product-card" data-prod-id="${escapeHtml(p.id)}">
            <div class="yd-prod-media">
              <img src="${escapeHtml(p.imagenUrl)}" alt="${escapeHtml(p.nombre)}" loading="lazy" onerror="this.src='${IMG_FALLBACK_SVG}'">
              <span class="yd-prod-badge">${escapeHtml(p.etiqueta || p.temporada)}</span>
              <button type="button" class="yd-fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${escapeHtml(p.id)}" aria-label="Guardar favorito">
                <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
              </button>
              <div class="yd-prod-hover-bar">
                <button type="button" class="yd-quick-btn is-view" data-qv-id="${escapeHtml(p.id)}">
                  <i class="bi bi-eye"></i> Vista Rápida
                </button>
                <button type="button" class="yd-quick-btn is-add" data-add-id="${escapeHtml(p.id)}">
                  <i class="bi bi-bag-plus"></i> + Bolsa
                </button>
              </div>
            </div>
            <div class="yd-prod-body">
              <h3 class="yd-prod-title">${escapeHtml(p.nombre)}</h3>
              <div class="yd-prod-price-row">
                <span class="yd-prod-price">${escapeHtml(formatMoney(p.precio))}</span>
                ${oldPriceHtml}
              </div>
              <div class="yd-prod-swatches">${swatches}</div>
            </div>
            ${adminControlsHtml}
          </article>
        `;
      })
      .join('');

    productGrid.querySelectorAll('[data-admin-edit]').forEach(btn => {
      btn.addEventListener('click', () => editProductAsAdmin(btn.getAttribute('data-admin-edit')));
    });

    productGrid.querySelectorAll('[data-admin-del]').forEach(btn => {
      btn.addEventListener('click', () => deleteProductAsAdmin(btn.getAttribute('data-admin-del')));
    });

    productGrid.querySelectorAll('[data-fav-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.getAttribute('data-fav-id'));
      });
    });

    productGrid.querySelectorAll('[data-qv-id]').forEach(btn => {
      btn.addEventListener('click', () => openQuickView(btn.getAttribute('data-qv-id')));
    });

    productGrid.querySelectorAll('[data-add-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prod = store.productos.find(item => item.id === btn.getAttribute('data-add-id'));
        if (!prod) return;
        const defaultSize = (prod.tallas && prod.tallas[0]) || 'Única';
        const defaultColor = (prod.colores && prod.colores[0]?.nombre) || 'Estándar';
        addToBag({
          type: 'product',
          key: `${prod.id}::${defaultSize}::${defaultColor}`,
          id: prod.id,
          nombre: prod.nombre,
          meta: `Talla ${defaultSize} • ${defaultColor}`,
          precioC$: prod.precio,
          imagenUrl: prod.imagenUrl,
          qty: 1
        });
      });
    });
  }

  catFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCatFilter = btn.getAttribute('data-cat-filter');
      syncCatalogControlsUI();
      renderCatalog();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value.trim();
      renderCatalog();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderCatalog();
    });
  }

  const heroSeasonBtn = document.getElementById('ydHeroSeasonBtn');
  if (heroSeasonBtn) {
    heroSeasonBtn.addEventListener('click', () => {
      activeSeasonFilter = 'verano';
      activeCatFilter = 'all';
      syncCatalogControlsUI();
      renderCatalog();
      const catEl = document.getElementById('catalogo');
      if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const btnFilterFavNav = document.getElementById('btnFilterFavNav');
  if (btnFilterFavNav) {
    btnFilterFavNav.addEventListener('click', () => {
      activeCatFilter = 'favoritos';
      activeSeasonFilter = 'all';
      syncCatalogControlsUI();
      renderCatalog();
      const catEl = document.getElementById('catalogo');
      if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  globalCurrBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      store.globalCurr = btn.getAttribute('data-global-curr') || 'C$';
      globalCurrBtns.forEach(b => b.classList.toggle('active', b === btn));
      persistState();
      renderCatalog();
      renderBag();
      showToast(store.globalCurr === '$' ? 'Precios mostrados en Dólares (USD)' : 'Precios mostrados en Córdobas (C$)');
    });
  });
  globalCurrBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-global-curr') === store.globalCurr));

  // ==========================================================================
  // 5. QUICK-VIEW MODAL DE PRODUCTO
  // ==========================================================================
  const qvModal = document.getElementById('ydQuickViewModal');
  const btnCloseQuickView = document.getElementById('btnCloseQuickView');
  const qvImg = document.getElementById('qvImg');
  const qvBadge = document.getElementById('qvBadge');
  const qvSeason = document.getElementById('qvSeason');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvOldPrice = document.getElementById('qvOldPrice');
  const qvDesc = document.getElementById('qvDesc');
  const qvSizes = document.getElementById('qvSizes');
  const qvColors = document.getElementById('qvColors');
  const qvAddBagBtn = document.getElementById('qvAddBagBtn');
  const qvFavBtn = document.getElementById('qvFavBtn');
  const qvWspBtn = document.getElementById('qvWspBtn');

  let activeQvProduct = null;
  let activeQvSize = 'M';
  let activeQvColor = '';

  function openQuickView(productId) {
    const prod = store.productos.find(p => p.id === productId);
    if (!prod || !qvModal) return;
    activeQvProduct = prod;
    activeQvSize = (prod.tallas && prod.tallas[0]) || 'Única';
    activeQvColor = (prod.colores && prod.colores[0]?.nombre) || 'Estándar';

    const seasonObj = store.temporadas.find(t => t.id === prod.temporada);
    if (qvImg) {
      qvImg.src = prod.imagenUrl;
      qvImg.onerror = () => { qvImg.src = IMG_FALLBACK_SVG; };
    }
    if (qvBadge) qvBadge.textContent = prod.etiqueta || 'Yademar';
    if (qvSeason) qvSeason.textContent = seasonObj ? seasonObj.nombre : prod.temporada;
    if (qvTitle) qvTitle.textContent = prod.nombre;
    if (qvPrice) qvPrice.textContent = formatMoney(prod.precio);
    if (qvOldPrice) qvOldPrice.textContent = prod.precioAnterior ? formatMoney(prod.precioAnterior) : '';
    if (qvDesc) qvDesc.textContent = prod.descripcion || '';

    if (qvSizes) {
      qvSizes.innerHTML = (prod.tallas || ['Única'])
        .map(t => `<button type="button" class="yd-size-pill ${t === activeQvSize ? 'active' : ''}" data-qv-size="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
        .join('');
      qvSizes.querySelectorAll('[data-qv-size]').forEach(btn => {
        btn.addEventListener('click', () => {
          activeQvSize = btn.getAttribute('data-qv-size');
          qvSizes.querySelectorAll('[data-qv-size]').forEach(b => b.classList.toggle('active', b === btn));
          updateQvWspLink();
        });
      });
    }

    if (qvColors) {
      qvColors.innerHTML = (prod.colores || [])
        .map(
          c => `
            <button type="button" class="yd-chip-btn ${c.nombre === activeQvColor ? 'active' : ''}" data-qv-color="${escapeHtml(c.nombre)}">
              <span class="yd-swatch-circle" style="background:${escapeHtml(c.hex)}; vertical-align:middle; margin-right:5px;"></span>${escapeHtml(c.nombre)}
            </button>
          `
        )
        .join('');
      qvColors.querySelectorAll('[data-qv-color]').forEach(btn => {
        btn.addEventListener('click', () => {
          activeQvColor = btn.getAttribute('data-qv-color');
          qvColors.querySelectorAll('[data-qv-color]').forEach(b => b.classList.toggle('active', b === btn));
          updateQvWspLink();
        });
      });
    }

    const favSet = new Set(getFavoritesList());
    if (qvFavBtn) {
      qvFavBtn.innerHTML = `<i class="bi ${favSet.has(prod.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>`;
    }

    updateQvWspLink();
    qvModal.classList.add('open');
  }

  function updateQvWspLink() {
    if (!qvWspBtn || !activeQvProduct) return;
    const txt = `Hola Yademar, me interesa la prenda *${activeQvProduct.nombre}* (${activeQvProduct.id}) en talla *${activeQvSize}* y tono *${activeQvColor}* (${formatMoney(activeQvProduct.precio)}). ¿Tienen disponibilidad?`;
    qvWspBtn.href = `https://wa.me/${store.config.whatsapp || '50589563257'}?text=${encodeURIComponent(txt)}`;
  }

  if (qvAddBagBtn) {
    qvAddBagBtn.addEventListener('click', () => {
      if (!activeQvProduct) return;
      addToBag({
        type: 'product',
        key: `${activeQvProduct.id}::${activeQvSize}::${activeQvColor}`,
        id: activeQvProduct.id,
        nombre: activeQvProduct.nombre,
        meta: `Talla ${activeQvSize} • ${activeQvColor}`,
        precioC$: activeQvProduct.precio,
        imagenUrl: activeQvProduct.imagenUrl,
        qty: 1
      });
      if (qvModal) qvModal.classList.remove('open');
    });
  }

  if (qvFavBtn) {
    qvFavBtn.addEventListener('click', () => {
      if (!activeQvProduct) return;
      const added = toggleFavorite(activeQvProduct.id);
      qvFavBtn.innerHTML = `<i class="bi ${added ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>`;
    });
  }

  if (btnCloseQuickView && qvModal) {
    btnCloseQuickView.addEventListener('click', () => qvModal.classList.remove('open'));
    qvModal.addEventListener('click', (e) => {
      if (e.target === qvModal) qvModal.classList.remove('open');
    });
  }

  // ==========================================================================
  // 6. BOLSA DE PEDIDOS DESLIZABLE (DRAWER) + VALIDACIÓN DE GIFT CARD + CHECKOUT WHATSAPP
  // ==========================================================================
  const bagDrawer = document.getElementById('ydBagDrawer');
  const btnOpenBag = document.getElementById('btnOpenBag');
  const btnCloseBag = document.getElementById('btnCloseBag');
  const bagItemsWrap = document.getElementById('ydBagItems');
  const bagEmptyEl = document.getElementById('ydBagEmpty');
  const bagFooterEl = document.getElementById('ydBagFooter');
  const bagGiftCodeInput = document.getElementById('bagGiftCodeInput');
  const btnApplyBagGift = document.getElementById('btnApplyBagGift');
  const bagGiftAppliedInfo = document.getElementById('bagGiftAppliedInfo');
  const bagSubtotalEl = document.getElementById('ydBagSubtotal');
  const bagDiscountRow = document.getElementById('ydBagDiscountRow');
  const bagDiscountVal = document.getElementById('ydBagDiscountVal');
  const bagTotalEl = document.getElementById('ydBagTotal');
  const bagUsdApproxEl = document.getElementById('ydBagUsdApprox');
  const btnCheckoutWsp = document.getElementById('btnCheckoutWsp');
  const btnClearBag = document.getElementById('btnClearBag');

  function addToBag(newItem) {
    const existing = store.bag.find(i => i.key === newItem.key);
    if (existing) {
      existing.qty += newItem.qty || 1;
    } else {
      store.bag.push(newItem);
    }
    persistState();
    updateHeaderCounters();
    renderBag();
    if (bagDrawer) bagDrawer.classList.add('open');
    showToast(`Agregado a tu bolsa: ${newItem.nombre}`);
  }

  function findGiftCardByCode(rawCode) {
    const clean = String(rawCode || '').trim().toUpperCase().replace(/^YDM-/, '').replace(/^N°?/, '');
    if (!clean) return null;
    const all = getAllIssuedGiftCards();
    return all.find(gc => {
      const fClean = String(gc.folio || '').trim().toUpperCase().replace(/^YDM-/, '').replace(/^N°?/, '');
      return fClean === clean || String(gc.folio || '').toUpperCase() === String(rawCode || '').trim().toUpperCase();
    }) || null;
  }

  function renderBag() {
    if (!bagItemsWrap || !bagEmptyEl || !bagFooterEl) return;
    if (store.bag.length === 0) {
      bagItemsWrap.innerHTML = '';
      bagEmptyEl.hidden = false;
      bagFooterEl.hidden = true;
      return;
    }

    bagEmptyEl.hidden = true;
    bagFooterEl.hidden = false;

    bagItemsWrap.innerHTML = store.bag
      .map(
        (item, idx) => `
        <div class="yd-bag-item">
          <img src="${escapeHtml(item.imagenUrl || 'logo.jpg')}" alt="${escapeHtml(item.nombre)}" class="yd-bag-thumb" onerror="this.src='logo.jpg'">
          <div>
            <strong style="display:block; font-size:0.9rem; line-height:1.25;">${escapeHtml(item.nombre)}</strong>
            <small style="color:var(--yd-slate); display:block;">${escapeHtml(item.meta)}</small>
            <div class="yd-qty-ctrl">
              <button type="button" class="yd-qty-btn" data-qty-delta="-1" data-bag-idx="${idx}">-</button>
              <strong style="font-size:0.84rem;">${item.qty}</strong>
              <button type="button" class="yd-qty-btn" data-qty-delta="1" data-bag-idx="${idx}">+</button>
              <button type="button" class="yd-btn-ghost" style="padding:2px 6px; font-size:0.74rem;" data-bag-remove="${idx}">Quitar</button>
            </div>
          </div>
          <strong style="font-size:0.92rem; white-space:nowrap;">${escapeHtml(formatMoney(item.precioC$ * item.qty))}</strong>
        </div>
      `
      )
      .join('');

    bagItemsWrap.querySelectorAll('[data-qty-delta]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-bag-idx'));
        const delta = Number(btn.getAttribute('data-qty-delta'));
        if (!store.bag[idx]) return;
        store.bag[idx].qty += delta;
        if (store.bag[idx].qty <= 0) store.bag.splice(idx, 1);
        persistState();
        updateHeaderCounters();
        renderBag();
      });
    });

    bagItemsWrap.querySelectorAll('[data-bag-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-bag-remove'));
        store.bag.splice(idx, 1);
        persistState();
        updateHeaderCounters();
        renderBag();
      });
    });

    const subtotalC = store.bag.reduce((sum, item) => sum + item.precioC$ * item.qty, 0);
    let discountC = 0;
    const matchedGift = store.appliedGiftCode ? findGiftCardByCode(store.appliedGiftCode) : null;

    if (matchedGift) {
      const rate = store.config.tasaCambio || 36.62;
      const giftCreditC = matchedGift.moneda === '$' ? Math.round(matchedGift.monto * rate) : Math.round(matchedGift.monto);
      discountC = Math.min(subtotalC, giftCreditC);
      if (bagGiftAppliedInfo) {
        bagGiftAppliedInfo.hidden = false;
        bagGiftAppliedInfo.textContent = `Tarjeta ${matchedGift.folio} verificada (${formatMoney(giftCreditC)}).`;
      }
      if (bagDiscountRow && bagDiscountVal) {
        bagDiscountRow.hidden = false;
        bagDiscountVal.textContent = `- ${formatMoney(discountC)}`;
      }
    } else {
      if (bagGiftAppliedInfo) bagGiftAppliedInfo.hidden = true;
      if (bagDiscountRow) bagDiscountRow.hidden = true;
    }

    const totalC = Math.max(0, subtotalC - discountC);
    if (bagSubtotalEl) bagSubtotalEl.textContent = formatMoney(subtotalC);
    if (bagTotalEl) bagTotalEl.textContent = formatMoney(totalC);
    if (bagUsdApproxEl) {
      const otherCurr = store.globalCurr === '$' ? 'C$' : '$';
      bagUsdApproxEl.textContent = `Equivalente aproximado: ${formatMoney(totalC, otherCurr)} (Tasa C$ ${store.config.tasaCambio || 36.62})`;
    }
  }

  if (btnOpenBag && bagDrawer) {
    btnOpenBag.addEventListener('click', () => {
      renderBag();
      bagDrawer.classList.add('open');
    });
  }
  if (btnCloseBag && bagDrawer) {
    btnCloseBag.addEventListener('click', () => bagDrawer.classList.remove('open'));
    bagDrawer.addEventListener('click', (e) => {
      if (e.target === bagDrawer) bagDrawer.classList.remove('open');
    });
  }

  if (btnApplyBagGift && bagGiftCodeInput) {
    btnApplyBagGift.addEventListener('click', () => {
      const code = bagGiftCodeInput.value.trim();
      if (!code) {
        store.appliedGiftCode = null;
        persistState();
        renderBag();
        return;
      }
      const match = findGiftCardByCode(code);
      if (!match) {
        showToast(`Folio "${code}" no encontrado en el historial emitido.`, true);
        return;
      }
      store.appliedGiftCode = match.folio;
      persistState();
      renderBag();
      showToast(`Tarjeta ${match.folio} aplicada a tu bolsa`);
    });
  }

  if (btnClearBag) {
    btnClearBag.addEventListener('click', () => {
      store.bag = [];
      store.appliedGiftCode = null;
      persistState();
      updateHeaderCounters();
      renderBag();
    });
  }

  if (btnCheckoutWsp) {
    btnCheckoutWsp.addEventListener('click', () => {
      if (store.bag.length === 0) return;
      const user = getActiveUser();
      const subtotalC = store.bag.reduce((sum, i) => sum + i.precioC$ * i.qty, 0);
      const matchedGift = store.appliedGiftCode ? findGiftCardByCode(store.appliedGiftCode) : null;
      let discountC = 0;
      if (matchedGift) {
        const rate = store.config.tasaCambio || 36.62;
        const credit = matchedGift.moneda === '$' ? Math.round(matchedGift.monto * rate) : Math.round(matchedGift.monto);
        discountC = Math.min(subtotalC, credit);
      }
      const totalC = Math.max(0, subtotalC - discountC);

      const lines = store.bag.map(
        (item, i) => `${i + 1}. *${item.nombre}* (${item.meta}) x${item.qty} — C$ ${(item.precioC$ * item.qty).toLocaleString('en-US')}`
      );
      const msg = [
        '*NUEVO PEDIDO WEB - YADEMAR BOUTIQUE*',
        user ? `*Cliente:* ${user.nombre} (${user.correo})` : '*Cliente:* Pedido Web',
        '',
        ...lines,
        '',
        `*Subtotal:* C$ ${subtotalC.toLocaleString('en-US')}`,
        matchedGift ? `*Gift Card (${matchedGift.folio}):* -C$ ${discountC.toLocaleString('en-US')}` : '',
        `*Total Estimado:* C$ ${totalC.toLocaleString('en-US')} (~$${Math.round(totalC / (store.config.tasaCambio || 36.62))} USD)`,
        '',
        'Deseo confirmar disponibilidad y forma de entrega.'
      ]
        .filter(Boolean)
        .join('\n');

      if (user) {
        user.pedidos = user.pedidos || [];
        user.pedidos.unshift({
          fecha: new Date().toISOString().slice(0, 10),
          items: store.bag.map(i => ({ id: i.id, nombre: i.nombre, meta: i.meta, qty: i.qty, precio: i.precioC$ })),
          total: totalC
        });
        persistState();
      }

      window.open(`https://wa.me/${store.config.whatsapp || '50589563257'}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  // ==========================================================================
  // 7. CUENTA DE USUARIO (CLIENTE / ADMIN JSON) & EXPORTADOR DE DATOS
  // ==========================================================================
  const accModal = document.getElementById('ydAccountModal');
  const btnOpenAccount = document.getElementById('btnOpenAccount');
  const btnCloseAccount = document.getElementById('btnCloseAccount');
  const authGuestView = document.getElementById('ydAuthGuestView');
  const profileView = document.getElementById('ydProfileView');
  const authTabBtns = document.querySelectorAll('#ydAuthTabs [data-auth-tab]');
  const loginForm = document.getElementById('ydLoginForm');
  const registerForm = document.getElementById('ydRegisterForm');
  const btnLogout = document.getElementById('btnLogout');
  const adminSection = document.getElementById('ydAdminSection');
  const adminAddProdForm = document.getElementById('adminAddProdForm');
  const btnExportStoreJson = document.getElementById('btnExportStoreJson');

  const admProdEditId = document.getElementById('admProdEditId');
  const admFormSubmitBtn = document.getElementById('admFormSubmitBtn');
  const admCancelEditBtn = document.getElementById('admCancelEditBtn');

  function resetAdminForm() {
    if (!adminAddProdForm) return;
    adminAddProdForm.reset();
    if (admProdEditId) admProdEditId.value = '';
    if (admFormSubmitBtn) admFormSubmitBtn.textContent = '+ Agregar al Catálogo';
    if (admCancelEditBtn) admCancelEditBtn.hidden = true;
    const sizesEl = document.getElementById('admProdSizes');
    const badgeEl = document.getElementById('admProdBadge');
    if (sizesEl) sizesEl.value = 'S, M, L';
    if (badgeEl) badgeEl.value = 'Nuevo';
  }

  function openAccountModal(focusAdminForm = false) {
    if (!accModal) return;
    renderAccountModal();
    accModal.classList.add('open');
    setTimeout(() => {
      if (focusAdminForm && isAdminSession()) {
        const nm = document.getElementById('admProdName');
        if (nm) nm.focus();
      } else if (!getActiveUser()) {
        const le = document.getElementById('loginEmail');
        if (le) le.focus();
      }
    }, 60);
  }

  function editProductAsAdmin(prodId) {
    if (!requireAdmin('editar prendas del catálogo')) return;
    const prod = store.productos.find(p => p.id === prodId);
    if (!prod) return;
    if (admProdEditId) admProdEditId.value = prod.id;
    document.getElementById('admProdName').value = prod.nombre;
    document.getElementById('admProdCat').value = prod.categoria;
    document.getElementById('admProdSeason').value = prod.temporada;
    document.getElementById('admProdPrice').value = String(prod.precio);
    document.getElementById('admProdSizes').value = (prod.tallas || []).join(', ');
    document.getElementById('admProdBadge').value = prod.etiqueta || 'Nuevo';
    document.getElementById('admProdImgUrl').value = prod.imagenUrl || '';
    document.getElementById('admProdDesc').value = prod.descripcion || '';
    if (admFormSubmitBtn) admFormSubmitBtn.textContent = 'Guardar Cambios';
    if (admCancelEditBtn) admCancelEditBtn.hidden = false;
    openAccountModal(true);
  }

  function deleteProductAsAdmin(prodId) {
    if (!requireAdmin('eliminar prendas del catálogo')) return;
    const idx = store.productos.findIndex(p => p.id === prodId);
    if (idx === -1) return;
    const removed = store.productos.splice(idx, 1)[0];
    if (!store.deletedProductIds.includes(prodId)) {
      store.deletedProductIds.push(prodId);
    }
    persistState();
    renderCatalog();
    showToast(`Prenda "${removed.nombre}" retirada del catálogo`);
  }

  function exportStoreJson() {
    if (!requireAdmin('exportar el archivo JSON')) return;
    const exportObj = {
      config: { ...store.config, ultimoFolio: store.ultimoFolio },
      temporadas: store.temporadas,
      productos: store.productos,
      usuarios: store.usuarios
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Archivo store-data.json exportado');
  }

  function renderAccountModal() {
    const user = getActiveUser();
    if (!authGuestView || !profileView) return;
    if (!user) {
      authGuestView.hidden = false;
      profileView.hidden = true;
      const folioRoleHint = document.getElementById('gcFolioRoleHint');
      if (folioRoleHint) folioRoleHint.textContent = 'Consecutivo';
      return;
    }

    authGuestView.hidden = true;
    profileView.hidden = false;
    document.getElementById('profAvatar').textContent = (user.nombre || 'Y').trim().charAt(0).toUpperCase();
    document.getElementById('profName').textContent = user.nombre;
    document.getElementById('profEmail').textContent = `${user.correo} • ${user.ciudad || 'Chinandega'}`;
    document.getElementById('profRoleBadge').textContent = user.rol === 'admin' ? 'Admin Boutique' : 'Cliente Frecuente';
    document.getElementById('profFavCount').textContent = String((user.favoritos || []).length);
    document.getElementById('profOrdersCount').textContent = String((user.pedidos || []).length);
    document.getElementById('profGiftsCount').textContent = String((user.giftCards || []).length);

    const folioRoleHint = document.getElementById('gcFolioRoleHint');
    if (folioRoleHint) folioRoleHint.textContent = user.rol === 'admin' ? 'Editable (Admin)' : 'Consecutivo';

    if (adminSection) adminSection.hidden = user.rol !== 'admin';

    const recentList = document.getElementById('profRecentList');
    if (recentList) {
      const entries = [];
      (user.pedidos || []).slice(0, 3).forEach(p => {
        entries.push(`<div class="yd-history-item"><div><strong>Pedido ${escapeHtml(p.fecha)}</strong><span>${p.items.length} artículo(s)</span></div><strong>C$ ${Number(p.total).toLocaleString('en-US')}</strong></div>`);
      });
      (user.giftCards || []).slice(0, 3).forEach(g => {
        entries.push(`<div class="yd-history-item"><div><strong>Gift Card ${escapeHtml(g.folio)}</strong><span>Para: ${escapeHtml(g.para)}</span></div><strong>${escapeHtml(g.moneda)} ${Number(g.monto).toLocaleString('en-US')}</strong></div>`);
      });
      recentList.innerHTML = entries.length > 0 ? entries.join('') : '<p style="font-size:0.82rem; color:var(--yd-slate);">Aún no tienes movimientos registrados en tu cuenta.</p>';
    }
  }

  if (btnOpenAccount) {
    btnOpenAccount.addEventListener('click', () => openAccountModal(false));
  }
  if (btnCloseAccount && accModal) {
    btnCloseAccount.addEventListener('click', () => accModal.classList.remove('open'));
    accModal.addEventListener('click', (e) => {
      if (e.target === accModal) accModal.classList.remove('open');
    });
  }

  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-auth-tab');
      authTabBtns.forEach(b => b.classList.toggle('active', b === btn));
      if (loginForm) loginForm.hidden = mode !== 'login';
      if (registerForm) registerForm.hidden = mode !== 'register';
    });
  });

  document.querySelectorAll('[data-demo-user]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-demo-user') !== 'cliente') return;
      document.getElementById('loginEmail').value = 'cliente@yademar.ni';
      document.getElementById('loginPin').value = '1234';
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pin = document.getElementById('loginPin').value.trim();
      const user = store.usuarios.find(u => u.correo.toLowerCase() === email && String(u.pin) === pin);
      if (!user) {
        showToast('Correo o PIN incorrecto. Verifica tus credenciales.', true);
        return;
      }
      store.activeUserId = user.id;
      persistState();
      applyRoleVisibility();
      renderAccountModal();
      renderGiftHistory();
      showToast(user.rol === 'admin' ? `Sesión Administrador activa (${user.nombre})` : `Bienvenida/o, ${user.nombre}`);
      if (user.rol === 'admin' && accModal) {
        accModal.classList.remove('open');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('regName').value.trim();
      const correo = document.getElementById('regEmail').value.trim().toLowerCase();
      const telefono = document.getElementById('regPhone').value.trim();
      const ciudad = document.getElementById('regCity').value.trim() || 'Chinandega';
      const pin = document.getElementById('regPin').value.trim();
      if (!nombre || !correo || !pin) return;
      if (store.usuarios.some(u => u.correo.toLowerCase() === correo)) {
        showToast('Ya existe una cuenta con ese correo. Inicia sesión.', true);
        return;
      }
      const newUser = {
        id: `U-${Date.now()}`,
        nombre,
        correo,
        pin,
        rol: 'cliente',
        ciudad,
        telefono,
        favoritos: [...store.guestFavorites],
        pedidos: [],
        giftCards: []
      };
      store.usuarios.push(newUser);
      store.activeUserId = newUser.id;
      persistState();
      applyRoleVisibility();
      renderAccountModal();
      showToast(`Cuenta creada para ${nombre}`);
    });
  }

  function performLogout() {
    store.activeUserId = null;
    persistState();
    applyRoleVisibility();
    renderAccountModal();
    showToast('Sesión cerrada');
  }

  if (btnLogout) btnLogout.addEventListener('click', performLogout);
  const btnRibbonLogout = document.getElementById('btnRibbonLogout');
  if (btnRibbonLogout) btnRibbonLogout.addEventListener('click', performLogout);

  const btnRibbonAddProd = document.getElementById('btnRibbonAddProd');
  const btnCatalogAddProd = document.getElementById('btnCatalogAddProd');
  const btnRibbonExportJson = document.getElementById('btnRibbonExportJson');
  const btnCatalogExportJson = document.getElementById('btnCatalogExportJson');
  if (btnRibbonAddProd) btnRibbonAddProd.addEventListener('click', () => { resetAdminForm(); openAccountModal(true); });
  if (btnCatalogAddProd) btnCatalogAddProd.addEventListener('click', () => { resetAdminForm(); openAccountModal(true); });
  if (btnRibbonExportJson) btnRibbonExportJson.addEventListener('click', exportStoreJson);
  if (btnCatalogExportJson) btnCatalogExportJson.addEventListener('click', exportStoreJson);
  if (admCancelEditBtn) admCancelEditBtn.addEventListener('click', resetAdminForm);

  if (adminAddProdForm) {
    adminAddProdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!requireAdmin('agregar o modificar prendas')) return;
      const editId = admProdEditId ? admProdEditId.value.trim() : '';
      const nombre = document.getElementById('admProdName').value.trim();
      const categoria = document.getElementById('admProdCat').value;
      const temporada = document.getElementById('admProdSeason').value;
      const precio = parseFloat(document.getElementById('admProdPrice').value);
      const tallas = document
        .getElementById('admProdSizes')
        .value.split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const etiqueta = document.getElementById('admProdBadge').value.trim() || 'Nuevo';
      const imagenUrl = document.getElementById('admProdImgUrl').value.trim();
      const descripcion = document.getElementById('admProdDesc').value.trim();

      if (!nombre || !precio || !imagenUrl) return;
      if (editId) {
        const target = store.productos.find(p => p.id === editId);
        if (target) {
          target.nombre = nombre;
          target.categoria = categoria;
          target.temporada = temporada;
          target.precio = Math.round(precio);
          target.tallas = tallas.length > 0 ? tallas : ['S', 'M', 'L'];
          target.etiqueta = etiqueta;
          target.imagenUrl = imagenUrl;
          target.descripcion = descripcion;
        }
        showToast(`Prenda "${nombre}" actualizada`);
      } else {
        const newProd = {
          id: `YD-${String(store.productos.length + 1).padStart(2, '0')}`,
          nombre,
          categoria,
          temporada,
          precio: Math.round(precio),
          tallas: tallas.length > 0 ? tallas : ['S', 'M', 'L'],
          colores: [{ nombre: 'Edición Boutique', hex: '#D90429' }],
          etiqueta,
          disponible: true,
          descripcion,
          imagenUrl
        };
        store.productos.unshift(newProd);
        showToast(`Prenda "${nombre}" agregada al catálogo`);
      }

      persistState();
      renderCatalog();
      resetAdminForm();
      if (accModal) accModal.classList.remove('open');
    });
  }

  if (btnExportStoreJson) {
    btnExportStoreJson.addEventListener('click', exportStoreJson);
  }

  // Vista Cliente / Pública para Solicitar Tarjeta de Regalo
  const clientSampleCard = document.getElementById('clientSampleCard');
  const clientThemePills = document.querySelectorAll('#clientThemePills [data-client-theme]');
  const clientAmountChips = document.querySelectorAll('#clientAmountChips [data-client-preset]');
  const clientGiftAmount = document.getElementById('clientGiftAmount');
  const clientGiftTo = document.getElementById('clientGiftTo');
  const clientGiftFrom = document.getElementById('clientGiftFrom');
  const clientSampleAmount = document.getElementById('clientSampleAmount');
  const clientSampleTo = document.getElementById('clientSampleTo');
  const clientSampleFrom = document.getElementById('clientSampleFrom');
  const btnClientRequestGiftWsp = document.getElementById('btnClientRequestGiftWsp');
  const btnClientAddGiftBag = document.getElementById('btnClientAddGiftBag');
  const btnUnlockGiftAdmin = document.getElementById('btnUnlockGiftAdmin');
  const btnFooterAdmin = document.getElementById('btnFooterAdmin');

  let clientGiftTheme = 'crimson';
  const CLIENT_THEME_NAMES = {
    crimson: 'Carmesí Clásico',
    blush: 'Rosa Boutique',
    noir: 'Noir & Oro',
    gold: 'Champagne Dorado'
  };

  function syncClientGiftSample() {
    const rawAmt = parseFloat(clientGiftAmount ? clientGiftAmount.value : '1000');
    const cleanAmt = Number.isFinite(rawAmt) && rawAmt > 0 ? Math.round(rawAmt) : 1000;
    const toVal = (clientGiftTo ? clientGiftTo.value.trim() : '') || 'Persona Especial';
    const fromVal = (clientGiftFrom ? clientGiftFrom.value.trim() : '') || 'Tu Nombre';

    if (clientSampleCard) clientSampleCard.className = `yd-giftcard-live theme-${clientGiftTheme}`;
    if (clientSampleAmount) clientSampleAmount.textContent = `C$ ${cleanAmt.toLocaleString('en-US')}`;
    if (clientSampleTo) clientSampleTo.textContent = toVal;
    if (clientSampleFrom) clientSampleFrom.textContent = fromVal;

    clientAmountChips.forEach(c => {
      c.classList.toggle('active', Number(c.getAttribute('data-client-preset')) === cleanAmt);
    });
  }

  clientThemePills.forEach(pill => {
    pill.addEventListener('click', () => {
      clientThemePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      clientGiftTheme = pill.getAttribute('data-client-theme') || 'crimson';
      syncClientGiftSample();
    });
  });

  clientAmountChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (clientGiftAmount) clientGiftAmount.value = chip.getAttribute('data-client-preset');
      syncClientGiftSample();
    });
  });

  [clientGiftAmount, clientGiftTo, clientGiftFrom].forEach(el => {
    if (el) el.addEventListener('input', syncClientGiftSample);
  });

  if (btnClientRequestGiftWsp) {
    btnClientRequestGiftWsp.addEventListener('click', () => {
      const cleanAmt = Math.max(100, Math.round(parseFloat(clientGiftAmount?.value || '1000') || 1000));
      const toVal = (clientGiftTo?.value.trim()) || 'Por definir';
      const fromVal = (clientGiftFrom?.value.trim()) || 'Por definir';
      const msg = [
        '*SOLICITUD DE TARJETA DE REGALO - YADEMAR*',
        '',
        `*Monto deseado:* C$ ${cleanAmt.toLocaleString('en-US')}`,
        `*Acabado preferido:* ${CLIENT_THEME_NAMES[clientGiftTheme] || 'Carmesí Clásico'}`,
        `*Para:* ${toVal}`,
        `*De parte de:* ${fromVal}`,
        '',
        'Deseo coordinar el pago para que emitan mi Tarjeta de Regalo oficial con folio.'
      ].join('\n');
      window.open(`https://wa.me/${store.config.whatsapp || '50589563257'}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  if (btnClientAddGiftBag) {
    btnClientAddGiftBag.addEventListener('click', () => {
      const cleanAmt = Math.max(100, Math.round(parseFloat(clientGiftAmount?.value || '1000') || 1000));
      const toVal = (clientGiftTo?.value.trim()) || 'Por definir';
      const themeLabel = CLIENT_THEME_NAMES[clientGiftTheme] || 'Carmesí Clásico';
      addToBag({
        type: 'giftcard',
        key: `REQ-GIFT::${cleanAmt}::${toVal}::${clientGiftTheme}`,
        id: 'SOLICITUD-GIFT',
        nombre: 'Solicitud de Gift Card (Emisión en Tienda)',
        meta: `Para: ${toVal} • ${themeLabel}`,
        precioC$: cleanAmt,
        imagenUrl: 'logo.jpg',
        qty: 1
      });
    });
  }

  if (btnUnlockGiftAdmin) btnUnlockGiftAdmin.addEventListener('click', () => openAccountModal(false));
  if (btnFooterAdmin) {
    btnFooterAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      openAccountModal(false);
    });
  }
  syncClientGiftSample();

  // ==========================================================================
  // 8. ESTUDIO COUTURE DE TARJETAS DE REGALO (3 PASOS + 3D + BARCODE + CANVAS HD)
  // ==========================================================================
  const flipper = document.getElementById('ydGcFlipper');
  const frontCard = document.getElementById('ydGiftCardPreview');
  const backCard = document.getElementById('ydGiftCardBack');
  const canvas = document.getElementById('ydGiftCanvas');

  const btnCardFront = document.getElementById('btnCardFront');
  const btnCardBack = document.getElementById('btnCardBack');
  const stepTabs = document.querySelectorAll('#gcStepTabs [data-gc-step]');
  const stepPanes = document.querySelectorAll('.yd-step-pane[data-step-pane]');
  const progressFill = document.getElementById('gcProgressFill');

  const themeMinis = document.querySelectorAll('#gcThemeGrid [data-gc-theme]');
  const currBtns = document.querySelectorAll('[data-gc-curr]');
  const amountInput = document.getElementById('gcAmountInput');
  const amountChipsWrap = document.getElementById('gcAmountChips');
  const toInput = document.getElementById('gcToInput');
  const fromInput = document.getElementById('gcFromInput');
  const occasionPills = document.querySelectorAll('#gcOccasionPills [data-gc-occasion]');
  const messageInput = document.getElementById('gcMessageInput');
  const charCountEl = document.getElementById('gcCharCount');
  const redeemSelect = document.getElementById('gcRedeemSelect');
  const validInput = document.getElementById('gcValidInput');
  const folioInput = document.getElementById('gcFolioInput');
  const btnIncrementFolio = document.getElementById('btnIncrementFolio');

  const gcHistoryToggle = document.getElementById('gcHistoryToggle');
  const gcHistoryList = document.getElementById('gcHistoryList');
  const gcHistoryCount = document.getElementById('gcHistoryCount');

  const btnDownloadPng = document.getElementById('btnDownloadPng');
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  const btnAddGiftToBag = document.getElementById('btnAddGiftToBag');
  const btnSendWspGift = document.getElementById('btnSendWspGift');
  const btnResetGift = document.getElementById('btnResetGift');

  const CURRENCY_PRESETS = {
    'C$': [500, 1000, 1100, 1500, 2000],
    '$': [15, 25, 30, 50, 75]
  };

  let gcState = {
    theme: 'crimson',
    currency: 'C$',
    amount: 1100,
    to: 'Isabella Castro',
    from: 'Zairy Morales',
    occasion: 'DETALLE ESPECIAL',
    redeem: 'Para gastar en la tienda física y Online.',
    valid: '2026-11-30',
    folio: `N°${String(store.ultimoFolio).padStart(4, '0')}`,
    message: 'Disfruta eligiendo tu outfit favorito en Yademar.'
  };

  if (folioInput) folioInput.value = gcState.folio;

  function setGiftStep(stepNum) {
    const s = String(stepNum);
    stepTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-gc-step') === s));
    stepPanes.forEach(p => p.classList.toggle('active', p.getAttribute('data-step-pane') === s));
    if (progressFill) progressFill.style.width = `${(Number(stepNum) / 3) * 100}%`;
  }

  stepTabs.forEach(btn => btn.addEventListener('click', () => setGiftStep(btn.getAttribute('data-gc-step'))));
  document.querySelectorAll('[data-step-goto]').forEach(btn =>
    btn.addEventListener('click', () => setGiftStep(btn.getAttribute('data-step-goto')))
  );
  const gcStepNext = document.getElementById('gcStepNext');
  if (gcStepNext) gcStepNext.addEventListener('click', () => setGiftStep(2));

  function setCardFace(face) {
    if (!flipper) return;
    const isBack = face === 'back';
    flipper.classList.toggle('is-flipped', isBack);
    if (btnCardFront) btnCardFront.classList.toggle('active', !isBack);
    if (btnCardBack) btnCardBack.classList.toggle('active', isBack);
  }
  if (btnCardFront) btnCardFront.addEventListener('click', () => setCardFace('front'));
  if (btnCardBack) btnCardBack.addEventListener('click', () => setCardFace('back'));

  function formatGcAmount(curr, num) {
    const n = Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
    return curr === '$' ? `$${n.toLocaleString('en-US')} USD` : `C$ ${n.toLocaleString('en-US')}`;
  }

  function formatDateDMY(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 'Sin vencimiento';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function computeBarcodePattern(seedText) {
    const str = String(seedText || '0001');
    const bars = [];
    for (let i = 0; i < 38; i++) {
      const ch = str.charCodeAt(i % str.length);
      const val = ((ch * (i + 7)) + i * 13) % 4;
      bars.push({ w: val === 0 ? 4 : val === 1 ? 2 : val === 2 ? 3 : 1.5, gap: val % 2 === 0 ? 3 : 2 });
    }
    return bars;
  }

  function renderBackBarcode(folioText) {
    const svgEl = document.getElementById('gcBackBarcode');
    const codeEl = document.getElementById('gcBackCode');
    const cleanNum = String(folioText || '0001').replace(/[^A-Za-z0-9]/g, '').replace(/^N/, '') || '0001';
    const fullCode = `YDM-${cleanNum}`;
    if (codeEl) codeEl.textContent = fullCode;
    if (!svgEl) return;

    const bars = computeBarcodePattern(fullCode);
    let x = 4;
    const rects = bars
      .map(b => {
        const rect = `<rect x="${x}" y="2" width="${b.w}" height="30" fill="#141216"/>`;
        x += b.w + b.gap;
        return rect;
      })
      .join('');
    svgEl.setAttribute('viewBox', `0 0 ${Math.ceil(x + 4)} 34`);
    svgEl.innerHTML = rects;
  }

  function renderGcPresets() {
    if (!amountChipsWrap) return;
    const list = CURRENCY_PRESETS[gcState.currency] || CURRENCY_PRESETS['C$'];
    amountChipsWrap.innerHTML = list
      .map(val => {
        const label = gcState.currency === '$' ? `$${val}` : `C$ ${val.toLocaleString('en-US')}`;
        const active = Math.round(gcState.amount) === val ? ' active' : '';
        return `<button type="button" class="yd-chip-btn${active}" data-gc-preset="${val}">${label}</button>`;
      })
      .join('');

    amountChipsWrap.querySelectorAll('[data-gc-preset]').forEach(chip => {
      chip.addEventListener('click', () => {
        if (amountInput) amountInput.value = chip.getAttribute('data-gc-preset');
        syncGiftCard();
      });
    });
  }

  function syncGiftCard() {
    const rawAmt = parseFloat(amountInput ? amountInput.value : gcState.amount);
    gcState.amount = Number.isFinite(rawAmt) && rawAmt > 0 ? rawAmt : 0;
    gcState.to = (toInput ? toInput.value.trim() : '') || 'Cliente Especial';
    gcState.from = (fromInput ? fromInput.value.trim() : '') || 'Con cariño';
    gcState.redeem = redeemSelect ? redeemSelect.value : 'Para gastar en la tienda física y Online.';
    gcState.valid = validInput ? validInput.value : '2026-11-30';
    gcState.folio = (folioInput ? folioInput.value.trim() : '') || 'N°0001';
    gcState.message = messageInput ? messageInput.value.trim() : '';

    if (charCountEl && messageInput) {
      charCountEl.textContent = `${messageInput.value.length} / 70`;
    }

    if (frontCard) frontCard.className = `yd-giftcard-live theme-${gcState.theme}`;
    if (backCard) backCard.className = `yd-giftcard-back theme-${gcState.theme}`;

    const amtTxt = formatGcAmount(gcState.currency, gcState.amount);
    const validTxt = formatDateDMY(gcState.valid);

    document.getElementById('gcPreviewOccasion').textContent = gcState.occasion;
    document.getElementById('gcPreviewAmount').textContent = amtTxt;
    document.getElementById('gcPreviewRedeem').textContent = gcState.redeem;
    document.getElementById('gcPreviewTo').textContent = gcState.to;
    document.getElementById('gcPreviewFrom').textContent = gcState.from;
    document.getElementById('gcPreviewValid').textContent = validTxt;
    document.getElementById('gcPreviewFolio').textContent = gcState.folio;

    const msgEl = document.getElementById('gcPreviewMessage');
    if (msgEl) {
      msgEl.textContent = gcState.message;
      msgEl.style.display = gcState.message ? 'block' : 'none';
    }

    document.getElementById('gcBackFolio').textContent = gcState.folio;
    document.getElementById('gcBackAmount').textContent = amtTxt;
    document.getElementById('gcBackValid').textContent = `Vigencia: ${validTxt}`;
    renderBackBarcode(gcState.folio);
    renderGcPresets();
  }

  themeMinis.forEach(btn => {
    btn.addEventListener('click', () => {
      themeMinis.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gcState.theme = btn.getAttribute('data-gc-theme') || 'crimson';
      syncGiftCard();
    });
  });

  currBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-gc-curr') || 'C$';
      if (next === gcState.currency) return;
      currBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gcState.currency = next;
      if (amountInput) amountInput.value = next === '$' ? '30' : '1100';
      syncGiftCard();
    });
  });

  occasionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      occasionPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      gcState.occasion = pill.getAttribute('data-gc-occasion') || 'DETALLE ESPECIAL';
      syncGiftCard();
    });
  });

  document.querySelectorAll('[data-valid-days]').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.getAttribute('data-valid-days'), 10);
      const d = new Date();
      d.setDate(d.getDate() + days);
      if (validInput) validInput.value = d.toISOString().slice(0, 10);
      syncGiftCard();
    });
  });

  [amountInput, toInput, fromInput, messageInput, redeemSelect, validInput, folioInput].forEach(el => {
    if (!el) return;
    el.addEventListener('input', syncGiftCard);
    el.addEventListener('change', syncGiftCard);
  });

  if (btnIncrementFolio && folioInput) {
    btnIncrementFolio.addEventListener('click', () => {
      if (!requireAdmin('incrementar el folio oficial')) return;
      const match = folioInput.value.trim().match(/\d+/);
      const nextNum = match ? parseInt(match[0], 10) + 1 : store.ultimoFolio + 1;
      store.ultimoFolio = nextNum;
      store.config.ultimoFolio = nextNum;
      const padded = `N°${String(nextNum).padStart(4, '0')}`;
      folioInput.value = padded;
      persistState();
      syncGiftCard();
      showToast(`Folio consecutivo: ${padded}`);
    });
  }

  function recordIssuedGiftCard() {
    if (!isAdminSession()) return;
    const targetUser = getActiveUser() || store.usuarios[0];
    if (!targetUser) return;
    targetUser.giftCards = targetUser.giftCards || [];
    const entry = {
      folio: gcState.folio,
      monto: Math.round(gcState.amount),
      moneda: gcState.currency,
      para: gcState.to,
      de: gcState.from,
      motivo: gcState.occasion,
      validoHasta: gcState.valid,
      tema: gcState.theme,
      canje: gcState.redeem,
      mensaje: gcState.message,
      fechaEmision: new Date().toISOString().slice(0, 10)
    };
    const existingIdx = targetUser.giftCards.findIndex(g => g.folio === entry.folio);
    if (existingIdx >= 0) {
      targetUser.giftCards[existingIdx] = entry;
    } else {
      targetUser.giftCards.unshift(entry);
    }
    const m = gcState.folio.match(/\d+/);
    if (m) {
      const num = parseInt(m[0], 10);
      if (num > store.ultimoFolio) store.ultimoFolio = num;
    }
    persistState();
    renderGiftHistory();
    renderAccountModal();
  }

  function renderGiftHistory() {
    const all = getAllIssuedGiftCards();
    if (gcHistoryCount) gcHistoryCount.textContent = String(all.length);
    if (!gcHistoryList) return;

    if (all.length === 0) {
      gcHistoryList.innerHTML = '<p style="font-size:0.78rem; color:var(--yd-slate); margin:4px 0;">Aún no se han emitido tarjetas en esta sesión.</p>';
      return;
    }

    gcHistoryList.innerHTML = all
      .map(
        (g, idx) => `
        <div class="yd-history-item" data-hist-idx="${idx}" title="Clic para recargar esta tarjeta en el estudio">
          <div>
            <strong>${escapeHtml(g.folio)} &bull; ${escapeHtml(g.para)}</strong>
            <span>De: ${escapeHtml(g.de)} &bull; ${escapeHtml(g.motivo || 'DETALLE ESPECIAL')}</span>
          </div>
          <strong>${escapeHtml(g.moneda)} ${Number(g.monto).toLocaleString('en-US')}</strong>
        </div>
      `
      )
      .join('');

    gcHistoryList.querySelectorAll('[data-hist-idx]').forEach(el => {
      el.addEventListener('click', () => {
        const g = all[Number(el.getAttribute('data-hist-idx'))];
        if (!g) return;
        gcState.theme = g.tema || 'crimson';
        gcState.currency = g.moneda || 'C$';
        gcState.occasion = g.motivo || 'DETALLE ESPECIAL';
        if (amountInput) amountInput.value = String(g.monto);
        if (toInput) toInput.value = g.para;
        if (fromInput) fromInput.value = g.de;
        if (validInput && g.validoHasta) validInput.value = g.validoHasta;
        if (folioInput) folioInput.value = g.folio;
        if (redeemSelect && g.canje) redeemSelect.value = g.canje;
        if (messageInput) messageInput.value = g.mensaje || '';

        themeMinis.forEach(b => b.classList.toggle('active', b.getAttribute('data-gc-theme') === gcState.theme));
        currBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-gc-curr') === gcState.currency));
        occasionPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-gc-occasion') === gcState.occasion));

        syncGiftCard();
        showToast(`Tarjeta ${g.folio} cargada en la vista previa`);
      });
    });
  }

  if (gcHistoryToggle && gcHistoryList) {
    gcHistoryToggle.addEventListener('click', () => {
      gcHistoryList.hidden = !gcHistoryList.hidden;
    });
  }

  if (btnResetGift) {
    btnResetGift.addEventListener('click', () => {
      gcState.theme = 'crimson';
      gcState.currency = 'C$';
      gcState.occasion = 'DETALLE ESPECIAL';
      themeMinis.forEach(b => b.classList.toggle('active', b.getAttribute('data-gc-theme') === 'crimson'));
      currBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-gc-curr') === 'C$'));
      occasionPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-gc-occasion') === 'DETALLE ESPECIAL'));
      if (amountInput) amountInput.value = '1100';
      if (toInput) toInput.value = 'Isabella Castro';
      if (fromInput) fromInput.value = 'Zairy Morales';
      if (redeemSelect) redeemSelect.value = 'Para gastar en la tienda física y Online.';
      if (validInput) validInput.value = '2026-11-30';
      if (folioInput) folioInput.value = 'N°0001';
      if (messageInput) messageInput.value = 'Disfruta eligiendo tu outfit favorito en Yademar.';
      syncGiftCard();
      setCardFace('front');
      showToast('Estudio restablecido');
    });
  }

  // Canvas 1800x1125 Couture Export Engine (with filigree, foil gradient & barcode)
  const CANVAS_THEMES = {
    crimson: {
      bgStart: '#FFFFFF', bgMid: '#FDF8F8', bgEnd: '#FFF1F3', glow: 'rgba(217, 4, 41, 0.06)',
      outerFrame: 'rgba(217, 4, 41, 0.45)', innerFrame: 'rgba(197, 155, 71, 0.5)', corner: '#D90429',
      kicker: '#9B0620', title: '#141216', pillBg: '#FFF3F5', pillBorder: 'rgba(217, 4, 41, 0.34)',
      amtGrad: ['#8F031B', '#D90429', '#B8862D'], muted: '#5C5660', rowLine: 'rgba(20, 18, 22, 0.14)',
      value: '#141216', footerBg: 'rgba(20, 18, 22, 0.045)', footerText: '#141216',
      folioBg: '#141216', folioText: '#FFFFFF', isDark: false
    },
    blush: {
      bgStart: '#FFF8FA', bgMid: '#FFEAF1', bgEnd: '#FFDCE8', glow: 'rgba(190, 18, 60, 0.08)',
      outerFrame: 'rgba(185, 28, 68, 0.48)', innerFrame: 'rgba(255, 255, 255, 0.9)', corner: '#9F1239',
      kicker: '#9D174D', title: '#2A1219', pillBg: 'rgba(255, 255, 255, 0.88)', pillBorder: 'rgba(190, 18, 60, 0.34)',
      amtGrad: ['#881337', '#D90429', '#9F1239'], muted: '#6B3B4B', rowLine: 'rgba(159, 18, 57, 0.2)',
      value: '#3A0D1C', footerBg: 'rgba(159, 18, 57, 0.075)', footerText: '#2A1219',
      folioBg: '#9F1239', folioText: '#FFFFFF', isDark: false
    },
    noir: {
      bgStart: '#1D1922', bgMid: '#151218', bgEnd: '#0F0D12', glow: 'rgba(217, 4, 41, 0.2)',
      outerFrame: 'rgba(229, 193, 108, 0.65)', innerFrame: 'rgba(255, 255, 255, 0.18)', corner: '#E5C16C',
      kicker: '#E5C16C', title: '#FFFFFF', pillBg: 'rgba(255, 255, 255, 0.08)', pillBorder: 'rgba(229, 193, 108, 0.55)',
      amtGrad: ['#FCE7A2', '#D4AF37', '#FFF3C4'], muted: '#CBC3CD', rowLine: 'rgba(229, 193, 108, 0.28)',
      value: '#FFFFFF', footerBg: 'rgba(255, 255, 255, 0.07)', footerText: '#FFFFFF',
      folioBg: '#C59B47', folioText: '#141216', isDark: true
    },
    gold: {
      bgStart: '#FFFDF8', bgMid: '#FBF4E3', bgEnd: '#F5E9CB', glow: 'rgba(182, 139, 58, 0.1)',
      outerFrame: 'rgba(182, 139, 58, 0.62)', innerFrame: 'rgba(217, 4, 41, 0.24)', corner: '#92681D',
      kicker: '#92681D', title: '#241D14', pillBg: 'rgba(255, 255, 255, 0.85)', pillBorder: 'rgba(182, 139, 58, 0.5)',
      amtGrad: ['#7A5412', '#B68B3A', '#9E1128'], muted: '#665846', rowLine: 'rgba(146, 104, 29, 0.24)',
      value: '#241D14', footerBg: 'rgba(146, 104, 29, 0.09)', footerText: '#241D14',
      folioBg: '#241D14', folioText: '#FBF4E3', isDark: false
    }
  };

  function roundRect(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function wrapCanvasText(ctx, text, x, y, maxW, lineH, align = 'left') {
    const words = String(text || '').split(/\s+/);
    let line = '';
    let cy = y;
    ctx.textAlign = align;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line, x, cy);
        line = words[i];
        cy += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, cy);
  }

  function fitWidth(ctx, txt, maxW) {
    let s = String(txt || '');
    if (ctx.measureText(s).width <= maxW) return s;
    while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
    return `${s}…`;
  }

  function drawFbIcon(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#1877F2';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${Math.round(r * 1.45)}px "Plus Jakarta Sans", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('f', cx + 0.5, cy + 2);
    ctx.restore();
  }

  function drawIgIcon(ctx, cx, cy, r) {
    ctx.save();
    const s = r * 1.75;
    const g = ctx.createLinearGradient(cx - r, cy + r, cx + r, cy - r);
    g.addColorStop(0, '#F58529');
    g.addColorStop(0.5, '#DD2A7B');
    g.addColorStop(1, '#8134AF');
    ctx.fillStyle = g;
    roundRect(ctx, cx - s / 2, cy - s / 2, s, s, r * 0.45);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(2, r * 0.17);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx + r * 0.48, cy - r * 0.48, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWspIcon(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.42, cy + r * 0.6);
    ctx.lineTo(cx - r * 0.88, cy + r * 0.92);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(2.5, r * 0.22);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx + r * 0.14, cy - r * 0.12, r * 0.56, Math.PI * 0.6, Math.PI * 1.38);
    ctx.stroke();
    ctx.restore();
  }

  function loadLogoImage() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo cargar el logotipo'));
      img.src = window.YADEMAR_LOGO_DATA_URI || 'logo.jpg';
    });
  }

  async function renderGiftCardToCanvas() {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const W = 1800;
    const H = 1125;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const pal = CANVAS_THEMES[gcState.theme] || CANVAS_THEMES.crimson;

    // 1. Background + guilloché lines
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, pal.bgStart);
    bg.addColorStop(0.58, pal.bgMid);
    bg.addColorStop(1, pal.bgEnd);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.strokeStyle = 'rgba(197, 155, 71, 0.045)';
    ctx.lineWidth = 2;
    for (let i = -H; i < W + H; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
    ctx.restore();

    const radial = ctx.createRadialGradient(W * 0.82, H * 0.22, 20, W * 0.82, H * 0.22, 680);
    radial.addColorStop(0, pal.glow);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, W, H);

    // 2. Art-déco double border + corner filigree brackets
    ctx.strokeStyle = pal.outerFrame;
    ctx.lineWidth = 4;
    roundRect(ctx, 36, 36, W - 72, H - 72, 28);
    ctx.stroke();
    ctx.strokeStyle = pal.innerFrame;
    ctx.lineWidth = 2;
    roundRect(ctx, 56, 56, W - 112, H - 112, 20);
    ctx.stroke();

    ctx.strokeStyle = pal.corner;
    ctx.lineWidth = 5;
    const cLen = 46;
    [
      [56, 56, 1, 1],
      [W - 56, 56, -1, 1],
      [56, H - 56, 1, -1],
      [W - 56, H - 56, -1, -1]
    ].forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * cLen);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * cLen, cy);
      ctx.stroke();
    });

    // 3. Header
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = pal.kicker;
    ctx.font = '800 22px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText('BOUTIQUE FÍSICA & TIENDA ONLINE  •  CHINANDEGA', 108, 146);

    ctx.fillStyle = pal.title;
    ctx.font = '700 84px "Playfair Display", Georgia, serif';
    ctx.fillText('TARJETA DE REGALO', 108, 240);

    ctx.font = '800 22px "Plus Jakarta Sans", Arial, sans-serif';
    const occTxt = gcState.occasion.toUpperCase();
    const occW = ctx.measureText(occTxt).width + 54;
    ctx.fillStyle = pal.pillBg;
    ctx.strokeStyle = pal.pillBorder;
    ctx.lineWidth = 2;
    roundRect(ctx, 108, 272, occW, 48, 24);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pal.kicker;
    ctx.textBaseline = 'middle';
    ctx.fillText(occTxt, 135, 297);

    // 4. Logo Crest
    const logoImg = await loadLogoImage();
    const lx = 1525;
    const ly = 226;
    const lr = 148;
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.closePath();
    if (pal.isDark) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#E5C16C';
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(logoImg, lx - lr + 18, ly - lr + 18, (lr - 18) * 2, (lr - 18) * 2);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = pal.outerFrame;
      ctx.stroke();
      ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(logoImg, lx - lr + 10, ly - lr + 10, (lr - 10) * 2, (lr - 10) * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();

    // 5. Left Metallic Foil Amount Section
    const leftX = 108;
    const divX = 720;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = pal.muted;
    ctx.font = '800 22px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText('VALOR OBSEQUIADO', leftX, 468);

    const fmtAmt = formatGcAmount(gcState.currency, gcState.amount);
    let fSize = 114;
    ctx.font = `700 ${fSize}px "Playfair Display", Georgia, serif`;
    while (ctx.measureText(fmtAmt).width > divX - leftX - 42 && fSize > 58) {
      fSize -= 4;
      ctx.font = `700 ${fSize}px "Playfair Display", Georgia, serif`;
    }
    const amtGrad = ctx.createLinearGradient(leftX, 510, divX - 60, 620);
    amtGrad.addColorStop(0, pal.amtGrad[0]);
    amtGrad.addColorStop(0.55, pal.amtGrad[1]);
    amtGrad.addColorStop(1, pal.amtGrad[2]);
    ctx.fillStyle = amtGrad;
    ctx.fillText(fmtAmt, leftX, 590);

    ctx.fillStyle = pal.muted;
    ctx.font = '600 27px "Plus Jakarta Sans", Arial, sans-serif';
    wrapCanvasText(ctx, gcState.redeem, leftX, 668, divX - leftX - 48, 38, 'left');

    ctx.strokeStyle = pal.rowLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(divX, 435);
    ctx.lineTo(divX, 825);
    ctx.stroke();

    // 6. Right Structured Recipient Rows
    const rx = 775;
    const rw = 915;
    [
      { label: 'Para:', val: gcState.to, y: 492 },
      { label: 'De:', val: gcState.from, y: 602 },
      { label: 'Válido hasta:', val: formatDateDMY(gcState.valid), y: 712 }
    ].forEach(r => {
      ctx.textAlign = 'left';
      ctx.fillStyle = pal.muted;
      ctx.font = '700 28px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillText(r.label, rx, r.y);
      const lw = ctx.measureText(r.label).width + 24;
      ctx.font = '700 34px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = pal.value;
      ctx.fillText(fitWidth(ctx, r.val, rw - lw), rx + rw, r.y);
      ctx.strokeStyle = pal.rowLine;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, r.y + 24);
      ctx.lineTo(rx + rw, r.y + 24);
      ctx.stroke();
    });

    if (gcState.message) {
      ctx.textAlign = 'left';
      ctx.fillStyle = pal.muted;
      ctx.font = 'italic 500 27px "Plus Jakarta Sans", Arial, sans-serif';
      wrapCanvasText(ctx, `“${gcState.message}”`, rx, 795, rw, 36, 'left');
    }

    // 7. Footer Bar with Vector Social Icons + Barcode Strip + Folio Pill
    const barX = 108;
    const barY = 928;
    const barW = W - 216;
    const barH = 104;
    ctx.fillStyle = pal.footerBg;
    roundRect(ctx, barX, barY, barW, barH, 18);
    ctx.fill();

    const midY = barY + barH / 2;
    drawFbIcon(ctx, barX + 44, midY, 19);
    ctx.fillStyle = pal.footerText;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '700 23px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText('YADEMAR TIENDA ONLINE', barX + 74, midY + 1);

    drawIgIcon(ctx, barX + 465, midY, 19);
    ctx.fillText('@yademar5', barX + 495, midY + 1);

    drawWspIcon(ctx, barX + 710, midY, 19);
    ctx.fillText('8956-3257', barX + 740, midY + 1);

    // Deterministic barcode strip before Folio Pill
    const cleanNum = String(gcState.folio || '0001').replace(/[^A-Za-z0-9]/g, '').replace(/^N/, '') || '0001';
    const bars = computeBarcodePattern(`YDM-${cleanNum}`);
    const folioTxt = gcState.folio;
    ctx.font = '800 25px "Plus Jakarta Sans", Arial, sans-serif';
    const folioW = Math.max(145, ctx.measureText(folioTxt).width + 48);
    const folioX = barX + barW - folioW - 22;

    const bcPadX = 10;
    const bcBarsW = bars.reduce((s, b) => s + b.w + b.gap, 0);
    const bcBoxW = bcBarsW + bcPadX * 2;
    const bcBoxX = folioX - bcBoxW - 18;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, bcBoxX, barY + 22, bcBoxW, 60, 10);
    ctx.fill();
    let bx = bcBoxX + bcPadX;
    ctx.fillStyle = '#141216';
    bars.forEach(b => {
      ctx.fillRect(bx, barY + 32, b.w, 40);
      bx += b.w + b.gap;
    });

    ctx.fillStyle = pal.folioBg;
    roundRect(ctx, folioX, barY + 21, folioW, 62, 12);
    ctx.fill();
    ctx.fillStyle = pal.folioText;
    ctx.textAlign = 'center';
    ctx.fillText(folioTxt, folioX + folioW / 2, midY + 1);

    return canvas.toDataURL('image/png', 1.0);
  }

  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', async () => {
      if (!requireAdmin('descargar tarjetas oficiales')) return;
      try {
        const dataUrl = await renderGiftCardToCanvas();
        const safeFolio = gcState.folio.replace(/[^a-zA-Z0-9_-]/g, '') || '0001';
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `Tarjeta-Regalo-Yademar-${safeFolio}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        recordIssuedGiftCard();
        showToast(`Tarjeta ${gcState.folio} descargada en PNG HD (1800x1125)`);
      } catch (_) {
        showToast('No se pudo exportar el PNG. Usa "Imprimir / PDF" como respaldo.', true);
      }
    });
  }

  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      if (!requireAdmin('imprimir tarjetas oficiales')) return;
      recordIssuedGiftCard();
      setCardFace('front');
      setTimeout(() => window.print(), 120);
    });
  }

  if (btnAddGiftToBag) {
    btnAddGiftToBag.addEventListener('click', () => {
      if (!requireAdmin('emitir tarjetas oficiales a bolsa')) return;
      recordIssuedGiftCard();
      const rate = store.config.tasaCambio || 36.62;
      const priceC = gcState.currency === '$' ? Math.round(gcState.amount * rate) : Math.round(gcState.amount);
      addToBag({
        type: 'giftcard',
        key: `GIFT::${gcState.folio}`,
        id: gcState.folio,
        nombre: `Tarjeta de Regalo ${gcState.folio}`,
        meta: `Para: ${gcState.to} (${formatGcAmount(gcState.currency, gcState.amount)})`,
        precioC$: priceC,
        imagenUrl: 'logo.jpg',
        qty: 1
      });
    });
  }

  if (btnSendWspGift) {
    btnSendWspGift.addEventListener('click', () => {
      if (!requireAdmin('activar folios oficiales por WhatsApp')) return;
      recordIssuedGiftCard();
      const amtTxt = formatGcAmount(gcState.currency, gcState.amount);
      const validTxt = formatDateDMY(gcState.valid);
      const msg = [
        '*ACTIVACIÓN DE TARJETA DE REGALO - YADEMAR*',
        '',
        `*Folio:* ${gcState.folio}`,
        `*Valor:* ${amtTxt}`,
        `*Para:* ${gcState.to}`,
        `*De:* ${gcState.from}`,
        `*Motivo:* ${gcState.occasion}`,
        `*Válido hasta:* ${validTxt}`,
        `*Canje:* ${gcState.redeem}`,
        gcState.message ? `*Dedicatoria:* ${gcState.message}` : '',
        '',
        'Deseo confirmar el pago y activación de esta Tarjeta de Regalo.'
      ]
        .filter(Boolean)
        .join('\n');

      window.open(`https://wa.me/${store.config.whatsapp || '50589563257'}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  // Initial Renders
  renderSeasons();
  syncCatalogControlsUI();
  applyRoleVisibility();
  renderBag();
  renderGiftHistory();
  syncGiftCard();
});
