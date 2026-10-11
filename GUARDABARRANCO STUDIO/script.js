/**
 * GUARDABARRANCO STUDIO - JAVASCRIPT PRINCIPAL
 * Interactividad, Cotizador Dinámico, Filtros de Portafolio y Modales
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
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

  // 5. Portafolio - Modal con Casos de Estudio Detallados
  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectContent = document.getElementById('modalProjectContent');

  const caseStudiesData = {
    'cafe-cordillera': {
      title: 'Café Cordillera de Dipilto &bull; Branding y Expansión',
      category: 'Branding, Empaque & Estrategia Regional',
      client: 'Asociación de Pequeños Caficultores de Nueva Segovia',
      challenge: 'El café de alta calidad competía como producto a granel sin reconocimiento de marca, perdiendo margen frente a intermediarios.',
      solution: 'Desarrollamos una identidad visual premium que exalta la fauna nicaragüense (Guardabarranco y orquídeas de montaña), diseñamos bolsas con válvula desgasificadora metalizada y ejecutamos pauta en redes para pedidos en línea y envíos a El Salvador y Managua.',
      results: [
        '+340% de incremento en ventas directas al consumidor sin intermediarios.',
        'Entrada en 14 tiendas especializadas y hoteles boutique en Nicaragua y San Salvador.',
        'Premio Nacional de Diseño de Empaque Cafetalero 2025.'
      ]
    },
    'agro-pacifico': {
      title: 'AgroExport del Pacífico &bull; Pauta B2B Regional',
      category: 'Pauta Digital B2B & Captación Mayorista',
      client: 'Corporación Agroindustrial del Occidente de Nicaragua',
      challenge: 'Captar nuevos distribuidores agrícolas en Honduras y El Salvador para su línea de fertilizantes orgánicos y maquinaria ligera.',
      solution: 'Implementamos campañas hiper-segmentadas en Meta y LinkedIn dirigidas exclusivamente a dueños de fincas, cooperativas e ingenios, conectando a un equipo de ventas bilingüe mediante WhatsApp Business API con catalogación de productos.',
      results: [
        '180 distribuidores mayoristas verificados en 90 días.',
        'Tasa de conversión de contacto a cotización formal del 38%.',
        'Contratos comerciales cerrados por más de $420,000 USD en la región CA-4.'
      ]
    },
    'ron-volcan': {
      title: 'Flor del Volcán &bull; Spot Cinematográfico & Dron',
      category: 'Producción Audiovisual 4K & Comercial',
      client: 'Destilería Artesanal de Chichigalpa',
      challenge: 'Lanzar una edición de ron premium añejado en barricas de roble y posicionarlo frente a las marcas industriales consolidadas.',
      solution: 'Produjimos un spot cinematográfico filmado al amanecer en las faldas del Volcán San Cristóbal, combinando tomas de dron FPV a alta velocidad entre cañaverales con fotografía macro de la gota de destilado y música con marimba tradicional estilizada.',
      results: [
        '2.4 millones de reproducciones orgánicas en Instagram y TikTok.',
        'Primer lote de 5,000 botellas agotado durante la primera semana de preventa.',
        'Viralización nacional e interés de importadores en Costa Rica.'
      ]
    },
    'sabor-pinolero': {
      title: 'Sabor Pinolero &bull; Pauta Local y Lleno Total',
      category: 'Pauta Local & Redes Sociales Gastronómicas',
      client: 'Cadena de Restaurantes Típicos',
      challenge: 'Baja afluencia de comensales entre semana y poca visibilidad del servicio a domicilio frente a aplicaciones de delivery.',
      solution: 'Revolucionamos sus redes con videos en formato Reels mostrando la preparación al carbón de cortes tradicionales, nacatamales y refrescos típicos (chicha, cacao, semilla de jícaro), con pauta geo-localizada en un radio de 5 km en Chinandega y León.',
      results: [
        'ROAS medido de 5.2x en retorno sobre inversión publicitaria.',
        'Incremento de ventas a domicilio en un 190% a través de pedidos por WhatsApp.',
        'Crecimiento de su comunidad de 15,000 a más de 95,000 seguidores locales.'
      ]
    },
    'clinica-lucia': {
      title: 'Clínica Médica Santa Lucía &bull; Captación Directa',
      category: 'Pauta Digital en Salud & WhatsApp Ads',
      client: 'Centro de Especialidades Médicas de Occidente',
      challenge: 'Nuevos consultorios de ginecología, pediatría y cardiología con capacidad ociosa y citas vacías.',
      solution: 'Estructuramos un funnel médico de captación con anuncios educativos de prevención en Facebook e Instagram, que al hacer clic abrían un chat de WhatsApp con un mensaje pre-llenado para agendar con el especialista disponible.',
      results: [
        '+1,450 citas médicas agendadas en 60 días.',
        'Costo por lead calificado de tan solo $0.24 USD.',
        'Ocupación del 92% en consultorios médicos durante todo el trimestre.'
      ]
    },
    'calzado-masaya': {
      title: 'Masaya Leather Co. &bull; De Taller a Exportación',
      category: 'Branding, E-Commerce & Exportación Regional',
      client: 'Taller de Marroquinería Fina Masaya',
      challenge: 'El calzado de cuero artesanal nicaragüense se vendía a precios bajos en mercados informales sin valor de marca.',
      solution: 'Construimos la marca desde cero: nombre, logotipo sobrio, fotografía editorial de moda con modelos nicaragüenses y tienda online con envíos rápidos a San José, Costa Rica y Ciudad de Panamá.',
      results: [
        'Incremento del ticket promedio de venta en un 280%.',
        'Más de 650 pares exportados mensualmente a clientes en Costa Rica.',
        'Reconocimiento en revistas de moda y diseño centroamericano.'
      ]
    }
  };

  portfolioCards.forEach(card => {
    card.addEventListener('click', () => {
      const projKey = card.dataset.project;
      const data = caseStudiesData[projKey];
      if (data) {
        modalProjectTitle.innerHTML = data.title;
        modalProjectContent.innerHTML = `
          <div style="margin-bottom: 18px;">
            <span class="badge-tag badge-orange" style="margin-bottom: 8px;">${data.category}</span>
            <p style="font-size: 0.95rem; color: #475569; margin-top: 6px;"><strong>Cliente:</strong> ${data.client}</p>
          </div>
          <div style="margin-bottom: 18px;">
            <h5 style="color: var(--c-azul-profundo); font-size: 1.1rem; margin-bottom: 6px;">El Reto:</h5>
            <p style="color: #64748B; font-size: 0.95rem; line-height: 1.6;">${data.challenge}</p>
          </div>
          <div style="margin-bottom: 18px;">
            <h5 style="color: var(--c-azul-profundo); font-size: 1.1rem; margin-bottom: 6px;">La Solución Creativa:</h5>
            <p style="color: #64748B; font-size: 0.95rem; line-height: 1.6;">${data.solution}</p>
          </div>
          <div style="background: var(--c-fondo-crema); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--c-gris-200); margin-bottom: 24px;">
            <h5 style="color: var(--c-turquesa-guarda); font-size: 1.1rem; margin-bottom: 10px;"><i class="bi bi-graph-up"></i> Resultados Obtenidos:</h5>
            <ul style="list-style: none; padding: 0;">
              ${data.results.map(r => `<li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; color: var(--c-azul-profundo); font-size: 0.95rem; font-weight: 500;"><i class="bi bi-check-circle-fill text-success"></i> ${r}</li>`).join('')}
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="https://wa.me/50585574484?text=Hola%20Guardabarranco%20Studio,%20quiero%20un%20proyecto%20similar%20a%20${encodeURIComponent(data.title)}" target="_blank" class="btn btn-whatsapp w-100">
              <i class="bi bi-whatsapp"></i> Quiero un Proyecto Similar para mi Marca
            </a>
          </div>
        `;
        projectModal.classList.add('show');
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

  function calculateQuote() {
    let basePrice = 250;
    let serviceName = 'Pauta Digital & Performance';

    calcServiceRadios.forEach(radio => {
      if (radio.checked) {
        basePrice = parseFloat(radio.dataset.price);
        serviceName = radio.dataset.name;
      }
    });

    let reachMultiplier = 1.0;
    let reachName = 'Local';
    calcReachRadios.forEach(radio => {
      if (radio.checked) {
        reachMultiplier = parseFloat(radio.dataset.multiplier);
        reachName = radio.dataset.name;
      }
    });

    let durationMultiplier = 1.0;
    let durationName = '1 Mes';
    calcDurationRadios.forEach(radio => {
      if (radio.checked) {
        durationMultiplier = parseFloat(radio.dataset.multiplier);
        durationName = radio.dataset.name;
      }
    });

    let extrasTotal = 0;
    let extrasList = [];
    calcExtraCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        extrasTotal += parseFloat(checkbox.dataset.price);
        extrasList.push(checkbox.dataset.name);
      }
    });

    // Fórmula de estimación comercial
    const totalUSD = Math.round((basePrice * reachMultiplier * durationMultiplier) + extrasTotal);
    const totalNIO = Math.round(totalUSD * EXCHANGE_RATE_NIO);

    // Actualizar UI
    if (summaryServiceName) summaryServiceName.textContent = serviceName;
    if (summaryReach) summaryReach.textContent = reachName;
    if (summaryDuration) summaryDuration.textContent = durationName;

    if (summaryExtrasRow && summaryExtrasText) {
      if (extrasList.length > 0) {
        summaryExtrasRow.style.display = 'flex';
        summaryExtrasText.textContent = extrasList.join(', ');
      } else {
        summaryExtrasRow.style.display = 'none';
      }
    }

    if (calcTotalUSD) calcTotalUSD.textContent = `$${totalUSD.toLocaleString()} USD`;
    if (calcTotalNIO) calcTotalNIO.textContent = `Aprox. C$ ${totalNIO.toLocaleString()} Córdobas`;

    // WhatsApp URL dinámico
    if (btnSendQuoteWhatsapp) {
      const message = `¡Hola Guardabarranco Studio! 👋 He cotizado un plan en su sitio web:\n\n` +
        `📌 *Servicio:* ${serviceName}\n` +
        `📍 *Alcance:* ${reachName}\n` +
        `⏱ *Duración:* ${durationName}\n` +
        (extrasList.length > 0 ? `➕ *Adicionales:* ${extrasList.join(', ')}\n` : '') +
        `💰 *Inversión Estimada:* $${totalUSD} USD (~C$ ${totalNIO} NIO)\n\n` +
        `Quisiera coordinar una llamada para evaluar mi negocio.`;

      btnSendQuoteWhatsapp.onclick = () => {
        window.open(`https://wa.me/50585574484?text=${encodeURIComponent(message)}`, '_blank');
      };
    }
  }

  // Bind change listeners to all calculator inputs
  [...calcServiceRadios, ...calcReachRadios, ...calcDurationRadios, ...calcExtraCheckboxes].forEach(input => {
    input.addEventListener('change', calculateQuote);
  });

  // Calculate initially on load
  calculateQuote();

  // 7. Testimonios Slider Interactivo
  const testimonials = [
    {
      text: '"Antes gastábamos dinero en hojas volantes y anuncios que nadie miraba. Con Guardabarranco Studio configuramos los anuncios directos a nuestro WhatsApp y en solo un fin de semana tuvimos que contratar dos recepcionistas extra para atender pacientes en Chinandega."',
      author: 'Dr. Roberto Silva',
      role: 'Director Médico • Clínica San Lucas, Chinandega',
      avatar: 'RS'
    },
    {
      text: '"Llevar nuestro café de Dipilto a los mercados de San Salvador y Managua parecía imposible sin un gran presupuesto. El equipo rediseñó nuestro empaque, nos creó un contenido audiovisual de primer mundo y ahora tenemos compradores recurrentes."',
      author: 'Ing. Elena Morales',
      role: 'Gerente General • Café Cordillera de Altura',
      avatar: 'EM'
    },
    {
      text: '"Tienen la calidez de nuestra tierra pero la agilidad y las métricas de una agencia de clase mundial. Cada córdoba invertido con Guardabarranco Studio nos ha retornado con creces en ventas de repuestos y maquinaria agrícola."',
      author: 'Don Edwin Bermúdez',
      role: 'Propietario • Agroservicios del Occidente, El Viejo',
      avatar: 'EB'
    }
  ];

  let currentTestimonialIndex = 0;
  const testimonialText = document.getElementById('testimonialText');
  const testimonialAuthor = document.getElementById('testimonialAuthor');
  const testimonialRole = document.getElementById('testimonialRole');
  const testimonialAvatar = document.getElementById('testimonialAvatar');
  const dotBtns = document.querySelectorAll('.slider-dots .dot-btn');

  function showTestimonial(index) {
    if (!testimonialText) return;
    currentTestimonialIndex = index;
    const t = testimonials[index];

    testimonialText.style.opacity = '0';
    setTimeout(() => {
      testimonialText.textContent = t.text;
      testimonialAuthor.textContent = t.author;
      testimonialRole.textContent = t.role;
      testimonialAvatar.textContent = t.avatar;
      testimonialText.style.opacity = '1';
    }, 200);

    dotBtns.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
  }

  dotBtns.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      showTestimonial(idx);
    });
  });

  // Auto-play testimonials every 7 seconds
  setInterval(() => {
    let nextIndex = (currentTestimonialIndex + 1) % testimonials.length;
    showTestimonial(nextIndex);
  }, 7000);

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

  // 9. Contact Form Validation and WhatsApp dispatch
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('contactNombre').value.trim();
      const tel = document.getElementById('contactTel').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const interesSelect = document.getElementById('contactInteres');
      const interesText = interesSelect.options[interesSelect.selectedIndex].text;
      const mensaje = document.getElementById('contactMensaje').value.trim();

      if (!nombre || !tel) {
        alert('Por favor completa al menos tu nombre y número de teléfono/WhatsApp.');
        return;
      }

      // Show success alert
      if (formFeedback) {
        formFeedback.classList.add('success');
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Auto redirect or prompt WhatsApp send
      const whatsappMsg = `*NUEVO CONTACTO WEB - GUARDABARRANCO STUDIO*\n\n` +
        `👤 *Nombre:* ${nombre}\n` +
        `📱 *Teléfono:* ${tel}\n` +
        `📧 *Correo:* ${email || 'No proporcionado'}\n` +
        `🎯 *Servicio de Interés:* ${interesText}\n` +
        `📝 *Mensaje:* ${mensaje || 'Deseo coordinar una sesión de diagnóstico'}`;

      setTimeout(() => {
        const openWsp = confirm('¿Deseas enviar este mensaje inmediatamente a un director creativo por WhatsApp?');
        if (openWsp) {
          window.open(`https://wa.me/50585574484?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
        }
        contactForm.reset();
      }, 800);
    });
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
              <button type="button" class="btn btn-secondary" id="btnCerrarModalInterno">
                <i class="bi bi-x-lg me-1"></i> Cerrar
              </button>
            </div>
          `;

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

  // Dossier PDF Download Action
  if (btnDescargarPdfCatalogo) {
    btnDescargarPdfCatalogo.addEventListener('click', () => {
      const confirmPrint = confirm(
        'Dossier Corporativo 2026 - Guardabarranco Studio:\n\n' +
        '¿Deseas abrir la vista de impresión/guardado en PDF ahora?\n' +
        '(También puedes solicitar que te enviemos el PDF interactivo directamente a tu WhatsApp).'
      );

      if (confirmPrint) {
        window.print();
      } else {
        const wspDossier = 'https://wa.me/50585574484?text=' +
          encodeURIComponent('Hola Guardabarranco Studio, deseo recibir el Dossier Corporativo 2026 en PDF interactivo.');
        window.open(wspDossier, '_blank');
      }
    });
  }
});
