/**
 * VETERINARIA LA VIRGEN - LÓGICA INTERACTIVA Y ANIMACIONES
 * Dr. Junior Elian Villalobos Meza - El Viejo, Chinandega
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCounterAnimations();
  initAnimalChips();
});

// 1. Animaciones al hacer Scroll (Intersection Observer)
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
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// 2. Contadores Numéricos Animados
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

// 3. Chips de Selección Rápida de Animales
function initAnimalChips() {
  const chips = document.querySelectorAll('.animal-chip');
  const detallesInput = document.getElementById('animalDetalles');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const animal = chip.getAttribute('data-animal') || chip.innerText.trim();
      if (detallesInput) {
        detallesInput.value = `Paciente: [${animal}] - `;
        detallesInput.focus();
      }
    });
  });
}

// 4. Envío de Formulario con Redirección a WhatsApp
function enviarCitaVet(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitVet');
  const feedback = document.getElementById('feedbackVet');

  const nombre = document.getElementById('tutorNombre')?.value || '';
  const telefono = document.getElementById('tutorTelefono')?.value || '';
  const tipoAtencion = document.getElementById('tipoAtencion')?.value || '';
  const servicio = document.getElementById('servicioRequerido')?.value || '';
  const detalles = document.getElementById('animalDetalles')?.value || '';

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Abriendo WhatsApp del Dr. Villalobos Meza...`;

  const textoWhatsApp = 
    `*NUEVA CITA - VETERINARIA LA VIRGEN* 🐾\n` +
    `• *Nombre del Tutor:* ${nombre}\n` +
    `• *Teléfono/WhatsApp del Tutor:* ${telefono}\n` +
    `• *Modalidad:* ${tipoAtencion}\n` +
    `• *Servicio Solicitado:* ${servicio}\n` +
    `• *Paciente y Síntomas:* ${detalles}\n\n` +
    `_Enviado desde el portal web oficial de Veterinaria La Virgen._`;

  const urlWhatsApp = `https://wa.me/50583647154?text=${encodeURIComponent(textoWhatsApp)}`;

  setTimeout(() => {
    feedback.classList.remove('d-none');
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> ¡Cita Enviada al Dr. Villalobos Meza!`;

    // Redirigir a WhatsApp
    window.open(urlWhatsApp, '_blank');

    setTimeout(() => {
      document.getElementById('formCitaVet').reset();
      btn.innerHTML = `<i class="bi bi-send-check-fill me-1"></i> Enviar Mensaje al Dr. Villalobos Meza`;
    }, 4500);
  }, 900);
}

// 5. Copiar Coordenadas GPS Oficiales
function copiarCoordenadasVet() {
  const coord = "12.798346682019282, -87.40276618861616";
  navigator.clipboard.writeText(coord).then(() => {
    const btn = document.getElementById('btnCopyGpsVet');
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.innerHTML = `<i class="bi bi-check2-circle me-1"></i> ¡Copiadas!`;
      btn.classList.remove('btn-outline-success');
      btn.classList.add('btn-success', 'text-white');
      setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.classList.remove('btn-success', 'text-white');
        btn.classList.add('btn-outline-success');
      }, 2500);
    }
  });
}

