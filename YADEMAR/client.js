/* ============================================================
   YADEMAR — Vista Cliente (client.js)
   Conecta index.html con window.YademarStore y Bootstrap 5.3
   Incluye validación obligatoria por visita, control de stock/cantidad,
   bolsa aislada por cliente, confirmación WhatsApp garantizada y a11y
   ============================================================ */

(function () {
  'use strict';

  const Store = window.YademarStore;
  if (!Store) return;

  const ui = {
    category: 'todos',
    season: 'todas',
    search: '',
    sort: 'destacados',
    qvProductId: null,
    qvRenderedProdId: null,
    qvSize: '',
    qvColor: '',
    qvQty: 1,
  };

  let qvModalInstance = null;
  let bagOffcanvasInstance = null;
  let orderConfirmModalInstance = null;

  function $(id) {
    return document.getElementById(id);
  }

  function safeImgHandler(imgEl) {
    if (!imgEl) return;
    imgEl.onerror = function () {
      this.onerror = null;
      this.src = Store.IMG_FALLBACK_SVG;
    };
  }

  function bindPinToggles() {
    document.querySelectorAll('[data-toggle-pin]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = $(btn.dataset.togglePin);
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.toggle('bi-eye', !isPass);
          icon.classList.toggle('bi-eye-slash', isPass);
        }
      });
    });
  }

  function initGlobalInteractions() {
    const nav = $('ydMainNav');
    window.addEventListener(
      'scroll',
      () => {
        if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 18);
      },
      { passive: true }
    );

    // Resaltar sección activa en navbar con IntersectionObserver
    const sectionIds = ['temporadas', 'catalogo', 'tarjeta-regalo', 'como-comprar', 'ubicacion'];
    const navLinks = Array.from(document.querySelectorAll('#ydNavbarCollapse .nav-link'));
    if ('IntersectionObserver' in window && navLinks.length > 0) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach((a) => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
          });
        },
        { rootMargin: '-35% 0px -55% 0px' }
      );
      sectionIds.forEach((id) => {
        const sec = $(id);
        if (sec) obs.observe(sec);
      });
    }

    // Copiar número en escritorio con manejo seguro si portapapeles falla
    document.querySelectorAll('.yd-phone-link').forEach((link) => {
      link.addEventListener('click', () => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (!isMobile && navigator.clipboard && navigator.clipboard.writeText) {
          const phone = link.dataset.phone || '8956-3257';
          navigator.clipboard
            .writeText(phone)
            .then(() => Store.showToast(`Número ${phone} copiado (abriendo WhatsApp)`, 'success'))
            .catch(() => {});
        }
      });
    });

    const collapseEl = $('ydNavbarCollapse');
    if (collapseEl && window.bootstrap) {
      collapseEl.querySelectorAll('.nav-link').forEach((a) => {
        a.addEventListener('click', () => {
          const inst = window.bootstrap.Collapse.getInstance(collapseEl);
          if (inst) inst.hide();
        });
      });
    }

    bindPinToggles();
  }

  function syncCurrencyButtons() {
    const active = Store.getCurrency();
    document.querySelectorAll('.yd-currency-btn').forEach((btn) => {
      const on = btn.dataset.currency === active;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    const rate = (Store.getConfig() && Store.getConfig().tasaCambio) || 36.62;
    const exNote = $('ydExchangeNote');
    if (exNote) {
      exNote.textContent = `Tipo de cambio ref.: C$${rate.toFixed(2)} / US$1`;
      exNote.classList.toggle('d-none', active !== 'USD');
    }
    updateClientSampleCard();
  }

  function bindCurrencySwitchers() {
    document.querySelectorAll('.yd-currency-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        Store.setCurrency(btn.dataset.currency);
        syncCurrencyButtons();
        renderCatalog();
        renderBag();
        if (ui.qvProductId) populateQuickView(ui.qvProductId);
      });
    });
  }

  function renderSeasons() {
    const grid = $('ydSeasonsGrid');
    if (!grid) return;
    const seasons = Store.getSeasons();
    const products = Store.getProducts().filter((p) => p.disponible !== false);

    const heroCount = $('ydHeroSeasonsCount');
    if (heroCount) {
      heroCount.textContent = `${seasons.length} ${seasons.length === 1 ? 'Colección Activa' : 'Colecciones Activas'}`;
    }

    grid.innerHTML = seasons
      .map((s) => {
        const count = products.filter((p) => p.temporada === s.id).length;
        const selected = ui.season === s.id ? 'is-selected' : '';
        return `
          <div class="col">
            <article class="yd-season-card ${selected}" data-season-id="${Store.escapeHtml(s.id)}" tabindex="0" role="button" aria-pressed="${ui.season === s.id}" aria-label="Filtrar temporada ${Store.escapeHtml(s.nombre)}">
              <img src="${Store.escapeHtml(s.imagenUrl)}" alt="${Store.escapeHtml(s.nombre)}" loading="lazy">
              <div class="yd-season-overlay">
                <span class="yd-season-tag">${Store.escapeHtml(s.etiqueta || 'Temporada')}</span>
                <h3 class="h5 font-display fw-bold mb-1">${Store.escapeHtml(s.nombre)}</h3>
                <p class="small opacity-75 mb-2">${Store.escapeHtml(s.subtitulo || '')}</p>
                <span class="small fw-semibold text-warning">${count} ${count === 1 ? 'prenda' : 'prendas'} <i class="bi bi-arrow-right"></i></span>
              </div>
            </article>
          </div>
        `;
      })
      .join('');

    grid.querySelectorAll('img').forEach(safeImgHandler);

    grid.querySelectorAll('.yd-season-card').forEach((card) => {
      const activate = () => {
        const sid = card.dataset.seasonId;
        ui.season = ui.season === sid ? 'todas' : sid;
        renderSeasons();
        renderCatalog();
        const catSection = $('catalogo');
        if (catSection) catSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function getFilteredProducts() {
    const user = Store.getActiveClientUser();
    const favs = user && Array.isArray(user.favoritos) ? user.favoritos : [];
    const term = ui.search.trim().toLowerCase();

    let list = Store.getProducts().filter((p) => p.disponible !== false);

    if (ui.season !== 'todas') {
      list = list.filter((p) => p.temporada === ui.season);
    }

    if (ui.category === 'favoritos') {
      list = list.filter((p) => favs.includes(p.id));
    } else if (ui.category !== 'todos') {
      list = list.filter((p) => p.categoria === ui.category);
    }

    if (term) {
      list = list.filter((p) => {
        const hay = `${p.nombre} ${p.descripcion || ''} ${p.categoria} ${p.etiqueta || ''} ${Store.getSeasonLabel(p.temporada)}`.toLowerCase();
        return hay.includes(term);
      });
    }

    if (ui.sort === 'precio-asc') {
      list.sort((a, b) => a.precio - b.precio);
    } else if (ui.sort === 'precio-desc') {
      list.sort((a, b) => b.precio - a.precio);
    } else if (ui.sort === 'nombre') {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }

    return list;
  }

  function renderCatalog() {
    const grid = $('ydProductsGrid');
    const empty = $('ydEmptyCatalog');
    const countEl = $('ydCatalogCount');
    const favCountEl = $('ydFavCount');
    const seasonBar = $('ydActiveSeasonBar');
    const seasonNameEl = $('ydActiveSeasonName');
    if (!grid) return;

    const user = Store.getActiveClientUser();
    const favs = user && Array.isArray(user.favoritos) ? user.favoritos : [];
    if (favCountEl) favCountEl.textContent = String(favs.length);

    if (seasonBar && seasonNameEl) {
      if (ui.season !== 'todas') {
        seasonBar.classList.remove('d-none');
        seasonBar.classList.add('d-flex');
        seasonNameEl.textContent = Store.getSeasonLabel(ui.season);
      } else {
        seasonBar.classList.add('d-none');
        seasonBar.classList.remove('d-flex');
      }
    }

    const items = getFilteredProducts();
    if (countEl) {
      countEl.textContent = `Mostrando ${items.length} ${items.length === 1 ? 'prenda' : 'prendas'}`;
    }

    if (items.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('d-none');
      return;
    }

    if (empty) empty.classList.add('d-none');

    grid.innerHTML = items
      .map((p) => {
        const isFav = favs.includes(p.id);
        const stock = Number(p.stock) || 0;
        const badgeText = stock <= 0 ? 'Agotado' : p.etiqueta || '';
        const discountPct =
          p.precioAnterior && p.precioAnterior > p.precio
            ? Math.round(((p.precioAnterior - p.precio) / p.precioAnterior) * 100)
            : 0;
        const oldPriceHtml = p.precioAnterior
          ? `<span class="yd-product-oldprice">${Store.formatMoney(p.precioAnterior)}</span>`
          : '';
        const sizesPreview = (p.tallas || [])
          .slice(0, 4)
          .map((t) => `<span class="yd-card-size-pill">${Store.escapeHtml(t)}</span>`)
          .join('');
        const colorsPreview = (p.colores || [])
          .slice(0, 3)
          .map(
            (c) =>
              `<span class="yd-card-dot" style="background:${Store.escapeHtml(c.hex)};" title="${Store.escapeHtml(c.nombre)}"></span>`
          )
          .join('');

        return `
          <div class="col">
            <article class="yd-product-card">
              <div class="yd-product-media">
                <img src="${Store.escapeHtml(p.imagenUrl)}" alt="${Store.escapeHtml(p.nombre)}" loading="lazy" data-open-qv="${Store.escapeHtml(p.id)}" style="cursor:pointer;">
                ${badgeText ? `<span class="yd-product-badge ${stock <= 0 ? 'bg-secondary' : ''}">${Store.escapeHtml(badgeText)}</span>` : ''}
                ${discountPct > 0 && stock > 0 ? `<span class="yd-discount-badge">-${discountPct}%</span>` : ''}
                <button type="button" class="yd-fav-btn ${isFav ? 'is-fav' : ''}" data-toggle-fav="${Store.escapeHtml(p.id)}" aria-pressed="${isFav}" aria-label="${isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
                  <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
              </div>
              <div class="yd-product-body">
                <div class="yd-product-meta">${Store.escapeHtml(p.categoria)} &bull; ${stock > 0 ? `${stock} disponibles` : 'Agotado'}</div>
                <h3 class="yd-product-name">
                  <button type="button" class="yd-product-name-btn" data-open-qv="${Store.escapeHtml(p.id)}">${Store.escapeHtml(p.nombre)}</button>
                </h3>
                <div class="mb-2">
                  <span class="yd-product-price">${Store.formatMoney(p.precio)}</span>
                  ${oldPriceHtml}
                </div>
                <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <div class="d-flex flex-wrap gap-1">${sizesPreview}</div>
                  <div class="d-flex align-items-center gap-1">${colorsPreview}</div>
                </div>
                <div class="mt-auto d-flex gap-2">
                  <button type="button" class="btn btn-sm ${stock > 0 ? 'btn-yd-dark' : 'btn-yd-outline'} flex-fill" data-open-qv="${Store.escapeHtml(p.id)}">
                    ${stock > 0 ? 'Elegir talla y cantidad' : 'Ver detalle'}
                  </button>
                </div>
              </div>
            </article>
          </div>
        `;
      })
      .join('');

    grid.querySelectorAll('img').forEach(safeImgHandler);

    grid.querySelectorAll('[data-open-qv]').forEach((el) => {
      el.addEventListener('click', () => openQuickView(el.dataset.openQv));
    });

    grid.querySelectorAll('[data-toggle-fav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const added = Store.toggleFavorite(btn.dataset.toggleFav);
        renderCatalog();
        renderAccountModal(true);
        Store.showToast(added ? 'Agregado a tus favoritos' : 'Quitado de tus favoritos');
      });
    });
  }

  function bindCatalogControls() {
    document.querySelectorAll('#ydCategoryPills .yd-filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        ui.category = btn.dataset.cat;
        document.querySelectorAll('#ydCategoryPills .yd-filter-pill').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        renderCatalog();
      });
    });

    const searchInput = $('ydSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        ui.search = searchInput.value;
        renderCatalog();
      });
    }

    const sortSelect = $('ydSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        ui.sort = sortSelect.value;
        renderCatalog();
      });
    }

    const resetSeason = () => {
      ui.season = 'todas';
      renderSeasons();
      renderCatalog();
    };

    const btnResetSeason = $('btnResetSeason');
    if (btnResetSeason) btnResetSeason.addEventListener('click', resetSeason);

    const btnClearSeasonFilter = $('btnClearSeasonFilter');
    if (btnClearSeasonFilter) btnClearSeasonFilter.addEventListener('click', resetSeason);

    const btnClearAllFilters = $('btnClearAllFilters');
    if (btnClearAllFilters) {
      btnClearAllFilters.addEventListener('click', () => {
        ui.category = 'todos';
        ui.season = 'todas';
        ui.search = '';
        ui.sort = 'destacados';
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'destacados';
        document.querySelectorAll('#ydCategoryPills .yd-filter-pill').forEach((b) => {
          const on = b.dataset.cat === 'todos';
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        renderSeasons();
        renderCatalog();
      });
    }
  }

  // ---- Modal Vista Rápida (foco estable, stock restante real y edición libre de cantidad) ----
  function getRemainingStock(product) {
    if (!product) return 0;
    const totalStock = Number(product.stock) || 0;
    const inBag = Store.getCartQtyForProduct(product.id);
    return Math.max(0, totalStock - inBag);
  }

  function syncQuickViewQtyButton(product, syncInputValue) {
    const qtyInput = $('qvQtyInput');
    const btnAdd = $('btnQvAddToBag');
    const wspLink = $('btnQvWhatsApp');
    if (!product || !qtyInput || !btnAdd) return;

    const totalStock = Number(product.stock) || 0;
    const remaining = getRemainingStock(product);
    const maxQty = Math.max(1, remaining);

    ui.qvQty = Math.min(maxQty, Math.max(1, parseInt(ui.qvQty, 10) || 1));
    qtyInput.max = String(maxQty);
    if (syncInputValue !== false) {
      qtyInput.value = String(ui.qvQty);
    }

    const canAdd = remaining > 0;
    qtyInput.disabled = !canAdd;
    $('btnQvQtyDec').disabled = !canAdd || ui.qvQty <= 1;
    $('btnQvQtyInc').disabled = !canAdd || ui.qvQty >= maxQty;

    const stockBadge = $('qvStockBadge');
    if (stockBadge) {
      if (totalStock <= 0) {
        stockBadge.textContent = 'Agotado';
        stockBadge.className = 'badge ms-2 text-bg-secondary';
      } else if (remaining <= 0) {
        stockBadge.textContent = `Máx. (${totalStock}) ya en bolsa`;
        stockBadge.className = 'badge ms-2 text-bg-warning text-dark';
      } else {
        stockBadge.textContent = `Disponibles: ${remaining} de ${totalStock} uds`;
        stockBadge.className = 'badge ms-2 text-bg-light border text-dark';
      }
    }

    if (totalStock <= 0) {
      btnAdd.disabled = true;
      btnAdd.innerHTML = `<i class="bi bi-x-circle me-1"></i> Temporalmente Agotado`;
    } else if (remaining <= 0) {
      btnAdd.disabled = true;
      btnAdd.innerHTML = `<i class="bi bi-check2-circle me-1"></i> Ya tienes el máximo en tu Bolsa`;
    } else {
      btnAdd.disabled = false;
      const lineTotal = Store.formatMoney(product.precio * ui.qvQty);
      btnAdd.innerHTML = `<i class="bi bi-bag-plus me-1"></i> Agregar ${ui.qvQty} a mi Bolsa (${lineTotal})`;
    }

    if (wspLink) {
      const msg = `Hola Yademar, me interesa la prenda "${product.nombre}" (${product.id}) — Cantidad: ${ui.qvQty}, Talla: ${ui.qvSize}, Color: ${ui.qvColor} (${Store.formatMoney(product.precio * ui.qvQty)}). ¿Está disponible?`;
      wspLink.href = Store.getWhatsAppUrl(msg);
    }
  }

  function populateQuickView(prodId) {
    const p = Store.getProductById(prodId);
    if (!p) return;

    const productChanged = ui.qvRenderedProdId !== p.id;
    ui.qvProductId = p.id;

    const tallas = Array.isArray(p.tallas) && p.tallas.length > 0 ? p.tallas : ['Única'];
    const colores =
      Array.isArray(p.colores) && p.colores.length > 0
        ? p.colores
        : [{ nombre: 'Estándar', hex: '#141216' }];

    if (!tallas.includes(ui.qvSize)) ui.qvSize = tallas[0];
    if (!colores.some((c) => c.nombre === ui.qvColor)) ui.qvColor = colores[0].nombre;

    if (productChanged) {
      const img = $('qvImg');
      if (img) {
        img.src = p.imagenUrl;
        img.alt = p.nombre;
        safeImgHandler(img);
      }

      $('qvBadge').textContent = p.etiqueta || 'Temporada';
      $('qvMeta').textContent = `${p.categoria.toUpperCase()} • ${Store.getSeasonLabel(p.temporada)}`;
      $('qvTitle').textContent = p.nombre;
      $('qvDesc').textContent = p.descripcion || '';

      const sizesWrap = $('qvSizes');
      sizesWrap.innerHTML = tallas
        .map(
          (t) =>
            `<button type="button" class="yd-size-chip" data-qv-size="${Store.escapeHtml(t)}">${Store.escapeHtml(t)}</button>`
        )
        .join('');
      sizesWrap.querySelectorAll('[data-qv-size]').forEach((b) => {
        b.addEventListener('click', () => {
          ui.qvSize = b.dataset.qvSize;
          populateQuickView(p.id);
        });
      });

      const colorsWrap = $('qvColors');
      colorsWrap.innerHTML = colores
        .map(
          (c) =>
            `<button type="button" class="yd-color-swatch" style="background:${Store.escapeHtml(c.hex)};" title="${Store.escapeHtml(c.nombre)}" data-qv-color="${Store.escapeHtml(c.nombre)}" aria-label="Color ${Store.escapeHtml(c.nombre)}"></button>`
        )
        .join('');
      colorsWrap.querySelectorAll('[data-qv-color]').forEach((b) => {
        b.addEventListener('click', () => {
          ui.qvColor = b.dataset.qvColor;
          populateQuickView(p.id);
        });
      });

      ui.qvRenderedProdId = p.id;
    }

    // Actualizar precios y estados activos sin destruir DOM (mantiene foco de teclado)
    $('qvPrice').textContent = Store.formatMoney(p.precio);
    const oldEl = $('qvOldPrice');
    if (p.precioAnterior) {
      oldEl.textContent = Store.formatMoney(p.precioAnterior);
      oldEl.classList.remove('d-none');
    } else {
      oldEl.classList.add('d-none');
    }

    $('qvSizes')
      .querySelectorAll('[data-qv-size]')
      .forEach((b) => {
        const active = b.dataset.qvSize === ui.qvSize;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

    $('qvColorName').textContent = ui.qvColor;
    $('qvColors')
      .querySelectorAll('[data-qv-color]')
      .forEach((b) => {
        const active = b.dataset.qvColor === ui.qvColor;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

    syncQuickViewQtyButton(p, true);
  }

  function openQuickView(prodId) {
    ui.qvSize = '';
    ui.qvColor = '';
    ui.qvQty = 1;
    ui.qvRenderedProdId = null;
    populateQuickView(prodId);
    const modalEl = $('ydQuickViewModal');
    if (modalEl && window.bootstrap) {
      qvModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      qvModalInstance.show();
    }
  }

  function bindQuickViewActions() {
    const btnDec = $('btnQvQtyDec');
    const btnInc = $('btnQvQtyInc');
    const qtyInput = $('qvQtyInput');

    if (btnDec) {
      btnDec.addEventListener('click', () => {
        const p = Store.getProductById(ui.qvProductId);
        if (!p) return;
        ui.qvQty = Math.max(1, ui.qvQty - 1);
        syncQuickViewQtyButton(p, true);
      });
    }

    if (btnInc) {
      btnInc.addEventListener('click', () => {
        const p = Store.getProductById(ui.qvProductId);
        if (!p) return;
        ui.qvQty = ui.qvQty + 1;
        syncQuickViewQtyButton(p, true);
      });
    }

    if (qtyInput) {
      // Permitir borrar temporalmente al escribir; normalizar en change/blur
      qtyInput.addEventListener('input', () => {
        const p = Store.getProductById(ui.qvProductId);
        if (!p) return;
        const parsed = parseInt(qtyInput.value, 10);
        if (Number.isFinite(parsed) && parsed >= 1) {
          ui.qvQty = parsed;
          syncQuickViewQtyButton(p, false);
        }
      });
      const normalize = () => {
        const p = Store.getProductById(ui.qvProductId);
        if (!p) return;
        ui.qvQty = parseInt(qtyInput.value, 10) || 1;
        syncQuickViewQtyButton(p, true);
      };
      qtyInput.addEventListener('change', normalize);
      qtyInput.addEventListener('blur', normalize);
    }

    const btnAdd = $('btnQvAddToBag');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const p = Store.getProductById(ui.qvProductId);
        if (!p) return;
        ui.qvQty = parseInt(qtyInput.value, 10) || 1;
        const res = Store.addToCart({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          talla: ui.qvSize || 'Única',
          color: ui.qvColor || 'Estándar',
          imagenUrl: p.imagenUrl,
          qty: ui.qvQty,
        });
        if (!res.ok) {
          Store.showToast(res.error, 'error');
          syncQuickViewQtyButton(p, true);
          return;
        }
        renderBag();
        if (qvModalInstance) qvModalInstance.hide();
        Store.showToast(`${ui.qvQty}× "${p.nombre}" agregada(s) a tu bolsa`, 'success');
      });
    }
  }

  // ---- Showcase & Solicitud de Tarjeta de Regalo (Cliente) ----
  function updateClientSampleCard() {
    const amountRaw = Number($('reqGiftAmount').value);
    const amount = Number.isFinite(amountRaw) && amountRaw > 0 ? amountRaw : 1100;
    const para = ($('reqGiftPara').value || '').trim() || 'Tu destinatario';
    const de = ($('reqGiftDe').value || '').trim() || 'Tu nombre';
    const motivo = ($('reqGiftMotivo').value || 'DETALLE ESPECIAL').trim();
    const tema = $('reqGiftTema').value || 'crimson';

    $('sampleAmount').textContent = `C$${Math.round(amount).toLocaleString('en-US')}`;
    $('samplePara').textContent = para;
    $('sampleDe').textContent = de;
    $('sampleMotivo').textContent = motivo;

    // Sincronizar píldoras preset con el valor escrito
    document.querySelectorAll('#samplePresetWrap [data-preset]').forEach((b) => {
      const match = Number(b.dataset.preset) === Math.round(amountRaw);
      b.classList.toggle('is-active', match);
      b.setAttribute('aria-pressed', String(match));
    });

    // Referencia en USD si moneda global está en US$
    const usdRef = $('reqGiftUsdRef');
    if (usdRef) {
      if (Store.getCurrency() === 'USD') {
        usdRef.textContent = `Equivalente aprox.: ${Store.formatMoney(amount, 'USD')}`;
        usdRef.classList.remove('d-none');
      } else {
        usdRef.classList.add('d-none');
      }
    }

    const scene = $('clientSampleCardScene');
    if (scene) {
      scene.classList.remove('yd-gc-theme-crimson', 'yd-gc-theme-blush', 'yd-gc-theme-noir', 'yd-gc-theme-gold');
      scene.classList.add(`yd-gc-theme-${tema}`);
    }
  }

  function bindClientGiftRequest() {
    const form = $('clientGiftRequestForm');
    if (!form) return;

    ['reqGiftAmount', 'reqGiftPara', 'reqGiftDe', 'reqGiftMotivo', 'reqGiftTema', 'reqGiftQty'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('input', updateClientSampleCard);
      if (el) el.addEventListener('change', updateClientSampleCard);
    });

    document.querySelectorAll('#samplePresetWrap [data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $('reqGiftAmount').value = btn.dataset.preset;
        updateClientSampleCard();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const amount = Math.max(200, Number($('reqGiftAmount').value) || 1100);
      const qty = Math.max(1, Math.min(20, parseInt($('reqGiftQty').value, 10) || 1));
      const para = ($('reqGiftPara').value || '').trim();
      const de = ($('reqGiftDe').value || '').trim();
      const motivo = $('reqGiftMotivo').value;
      const temaSelect = $('reqGiftTema');
      const temaLabel = temaSelect.options[temaSelect.selectedIndex].text;

      const msg =
        `Hola Yademar, deseo solicitar ${qty} Tarjeta(s) de Regalo oficial:\n` +
        `• Monto unitario: C$${Math.round(amount).toLocaleString('en-US')}\n` +
        `• Total (${qty} tarjeta/s): C$${Math.round(amount * qty).toLocaleString('en-US')}\n` +
        `• Para: ${para}\n` +
        `• De: ${de}\n` +
        `• Ocasión: ${motivo}\n` +
        `• Acabado: ${temaLabel}\n` +
        `¿Me ayudan a emitirla y confirmarla?`;

      window.open(Store.getWhatsAppUrl(msg), '_blank', 'noopener');
      Store.showToast('Abriendo solicitud de Tarjeta de Regalo en WhatsApp', 'success');
    });

    const btnBagReq = $('btnAddGiftReqToBag');
    if (btnBagReq) {
      btnBagReq.addEventListener('click', () => {
        if (!form.reportValidity()) return;
        const amount = Math.max(200, Number($('reqGiftAmount').value) || 1100);
        const qty = Math.max(1, Math.min(20, parseInt($('reqGiftQty').value, 10) || 1));
        const para = ($('reqGiftPara').value || '').trim();
        const de = ($('reqGiftDe').value || '').trim();
        const tema = $('reqGiftTema').value;

        Store.addToCart({
          id: `GIFT-REQ-${Date.now().toString().slice(-4)}`,
          nombre: `Solicitud Tarjeta de Regalo (Para: ${para})`,
          precio: amount,
          talla: `Diseño ${tema}`,
          color: `De: ${de}`,
          imagenUrl: 'logo.jpg',
          qty: qty,
          esGiftCardSolicitud: true,
        });
        renderBag();
        const offEl = $('ydBagOffcanvas');
        if (offEl && window.bootstrap) {
          bagOffcanvasInstance = window.bootstrap.Offcanvas.getOrCreateInstance(offEl);
          bagOffcanvasInstance.show();
        }
        Store.showToast(`${qty} solicitud(es) de Tarjeta de Regalo añadida(s) a tu bolsa`, 'success');
      });
    }

    updateClientSampleCard();
  }

  // ---- Bolsa de Compras Offcanvas + Checkout + Modal Confirmación ----
  function syncDeliveryAddressRequirement() {
    const sel = $('bagDeliveryType');
    const addrIn = $('bagDeliveryAddress');
    const addrLabel = $('bagDeliveryAddressLabel');
    if (!sel || !addrIn || !addrLabel) return;

    const isPickup = sel.value === 'Retiro en tienda';
    addrIn.required = !isPickup;
    addrLabel.textContent = isPickup ? 'Ref. (opcional)' : 'Dirección de entrega *';
    addrIn.placeholder = isPickup ? 'Opcional en retiro' : 'Barrio, dirección exacta...';
  }

  function computeBagTotals() {
    const cart = Store.getCart();
    const subtotalNio = cart.reduce((sum, item) => sum + item.precio * item.qty, 0);
    const gc = Store.getAppliedGiftCard();
    const gcAvailNio = gc ? Store.getGiftCardAvailableNio(gc) : 0;
    const discountNio = Math.min(subtotalNio, gcAvailNio);
    const totalNio = Math.max(0, subtotalNio - discountNio);
    return { subtotalNio, discountNio, totalNio, gc, gcAvailNio };
  }

  function safeFillField(id, value) {
    const el = $(id);
    if (!el) return;
    if (document.activeElement === el || el.dataset.dirty === '1') return;
    el.value = value || '';
  }

  function prefillBagCheckoutFields() {
    const user = Store.getActiveClientUser();
    if (!user) return;
    safeFillField('bagClientName', user.nombre || '');
    safeFillField('bagClientPhone', user.telefono || '');
    safeFillField('bagDeliveryAddress', user.direccion || user.ciudad || '');
  }

  function renderBag() {
    const cart = Store.getCart();
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    const badge = $('navBagCount');
    if (badge) badge.textContent = String(totalQty);

    const listEl = $('ydBagItems');
    const footerEl = $('ydBagFooter');
    if (!listEl) return;

    if (cart.length === 0) {
      if (footerEl) footerEl.classList.add('d-none');
      listEl.innerHTML = `
        <div class="text-center py-5 my-auto text-muted">
          <i class="bi bi-bag fs-1 d-block mb-2 opacity-50"></i>
          <div class="fw-semibold text-dark mb-1">Tu bolsa está vacía</div>
          <p class="small mb-3">Agrega prendas del catálogo o una solicitud de Tarjeta de Regalo.</p>
          <a href="#catalogo" class="btn btn-sm btn-yd-dark" id="btnBagExplore">Explorar Catálogo</a>
        </div>
      `;
      const expBtn = $('btnBagExplore');
      if (expBtn) {
        expBtn.addEventListener('click', () => {
          const offEl = $('ydBagOffcanvas');
          if (offEl && window.bootstrap) {
            const inst = window.bootstrap.Offcanvas.getInstance(offEl);
            if (inst) inst.hide();
          }
        });
      }
      return;
    }

    if (footerEl) footerEl.classList.remove('d-none');

    listEl.innerHTML = cart
      .map(
        (item) => `
        <div class="d-flex gap-3 p-2 rounded-3 border bg-white align-items-center">
          <img src="${Store.escapeHtml(item.imagenUrl)}" alt="${Store.escapeHtml(item.nombre)}" class="yd-admin-thumb flex-shrink-0">
          <div class="flex-grow-1 min-w-0">
            <div class="fw-semibold small text-truncate">${Store.escapeHtml(item.nombre)}</div>
            <div class="text-muted" style="font-size:0.75rem;">${Store.escapeHtml(item.talla)} &bull; ${Store.escapeHtml(item.color)}</div>
            <div class="fw-bold text-danger small mt-1">${Store.formatMoney(item.precio * item.qty)}</div>
          </div>
          <div class="d-flex flex-column align-items-end gap-1">
            <button type="button" class="btn btn-sm p-0 text-muted border-0" data-bag-remove="${Store.escapeHtml(item.key)}" aria-label="Eliminar ${Store.escapeHtml(item.nombre)}">
              <i class="bi bi-trash3"></i>
            </button>
            <div class="btn-group btn-group-sm" role="group" aria-label="Cantidad">
              <button type="button" class="btn btn-outline-secondary py-0 px-2" data-bag-dec="${Store.escapeHtml(item.key)}" aria-label="Disminuir">−</button>
              <span class="btn btn-outline-secondary py-0 px-2 disabled text-dark fw-bold">${item.qty}</span>
              <button type="button" class="btn btn-outline-secondary py-0 px-2" data-bag-inc="${Store.escapeHtml(item.key)}" aria-label="Aumentar">+</button>
            </div>
          </div>
        </div>
      `
      )
      .join('');

    listEl.querySelectorAll('img').forEach(safeImgHandler);
    listEl.querySelectorAll('[data-bag-inc]').forEach((b) =>
      b.addEventListener('click', () => {
        const res = Store.updateCartQty(b.dataset.bagInc, 1);
        if (res && !res.ok && res.error) Store.showToast(res.error, 'error');
        renderBag();
      })
    );
    listEl.querySelectorAll('[data-bag-dec]').forEach((b) =>
      b.addEventListener('click', () => {
        Store.updateCartQty(b.dataset.bagDec, -1);
        renderBag();
      })
    );
    listEl.querySelectorAll('[data-bag-remove]').forEach((b) =>
      b.addEventListener('click', () => {
        Store.removeFromCart(b.dataset.bagRemove);
        renderBag();
      })
    );

    const { subtotalNio, discountNio, totalNio, gc } = computeBagTotals();
    $('bagSubtotal').textContent = Store.formatMoney(subtotalNio);
    $('bagTotal').textContent = Store.formatMoney(totalNio);

    const discRow = $('bagDiscountRow');
    const appliedMsg = $('bagGiftAppliedMsg');
    if (gc) {
      discRow.classList.remove('d-none');
      $('bagDiscountFolio').textContent = gc.folio;
      $('bagDiscountVal').textContent = `-${Store.formatMoney(discountNio)}`;
      const saldoDisplay = Store.formatRawAmount(
        typeof gc.saldoRestante === 'number' ? gc.saldoRestante : gc.monto,
        gc.moneda
      );
      appliedMsg.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>Folio ${Store.escapeHtml(gc.folio)} válido (Saldo: ${Store.escapeHtml(saldoDisplay)}) <button type="button" class="btn btn-link btn-sm p-0 ms-1 text-danger" id="btnRemoveBagGift">Quitar</button>`;
      appliedMsg.classList.remove('d-none');
      const remBtn = $('btnRemoveBagGift');
      if (remBtn) {
        remBtn.addEventListener('click', () => {
          Store.clearAppliedGiftCard();
          renderBag();
        });
      }
    } else {
      discRow.classList.add('d-none');
      appliedMsg.classList.add('d-none');
    }

    syncDeliveryAddressRequirement();
    prefillBagCheckoutFields();
  }

  function bindBagActions() {
    ['bagClientName', 'bagClientPhone', 'bagDeliveryAddress'].forEach((id) => {
      const el = $(id);
      if (el) {
        el.addEventListener('input', () => {
          el.dataset.dirty = '1';
        });
      }
    });

    const delType = $('bagDeliveryType');
    if (delType) delType.addEventListener('change', syncDeliveryAddressRequirement);

    const applyGift = () => {
      const input = $('bagGiftCodeInput');
      const errEl = $('bagGiftErrorMsg');
      errEl.classList.add('d-none');
      const res = Store.applyGiftCardCode(input.value);
      if (!res.ok) {
        errEl.textContent = res.error;
        errEl.classList.remove('d-none');
        return;
      }
      input.value = '';
      renderBag();
      Store.showToast(`Folio ${res.card.folio} aplicado a tu bolsa`, 'success');
    };

    const btnApply = $('btnApplyBagGift');
    if (btnApply) btnApply.addEventListener('click', applyGift);

    const giftInput = $('bagGiftCodeInput');
    if (giftInput) {
      giftInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyGift();
        }
      });
    }

    const btnClear = $('btnClearBag');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (Store.getCart().length === 0) return;
        Store.clearCart();
        renderBag();
        Store.showToast('Bolsa vaciada');
      });
    }

    const checkoutForm = $('bagCheckoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cart = Store.getCart();
        if (cart.length === 0) {
          Store.showToast('Agrega al menos una prenda antes de enviar tu pedido', 'error');
          return;
        }
        if (!checkoutForm.reportValidity()) return;

        const clienteNombre = ($('bagClientName').value || '').trim();
        const clienteTelefono = ($('bagClientPhone').value || '').trim();
        const entregaTipo = $('bagDeliveryType').value;
        const direccionEntrega = ($('bagDeliveryAddress').value || '').trim();
        const notas = ($('bagOrderNotes').value || '').trim();

        const cartSnapshot = cart.slice();
        const gc = Store.getAppliedGiftCard();

        const res = Store.recordOrder({
          items: cartSnapshot,
          giftCardFolio: gc ? gc.folio : null,
          clienteNombre,
          clienteTelefono,
          entregaTipo,
          direccionEntrega,
          notas,
          clearCartAfter: true,
        });

        if (!res || !res.ok || !res.order) {
          Store.showToast((res && res.error) || 'No se pudo registrar el pedido.', 'error');
          renderCatalog();
          renderBag();
          return;
        }

        const order = res.order;
        const lines = order.items.map(
          (i) => `• ${i.qty}x ${i.nombre} (${i.talla}, ${i.color}) — ${Store.formatMoney(i.precio * i.qty)}`
        );

        let msg = `Hola Yademar, deseo confirmar mi pedido ${order.id}:\n`;
        msg += `Cliente: ${order.clienteNombre} (${order.clienteTelefono})\n`;
        msg += `Entrega: ${order.entregaTipo}${order.direccionEntrega ? ` — ${order.direccionEntrega}` : ''}\n`;
        if (order.notas) msg += `Notas: ${order.notas}\n`;
        msg += `\n${lines.join('\n')}\n`;
        msg += `\nSubtotal: ${Store.formatMoney(order.subtotalNio)}`;
        if (order.giftCardFolio && order.descuentoGiftCardNio > 0) {
          msg += `\nCrédito Gift Card (${order.giftCardFolio}): -${Store.formatMoney(order.descuentoGiftCardNio)}`;
        }
        msg += `\nTotal estimado: ${Store.formatMoney(order.totalNio)}`;

        const wspUrl = Store.getWhatsAppUrl(msg);

        $('bagOrderNotes').value = '';
        renderCatalog();
        renderBag();
        renderAccountModal(true);

        // Cerrar offcanvas y mostrar modal de confirmación con respaldo garantizado de WhatsApp
        const offEl = $('ydBagOffcanvas');
        if (offEl && window.bootstrap) {
          const inst = window.bootstrap.Offcanvas.getInstance(offEl);
          if (inst) inst.hide();
        }

        $('orderConfirmTitle').textContent = `Pedido ${order.id} confirmado`;
        $('orderConfirmSummary').innerHTML = `
          <div class="d-flex justify-content-between mb-1"><span>Cliente:</span><strong>${Store.escapeHtml(order.clienteNombre)}</strong></div>
          <div class="d-flex justify-content-between mb-1"><span>Entrega:</span><strong>${Store.escapeHtml(order.entregaTipo)}</strong></div>
          <div class="d-flex justify-content-between mb-1"><span>Artículos:</span><strong>${order.items.reduce((s, it) => s + it.qty, 0)} ud(s)</strong></div>
          ${order.giftCardFolio ? `<div class="d-flex justify-content-between mb-1 text-success"><span>Gift Card (${Store.escapeHtml(order.giftCardFolio)}):</span><strong>-${Store.formatMoney(order.descuentoGiftCardNio)}</strong></div>` : ''}
          <div class="d-flex justify-content-between pt-2 mt-2 border-top fs-6"><span>Total:</span><strong class="text-danger">${Store.formatMoney(order.totalNio)}</strong></div>
        `;
        $('btnConfirmOpenWsp').href = wspUrl;

        const confModalEl = $('ydOrderConfirmModal');
        if (confModalEl && window.bootstrap) {
          orderConfirmModalInstance = window.bootstrap.Modal.getOrCreateInstance(confModalEl);
          orderConfirmModalInstance.show();
        }

        window.open(wspUrl, '_blank', 'noopener');
        Store.showToast(`Pedido ${order.id} registrado correctamente`, 'success');
      });
    }
  }

  // ---- Modal Cuenta Cliente ----
  function renderAccountModal(preserveActiveInputs) {
    const user = Store.getActiveClientUser();
    if (!user) return;

    const firstName = String(user.nombre || 'Cliente').split(' ')[0];
    const navLabel = $('navUserLabel');
    if (navLabel) navLabel.textContent = firstName;

    $('accActiveName').textContent = user.nombre;
    $('accActiveEmail').textContent = user.correo;
    $('accStatFavs').textContent = String((user.favoritos || []).length);
    $('accStatOrders').textContent = String((user.pedidos || []).length);

    if (!preserveActiveInputs) {
      ['profName', 'profPhone', 'profCity', 'profAddress', 'bagClientName', 'bagClientPhone', 'bagDeliveryAddress'].forEach((id) => {
        const el = $(id);
        if (el) delete el.dataset.dirty;
      });
    }

    safeFillField('profName', user.nombre || '');
    safeFillField('profPhone', user.telefono || '');
    safeFillField('profCity', user.ciudad || 'Chinandega');
    safeFillField('profAddress', user.direccion || '');

    prefillBagCheckoutFields();

    const ordersList = $('accOrdersList');
    if (!ordersList) return;
    const pedidos = user.pedidos || [];
    if (pedidos.length === 0) {
      ordersList.innerHTML = `<div class="text-center py-4 text-muted small">Aún no has enviado pedidos desde esta cuenta.</div>`;
    } else {
      ordersList.innerHTML = pedidos
        .slice(0, 6)
        .map((o) => {
          const totalItems = (o.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0);
          return `
            <div class="p-2 px-3 rounded-3 border bg-white small">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong class="text-dark">${Store.escapeHtml(o.id)}</strong>
                <span class="badge ${o.estado === 'Cancelado' ? 'text-bg-secondary' : 'text-bg-success'} rounded-pill">${Store.escapeHtml(o.estado || 'Enviado')}</span>
              </div>
              <div class="text-muted">${Store.formatDateDMY(o.fecha)} &bull; ${totalItems} ud(s) &bull; ${Store.escapeHtml(o.entregaTipo || 'Tienda')}</div>
              <div class="fw-bold text-danger mt-1">Total: ${Store.formatMoney(o.totalNio)}</div>
            </div>
          `;
        })
        .join('');
    }
  }

  function bindAccountForms() {
    ['profName', 'profPhone', 'profCity', 'profAddress'].forEach((id) => {
      const el = $(id);
      if (el) {
        el.addEventListener('input', () => {
          el.dataset.dirty = '1';
        });
      }
    });

    const profForm = $('clientProfileForm');
    if (profForm) {
      profForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('cliProfileError');
        const ok = $('cliProfileSuccess');
        err.classList.add('d-none');
        ok.classList.add('d-none');

        const res = Store.updateActiveClientProfile({
          nombre: $('profName').value,
          telefono: $('profPhone').value,
          ciudad: $('profCity').value,
          direccion: $('profAddress').value,
        });

        if (!res.ok) {
          err.textContent = res.error;
          err.classList.remove('d-none');
          return;
        }

        renderAccountModal(false);
        ok.textContent = 'Tus datos de cliente fueron actualizados correctamente.';
        ok.classList.remove('d-none');
        Store.showToast('Datos de cliente guardados', 'success');
      });
    }

    const loginForm = $('clientLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('cliLoginError');
        err.classList.add('d-none');
        const idVal = $('cliLoginId').value;
        const pinVal = $('cliLoginPin').value;
        const res = Store.loginClient(idVal, pinVal);
        if (!res.ok) {
          err.textContent = res.error;
          err.classList.remove('d-none');
          return;
        }
        if (res.isAdmin) {
          window.location.href = 'admin.html';
          return;
        }
        loginForm.reset();
        renderAccountModal(false);
        renderCatalog();
        renderBag();
        const ordersTabBtn = $('btnTabCliOrders');
        if (ordersTabBtn && window.bootstrap) {
          window.bootstrap.Tab.getOrCreateInstance(ordersTabBtn).show();
        }
        Store.showToast(`Sesión iniciada como ${res.user.nombre}`, 'success');
      });
    }

    const btnLogout = $('btnClientLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        const doLogout = () => {
          Store.logoutClient();
          syncClientAccessGate();
          Store.showToast('Sesión cerrada. Valida tu usuario para volver a ingresar.');
        };
        const accModal = $('ydAccountModal');
        if (accModal && window.bootstrap) {
          const inst = window.bootstrap.Modal.getInstance(accModal);
          if (inst && accModal.classList.contains('show')) {
            accModal.addEventListener('hidden.bs.modal', doLogout, { once: true });
            inst.hide();
            return;
          }
        }
        doLogout();
      });
    }

    const regForm = $('clientRegisterForm');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('cliRegError');
        const ok = $('cliRegSuccess');
        err.classList.add('d-none');
        ok.classList.add('d-none');

        const res = Store.registerClientUser({
          nombre: $('regName').value,
          correo: $('regEmail').value,
          telefono: $('regPhone').value,
          ciudad: $('regCity').value,
          direccion: $('regAddress').value,
          pin: $('regPin').value,
        });

        if (!res.ok) {
          err.textContent = res.error;
          err.classList.remove('d-none');
          return;
        }

        regForm.reset();
        if ($('regCity')) $('regCity').value = 'Chinandega';
        renderAccountModal(false);
        renderCatalog();
        renderBag();
        ok.textContent = `¡Cuenta creada! Sesión activa como ${res.user.nombre} (${res.user.correo}).`;
        ok.classList.remove('d-none');
        Store.showToast(`Cliente "${res.user.nombre}" registrado correctamente`, 'success');
      });
    }
  }

  // ---- Puerta de Validación Obligatoria en Cada Acceso ----
  function syncClientAccessGate() {
    const gate = $('ydUserAccessGate');
    const app = $('ydClientApp');
    if (!gate || !app) return;

    if (Store.isClientAuthenticated()) {
      gate.classList.add('d-none');
      app.classList.remove('d-none');
      syncCurrencyButtons();
      renderSeasons();
      renderCatalog();
      renderBag();
      renderAccountModal(false);
    } else {
      app.classList.add('d-none');
      gate.classList.remove('d-none');
      const idInput = $('gateLoginId');
      if (idInput) idInput.focus();
    }
  }

  function bindAccessGateForms() {
    const gateLoginForm = $('gateLoginForm');
    if (gateLoginForm) {
      gateLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('gateLoginError');
        err.classList.add('d-none');
        const idVal = $('gateLoginId').value;
        const pinVal = $('gateLoginPin').value;

        const res = Store.loginClient(idVal, pinVal);
        if (!res.ok) {
          err.textContent = res.error;
          err.classList.remove('d-none');
          return;
        }

        gateLoginForm.reset();
        if (res.isAdmin) {
          window.location.href = 'admin.html';
          return;
        }

        syncClientAccessGate();
        Store.showToast(`Bienvenido(a), ${res.user.nombre}`, 'success');
      });
    }

    const gateRegForm = $('gateRegisterForm');
    if (gateRegForm) {
      gateRegForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('gateRegError');
        err.classList.add('d-none');

        const res = Store.registerClientUser({
          nombre: $('gateRegName').value,
          correo: $('gateRegEmail').value,
          telefono: $('gateRegPhone').value,
          ciudad: $('gateRegCity').value,
          direccion: $('gateRegAddress').value,
          pin: $('gateRegPin').value,
        });

        if (!res.ok) {
          err.textContent = res.error;
          err.classList.remove('d-none');
          return;
        }

        gateRegForm.reset();
        if ($('gateRegCity')) $('gateRegCity').value = 'Chinandega';
        syncClientAccessGate();
        Store.showToast(`¡Cuenta creada! Bienvenido(a), ${res.user.nombre}`, 'success');
      });
    }
  }

  async function boot() {
    await Store.initStore();

    const cfg = Store.getConfig();
    const heroImg = $('ydHeroImg');
    if (heroImg && cfg.heroImagenUrl) {
      heroImg.src = cfg.heroImagenUrl;
      safeImgHandler(heroImg);
    }

    initGlobalInteractions();
    bindAccessGateForms();
    bindCurrencySwitchers();
    bindCatalogControls();
    bindQuickViewActions();
    bindClientGiftRequest();
    bindBagActions();
    bindAccountForms();

    syncClientAccessGate();

    Store.subscribeExternalSync(() => {
      if (Store.isClientAuthenticated()) {
        syncCurrencyButtons();
        renderSeasons();
        renderCatalog();
        renderBag();
        renderAccountModal(true);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
