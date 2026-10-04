/**
 * CONSTRUCCIONES R&S - LÓGICA INTERACTIVA DE ALTA GAMA
 * Propietario: Pastor Roberto Serrano (Roberto Cessaro)
 * Teléfono / WhatsApp Oficial: +505 8557 4484
 * El Viejo, Chinandega, Nicaragua
 * "Seguimos construyendo tus sueños"
 */

const WHATSAPP_NUMERO = '50585574484';

// Estado del planificador de proyectos (SIN PRECIOS - Se negocia por WhatsApp)
let planState = {
  type: 'casa1', // 'casa1', 'casa2', 'soldadura', 'remodelacion', 'muro'
  area: 75,
  mode: 'todo_incluido', // 'mano_obra', 'todo_incluido'
  terreno: 'Terreno propio listo para construir'
};

// Configuraciones técnicas de cada tipo de obra
const OBRAS_CONFIG = {
  casa1: {
    nombre: 'Casa 1 Planta (Mampostería Confinada)',
    unidad: 'm²',
    rangoArea: [30, 250],
    defaultArea: 75,
    descripcion: 'Diseño sismorresistente con fundaciones de concreto, paredes de bloque, techo metálico y acabados.',
    alcance: [
      'Cimentación y zapatas aisladas sismorresistentes',
      'Paredes de bloque con columnas y vigas de corona',
      'Estructura de techo en perlines galvanizados y zinc',
      'Instalación eléctrica 110V/220V y tuberías de agua y drenaje'
    ]
  },
  casa2: {
    nombre: 'Residencia de 2 Pisos con Losa de Concreto',
    unidad: 'm²',
    rangoArea: [60, 450],
    defaultArea: 140,
    descripcion: 'Ingeniería estructural para 2 niveles con losa de entrepiso de hormigón armado, balcón y escaleras.',
    alcance: [
      'Cálculo y zapatas reforzadas para carga de 2 pisos',
      'Losa de entrepiso en concreto reforzado y vigas de carga',
      'Escalera de concreto con barandales de seguridad',
      'Balcones, terrazas y acabados arquitectónicos modernos'
    ]
  },
  soldadura: {
    nombre: 'Estructuras Metálicas, Techos y Tijeras de Hierro',
    unidad: 'm²',
    rangoArea: [20, 350],
    defaultArea: 80,
    descripcion: 'Fabricación y montaje de tijeras de carga pesada, perlines soldados, portones y verjas.',
    alcance: [
      'Tijeras trianguladas soldadas con electrodo de alta resistencia',
      'Montaje de perlines para techos de zinc sin filtraciones',
      'Portones corredizos o abatibles y verjas perimetrales',
      'Pintura anticorrosiva y anclajes estructurales seguros'
    ]
  },
  remodelacion: {
    nombre: 'Remodelación de Interiores, Pisos y Cielo Raso',
    unidad: 'm²',
    rangoArea: [15, 200],
    defaultArea: 50,
    descripcion: 'Renovación de espacios con porcelanato rectificado, cielo falso en PVC/gypsum y baños.',
    alcance: [
      'Instalación de pisos cerámicos y porcelanato de alto brillo',
      'Cielo raso térmico acústico con iluminación LED',
      'Remodelación de cocinas americanas y baños completos',
      'Pintura arquitectónica lavable y divisiones internas'
    ]
  },
  muro: {
    nombre: 'Muro Perimetral de Bloque Sismorresistente',
    unidad: 'metros lineales',
    rangoArea: [10, 180],
    defaultArea: 40,
    descripcion: 'Cerramiento y protección de solar con zapatas corridas, columnas de amarre y viga corona.',
    alcance: [
      'Zanja y zapata corrida con varilla corrugada legítima',
      'Columnas de amarre cada 3 metros y viga superior continua',
      'Bloque de calidad prensado con mortero resistente',
      'Protección perimetral y preparación para portón de acceso'
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCounterAnimations();
  initProjectPlanner();
  initCatalogFilters();
  initBrochureModal();
});

/* ==========================================================================
   1. PLANIFICADOR DE PROYECTO (SIN PRECIOS - NEGOCIACIÓN POR WHATSAPP)
   ========================================================================== */
function initProjectPlanner() {
  const typeButtons = document.querySelectorAll('.calc-type-btn');
  const areaSlider = document.getElementById('calcAreaSlider');
  const areaInput = document.getElementById('calcAreaInput');
  const modeRadios = document.querySelectorAll('input[name="calcMode"]');
  const terrenoSelect = document.getElementById('calcTerrenoSelect');
  const btnShareWhatsApp = document.getElementById('btnSharePlanWhatsApp');

  if (!areaSlider || !areaInput) return;

  // Selección de tipo de obra
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedType = btn.getAttribute('data-type');
      if (selectedType && OBRAS_CONFIG[selectedType]) {
        planState.type = selectedType;
        const config = OBRAS_CONFIG[selectedType];
        areaSlider.min = config.rangoArea[0];
        areaSlider.max = config.rangoArea[1];
        areaSlider.value = config.defaultArea;
        areaInput.value = config.defaultArea;
        planState.area = config.defaultArea;

        const labelUnidad = document.getElementById('calcUnidadLabel');
        if (labelUnidad) labelUnidad.innerText = config.unidad;

        updateProjectSummary();
      }
    });
  });

  // Slider de área
  areaSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    areaInput.value = val;
    planState.area = val;
    updateProjectSummary();
  });

  // Input numérico de área
  areaInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10) || 0;
    if (val < 1) val = 1;
    areaSlider.value = val;
    planState.area = val;
    updateProjectSummary();
  });

  // Modalidad (Mano de Obra vs Todo Incluido)
  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        planState.mode = radio.value;
        updateProjectSummary();
      }
    });
  });

  // Estado del terreno
  if (terrenoSelect) {
    terrenoSelect.addEventListener('change', () => {
      planState.terreno = terrenoSelect.value;
      updateProjectSummary();
    });
  }

  // Botón para enviar la ficha técnica por WhatsApp y negociar
  if (btnShareWhatsApp) {
    btnShareWhatsApp.addEventListener('click', (e) => {
      e.preventDefault();
      const config = OBRAS_CONFIG[planState.type];
      const modoTexto = planState.mode === 'todo_incluido' ? 'Llave en Mano (Materiales + Mano de Obra)' : 'Solo Mano de Obra Calificada';

      const texto = 
        `*SOLICITUD DE PROYECTO PARA COTIZACIÓN Y NEGOCIACIÓN* 🏗️📐\n` +
        `Hola Pastor Roberto Serrano, he configurado mi proyecto en el portal web de Construcciones R&S:\n\n` +
        `• *Tipo de Obra:* ${config.nombre}\n` +
        `• *Dimensión Estimada:* ${planState.area} ${config.unidad}\n` +
        `• *Modalidad Deseada:* ${modoTexto}\n` +
        `• *Estado del Terreno / Proyecto:* ${planState.terreno}\n` +
        `• *Ubicación:* El Viejo / Chinandega\n\n` +
        `Deseo que conversemos por WhatsApp los detalles, materiales y el presupuesto formal para este proyecto. Quedo atento a su respuesta para coordinar la visita.`;

      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
    });
  }

  // Ejecutar primera actualización
  updateProjectSummary();
}

