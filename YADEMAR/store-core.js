/* ============================================================
   YADEMAR — Motor de Datos Compartido (store-core.js)
   Arquitectura modular compartida entre:
     - Vista Cliente  (index.html + client.js)
     - Vista Admin    (admin.html + admin.js)
   Persistencia JSON + fallback offline (file://) + localStorage
   Características:
     - Validación obligatoria por visita (sesiones en memoria)
     - Bolsa y folio Gift Card aislados por cliente
     - Validación de vigencia/saldo y canje de Gift Cards
     - Revalidación de stock/precios en checkout y reversión al cancelar
     - Merge diferencial de productos y clientes (sin resucitar eliminados)
   ============================================================ */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'yademarStoreState_v2';
  const ADMIN_SESSION_KEY = 'yademarAdminSession_v2';
  const ADMIN_HANDOFF_KEY = 'yademarAdminHandoff_v1';

  const IMG_FALLBACK_SVG =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">' +
        '<rect width="600" height="800" fill="#F8F3EF"/>' +
        '<rect x="36" y="36" width="528" height="728" rx="18" fill="none" stroke="#E7DCD6" stroke-width="2"/>' +
        '<text x="300" y="385" text-anchor="middle" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#D90429">Yademar</text>' +
        '<text x="300" y="425" text-anchor="middle" font-family="sans-serif" font-size="14" letter-spacing="3" fill="#6F6773">BOUTIQUE CHINANDEGA</text>' +
      '</svg>'
    );

  const SEASON_LABELS = {
    verano: 'Verano Chinandega',
    urbano: 'Oficina & Urbano',
    eventos: 'Noche & Eventos',
    navidad: 'Fiestas & Navidad',
  };

  const COLOR_HEX_MAP = [
    ['negro', '#141216'],
    ['noir', '#141216'],
    ['blanco', '#FFFFFF'],
    ['marfil', '#F8F4EE'],
    ['crema', '#EFE7DA'],
    ['arena', '#D8C39E'],
    ['beige', '#D8C39E'],
    ['rojo', '#D90429'],
    ['carmes', '#D90429'],
    ['vino', '#7D0620'],
    ['borgo', '#7D0620'],
    ['rosa', '#F4B6CC'],
    ['blush', '#F4B6CC'],
    ['coral', '#E07A5F'],
    ['azul', '#1D3557'],
    ['marino', '#1D3557'],
    ['celeste', '#BFD7EA'],
    ['verde', '#2D6A4F'],
    ['oliva', '#556B2F'],
    ['oro', '#C59B47'],
    ['dorado', '#C59B47'],
    ['champagne', '#D4B475'],
    ['gris', '#5A5760'],
    ['grafito', '#343138'],
    ['café', '#6F4E37'],
    ['cafe', '#6F4E37'],
    ['morado', '#6D28D9'],
    ['lila', '#C084FC'],
    ['amarillo', '#EAB308'],
  ];

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad(num, size) {
    return String(num).padStart(size, '0');
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
  }

  function defaultExpiryISO() {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
  }

  function formatDateDMY(iso) {
    if (!iso || typeof iso !== 'string') return '30/11/2026';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatFolio(num) {
    const clean = Math.max(1, parseInt(num, 10) || 1);
    return `N°${pad(clean, 4)}`;
  }

  function parseFolioNumber(folioStr) {
    const m = String(folioStr || '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function normalizeCode(code) {
    return String(code || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '')
      .replace(/^NO\.?/, 'N°')
      .replace(/^N(?!°)/, 'N°');
  }

  function guessHexForColor(name) {
    const low = String(name || '').toLowerCase();
    for (let i = 0; i < COLOR_HEX_MAP.length; i++) {
      if (low.includes(COLOR_HEX_MAP[i][0])) return COLOR_HEX_MAP[i][1];
    }
    return '#141216';
  }

  function parseColorsInput(input) {
    if (Array.isArray(input) && input.length > 0 && typeof input[0] === 'object') {
      return input
        .filter((c) => c && c.nombre)
        .map((c) => ({ nombre: String(c.nombre).trim(), hex: c.hex || guessHexForColor(c.nombre) }));
    }
    const str = String(input || '').trim();
    if (!str) {
      return [
        { nombre: 'Negro Couture', hex: '#141216' },
        { nombre: 'Carmesí Yademar', hex: '#D90429' },
      ];
    }
    const parts = str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      return [{ nombre: 'Estándar', hex: '#141216' }];
    }
    return parts.map((name) => ({ nombre: name, hex: guessHexForColor(name) }));
  }

  function generateBarcodeBars(code) {
    const clean = String(code || 'N°0001').trim();
    let hash = 2166136261;
    for (let i = 0; i < clean.length; i++) {
      hash ^= clean.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const bars = [];
    bars.push(2, 1, 2, 1);
    for (let i = 0; i < 34; i++) {
      hash ^= hash << 13;
      hash ^= hash >>> 17;
      hash ^= hash << 5;
      const val = Math.abs(hash);
      bars.push((val % 3) + 1);
    }
    bars.push(2, 1, 2);
    return bars;
  }

  let toastTimer = null;
  function showToast(message, type) {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('ydToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ydToast';
      el.className = 'yd-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.remove('yd-toast-error', 'yd-toast-success');
    if (type === 'error') el.classList.add('yd-toast-error');
    if (type === 'success') el.classList.add('yd-toast-success');
    el.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('is-visible');
    }, 3400);
  }

  let state = {
    data: null,
    currency: 'NIO',
    // Sesiones estrictamente en memoria por carga de página (pide validación en cada acceso/recarga)
    activeClientUserId: null,
    activeAdminUserId: null,
    // Carritos aislados por ID de usuario cliente: { [userId]: { items: [], appliedGiftCardFolio: null } }
    cartsByUserId: {},
    deletedProductIds: [],
    customProducts: [],
    editedProducts: {},
    deletedUserIds: [],
    hasImportedProductsOverride: false,
    importedProductsSnapshot: null,
  };

  function getFallbackSeed() {
    if (global.YADEMAR_STORE_FALLBACK) {
      return deepClone(global.YADEMAR_STORE_FALLBACK);
    }
    return {
      config: {
        tienda: 'Yademar',
        handle: '@yademar5',
        whatsapp: '50589563257',
        whatsappDisplay: '8956-3257',
        facebook: 'Yademar Tienda Online',
        direccion: 'De la trasera del Calvario 2 ½ c. al este, Chinandega 25000',
        tasaCambio: 36.62,
        ultimoFolio: 1,
        heroImagenUrl: IMG_FALLBACK_SVG,
      },
      temporadas: [],
      productos: [],
      usuarios: [
        {
          id: 'U-ADMIN',
          nombre: 'Administración Yademar',
          correo: 'admin@yademar.ni',
          pin: '2026',
          rol: 'admin',
          ciudad: 'Chinandega',
          direccion: 'De la trasera del Calvario 2 ½ c. al este, Chinandega',
          telefono: '8956-3257',
          favoritos: [],
          pedidos: [],
          giftCards: [],
        },
        {
          id: 'U-CLI-01',
          nombre: 'Isabella Castro',
          correo: 'cliente@yademar.ni',
          pin: '1234',
          rol: 'cliente',
          ciudad: 'Chinandega',
          direccion: 'Chinandega Centro',
          telefono: '8800-1122',
          favoritos: [],
          pedidos: [],
          giftCards: [],
        },
      ],
    };
  }

  function normalizeProduct(p) {
    const stockVal = Number.isFinite(Number(p.stock)) ? Math.max(0, Math.floor(Number(p.stock))) : 10;
    return {
      ...p,
      precio: Math.max(1, Math.round(Number(p.precio) || 0)),
      stock: stockVal,
      tallas: Array.isArray(p.tallas) && p.tallas.length > 0 ? p.tallas : ['S', 'M', 'L'],
      colores: parseColorsInput(p.colores),
      disponible: p.disponible !== false,
      imagenUrl: p.imagenUrl || IMG_FALLBACK_SVG,
    };
  }

  function normalizeGiftCard(gc) {
    const monto = Number(gc.monto) || 1100;
    const saldo =
      typeof gc.saldoRestante === 'number' && Number.isFinite(gc.saldoRestante)
        ? Math.max(0, gc.saldoRestante)
        : gc.canjeada
        ? 0
        : monto;
    return {
      ...gc,
      folio: normalizeCode(gc.folio || 'N°0001'),
      monto,
      moneda: gc.moneda === 'US$' ? 'US$' : 'C$',
      saldoRestante: saldo,
      canjeada: Boolean(gc.canjeada || saldo <= 0),
    };
  }

  /**
   * Fusiona usuarios respetando ediciones de correo/PIN en clientes y respetando eliminaciones (deletedUserIds).
   * La cuenta admin principal conserva sus credenciales autoritativas del JSON base.
   */
  function mergeUsers(baseUsers, savedUsers, deletedUserIds) {
    const baseList = Array.isArray(baseUsers) ? deepClone(baseUsers) : [];
    const savedList = Array.isArray(savedUsers) ? savedUsers : [];
    const deletedSet = new Set(Array.isArray(deletedUserIds) ? deletedUserIds : []);
    const merged = [];

    baseList.forEach((baseUser) => {
      const isAdminBase = baseUser.rol === 'admin';
      if (!isAdminBase && deletedSet.has(baseUser.id)) return;

      const saved = savedList.find(
        (u) =>
          u &&
          (u.id === baseUser.id ||
            (u.correo &&
              baseUser.correo &&
              String(u.correo).toLowerCase() === String(baseUser.correo).toLowerCase()))
      );

      if (saved) {
        const rawCards =
          Array.isArray(saved.giftCards)
            ? saved.giftCards
            : Array.isArray(baseUser.giftCards)
            ? baseUser.giftCards
            : [];
        merged.push({
          ...saved,
          id: baseUser.id,
          rol: baseUser.rol,
          // Admin siempre autoritativo desde JSON; clientes respetan ediciones guardadas
          correo: isAdminBase ? baseUser.correo : saved.correo || baseUser.correo,
          pin: isAdminBase ? String(baseUser.pin) : String(saved.pin || baseUser.pin),
          nombre: saved.nombre || baseUser.nombre,
          ciudad: saved.ciudad || baseUser.ciudad || 'Chinandega',
          direccion: saved.direccion || baseUser.direccion || 'Chinandega',
          telefono: saved.telefono || baseUser.telefono || '',
          favoritos: Array.isArray(saved.favoritos)
            ? saved.favoritos
            : Array.isArray(baseUser.favoritos)
            ? baseUser.favoritos
            : [],
          pedidos: Array.isArray(saved.pedidos)
            ? saved.pedidos
            : Array.isArray(baseUser.pedidos)
            ? baseUser.pedidos
            : [],
          giftCards: rawCards.map(normalizeGiftCard),
        });
      } else {
        merged.push({
          ...baseUser,
          pin: String(baseUser.pin || ''),
          ciudad: baseUser.ciudad || 'Chinandega',
          direccion: baseUser.direccion || 'Chinandega',
          telefono: baseUser.telefono || '',
          favoritos: Array.isArray(baseUser.favoritos) ? baseUser.favoritos : [],
          pedidos: Array.isArray(baseUser.pedidos) ? baseUser.pedidos : [],
          giftCards: (Array.isArray(baseUser.giftCards) ? baseUser.giftCards : []).map(normalizeGiftCard),
        });
      }
    });

    savedList.forEach((saved) => {
      if (!saved || !saved.correo || deletedSet.has(saved.id)) return;
      const exists = merged.some(
        (u) =>
          u.id === saved.id ||
          String(u.correo).toLowerCase() === String(saved.correo).toLowerCase()
      );
      if (!exists) {
        merged.push({
          ...saved,
          rol: saved.rol === 'admin' ? 'cliente' : saved.rol || 'cliente',
          pin: String(saved.pin || '1234'),
          ciudad: saved.ciudad || 'Chinandega',
          direccion: saved.direccion || saved.ciudad || 'Chinandega',
          telefono: saved.telefono || '',
          favoritos: Array.isArray(saved.favoritos) ? saved.favoritos : [],
          pedidos: Array.isArray(saved.pedidos) ? saved.pedidos : [],
          giftCards: (Array.isArray(saved.giftCards) ? saved.giftCards : []).map(normalizeGiftCard),
        });
      }
    });

    return merged;
  }

  /**
   * Merge diferencial de productos: permite que nuevos artículos en store-data.json
   * aparezcan automáticamente sin ser bloqueados por snapshots viejos.
   */
  function mergeProducts(baseProducts, savedOverlay) {
    const baseList = Array.isArray(baseProducts) ? deepClone(baseProducts) : [];
    const deleted = new Set(Array.isArray(savedOverlay.deletedProductIds) ? savedOverlay.deletedProductIds : []);
    const editedMap = savedOverlay.editedProducts && typeof savedOverlay.editedProducts === 'object' ? savedOverlay.editedProducts : {};
    const customList = Array.isArray(savedOverlay.customProducts) ? deepClone(savedOverlay.customProducts) : [];

    // Solo usar snapshot completo si proviene de una importación manual de JSON
    if (savedOverlay.hasImportedProductsOverride && Array.isArray(savedOverlay.importedProductsSnapshot)) {
      return deepClone(savedOverlay.importedProductsSnapshot).map(normalizeProduct);
    }

    const result = [];
    // Productos agregados por admin primero (más recientes arriba)
    customList.forEach((custom) => {
      if (!custom || !custom.id || deleted.has(custom.id)) return;
      const edited = editedMap[custom.id] ? deepClone(editedMap[custom.id]) : null;
      result.push(normalizeProduct(edited ? { ...custom, ...edited, id: custom.id } : custom));
    });

    baseList.forEach((prod) => {
      if (deleted.has(prod.id)) return;
      if (result.some((r) => r.id === prod.id)) return;
      if (editedMap[prod.id]) {
        result.push(normalizeProduct({ ...prod, ...deepClone(editedMap[prod.id]), id: prod.id }));
      } else {
        result.push(normalizeProduct(prod));
      }
    });

    return result;
  }

  function readPersistedRaw() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function persistState() {
    if (!state.data) return false;
    try {
      const payload = {
        version: 5,
        updatedAt: new Date().toISOString(),
        currency: state.currency,
        cartsByUserId: state.cartsByUserId,
        ultimoFolio: state.data.config.ultimoFolio,
        usuarios: state.data.usuarios,
        temporadasOverride: state.data.temporadas,
        deletedProductIds: state.deletedProductIds,
        customProducts: state.customProducts,
        editedProducts: state.editedProducts,
        deletedUserIds: state.deletedUserIds,
        hasImportedProductsOverride: state.hasImportedProductsOverride,
        importedProductsSnapshot: state.hasImportedProductsOverride ? state.data.productos : null,
      };
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
      return true;
    } catch (_) {
      showToast('No se pudieron guardar los cambios en almacenamiento local (revisa espacio o modo privado).', 'error');
      return false;
    }
  }

  async function loadBaseJson() {
    const seed = getFallbackSeed();
    const isHttp =
      typeof global.location !== 'undefined' &&
      (global.location.protocol === 'http:' || global.location.protocol === 'https:');
    if (isHttp && typeof global.fetch === 'function') {
      try {
        const res = await global.fetch('data/store-data.json', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json && json.config && Array.isArray(json.productos)) {
            return json;
          }
        }
      } catch (_) {
        // Fallback offline
      }
    }
    return seed;
  }

  async function initStore() {
    const baseData = await loadBaseJson();
    const saved = readPersistedRaw();

    const merged = deepClone(baseData);
    if (!merged.config) merged.config = getFallbackSeed().config;
    if (!Array.isArray(merged.temporadas)) merged.temporadas = [];
    if (!Array.isArray(merged.productos)) merged.productos = [];
    if (!Array.isArray(merged.usuarios)) merged.usuarios = getFallbackSeed().usuarios;

    if (saved && typeof saved === 'object') {
      state.deletedUserIds = Array.isArray(saved.deletedUserIds) ? saved.deletedUserIds : [];
      state.deletedProductIds = Array.isArray(saved.deletedProductIds) ? saved.deletedProductIds : [];
      state.customProducts = Array.isArray(saved.customProducts) ? saved.customProducts : [];
      state.editedProducts = saved.editedProducts && typeof saved.editedProducts === 'object' ? saved.editedProducts : {};
      state.hasImportedProductsOverride = Boolean(saved.hasImportedProductsOverride);
      state.importedProductsSnapshot = Array.isArray(saved.importedProductsSnapshot)
        ? saved.importedProductsSnapshot
        : null;

      merged.usuarios = mergeUsers(merged.usuarios, saved.usuarios, state.deletedUserIds);
      merged.productos = mergeProducts(merged.productos, saved);
      if (Array.isArray(saved.temporadasOverride) && saved.temporadasOverride.length > 0) {
        merged.temporadas = deepClone(saved.temporadasOverride);
      }
      if (typeof saved.ultimoFolio === 'number' && saved.ultimoFolio > (merged.config.ultimoFolio || 0)) {
        merged.config.ultimoFolio = saved.ultimoFolio;
      }
      state.currency = saved.currency === 'USD' ? 'USD' : 'NIO';
      state.cartsByUserId =
        saved.cartsByUserId && typeof saved.cartsByUserId === 'object' ? saved.cartsByUserId : {};
    } else {
      merged.usuarios = mergeUsers(merged.usuarios, [], []);
      merged.productos = merged.productos.map(normalizeProduct);
      state.currency = 'NIO';
      state.cartsByUserId = {};
      state.deletedUserIds = [];
      state.deletedProductIds = [];
      state.customProducts = [];
      state.editedProducts = {};
      state.hasImportedProductsOverride = false;
      state.importedProductsSnapshot = null;
    }

    // Limpiar cualquier sesión persistida antigua para exigir validación en cada visita
    try {
      if (global.localStorage) global.localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (_) {
      // Ignore
    }

    state.data = merged;

    if (state.activeClientUserId) {
      const stillExists = state.data.usuarios.some((u) => u.id === state.activeClientUserId);
      if (!stillExists) state.activeClientUserId = null;
    }
    if (state.activeAdminUserId) {
      const stillAdmin = state.data.usuarios.some(
        (u) => u.id === state.activeAdminUserId && u.rol === 'admin'
      );
      if (!stillAdmin) state.activeAdminUserId = null;
    }

    const allCards = getAllGiftCards();
    const maxFolio = allCards.reduce((max, c) => Math.max(max, parseFolioNumber(c.folio)), 0);
    if (maxFolio > (state.data.config.ultimoFolio || 0)) {
      state.data.config.ultimoFolio = maxFolio;
    }

    return state.data;
  }

  function authenticate(identifier, pin) {
    if (!state.data || !Array.isArray(state.data.usuarios)) return null;
    const rawId = String(identifier || '').trim().toLowerCase();
    const rawPin = String(pin || '').trim();
    if (!rawId || !rawPin) return null;

    const users = state.data.usuarios;
    const matched = users.find((u) => {
      if (String(u.pin || '').trim() !== rawPin) return false;
      const email = String(u.correo || '').trim().toLowerCase();
      const prefix = email.includes('@') ? email.split('@')[0] : email;
      const uid = String(u.id || '').trim().toLowerCase();
      const role = String(u.rol || '').trim().toLowerCase();
      if (rawId === email || rawId === prefix || rawId === uid) return true;
      if (rawId === role) {
        const sameRoleCount = users.filter((x) => String(x.rol || '').toLowerCase() === role).length;
        return sameRoleCount === 1 || role === 'admin';
      }
      return false;
    });

    return matched || null;
  }

  // ---- Sesión y CRUD Clientes ----
  function getActiveClientUser() {
    if (!state.data || !state.activeClientUserId) return null;
    return state.data.usuarios.find((u) => u.id === state.activeClientUserId) || null;
  }

  function isClientAuthenticated() {
    return Boolean(getActiveClientUser());
  }

  function loginClient(identifier, pin) {
    const user = authenticate(identifier, pin);
    if (!user) {
      return { ok: false, error: 'Usuario o PIN incorrecto. Verifica tus credenciales.' };
    }
    if (user.rol === 'admin') {
      createAdminHandoff(user.id);
      return { ok: true, isAdmin: true, user };
    }
    state.activeClientUserId = user.id;
    return { ok: true, isAdmin: false, user };
  }

  function logoutClient() {
    state.activeClientUserId = null;
  }

  function getUserById(userId) {
    if (!state.data) return null;
    return state.data.usuarios.find((u) => u.id === userId) || null;
  }

  function setActiveClientUser(userId) {
    if (!state.data) return null;
    const found = state.data.usuarios.find((u) => u.id === userId);
    if (found) {
      state.activeClientUserId = found.id;
      return found;
    }
    return null;
  }

  function resetClientToDefault() {
    state.activeClientUserId = null;
    return null;
  }

  function registerClientUser({ nombre, correo, pin, ciudad, direccion, telefono }, options) {
    if (!state.data) return { ok: false, error: 'Tienda no inicializada.' };
    const opts = options || { setActive: true };
    const cleanEmail = String(correo || '').trim().toLowerCase();
    const cleanName = String(nombre || '').trim();
    const cleanPin = String(pin || '').trim();

    if (!cleanName || !cleanEmail || !cleanEmail.includes('@') || cleanPin.length < 4) {
      return { ok: false, error: 'Completa nombre, correo válido y un PIN de al menos 4 dígitos.' };
    }

    const exists = state.data.usuarios.some(
      (u) => String(u.correo || '').trim().toLowerCase() === cleanEmail
    );
    if (exists) {
      return { ok: false, error: 'Ya existe una cuenta registrada con ese correo electrónico.' };
    }

    const maxCliNum = state.data.usuarios.reduce((m, u) => {
      const match = String(u.id || '').match(/U-CLI-(\d+)/);
      return match ? Math.max(m, parseInt(match[1], 10)) : m;
    }, 1);

    const newUser = {
      id: `U-CLI-${pad(maxCliNum + 1, 2)}`,
      nombre: cleanName,
      correo: cleanEmail,
      pin: cleanPin,
      rol: 'cliente',
      ciudad: String(ciudad || 'Chinandega').trim(),
      direccion: String(direccion || ciudad || 'Chinandega').trim(),
      telefono: String(telefono || '').trim(),
      favoritos: [],
      pedidos: [],
      giftCards: [],
    };

    state.data.usuarios.push(newUser);
    if (opts.setActive !== false) {
      state.activeClientUserId = newUser.id;
    }
    persistState();
    return { ok: true, user: newUser };
  }

  function updateActiveClientProfile({ nombre, telefono, ciudad, direccion }) {
    const user = getActiveClientUser();
    if (!user) return { ok: false, error: 'No hay una cuenta cliente activa.' };
    const cleanName = String(nombre || '').trim();
    if (!cleanName) return { ok: false, error: 'El nombre no puede estar vacío.' };
    user.nombre = cleanName;
    user.telefono = String(telefono || '').trim();
    user.ciudad = String(ciudad || 'Chinandega').trim();
    user.direccion = String(direccion || '').trim();
    persistState();
    return { ok: true, user };
  }

  function saveClientUserByAdmin({ id, nombre, correo, pin, ciudad, direccion, telefono }) {
    if (!state.data) return { ok: false, error: 'Tienda no inicializada.' };
    const cleanName = String(nombre || '').trim();
    const cleanEmail = String(correo || '').trim().toLowerCase();
    const cleanPin = String(pin || '').trim();

    if (!cleanName || !cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'Ingresa nombre completo y un correo electrónico válido.' };
    }

    const existing = id ? getUserById(id) : null;
    if (existing) {
      if (existing.rol === 'admin') {
        return { ok: false, error: 'La cuenta principal de administrador no puede editarse desde el listado de clientes.' };
      }
      const dup = state.data.usuarios.some(
        (u) => u.id !== existing.id && String(u.correo || '').toLowerCase() === cleanEmail
      );
      if (dup) {
        return { ok: false, error: 'Otro usuario ya utiliza ese correo electrónico.' };
      }
      existing.nombre = cleanName;
      existing.correo = cleanEmail;
      if (cleanPin.length >= 4) existing.pin = cleanPin;
      existing.ciudad = String(ciudad || 'Chinandega').trim();
      existing.direccion = String(direccion || '').trim();
      existing.telefono = String(telefono || '').trim();
      persistState();
      return { ok: true, user: existing, isEdit: true };
    }

    if (cleanPin.length < 4) {
      return { ok: false, error: 'El PIN del nuevo cliente debe tener al menos 4 caracteres.' };
    }
    const created = registerClientUser(
      { nombre: cleanName, correo: cleanEmail, pin: cleanPin, ciudad, direccion, telefono },
      { setActive: false }
    );
    if (!created.ok) return created;
    return { ok: true, user: created.user, isEdit: false };
  }

  function deleteClientUser(userId) {
    if (!state.data) return { ok: false, error: 'Tienda no inicializada.' };
    const target = getUserById(userId);
    if (!target) return { ok: false, error: 'Cliente no encontrado.' };
    if (target.rol === 'admin') {
      return { ok: false, error: 'No se puede eliminar la cuenta de administrador.' };
    }
    const clients = state.data.usuarios.filter((u) => u.rol === 'cliente');
    if (clients.length <= 1) {
      return { ok: false, error: 'Debe existir al menos un cliente registrado en el sistema.' };
    }
    state.data.usuarios = state.data.usuarios.filter((u) => u.id !== userId);
    if (!state.deletedUserIds.includes(userId)) {
      state.deletedUserIds.push(userId);
    }
    delete state.cartsByUserId[userId];
    if (state.activeClientUserId === userId) {
      state.activeClientUserId = null;
    }
    persistState();
    return { ok: true };
  }

  // ---- Sesión Administrador (en memoria + handoff 1 solo uso) ----
  function createAdminHandoff(userId) {
    try {
      if (global.sessionStorage) {
        global.sessionStorage.setItem(
          ADMIN_HANDOFF_KEY,
          JSON.stringify({ userId, ts: Date.now() })
        );
      }
    } catch (_) {
      // Ignore
    }
  }

  function consumeAdminHandoff() {
    if (!state.data) return null;
    try {
      if (!global.sessionStorage) return null;
      const raw = global.sessionStorage.getItem(ADMIN_HANDOFF_KEY);
      global.sessionStorage.removeItem(ADMIN_HANDOFF_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.userId || Date.now() - Number(parsed.ts || 0) > 15000) {
        return null;
      }
      const admin = state.data.usuarios.find((u) => u.id === parsed.userId && u.rol === 'admin');
      if (admin) {
        state.activeAdminUserId = admin.id;
        return admin;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  function getAdminSessionUser() {
    if (!state.data || !state.activeAdminUserId) return null;
    return (
      state.data.usuarios.find((u) => u.id === state.activeAdminUserId && u.rol === 'admin') ||
      null
    );
  }

  function isAdminAuthenticated() {
    return Boolean(getAdminSessionUser());
  }

  function loginAdmin(identifier, pin) {
    const user = authenticate(identifier, pin);
    if (!user) {
      return { ok: false, error: 'Usuario o PIN incorrecto. Verifica tus credenciales de administrador.' };
    }
    if (user.rol !== 'admin') {
      return {
        ok: false,
        error: 'Esta cuenta tiene rol Cliente. Solo cuentas con rol Administrador pueden acceder al panel.',
      };
    }
    state.activeAdminUserId = user.id;
    return { ok: true, user };
  }

  function logoutAdmin() {
    state.activeAdminUserId = null;
    try {
      if (global.sessionStorage) global.sessionStorage.removeItem(ADMIN_HANDOFF_KEY);
    } catch (_) {
      // Ignore
    }
  }

  // ---- Moneda ----
  function getCurrency() {
    return state.currency;
  }

  function setCurrency(curr) {
    state.currency = curr === 'USD' ? 'USD' : 'NIO';
    persistState();
  }

  function formatMoney(nioAmount, overrideCurrency) {
    const curr = overrideCurrency || state.currency;
    const rate = (state.data && state.data.config && state.data.config.tasaCambio) || 36.62;
    const val = Number(nioAmount) || 0;
    if (curr === 'USD' || curr === 'US$') {
      const usd = val / rate;
      return `US$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `C$${Math.round(val).toLocaleString('en-US')}`;
  }

  function formatRawAmount(amount, currencySymbol) {
    const val = Number(amount) || 0;
    if (currencySymbol === 'US$' || currencySymbol === 'USD') {
      return `US$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `C$${Math.round(val).toLocaleString('en-US')}`;
  }

  // ---- Productos + Stock / Cantidad ----
  function getProducts() {
    return (state.data && state.data.productos) || [];
  }

  function getProductById(id) {
    return getProducts().find((p) => p.id === id) || null;
  }

  function getSeasons() {
    return (state.data && state.data.temporadas) || [];
  }

  function getSeasonLabel(seasonId) {
    const s = getSeasons().find((t) => t.id === seasonId);
    return (s && s.nombre) || SEASON_LABELS[seasonId] || seasonId || 'Colección';
  }

  function addOrUpdateProduct(productPayload) {
    if (!state.data) return { ok: false, error: 'Tienda no inicializada.' };
    const cleanName = String(productPayload.nombre || '').trim();
    const cleanPrice = Number(productPayload.precio);
    const parsedStock =
      productPayload.stock === undefined || productPayload.stock === ''
        ? 10
        : Math.max(0, Math.floor(Number(productPayload.stock)));

    if (!cleanName || !Number.isFinite(cleanPrice) || cleanPrice <= 0) {
      return { ok: false, error: 'Ingresa un nombre válido y un precio mayor a 0.' };
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      return { ok: false, error: 'La cantidad en inventario debe ser 0 o mayor.' };
    }

    const tallasArr = Array.isArray(productPayload.tallas)
      ? productPayload.tallas.map((t) => String(t).trim()).filter(Boolean)
      : String(productPayload.tallas || 'S, M, L')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const coloresArr = parseColorsInput(productPayload.colores);
    const imgUrl = String(productPayload.imagenUrl || '').trim() || IMG_FALLBACK_SVG;
    const isEdit = Boolean(productPayload.id && getProductById(productPayload.id));

    let prodId = productPayload.id;
    if (!isEdit) {
      const maxNum = state.data.productos.reduce((max, p) => {
        const m = String(p.id || '').match(/(\d+)$/);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 12);
      prodId = `YD-${pad(maxNum + 1, 2)}`;
    }

    const record = {
      id: prodId,
      nombre: cleanName,
      categoria: productPayload.categoria === 'caballero' ? 'caballero' : 'dama',
      temporada: productPayload.temporada || 'verano',
      precio: Math.round(cleanPrice),
      precioAnterior:
        productPayload.precioAnterior && Number(productPayload.precioAnterior) > cleanPrice
          ? Math.round(Number(productPayload.precioAnterior))
          : undefined,
      stock: parsedStock,
      tallas: tallasArr.length > 0 ? tallasArr : ['S', 'M', 'L'],
      colores: coloresArr,
      etiqueta: String(productPayload.etiqueta || 'Nuevo').trim(),
      disponible: productPayload.disponible !== false,
      descripcion:
        String(productPayload.descripcion || '').trim() ||
        'Prenda seleccionada de la colección Yademar Boutique Chinandega.',
      imagenUrl: imgUrl,
    };

    if (!record.precioAnterior) delete record.precioAnterior;

    if (isEdit) {
      const idx = state.data.productos.findIndex((p) => p.id === prodId);
      if (idx >= 0) state.data.productos[idx] = record;
      state.editedProducts[prodId] = record;
    } else {
      state.data.productos.unshift(record);
      state.customProducts.unshift(record);
    }

    persistState();
    return { ok: true, product: record, isEdit };
  }

  function adjustProductStock(prodId, delta) {
    const prod = getProductById(prodId);
    if (!prod) return null;
    prod.stock = Math.max(0, (Number(prod.stock) || 0) + (parseInt(delta, 10) || 0));
    state.editedProducts[prodId] = prod;
    persistState();
    return prod.stock;
  }

  function deleteProduct(prodId) {
    if (!state.data) return false;
    const before = state.data.productos.length;
    state.data.productos = state.data.productos.filter((p) => p.id !== prodId);
    if (state.data.productos.length === before) return false;
    if (!state.deletedProductIds.includes(prodId)) {
      state.deletedProductIds.push(prodId);
    }
    state.customProducts = state.customProducts.filter((p) => p.id !== prodId);
    delete state.editedProducts[prodId];
    persistState();
    return true;
  }

  // ---- Favoritos y Bolsa Aislada por Cliente ----
  function ensureActiveCartBucket() {
    const uid = state.activeClientUserId;
    if (!uid) return { items: [], appliedGiftCardFolio: null };
    if (!state.cartsByUserId[uid] || typeof state.cartsByUserId[uid] !== 'object') {
      state.cartsByUserId[uid] = { items: [], appliedGiftCardFolio: null };
    }
    if (!Array.isArray(state.cartsByUserId[uid].items)) {
      state.cartsByUserId[uid].items = [];
    }
    return state.cartsByUserId[uid];
  }

  function toggleFavorite(prodId) {
    const user = getActiveClientUser();
    if (!user) return false;
    if (!Array.isArray(user.favoritos)) user.favoritos = [];
    const idx = user.favoritos.indexOf(prodId);
    let added = false;
    if (idx >= 0) {
      user.favoritos.splice(idx, 1);
    } else {
      user.favoritos.push(prodId);
      added = true;
    }
    persistState();
    return added;
  }

  function getCart() {
    return ensureActiveCartBucket().items;
  }

  function getCartQtyForProduct(prodId) {
    return getCart()
      .filter((c) => c.id === prodId)
      .reduce((sum, c) => sum + (Number(c.qty) || 0), 0);
  }

  function addToCart(item) {
    const bucket = ensureActiveCartBucket();
    const reqQty = Math.max(1, parseInt(item.qty, 10) || 1);
    const key = `${item.id}|${item.talla || ''}|${item.color || ''}`;
    const existing = bucket.items.find((c) => c.key === key);

    if (!item.esGiftCardSolicitud) {
      const prod = getProductById(item.id);
      if (prod) {
        if (prod.disponible === false) {
          return { ok: false, error: `"${prod.nombre}" no está disponible en este momento.`, cart: bucket.items };
        }
        const available = Number(prod.stock) || 0;
        const alreadyInCart = getCartQtyForProduct(prod.id);
        if (available <= 0) {
          return { ok: false, error: `"${prod.nombre}" está agotada en este momento.`, cart: bucket.items };
        }
        if (alreadyInCart + reqQty > available) {
          const remaining = Math.max(0, available - alreadyInCart);
          return {
            ok: false,
            error:
              remaining > 0
                ? `Solo quedan ${remaining} unidad(es) disponibles para agregar de "${prod.nombre}".`
                : `Ya tienes el máximo disponible (${available} uds) de "${prod.nombre}" en tu bolsa.`,
            cart: bucket.items,
          };
        }
      }
    }

    if (existing) {
      existing.qty += reqQty;
    } else {
      bucket.items.push({
        key,
        id: item.id,
        nombre: item.nombre,
        precio: Number(item.precio) || 0,
        talla: item.talla || 'Única',
        color: item.color || 'Estándar',
        imagenUrl: item.imagenUrl || IMG_FALLBACK_SVG,
        qty: reqQty,
        esGiftCardSolicitud: Boolean(item.esGiftCardSolicitud),
      });
    }
    persistState();
    return { ok: true, cart: bucket.items, addedQty: reqQty };
  }

  function updateCartQty(key, delta) {
    const bucket = ensureActiveCartBucket();
    const idx = bucket.items.findIndex((c) => c.key === key);
    if (idx < 0) return { ok: false };
    const item = bucket.items[idx];
    const nextQty = item.qty + delta;

    if (nextQty <= 0) {
      bucket.items.splice(idx, 1);
      persistState();
      return { ok: true, removed: true };
    }

    if (delta > 0 && !item.esGiftCardSolicitud) {
      const prod = getProductById(item.id);
      if (prod) {
        const available = Number(prod.stock) || 0;
        const totalInCart = getCartQtyForProduct(prod.id);
        if (totalInCart + delta > available) {
          return { ok: false, error: `Stock máximo disponible: ${available} unidad(es).` };
        }
      }
    }

    item.qty = nextQty;
    persistState();
    return { ok: true, qty: item.qty };
  }

  function removeFromCart(key) {
    const bucket = ensureActiveCartBucket();
    bucket.items = bucket.items.filter((c) => c.key !== key);
    persistState();
  }

  function clearCart() {
    const bucket = ensureActiveCartBucket();
    bucket.items = [];
    bucket.appliedGiftCardFolio = null;
    persistState();
  }

  // ---- Estado y Validación Dinámica de Gift Cards ----
  function getGiftCardStatus(card) {
    if (!card) return 'Inválida';
    const saldo = typeof card.saldoRestante === 'number' ? card.saldoRestante : Number(card.monto) || 0;
    if (card.canjeada || saldo <= 0) return 'Canjeada';
    if (card.validoHasta && card.validoHasta < todayISO()) return 'Vencida';
    return 'Vigente';
  }

  function getGiftCardAvailableNio(card) {
    if (!card || getGiftCardStatus(card) !== 'Vigente') return 0;
    const saldo = typeof card.saldoRestante === 'number' ? card.saldoRestante : Number(card.monto) || 0;
    const rate = (state.data && state.data.config && state.data.config.tasaCambio) || 36.62;
    return card.moneda === 'US$' ? Math.round(saldo * rate) : Math.round(saldo);
  }

  function getAppliedGiftCard() {
    const bucket = ensureActiveCartBucket();
    if (!bucket.appliedGiftCardFolio) return null;
    const liveCard = findGiftCardByCode(bucket.appliedGiftCardFolio);
    if (!liveCard || getGiftCardStatus(liveCard) !== 'Vigente') {
      bucket.appliedGiftCardFolio = null;
      return null;
    }
    return liveCard;
  }

  function applyGiftCardCode(codeInput) {
    const found = findGiftCardByCode(codeInput);
    if (!found) {
      return { ok: false, error: 'Folio no encontrado en el registro oficial de Yademar.' };
    }
    const status = getGiftCardStatus(found);
    if (status === 'Canjeada') {
      return { ok: false, error: `El folio ${found.folio} ya fue canjeado completamente.` };
    }
    if (status === 'Vencida') {
      return { ok: false, error: `El folio ${found.folio} venció el ${formatDateDMY(found.validoHasta)}.` };
    }
    const bucket = ensureActiveCartBucket();
    bucket.appliedGiftCardFolio = found.folio;
    persistState();
    return { ok: true, card: found };
  }

  function clearAppliedGiftCard() {
    const bucket = ensureActiveCartBucket();
    bucket.appliedGiftCardFolio = null;
    persistState();
  }

  // ---- Pedidos (con revalidación de stock, precios y descuento real de Gift Card) ----
  function recordOrder(orderPayload) {
    const user = getActiveClientUser();
    if (!user) return { ok: false, error: 'Debes validar tu sesión de cliente para confirmar el pedido.' };
    if (!Array.isArray(user.pedidos)) user.pedidos = [];

    const rawItems = Array.isArray(orderPayload.items) ? deepClone(orderPayload.items) : [];
    if (rawItems.length === 0) {
      return { ok: false, error: 'Tu bolsa está vacía.' };
    }

    // Revalidar existencia, disponibilidad, stock acumulado por producto y precio vigente
    const qtyByProd = {};
    for (let i = 0; i < rawItems.length; i++) {
      const it = rawItems[i];
      if (it.esGiftCardSolicitud) continue;
      const prod = getProductById(it.id);
      if (!prod || prod.disponible === false) {
        return {
          ok: false,
          error: `"${it.nombre}" ya no está disponible en el catálogo. Retírala de tu bolsa para continuar.`,
        };
      }
      qtyByProd[prod.id] = (qtyByProd[prod.id] || 0) + (Number(it.qty) || 1);
      if (qtyByProd[prod.id] > (Number(prod.stock) || 0)) {
        return {
          ok: false,
          error: `Stock insuficiente para "${prod.nombre}". Solo hay ${prod.stock} unidad(es) disponibles.`,
        };
      }
      // Sincronizar con el precio vigente del catálogo
      it.precio = prod.precio;
    }

    const subtotalNio = rawItems.reduce((sum, it) => sum + (Number(it.precio) || 0) * (Number(it.qty) || 1), 0);

    // Validar y descontar folio Gift Card si aplica
    let discountNio = 0;
    let usedFolio = null;
    const liveGc = orderPayload.giftCardFolio
      ? findGiftCardByCode(orderPayload.giftCardFolio)
      : getAppliedGiftCard();

    if (liveGc && getGiftCardStatus(liveGc) === 'Vigente') {
      const availNio = getGiftCardAvailableNio(liveGc);
      discountNio = Math.min(subtotalNio, availNio);
      usedFolio = liveGc.folio;

      // Descontar saldo real del objeto Gift Card en state.data.usuarios
      const rate = (state.data && state.data.config && state.data.config.tasaCambio) || 36.62;
      const discountInCardCurrency = liveGc.moneda === 'US$' ? discountNio / rate : discountNio;
      state.data.usuarios.forEach((u) => {
        (u.giftCards || []).forEach((c) => {
          if (normalizeCode(c.folio) === normalizeCode(liveGc.folio)) {
            const prevSaldo = typeof c.saldoRestante === 'number' ? c.saldoRestante : Number(c.monto) || 0;
            c.saldoRestante = Math.max(0, Math.round((prevSaldo - discountInCardCurrency) * 100) / 100);
            if (c.saldoRestante <= 0.01) {
              c.saldoRestante = 0;
              c.canjeada = true;
            }
          }
        });
      });
    }

    const totalNio = Math.max(0, subtotalNio - discountNio);

    // Descontar stock real
    Object.keys(qtyByProd).forEach((pid) => {
      const prod = getProductById(pid);
      if (prod) {
        prod.stock = Math.max(0, (Number(prod.stock) || 0) - qtyByProd[pid]);
        state.editedProducts[prod.id] = prod;
      }
    });

    const order = {
      id: `PED-${Date.now().toString().slice(-5)}`,
      fecha: todayISO(),
      createdAt: new Date().toISOString(),
      items: rawItems,
      subtotalNio: Math.round(subtotalNio),
      descuentoGiftCardNio: Math.round(discountNio),
      giftCardFolio: usedFolio,
      totalNio: Math.round(totalNio),
      clienteNombre: String(orderPayload.clienteNombre || user.nombre).trim(),
      clienteTelefono: String(orderPayload.clienteTelefono || user.telefono || '').trim(),
      clienteCorreo: user.correo,
      entregaTipo: orderPayload.entregaTipo || 'Retiro en tienda',
      direccionEntrega: String(orderPayload.direccionEntrega || '').trim(),
      notas: String(orderPayload.notas || '').trim(),
      estado: 'Enviado por WhatsApp',
      stockRestored: false,
    };

    user.pedidos.unshift(order);
    if (orderPayload.clearCartAfter !== false) {
      const bucket = ensureActiveCartBucket();
      bucket.items = [];
      bucket.appliedGiftCardFolio = null;
    }
    persistState();
    return { ok: true, order };
  }

  function getAllOrders() {
    if (!state.data || !Array.isArray(state.data.usuarios)) return [];
    const list = [];
    state.data.usuarios.forEach((u) => {
      (u.pedidos || []).forEach((p) => {
        list.push({
          ...p,
          clienteNombre: p.clienteNombre || u.nombre,
          clienteCorreo: p.clienteCorreo || u.correo,
          ownerId: u.id,
        });
      });
    });
    list.sort((a, b) => {
      const ta = a.createdAt || a.fecha || '';
      const tb = b.createdAt || b.fecha || '';
      if (tb !== ta) return tb.localeCompare(ta);
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
    return list;
  }

  function getOrderById(orderId) {
    return getAllOrders().find((o) => o.id === orderId) || null;
  }

  function updateOrderStatus(orderId, newStatus) {
    if (!state.data) return false;
    let updated = false;
    state.data.usuarios.forEach((u) => {
      (u.pedidos || []).forEach((p) => {
        if (p.id !== orderId) return;
        const prevStatus = p.estado;
        p.estado = String(newStatus || 'Confirmado');

        // Restaurar inventario si se cancela un pedido
        if (p.estado === 'Cancelado' && prevStatus !== 'Cancelado' && !p.stockRestored) {
          (p.items || []).forEach((it) => {
            if (it.esGiftCardSolicitud) return;
            const prod = getProductById(it.id);
            if (prod) {
              prod.stock = (Number(prod.stock) || 0) + (Number(it.qty) || 1);
              state.editedProducts[prod.id] = prod;
            }
          });
          p.stockRestored = true;
        } else if (p.estado !== 'Cancelado' && prevStatus === 'Cancelado' && p.stockRestored) {
          (p.items || []).forEach((it) => {
            if (it.esGiftCardSolicitud) return;
            const prod = getProductById(it.id);
            if (prod) {
              prod.stock = Math.max(0, (Number(prod.stock) || 0) - (Number(it.qty) || 1));
              state.editedProducts[prod.id] = prod;
            }
          });
          p.stockRestored = false;
        }
        updated = true;
      });
    });
    if (updated) persistState();
    return updated;
  }

  // ---- Tarjetas de Regalo ----
  function getAllGiftCards() {
    if (!state.data || !Array.isArray(state.data.usuarios)) return [];
    const cards = [];
    state.data.usuarios.forEach((u) => {
      (u.giftCards || []).forEach((gc) => {
        const norm = normalizeGiftCard(gc);
        cards.push({ ...norm, emitidaPor: u.nombre, ownerId: u.id });
      });
    });
    cards.sort((a, b) => parseFolioNumber(b.folio) - parseFolioNumber(a.folio));
    return cards;
  }

  function findGiftCardByCode(codeInput) {
    const target = normalizeCode(codeInput);
    if (!target) return null;
    return getAllGiftCards().find((c) => normalizeCode(c.folio) === target) || null;
  }

  function getNextFolio() {
    const current = (state.data && state.data.config && state.data.config.ultimoFolio) || 1;
    const cards = getAllGiftCards();
    const maxFromCards = cards.reduce((m, c) => Math.max(m, parseFolioNumber(c.folio)), 0);
    return formatFolio(Math.max(current, maxFromCards) + 1);
  }

  function recordGiftCard(cardData) {
    if (!state.data) return null;
    const adminUser =
      getAdminSessionUser() ||
      state.data.usuarios.find((u) => u.rol === 'admin') ||
      state.data.usuarios[0];
    if (!adminUser) return null;
    if (!Array.isArray(adminUser.giftCards)) adminUser.giftCards = [];

    const folioClean = normalizeCode(cardData.folio || getNextFolio());
    const montoVal = Math.max(10, Number(cardData.monto) || 1100);
    const entry = {
      folio: folioClean,
      monto: montoVal,
      saldoRestante: montoVal,
      canjeada: false,
      moneda: cardData.moneda === 'US$' ? 'US$' : 'C$',
      para: String(cardData.para || 'Destinatario Especial').trim(),
      de: String(cardData.de || 'Con cariño').trim(),
      motivo: String(cardData.motivo || 'DETALLE ESPECIAL').trim().toUpperCase(),
      validoHasta: cardData.validoHasta || defaultExpiryISO(),
      tema: cardData.tema || 'crimson',
      canje: String(cardData.canje || 'Para gastar en la tienda física y Online.').trim(),
      mensaje: String(cardData.mensaje || '').trim(),
      fechaEmision: cardData.fechaEmision || todayISO(),
    };

    const existingIdx = adminUser.giftCards.findIndex(
      (c) => normalizeCode(c.folio) === folioClean
    );
    if (existingIdx >= 0) {
      adminUser.giftCards[existingIdx] = entry;
    } else {
      adminUser.giftCards.unshift(entry);
    }

    const num = parseFolioNumber(folioClean);
    if (num > (state.data.config.ultimoFolio || 0)) {
      state.data.config.ultimoFolio = num;
    }

    persistState();
    return entry;
  }

  function deleteGiftCard(folio) {
    if (!state.data) return false;
    const target = normalizeCode(folio);
    let removed = false;
    state.data.usuarios.forEach((u) => {
      if (!Array.isArray(u.giftCards)) return;
      const before = u.giftCards.length;
      u.giftCards = u.giftCards.filter((c) => normalizeCode(c.folio) !== target);
      if (u.giftCards.length < before) removed = true;
    });
    if (removed) persistState();
    return removed;
  }

  // ---- Exportar / Importar / Reset JSON ----
  function getExportableJsonObject() {
    if (!state.data) return null;
    return deepClone(state.data);
  }

  function exportJsonDownload() {
    const obj = getExportableJsonObject();
    if (!obj) return false;
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  function importJsonObject(jsonObj) {
    if (!jsonObj || typeof jsonObj !== 'object' || !Array.isArray(jsonObj.productos) || !Array.isArray(jsonObj.usuarios)) {
      return { ok: false, error: 'El archivo JSON no tiene una estructura válida de Yademar (requiere productos y usuarios).' };
    }
    const seed = getFallbackSeed();
    state.data = {
      config: { ...seed.config, ...(jsonObj.config || {}) },
      temporadas: Array.isArray(jsonObj.temporadas) && jsonObj.temporadas.length > 0 ? deepClone(jsonObj.temporadas) : seed.temporadas,
      productos: deepClone(jsonObj.productos).map(normalizeProduct),
      usuarios: mergeUsers(seed.usuarios, jsonObj.usuarios, []),
    };
    state.deletedProductIds = [];
    state.customProducts = [];
    state.editedProducts = {};
    state.deletedUserIds = [];
    state.hasImportedProductsOverride = true;
    state.importedProductsSnapshot = deepClone(state.data.productos);
    persistState();
    return { ok: true, countProducts: state.data.productos.length, countUsers: state.data.usuarios.length };
  }

  async function resetLocalCache() {
    try {
      if (global.localStorage) {
        global.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {
      // Ignore
    }
    state.deletedProductIds = [];
    state.customProducts = [];
    state.editedProducts = {};
    state.deletedUserIds = [];
    state.cartsByUserId = {};
    state.hasImportedProductsOverride = false;
    state.importedProductsSnapshot = null;
    await initStore();
    return state.data;
  }

  function subscribeExternalSync(callback) {
    if (typeof global.addEventListener !== 'function') return;
    global.addEventListener('storage', async (ev) => {
      if (ev.key === STORAGE_KEY || ev.key === ADMIN_SESSION_KEY) {
        await initStore();
        if (typeof callback === 'function') callback(ev.key);
      }
    });
  }

  function getConfig() {
    return (state.data && state.data.config) || getFallbackSeed().config;
  }

  function getUsers() {
    return (state.data && state.data.usuarios) || [];
  }

  function getWhatsAppUrl(text) {
    const cfg = getConfig();
    const phone = cfg.whatsapp || '50589563257';
    return `https://wa.me/${phone}?text=${encodeURIComponent(text || 'Hola Yademar, deseo hacer una consulta.')}`;
  }

  global.YademarStore = {
    STORAGE_KEY,
    ADMIN_SESSION_KEY,
    IMG_FALLBACK_SVG,
    escapeHtml,
    pad,
    todayISO,
    defaultExpiryISO,
    formatDateDMY,
    formatFolio,
    parseFolioNumber,
    normalizeCode,
    parseColorsInput,
    generateBarcodeBars,
    showToast,
    initStore,
    persistState,
    authenticate,
    // Cliente & CRUD Clientes
    getActiveClientUser,
    isClientAuthenticated,
    loginClient,
    logoutClient,
    getUserById,
    setActiveClientUser,
    resetClientToDefault,
    registerClientUser,
    updateActiveClientProfile,
    saveClientUserByAdmin,
    deleteClientUser,
    toggleFavorite,
    // Admin
    consumeAdminHandoff,
    getAdminSessionUser,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    // Moneda
    getCurrency,
    setCurrency,
    formatMoney,
    formatRawAmount,
    // Productos & Stock
    getConfig,
    getSeasons,
    getSeasonLabel,
    getProducts,
    getProductById,
    addOrUpdateProduct,
    adjustProductStock,
    deleteProduct,
    getUsers,
    // Bolsa & Pedidos
    getCart,
    getCartQtyForProduct,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getGiftCardStatus,
    getGiftCardAvailableNio,
    getAppliedGiftCard,
    applyGiftCardCode,
    clearAppliedGiftCard,
    recordOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    // Gift Cards
    getAllGiftCards,
    findGiftCardByCode,
    getNextFolio,
    recordGiftCard,
    deleteGiftCard,
    // JSON & Sync
    getExportableJsonObject,
    exportJsonDownload,
    importJsonObject,
    resetLocalCache,
    subscribeExternalSync,
    getWhatsAppUrl,
  };
})(typeof window !== 'undefined' ? window : globalThis);
