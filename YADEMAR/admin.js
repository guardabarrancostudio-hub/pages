/* ============================================================
   YADEMAR — Vista Administrador (admin.js)
   Conecta admin.html con window.YademarStore y Bootstrap 5.3
   Incluye:
     - Puerta de validación en cada acceso/recarga
     - Dashboard KPIs + Resumen operativo
     - CRUD Catálogo + Control de Cantidad/Stock
     - Estudio Couture 3D de Tarjetas de Regalo (PNG HD Anverso/Reverso
       con autoajuste tipográfico + impresión calibrada 176×110mm)
     - CRUD Clientes, Detalle & Estado de Pedidos y Respaldo JSON
   ============================================================ */

(function () {
  'use strict';

  const Store = window.YademarStore;
  if (!Store) return;

  let prodModalInstance = null;
  let clientModalInstance = null;
  let orderModalInstance = null;
  let activeGcTheme = 'crimson';
  let isGcFlipped = false;

  const GC_CANVAS_PALETTES = {
    crimson: {
      bgStart: '#FFFDFC',
      bgMid: '#FFF2F4',
      bgEnd: '#FBE0E6',
      border: '#D90429',
      ink: '#1A1418',
      accent: '#D90429',
      boxBg: 'rgba(217, 4, 41, 0.08)',
      boxBorder: 'rgba(217, 4, 41, 0.34)',
      rowBg: 'rgba(217, 4, 41, 0.06)',
      rowBar: '#D90429',
      footerLine: 'rgba(217, 4, 41, 0.24)',
      folioBg: '#FFFFFF',
      folioText: '#D90429',
    },
    blush: {
      bgStart: '#FFF9FC',
      bgMid: '#FBDCEB',
      bgEnd: '#F5C2DC',
      border: '#BE185D',
      ink: '#24131E',
      accent: '#BE185D',
      boxBg: 'rgba(190, 24, 93, 0.11)',
      boxBorder: 'rgba(190, 24, 93, 0.36)',
      rowBg: 'rgba(255, 255, 255, 0.62)',
      rowBar: '#BE185D',
      footerLine: 'rgba(190, 24, 93, 0.26)',
      folioBg: '#FFFFFF',
      folioText: '#BE185D',
    },
    noir: {
      bgStart: '#16131A',
      bgMid: '#241C28',
      bgEnd: '#110E14',
      border: '#C59B47',
      ink: '#FAF6F0',
      accent: '#E8C77B',
      boxBg: 'rgba(197, 155, 71, 0.16)',
      boxBorder: 'rgba(232, 199, 123, 0.45)',
      rowBg: 'rgba(255, 255, 255, 0.08)',
      rowBar: '#C59B47',
      footerLine: 'rgba(232, 199, 123, 0.28)',
      folioBg: '#FFFFFF',
      folioText: '#141216',
    },
    gold: {
      bgStart: '#FFFDF8',
      bgMid: '#F7ECD6',
      bgEnd: '#EED9AF',
      border: '#9A6E1C',
      ink: '#211A11',
      accent: '#9A6E1C',
      boxBg: 'rgba(154, 110, 28, 0.12)',
      boxBorder: 'rgba(154, 110, 28, 0.36)',
      rowBg: 'rgba(255, 255, 255, 0.62)',
      rowBar: '#9A6E1C',
      footerLine: 'rgba(154, 110, 28, 0.26)',
      folioBg: '#FFFFFF',
      folioText: '#8A5F12',
    },
  };

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

  function populateSeasonSelects() {
    const seasons = Store.getSeasons();
    const filterSel = $('adminProdSeasonFilter');
    const prodSel = $('prodTemporada');

    if (filterSel) {
      const current = filterSel.value || 'todas';
      filterSel.innerHTML =
        `<option value="todas">Todas las temporadas</option>` +
        seasons
          .map((s) => `<option value="${Store.escapeHtml(s.id)}">${Store.escapeHtml(s.nombre)}</option>`)
          .join('');
      filterSel.value = seasons.some((s) => s.id === current) ? current : 'todas';
    }

    if (prodSel) {
      const current = prodSel.value;
      prodSel.innerHTML = seasons
        .map((s) => `<option value="${Store.escapeHtml(s.id)}">${Store.escapeHtml(s.nombre)}</option>`)
        .join('');
      if (current && seasons.some((s) => s.id === current)) prodSel.value = current;
    }
  }

  // ---- Control de Puerta de Acceso ----
  function syncAuthView() {
    const adminUser = Store.getAdminSessionUser();
    const gate = $('ydAdminGate');
    const workspace = $('ydAdminWorkspace');

    if (adminUser) {
      gate.classList.add('d-none');
      workspace.classList.remove('d-none');
      const header = $('adminActiveHeader');
      if (header) header.textContent = `${adminUser.nombre} (${adminUser.correo})`;
      populateSeasonSelects();
      refreshAllPanels();
    } else {
      workspace.classList.add('d-none');
      gate.classList.remove('d-none');
    }
  }

  function bindAuthHandlers() {
    const form = $('adminLoginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = $('adminLoginError');
        errEl.classList.add('d-none');
        const idVal = $('adminLoginId').value;
        const pinVal = $('adminLoginPin').value;

        const res = Store.loginAdmin(idVal, pinVal);
        if (!res.ok) {
          errEl.textContent = res.error;
          errEl.classList.remove('d-none');
          return;
        }

        form.reset();
        syncAuthView();
        Store.showToast(`Bienvenido, ${res.user.nombre}`, 'success');
      });
    }

    const btnLogout = $('btnAdminLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        Store.logoutAdmin();
        syncAuthView();
        Store.showToast('Sesión administrativa cerrada');
      });
    }
  }

  // ---- Navegación entre Paneles ----
  function switchPanel(panelId) {
    document.querySelectorAll('.yd-admin-panel').forEach((sec) => {
      sec.classList.toggle('d-none', sec.id !== panelId);
    });
    document.querySelectorAll('#adminSidebarNav .yd-admin-nav-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.panel === panelId);
    });
  }

  function bindPanelNavigation() {
    document.querySelectorAll('#adminSidebarNav .yd-admin-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
    });

    document.querySelectorAll('[data-jump-panel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchPanel(btn.dataset.jumpPanel);
        if (btn.id === 'btnDashNewProd') openProductModal(null);
        if (btn.id === 'btnDashNewClient') openClientModal(null);
      });
    });
  }

  // ---- Panel 1: Dashboard KPIs y Resumen ----
  function renderDashboard() {
    const products = Store.getProducts();
    const seasons = Store.getSeasons();
    const cards = Store.getAllGiftCards();
    const orders = Store.getAllOrders();
    const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

    $('kpiProducts').textContent = String(products.length);
    if ($('kpiTotalUnits')) {
      $('kpiTotalUnits').textContent = `${totalUnits} unidades en inventario`;
    }
    $('kpiSeasons').textContent = String(seasons.length);
    $('kpiGiftCards').textContent = String(cards.length);
    $('kpiOrders').textContent = String(orders.length);

    const recentCardsEl = $('dashRecentCards');
    if (cards.length === 0) {
      recentCardsEl.innerHTML = `<div class="text-muted py-3 text-center">No hay tarjetas emitidas todavía.</div>`;
    } else {
      recentCardsEl.innerHTML = cards
        .slice(0, 5)
        .map((c) => {
          const st = Store.getGiftCardStatus(c);
          const badgeCls =
            st === 'Vigente' ? 'text-bg-success' : st === 'Canjeada' ? 'text-bg-secondary' : 'text-bg-warning text-dark';
          return `
            <div class="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light border">
              <div>
                <span class="badge text-bg-danger me-1">${Store.escapeHtml(c.folio)}</span>
                <strong>${Store.escapeHtml(c.para)}</strong>
                <span class="badge ${badgeCls} ms-1">${st}</span>
                <div class="text-muted" style="font-size:0.74rem;">De: ${Store.escapeHtml(c.de)} &bull; Válida: ${Store.formatDateDMY(c.validoHasta)}</div>
              </div>
              <div class="fw-bold text-dark">${Store.formatRawAmount(c.monto, c.moneda)}</div>
            </div>
          `;
        })
        .join('');
    }

    const recentOrdersEl = $('dashRecentOrders');
    if (orders.length === 0) {
      recentOrdersEl.innerHTML = `<div class="text-muted py-3 text-center">Aún no se registran pedidos desde la tienda cliente.</div>`;
    } else {
      recentOrdersEl.innerHTML = orders
        .slice(0, 5)
        .map(
          (o) => `
          <div class="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light border">
            <div>
              <span class="badge ${o.estado === 'Cancelado' ? 'text-bg-secondary' : 'text-bg-success'} me-1">${Store.escapeHtml(o.id)}</span>
              <strong>${Store.escapeHtml(o.clienteNombre || 'Cliente')}</strong>
              <div class="text-muted" style="font-size:0.74rem;">${Store.formatDateDMY(o.fecha)} &bull; ${Store.escapeHtml(o.estado || 'Enviado')}</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-danger">${Store.formatMoney(o.totalNio, 'NIO')}</span>
              <button type="button" class="btn btn-sm btn-outline-dark py-0 px-2" data-view-order="${Store.escapeHtml(o.id)}">Ver</button>
            </div>
          </div>
        `
        )
        .join('');

      recentOrdersEl.querySelectorAll('[data-view-order]').forEach((b) => {
        b.addEventListener('click', () => openOrderDetailModal(b.dataset.viewOrder));
      });
    }
  }

  // ---- Panel 2: CRUD Catálogo ----
  function renderCatalogTable() {
    const tbody = $('adminProductsTbody');
    if (!tbody) return;

    const term = ($('adminProdSearch').value || '').trim().toLowerCase();
    const season = $('adminProdSeasonFilter').value || 'todas';
    const cat = $('adminProdCatFilter').value || 'todas';

    let list = Store.getProducts().slice();
    if (season !== 'todas') list = list.filter((p) => p.temporada === season);
    if (cat !== 'todas') list = list.filter((p) => p.categoria === cat);
    if (term) {
      list = list.filter((p) =>
        `${p.id} ${p.nombre} ${p.etiqueta || ''}`.toLowerCase().includes(term)
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No hay prendas que coincidan con el filtro.</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map((p) => {
        const stock = Number(p.stock) || 0;
        const statusBadge =
          p.disponible !== false
            ? stock > 0
              ? `<span class="badge text-bg-success rounded-pill">Visible</span>`
              : `<span class="badge text-bg-warning text-dark rounded-pill">Agotado</span>`
            : `<span class="badge text-bg-secondary rounded-pill">Oculta</span>`;
        const tallas = Array.isArray(p.tallas) ? p.tallas.join(', ') : '';
        return `
          <tr>
            <td><img src="${Store.escapeHtml(p.imagenUrl)}" alt="${Store.escapeHtml(p.nombre)}" class="yd-admin-thumb"></td>
            <td>
              <div class="fw-bold text-dark">${Store.escapeHtml(p.nombre)}</div>
              <div class="text-muted" style="font-size:0.75rem;">${Store.escapeHtml(p.id)} &bull; Tallas: ${Store.escapeHtml(tallas)}</div>
            </td>
            <td>
              <span class="text-capitalize fw-semibold">${Store.escapeHtml(p.categoria)}</span>
              <div class="text-muted" style="font-size:0.75rem;">${Store.escapeHtml(Store.getSeasonLabel(p.temporada))}</div>
            </td>
            <td class="fw-bold text-danger">C$${Math.round(p.precio).toLocaleString('en-US')}</td>
            <td>
              <div class="btn-group btn-group-sm" role="group" aria-label="Ajustar cantidad">
                <button type="button" class="btn btn-outline-secondary py-0 px-2" data-stock-dec="${Store.escapeHtml(p.id)}" ${stock <= 0 ? 'disabled' : ''}>−</button>
                <span class="btn btn-outline-secondary py-0 px-2 disabled fw-bold ${stock <= 2 ? 'text-danger' : 'text-dark'}">${stock}</span>
                <button type="button" class="btn btn-outline-secondary py-0 px-2" data-stock-inc="${Store.escapeHtml(p.id)}">+</button>
              </div>
            </td>
            <td>${statusBadge}</td>
            <td class="text-end text-nowrap">
              <button type="button" class="btn btn-sm btn-outline-dark me-1" data-edit-prod="${Store.escapeHtml(p.id)}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger" data-del-prod="${Store.escapeHtml(p.id)}" title="Eliminar">
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');

    tbody.querySelectorAll('img').forEach(safeImgHandler);

    tbody.querySelectorAll('[data-stock-dec]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = Store.adjustProductStock(btn.dataset.stockDec, -1);
        refreshAllPanels();
        Store.showToast(`Cantidad actualizada: ${next} uds`);
      });
    });

    tbody.querySelectorAll('[data-stock-inc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = Store.adjustProductStock(btn.dataset.stockInc, 1);
        refreshAllPanels();
        Store.showToast(`Cantidad actualizada: ${next} uds`, 'success');
      });
    });

    tbody.querySelectorAll('[data-edit-prod]').forEach((btn) => {
      btn.addEventListener('click', () => openProductModal(btn.dataset.editProd));
    });

    tbody.querySelectorAll('[data-del-prod]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prod = Store.getProductById(btn.dataset.delProd);
        if (!prod) return;
        if (!window.confirm(`¿Eliminar la prenda "${prod.nombre}" (${prod.id}) del catálogo?`)) return;
        Store.deleteProduct(prod.id);
        refreshAllPanels();
        Store.showToast(`Prenda ${prod.id} eliminada del catálogo`);
      });
    });
  }

  function updateProdImgPreview() {
    const preview = $('prodImgPreview');
    const url = ($('prodImgUrl').value || '').trim();
    if (!preview) return;
    preview.src = url || Store.IMG_FALLBACK_SVG;
    safeImgHandler(preview);
  }

  function openProductModal(prodId) {
    const form = $('adminProdForm');
    form.reset();
    const errEl = $('prodFormError');
    if (errEl) errEl.classList.add('d-none');
    populateSeasonSelects();

    const p = prodId ? Store.getProductById(prodId) : null;
    if (p) {
      $('prodModalTitle').textContent = `Editar Artículo (${p.id})`;
      $('prodEditId').value = p.id;
      $('prodNombre').value = p.nombre || '';
      $('prodCategoria').value = p.categoria || 'dama';
      $('prodTemporada').value = p.temporada || 'verano';
      $('prodPrecio').value = p.precio || '';
      $('prodPrecioAnt').value = p.precioAnterior || '';
      $('prodStock').value = Number.isFinite(Number(p.stock)) ? p.stock : 10;
      $('prodTallas').value = Array.isArray(p.tallas) ? p.tallas.join(', ') : 'S, M, L';
      $('prodColores').value = Array.isArray(p.colores)
        ? p.colores.map((c) => c.nombre).join(', ')
        : 'Negro Couture, Rojo Carmesí';
      $('prodEtiqueta').value = p.etiqueta || 'Nuevo';
      $('prodImgUrl').value = p.imagenUrl && !p.imagenUrl.startsWith('data:image/svg') ? p.imagenUrl : '';
      $('prodDesc').value = p.descripcion || '';
      $('prodDisponible').checked = p.disponible !== false;
    } else {
      $('prodModalTitle').textContent = 'Registrar Nuevo Artículo';
      $('prodEditId').value = '';
      $('prodStock').value = 10;
      $('prodTallas').value = 'S, M, L';
      $('prodColores').value = 'Negro Couture, Rojo Carmesí';
      $('prodEtiqueta').value = 'Nuevo';
      $('prodDisponible').checked = true;
    }

    updateProdImgPreview();

    const modalEl = $('ydAdminProdModal');
    if (modalEl && window.bootstrap) {
      prodModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      prodModalInstance.show();
    }
  }

  function bindCatalogAdminHandlers() {
    ['adminProdSearch', 'adminProdSeasonFilter', 'adminProdCatFilter'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('input', renderCatalogTable);
      if (el) el.addEventListener('change', renderCatalogTable);
    });

    const btnNew = $('btnOpenNewProdModal');
    if (btnNew) btnNew.addEventListener('click', () => openProductModal(null));

    const imgInput = $('prodImgUrl');
    if (imgInput) imgInput.addEventListener('input', updateProdImgPreview);

    const form = $('adminProdForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = $('prodFormError');
        if (errEl) errEl.classList.add('d-none');

        const res = Store.addOrUpdateProduct({
          id: $('prodEditId').value || null,
          nombre: $('prodNombre').value,
          categoria: $('prodCategoria').value,
          temporada: $('prodTemporada').value,
          precio: Number($('prodPrecio').value),
          precioAnterior: $('prodPrecioAnt').value ? Number($('prodPrecioAnt').value) : undefined,
          stock: Number($('prodStock').value),
          tallas: $('prodTallas').value,
          colores: $('prodColores').value,
          etiqueta: $('prodEtiqueta').value,
          imagenUrl: $('prodImgUrl').value,
          descripcion: $('prodDesc').value,
          disponible: $('prodDisponible').checked,
        });

        if (!res.ok) {
          if (errEl) {
            errEl.textContent = res.error;
            errEl.classList.remove('d-none');
          }
          Store.showToast(res.error, 'error');
          return;
        }

        if (prodModalInstance) prodModalInstance.hide();
        refreshAllPanels();
        Store.showToast(
          res.isEdit
            ? `Artículo "${res.product.nombre}" actualizado (Stock: ${res.product.stock})`
            : `Artículo "${res.product.nombre}" registrado (Stock: ${res.product.stock})`,
          'success'
        );
      });
    }
  }

  // ---- Panel 3: Estudio Couture 3D de Tarjetas de Regalo ----
  function getGiftFormValues() {
    const moneda = $('gcCurrency').value === 'US$' ? 'US$' : 'C$';
    const monto = Math.max(10, Number($('gcAmount').value) || 1100);
    const folio = Store.normalizeCode($('gcFolio').value || Store.getNextFolio()).slice(0, 12);
    const validoHasta = $('gcExpiry').value || Store.defaultExpiryISO();
    const para = ($('gcPara').value || '').trim() || 'Destinatario Especial';
    const de = ($('gcDe').value || '').trim() || 'Con cariño';
    const motivo = ($('gcMotivo').value || 'DETALLE ESPECIAL').trim().toUpperCase();
    const canje = ($('gcCanje').value || 'Para gastar en la tienda física y Online.').trim();
    const mensaje = ($('gcMessage').value || '').trim();
    return {
      moneda,
      monto,
      folio,
      validoHasta,
      para,
      de,
      motivo,
      canje,
      mensaje,
      tema: activeGcTheme,
    };
  }

  function validateAndSaveGiftCard() {
    const form = $('adminGiftForm');
    if (form && !form.reportValidity()) return null;

    const data = getGiftFormValues();
    const existing = Store.findGiftCardByCode(data.folio);
    if (existing) {
      const sameOwner =
        existing.para.toLowerCase() === data.para.toLowerCase() &&
        Number(existing.monto) === Number(data.monto);
      if (
        !sameOwner &&
        !window.confirm(
          `El folio ${data.folio} ya está registrado para "${existing.para}" (${Store.formatRawAmount(existing.monto, existing.moneda)}). ¿Deseas sobrescribirlo?`
        )
      ) {
        return null;
      }
    }

    const saved = Store.recordGiftCard(data);
    refreshAllPanels();
    return saved;
  }

  function renderBarcodeInto(container, code) {
    if (!container) return;
    const bars = Store.generateBarcodeBars(code);
    container.innerHTML = bars
      .map((w, idx) => {
        const isBlack = idx % 2 === 0;
        return `<span class="yd-barcode-bar" style="width:${w * 2}px; background:${isBlack ? '#141216' : 'transparent'};"></span>`;
      })
      .join('');
  }

  function updateGiftPreview() {
    const data = getGiftFormValues();
    const formattedAmount = Store.formatRawAmount(data.monto, data.moneda);
    const formattedDate = Store.formatDateDMY(data.validoHasta);

    $('prevGcMotivo').textContent = data.motivo;
    $('prevGcAmount').textContent = formattedAmount;
    $('prevGcCanje').textContent = data.canje;
    $('prevGcPara').textContent = data.para;
    $('prevGcDe').textContent = data.de;
    $('prevGcExpiry').textContent = formattedDate;
    $('prevGcFolio').textContent = data.folio;

    $('prevGcBackFolio').textContent = data.folio;
    $('prevGcBackExpiry').textContent = formattedDate;
    $('prevGcMessage').textContent =
      data.mensaje || 'Disfruta eligiendo tu outfit favorito en Yademar Boutique Chinandega.';
    $('prevGcBarcodeText').textContent = `YDM-${data.folio}`;
    renderBarcodeInto($('gcBackBarcode'), data.folio);

    const scene = $('ydGiftScene');
    if (scene) {
      scene.classList.remove('yd-gc-theme-crimson', 'yd-gc-theme-blush', 'yd-gc-theme-noir', 'yd-gc-theme-gold');
      scene.classList.add(`yd-gc-theme-${data.tema}`);
    }
  }

  function loadGiftIntoEditor(card) {
    if (!card) return;
    $('gcCurrency').value = card.moneda === 'US$' ? 'US$' : 'C$';
    $('gcAmount').value = card.monto || 1100;
    $('gcFolio').value = card.folio || Store.getNextFolio();
    $('gcExpiry').value = card.validoHasta || Store.defaultExpiryISO();
    $('gcPara').value = card.para || '';
    $('gcDe').value = card.de || '';
    $('gcMotivo').value = card.motivo || 'DETALLE ESPECIAL';
    $('gcCanje').value = card.canje || 'Para gastar en la tienda física y Online.';
    $('gcMessage').value = card.mensaje || '';
    activeGcTheme = card.tema || 'crimson';

    document.querySelectorAll('#adminGcThemes .yd-theme-swatch-btn').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.gcTheme === activeGcTheme);
    });

    updateGiftPreview();
    Store.showToast(`Folio ${card.folio} cargado en el estudio`);
  }

  function renderGiftCardsTable() {
    const tbody = $('adminGiftCardsTbody');
    if (!tbody) return;

    const term = ($('adminGcSearch') ? $('adminGcSearch').value : '').trim().toLowerCase();
    let cards = Store.getAllGiftCards();
    if (term) {
      cards = cards.filter((c) =>
        `${c.folio} ${c.para} ${c.de} ${Store.getGiftCardStatus(c)}`.toLowerCase().includes(term)
      );
    }

    if (cards.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No hay tarjetas de regalo que coincidan.</td></tr>`;
      return;
    }

    tbody.innerHTML = cards
      .map((c) => {
        const st = Store.getGiftCardStatus(c);
        const badgeCls =
          st === 'Vigente'
            ? 'text-bg-success'
            : st === 'Canjeada'
            ? 'text-bg-secondary'
            : 'text-bg-warning text-dark';
        const saldo = typeof c.saldoRestante === 'number' ? c.saldoRestante : c.monto;
        const saldoHtml =
          saldo !== c.monto
            ? `<div class="text-muted" style="font-size:0.72rem;">Saldo: ${Store.formatRawAmount(saldo, c.moneda)}</div>`
            : '';

        return `
          <tr>
            <td><span class="badge text-bg-danger">${Store.escapeHtml(c.folio)}</span></td>
            <td>
              <div class="fw-bold">${Store.formatRawAmount(c.monto, c.moneda)}</div>
              ${saldoHtml}
            </td>
            <td>
              <div class="fw-semibold text-dark">Para: ${Store.escapeHtml(c.para)}</div>
              <div class="text-muted" style="font-size:0.75rem;">De: ${Store.escapeHtml(c.de)}</div>
            </td>
            <td><span class="badge ${badgeCls} rounded-pill">${st}</span></td>
            <td>${Store.formatDateDMY(c.validoHasta)}</td>
            <td class="text-end text-nowrap">
              <button type="button" class="btn btn-sm btn-outline-dark me-1" data-load-gc="${Store.escapeHtml(c.folio)}">
                <i class="bi bi-eye me-1"></i>Cargar
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger" data-del-gc="${Store.escapeHtml(c.folio)}" title="Eliminar folio">
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');

    tbody.querySelectorAll('[data-load-gc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = Store.findGiftCardByCode(btn.dataset.loadGc);
        loadGiftIntoEditor(card);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    tbody.querySelectorAll('[data-del-gc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const folio = btn.dataset.delGc;
        if (!window.confirm(`¿Eliminar el folio oficial ${folio} del registro?`)) return;
        Store.deleteGiftCard(folio);
        refreshAllPanels();
        Store.showToast(`Folio ${folio} eliminado`);
      });
    });
  }

  // ---- Generador Canvas PNG HD 1800x1125 px (Autoajuste tipográfico + Anverso y Reverso) ----
  function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawFittedText(ctx, text, x, y, maxWidth, baseSize, minSize, fontFamily, weight) {
    const clean = String(text || '');
    let size = baseSize;
    const w = weight || 700;
    while (size > minSize) {
      ctx.font = `${w} ${size}px ${fontFamily}`;
      if (ctx.measureText(clean).width <= maxWidth) break;
      size -= 2;
    }
    ctx.font = `${w} ${size}px ${fontFamily}`;
    ctx.fillText(clean, x, y, maxWidth);
  }

  function wrapCanvasText(ctx, text, maxWidth, maxLines) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    for (let i = 0; i < words.length; i++) {
      const test = current ? `${current} ${words[i]}` : words[i];
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = words[i];
        if (lines.length >= maxLines - 1) break;
      }
    }
    if (current && lines.length < maxLines) lines.push(current);
    return lines;
  }

  function loadLogoImageForCanvas() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = window.YADEMAR_LOGO_DATA_URI || 'logo.jpg';
    });
  }

  function drawSocialBadge(ctx, cx, cy, r, bg, text) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${Math.round(r * 1.15)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
  }

  function drawCardBackdrop(ctx, W, H, pal) {
    ctx.clearRect(0, 0, W, H);
    drawRoundRect(ctx, 18, 18, W - 36, H - 36, 44);
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, pal.bgStart);
    bgGrad.addColorStop(0.55, pal.bgMid);
    bgGrad.addColorStop(1, pal.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    ctx.save();
    drawRoundRect(ctx, 18, 18, W - 36, H - 36, 44);
    ctx.clip();
    const sheen = ctx.createLinearGradient(0, 0, W, H);
    sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
    sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
    sheen.addColorStop(1, 'rgba(255,255,255,0.14)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    drawRoundRect(ctx, 18, 18, W - 36, H - 36, 44);
    ctx.lineWidth = 6;
    ctx.strokeStyle = pal.border;
    ctx.stroke();

    drawRoundRect(ctx, 48, 48, W - 96, H - 96, 30);
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = pal.border;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  async function exportGiftCardPngHD(side) {
    const canvas = $('ydGiftCanvas');
    if (!canvas) return;
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (_) {
        // Continuar si falla carga de fuentes
      }
    }

    const ctx = canvas.getContext('2d');
    const W = 1800;
    const H = 1125;
    const data = getGiftFormValues();
    const pal = GC_CANVAS_PALETTES[data.tema] || GC_CANVAS_PALETTES.crimson;

    drawCardBackdrop(ctx, W, H, pal);

    if (side === 'back') {
      // ---- REVERSO HD ----
      ctx.fillStyle = pal.accent;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      drawFittedText(ctx, 'CERTIFICADO OFICIAL YADEMAR', 102, 160, 1100, 32, 22, '"Plus Jakarta Sans", sans-serif', 700);

      ctx.fillStyle = pal.ink;
      drawFittedText(ctx, 'Boutique & Tienda Online • Chinandega', 102, 214, 1100, 36, 24, '"Playfair Display", Georgia, serif', 700);

      // Folio arriba derecha
      const folioW = 260;
      const folioH = 74;
      const folioX = W - 102 - folioW;
      const folioY = 116;
      drawRoundRect(ctx, folioX, folioY, folioW, folioH, 18);
      ctx.fillStyle = pal.folioBg;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = pal.border;
      ctx.stroke();
      ctx.fillStyle = pal.folioText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawFittedText(ctx, data.folio, folioX + folioW / 2, folioY + folioH / 2 + 2, folioW - 24, 38, 22, '"Plus Jakarta Sans", sans-serif', 800);

      // Caja central de dedicatoria
      drawRoundRect(ctx, 102, 290, W - 204, 330, 26);
      ctx.fillStyle = pal.rowBg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = pal.boxBorder;
      ctx.stroke();

      ctx.fillStyle = pal.ink;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'italic 600 44px "Playfair Display", Georgia, serif';
      const msgText = data.mensaje || 'Disfruta eligiendo tu outfit favorito en Yademar Boutique Chinandega.';
      const msgLines = wrapCanvasText(ctx, msgText, W - 290, 3);
      msgLines.forEach((line, idx) => {
        ctx.fillText(line, 146, 386 + idx * 62, W - 290);
      });

      // Condiciones
      ctx.fillStyle = pal.ink;
      ctx.globalAlpha = 0.85;
      ctx.font = '500 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('• Presenta este folio en tienda física (De la trasera del Calvario 2 ½ c. al este, Chinandega) o en tienda online.', 102, 700, W - 204);
      ctx.fillText(`• Válido hasta el ${Store.formatDateDMY(data.validoHasta)}. No canjeable por efectivo.`, 102, 754, W - 204);
      ctx.globalAlpha = 1;

      // Código de barras grande abajo izquierda
      const bars = Store.generateBarcodeBars(data.folio);
      const barBoxX = 102;
      const barBoxY = 824;
      drawRoundRect(ctx, barBoxX, barBoxY, 560, 150, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      let bx = barBoxX + 28;
      bars.forEach((bw, idx) => {
        if (idx % 2 === 0 && bx < barBoxX + 528) {
          ctx.fillStyle = '#141216';
          ctx.fillRect(bx, barBoxY + 22, bw * 5.2, 106);
        }
        bx += bw * 5.2 + 3.2;
      });
      ctx.fillStyle = pal.ink;
      ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`YDM-${data.folio}`, barBoxX + 6, barBoxY + 190);

      // Contacto derecha
      ctx.textAlign = 'right';
      ctx.fillStyle = pal.ink;
      ctx.font = '700 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('WhatsApp: +505 8956-3257', W - 102, 908);
      ctx.fillStyle = pal.accent;
      ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('@yademar5  •  Yademar Tienda Online', W - 102, 962);
    } else {
      // ---- ANVERSO HD ----
      ctx.fillStyle = pal.accent;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      drawFittedText(ctx, data.motivo, 102, 148, 1180, 28, 20, '"Plus Jakarta Sans", sans-serif', 700);

      ctx.fillStyle = pal.ink;
      ctx.font = '700 108px "Playfair Display", Georgia, serif';
      ctx.fillText('TARJETA', 98, 256);
      ctx.fillText('REGALO', 98, 360);

      // Logo oficial en recuadro blanco
      const logoImg = await loadLogoImageForCanvas();
      const logoBoxW = 310;
      const logoBoxH = 310;
      const logoBoxX = W - 102 - logoBoxW;
      const logoBoxY = 96;
      ctx.save();
      ctx.shadowColor = 'rgba(20, 18, 22, 0.14)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      drawRoundRect(ctx, logoBoxX, logoBoxY, logoBoxW, logoBoxH, 28);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      if (logoImg) {
        const pad = 18;
        const scale = Math.min((logoBoxW - pad * 2) / logoImg.width, (logoBoxH - pad * 2) / logoImg.height);
        const dw = logoImg.width * scale;
        const dh = logoImg.height * scale;
        ctx.drawImage(logoImg, logoBoxX + (logoBoxW - dw) / 2, logoBoxY + (logoBoxH - dh) / 2, dw, dh);
      }

      // Caja de Monto (izquierda centro) con autoajuste
      const amtX = 102;
      const amtY = 448;
      const amtW = 590;
      const amtH = 195;
      drawRoundRect(ctx, amtX, amtY, amtW, amtH, 26);
      ctx.fillStyle = pal.boxBg;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = pal.boxBorder;
      ctx.stroke();

      ctx.fillStyle = pal.accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawFittedText(
        ctx,
        Store.formatRawAmount(data.monto, data.moneda),
        amtX + amtW / 2,
        amtY + amtH / 2 + 4,
        amtW - 44,
        102,
        48,
        '"Playfair Display", Georgia, serif',
        700
      );

      // Texto de canje medido con wrap real dentro de amtW (nunca choca con la columna derecha)
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = pal.ink;
      ctx.globalAlpha = 0.86;
      ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
      const canjeLines = wrapCanvasText(ctx, data.canje, amtW - 12, 3);
      canjeLines.forEach((ln, idx) => {
        ctx.fillText(ln, amtX + 4, amtY + amtH + 54 + idx * 40, amtW - 12);
      });
      ctx.globalAlpha = 1;

      // Filas Para / De / Válido hasta con autoajuste
      const fieldX = 745;
      const fieldW = W - 102 - fieldX;
      const fields = [
        { label: 'Para:', value: data.para },
        { label: 'De:', value: data.de },
        { label: 'Válido hasta:', value: Store.formatDateDMY(data.validoHasta) },
      ];
      fields.forEach((f, idx) => {
        const fy = 456 + idx * 106;
        const fh = 82;
        drawRoundRect(ctx, fieldX, fy, fieldW, fh, 18);
        ctx.fillStyle = pal.rowBg;
        ctx.fill();

        drawRoundRect(ctx, fieldX, fy, 12, fh, 6);
        ctx.fillStyle = pal.rowBar;
        ctx.fill();

        ctx.fillStyle = pal.ink;
        ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.label, fieldX + 32, fy + fh / 2);

        const labelWidth = ctx.measureText(f.label).width;
        const valX = fieldX + 48 + labelWidth;
        const valMaxW = Math.max(120, fieldW - (valX - fieldX) - 24);
        ctx.fillStyle = pal.accent;
        drawFittedText(ctx, f.value, valX, fy + fh / 2, valMaxW, 40, 22, '"Playfair Display", Georgia, serif', 700);
      });

      // Línea divisoria del footer
      const footY = 930;
      ctx.beginPath();
      ctx.moveTo(102, footY);
      ctx.lineTo(W - 102, footY);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = pal.footerLine;
      ctx.stroke();

      // Redes verificadas + Código de barras + Folio Oficial
      const rowY = 1004;
      drawSocialBadge(ctx, 126, rowY, 24, '#1877F2', 'f');
      ctx.fillStyle = pal.ink;
      ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('YADEMAR TIENDA ONLINE', 162, rowY);

      drawSocialBadge(ctx, 646, rowY, 24, '#E1306C', 'ig');
      ctx.fillText('@yademar5', 682, rowY);

      drawSocialBadge(ctx, 944, rowY, 24, '#15803D', 'W');
      ctx.fillText('8956-3257', 980, rowY);

      const bars = Store.generateBarcodeBars(data.folio);
      let bx = 1230;
      const by = rowY - 26;
      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, bx - 12, by - 6, 200, 64, 10);
      ctx.fill();
      bars.forEach((bw, idx) => {
        if (idx % 2 === 0 && bx < 1412) {
          ctx.fillStyle = '#141216';
          ctx.fillRect(bx, by, bw * 2.2, 52);
        }
        bx += bw * 2.2 + 1.5;
      });

      const folioW = 240;
      const folioH = 68;
      const folioX = W - 102 - folioW;
      const folioY = rowY - folioH / 2;
      drawRoundRect(ctx, folioX, folioY, folioW, folioH, 16);
      ctx.fillStyle = pal.folioBg;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = pal.border;
      ctx.stroke();

      ctx.fillStyle = pal.folioText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawFittedText(ctx, data.folio, folioX + folioW / 2, rowY + 1, folioW - 24, 36, 20, '"Plus Jakarta Sans", sans-serif', 800);
    }

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const cleanFileFolio = data.folio.replace(/[^A-Z0-9]/gi, '');
      const suffix = side === 'back' ? 'Reverso' : 'Anverso';
      const link = document.createElement('a');
      link.download = `Tarjeta-Regalo-Yademar-${cleanFileFolio}-${suffix}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Store.showToast(`PNG HD ${suffix} (1800×1125 px) descargado para ${data.folio}`, 'success');
    } catch (_) {
      Store.showToast('No se pudo exportar la imagen PNG. Verifica que logo-data.js esté cargado.', 'error');
    }
  }

  function bindGiftStudioHandlers() {
    const inputs = ['gcCurrency', 'gcAmount', 'gcFolio', 'gcExpiry', 'gcPara', 'gcDe', 'gcMotivo', 'gcCanje', 'gcMessage'];
    inputs.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', updateGiftPreview);
      el.addEventListener('change', updateGiftPreview);
    });

    const gcSearch = $('adminGcSearch');
    if (gcSearch) gcSearch.addEventListener('input', renderGiftCardsTable);

    document.querySelectorAll('#adminGcPresets [data-gc-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $('gcAmount').value = btn.dataset.gcPreset;
        updateGiftPreview();
      });
    });

    document.querySelectorAll('#adminGcThemes .yd-theme-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeGcTheme = btn.dataset.gcTheme;
        document.querySelectorAll('#adminGcThemes .yd-theme-swatch-btn').forEach((b) =>
          b.classList.toggle('is-active', b === btn)
        );
        updateGiftPreview();
      });
    });

    const btnFlip = $('btnFlipGiftCard');
    if (btnFlip) {
      btnFlip.addEventListener('click', () => {
        isGcFlipped = !isGcFlipped;
        $('ydGiftFlipper').classList.toggle('is-flipped', isGcFlipped);
      });
    }

    const btnNextFolio = $('btnNextFolio');
    if (btnNextFolio) {
      btnNextFolio.addEventListener('click', () => {
        $('gcFolio').value = Store.getNextFolio();
        updateGiftPreview();
        Store.showToast(`Siguiente folio asignado: ${$('gcFolio').value}`);
      });
    }

    const form = $('adminGiftForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const saved = validateAndSaveGiftCard();
        if (saved) {
          Store.showToast(`Folio oficial ${saved.folio} guardado y activo para canje`, 'success');
        }
      });
    }

    const btnPng = $('btnDownloadPng');
    if (btnPng) {
      btnPng.addEventListener('click', async () => {
        const saved = validateAndSaveGiftCard();
        if (!saved) return;
        await exportGiftCardPngHD('front');
      });
    }

    const btnBackPng = $('btnDownloadBackPng');
    if (btnBackPng) {
      btnBackPng.addEventListener('click', async () => {
        const saved = validateAndSaveGiftCard();
        if (!saved) return;
        await exportGiftCardPngHD('back');
      });
    }

    const btnPrint = $('btnPrintGiftCard');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        const saved = validateAndSaveGiftCard();
        if (!saved) return;
        isGcFlipped = false;
        $('ydGiftFlipper').classList.remove('is-flipped');
        document.body.classList.add('yd-printing-giftcard');
        window.print();
      });
    }

    window.addEventListener('afterprint', () => {
      document.body.classList.remove('yd-printing-giftcard');
    });

    const btnShareWsp = $('btnShareGiftWsp');
    if (btnShareWsp) {
      btnShareWsp.addEventListener('click', () => {
        const saved = validateAndSaveGiftCard();
        if (!saved) return;
        const msg =
          `¡Tarjeta de Regalo Oficial Yademar Emitida!\n` +
          `• Folio: ${saved.folio}\n` +
          `• Monto: ${Store.formatRawAmount(saved.monto, saved.moneda)}\n` +
          `• Para: ${saved.para}\n` +
          `• De: ${saved.de}\n` +
          `• Válida hasta: ${Store.formatDateDMY(saved.validoHasta)}\n` +
          `Canjeable en tienda física (Chinandega) y tienda online.`;
        window.open(Store.getWhatsAppUrl(msg), '_blank', 'noopener');
      });
    }
  }

  // ---- Modal Detalle de Pedido ----
  function openOrderDetailModal(orderId) {
    const order = Store.getOrderById(orderId);
    if (!order) return;

    $('orderDetailTitle').textContent = `Pedido ${order.id}`;
    $('orderDetailMeta').textContent = `${Store.formatDateDMY(order.fecha)} • Estado: ${order.estado || 'Enviado por WhatsApp'}`;

    const itemsRows = (order.items || [])
      .map(
        (it) => `
        <tr>
          <td class="fw-semibold">${Store.escapeHtml(it.nombre)}</td>
          <td>${Store.escapeHtml(it.talla || '—')} / ${Store.escapeHtml(it.color || '—')}</td>
          <td class="text-center">${it.qty || 1}</td>
          <td class="text-end">${Store.formatMoney((Number(it.precio) || 0) * (Number(it.qty) || 1), 'NIO')}</td>
        </tr>
      `
      )
      .join('');

    $('orderDetailBody').innerHTML = `
      <div class="row g-3 mb-3">
        <div class="col-sm-6">
          <div class="p-3 rounded-3 bg-light border h-100">
            <div class="text-uppercase text-muted fw-bold mb-1" style="font-size:0.7rem;">Cliente</div>
            <div class="fw-bold">${Store.escapeHtml(order.clienteNombre || 'Cliente')}</div>
            <div class="text-muted">${Store.escapeHtml(order.clienteCorreo || '')}</div>
            <div class="mt-1"><i class="bi bi-whatsapp text-success me-1"></i>${Store.escapeHtml(order.clienteTelefono || 'No registrado')}</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="p-3 rounded-3 bg-light border h-100">
            <div class="text-uppercase text-muted fw-bold mb-1" style="font-size:0.7rem;">Entrega &amp; Notas</div>
            <div class="fw-bold">${Store.escapeHtml(order.entregaTipo || 'Retiro en tienda')}</div>
            <div class="text-muted">${Store.escapeHtml(order.direccionEntrega || 'Retiro en Boutique Chinandega')}</div>
            ${order.notas ? `<div class="mt-1 fst-italic text-dark">“${Store.escapeHtml(order.notas)}”</div>` : ''}
          </div>
        </div>
      </div>

      <div class="table-responsive mb-3">
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Artículo</th>
              <th>Talla / Color</th>
              <th class="text-center">Cant.</th>
              <th class="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>

      <div class="p-3 rounded-3 bg-light border">
        <div class="d-flex justify-content-between mb-1">
          <span>Subtotal:</span>
          <strong>${Store.formatMoney(order.subtotalNio, 'NIO')}</strong>
        </div>
        ${
          order.giftCardFolio && order.descuentoGiftCardNio > 0
            ? `<div class="d-flex justify-content-between mb-1 text-success"><span>Gift Card (${Store.escapeHtml(order.giftCardFolio)}):</span><strong>-${Store.formatMoney(order.descuentoGiftCardNio, 'NIO')}</strong></div>`
            : ''
        }
        <div class="d-flex justify-content-between pt-2 mt-2 border-top fs-6">
          <span class="fw-bold">Total:</span>
          <strong class="text-danger">${Store.formatMoney(order.totalNio, 'NIO')}</strong>
        </div>
      </div>
    `;

    const cleanPhone = String(order.clienteTelefono || '').replace(/[^\d]/g, '');
    const wspBtn = $('btnOrderContactWsp');
    if (wspBtn) {
      const targetPhone = cleanPhone.length === 8 ? `505${cleanPhone}` : cleanPhone || (Store.getConfig().whatsapp || '50589563257');
      const msg = `Hola ${order.clienteNombre || ''}, te escribimos de Yademar Boutique sobre tu pedido ${order.id} (${order.estado || 'Confirmado'}).`;
      wspBtn.href = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    }

    const modalEl = $('ydAdminOrderModal');
    if (modalEl && window.bootstrap) {
      orderModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      orderModalInstance.show();
    }
  }

  // ---- Panel 4: CRUD Clientes, Estado de Pedidos & Respaldo JSON ----
  function openClientModal(userId) {
    const form = $('adminClientForm');
    if (!form) return;
    form.reset();
    const errEl = $('cliAdminError');
    if (errEl) errEl.classList.add('d-none');

    const u = userId ? Store.getUserById(userId) : null;
    if (u) {
      $('clientModalTitle').textContent = `Editar Cliente (${u.id})`;
      $('cliAdminEditId').value = u.id;
      $('cliAdminName').value = u.nombre || '';
      $('cliAdminEmail').value = u.correo || '';
      $('cliAdminPhone').value = u.telefono || '';
      $('cliAdminCity').value = u.ciudad || 'Chinandega';
      $('cliAdminAddress').value = u.direccion || '';
      $('cliAdminPin').value = '';
      $('cliAdminPin').required = false;
      $('cliAdminPinHelp').textContent = 'Déjalo vacío para mantener el PIN actual del cliente.';
    } else {
      $('clientModalTitle').textContent = 'Registrar Nuevo Cliente';
      $('cliAdminEditId').value = '';
      $('cliAdminCity').value = 'Chinandega';
      $('cliAdminPin').required = true;
      $('cliAdminPinHelp').textContent = 'Asigna un PIN de al menos 4 dígitos para el cliente.';
    }

    const modalEl = $('ydAdminClientModal');
    if (modalEl && window.bootstrap) {
      clientModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      clientModalInstance.show();
    }
  }

  function renderUsersAndOrders() {
    const usersBody = $('adminUsersTbody');
    if (usersBody) {
      const users = Store.getUsers();
      usersBody.innerHTML = users
        .map((u) => {
          const isAdm = u.rol === 'admin';
          const actionsHtml = isAdm
            ? `<span class="text-muted small">Protegido</span>`
            : `
                <button type="button" class="btn btn-sm btn-outline-dark me-1" data-edit-client="${Store.escapeHtml(u.id)}" title="Editar cliente">
                  <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-del-client="${Store.escapeHtml(u.id)}" title="Eliminar cliente">
                  <i class="bi bi-trash3"></i>
                </button>
              `;
          return `
            <tr>
              <td>
                <div class="fw-semibold text-dark">${Store.escapeHtml(u.nombre)}</div>
                <div class="text-muted" style="font-size:0.74rem;">${Store.escapeHtml(u.id)} &bull; ${Store.escapeHtml(u.ciudad || 'Chinandega')}</div>
              </td>
              <td>
                <div>${Store.escapeHtml(u.correo)}</div>
                <div class="text-muted" style="font-size:0.74rem;">${Store.escapeHtml(u.telefono || 'Sin tel.')}</div>
              </td>
              <td>
                <span class="badge ${isAdm ? 'text-bg-danger' : 'text-bg-secondary'} rounded-pill text-uppercase">
                  ${Store.escapeHtml(u.rol)}
                </span>
              </td>
              <td class="text-end text-nowrap">${actionsHtml}</td>
            </tr>
          `;
        })
        .join('');

      usersBody.querySelectorAll('[data-edit-client]').forEach((btn) => {
        btn.addEventListener('click', () => openClientModal(btn.dataset.editClient));
      });

      usersBody.querySelectorAll('[data-del-client]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const u = Store.getUserById(btn.dataset.delClient);
          if (!u) return;
          if (!window.confirm(`¿Eliminar al cliente "${u.nombre}" (${u.correo})?`)) return;
          const res = Store.deleteClientUser(u.id);
          if (!res.ok) {
            Store.showToast(res.error, 'error');
            return;
          }
          refreshAllPanels();
          Store.showToast(`Cliente "${u.nombre}" eliminado`);
        });
      });
    }

    const ordersBody = $('adminOrdersTbody');
    if (ordersBody) {
      const orders = Store.getAllOrders();
      const statuses = ['Enviado por WhatsApp', 'Confirmado', 'En Preparación', 'Entregado', 'Cancelado'];
      if (orders.length === 0) {
        ordersBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Aún no hay pedidos registrados.</td></tr>`;
      } else {
        ordersBody.innerHTML = orders
          .map((o) => {
            const totalUnits = (o.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0);
            const optionsHtml = statuses
              .map(
                (st) =>
                  `<option value="${Store.escapeHtml(st)}" ${(o.estado || 'Enviado por WhatsApp') === st ? 'selected' : ''}>${Store.escapeHtml(st)}</option>`
              )
              .join('');
            return `
              <tr>
                <td>
                  <button type="button" class="btn btn-sm btn-link p-0 fw-bold text-decoration-none" data-view-order="${Store.escapeHtml(o.id)}">
                    ${Store.escapeHtml(o.id)} <i class="bi bi-eye"></i>
                  </button>
                  <div class="text-muted" style="font-size:0.72rem;">${Store.formatDateDMY(o.fecha)}</div>
                </td>
                <td>
                  <div class="fw-semibold">${Store.escapeHtml(o.clienteNombre || 'Cliente')}</div>
                  <div class="text-muted" style="font-size:0.74rem;">${totalUnits} ud(s) &bull; ${Store.escapeHtml(o.entregaTipo || 'Tienda')}</div>
                </td>
                <td>
                  <select class="form-select form-select-sm" data-order-status="${Store.escapeHtml(o.id)}" aria-label="Estado del pedido ${Store.escapeHtml(o.id)}">
                    ${optionsHtml}
                  </select>
                </td>
                <td class="text-end fw-bold text-danger text-nowrap">${Store.formatMoney(o.totalNio, 'NIO')}</td>
              </tr>
            `;
          })
          .join('');

        ordersBody.querySelectorAll('[data-view-order]').forEach((btn) => {
          btn.addEventListener('click', () => openOrderDetailModal(btn.dataset.viewOrder));
        });

        ordersBody.querySelectorAll('[data-order-status]').forEach((sel) => {
          sel.addEventListener('change', () => {
            Store.updateOrderStatus(sel.dataset.orderStatus, sel.value);
            refreshAllPanels();
            Store.showToast(
              sel.value === 'Cancelado'
                ? `Pedido ${sel.dataset.orderStatus} cancelado (inventario restaurado)`
                : `Pedido ${sel.dataset.orderStatus} → ${sel.value}`,
              'success'
            );
          });
        });
      }
    }
  }

  function bindClientAdminHandlers() {
    const btnNewClient = $('btnOpenNewClientModal');
    if (btnNewClient) btnNewClient.addEventListener('click', () => openClientModal(null));

    const form = $('adminClientForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = $('cliAdminError');
        if (errEl) errEl.classList.add('d-none');

        const res = Store.saveClientUserByAdmin({
          id: $('cliAdminEditId').value || null,
          nombre: $('cliAdminName').value,
          correo: $('cliAdminEmail').value,
          telefono: $('cliAdminPhone').value,
          ciudad: $('cliAdminCity').value,
          direccion: $('cliAdminAddress').value,
          pin: $('cliAdminPin').value,
        });

        if (!res.ok) {
          if (errEl) {
            errEl.textContent = res.error;
            errEl.classList.remove('d-none');
          }
          Store.showToast(res.error, 'error');
          return;
        }

        if (clientModalInstance) clientModalInstance.hide();
        refreshAllPanels();
        Store.showToast(
          res.isEdit
            ? `Cliente "${res.user.nombre}" actualizado`
            : `Cliente "${res.user.nombre}" registrado correctamente`,
          'success'
        );
      });
    }
  }

  function bindJsonDataHandlers() {
    const doExport = () => {
      Store.exportJsonDownload();
      Store.showToast('Archivo store-data.json descargado correctamente', 'success');
    };

    const btnTopExport = $('btnTopExportJson');
    if (btnTopExport) btnTopExport.addEventListener('click', doExport);

    const btnJsonExport = $('btnJsonExport');
    if (btnJsonExport) btnJsonExport.addEventListener('click', doExport);

    const inputImport = $('inputJsonImport');
    if (inputImport) {
      inputImport.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            const res = Store.importJsonObject(parsed);
            if (!res.ok) {
              Store.showToast(res.error, 'error');
              return;
            }
            populateSeasonSelects();
            refreshAllPanels();
            Store.showToast(
              `JSON importado: ${res.countProducts} prendas y ${res.countUsers} usuarios`,
              'success'
            );
          } catch (_) {
            Store.showToast('El archivo seleccionado no es un JSON válido.', 'error');
          } finally {
            inputImport.value = '';
          }
        };
        reader.readAsText(file);
      });
    }

    const btnReset = $('btnJsonReset');
    if (btnReset) {
      btnReset.addEventListener('click', async () => {
        if (!window.confirm('¿Restablecer la caché local a los datos base de store-data.json?')) return;
        await Store.resetLocalCache();
        populateSeasonSelects();
        refreshAllPanels();
        Store.showToast('Caché local restablecida a los datos base');
      });
    }
  }

  function refreshAllPanels() {
    renderDashboard();
    renderCatalogTable();
    renderGiftCardsTable();
    renderUsersAndOrders();
    updateGiftPreview();
  }

  // ---- Inicialización Vista Admin ----
  async function boot() {
    await Store.initStore();
    Store.consumeAdminHandoff();

    const folioInput = $('gcFolio');
    if (folioInput) folioInput.value = Store.getNextFolio();
    const expiryInput = $('gcExpiry');
    if (expiryInput && !expiryInput.value) expiryInput.value = Store.defaultExpiryISO();

    bindPinToggles();
    bindAuthHandlers();
    bindPanelNavigation();
    bindCatalogAdminHandlers();
    bindClientAdminHandlers();
    bindGiftStudioHandlers();
    bindJsonDataHandlers();

    syncAuthView();

    Store.subscribeExternalSync(() => {
      if (Store.isAdminAuthenticated()) {
        populateSeasonSelects();
        refreshAllPanels();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
