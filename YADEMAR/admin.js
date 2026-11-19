/* ============================================================
   YADEMAR — Vista Administrador (admin.js)
   Conecta admin.html con window.YademarStore y Bootstrap 5.3
   Incluye Dashboard, CRUD Catálogo, Estudio Gift Card 3D/HD y JSON
   ============================================================ */

(function () {
  'use strict';

  const Store = window.YademarStore;
  if (!Store) return;

  let prodModalInstance = null;
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

  // ---- Control de Puerta de Acceso (Gate vs Workspace) ----
  function syncAuthView() {
    const adminUser = Store.getAdminSessionUser();
    const gate = $('ydAdminGate');
    const workspace = $('ydAdminWorkspace');

    if (adminUser) {
      gate.classList.add('d-none');
      workspace.classList.remove('d-none');
      const header = $('adminActiveHeader');
      if (header) header.textContent = `${adminUser.nombre} (${adminUser.correo})`;
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
      });
    });
  }

  // ---- Panel 1: Dashboard KPIs y Resumen ----
  function renderDashboard() {
    const products = Store.getProducts();
    const seasons = Store.getSeasons();
    const cards = Store.getAllGiftCards();
    const orders = Store.getAllOrders();

    $('kpiProducts').textContent = String(products.length);
    $('kpiSeasons').textContent = String(seasons.length);
    $('kpiGiftCards').textContent = String(cards.length);
    $('kpiOrders').textContent = String(orders.length);

    const recentCardsEl = $('dashRecentCards');
    if (cards.length === 0) {
      recentCardsEl.innerHTML = `<div class="text-muted py-3 text-center">No hay tarjetas emitidas todavía.</div>`;
    } else {
      recentCardsEl.innerHTML = cards
        .slice(0, 5)
        .map(
          (c) => `
          <div class="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light border">
            <div>
              <span class="badge text-bg-danger me-1">${Store.escapeHtml(c.folio)}</span>
              <strong>${Store.escapeHtml(c.para)}</strong>
              <div class="text-muted" style="font-size:0.74rem;">De: ${Store.escapeHtml(c.de)} &bull; Válida: ${Store.formatDateDMY(c.validoHasta)}</div>
            </div>
            <div class="fw-bold text-dark">${Store.formatRawAmount(c.monto, c.moneda)}</div>
          </div>
        `
        )
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
              <span class="badge text-bg-success me-1">${Store.escapeHtml(o.id)}</span>
              <strong>${Store.escapeHtml(o.clienteNombre || 'Cliente')}</strong>
              <div class="text-muted" style="font-size:0.74rem;">${Store.formatDateDMY(o.fecha)} &bull; ${(o.items || []).length} artículo(s)</div>
            </div>
            <div class="fw-bold text-danger">${Store.formatMoney(o.totalNio, 'NIO')}</div>
          </div>
        `
        )
        .join('');
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
        const statusBadge =
          p.disponible !== false
            ? `<span class="badge text-bg-success rounded-pill">Visible</span>`
            : `<span class="badge text-bg-secondary rounded-pill">Oculta</span>`;
        const tallas = Array.isArray(p.tallas) ? p.tallas.join(', ') : '';
        return `
          <tr>
            <td><img src="${Store.escapeHtml(p.imagenUrl)}" alt="${Store.escapeHtml(p.nombre)}" class="yd-admin-thumb"></td>
            <td>
              <div class="fw-bold text-dark">${Store.escapeHtml(p.nombre)}</div>
              <div class="text-muted" style="font-size:0.75rem;">${Store.escapeHtml(p.id)} &bull; ${Store.escapeHtml(p.etiqueta || '')}</div>
            </td>
            <td>
              <span class="text-capitalize fw-semibold">${Store.escapeHtml(p.categoria)}</span>
              <div class="text-muted" style="font-size:0.75rem;">${Store.escapeHtml(Store.getSeasonLabel(p.temporada))}</div>
            </td>
            <td class="fw-bold text-danger">C$${Math.round(p.precio).toLocaleString('en-US')}</td>
            <td><span class="text-muted">${Store.escapeHtml(tallas)}</span></td>
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

    const p = prodId ? Store.getProductById(prodId) : null;
    if (p) {
      $('prodModalTitle').textContent = `Editar Prenda (${p.id})`;
      $('prodEditId').value = p.id;
      $('prodNombre').value = p.nombre || '';
      $('prodCategoria').value = p.categoria || 'dama';
      $('prodTemporada').value = p.temporada || 'verano';
      $('prodPrecio').value = p.precio || '';
      $('prodPrecioAnt').value = p.precioAnterior || '';
      $('prodTallas').value = Array.isArray(p.tallas) ? p.tallas.join(', ') : 'S, M, L';
      $('prodEtiqueta').value = p.etiqueta || 'Nuevo';
      $('prodImgUrl').value = p.imagenUrl || '';
      $('prodDesc').value = p.descripcion || '';
      $('prodDisponible').checked = p.disponible !== false;
    } else {
      $('prodModalTitle').textContent = 'Agregar Nueva Prenda';
      $('prodEditId').value = '';
      $('prodTallas').value = 'S, M, L';
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
        const res = Store.addOrUpdateProduct({
          id: $('prodEditId').value || null,
          nombre: $('prodNombre').value,
          categoria: $('prodCategoria').value,
          temporada: $('prodTemporada').value,
          precio: Number($('prodPrecio').value),
          precioAnterior: $('prodPrecioAnt').value ? Number($('prodPrecioAnt').value) : undefined,
          tallas: $('prodTallas').value,
          etiqueta: $('prodEtiqueta').value,
          imagenUrl: $('prodImgUrl').value,
          descripcion: $('prodDesc').value,
          disponible: $('prodDisponible').checked,
        });

        if (!res.ok) {
          Store.showToast(res.error, 'error');
          return;
        }

        if (prodModalInstance) prodModalInstance.hide();
        refreshAllPanels();
        Store.showToast(
          res.isEdit
            ? `Prenda "${res.product.nombre}" actualizada`
            : `Prenda "${res.product.nombre}" agregada al catálogo`,
          'success'
        );
      });
    }
  }

  // ---- Panel 3: Estudio Couture 3D de Tarjetas de Regalo ----
  function getGiftFormValues() {
    const moneda = $('gcCurrency').value === 'US$' ? 'US$' : 'C$';
    const monto = Math.max(10, Number($('gcAmount').value) || 1100);
    const folio = Store.normalizeCode($('gcFolio').value || Store.getNextFolio());
    const validoHasta = $('gcExpiry').value || Store.defaultExpiryISO();
    const para = ($('gcPara').value || 'Destinatario Especial').trim();
    const de = ($('gcDe').value || 'Con cariño').trim();
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
    const cards = Store.getAllGiftCards();

    if (cards.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Aún no hay tarjetas de regalo registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = cards
      .map(
        (c) => `
        <tr>
          <td><span class="badge text-bg-danger">${Store.escapeHtml(c.folio)}</span></td>
          <td class="fw-bold">${Store.formatRawAmount(c.monto, c.moneda)}</td>
          <td>
            <div class="fw-semibold text-dark">Para: ${Store.escapeHtml(c.para)}</div>
            <div class="text-muted" style="font-size:0.75rem;">De: ${Store.escapeHtml(c.de)}</div>
          </td>
          <td class="text-capitalize">${Store.escapeHtml(c.tema || 'crimson')}</td>
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
      `
      )
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

  // ---- Generador Canvas PNG HD 1800x1125 px (Sin Taint CORS usando YADEMAR_LOGO_DATA_URI) ----
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

  async function exportGiftCardPngHD() {
    const canvas = $('ydGiftCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1800;
    const H = 1125;
    const data = getGiftFormValues();
    const pal = GC_CANVAS_PALETTES[data.tema] || GC_CANVAS_PALETTES.crimson;

    // Fondo con gradiente couture
    ctx.clearRect(0, 0, W, H);
    drawRoundRect(ctx, 18, 18, W - 36, H - 36, 44);
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, pal.bgStart);
    bgGrad.addColorStop(0.55, pal.bgMid);
    bgGrad.addColorStop(1, pal.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Brillo diagonal sutil
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

    // Marco exterior e interior filigrana
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

    // Motivo superior y título
    ctx.fillStyle = pal.accent;
    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(data.motivo, 102, 148);

    ctx.fillStyle = pal.ink;
    ctx.font = '700 108px "Playfair Display", Georgia, serif';
    ctx.fillText('TARJETA', 98, 256);
    ctx.fillText('REGALO', 98, 360);

    // Logo oficial en recuadro blanco limpio (arriba derecha)
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

    // Caja de Monto (izquierda centro)
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
    ctx.font = '700 102px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Store.formatRawAmount(data.monto, data.moneda), amtX + amtW / 2, amtY + amtH / 2 + 4);

    // Texto de canje debajo del monto
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = pal.ink;
    ctx.globalAlpha = 0.86;
    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    const canjeWords = data.canje.split(' ');
    let line1 = '';
    let line2 = '';
    canjeWords.forEach((w) => {
      if ((line1 + ' ' + w).trim().length <= 28) line1 = (line1 + ' ' + w).trim();
      else line2 = (line2 + ' ' + w).trim();
    });
    ctx.fillText(line1, amtX + 4, amtY + amtH + 58);
    if (line2) ctx.fillText(line2, amtX + 4, amtY + amtH + 100);
    ctx.globalAlpha = 1;

    // Filas Para / De / Válido hasta (derecha centro)
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

      // Barra lateral de acento
      drawRoundRect(ctx, fieldX, fy, 12, fh, 6);
      ctx.fillStyle = pal.rowBar;
      ctx.fill();

      ctx.fillStyle = pal.ink;
      ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.label, fieldX + 32, fy + fh / 2);

      const labelWidth = ctx.measureText(f.label).width;
      ctx.fillStyle = pal.accent;
      ctx.font = '700 40px "Playfair Display", Georgia, serif';
      ctx.fillText(f.value, fieldX + 48 + labelWidth, fy + fh / 2);
    });

    // Línea divisoria del footer
    const footY = 930;
    ctx.beginPath();
    ctx.moveTo(102, footY);
    ctx.lineTo(W - 102, footY);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = pal.footerLine;
    ctx.stroke();

    // Redes verificadas + Folio Oficial
    const rowY = 1004;
    drawSocialBadge(ctx, 126, rowY, 24, '#1877F2', 'f');
    ctx.fillStyle = pal.ink;
    ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('YADEMAR TIENDA ONLINE', 162, rowY);

    drawSocialBadge(ctx, 646, rowY, 24, '#E1306C', 'ig');
    ctx.fillText('@yademar5', 682, rowY);

    drawSocialBadge(ctx, 944, rowY, 24, '#16A34A', 'W');
    ctx.fillText('8956-3257', 980, rowY);

    // Código de barras compacto antes del folio
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

    // Pastilla de Folio Oficial
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
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.folio, folioX + folioW / 2, rowY + 1);

    // Descargar PNG HD
    const cleanFileFolio = data.folio.replace(/[^A-Z0-9]/gi, '');
    const link = document.createElement('a');
    link.download = `Tarjeta-Regalo-Yademar-${cleanFileFolio}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Store.showToast(`PNG HD (1800×1125 px) descargado para ${data.folio}`, 'success');
  }

  function bindGiftStudioHandlers() {
    const inputs = ['gcCurrency', 'gcAmount', 'gcFolio', 'gcExpiry', 'gcPara', 'gcDe', 'gcMotivo', 'gcCanje', 'gcMessage'];
    inputs.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', updateGiftPreview);
      el.addEventListener('change', updateGiftPreview);
    });

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
        const saved = Store.recordGiftCard(getGiftFormValues());
        if (saved) {
          refreshAllPanels();
          Store.showToast(`Folio oficial ${saved.folio} guardado y activo para canje`, 'success');
        }
      });
    }

    const btnPng = $('btnDownloadPng');
    if (btnPng) {
      btnPng.addEventListener('click', async () => {
        Store.recordGiftCard(getGiftFormValues());
        refreshAllPanels();
        await exportGiftCardPngHD();
      });
    }

    const btnPrint = $('btnPrintGiftCard');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        Store.recordGiftCard(getGiftFormValues());
        refreshAllPanels();
        // Asegurar anverso visible al imprimir
        isGcFlipped = false;
        $('ydGiftFlipper').classList.remove('is-flipped');
        window.print();
      });
    }

    const btnShareWsp = $('btnShareGiftWsp');
    if (btnShareWsp) {
      btnShareWsp.addEventListener('click', () => {
        const saved = Store.recordGiftCard(getGiftFormValues());
        refreshAllPanels();
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

  // ---- Panel 4: Usuarios, Pedidos & Respaldo JSON ----
  function renderUsersAndOrders() {
    const usersBody = $('adminUsersTbody');
    if (usersBody) {
      const users = Store.getUsers();
      usersBody.innerHTML = users
        .map(
          (u) => `
          <tr>
            <td>
              <div class="fw-semibold text-dark">${Store.escapeHtml(u.nombre)}</div>
              <div class="text-muted" style="font-size:0.74rem;">${Store.escapeHtml(u.id)} &bull; ${Store.escapeHtml(u.ciudad || 'Chinandega')}</div>
            </td>
            <td>${Store.escapeHtml(u.correo)}</td>
            <td>
              <span class="badge ${u.rol === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'} rounded-pill text-uppercase">
                ${Store.escapeHtml(u.rol)}
              </span>
            </td>
            <td class="text-end">${(u.favoritos || []).length} / ${(u.pedidos || []).length}</td>
          </tr>
        `
        )
        .join('');
    }

    const ordersBody = $('adminOrdersTbody');
    if (ordersBody) {
      const orders = Store.getAllOrders();
      if (orders.length === 0) {
        ordersBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Aún no hay pedidos registrados.</td></tr>`;
      } else {
        ordersBody.innerHTML = orders
          .map(
            (o) => `
            <tr>
              <td><span class="badge text-bg-success">${Store.escapeHtml(o.id)}</span></td>
              <td>
                <div class="fw-semibold">${Store.escapeHtml(o.clienteNombre || 'Cliente')}</div>
                <div class="text-muted" style="font-size:0.74rem;">${(o.items || []).length} artículo(s)${o.giftCardFolio ? ` • GC ${Store.escapeHtml(o.giftCardFolio)}` : ''}</div>
              </td>
              <td>${Store.formatDateDMY(o.fecha)}</td>
              <td class="text-end fw-bold text-danger">${Store.formatMoney(o.totalNio, 'NIO')}</td>
            </tr>
          `
          )
          .join('');
      }
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

    // Inicializar valores por defecto en el estudio de tarjetas
    const folioInput = $('gcFolio');
    if (folioInput) folioInput.value = Store.getNextFolio();
    const expiryInput = $('gcExpiry');
    if (expiryInput && !expiryInput.value) expiryInput.value = Store.defaultExpiryISO();

    bindAuthHandlers();
    bindPanelNavigation();
    bindCatalogAdminHandlers();
    bindGiftStudioHandlers();
    bindJsonDataHandlers();

    syncAuthView();

    Store.subscribeExternalSync(() => {
      syncAuthView();
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
