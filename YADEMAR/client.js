/* ============================================================
   YADEMAR — Vista Cliente (client.js)
   Conecta index.html con window.YademarStore y Bootstrap 5.3
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
    qvSize: '',
    qvColor: '',
  };

  let qvModalInstance = null;
  let bagOffcanvasInstance = null;

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

  // ---- Navbar scroll shadow & desktop tel copy ----
  function initGlobalInteractions() {
    const nav = $('ydMainNav');
    window.addEventListener(
      'scroll',
      () => {
        if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 18);
      },
      { passive: true }
    );

    // En escritorio copiar teléfono al portapapeles
    document.querySelectorAll('.yd-phone-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (!isMobile && navigator.clipboard) {
          e.preventDefault();
          const phone = link.dataset.phone || '8956-3257';
          navigator.clipboard.writeText(phone).then(() => {
            Store.showToast(`Número ${phone} copiado al portapapeles`, 'success');
          });
        }
      });
    });

    // Cerrar menú collapse en móvil al hacer clic en un enlace
    const collapseEl = $('ydNavbarCollapse');
    if (collapseEl && window.bootstrap) {
      collapseEl.querySelectorAll('.nav-link').forEach((a) => {
        a.addEventListener('click', () => {
          const inst = window.bootstrap.Collapse.getInstance(collapseEl);
          if (inst) inst.hide();
        });
      });
    }
  }

  // ---- Moneda Global ----
  function syncCurrencyButtons() {
    const active = Store.getCurrency();
    document.querySelectorAll('.yd-currency-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.currency === active);
    });
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

  // ---- Temporadas ----
  function renderSeasons() {
    const grid = $('ydSeasonsGrid');
    if (!grid) return;
    const seasons = Store.getSeasons();
    const products = Store.getProducts().filter((p) => p.disponible !== false);

    grid.innerHTML = seasons
      .map((s) => {
        const count = products.filter((p) => p.temporada === s.id).length;
        const selected = ui.season === s.id ? 'is-selected' : '';
        return `
          <div class="col">
            <article class="yd-season-card ${selected}" data-season-id="${Store.escapeHtml(s.id)}" tabindex="0" role="button" aria-label="Filtrar temporada ${Store.escapeHtml(s.nombre)}">
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

  // ---- Catálogo Cliente ----
  function getFilteredProducts() {
    const user = Store.getActiveClientUser();
    const favs = (user && Array.isArray(user.favoritos)) ? user.favoritos : [];
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
    const favs = (user && Array.isArray(user.favoritos)) ? user.favoritos : [];
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
        const oldPriceHtml = p.precioAnterior
          ? `<span class="yd-product-oldprice">${Store.formatMoney(p.precioAnterior)}</span>`
          : '';
        return `
          <div class="col">
            <article class="yd-product-card">
              <div class="yd-product-media">
                <img src="${Store.escapeHtml(p.imagenUrl)}" alt="${Store.escapeHtml(p.nombre)}" loading="lazy" data-open-qv="${Store.escapeHtml(p.id)}" style="cursor:pointer;">
                ${p.etiqueta ? `<span class="yd-product-badge">${Store.escapeHtml(p.etiqueta)}</span>` : ''}
                <button type="button" class="yd-fav-btn ${isFav ? 'is-fav' : ''}" data-toggle-fav="${Store.escapeHtml(p.id)}" aria-label="Guardar en favoritos">
                  <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
              </div>
              <div class="yd-product-body">
                <div class="yd-product-meta">${Store.escapeHtml(p.categoria)} &bull; ${Store.escapeHtml(Store.getSeasonLabel(p.temporada))}</div>
                <h3 class="yd-product-name">${Store.escapeHtml(p.nombre)}</h3>
                <div class="mb-3">
                  <span class="yd-product-price">${Store.formatMoney(p.precio)}</span>
                  ${oldPriceHtml}
                </div>
                <div class="mt-auto d-flex gap-2">
                  <button type="button" class="btn btn-sm btn-yd-dark flex-fill" data-open-qv="${Store.escapeHtml(p.id)}">
                    Ver y elegir talla
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
        renderAccountModal();
        Store.showToast(added ? 'Agregado a tus favoritos' : 'Quitado de tus favoritos');
      });
    });
  }

  function bindCatalogControls() {
    document.querySelectorAll('#ydCategoryPills .yd-filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        ui.category = btn.dataset.cat;
        document.querySelectorAll('#ydCategoryPills .yd-filter-pill').forEach((b) =>
          b.classList.toggle('is-active', b === btn)
        );
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
        document.querySelectorAll('#ydCategoryPills .yd-filter-pill').forEach((b) =>
          b.classList.toggle('is-active', b.dataset.cat === 'todos')
        );
        renderSeasons();
        renderCatalog();
      });
    }
  }

  // ---- Modal Vista Rápida ----
  function populateQuickView(prodId) {
    const p = Store.getProductById(prodId);
    if (!p) return;

    ui.qvProductId = p.id;
    const tallas = Array.isArray(p.tallas) && p.tallas.length > 0 ? p.tallas : ['Única'];
    const colores =
      Array.isArray(p.colores) && p.colores.length > 0
        ? p.colores
        : [{ nombre: 'Estándar', hex: '#141216' }];

    if (!tallas.includes(ui.qvSize)) ui.qvSize = tallas[0];
    if (!colores.some((c) => c.nombre === ui.qvColor)) ui.qvColor = colores[0].nombre;

    const img = $('qvImg');
    if (img) {
      img.src = p.imagenUrl;
      img.alt = p.nombre;
      safeImgHandler(img);
    }

    $('qvBadge').textContent = p.etiqueta || 'Temporada';
    $('qvMeta').textContent = `${p.categoria.toUpperCase()} • ${Store.getSeasonLabel(p.temporada)}`;
    $('qvTitle').textContent = p.nombre;
    $('qvPrice').textContent = Store.formatMoney(p.precio);

    const oldEl = $('qvOldPrice');
    if (p.precioAnterior) {
      oldEl.textContent = Store.formatMoney(p.precioAnterior);
      oldEl.classList.remove('d-none');
    } else {
      oldEl.classList.add('d-none');
    }

    $('qvDesc').textContent = p.descripcion || '';

    const sizesWrap = $('qvSizes');
    sizesWrap.innerHTML = tallas
      .map(
        (t) =>
          `<button type="button" class="yd-size-chip ${t === ui.qvSize ? 'is-active' : ''}" data-qv-size="${Store.escapeHtml(t)}">${Store.escapeHtml(t)}</button>`
      )
      .join('');
    sizesWrap.querySelectorAll('[data-qv-size]').forEach((b) => {
      b.addEventListener('click', () => {
        ui.qvSize = b.dataset.qvSize;
        populateQuickView(prodId);
      });
    });

    $('qvColorName').textContent = ui.qvColor;
    const colorsWrap = $('qvColors');
    colorsWrap.innerHTML = colores
      .map(
        (c) =>
          `<button type="button" class="yd-color-swatch ${c.nombre === ui.qvColor ? 'is-active' : ''}" style="background:${Store.escapeHtml(c.hex)};" title="${Store.escapeHtml(c.nombre)}" data-qv-color="${Store.escapeHtml(c.nombre)}" aria-label="${Store.escapeHtml(c.nombre)}"></button>`
      )
      .join('');
    colorsWrap.querySelectorAll('[data-qv-color]').forEach((b) => {
      b.addEventListener('click', () => {
        ui.qvColor = b.dataset.qvColor;
        populateQuickView(prodId);
      });
    });

    const wspLink = $('btnQvWhatsApp');
    if (wspLink) {
      const msg = `Hola Yademar, me interesa la prenda "${p.nombre}" (${p.id}) en talla ${ui.qvSize}, color ${ui.qvColor} (${Store.formatMoney(p.precio)}). ¿Está disponible?`;
      wspLink.href = Store.getWhatsAppUrl(msg);
    }
  }

  function openQuickView(prodId) {
    ui.qvSize = '';
    ui.qvColor = '';
    populateQuickView(prodId);
    const modalEl = $('ydQuickViewModal');
    if (modalEl && window.bootstrap) {
      qvModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      qvModalInstance.show();
    }
  }

  function bindQuickViewActions() {
    const btnAdd = $('btnQvAddToBag');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const p = Store.getProductById(ui.qvProductId);
        if (!p) return;
        Store.addToCart({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          talla: ui.qvSize || 'Única',
          color: ui.qvColor || 'Estándar',
          imagenUrl: p.imagenUrl,
          qty: 1,
        });
        renderBag();
        if (qvModalInstance) qvModalInstance.hide();
        Store.showToast(`"${p.nombre}" agregada a tu bolsa`, 'success');
      });
    }
  }

  // ---- Showcase & Solicitud de Tarjeta de Regalo (Cliente) ----
  function updateClientSampleCard() {
    const amount = Math.max(200, Number($('reqGiftAmount').value) || 1100);
    const para = ($('reqGiftPara').value || 'Destinatario Especial').trim();
    const de = ($('reqGiftDe').value || 'Con cariño').trim();
    const motivo = ($('reqGiftMotivo').value || 'DETALLE ESPECIAL').trim();
    const tema = $('reqGiftTema').value || 'crimson';

    $('sampleAmount').textContent = `C$${Math.round(amount).toLocaleString('en-US')}`;
    $('samplePara').textContent = para;
    $('sampleDe').textContent = de;
    $('sampleMotivo').textContent = motivo;

    const scene = $('clientSampleCardScene');
    if (scene) {
      scene.classList.remove('yd-gc-theme-crimson', 'yd-gc-theme-blush', 'yd-gc-theme-noir', 'yd-gc-theme-gold');
      scene.classList.add(`yd-gc-theme-${tema}`);
    }
  }

  function bindClientGiftRequest() {
    const form = $('clientGiftRequestForm');
    if (!form) return;

    ['reqGiftAmount', 'reqGiftPara', 'reqGiftDe', 'reqGiftMotivo', 'reqGiftTema'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('input', updateClientSampleCard);
      if (el) el.addEventListener('change', updateClientSampleCard);
    });

    document.querySelectorAll('#samplePresetWrap [data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $('reqGiftAmount').value = btn.dataset.preset;
        document.querySelectorAll('#samplePresetWrap [data-preset]').forEach((b) =>
          b.classList.toggle('is-active', b === btn)
        );
        updateClientSampleCard();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = Math.max(200, Number($('reqGiftAmount').value) || 1100);
      const para = ($('reqGiftPara').value || '').trim();
      const de = ($('reqGiftDe').value || '').trim();
      const motivo = $('reqGiftMotivo').value;
      const temaSelect = $('reqGiftTema');
      const temaLabel = temaSelect.options[temaSelect.selectedIndex].text;

      const msg =
        `Hola Yademar, deseo solicitar una Tarjeta de Regalo oficial:\n` +
        `• Monto: C$${Math.round(amount).toLocaleString('en-US')}\n` +
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
        const amount = Math.max(200, Number($('reqGiftAmount').value) || 1100);
        const para = ($('reqGiftPara').value || 'Destinatario').trim();
        const de = ($('reqGiftDe').value || 'Cliente').trim();
        const tema = $('reqGiftTema').value;

        Store.addToCart({
          id: `GIFT-REQ-${Date.now().toString().slice(-4)}`,
          nombre: `Solicitud Tarjeta de Regalo (Para: ${para})`,
          precio: amount,
          talla: `Diseño ${tema}`,
          color: `De: ${de}`,
          imagenUrl: 'logo.jpg',
          qty: 1,
          esGiftCardSolicitud: true,
        });
        renderBag();
        const offEl = $('ydBagOffcanvas');
        if (offEl && window.bootstrap) {
          bagOffcanvasInstance = window.bootstrap.Offcanvas.getOrCreateInstance(offEl);
          bagOffcanvasInstance.show();
        }
        Store.showToast('Solicitud de Tarjeta de Regalo añadida a tu bolsa', 'success');
      });
    }

    updateClientSampleCard();
  }

  // ---- Bolsa de Compras Offcanvas ----
  function computeBagTotals() {
    const cart = Store.getCart();
    const subtotalNio = cart.reduce((sum, item) => sum + item.precio * item.qty, 0);
    const gc = Store.getAppliedGiftCard();
    const rate = (Store.getConfig() && Store.getConfig().tasaCambio) || 36.62;
    let gcCreditNio = 0;

    if (gc) {
      gcCreditNio = gc.moneda === 'US$' ? Number(gc.monto) * rate : Number(gc.monto);
    }

    const discountNio = Math.min(subtotalNio, Math.round(gcCreditNio));
    const totalNio = Math.max(0, subtotalNio - discountNio);
    return { subtotalNio, discountNio, totalNio, gc };
  }

  function renderBag() {
    const cart = Store.getCart();
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    const badge = $('navBagCount');
    if (badge) badge.textContent = String(totalQty);

    const listEl = $('ydBagItems');
    if (!listEl) return;

    if (cart.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-5 my-auto text-muted">
          <i class="bi bi-bag fs-1 d-block mb-2 opacity-50"></i>
          <div class="fw-semibold text-dark mb-1">Tu bolsa está vacía</div>
          <p class="small mb-0">Agrega prendas del catálogo o una solicitud de Tarjeta de Regalo.</p>
        </div>
      `;
    } else {
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
              <button type="button" class="btn btn-sm p-0 text-muted border-0" data-bag-remove="${Store.escapeHtml(item.key)}" aria-label="Eliminar">
                <i class="bi bi-trash3"></i>
              </button>
              <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn btn-outline-secondary py-0 px-2" data-bag-dec="${Store.escapeHtml(item.key)}">−</button>
                <span class="btn btn-outline-secondary py-0 px-2 disabled text-dark fw-bold">${item.qty}</span>
                <button type="button" class="btn btn-outline-secondary py-0 px-2" data-bag-inc="${Store.escapeHtml(item.key)}">+</button>
              </div>
            </div>
          </div>
        `
        )
        .join('');

      listEl.querySelectorAll('img').forEach(safeImgHandler);
      listEl.querySelectorAll('[data-bag-inc]').forEach((b) =>
        b.addEventListener('click', () => {
          Store.updateCartQty(b.dataset.bagInc, 1);
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
    }

    const { subtotalNio, discountNio, totalNio, gc } = computeBagTotals();
    $('bagSubtotal').textContent = Store.formatMoney(subtotalNio);
    $('bagTotal').textContent = Store.formatMoney(totalNio);

    const discRow = $('bagDiscountRow');
    const appliedMsg = $('bagGiftAppliedMsg');
    if (gc) {
      discRow.classList.remove('d-none');
      $('bagDiscountFolio').textContent = gc.folio;
      $('bagDiscountVal').textContent = `-${Store.formatMoney(discountNio)}`;
      appliedMsg.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>Folio ${Store.escapeHtml(gc.folio)} válido (${Store.formatRawAmount(gc.monto, gc.moneda)}) <button type="button" class="btn btn-link btn-sm p-0 ms-1 text-danger" id="btnRemoveBagGift">Quitar</button>`;
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
  }

  function bindBagActions() {
    const btnApply = $('btnApplyBagGift');
    if (btnApply) {
      btnApply.addEventListener('click', () => {
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

    const btnCheckout = $('btnCheckoutWhatsApp');
    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => {
        const cart = Store.getCart();
        if (cart.length === 0) {
          Store.showToast('Agrega al menos una prenda antes de enviar tu pedido', 'error');
          return;
        }

        const user = Store.getActiveClientUser();
        const { subtotalNio, discountNio, totalNio, gc } = computeBagTotals();

        const order = Store.recordOrder({
          items: cart,
          subtotalNio,
          descuentoGiftCardNio: discountNio,
          giftCardFolio: gc ? gc.folio : null,
          totalNio,
        });

        const lines = cart.map(
          (i) => `• ${i.qty}x ${i.nombre} (${i.talla}, ${i.color}) — ${Store.formatMoney(i.precio * i.qty)}`
        );

        let msg = `Hola Yademar, deseo confirmar mi pedido ${order ? order.id : ''}:\n`;
        if (user) msg += `Cliente: ${user.nombre}\n`;
        msg += `\n${lines.join('\n')}\n`;
        msg += `\nSubtotal: ${Store.formatMoney(subtotalNio)}`;
        if (gc) msg += `\nCrédito Gift Card (${gc.folio}): -${Store.formatMoney(discountNio)}`;
        msg += `\nTotal estimado: ${Store.formatMoney(totalNio)}`;

        renderAccountModal();
        window.open(Store.getWhatsAppUrl(msg), '_blank', 'noopener');
        Store.showToast('Pedido registrado y enviado a WhatsApp', 'success');
      });
    }
  }

  // ---- Modal Cuenta Cliente ----
  function renderAccountModal() {
    const user = Store.getActiveClientUser();
    if (!user) return;

    const firstName = String(user.nombre || 'Cliente').split(' ')[0];
    const navLabel = $('navUserLabel');
    if (navLabel) navLabel.textContent = firstName;

    $('accActiveName').textContent = user.nombre;
    $('accActiveEmail').textContent = user.correo;
    $('accStatFavs').textContent = String((user.favoritos || []).length);
    $('accStatOrders').textContent = String((user.pedidos || []).length);

    const ordersList = $('accOrdersList');
    if (!ordersList) return;
    const pedidos = user.pedidos || [];
    if (pedidos.length === 0) {
      ordersList.innerHTML = `<div class="text-center py-4 text-muted small">Aún no has enviado pedidos desde esta cuenta.</div>`;
    } else {
      ordersList.innerHTML = pedidos
        .slice(0, 6)
        .map(
          (o) => `
          <div class="p-2 px-3 rounded-3 border bg-white small">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <strong class="text-dark">${Store.escapeHtml(o.id)}</strong>
              <span class="badge text-bg-success rounded-pill">${Store.escapeHtml(o.estado || 'Enviado')}</span>
            </div>
            <div class="text-muted">${Store.formatDateDMY(o.fecha)} &bull; ${(o.items || []).length} artículo(s)</div>
            <div class="fw-bold text-danger mt-1">Total: ${Store.formatMoney(o.totalNio)}</div>
          </div>
        `
        )
        .join('');
    }
  }

  function bindAccountForms() {
    const loginForm = $('clientLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('cliLoginError');
        err.classList.add('d-none');
        const idVal = $('cliLoginId').value;
        const pinVal = $('cliLoginPin').value;
        const matched = Store.authenticate(idVal, pinVal);
        if (!matched) {
          err.textContent = 'Correo/usuario o PIN incorrecto.';
          err.classList.remove('d-none');
          return;
        }
        if (matched.rol === 'admin') {
          // Si ingresa cuenta de admin, redirigir al Panel Administrador independiente
          Store.loginAdmin(idVal, pinVal);
          window.location.href = 'admin.html';
          return;
        }
        Store.setActiveClientUser(matched.id);
        loginForm.reset();
        renderAccountModal();
        renderCatalog();
        Store.showToast(`Sesión iniciada como ${matched.nombre}`, 'success');
      });
    }

    const regForm = $('clientRegisterForm');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('cliRegError');
        err.classList.add('d-none');
        const res = Store.registerClientUser({
          nombre: $('regName').value,
          correo: $('regEmail').value,
          telefono: $('regPhone').value,
          pin: $('regPin').value,
        });
        if (!res.ok) {
          err.textContent = res.error;
          err.classList.remove('d-none');
          return;
        }
        regForm.reset();
        renderAccountModal();
        renderCatalog();
        Store.showToast(`Cuenta creada para ${res.user.nombre}`, 'success');
      });
    }
  }

  // ---- Inicialización Vista Cliente ----
  async function boot() {
    await Store.initStore();

    const cfg = Store.getConfig();
    const heroImg = $('ydHeroImg');
    if (heroImg && cfg.heroImagenUrl) {
      heroImg.src = cfg.heroImagenUrl;
      safeImgHandler(heroImg);
    }

    initGlobalInteractions();
    syncCurrencyButtons();
    bindCurrencySwitchers();
    bindCatalogControls();
    bindQuickViewActions();
    bindClientGiftRequest();
    bindBagActions();
    bindAccountForms();

    renderSeasons();
    renderCatalog();
    renderBag();
    renderAccountModal();

    // Sincronización en vivo cuando el Admin actualiza catálogo o emite folios en otra pestaña
    Store.subscribeExternalSync(() => {
      syncCurrencyButtons();
      renderSeasons();
      renderCatalog();
      renderBag();
      renderAccountModal();
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
