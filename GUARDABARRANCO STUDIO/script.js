/**
 * GUARDABARRANCO STUDIO - JAVASCRIPT PRINCIPAL
 * Interactividad, Cotizador Dinámico, Filtros de Portafolio y Modales
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    if (!navMenu.querySelector('.nav-mobile-cta-item')) {
      const mobileCtaLi = document.createElement('li');
      mobileCtaLi.className = 'nav-mobile-cta-item';
      mobileCtaLi.innerHTML = `<a href="#diagnostico" class="btn btn-primary"><i class="bi bi-stars me-1"></i> Diagnóstico Gratis</a>`;
      navMenu.appendChild(mobileCtaLi);
    }

    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      const icon = menuToggle.querySelector('i');
      if (navMenu.classList.contains('show')) {
        icon.classList.remove('bi-list');
        icon.classList.add('bi-x-lg');
      } else {
        icon.classList.remove('bi-x-lg');
        icon.classList.add('bi-list');
      }
    });

    // Close menu when clicking links
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-x-lg');
          icon.classList.add('bi-list');
        }
      });
    });
  }

  // 2. Navbar Scroll Behavior
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Navigation Item Detection
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navItem = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (navItem) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navItem.classList.add('active');
        } else {
          navItem.classList.remove('active');
        }
      }
    });
  });

  // 3. Cobertura Tabs (Local, Nacional, Centroamérica)
  const coverageTabs = document.querySelectorAll('.coverage-tab-btn');
  const coveragePanels = document.querySelectorAll('.coverage-panel');

  coverageTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      coverageTabs.forEach(t => t.classList.remove('active'));
      coveragePanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `panel-${tab.dataset.target}`;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // 4. Portafolio - Filtros Dinámicos
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      portfolioCards.forEach(card => {
        const categories = card.dataset.category || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // 5. Portafolio - Modal con conceptos de campaña (ilustrativos, no son clientes reales)
  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectContent = document.getElementById('modalProjectContent');

  const caseStudiesData = {
    'concepto-cafe': {
      title: 'Concepto &bull; Café de altura con marca propia',
      category: 'Branding, Empaque & Pauta',
      client: 'Concepto ilustrativo: no corresponde a un cliente real',
      challenge: 'Un café de calidad que se vende a granel compite solo por precio y deja el margen en manos de los intermediarios.',
      solution: 'Una identidad visual que cuente el origen del café, un empaque con válvula desgasificadora y una campaña en redes que lleve los pedidos directo a WhatsApp.',
      results: [
        'Conversaciones y pedidos cerrados por WhatsApp.',
        'Costo por conversación y valor promedio por pedido.',
        'Tiendas o puntos de venta nuevos que se sumen al catálogo.'
      ]
    },
    'concepto-restaurante': {
      title: 'Concepto &bull; Restaurante con más mesas y más pedidos',
      category: 'Pauta Local & Reels',
      client: 'Concepto ilustrativo: no corresponde a un cliente real',
      challenge: 'Poca afluencia entre semana y un servicio a domicilio que casi nadie conoce.',
      solution: 'Videos cortos en formato Reels con la preparación de platos típicos, y pauta geolocalizada en pocos kilómetros a la redonda con botón directo a WhatsApp para pedir.',
      results: [
        'Mensajes y pedidos recibidos por WhatsApp cada semana.',
        'Costo por mensaje y retorno sobre la inversión en pauta.',
        'Crecimiento de la comunidad local en redes.'
      ]
    },
    'concepto-clinica': {
      title: 'Concepto &bull; Clínica con agenda de citas',
      category: 'Captación por WhatsApp',
      client: 'Concepto ilustrativo: no corresponde a un cliente real',
      challenge: 'Consultorios con horarios disponibles y pacientes que no saben que existen.',
      solution: 'Anuncios educativos sobre prevención que, al tocar el botón, abren un chat de WhatsApp con un mensaje prellenado para agendar con el especialista disponible.',
      results: [
        'Citas agendadas a partir de los anuncios.',
        'Costo por paciente interesado.',
        'Porcentaje de ocupación de la agenda.'
      ]
    }
  };

  portfolioCards.forEach(card => {
    // Las tarjetas de proyectos reales son enlaces; solo los conceptos abren el modal
    if (!card.dataset.project) return;

    const openProject = () => {
      const data = caseStudiesData[card.dataset.project];
      if (!data) return;
      modalProjectTitle.innerHTML = data.title;
      modalProjectContent.innerHTML = `
          <div style="margin-bottom: 18px;">
            <span class="badge-tag badge-orange" style="margin-bottom: 8px;">${data.category}</span>
            <p style="font-size: 0.95rem; color: #475569; margin-top: 6px;"><strong>Tipo:</strong> ${data.client}</p>
          </div>
          <div style="margin-bottom: 18px;">
            <h5 style="color: var(--c-azul-profundo); font-size: 1.1rem; margin-bottom: 6px;">El Reto:</h5>
            <p style="color: #64748B; font-size: 0.95rem; line-height: 1.6;">${data.challenge}</p>
          </div>
          <div style="margin-bottom: 18px;">
            <h5 style="color: var(--c-azul-profundo); font-size: 1.1rem; margin-bottom: 6px;">Cómo lo plantearíamos:</h5>
            <p style="color: #64748B; font-size: 0.95rem; line-height: 1.6;">${data.solution}</p>
          </div>
          <div style="background: var(--c-fondo-crema); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--c-gris-200); margin-bottom: 24px;">
            <h5 style="color: var(--c-turquesa-guarda); font-size: 1.1rem; margin-bottom: 10px;"><i class="bi bi-graph-up"></i> Qué mediríamos en tu reporte mensual:</h5>
            <ul style="list-style: none; padding: 0;">
              ${data.results.map(r => `<li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; color: var(--c-azul-profundo); font-size: 0.95rem; font-weight: 500;"><i class="bi bi-check-circle-fill text-success"></i> ${r}</li>`).join('')}
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="https://wa.me/50585574484?text=Hola%20Guardabarranco%20Studio,%20quiero%20un%20plan%20similar%20a%20${encodeURIComponent(data.title.replace('&bull;', '-'))}" target="_blank" rel="noopener" class="btn btn-whatsapp w-100">
              <i class="bi bi-whatsapp"></i> Quiero un Plan Así para mi Negocio
            </a>
          </div>
        `;
      projectModal.classList.add('show');
    };

    card.addEventListener('click', openProject);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProject();
      }
    });
  });

  if (modalCloseBtn && projectModal) {
    modalCloseBtn.addEventListener('click', () => {
      projectModal.classList.remove('show');
    });

    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove('show');
      }
    });
  }

  // 6. Cotizador Interactivo de Campañas Publicitarias
  const calcServiceRadios = document.querySelectorAll('input[name="calcService"]');
  const calcReachRadios = document.querySelectorAll('input[name="calcReach"]');
  const calcDurationRadios = document.querySelectorAll('input[name="calcDuration"]');
  const calcExtraCheckboxes = document.querySelectorAll('input[name="calcExtra"]');

  const summaryServiceName = document.getElementById('summaryServiceName');
  const summaryReach = document.getElementById('summaryReach');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryExtrasRow = document.getElementById('summaryExtrasRow');
  const summaryExtrasText = document.getElementById('summaryExtrasText');
  const calcTotalUSD = document.getElementById('calcTotalUSD');
  const calcTotalNIO = document.getElementById('calcTotalNIO');
  const btnSendQuoteWhatsapp = document.getElementById('btnSendQuoteWhatsapp');

  const EXCHANGE_RATE_NIO = 36.62; // Tasa oficial referencial en Nicaragua
  const calcDurationStep = document.getElementById('calcDurationStep');
  const calcMilestonesNote = document.getElementById('calcMilestonesNote');
  const btnSendQuoteEmail = document.getElementById('btnSendQuoteEmail');

  function calculateQuote() {
    let serviceVal = 'pyme';
    let basePrice = 220;
    let serviceName = 'Plan Impulso Pyme Local';
    let billingType = 'monthly';

    calcServiceRadios.forEach(radio => {
      if (radio.checked) {
        serviceVal = radio.value;
        basePrice = parseFloat(radio.dataset.price);
        serviceName = radio.dataset.name;
        billingType = radio.dataset.billing || 'monthly';
      }
    });

    let reachVal = 'local';
    let reachMultiplier = 1.0;
    let reachName = 'Local';
    calcReachRadios.forEach(radio => {
      if (radio.checked) {
        reachVal = radio.value;
        reachMultiplier = parseFloat(radio.dataset.multiplier);
        reachName = radio.dataset.name;
      }
    });

    // Evitar doble multiplicador cuando el plan base ya contempla escala nacional/regional
    let effectiveReachMult = reachMultiplier;
    if (serviceVal === 'expansion') {
      effectiveReachMult = 1.0;
    } else if (serviceVal === 'campana360') {
      effectiveReachMult = reachVal === 'regional' ? 1.45 : 1.0;
    }

    let durationMultiplier = 1.0;
    let durationName = '1 Mes';
    calcDurationRadios.forEach(radio => {
      if (radio.checked) {
        durationMultiplier = parseFloat(radio.dataset.multiplier);
        durationName = radio.dataset.name;
      }
    });

    const isOneOff = billingType === 'oneoff';
    const effectiveDurationMult = isOneOff ? 1.0 : durationMultiplier;
    const durationDisplay = isOneOff ? 'Pago Único (50% / 50%)' : durationName;
    if (calcDurationStep) {
      calcDurationStep.classList.toggle('is-disabled-step', isOneOff);
    }

    let extrasTotal = 0;
    let extrasList = [];
    calcExtraCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        extrasTotal += parseFloat(checkbox.dataset.price);
        extrasList.push(checkbox.dataset.name);
      }
    });

    // Fórmula de estimación comercial
    const totalUSD = Math.round((basePrice * effectiveReachMult * effectiveDurationMult) + extrasTotal);
    const totalNIO = Math.round(totalUSD * EXCHANGE_RATE_NIO);
    const activeCurr = localStorage.getItem('gbStudioCurrency') || 'USD';

    // Actualizar UI
    if (summaryServiceName) summaryServiceName.textContent = serviceName;
    if (summaryReach) summaryReach.textContent = reachName;
    if (summaryDuration) summaryDuration.textContent = durationDisplay;

    if (summaryExtrasRow && summaryExtrasText) {
      if (extrasList.length > 0) {
        summaryExtrasRow.style.display = 'flex';
        summaryExtrasText.textContent = extrasList.join(', ');
      } else {
        summaryExtrasRow.style.display = 'none';
      }
    }

    if (calcTotalUSD && calcTotalNIO) {
      if (activeCurr === 'NIO') {
        calcTotalUSD.textContent = `C$ ${totalNIO.toLocaleString()} NIO`;
        calcTotalNIO.textContent = `Equivale a ~$${totalUSD.toLocaleString()} USD`;
      } else {
        calcTotalUSD.textContent = `$${totalUSD.toLocaleString()} USD`;
        calcTotalNIO.textContent = `Aprox. C$ ${totalNIO.toLocaleString()} Córdobas`;
      }
    }

    if (calcMilestonesNote) {
      if (isOneOff) {
        const anticipoUsd = Math.round(totalUSD * 0.5);
        const anticipoNio = Math.round(totalNIO * 0.5);
        calcMilestonesNote.textContent = activeCurr === 'NIO'
          ? `Esquema 50 / 50: Inicias con C$ ${anticipoNio.toLocaleString()} NIO (~$${anticipoUsd.toLocaleString()} USD) y 50% contra entrega final.`
          : `Esquema 50 / 50: Inicias con $${anticipoUsd.toLocaleString()} USD (~C$ ${anticipoNio.toLocaleString()} NIO) y 50% contra entrega final.`;
      } else {
        calcMilestonesNote.textContent = 'Facturación mensual sin amarres • Pauta pagada directo en tu cuenta (0% recargo).';
      }
    }

    const mobileCalcVal = document.getElementById('gbMobileCalcValue');
    if (mobileCalcVal) {
      mobileCalcVal.textContent = activeCurr === 'NIO'
        ? `C$ ${totalNIO.toLocaleString()} NIO`
        : `$${totalUSD.toLocaleString()} USD`;
    }

    // WhatsApp y Correo Corporativo dinámicos
    const message = `¡Hola Guardabarranco Studio! 👋 He cotizado un plan en su sitio web:\n\n` +
      `📌 *Servicio:* ${serviceName}\n` +
      `📍 *Alcance:* ${reachName}\n` +
      `⏱ *Modalidad:* ${durationDisplay}\n` +
      (extrasList.length > 0 ? `➕ *Adicionales:* ${extrasList.join(', ')}\n` : '') +
      `💰 *Inversión Estimada:* $${totalUSD.toLocaleString()} USD (~C$ ${totalNIO.toLocaleString()} NIO)\n\n` +
      `Quisiera coordinar una llamada para evaluar mi negocio.`;

    if (btnSendQuoteWhatsapp) {
      btnSendQuoteWhatsapp.onclick = () => {
        window.open(`https://wa.me/50585574484?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      };
    }

    if (btnSendQuoteEmail) {
      const emailSubject = `Cotización Web Guardabarranco — ${serviceName}`;
      const emailBody = message.replace(/\*/g, '');
      btnSendQuoteEmail.href = `mailto:contacto@guardabarrancostudio.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    }
  }

  // Bind change listeners to all calculator inputs
  [...calcServiceRadios, ...calcReachRadios, ...calcDurationRadios, ...calcExtraCheckboxes].forEach(input => {
    input.addEventListener('change', calculateQuote);
  });

  // Botones "Simular en Cotizador" desde tarjetas del catálogo
  document.querySelectorAll('[data-preload-quote]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preload-quote');
      const radio = document.querySelector(`input[name="calcService"][value="${val}"]`);
      if (radio) {
        radio.checked = true;
        calculateQuote();
        const calcSec = document.getElementById('cotizador');
        if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
        if (typeof showGbToast === 'function') {
          showGbToast(`Paquete "${radio.dataset.name}" cargado en el Cotizador`);
        }
      }
    });
  });

  // Calculate initially on load
  calculateQuote();

  // 7. Los testimonios de ejemplo se eliminaron: ahora la sección "Compromisos" no requiere JavaScript.

  // 8. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerDiv = item.querySelector('.faq-answer');

    if (questionBtn && answerDiv) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        });

        // Toggle clicked
        if (!isActive) {
          item.classList.add('active');
          answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          answerDiv.style.maxHeight = null;
        }
      });
    }
  });

  // 9. Formulario de contacto: validación en línea y envío directo a WhatsApp
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const formError = document.getElementById('formError');
  const formWspFallback = document.getElementById('formWspFallback');

  if (contactForm) {
    const showFormError = (msg, field) => {
      if (formFeedback) formFeedback.classList.remove('success');
      if (formError) {
        formError.textContent = msg;
        formError.hidden = false;
      }
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    };

    contactForm.addEventListener('input', (e) => {
      if (e.target && e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
      if (formError) formError.hidden = true;
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombreInput = document.getElementById('contactNombre');
      const telInput = document.getElementById('contactTel');
      const emailInput = document.getElementById('contactEmail');
      const interesSelect = document.getElementById('contactInteres');
      const nombre = nombreInput.value.trim();
      const tel = telInput.value.trim();
      const email = emailInput.value.trim();
      const interesText = interesSelect.options[interesSelect.selectedIndex].text;
      const mensaje = document.getElementById('contactMensaje').value.trim();

      if (!nombre) {
        showFormError('Escribe tu nombre o el de tu empresa.', nombreInput);
        return;
      }
      if (tel.replace(/\D/g, '').length < 8) {
        showFormError('Escribe un teléfono o WhatsApp válido (mínimo 8 dígitos).', telInput);
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormError('Revisa tu correo: parece incompleto.', emailInput);
        return;
      }

      const whatsappMsg = [
        '*Nuevo contacto web - Guardabarranco Studio*',
        '',
        `*Nombre:* ${nombre}`,
        `*Teléfono:* ${tel}`,
        `*Correo:* ${email || 'No proporcionado'}`,
        `*Servicio de interés:* ${interesText}`,
        `*Mensaje:* ${mensaje || 'Deseo coordinar una sesión de diagnóstico'}`
      ].join('\n');
      const wspUrl = `https://wa.me/50585574484?text=${encodeURIComponent(whatsappMsg)}`;
      const formEmailFallback = document.getElementById('formEmailFallback');
      const emailSubject = `Auditoría Comercial Guardabarranco — ${nombre} (${interesText})`;
      const emailBody = whatsappMsg.replace(/\*/g, '');

      if (formError) formError.hidden = true;
      if (formWspFallback) formWspFallback.href = wspUrl;
      if (formEmailFallback) {
        formEmailFallback.href = `mailto:contacto@guardabarrancostudio.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      }
      if (formFeedback) {
        formFeedback.classList.add('success');
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Se abre WhatsApp de inmediato (sin borrar los datos capturados del usuario)
      window.open(wspUrl, '_blank', 'noopener');
    });
  }

  // 12. Diagnóstico interactivo en 60 segundos (recomienda un paquete del catálogo)
  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    const quizStage = document.getElementById('quizStage');
    const quizBar = document.getElementById('quizBar');
    const quizStepLabel = document.getElementById('quizStepLabel');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizOptions = document.getElementById('quizOptions');
    const quizBack = document.getElementById('quizBack');
    const quizResult = document.getElementById('quizResult');

    // Paquetes oficiales del catálogo (mismos precios que las fichas)
    const quizPlans = {
      'pyme-local': { name: 'Plan Impulso Pyme Local', price: 220, priceText: '$220 USD / mes', nioText: '~C$ 8,056 NIO / mes' },
      'marca-nacional': { name: 'Plan Marca Líder Nacional', price: 580, priceText: '$580 USD / mes', nioText: '~C$ 21,239 NIO / mes' },
      'expansion-ca': { name: 'Plan Expansión Centroamérica B2B', price: 1250, priceText: '$1,250 USD / mes', nioText: '~C$ 45,775 NIO / mes' },
      'spot-dron': { name: 'Spot Publicitario & Producción Dron 4K', price: 350, priceText: '$350 USD / proyecto', nioText: '~C$ 12,817 NIO / proyecto' },
      'branding-pack': { name: 'Branding & Packaging Comercial', price: 450, priceText: '$450 USD / proyecto', nioText: '~C$ 16,479 NIO / proyecto' },
      'web-corp': { name: 'Sitio Web Corporativo & Catálogo Digital', price: 490, priceText: '$490 USD / proyecto', nioText: '~C$ 17,943 NIO / proyecto' },
      'dev-studio': { name: 'Ingeniería de Software a Medida (Dev Studio)', price: 1450, priceText: 'Desde $1,450 USD (Hitos 40/30/30)', nioText: 'Desde ~C$ 53,099 NIO' }
    };

    const quizQuestions = [
      {
        key: 'rubro',
        title: '¿A qué se dedica tu negocio?',
        options: [
          { v: 'comercio', label: 'Comercio o tienda', icon: 'bi-shop' },
          { v: 'comida', label: 'Restaurante o comida', icon: 'bi-cup-hot' },
          { v: 'salud', label: 'Salud, clínica o veterinaria', icon: 'bi-heart-pulse' },
          { v: 'agro', label: 'Agro, industria o distribución', icon: 'bi-truck' },
          { v: 'servicios', label: 'Construcción o servicios', icon: 'bi-tools' },
          { v: 'otro', label: 'Otro rubro', icon: 'bi-grid' }
        ]
      },
      {
        key: 'alcance',
        title: '¿Dónde están tus clientes?',
        options: [
          { v: 'local', label: 'En mi ciudad o zona (Chinandega, El Viejo, León)', icon: 'bi-geo-alt' },
          { v: 'nacional', label: 'En toda Nicaragua', icon: 'bi-flag' },
          { v: 'regional', label: 'En Centroamérica', icon: 'bi-globe-americas' }
        ]
      },
      {
        key: 'necesidad',
        title: '¿Qué necesitas más ahora mismo?',
        options: [
          { v: 'clientes', label: 'Más clientes escribiéndome por WhatsApp', icon: 'bi-whatsapp' },
          { v: 'marca', label: 'Una marca, logo o empaque nuevo', icon: 'bi-palette' },
          { v: 'video', label: 'Video o fotografía con dron profesional', icon: 'bi-camera-reels' },
          { v: 'web', label: 'Un sitio web o catálogo en línea', icon: 'bi-laptop' },
          { v: 'software', label: 'Un sistema ERP, inventario o App móvil a medida', icon: 'bi-cpu' }
        ]
      },
      {
        key: 'presupuesto',
        title: '¿Cuánto puedes invertir?',
        options: [
          { v: '250', max: 250, label: 'Hasta $250', icon: 'bi-cash' },
          { v: '600', max: 600, label: '$250 a $600', icon: 'bi-cash-stack' },
          { v: '1300', max: 1300, label: '$600 a $1,300', icon: 'bi-bank' },
          { v: '2000', max: Infinity, label: 'Más de $1,300', icon: 'bi-gem' },
          { v: 'flex', max: null, label: 'Prefiero que me asesoren', icon: 'bi-chat-dots' }
        ]
      }
    ];

    let quizStep = 0;
    let quizAnswers = {};

    const renderQuizStep = () => {
      const q = quizQuestions[quizStep];
      quizResult.hidden = true;
      quizStage.hidden = false;
      quizStepLabel.textContent = `Pregunta ${quizStep + 1} de ${quizQuestions.length}`;
      quizQuestion.textContent = q.title;
      quizBar.style.width = `${(quizStep / quizQuestions.length) * 100}%`;
      quizBack.hidden = quizStep === 0;

      quizOptions.innerHTML = '';
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option' + (quizAnswers[q.key] && quizAnswers[q.key].v === opt.v ? ' selected' : '');
        btn.innerHTML = `<i class="bi ${opt.icon}"></i><span>${opt.label}</span>`;
        btn.addEventListener('click', () => {
          quizAnswers[q.key] = opt;
          if (quizStep < quizQuestions.length - 1) {
            quizStep += 1;
            renderQuizStep();
          } else {
            showQuizResult();
          }
        });
        quizOptions.appendChild(btn);
      });

      // Reinicia la animación de entrada
      quizStage.classList.remove('quiz-fade');
      void quizStage.offsetWidth;
      quizStage.classList.add('quiz-fade');
    };

    const recommendPlan = () => {
      const { necesidad, alcance } = quizAnswers;
      if (necesidad.v === 'software') return 'dev-studio';
      if (necesidad.v === 'marca') return 'branding-pack';
      if (necesidad.v === 'video') return 'spot-dron';
      if (necesidad.v === 'web') return 'web-corp';
      if (alcance.v === 'local') return 'pyme-local';
      if (alcance.v === 'nacional') return 'marca-nacional';
      return 'expansion-ca';
    };

    const showQuizResult = () => {
      const key = recommendPlan();
      const plan = quizPlans[key];
      const { rubro, alcance, necesidad, presupuesto } = quizAnswers;
      const activeCurr = localStorage.getItem('gbStudioCurrency') || 'USD';
      const displayPrice = activeCurr === 'NIO' ? `${plan.nioText} (${plan.priceText})` : `${plan.priceText} (${plan.nioText})`;

      const reasons = [
        `Pensado para negocios como el tuyo: ${rubro.label.toLowerCase()}.`,
        `Responde a lo que más necesitas: ${necesidad.label.toLowerCase()}.`
      ];
      if (necesidad.v === 'clientes') {
        reasons[1] = `Responde a tu meta de ${necesidad.label.toLowerCase()}, con cobertura ${alcance.v === 'local' ? 'local' : alcance.v === 'nacional' ? 'nacional' : 'regional'}.`;
      }

      let budgetNote;
      if (presupuesto.max === null) {
        budgetNote = 'Te ayudamos a ajustar el alcance al presupuesto que tengas.';
      } else if (plan.price > presupuesto.max) {
        budgetNote = key === 'dev-studio'
          ? `Si deseas validar antes de invertir en desarrollo completo (${plan.priceText}), puedes iniciar con nuestro Sprint 0 de Prototipo + Presupuesto Cerrado ($190 USD, 100% acreditables en Dev Studio).`
          : `Para validar retorno antes de este paquete (${plan.priceText}), te recomendamos iniciar con nuestro Sprint Comercial WhatsApp 14 Días ($145 USD — $50 acreditables) o el Plan Impulso Pyme ($220/mes).`;
      } else {
        budgetNote = 'Tu presupuesto encaja con este paquete.';
      }

      const msg = [
        '*Diagnóstico web - Guardabarranco Studio*',
        '',
        `*Rubro:* ${rubro.label}`,
        `*Clientes:* ${alcance.label}`,
        `*Necesidad:* ${necesidad.label}`,
        `*Inversión:* ${presupuesto.label}`,
        `*Plan recomendado:* ${plan.name} (${plan.priceText})`,
        '',
        'Quiero conversar sobre este plan.'
      ].join('\n');
      const wspUrl = `https://wa.me/50585574484?text=${encodeURIComponent(msg)}`;
      const detailBtnText = key === 'dev-studio' ? 'Ir a Dev Studio & Cotizador' : 'Ver detalles del paquete';

      quizBar.style.width = '100%';
      quizStage.hidden = true;
      quizResult.innerHTML = `
        <div class="quiz-result-badge"><i class="bi bi-stars"></i> Tu plan recomendado</div>
        <h3>${plan.name}</h3>
        <div class="quiz-result-price">${displayPrice}</div>
        <ul class="quiz-reasons">
          ${reasons.map(r => `<li><i class="bi bi-check-circle-fill"></i><span>${r}</span></li>`).join('')}
          <li><i class="bi bi-info-circle-fill"></i><span>${budgetNote}</span></li>
        </ul>
        <div class="quiz-result-actions">
          <a href="${wspUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp" id="quizSendWsp">
            <i class="bi bi-whatsapp"></i><span>Enviar mi diagnóstico por WhatsApp</span>
          </a>
          <button type="button" class="btn btn-secondary" id="quizViewPlan"><i class="bi bi-card-checklist"></i><span>${detailBtnText}</span></button>
        </div>
        <button type="button" class="quiz-back" id="quizRestart"><i class="bi bi-arrow-counterclockwise"></i> Repetir diagnóstico</button>
      `;
      quizResult.hidden = false;
      quizResult.classList.remove('quiz-fade');
      void quizResult.offsetWidth;
      quizResult.classList.add('quiz-fade');
      quizCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      document.getElementById('quizViewPlan').addEventListener('click', () => {
        if (key === 'dev-studio') {
          window.location.href = '../DEV%20STUDIO/index.html#estimador';
          return;
        }
        const fichaBtn = document.querySelector(`.btn-ver-ficha[data-ficha="${key}"]`);
        if (fichaBtn) {
          fichaBtn.click();
        } else {
          window.location.hash = '#catalogo';
        }
      });
      document.getElementById('quizRestart').addEventListener('click', () => {
        quizStep = 0;
        quizAnswers = {};
        renderQuizStep();
      });
    };

    quizBack.addEventListener('click', () => {
      if (quizStep > 0) {
        quizStep -= 1;
        renderQuizStep();
      }
    });

    renderQuizStep();
  }

  // 10. WhatsApp Speed-Dial Widget Trigger
  const whatsappFabTrigger = document.getElementById('whatsappFabTrigger');
  const wspWidgetBox = document.getElementById('wspWidgetBox');
  const closeWspWidget = document.getElementById('closeWspWidget');

  if (whatsappFabTrigger && wspWidgetBox) {
    whatsappFabTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wspWidgetBox.classList.toggle('active');
    });

    if (closeWspWidget) {
      closeWspWidget.addEventListener('click', (e) => {
        e.stopPropagation();
        wspWidgetBox.classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (!wspWidgetBox.contains(e.target) && e.target !== whatsappFabTrigger) {
        wspWidgetBox.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 11. CATÁLOGO COMERCIAL 2026 - FILTROS Y FICHAS TÉCNICAS INTERACTIVAS
  // ==========================================================================
  const catalogTabBtns = document.querySelectorAll('.catalog-tab-btn');
  const catalogCards = document.querySelectorAll('.catalog-card');
  const catalogModal = document.getElementById('catalogModal');
  const modalTierBadge = document.getElementById('modalTierBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeCatalogModal = document.getElementById('closeCatalogModal');
  const btnDescargarPdfCatalogo = document.getElementById('btnDescargarPdfCatalogo');

  // Base de datos detallada de fichas técnicas del catálogo
  const catalogData = {
    'pyme-local': {
      tier: 'Popular en Occidente',
      badgeClass: 'tier-green',
      title: 'Plan Impulso Pyme Local',
      image: 'assets/catalogo/pyme-local.jpg',
      priceUsd: '$220 USD / mes',
      priceNio: 'C$ 8,056 NIO / mes (Tasa oficial)',
      timeline: 'Puesta en marcha en 72h hábiles',
      target: 'Comercios de Chinandega, El Viejo, León y Chichigalpa',
      format: '12 Gráficas + Pauta Meta Ads + Fotografía in situ',
      resumen: 'El plan ideal para pequeños y medianos comercios de Occidente (restaurantes, talleres, clínicas veterinarias, ferreterías, farmacias y tiendas de ropa) que buscan generar prospectos diarios directos a su WhatsApp Business sin desperdiciar dinero en publicidad tradicional.',
      entregables: [
        '12 Diseños Publicitarios de Alta Conversión adaptados para Feed y Stories de Facebook e Instagram.',
        '1 Sesión Fotográfica profesional en tu local comercial (hasta 20 fotografías editadas en alta definición).',
        'Configuración y optimización de Campaña en Meta Ads enfocada en mensajes directos a WhatsApp Business.',
        'Segmentación hiperlocal en un radio de 5 a 15 km de tu establecimiento (Chinandega, El Viejo, León).',
        'Optimización y configuración de respuestas automáticas y catálogo de WhatsApp Business.',
        'Reporte Ejecutivo Mensual en PDF con métricas de alcance, conversaciones generadas y costo por prospecto.'
      ],
      requisitos: [
        'Acceso de administrador o anunciante a la página de Facebook e Instagram comercial.',
        'Número activo con WhatsApp Business en el teléfono del encargado de ventas.',
        'Presupuesto de pauta publicitaria adicional ($30 a $60 USD al mes recomendado).'
      ],
      garantia: 'Garantía de revisión en menos de 24 horas y soporte técnico directo por chat de lunes a sábado.',
      wspText: 'Hola Guardabarranco Studio, quiero contratar el Plan Impulso Pyme Local ($220/mes) para mi negocio.'
    },
    'marca-nacional': {
      tier: 'Más Elegido en Nicaragua',
      badgeClass: 'tier-gold',
      title: 'Plan Marca Líder Nacional',
      image: 'assets/catalogo/marca-nacional.jpg',
      priceUsd: '$580 USD / mes',
      priceNio: 'C$ 21,239 NIO / mes (Tasa oficial)',
      timeline: 'Activación en 5 a 7 días hábiles',
      target: 'Empresas consolidadas, distribuidoras y marcas a nivel nacional',
      format: '24 Piezas + 6 Reels + Dron 4K bimestral + Landing Web + CM',
      resumen: 'Estrategia agresiva 360° para empresas nicaragüenses que compiten a nivel nacional en Managua, León, Chinandega, Matagalpa, Estelí y Masaya. Diseñado para posicionar autoridad, captar clientes mayoristas y multiplicar ventas retail.',
      entregables: [
        '24 Piezas de contenido mensual: 18 artes estáticos/carruseles de alta gama + 6 videos cortos (Reels / TikToks) grabados y editados con subtítulos dinámicos.',
        '1 Jornada bimestral de producción audiovisual con Dron DJI 4K y cámaras de cine en instalaciones del cliente o campo.',
        'Pauta publicitaria multicanal gestionada profesionalmente en Meta Ads, Google Search y TikTok Ads.',
        'Creación y mantenimiento de Landing Page de aterrizaje ultrarrápida para captura de prospectos calificados.',
        'Community Manager asignado de lunes a sábado de 8:00 AM a 6:00 PM con protocolos corporativos de atención.',
        'Dashboard interactivo en tiempo real con estadísticas de leads generados, conversiones y retorno de inversión.'
      ],
      requisitos: [
        'Briefing inicial de 45 minutos con los directores de Guardabarranco Studio.',
        'Catálogo de productos o lista de servicios con especificaciones y precios.',
        'Presupuesto de inversión en medios recomendado: $150 a $300 USD al mes.'
      ],
      garantia: 'Entrega del calendario de contenido cada día 25 de mes y revisiones ilimitadas previas a publicación.',
      wspText: 'Hola Guardabarranco Studio, deseo coordinar una sesión estratégica para el Plan Marca Líder Nacional ($580/mes).'
    },
    'expansion-ca': {
      tier: 'Escala Regional CA-4',
      badgeClass: 'tier-blue',
      title: 'Plan Expansión Centroamérica B2B',
      image: 'assets/catalogo/expansion-ca.jpg',
      priceUsd: '$1,250 USD / mes',
      priceNio: 'C$ 45,775 NIO / mes (Tasa oficial)',
      timeline: 'Sprints bisemanales y reuniones estratégicas semanales',
      target: 'Agroexportadoras, consorcios y cadenas comerciales en CA-4',
      format: 'Pauta CA-4 + 2 Spots Cine Dron + Leads B2B + Soporte Ferias',
      resumen: 'Solución corporativa de alto impacto para marcas que exportan u operan entre Nicaragua, El Salvador, Honduras, Costa Rica y Guatemala. Enfoque riguroso en captación de distribuidores mayoristas y posicionamiento directivo.',
      entregables: [
        'Estrategia de prospección comercial B2B en países del CA-4 dirigida a gerentes generales y jefes de compras.',
        '2 Spots publicitarios cinematográficos por trimestre con tomas aéreas 4K, locución profesional y animación de gráficas.',
        'Material POP publicitario y cobertura en vivo para ferias sectoriales regionales (EXPICA, ferias ganaderas y congresos).',
        'Director Creativo Senior y Account Manager asignados exclusivamente a la cuenta.',
        'Gestión de relaciones públicas digitales, notas de prensa en medios sectoriales de Centroamérica y prevención de crisis.',
        'Cesión total de derechos patrimoniales y entrega de archivos fuente abiertos.'
      ],
      requisitos: [
        'Firma de Acuerdo de Confidencialidad bilateral (NDA).',
        'Enlace directo con la Gerencia Comercial o de Exportaciones.'
      ],
      garantia: 'Auditoría mensual de pauta y entrega de reportes financieros certificados con conciliación de inversión publicitaria.',
      wspText: 'Hola Guardabarranco Studio, deseo agendar una llamada ejecutiva sobre el Plan Expansión Centroamérica ($1,250/mes).'
    },
    'spot-dron': {
      tier: 'Cinematografía & Dron 4K',
      badgeClass: 'tier-orange',
      title: 'Spot Publicitario & Producción Dron 4K',
      image: 'assets/catalogo/spot-dron.jpg',
      priceUsd: '$350 USD / proyecto',
      priceNio: 'C$ 12,817 NIO / proyecto',
      timeline: 'Entrega final en 5 días hábiles',
      target: 'Constructoras, fincas agropecuarias, hoteles, naves industriales y eventos',
      format: '1 Master 4K (60s) + 3 Versiones Reels 9:16 + Color Grading',
      resumen: 'Producción audiovisual de primer nivel con cámaras de cine y drones 4K de última generación para capturar la majestuosidad de tus instalaciones, procesos agrícolas, obras civiles o eventos corporativos en cualquier parte de Nicaragua.',
      entregables: [
        'Jornada de filmación de hasta 4 horas con piloto certificado y equipo de estabilización profesional.',
        '1 Spot comercial master de 60 segundos en resolución 4K (16:9 horizontal) para televisión, YouTube y salas de conferencias.',
        '3 Versiones cortas verticales (9:16) con subtítulos dinámicos diseñadas específicamente para TikTok, Instagram Reels y WhatsApp Estados.',
        'Color grading cinemático, edición de sonido envolvente y pista musical con licencia comercial internacional de por vida.',
        'Entrega en nube privada con acceso permanente y respaldo en doble soporte.'
      ],
      requisitos: [
        'Permiso de ingreso a las instalaciones o predio a filmar.',
        'Persona de contacto en sitio durante la jornada de filmación.'
      ],
      garantia: 'Hasta 2 rondas de ajustes de edición incluidas sin costo adicional.',
      wspText: 'Hola Guardabarranco Studio, deseo cotizar una producción con Dron 4K y video cinemático ($350).'
    },
    'branding-pack': {
      tier: 'Identidad Corporativa',
      badgeClass: 'tier-green',
      title: 'Branding & Packaging Comercial',
      image: 'assets/catalogo/branding-pack.jpg',
      priceUsd: '$450 USD / proyecto',
      priceNio: 'C$ 16,479 NIO / proyecto',
      timeline: 'Entrega en 10 a 12 días hábiles',
      target: 'Nuevas marcas, productos de consumo masivo y rediseño de identidad',
      format: 'Manual 25 páginas + 2 Diseños de Empaque + Troqueles + Fuentes',
      resumen: 'Construcción integral de identidad visual: no solo un logotipo, sino todo el sistema gráfico, empaques listos para percha de supermercado (La Colonia, Palí, Maxi) y documentación técnica para registro de marca.',
      entregables: [
        '3 Propuestas conceptuales de logotipo desarrolladas desde cero según análisis de mercado.',
        'Versiones finales aprobadas: horizontal, vertical, monograma, sello y versión monocromática.',
        'Manual de Identidad Visual Corporativa de 25 páginas con paletas de color CMYK, RGB, Pantone, tipografías y reglas de uso.',
        'Diseño técnico de 2 empaques o etiquetas con cotas y líneas de troquel listas para imprenta.',
        'Diseño de papelería institucional: tarjetas de presentación, membrete, sobres, uniformes y firmas de correo.',
        'Entrega de archivos maestros vectoriales en Adobe Illustrator (.AI), SVG, EPS, PDF para imprenta y PNG transparentes.'
      ],
      requisitos: [
        'Llenado de cuestionario inicial de branding (valores, audiencia, competidores).',
        'Medidas físicas y requerimientos técnicos de los empaques.'
      ],
      garantia: 'Garantía de satisfacción: si ninguna de las 3 primeras propuestas convence, se desarrolla una 4ta vía conceptual sin costo.',
      wspText: 'Hola Guardabarranco Studio, deseo cotizar el desarrollo de Branding y Packaging ($450).'
    },
    'web-corp': {
      tier: 'Sinergia con Dev Studio',
      badgeClass: 'tier-blue',
      title: 'Sitio Web Corporativo & Catálogo Digital',
      image: 'assets/catalogo/web-corp.jpg',
      priceUsd: '$490 USD / proyecto',
      priceNio: 'C$ 17,943 NIO / proyecto',
      timeline: 'Entrega en 7 a 10 días hábiles',
      target: 'Empresas y profesionales que buscan proyectar máxima solvencia comercial',
      format: 'Hasta 5 secciones + Catálogo interactivo + WhatsApp + Hosting 1 año',
      resumen: 'Sitio web moderno desarrollado en código limpio (HTML5/CSS3/JS puro) por los ingenieros de Dev Studio. Carga en menos de 1 segundo en redes móviles nicaragüenses, incluye catálogo de productos y cotizador directo a WhatsApp.',
      entregables: [
        'Diseño 100% responsivo para teléfonos inteligentes, tablets y computadoras.',
        'Hasta 5 secciones completas (Inicio, Empresa, Catálogo de Productos o Servicios, Metodología y Contacto).',
        'Módulo de Catálogo interactivo con buscador en vivo por palabras clave y filtros de categoría.',
        'Botón flotante y Speed-Dial para atención inmediata de prospectos a WhatsApp.',
        'Optimización técnica SEO Local (Google Search Console y Google Maps) para aparecer en búsquedas de Nicaragua.',
        'Dominio .com o .net + Alojamiento en la nube de alta velocidad con certificado de seguridad SSL HTTPS por 1 año.',
        'Sesión de capacitación virtual para administración y actualización de contenidos.'
      ],
      requisitos: [
        'Logotipo en alta resolución, textos descriptivos del negocio y fotografías de productos o proyectos.',
        'Designación de una persona de contacto para aprobaciones intermedias.'
      ],
      garantia: 'Garantía técnica de 6 meses contra errores de código y 99.9% de tiempo de actividad del servidor.',
      wspText: 'Hola Guardabarranco Studio, deseo contratar el Sitio Web Corporativo & Catálogo Digital ($490).'
    }
  };

  // Filtrado de pestañas del Catálogo
  if (catalogTabBtns.length > 0 && catalogCards.length > 0) {
    catalogTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catalogTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.catFilter;

        catalogCards.forEach(card => {
          const itemCat = card.dataset.catItem;
          if (filter === 'all' || itemCat === filter) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // Apertura de Modal Ficha Técnica
  const fichaBtns = document.querySelectorAll('.btn-ver-ficha');
  if (fichaBtns.length > 0 && catalogModal) {
    fichaBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const fichaKey = btn.dataset.ficha;
        const data = catalogData[fichaKey];

        if (!data) return;

        // Populate header
        if (modalTierBadge) {
          modalTierBadge.className = `catalog-tier-badge ${data.badgeClass || 'tier-blue'}`;
          modalTierBadge.innerHTML = `<i class="bi bi-patch-check-fill me-1"></i> ${data.tier}`;
        }
        if (modalTitle) {
          modalTitle.textContent = data.title;
        }

        // Render dynamic body
        if (modalContent) {
          modalContent.innerHTML = `
            ${data.image ? `<div class="ficha-hero-image"><img src="${data.image}" alt="${data.title}"></div>` : ''}

            <div class="ficha-meta-strip">
              <span class="ficha-meta-item"><i class="bi bi-clock-history text-primary"></i> ${data.timeline}</span>
              <span class="ficha-meta-item"><i class="bi bi-geo-alt-fill text-danger"></i> ${data.target}</span>
              <span class="ficha-meta-item"><i class="bi bi-box-seam text-info"></i> ${data.format}</span>
            </div>

            <div class="ficha-price-box">
              <div>
                <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--c-azul-marino); font-weight: 700; display: block;">Inversión Transparente</span>
                <span class="ficha-price-primary">${data.priceUsd}</span>
              </div>
              <div class="text-end">
                <span class="ficha-price-secondary">${data.priceNio}</span>
                <span style="display: block; font-size: 0.78rem; color: var(--c-gris-500);">Factura y recibo oficial de ley</span>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h5 class="ficha-section-title"><i class="bi bi-info-circle text-primary"></i> Resumen de la Solución</h5>
              <p style="font-size: 0.93rem; color: var(--c-gris-700); line-height: 1.6; margin: 0;">${data.resumen}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h5 class="ficha-section-title"><i class="bi bi-check2-all text-success"></i> Entregables Específicos & Alcance</h5>
              <ul class="ficha-list">
                ${data.entregables.map(item => `<li><i class="bi bi-check-circle-fill text-success"></i> <span>${item}</span></li>`).join('')}
              </ul>
            </div>

            <div style="margin-bottom: 20px;">
              <h5 class="ficha-section-title"><i class="bi bi-card-checklist text-warning"></i> Requisitos Iniciales del Cliente</h5>
              <ul class="ficha-list">
                ${data.requisitos.map(item => `<li><i class="bi bi-arrow-right-circle text-warning"></i> <span>${item}</span></li>`).join('')}
              </ul>
            </div>

            <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10B981; padding: 12px 16px; border-radius: 4px; font-size: 0.88rem; color: var(--c-gris-800);">
              <strong><i class="bi bi-shield-check text-success me-1"></i> Compromiso Guardabarranco:</strong> ${data.garantia}
            </div>

            <div class="ficha-footer-actions">
              <a href="https://wa.me/50585574484?text=${encodeURIComponent(data.wspText)}" target="_blank" rel="noopener" class="btn btn-primary flex-grow-1" style="justify-content: center;">
                <i class="bi bi-whatsapp me-2"></i> Solicitar este Paquete por WhatsApp
              </a>
              <button type="button" class="btn btn-secondary" id="btnModalPersonalizarCotizador" data-quote-val="${({ 'pyme-local': 'pyme', 'marca-nacional': 'campana360', 'expansion-ca': 'expansion', 'spot-dron': 'audiovisual', 'branding-pack': 'branding', 'web-corp': 'web' })[fichaKey] || 'pyme'}">
                <i class="bi bi-calculator me-1"></i> Personalizar en Cotizador
              </button>
              <button type="button" class="btn btn-secondary" id="btnCerrarModalInterno">
                <i class="bi bi-x-lg me-1"></i> Cerrar
              </button>
            </div>
          `;

          const btnModalPersonalizarCotizador = document.getElementById('btnModalPersonalizarCotizador');
          if (btnModalPersonalizarCotizador) {
            btnModalPersonalizarCotizador.addEventListener('click', () => {
              const quoteVal = btnModalPersonalizarCotizador.getAttribute('data-quote-val');
              closeModalFn();
              const targetRadio = document.querySelector(`input[name="calcService"][value="${quoteVal}"]`);
              if (targetRadio) {
                targetRadio.checked = true;
                calculateQuote();
                const calcSec = document.getElementById('cotizador');
                if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
                if (typeof showGbToast === 'function') {
                  showGbToast(`Paquete "${data.title}" cargado en el Cotizador`);
                }
              }
            });
          }

          // Close button inside modal body
          const btnCerrarModalInterno = document.getElementById('btnCerrarModalInterno');
          if (btnCerrarModalInterno) {
            btnCerrarModalInterno.addEventListener('click', closeModalFn);
          }
        }

        // Show modal
        catalogModal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModalFn = () => {
      catalogModal.classList.remove('show');
      document.body.style.overflow = '';
    };

    if (closeCatalogModal) {
      closeCatalogModal.addEventListener('click', closeModalFn);
    }

    // Close on backdrop click
    catalogModal.addEventListener('click', (e) => {
      if (e.target === catalogModal) {
        closeModalFn();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && catalogModal.classList.contains('show')) {
        closeModalFn();
      }
    });
  }

  // ==========================================================================
  // 13. SPOTLIGHT RADIAL HOVER, TILT 3D, PROGRESO DE LECTURA & CONVERSOR MONEDA
  // ==========================================================================
  const spotlightCards = document.querySelectorAll(
    '.service-card, .catalog-card, .commit-card, .process-card, .pricing-card'
  );
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = (((y - cy) / cy) * -3).toFixed(2);
      const ry = (((x - cx) / cx) * 3).toFixed(2);
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
      card.classList.add('gb-tilt-active');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('gb-tilt-active');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Barra superior de progreso de lectura
  const gbProgress = document.createElement('div');
  gbProgress.className = 'gb-scroll-progress no-print';
  document.body.appendChild(gbProgress);

  // Botón flotante Volver Arriba
  const gbBackTop = document.createElement('button');
  gbBackTop.type = 'button';
  gbBackTop.className = 'gb-back-top-btn no-print';
  gbBackTop.setAttribute('aria-label', 'Volver al inicio');
  gbBackTop.title = 'Volver arriba';
  gbBackTop.innerHTML = '<i class="bi bi-arrow-up"></i>';
  document.body.appendChild(gbBackTop);

  gbBackTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    gbProgress.style.width = `${pct}%`;
    gbBackTop.classList.toggle('visible', scrollTop > 450);
  }, { passive: true });

  // Toast de confirmación UX
  const gbToast = document.createElement('div');
  gbToast.className = 'gb-ux-toast no-print';
  document.body.appendChild(gbToast);
  let gbToastTimer = null;
  function showGbToast(msg) {
    gbToast.innerHTML = `<i class="bi bi-check-circle-fill text-warning"></i> <span>${msg}</span>`;
    gbToast.classList.add('show');
    if (gbToastTimer) clearTimeout(gbToastTimer);
    gbToastTimer = setTimeout(() => gbToast.classList.remove('show'), 3000);
  }

  // Selector Global de Moneda (USD ⇄ NIO) en la barra superior + Barra Móvil Cotizador + Tel Desktop
  const topbarFlex = document.querySelector('.topbar-content .topbar-items:last-child') || document.querySelector('.topbar-flex');
  if (topbarFlex) {
    const savedGbCurr = localStorage.getItem('gbStudioCurrency') || 'USD';
    const currSwitch = document.createElement('div');
    currSwitch.className = 'gb-currency-switch';
    currSwitch.id = 'gbCurrencySwitch';
    currSwitch.title = 'Alternar moneda principal entre Dólares (USD) y Córdobas (NIO)';
    currSwitch.innerHTML = `
      <span class="gb-curr-opt ${savedGbCurr === 'USD' ? 'active' : ''}" data-gb-curr="USD">USD $</span>
      <span class="gb-curr-opt ${savedGbCurr === 'NIO' ? 'active' : ''}" data-gb-curr="NIO">NIO C$</span>
    `;
    topbarFlex.appendChild(currSwitch);

    const gbPackagesPrices = [
      { usd: '$220', nio: 'C$ 8,056', unit: 'USD / mes', unitNio: 'NIO / mes', subNio: 'Aprox. C$ 8,056 NIO / mes (Tasa 36.62)', subUsd: 'Equivalente: $220 USD / mes' },
      { usd: '$580', nio: 'C$ 21,239', unit: 'USD / mes', unitNio: 'NIO / mes', subNio: 'Aprox. C$ 21,239 NIO / mes (Tasa 36.62)', subUsd: 'Equivalente: $580 USD / mes' },
      { usd: '$1,250', nio: 'C$ 45,775', unit: 'USD / mes', unitNio: 'NIO / mes', subNio: 'Aprox. C$ 45,775 NIO / mes (Tasa 36.62)', subUsd: 'Equivalente: $1,250 USD / mes' },
      { usd: '$350', nio: 'C$ 12,817', unit: 'USD / proyecto', unitNio: 'NIO / proyecto', subNio: 'Aprox. C$ 12,817 NIO / proyecto', subUsd: 'Equivalente: $350 USD / proyecto' },
      { usd: '$450', nio: 'C$ 16,479', unit: 'USD / proyecto', unitNio: 'NIO / proyecto', subNio: 'Aprox. C$ 16,479 NIO / proyecto', subUsd: 'Equivalente: $450 USD / proyecto' },
      { usd: '$490', nio: 'C$ 17,943', unit: 'USD / proyecto', unitNio: 'NIO / proyecto', subNio: 'Aprox. C$ 17,943 NIO / proyecto', subUsd: 'Equivalente: $490 USD / proyecto' }
    ];

    function applyGbCurrency(curr) {
      localStorage.setItem('gbStudioCurrency', curr);
      currSwitch.querySelectorAll('.gb-curr-opt').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-gb-curr') === curr);
      });
      const cards = document.querySelectorAll('#catalogGrid .catalog-card');
      cards.forEach((card, idx) => {
        const p = gbPackagesPrices[idx];
        if (!p) return;
        const mainEl = card.querySelector('.catalog-price-main');
        const subEl = card.querySelector('.catalog-price-sub');
        if (mainEl && subEl) {
          if (curr === 'NIO') {
            mainEl.innerHTML = `${p.nio} <span class="catalog-price-period">${p.unitNio}</span>`;
            subEl.textContent = p.subUsd;
          } else {
            mainEl.innerHTML = `${p.usd} <span class="catalog-price-period">${p.unit}</span>`;
            subEl.textContent = p.subNio;
          }
          return;
        }
        const usdRow = card.querySelector('.price-usd-row');
        const nioRow = card.querySelector('.price-nio-row');
        if (usdRow && nioRow) {
          if (curr === 'NIO') {
            usdRow.innerHTML = `<span class="price-amount">${p.nio}</span><span class="price-unit">${p.unitNio}</span>`;
            nioRow.innerHTML = `<i class="bi bi-currency-exchange"></i> ${p.subUsd}`;
          } else {
            usdRow.innerHTML = `<span class="price-amount">${p.usd}</span><span class="price-unit">${p.unit}</span>`;
            nioRow.innerHTML = `<i class="bi bi-currency-exchange"></i> ${p.subNio}`;
          }
        }
      });
      calculateQuote();
    }

    currSwitch.addEventListener('click', (e) => {
      const opt = e.target.closest('.gb-curr-opt');
      const current = localStorage.getItem('gbStudioCurrency') || 'USD';
      const next = opt ? opt.getAttribute('data-gb-curr') : (current === 'USD' ? 'NIO' : 'USD');
      applyGbCurrency(next);
      showGbToast(next === 'NIO' ? 'Precios principales en Córdobas (C$ NIO)' : 'Precios principales en Dólares ($ USD)');
    });

    if (savedGbCurr === 'NIO') {
      applyGbCurrency('NIO');
    }
  }

  // Barra móvil contextual dentro de #cotizador (oculta cuando .calc-summary-panel está visible)
  const cotizadorSec = document.getElementById('cotizador');
  const calcSummaryBox = cotizadorSec ? cotizadorSec.querySelector('.calc-summary-panel') : null;
  if (cotizadorSec && calcSummaryBox && 'IntersectionObserver' in window) {
    const mobileBar = document.createElement('div');
    mobileBar.className = 'gb-mobile-calc-bar no-print';
    mobileBar.id = 'gbMobileCalcBar';
    mobileBar.innerHTML = `
      <div class="gb-mobile-calc-meta">
        <span class="gb-mobile-calc-kicker">Inversión estimada</span>
        <strong class="gb-mobile-calc-val" id="gbMobileCalcValue">$220 USD</strong>
      </div>
      <button type="button" class="btn btn-sm btn-accent" id="gbMobileCalcJumpBtn">
        Ver Resumen <i class="bi bi-arrow-down-short"></i>
      </button>
    `;
    document.body.appendChild(mobileBar);

    const jumpBtn = document.getElementById('gbMobileCalcJumpBtn');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        calcSummaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    calculateQuote();

    let cotizadorVisible = false;
    let summaryVisible = false;
    const syncGbBar = () => {
      mobileBar.classList.toggle('is-visible', cotizadorVisible && !summaryVisible);
    };

    const cotizadorObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target === cotizadorSec) cotizadorVisible = entry.isIntersecting;
          if (entry.target === calcSummaryBox) summaryVisible = entry.isIntersecting;
        });
        syncGbBar();
      },
      { threshold: 0.08 }
    );
    cotizadorObserver.observe(cotizadorSec);
    cotizadorObserver.observe(calcSummaryBox);
  }

  // Copiar teléfono en escritorio al hacer clic en enlaces tel: (sin romper marcador móvil)
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const isDesktopFine = window.innerWidth >= 992 && window.matchMedia('(pointer: fine)').matches;
      if (isDesktopFine && navigator.clipboard && navigator.clipboard.writeText) {
        e.preventDefault();
        const rawPhone = link.getAttribute('href').replace('tel:', '').trim();
        navigator.clipboard.writeText(rawPhone).then(() => {
          showGbToast(`Teléfono copiado (${rawPhone}). Disponible por llamada o WhatsApp.`);
        }).catch(() => {
          window.location.href = link.getAttribute('href');
        });
      }
    });
  });

  const revealItems = document.querySelectorAll(
    '.service-card, .catalog-card, .pricing-card, .process-card, .commit-card, .portfolio-card, .about-card'
  );
  if ('IntersectionObserver' in window && revealItems.length > 0) {
    revealItems.forEach((el, idx) => {
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = `${(idx % 3) * 60}ms`;
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -35px 0px' }
    );

    revealItems.forEach(el => revealObserver.observe(el));
  }
});
