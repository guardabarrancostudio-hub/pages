/**
 * TALLER DON CHUNGO - MECÁNICA PROFESIONAL DE MOTOCICLETAS
 * Propietario: Edwin Oviedo (+505 8804 6196)
 * Ubicación: Carretera Chinandega - El Viejo Km 134, El Viejo, Nicaragua
 * Coordenadas GPS: 12.662903, -87.176903
 */

document.addEventListener('DOMContentLoaded', () => {
  setupFechaTurno();
  initScrollAnimations();
  initCounterAnimations();
  initBrandSelector();
  initBrandSearch();
});

// 1. Configurar fecha mínima del turno (hoy)
function setupFechaTurno() {
  const fechaInput = document.getElementById('clienteFecha');
  if (!fechaInput) return;

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  let mm = hoy.getMonth() + 1;
  let dd = hoy.getDate();

  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;

  fechaInput.min = `${yyyy}-${mm}-${dd}`;
}

// 2. Animaciones al hacer Scroll (Intersection Observer)
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
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// 3. Contadores Numéricos Animados
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
  }, { threshold: 0.5 });

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

// 4. Selector Interactivo de Marcas y Máquinas
function initBrandSelector() {
  const brandCards = document.querySelectorAll('.brand-card, .brand-chip');
  const motoInput = document.getElementById('clienteMoto');
  const noticeBox = document.getElementById('selectedBrandNotice');
  const noticeName = document.getElementById('selectedBrandName');

  brandCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Remover clase activa de todos
      brandCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const brand = card.getAttribute('data-brand') || card.innerText.trim();

      if (motoInput) {
        motoInput.value = `${brand} `;
        
        if (noticeBox && noticeName) {
          noticeName.textContent = brand;
          noticeBox.classList.remove('d-none');
        }

        // Si el clic no fue dentro del formulario, hacer scroll suave al formulario
        const formSection = document.getElementById('agendar');
        if (formSection && !card.closest('#formTurnoTaller')) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            motoInput.focus();
          }, 600);
        }
      }
    });
  });
}

// 5. Búsqueda y Filtrado Rápido de Máquinas / Modelos
function initBrandSearch() {
  const searchInput = document.getElementById('brandSearchInput');
  const brandCards = document.querySelectorAll('.brand-card');
  const noResults = document.getElementById('brandNoResults');

  if (!searchInput || !brandCards.length) return;

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    let matches = 0;

    brandCards.forEach(card => {
      const brand = (card.getAttribute('data-brand') || '').toLowerCase();
      const models = (card.getAttribute('data-models') || '').toLowerCase();

      if (!q || brand.includes(q) || models.includes(q)) {
        card.style.display = '';
        card.classList.remove('opacity-25');
        matches++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      if (matches === 0) {
        noResults.classList.remove('d-none');
      } else {
        noResults.classList.add('d-none');
      }
    }
  });
}

// 6. Copiar Coordenadas GPS con Feedback Visual
function copiarCoordenadas() {
  const coords = '12.662903, -87.176903';
  const feedback = document.getElementById('copyFeedback');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(coords).then(() => {
      mostrarFeedbackCopiado(feedback);
    }).catch(() => {
      fallbackCopiar(coords, feedback);
    });
  } else {
    fallbackCopiar(coords, feedback);
  }
}

function fallbackCopiar(text, feedback) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  mostrarFeedbackCopiado(feedback);
}

function mostrarFeedbackCopiado(feedback) {
  if (!feedback) return;
  feedback.classList.remove('d-none');
  setTimeout(() => {
    feedback.classList.add('d-none');
  }, 3000);
}

// 7. Envío de Formulario con Redirección a WhatsApp de Edwin Oviedo (+505 8804 6196)
function enviarTurnoMoto(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitTurno');
  const feedback = document.getElementById('feedbackTaller');

  const nombre = document.getElementById('clienteNombre')?.value || '';
  const telefono = document.getElementById('clienteTelefono')?.value || '';
  const moto = document.getElementById('clienteMoto')?.value || '';
  const servicio = document.getElementById('clienteServicio')?.value || '';
  const fecha = document.getElementById('clienteFecha')?.value || '';
  const municipio = document.getElementById('clienteMunicipio')?.value || '';
  const falla = document.getElementById('clienteFalla')?.value || 'Revisión y mantenimiento general';

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Abriendo WhatsApp de Edwin Oviedo...`;

  const textoWhatsApp = 
    `*NUEVA CITA DE MOTO - TALLER DON CHUNGO* 🏍️\n` +
    `• *Propietario:* ${nombre}\n` +
    `• *Teléfono/WhatsApp:* ${telefono}\n` +
    `• *Motocicleta:* ${moto}\n` +
    `• *Trabajo Requerido:* ${servicio}\n` +
    `• *Fecha para llevarla:* ${fecha}\n` +
    `• *Municipio:* ${municipio}\n` +
    `• *Falla o Síntomas:* ${falla}\n\n` +
    `_Enviado desde el portal web oficial de Taller Don Chungo (Edwin Oviedo)._`;

  // Número oficial de Edwin Oviedo: +505 8804 6196
  const urlWhatsApp = `https://wa.me/50588046196?text=${encodeURIComponent(textoWhatsApp)}`;

  setTimeout(() => {
    feedback.classList.remove('d-none');
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> ¡Turno Solicitado con Éxito!`;

    // Redirigir a WhatsApp
    window.open(urlWhatsApp, '_blank');

    setTimeout(() => {
      document.getElementById('formTurnoTaller').reset();
      const noticeBox = document.getElementById('selectedBrandNotice');
      if (noticeBox) noticeBox.classList.add('d-none');
      btn.innerHTML = `<i class="bi bi-calendar-check-fill me-1"></i> Confirmar Cita de Moto`;
    }, 4500);
  }, 900);
}