function updateProjectSummary() {
  const config = OBRAS_CONFIG[planState.type];
  if (!config) return;

  const elNombreObra = document.getElementById('calcObraTitle');
  const elDimensionSummary = document.getElementById('calcDimensionSummary');
  const elModalidadSummary = document.getElementById('calcModalidadSummary');
  const elTerrenoSummary = document.getElementById('calcTerrenoSummary');
  const elAlcanceList = document.getElementById('calcAlcanceList');

  if (elNombreObra) elNombreObra.innerText = config.nombre;
  if (elDimensionSummary) elDimensionSummary.innerText = `${planState.area} ${config.unidad}`;
  if (elModalidadSummary) {
    elModalidadSummary.innerText = planState.mode === 'todo_incluido' ? 'Llave en Mano (Materiales y Mano de Obra)' : 'Solo Mano de Obra Calificada';
  }
  if (elTerrenoSummary) elTerrenoSummary.innerText = planState.terreno;

  if (elAlcanceList) {
    elAlcanceList.innerHTML = config.alcance.map(item => `
      <div class="d-flex align-items-center mb-1 small text-white-50">
        <i class="bi bi-check-circle-fill text-warning me-2"></i>
        <span>${item}</span>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   2. FILTROS INTERACTIVOS DEL CATÁLOGO DE PLANOS Y OBRAS
   ========================================================================== */
function initCatalogFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const catalogCards = document.querySelectorAll('.catalog-item-col');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterVal = pill.getAttribute('data-filter');

      catalogCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === '*' || category === filterVal) {
          card.style.display = 'block';
          card.classList.add('animate-fade-in-up');
        } else {
          card.style.display = 'none';
          card.classList.remove('animate-fade-in-up');
        }
      });
    });
  });
}

/**
 * Función invocada al presionar "Cotizar este Modelo" en una tarjeta de catálogo
 */
function seleccionarModeloParaCotizar(nombreModelo, tipoServicio) {
  const selectServicio = document.getElementById('rsServicio');
  const textareaMensaje = document.getElementById('rsMensaje');

  if (selectServicio) {
    for (let i = 0; i < selectServicio.options.length; i++) {
      if (selectServicio.options[i].text.toLowerCase().includes(tipoServicio.toLowerCase())) {
        selectServicio.selectedIndex = i;
        break;
      }
    }
  }

  if (textareaMensaje) {
    textareaMensaje.value = `Hola Pastor Roberto Serrano, me interesa cotizar el "${nombreModelo}". Deseo conocer tiempos de ejecución y negociar el presupuesto formal.`;
  }

  const seccionContacto = document.getElementById('contacto');
  if (seccionContacto) {
    seccionContacto.scrollIntoView({ behavior: 'smooth' });
    const nombreInput = document.getElementById('rsNombre');
    if (nombreInput) {
      setTimeout(() => nombreInput.focus(), 600);
    }
  }
}

/* ==========================================================================
   3. VISOR MODAL DE PANFLETOS EN ALTA DEFINICIÓN
   ========================================================================== */
function initBrochureModal() {
  const brochureImgs = document.querySelectorAll('.brochure-zoom-trigger');
  const modalImg = document.getElementById('modalBrochureImg');
  const modalTitle = document.getElementById('modalBrochureTitle');

  brochureImgs.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-full-img');
      const title = item.getAttribute('data-title') || 'Panfleto Oficial - Construcciones R&S';
      if (modalImg && src) {
        modalImg.src = src;
      }
      if (modalTitle) {
        modalTitle.innerText = title;
      }
    });
  });
}

/* ==========================================================================
   4. FORMULARIO DE CONTACTO DIRECTO A WHATSAPP
   ========================================================================== */
function enviarContactoRS(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitRS');
  const feedback = document.getElementById('feedbackRS');

  const nombre = document.getElementById('rsNombre')?.value || '';
  const telefono = document.getElementById('rsTelefono')?.value || '';
  const ubicacion = document.getElementById('rsUbicacion')?.value || '';
  const servicio = document.getElementById('rsServicio')?.value || '';
  const areaM2 = document.getElementById('rsMetros')?.value || 'Por definir';
  const mensaje = document.getElementById('rsMensaje')?.value || '';

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Conectando con Pastor Roberto Serrano...`;

  const textoWhatsApp = 
    `*NUEVA SOLICITUD DE OBRA - CONSTRUCCIONES R&S* 🏡🏗️\n\n` +
    `• *Cliente:* ${nombre}\n` +
    `• *Teléfono/WhatsApp:* ${telefono}\n` +
    `• *Ubicación del Terreno:* ${ubicacion}\n` +
    `• *Tipo de Trabajo:* ${servicio}\n` +
    `• *Área Estimada:* ${areaM2}\n` +
    `• *Detalle del Proyecto:* ${mensaje}\n\n` +
    `_Enviado desde el portal web oficial de Construcciones R&S (El Viejo, Chinandega)._`;

  const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(textoWhatsApp)}`;

  setTimeout(() => {
    if (feedback) {
      feedback.classList.remove('d-none');
      feedback.classList.add('animate-fade-in-up');
    }
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> ¡Mensaje Listo! Abriendo WhatsApp...`;

    // Abrir WhatsApp en nueva pestaña
    window.open(urlWhatsApp, '_blank');

    setTimeout(() => {
      document.getElementById('formContactoRS').reset();
      btn.innerHTML = `<i class="bi bi-send-check-fill me-1"></i> Enviar Consulta a Roberto Serrano (+505 8557 4484)`;
    }, 4000);
  }, 800);
}

/* ==========================================================================
   5. ANIMACIONES DE SCROLL Y CONTADORES
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

function initCounterAnimations() {
  const counters = document.querySelectorAll('.counter-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10) || 0;
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const duration = 1600;
  const start = 0;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeProgress);

    el.innerText = `${prefix}${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.innerText = `${prefix}${target}${suffix}`;
    }
  }

  requestAnimationFrame(updateCount);
}
