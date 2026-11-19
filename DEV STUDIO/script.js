/**
 * DEV STUDIO - JAVASCRIPT PRINCIPAL
 * Terminal Interactivo, Calculadora de Arquitectura, Filtros y Telemetría
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    if (!navMenu.querySelector('.nav-mobile-cta-item')) {
      const estHref = document.getElementById('estimador') ? '#estimador' : 'index.html#estimador';
      const mobileCtaLi = document.createElement('li');
      mobileCtaLi.className = 'nav-mobile-cta-item';
      mobileCtaLi.innerHTML = `<a href="${estHref}" class="btn btn-silver"><i class="bi bi-calculator me-2"></i> Cotizar Proyecto</a>`;
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

  // 2. Navbar Scroll Behavior & Active Section Detection
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

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

  // 3. Terminal Emulator Interactivo
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalInput = document.getElementById('terminalInput');

  if (terminalInput && terminalOutput) {
    const commands = {
      help: () => `
        <div class="terminal-line t-silver">Available Dev Studio CLI Commands:</div>
        <div class="terminal-line"><span class="t-cmd">types</span>        - Explore the 8 enterprise software types we build</div>
        <div class="terminal-line"><span class="t-cmd">industries</span>   - Inspect our 8 industry verticals & sector solutions</div>
        <div class="terminal-line"><span class="t-cmd">roi</span>          - Jump to the interactive operational savings & ROI simulator</div>
        <div class="terminal-line"><span class="t-cmd">catalog</span>      - Explore our production-ready software blueprints</div>
        <div class="terminal-line"><span class="t-cmd">stack</span>        - Inspect our enterprise technology matrix</div>
        <div class="terminal-line"><span class="t-cmd">status</span>       - Disponibilidad del equipo y tiempos de respuesta</div>
        <div class="terminal-line"><span class="t-cmd">security</span>     - Prácticas de seguridad que aplicamos</div>
        <div class="terminal-line"><span class="t-cmd">cases</span>        - Ver el caso real: AgroStats</div>
        <div class="terminal-line"><span class="t-cmd">quote</span>        - Jump to the interactive sprint & architecture estimator</div>
        <div class="terminal-line"><span class="t-cmd">clear</span>        - Clear terminal output screen</div>
      `,
      types: () => `
        <div class="terminal-line t-info">[SOFTWARE TAXONOMY] 8 Core Families We Engineer:</div>
        <div class="terminal-line">01. ERP & Core Financiero-Contable (DGI Nicaragua)</div>
        <div class="terminal-line">02. CRM Comercial, Preventa en Ruta (SFA) & Cobranza</div>
        <div class="terminal-line">03. Apps Móviles Offline-First (Campo, Agro & Obras)</div>
        <div class="terminal-line">04. WMS Bodegas Multi-Sucursal & Control de Flotas</div>
        <div class="terminal-line">05. Plataformas SaaS Multi-Tenant & Portales B2B</div>
        <div class="terminal-line">06. Sistemas Clínicos (HIS), Laboratorios & Veterinarias</div>
        <div class="terminal-line">07. POS Punto de Venta & E-Commerce Headless Omnicanal</div>
        <div class="terminal-line">08. Business Intelligence (BI), IoT & Copilotos IA (RAG)</div>
        <div class="terminal-line t-silver">Explora más en <a href="soluciones-software.html" style="color:#38BDF8;text-decoration:underline;">soluciones-software.html</a></div>
      `,
      industries: () => `
        <div class="terminal-line t-success">[INDUSTRY VERTICALS] 8 Sectors We Transform:</div>
        <div class="terminal-line">&bull; Agroindustria, Ingenios, Beneficios & Fincas</div>
        <div class="terminal-line">&bull; Construcción, Ingeniería Civil & Bienes Raíces</div>
        <div class="terminal-line">&bull; Distribución Mayorista, Ferreterías & Consumo Masivo</div>
        <div class="terminal-line">&bull; Talleres Automotrices, Flotas Pesadas & Repuestos</div>
        <div class="terminal-line">&bull; Salud, Clínicas Médicas, Laboratorios & Veterinarias</div>
        <div class="terminal-line">&bull; Logística, Transporte de Carga & Aduanas CA-4</div>
        <div class="terminal-line">&bull; Manufactura, Plantas Industriales & Zonas Francas</div>
        <div class="terminal-line">&bull; Microfinancieras, Cooperativas & Retail Omnicanal</div>
        <div class="terminal-line t-silver">Explora más en <a href="industrias.html" style="color:#38BDF8;text-decoration:underline;">industrias.html</a></div>
      `,
      roi: () => {
        const roiEl = document.getElementById('como-ayuda');
        if (roiEl) roiEl.scrollIntoView({ behavior: 'smooth' });
        return `<div class="terminal-line t-success">[NAVIGATION] Abriendo Simulador de Impacto Operativo & ROI...</div>`;
      },
      catalog: () => `
        <div class="terminal-line t-silver">[BLUEPRINTS CATALOG] Production-Ready Architectures:</div>
        <div class="terminal-line">&bull; <span class="t-cmd">ERP Cloud Core</span>: Nicaragua DGI Compliant ($1,850 USD)</div>
        <div class="terminal-line">&bull; <span class="t-cmd">SaaS Multi-Tenant</span>: High Concurrency ($3,200 USD)</div>
        <div class="terminal-line">&bull; <span class="t-cmd">App Móvil Offline</span>: Flutter / iOS & Android ($2,450 USD)</div>
        <div class="terminal-line">&bull; <span class="t-cmd">API Gateway</span>: Sub-15ms Go/Rust Microservices ($2,100 USD)</div>
        <div class="terminal-line">&bull; <span class="t-cmd">E-Commerce Headless</span>: Next.js + BAC / Banpro ($980 USD)</div>
        <div class="terminal-line">&bull; <span class="t-cmd">IoT Telemetría</span>: Industrial Timescale & MQTT ($2,800 USD)</div>
        <div class="terminal-line t-info">Tip: Explora la sección interactiva en <a href="#catalogo" style="color:#38BDF8; text-decoration:underline;">#catalogo</a>.</div>
      `,
      security: () => `
        <div class="terminal-line t-success">[SECURITY] Prácticas que aplicamos:</div>
        <div class="terminal-line">&bull; Certificaciones (SOC 2 / ISO 27001): aún no; diseñamos para facilitarlas</div>
        <div class="terminal-line">&bull; OWASP Top 10: lista de revisión en cada entrega</div>
        <div class="terminal-line">&bull; Cifrado en tránsito: HTTPS / TLS en las APIs</div>
        <div class="terminal-line">&bull; Accesos por roles con tokens firmados (JWT)</div>
        <div class="terminal-line">&bull; IP Ownership: 100% Transfer of Copyright and Source Code to Client</div>
      `,
      blueprints: () => `
        <div class="terminal-line t-info">[BLUEPRINTS] Available System Topologies:</div>
        <div class="terminal-line">&bull; SYS-ARCH-01: ERP Cloud Core & DGI XML Invoicing</div>
        <div class="terminal-line">&bull; SYS-ARCH-02: SaaS Multi-Tenant Platform on Kubernetes</div>
        <div class="terminal-line">&bull; SYS-ARCH-03: Field Logistics Offline-First Mobile App</div>
        <div class="terminal-line">&bull; SYS-ARCH-04: High-Throughput API Gateway (18.4k req/s)</div>
        <div class="terminal-line">&bull; SYS-ARCH-05: Headless E-Commerce & Transactional Portal</div>
        <div class="terminal-line">&bull; SYS-ARCH-06: Industrial Telemetry & SCADA IoT</div>
        <div class="terminal-line t-cyan">> Type 'catalog' to inspect or scroll to #catalogo</div>
      `,
      stack: () => `
        <div class="terminal-line t-info">[STACK] Primary Production Technology Matrix:</div>
        <div class="terminal-line">&bull; Backend: .NET 9 (C#), Node.js (NestJS), Go, Python FastAPI</div>
        <div class="terminal-line">&bull; Frontend: Next.js, React 19, TypeScript, Clean CSS</div>
        <div class="terminal-line">&bull; Mobile: Flutter (Dart), Swift (iOS Native), Kotlin</div>
        <div class="terminal-line">&bull; Cloud & DevOps: AWS, Azure, GCP, Docker, Kubernetes, Terraform</div>
        <div class="terminal-line">&bull; Storage & Cache: PostgreSQL, SQL Server, Redis, MongoDB</div>
        <div class="terminal-line">&bull; AI Integration: Gemini / OpenAI API, LangChain, Vector Embeddings</div>
      `,
      status: () => `
        <div class="terminal-line t-success">[STUDIO STATUS] Disponibilidad del equipo:</div>
        <div class="terminal-line">&bull; Recibiendo proyectos nuevos: sí</div>
        <div class="terminal-line">&bull; Respuesta a consultas: menos de 24 horas hábiles</div>
        <div class="terminal-line">&bull; Metodología: sprints de 2 semanas con demo funcional</div>
        <div class="terminal-line">&bull; Confidencialidad: NDA antes de revisar tus requerimientos</div>
        <div class="terminal-line">&bull; Propiedad del código: 100% del cliente</div>
      `,
      services: () => `
        <div class="terminal-line t-silver">[CAPABILITIES] Software Solutions:</div>
        <div class="terminal-line">1. Bespoke Enterprise Core & SaaS Platforms</div>
        <div class="terminal-line">2. High-Performance iOS / Android & Web Applications</div>
        <div class="terminal-line">3. Distributed Microservices & Low-Latency APIs</div>
        <div class="terminal-line">4. Zero-Downtime Legacy Modernization</div>
        <div class="terminal-line">5. Rigorous Security Auditing & QA Automation</div>
        <div class="terminal-line">6. Dedicated Agile Squads (Staff Augmentation)</div>
      `,
      cases: () => `
        <div class="terminal-line t-info">[CASO REAL] AgroStats:</div>
        <div class="terminal-line">&bull; App móvil Flutter que captura datos de campo sin internet</div>
        <div class="terminal-line">&bull; API .NET 9 que sincroniza con SQL Server y PostgreSQL</div>
        <div class="terminal-line">&bull; Panel web ASP.NET Core MVC con reportes, usuarios y roles</div>
        <div class="terminal-line t-info">Detalles en <a href="#casos" style="color:#38BDF8; text-decoration:underline;">#casos</a>.</div>
      `,
      quote: () => {
        const estimatorSection = document.getElementById('estimador');
        if (estimatorSection) {
          estimatorSection.scrollIntoView({ behavior: 'smooth' });
        }
        return `<div class="terminal-line t-success">[REDIRECT] Desplazando hacia la Calculadora de Arquitectura & Sprints...</div>`;
      },
      contact: () => `
        <div class="terminal-line t-silver">[COMMUNICATION PROTOCOL] Direct Connection:</div>
        <div class="terminal-line">&bull; WhatsApp: +505 8557 4484</div>
        <div class="terminal-line">&bull; Ubicación: Nicaragua / Centroamérica</div>
      `,
      hub: () => `
        <div class="terminal-line t-info">[ECOSISTEMA DIGITAL] Red de Negocios y Plataformas:</div>
        <div class="terminal-line">&bull; <a href="../index.html" style="color:#38BDF8; text-decoration:underline;">Portal Hub Maestro</a> (Directorio y Búsqueda Global)</div>
        <div class="terminal-line">&bull; <a href="../GUARDABARRANCO%20STUDIO/index.html" style="color:#38BDF8; text-decoration:underline;">Guardabarranco Studio</a> (Marketing 360°, Dron 4K & Branding)</div>
        <div class="terminal-line">&bull; <a href="../CONSTRUCTORA%20RS/index.html" style="color:#38BDF8; text-decoration:underline;">Construcciones R&amp;S</a> (Obras Civiles, Estructuras & Techos)</div>
        <div class="terminal-line">&bull; <a href="../TALLER%20DON%20CHUNGO/index.html" style="color:#38BDF8; text-decoration:underline;">Taller Don Chungo</a> (Mecánica de Motos Especializada)</div>
        <div class="terminal-line">&bull; <a href="../VETERINARIA%20LA%20VIRGEN/index.html" style="color:#38BDF8; text-decoration:underline;">Veterinaria La Virgen</a> (Salud Animal & Ganadería)</div>
      `
    };

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmdRaw = terminalInput.value.trim().toLowerCase();
        terminalInput.value = '';

        if (!cmdRaw) return;

        // Print input line
        const cmdEcho = document.createElement('div');
        cmdEcho.className = 'terminal-line';
        cmdEcho.innerHTML = `<span class="t-prompt" style="color: #38BDF8;">devstudio&gt;</span> <span class="t-cmd">${cmdRaw}</span>`;
        terminalOutput.appendChild(cmdEcho);

        if (cmdRaw === 'clear') {
          terminalOutput.innerHTML = '';
          return;
        }

        const handler = commands[cmdRaw];
        const resLine = document.createElement('div');
        if (handler) {
          resLine.innerHTML = handler();
        } else {
          resLine.className = 'terminal-line t-silver';
          resLine.innerHTML = `Command not recognized: <span style="color:#FF5F56;">${cmdRaw}</span>. Type <span style="color:#FFF; font-weight:700;">help</span> to inspect valid commands.`;
        }
        terminalOutput.appendChild(resLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    });

    // Terminal Chips click auto-run
    const termChips = document.querySelectorAll('.term-chip');
    termChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd;
        if (cmd) {
          terminalInput.value = cmd;
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          terminalInput.dispatchEvent(enterEvent);
        }
      });
    });
  }

  // 4. Tech Stack Filter Tabs
  const stackTabBtns = document.querySelectorAll('.stack-tab-btn');
  const stackCards = document.querySelectorAll('.stack-item-card');

  stackTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stackTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.stack;

      stackCards.forEach(card => {
        const cat = card.dataset.cat || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
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

  // 5. Calculadora de Arquitectura & Sprints (Scope Estimator)
  const techTypeRadios = document.querySelectorAll('input[name="techType"]');
  const techScaleRadios = document.querySelectorAll('input[name="techScale"]');
  const techModuleCheckboxes = document.querySelectorAll('input[name="techModule"]');

  const specPlatformName = document.getElementById('specPlatformName');
  const specScaleName = document.getElementById('specScaleName');
  const specStack = document.getElementById('specStack');
  const specModulesRow = document.getElementById('specModulesRow');
  const specModulesText = document.getElementById('specModulesText');
  const specPillsContainer = document.getElementById('specPillsContainer');
  const specDurationText = document.getElementById('specDurationText');
  const specInvestmentText = document.getElementById('specInvestmentText');
  const specMilestonesText = document.getElementById('specMilestonesText');
  const btnExportSpecWsp = document.getElementById('btnExportSpecWsp');
  const btnExportSpecEmail = document.getElementById('btnExportSpecEmail');

  const stackPresets = {
    erp: '.NET 9 C# + PostgreSQL 16 + React',
    web: 'Next.js 15 + TypeScript + PostgreSQL',
    mobile: 'Flutter + SQLite Local + .NET 9 API',
    rutas: 'Flutter + GPS/Bluetooth + .NET 9 API',
    pos: 'Next.js Edge + .NET 9 + Redis Cache',
    clinica: 'React + .NET 9 + PostgreSQL + Bot WhatsApp',
    api: '.NET 9 / Go + RabbitMQ + Docker K8s',
    suite: '.NET 9 + Next.js + Flutter + BI / IA'
  };

  const pillsPresets = {
    erp: ['Kardex Multi-Bodega', 'Retenciones IR/IVA DGI', 'Contabilidad NIO/USD', 'Cuentas por Cobrar/Pagar'],
    mobile: ['Base Local SQLite', 'Delta Sync sin Señal', 'Captura en Finca/Obra', 'GPS & Fotos Offline'],
    rutas: ['App Preventa GPS', 'Impresión Bluetooth ESC/POS', 'Límite de Crédito CxC', 'Liquidación de Rutas'],
    pos: ['POS Rápido Mostrador', 'Arqueo de Caja Ciego', 'Catálogo E-Commerce', 'Pasarela BAC / WhatsApp'],
    clinica: ['Expediente Digital HIS/Vet', 'Recordatorios WhatsApp', 'Control Caducidad FEFO', 'Órdenes de Trabajo'],
    suite: ['ERP + Apps Móviles', 'Dashboards Gerenciales BI', 'Copiloto IA Privado', 'Telemetría & APIs']
  };

  function calculateArchitecture() {
    let baseWeeks = 4;
    let basePrice = 1850;
    let platformName = 'ERP Cloud Core & Facturación DGI';
    let platformKey = 'erp';

    techTypeRadios.forEach(radio => {
      if (radio.checked) {
        baseWeeks = parseInt(radio.dataset.weeks, 10);
        basePrice = parseFloat(radio.dataset.price);
        platformName = radio.dataset.name;
        platformKey = radio.value;
      }
    });

    let scaleMultiplier = 1.0;
    let scaleName = '1 Sede / PyME (1-10 usuarios)';
    techScaleRadios.forEach(radio => {
      if (radio.checked) {
        scaleMultiplier = parseFloat(radio.dataset.multiplier);
        scaleName = radio.dataset.name;
      }
    });

    let extraWeeks = 0;
    let extraPrice = 0;
    let modulesList = [];
    techModuleCheckboxes.forEach(cb => {
      if (cb.checked) {
        extraWeeks += parseInt(cb.dataset.weeks, 10);
        extraPrice += parseFloat(cb.dataset.price);
        modulesList.push(cb.dataset.name);
      }
    });

    const totalWeeksMin = Math.round((baseWeeks * scaleMultiplier) + extraWeeks);
    const totalWeeksMax = Math.round(totalWeeksMin * 1.25);
    const totalSprints = Math.ceil(totalWeeksMax / 2);

    const priceMin = Math.round(((basePrice * scaleMultiplier) + extraPrice) / 50) * 50;
    const priceMax = Math.round((priceMin * 1.2) / 50) * 50;

    // Update UI elements
    if (specPlatformName) specPlatformName.textContent = platformName;
    if (specScaleName) specScaleName.textContent = scaleName;
    if (specStack) specStack.textContent = stackPresets[platformKey] || '.NET 9 + TypeScript';

    if (specPillsContainer && pillsPresets[platformKey]) {
      specPillsContainer.innerHTML = pillsPresets[platformKey]
        .map(p => `<span class="sw-module-pill">${p}</span>`)
        .join('');
    }

    if (specModulesRow && specModulesText) {
      if (modulesList.length > 0) {
        specModulesRow.style.display = 'flex';
        specModulesText.textContent = modulesList.join(', ');
      } else {
        specModulesRow.style.display = 'none';
      }
    }

    if (specDurationText) {
      specDurationText.textContent = `${totalWeeksMin} - ${totalWeeksMax} Semanas (~${totalSprints} Sprints)`;
    }

    const nioMin = Math.round(priceMin * 36.62);
    const nioMax = Math.round(priceMax * 36.62);
    const milestone40Usd = Math.round(priceMin * 0.4);
    const milestone40Nio = Math.round(milestone40Usd * 36.62);
    const activeCurr = localStorage.getItem('devStudioCurrency') || 'USD';

    if (specInvestmentText) {
      if (activeCurr === 'NIO') {
        specInvestmentText.textContent = `C$ ${nioMin.toLocaleString()} - C$ ${nioMax.toLocaleString()} NIO (~$${priceMin.toLocaleString()} - $${priceMax.toLocaleString()} USD)`;
      } else {
        specInvestmentText.textContent = `$${priceMin.toLocaleString()} - $${priceMax.toLocaleString()} USD (~C$ ${nioMin.toLocaleString()} - C$ ${nioMax.toLocaleString()} NIO)`;
      }
    }

    if (specMilestonesText) {
      if (activeCurr === 'NIO') {
        specMilestonesText.textContent = `Pago por hitos 40 / 30 / 30: Inicias Fase 1 con C$ ${milestone40Nio.toLocaleString()} NIO (~$${milestone40Usd.toLocaleString()} USD), 30% en demo de avance y 30% al entregar código.`;
      } else {
        specMilestonesText.textContent = `Pago por hitos 40 / 30 / 30: Inicias Fase 1 con $${milestone40Usd.toLocaleString()} USD (~C$ ${milestone40Nio.toLocaleString()} NIO), 30% en demo de avance y 30% al entregar código.`;
      }
    }

    const mobileCalcValEl = document.getElementById('devMobileCalcValue');
    if (mobileCalcValEl) {
      mobileCalcValEl.textContent = activeCurr === 'NIO'
        ? `Desde C$ ${nioMin.toLocaleString()} NIO`
        : `Desde $${priceMin.toLocaleString()} USD`;
    }

    // Dynamic WhatsApp & Email Actions
    const specPayload = `*SOLICITUD DE PROPUESTA TÉCNICA - DEV STUDIO*\n\n` +
      `💻 *Solución:* ${platformName}\n` +
      `📈 *Escala:* ${scaleName}\n` +
      `⚙️ *Stack Base:* ${stackPresets[platformKey] || '.NET 9 + PostgreSQL'}\n` +
      (modulesList.length > 0 ? `🧩 *Módulos Adicionales:* ${modulesList.join(', ')}\n` : '') +
      `⏱ *Tiempo Estimado:* ${totalWeeksMin}-${totalWeeksMax} semanas (${totalSprints} sprints)\n` +
      `💼 *Inversión Orientativa:* $${priceMin.toLocaleString()} - $${priceMax.toLocaleString()} USD (~C$ ${nioMin.toLocaleString()} - C$ ${nioMax.toLocaleString()} NIO)\n` +
      `💳 *Esquema 40/30/30:* Arranque Fase 1 desde $${milestone40Usd.toLocaleString()} USD\n\n` +
      `Deseo agendar una sesión de diagnóstico con un Arquitecto de Software.`;

    if (btnExportSpecWsp) {
      btnExportSpecWsp.onclick = () => {
        window.open(`https://wa.me/50585574484?text=${encodeURIComponent(specPayload)}`, '_blank', 'noopener');
      };
    }

    if (btnExportSpecEmail) {
      const emailSubject = `Propuesta Técnica Dev Studio — ${platformName} (${scaleName})`;
      const emailBody = specPayload.replace(/\*/g, '');
      btnExportSpecEmail.href = `mailto:contacto@guardabarrancostudio.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    }
  }

  // Bind change events
  [...techTypeRadios, ...techScaleRadios, ...techModuleCheckboxes].forEach(el => {
    el.addEventListener('change', calculateArchitecture);
  });

  // Calculate initial load
  calculateArchitecture();

  // 6. FAQ Accordion
  const faqEntries = document.querySelectorAll('.faq-entry');
  faqEntries.forEach(entry => {
    const trigger = entry.querySelector('.faq-trigger');
    const body = entry.querySelector('.faq-body');

    if (trigger && body) {
      trigger.addEventListener('click', () => {
        const isActive = entry.classList.contains('active');

        faqEntries.forEach(other => {
          other.classList.remove('active');
          const otherBody = other.querySelector('.faq-body');
          if (otherBody) otherBody.style.maxHeight = null;
        });

        if (!isActive) {
          entry.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 'px';
        } else {
          entry.classList.remove('active');
          body.style.maxHeight = null;
        }
      });
    }
  });

  // 7. Formulario de solicitud: validación en línea y envío directo a WhatsApp
  const rfpForm = document.getElementById('rfpForm');
  const rfpFeedback = document.getElementById('rfpFeedback');
  const rfpError = document.getElementById('rfpError');
  const rfpWspFallback = document.getElementById('rfpWspFallback');

  if (rfpForm) {
    const showRfpError = (msg, field) => {
      if (rfpFeedback) rfpFeedback.classList.remove('show');
      if (rfpError) {
        rfpError.textContent = msg;
        rfpError.hidden = false;
      }
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    };

    rfpForm.addEventListener('input', (e) => {
      if (e.target && e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
      if (rfpError) rfpError.hidden = true;
    });

    rfpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombreInput = document.getElementById('rfpNombre');
      const emailInput = document.getElementById('rfpEmail');
      const telInput = document.getElementById('rfpTel');
      const tipoSelect = document.getElementById('rfpTipo');
      const nombre = nombreInput.value.trim();
      const email = emailInput.value.trim();
      const tel = telInput.value.trim();
      const tipoText = tipoSelect.options[tipoSelect.selectedIndex].text;
      const descripcion = document.getElementById('rfpDescripcion').value.trim();

      if (!nombre) {
        showRfpError('Escribe tu nombre o el de tu empresa.', nombreInput);
        return;
      }
      if (tel.replace(/\D/g, '').length < 8) {
        showRfpError('Escribe un teléfono o WhatsApp válido (mínimo 8 dígitos).', telInput);
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showRfpError('Revisa tu correo: parece incompleto.', emailInput);
        return;
      }

      const rfpMessage = [
        '*Nueva solicitud web - Dev Studio*',
        '',
        `*Contacto:* ${nombre}`,
        `*Correo:* ${email || 'No proporcionado'}`,
        `*Teléfono:* ${tel}`,
        `*Tipo de sistema:* ${tipoText}`,
        `*Requerimiento:* ${descripcion || 'Evaluación inicial de mi proyecto'}`
      ].join('\n');
      const wspUrl = `https://wa.me/50585574484?text=${encodeURIComponent(rfpMessage)}`;
      const rfpEmailFallback = document.getElementById('rfpEmailFallback');
      const emailSubject = `Diagnóstico NDA Dev Studio — ${nombre} (${tipoText})`;
      const emailBody = rfpMessage.replace(/\*/g, '');

      if (rfpError) rfpError.hidden = true;
      if (rfpWspFallback) rfpWspFallback.href = wspUrl;
      if (rfpEmailFallback) {
        rfpEmailFallback.href = `mailto:contacto@guardabarrancostudio.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      }
      if (rfpFeedback) {
        rfpFeedback.classList.add('show');
        rfpFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Se abre WhatsApp de inmediato (sin borrar los datos capturados del usuario)
      window.open(wspUrl, '_blank', 'noopener');
    });
  }

  // 8. Interactive Architecture Topology Inspector
  const archNodes = document.querySelectorAll('.arch-node-card');
  const telemetryNodeTitle = document.getElementById('telemetryNodeTitle');
  const telemetryNodeDesc = document.getElementById('telemetryNodeDesc');
  const telemetryProto = document.getElementById('telemetryProto');
  const telemetryLatency = document.getElementById('telemetryLatency');
  const telemetryFailover = document.getElementById('telemetryFailover');
  const telemetryCrypto = document.getElementById('telemetryCrypto');
  const telemetryBadge = document.getElementById('telemetryBadge');

  const nodeSpecs = {
    'clients': {
      title: 'Web & Mobile Apps (Next.js & Flutter)',
      desc: 'Capa de presentación moderna con Next.js 15 y Flutter compilado en código nativo (ARM64). Renderizado por servidor y consumo de APIs bajo GraphQL y gRPC.',
      proto: 'HTTPS / HTTP3 / gRPC',
      latency: '~14ms P99',
      failover: 'DNS Georredundante Anycast',
      crypto: 'TLS 1.3 Strict',
      badge: 'LAYER 01 &bull; CLIENTS'
    },
    'external-api': {
      title: 'Integraciones B2B & Webhooks',
      desc: 'Conectores dedicados para pasarelas de pago (Stripe, BAC), proveedores de ERP (SAP, Dynamics) y sistemas de terceros con validación de firmas criptográficas HMAC.',
      proto: 'REST / Webhooks HMAC',
      latency: '~35ms P95',
      failover: 'Dead-Letter Queue (DLQ)',
      crypto: 'TLS 1.3 / Mutual TLS (mTLS)',
      badge: 'LAYER 01 &bull; EXTERNAL'
    },
    'gateway': {
      title: 'Cloudflare WAF & Envoy API Gateway',
      desc: 'Escudo perimetral contra ataques DDoS de Capa 7, balanceo de carga elástico, limitación de tasa (rate limiting) y terminación SSL ultrarrápida.',
      proto: 'HTTP/2, HTTP/3, TCP',
      latency: '2.1ms Edge Processing',
      failover: 'Multi-Region Automatic Failover',
      crypto: 'Zero-Knowledge SSL Termination',
      badge: 'LAYER 02 &bull; GATEWAY'
    },
    'dotnet-core': {
      title: '.NET 9 Core Engine (Microservices)',
      desc: 'Núcleo de negocio empresarial implementado con Clean Architecture, CQRS (MediatR) y tipado estricto. Procesamiento transaccional de alto rendimiento.',
      proto: 'Internal gRPC / Binary Protobuf',
      latency: '3.8ms Execution Time',
      failover: 'Kubernetes Pod Replica Auto-Healing',
      crypto: 'In-Transit Service-to-Service mTLS',
      badge: 'LAYER 03 &bull; CORE ENGINE'
    },
    'go-service': {
      title: 'Go (Golang) High-Concurrency Worker',
      desc: 'Microservicios ultraligeros en Go para streaming de datos, telemetría IoT y procesamiento asíncrono con huella de memoria inferior a 25MB por pod.',
      proto: 'gRPC / WebSocket / MQTT',
      latency: '1.2ms Goroutine Loop',
      failover: 'K8s Cluster Horizontal AutoScaler (HPA)',
      crypto: 'Internal Private VPC Peering',
      badge: 'LAYER 03 &bull; WORKERS'
    },
    'redis': {
      title: 'Redis Cluster In-Memory',
      desc: 'Caché distribuida de ultra baja latencia para almacenamiento de sesiones de usuario, contadores en tiempo real y bloqueo distribuido (Redlock).',
      proto: 'RESP (Redis Serialization Protocol)',
      latency: '0.4ms Sub-millisecond',
      failover: 'Redis Sentinel Auto-Failover',
      crypto: 'AUTH + TLS 1.3 Encryption',
      badge: 'LAYER 04 &bull; IN-MEMORY'
    },
    'postgres': {
      title: 'PostgreSQL Enterprise Sharded Cluster',
      desc: 'Base de datos relacional de misión crítica con replicación síncrona Multi-AZ, aislamiento ACID estricto, backups incrementales en frío y pooling con PgBouncer.',
      proto: 'PostgreSQL Wire Protocol',
      latency: '4.5ms Query Avg',
      failover: 'Patroni / Multi-AZ Hot Standby',
      crypto: 'AES-256 Storage & SSL Transit',
      badge: 'LAYER 04 &bull; RELATIONAL DB'
    },
    'kafka': {
      title: 'Apache Kafka Event Stream Broker',
      desc: 'Bus de eventos inmutable para desacoplar transacciones, notificaciones push, auditoría forense y reconciliación financiera eventual sin pérdida de datos.',
      proto: 'Kafka Binary Protocol',
      latency: '2.5ms Append Latency',
      failover: 'Multi-Broker Quorum (KRaft)',
      crypto: 'SASL / SCRAM-SHA-512 + TLS',
      badge: 'LAYER 04 &bull; EVENT BROKER'
    }
  };

  archNodes.forEach(node => {
    node.addEventListener('click', () => {
      archNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const nodeKey = node.dataset.node;
      const spec = nodeSpecs[nodeKey];
      if (spec) {
        if (telemetryNodeTitle) telemetryNodeTitle.textContent = spec.title;
        if (telemetryNodeDesc) telemetryNodeDesc.textContent = spec.desc;
        if (telemetryProto) telemetryProto.textContent = spec.proto;
        if (telemetryLatency) telemetryLatency.textContent = spec.latency;
        if (telemetryFailover) telemetryFailover.textContent = spec.failover;
        if (telemetryCrypto) telemetryCrypto.textContent = spec.crypto;
        if (telemetryBadge) telemetryBadge.innerHTML = spec.badge;
      }
    });
  });

  // 9. Interactive Code Architecture Showcase Switcher & Copy
  const codeTabBtns = document.querySelectorAll('.code-tab-btn');
  const codePreBlock = document.getElementById('codePreBlock');
  const btnCopyCode = document.getElementById('btnCopyCode');
  const copyBtnText = document.getElementById('copyBtnText');

  const codeSnippets = {
    csharp: `// .NET 9 Clean Architecture Domain Entity with CQRS
namespace DevStudio.Core.Domain.Orders;

public sealed class OrderAggregate : AggregateRoot<OrderId>
{
    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public Money TotalAmount => _items.Aggregate(Money.Zero, (acc, item) => acc + item.Subtotal);

    public Result<OrderConfirmation> ConfirmPayment(TransactionToken token, IPaymentGateway gateway)
    {
        if (Status != OrderStatus.Pending)
            return Result.Failure<OrderConfirmation>(OrderErrors.InvalidTransition);

        var capture = gateway.Capture(token, TotalAmount);
        if (!capture.IsSuccess)
            return Result.Failure<OrderConfirmation>(capture.Error);

        Status = OrderStatus.Paid;
        RaiseDomainEvent(new OrderPaidDomainEvent(Id, DateTime.UtcNow));
        return Result.Success(new OrderConfirmation(Id, capture.AuthCode));
    }
}`,
    typescript: `// Next.js 15 & TypeScript Enterprise Route Handler with Zod Validation
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { OrderService } from '@/services/order.service';

const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({ sku: z.string(), quantity: z.number().int().positive() })),
  idempotencyKey: z.string().min(16),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, { status: 422 });
  }

  const result = await OrderService.dispatch(parsed.data);
  return NextResponse.json({ status: 'PROCESSING', orderId: result.id }, { status: 202 });
}`,
    terraform: `# Terraform Georedundant Kubernetes Cluster Specification
resource "aws_eks_cluster" "devstudio_primary" {
  name     = "devstudio-enterprise-us-east-1"
  role_arn = aws_iam_role.cluster_role.arn
  version  = "1.31"

  vpc_config {
    subnet_ids              = module.vpc.private_subnets
    endpoint_private_access = true
    endpoint_public_access  = false
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks_secrets.arn
    }
    resources = ["secrets"]
  }

  tags = {
    Environment = "production"
    ManagedBy   = "DevStudio-Terraform"
    SLA         = "99.99"
  }
}`,
    flutter: `// Flutter Offline-First Delta Sync Engine (SQLite WAL + Conflict Resolution)
class OfflineDeltaSyncEngine {
  final LocalSqliteStore _localDb;
  final CloudRestClient _apiClient;

  OfflineDeltaSyncEngine(this._localDb, this._apiClient);

  Future<SyncResult> synchronizeOutbox({required String deviceId}) async {
    final pendingMutations = await _localDb.fetchPendingOutboxBatch(limit: 250);
    if (pendingMutations.isEmpty) return const SyncResult.upToDate();

    final payload = DeltaSyncBatch(
      deviceId: deviceId,
      lastVectorClock: await _localDb.getLastSyncedClock(),
      mutations: pendingMutations,
    );

    final response = await _apiClient.pushDeltaWithIdempotency(payload);
    await _localDb.applyServerReconciliation(
      ackedIds: response.committedIds,
      serverDelta: response.downstreamChanges,
      vectorClock: response.newVectorClock,
    );

    return SyncResult.synced(committedCount: response.committedIds.length);
  }
}`
  };

  codeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      codeTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabKey = btn.dataset.tab;
      const snippet = codeSnippets[tabKey];
      if (snippet && codePreBlock) {
        codePreBlock.innerHTML = `<code>${escapeHtml(snippet)}</code>`;
      }
    });
  });

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  if (btnCopyCode && copyBtnText) {
    btnCopyCode.addEventListener('click', () => {
      const activeBtn = document.querySelector('.code-tab-btn.active');
      const tabKey = activeBtn ? activeBtn.dataset.tab : 'csharp';
      const textToCopy = codeSnippets[tabKey] || '';

      navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtnText.textContent = '¡Copiado!';
        btnCopyCode.style.background = '#10B981';
        btnCopyCode.style.color = '#FFFFFF';
        setTimeout(() => {
          copyBtnText.textContent = 'Copiar Código';
          btnCopyCode.style.background = '';
          btnCopyCode.style.color = '';
        }, 2000);
      }).catch(() => {
        copyBtnText.textContent = 'Presiona Ctrl+C';
      });
    });
  }

  // ==========================================================================
  // 12. CATÁLOGO DE SOLUCIONES & BLUEPRINTS - FILTROS Y FICHAS TÉCNICAS
  // ==========================================================================
  const devCatalogTabs = document.querySelectorAll('.dev-catalog-tab-btn');
  const devCatalogCards = document.querySelectorAll('.dev-catalog-card');
  const devCatalogModal = document.getElementById('devCatalogModal');
  const devModalBadge = document.getElementById('devModalBadge');
  const devModalTitle = document.getElementById('devModalTitle');
  const devModalContent = document.getElementById('devModalContent');
  const closeDevCatalogModal = document.getElementById('closeDevCatalogModal');
  const btnDescargarDossierDev = document.getElementById('btnDescargarDossierDev');

  // Base de datos de Blueprints Arquitectónicos
  const devCatalogData = {
    'erp-core': {
      badge: 'Core Empresarial Nicaragua',
      badgeClass: 'badge-cyan',
      title: 'ERP Cloud Core & Facturación DGI',
      image: 'assets/blueprints/erp-core.jpg',
      priceUsd: '$1,850 USD base',
      priceNio: 'C$ 67,747 NIO aprox.',
      deploymentTime: '3 a 4 semanas',
      sla: '99.95% de disponibilidad',
      stack: ['.NET 9 C# Web API', 'PostgreSQL 16', 'React 18 / TypeScript', 'Docker', 'Redis Cache'],
      resumen: 'Solución empresarial modular para distribuidoras, comercios, talleres y constructoras de Nicaragua. Incluye cumplimiento fiscal de la DGI (retenciones de IR del 2% y 10%, IVA 15%, pie de imprenta fiscal y reportes contables oficiales).',
      arquitectura: [
        'Clean Architecture en capas (Domain, Application, Infrastructure, Presentation) sin acoplamientos.',
        'Motor de base de datos relacional PostgreSQL con particionamiento de tablas de facturación y kardex.',
        'Autenticación JWT con Refresh Tokens en cookies HttpOnly y control estricto de roles y permisos (RBAC).',
        'Contenedores Docker listos para despliegue en cualquier servidor VPS (DigitalOcean, AWS o local).'
      ],
      entregables: [
        'Código fuente completo sin ofuscar en repositorio privado de GitHub o GitLab de tu empresa.',
        'Módulos incluidos: Facturación fiscal DGI y comprobantes, Compras, Inventario multi-sucursal, Cuentas por Cobrar/Pagar y Bancos.',
        'Módulo de exportación directa a Excel y PDF con formatos tributarios de Nicaragua.',
        'Documentación técnica Swagger / OpenAPI y manual de usuario para el personal administrativo.',
        'Entorno de Staging (pruebas) y Producción configurados con respaldos automatizados diarios.'
      ],
      garantia: '6 meses de garantía técnica ante fallos de software, esquema por hitos 40/30/30 y soporte prioritario en horario laboral.',
      wspText: 'Hola Dev Studio, deseo coordinar una demostración del Blueprint ERP Cloud Core Nicaragua ($1,850 USD).'
    },
    'saas-platform': {
      badge: 'Escalabilidad Global',
      badgeClass: 'badge-green',
      title: 'Plataforma SaaS B2B Multi-Tenant',
      image: 'assets/blueprints/saas-platform.jpg',
      priceUsd: '$3,200 USD base',
      priceNio: 'C$ 117,184 NIO aprox.',
      deploymentTime: '6 a 8 semanas',
      sla: '99.95% de disponibilidad',
      stack: ['.NET 9 C# / NestJS', 'Next.js 15 App Router', 'PostgreSQL (Multi-Tenant)', 'Stripe / PixelPay', 'Cloud Containers'],
      resumen: 'Blueprint cloud-native diseñado para fundadores y empresas que buscan lanzar un producto digital por suscripción mensual o anual. Resuelve desde el día uno el aislamiento de datos entre clientes y la facturación recurrente.',
      arquitectura: [
        'Aislamiento estricto por empresa (Multi-Tenant) para máxima privacidad, rendimiento y facilidad de auditoría.',
        'Next.js 15 con Server Actions y Server-Side Rendering para un rendimiento de carga sub-segundo.',
        'Colas de procesamiento asíncrono con Redis para envío masivo de correos y generación de PDFs.',
        'Despliegue en contenedores administrados con escalado controlado según demanda.'
      ],
      entregables: [
        'Panel de administración global para gestión de suscripciones, límites de uso y métricas MRR/ARR.',
        'Portal para cada cliente (Tenant) con personalización de logo, gestión de sus propios usuarios y perfiles.',
        'Pasarelas de cobro recurrente integradas (Stripe, PayPal y pasarelas centroamericanas).',
        'Sistema de autenticación con soporte OAuth2 (Google, GitHub, Microsoft) y verificación en 2 pasos.',
        'Pipelines de CI/CD automatizados en GitHub Actions para despliegue con cero tiempo de inactividad.'
      ],
      garantia: '6 meses de soporte ante fallos y capacitación técnica de transferencia para el equipo de desarrollo interno.',
      wspText: 'Hola Dev Studio, deseo evaluar el Blueprint Plataforma SaaS Multi-Tenant Cloud-Native ($3,200 USD).'
    },
    'app-mobile': {
      badge: 'iOS + Android Nativo',
      badgeClass: 'badge-cyan',
      title: 'App Móvil Offline-First de Campo',
      image: 'assets/blueprints/app-mobile.jpg',
      priceUsd: '$2,450 USD base',
      priceNio: 'C$ 89,719 NIO aprox.',
      deploymentTime: '4 a 6 semanas',
      sla: 'Funcionalidad offline 100%',
      stack: ['Flutter 3.x / Dart', 'SQLite / Drift ORM', '.NET 9 / Express API', 'Firebase Cloud Messaging', 'OpenStreetMap / Google Maps'],
      resumen: 'Aplicación para teléfonos y tabletas orientada a agentes de venta ruteros, cuadrillas de construcción o inspectores en zonas rurales con conectividad intermitente en Nicaragua y Centroamérica.',
      arquitectura: [
        'Patrón Offline-First con base de datos local SQLite y cola de sincronización delta bidireccional.',
        'Detección automática de conectividad que retiene peticiones en cola y las envía de fondo al reconectar.',
        'Módulo de compresión de imágenes en el dispositivo antes de transmitir a la nube para ahorrar datos móviles.',
        'Módulo de telemetría GPS que registra coordenadas periódicas de visitas y pedidos generados.'
      ],
      entregables: [
        'Código fuente universal en Flutter para compilación simultánea en iOS y Android.',
        'Gestión completa de publicación y certificación en Google Play Console y Apple App Store.',
        'Integración con impresoras térmicas bluetooth para emisión de facturas y recibos físicos en sitio.',
        'Panel web administrativo para monitoreo de rutas, visitas y pedidos de los agentes en tiempo real.',
        'Pruebas exhaustivas en dispositivos de gama media y baja comúnmente utilizados en Nicaragua.'
      ],
      garantia: 'Acompaamiento en el proceso de publicación en las tiendas oficiales y 6 meses de soporte técnico.',
      wspText: 'Hola Dev Studio, deseo cotizar el Blueprint de App Móvil Offline-First de Campo ($2,450 USD).'
    },
    'api-gateway': {
      badge: 'Ultra Concurrencia',
      badgeClass: 'badge-green',
      title: 'Enterprise API Gateway & Microservicios',
      image: 'assets/blueprints/api-gateway.jpg',
      priceUsd: '$2,100 USD base',
      priceNio: 'C$ 76,902 NIO aprox.',
      deploymentTime: '3 a 5 semanas',
      sla: '99.99% & latencia < 15ms',
      stack: ['Golang 1.22 / Rust', 'Redis Cluster', 'Docker / Kubernetes', 'Prometheus & Grafana', 'OpenAPI 3.1'],
      resumen: 'Infraestructura de alta concurrencia diseñada para bancos, cooperativas, pasarelas de pago y consorcios que necesitan conectar sistemas legados con nuevos canales digitales procesando miles de peticiones por segundo sin saturar sus bases de datos.',
      arquitectura: [
        'Compilación nativa en Go o Rust con consumo mínimo de memoria RAM (< 50MB en reposo).',
        'Caché distribuida inteligente con invalidación granular para respuestas sub-10ms.',
        'Rate-limiting por token o dirección IP para mitigación activa de ataques DDoS y scraping.',
        'Circuit Breaker pattern para aislar microservicios lentos y evitar fallos en cascada.'
      ],
      entregables: [
        'Gateway con balanceo de carga, enrutamiento dinámico y transformación de payloads JSON/XML.',
        'Tablero Grafana en tiempo real con monitoreo de CPU, latencias p95/p99, throughput y tasa de errores HTTP.',
        'Documentación Swagger interactiva autogenerada para consumo de desarrolladores externos.',
        'Módulo de logging estructurado JSON con correlación de trazas para depuración inmediata.',
        'Guía de instalación con manifiestos de Kubernetes (K8s) o Docker Compose listos para producción.'
      ],
      garantia: 'Auditoría de estrés con carga simulada de +10,000 req/sec previo a la entrega y garantía de 6 meses.',
      wspText: 'Hola Dev Studio, deseo evaluar el Blueprint Enterprise API Gateway & Microservicios ($2,100 USD).'
    },
    'web-transaccional': {
      badge: 'PageSpeed 99/100',
      badgeClass: 'badge-cyan',
      title: 'E-Commerce Headless & Portal Web Transaccional',
      image: 'assets/blueprints/web-transaccional.jpg',
      priceUsd: '$980 USD base',
      priceNio: 'C$ 35,888 NIO aprox.',
      deploymentTime: '2 a 3 semanas',
      sla: '99.9% de disponibilidad',
      stack: ['Next.js 14 / TypeScript', 'Tailwind & Vanilla CSS', 'BAC Credomatic / PixelPay API', 'Cloudflare Edge CDN', 'PostgreSQL'],
      resumen: 'Plataforma web para empresas que no se conforman con plantillas lentas de WordPress. Carga en 0.6 segundos en redes celulares Claro o Tigo en Nicaragua, integra pasarelas bancarias locales y maximiza la tasa de conversión.',
      arquitectura: [
        'Arquitectura Jamstack / Headless con Server-Side Rendering (SSR) y Static Site Generation (SSG).',
        'Despliegue en red de borde (Edge CDN) distribuida globalmente con caché estática instantánea.',
        'Checkout seguro integrado a bancos de Nicaragua mediante pasarelas de pago certificadas PCI-DSS (la pasarela procesa las tarjetas).',
        'Integración nativa con API de WhatsApp para notificación inmediata al comprador y al encargado de despacho.'
      ],
      entregables: [
        'Sitio web con catálogo interactivo de productos, filtros multicriterio y carrito de compras reactivo.',
        'Panel administrativo sencillo para cargar fotos, editar precios, gestionar inventarios y ver pedidos.',
        'Puntuación superior a 95/100 en Google PageSpeed Insights tanto en móviles como en computadoras.',
        'Optimización técnica para posicionamiento en motores de búsqueda (SEO) y datos estructurados Schema.org.',
        'Alojamiento cloud configurado por 1 año con certificado de seguridad SSL HTTPS grado bancario.'
      ],
      garantia: '6 meses de soporte técnico y mantenimiento de código incluido.',
      wspText: 'Hola Dev Studio, deseo contratar el Blueprint E-Commerce Headless & Portal Web ($980 USD).'
    },
    'iot-industrial': {
      badge: 'Industria & Agro',
      badgeClass: 'badge-green',
      title: 'Telemetría IoT & Control Industrial',
      image: 'assets/blueprints/iot-industrial.jpg',
      priceUsd: '$2,800 USD base',
      priceNio: 'C$ 102,536 NIO aprox.',
      deploymentTime: '4 a 6 semanas',
      sla: '99.9% de ingesta continua',
      stack: ['MQTT Broker (EMQX)', 'TimescaleDB / InfluxDB', 'Golang / Python', 'React & WebSockets', 'Grafana Enterprise'],
      resumen: 'Sistema de supervisión industrial en tiempo real para plantas procesadoras, ingenios, fincas ganaderas y empresas de transporte en el occidente de Nicaragua. Captura y alerta sobre variables operativas críticas.',
      arquitectura: [
        'Protocolo de comunicación MQTT ligero diseñado para operar con enlaces celulares de baja velocidad.',
        'Motor de base de datos de series temporales (TimescaleDB) capaz de comprimir millones de lecturas.',
        'Canal de WebSockets bidireccional para actualizar gráficos en pantalla en tiempo real sin recargar.',
        'Motor de reglas configurables para disparar alertas inmediatas por WhatsApp ante anomalías.'
      ],
      entregables: [
        'Dashboard de telemetría interactivo con mapas satelitales, manómetros virtuales y curvas de tendencia.',
        'Conectores para dispositivos IoT estándar (ESP32, Modbus, PLCs industriales o trackers GPS comerciales).',
        'Módulo de exportación de históricos para análisis de consumo eléctrico, eficiencia hídrica y desgaste.',
        'Servidor local en planta o servidor cloud configurado según requerimientos de aislamiento de la empresa.',
        'Capacitación presencial o virtual para los ingenieros y jefes de planta.'
      ],
      garantia: 'Garantía de integridad de datos y soporte técnico por 6 meses.',
      wspText: 'Hola Dev Studio, deseo agendar una consultoría para el Blueprint Telemetría IoT & Control Industrial ($2,800 USD).'
    }
  };

  // Filtrado de pestañas del Catálogo Dev Studio
  if (devCatalogTabs.length > 0 && devCatalogCards.length > 0) {
    devCatalogTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        devCatalogTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.devCat;

        devCatalogCards.forEach(card => {
          const itemCat = card.dataset.devItem;
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

  // Apertura de Modal Ficha Técnica Arquitectónica
  const devFichaBtns = document.querySelectorAll('.btn-ver-blueprint');
  if (devFichaBtns.length > 0 && devCatalogModal) {
    devFichaBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const fichaKey = btn.dataset.devFicha;
        const data = devCatalogData[fichaKey];

        if (!data) return;

        // Header
        if (devModalBadge) {
          devModalBadge.className = `dev-blueprint-badge ${data.badgeClass || 'badge-cyan'}`;
          devModalBadge.innerHTML = `<i class="bi bi-cpu-fill me-1"></i> ${data.badge}`;
        }
        if (devModalTitle) {
          devModalTitle.textContent = data.title;
        }

        // Body
        if (devModalContent) {
          devModalContent.innerHTML = `
            ${data.image ? `<div class="dev-modal-hero-image"><img src="${data.image}" alt="${data.title}"></div>` : ''}

            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--silver-border);">
              <span style="background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 6px; font-size: 0.82rem; color: var(--silver-light); font-family: 'JetBrains Mono', monospace;">
                <i class="bi bi-clock-history text-cyan me-1"></i> ${data.deploymentTime}
              </span>
              <span style="background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 6px; font-size: 0.82rem; color: var(--silver-light); font-family: 'JetBrains Mono', monospace;">
                <i class="bi bi-shield-check text-green me-1"></i> SLA objetivo: ${data.sla}
              </span>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--silver-border); border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--silver-mid); font-family: 'JetBrains Mono', monospace; display: block;">Inversión Base Estimada</span>
                <span style="font-size: 1.6rem; font-weight: 800; color: #FFFFFF; font-family: 'JetBrains Mono', monospace;">${data.priceUsd}</span>
              </div>
              <div class="text-end">
                <span style="font-size: 0.9rem; color: var(--laser-cyan); font-weight: 600;">${data.priceNio}</span>
                <span style="display: block; font-size: 0.75rem; color: var(--silver-dark);">Propiedad 100% transferida</span>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <i class="bi bi-info-circle text-silver"></i> Descripción del Blueprint
              </h5>
              <p style="font-size: 0.9rem; color: var(--silver-mid); line-height: 1.6; margin: 0;">${data.resumen}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <i class="bi bi-stack text-cyan"></i> Stack Tecnológico Validado
              </h5>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${data.stack.map(st => `<span class="dev-blueprint-tag" style="background: rgba(56, 189, 248, 0.08); border-color: rgba(56, 189, 248, 0.25); color: #FFFFFF;">${st}</span>`).join('')}
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <i class="bi bi-diagram-3 text-silver"></i> Principios de Arquitectura
              </h5>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                ${data.arquitectura.map(item => `
                  <li style="font-size: 0.86rem; color: var(--silver-light); display: flex; align-items: flex-start; gap: 8px; line-height: 1.45;">
                    <i class="bi bi-check2 text-cyan" style="flex-shrink: 0; margin-top: 3px;"></i> <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div style="margin-bottom: 20px;">
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <i class="bi bi-box-seam text-green"></i> Entregables Técnicos
              </h5>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                ${data.entregables.map(item => `
                  <li style="font-size: 0.86rem; color: var(--silver-light); display: flex; align-items: flex-start; gap: 8px; line-height: 1.45;">
                    <i class="bi bi-check-circle-fill text-green" style="flex-shrink: 0; margin-top: 3px;"></i> <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div style="background: rgba(16, 185, 129, 0.06); border-left: 3px solid #10B981; padding: 12px 16px; border-radius: 4px; font-size: 0.85rem; color: var(--silver-light); margin-bottom: 25px;">
              <strong><i class="bi bi-shield-check text-green me-1"></i> Garantía Dev Studio:</strong> ${data.garantia}
            </div>

            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="https://wa.me/50585574484?text=${encodeURIComponent(data.wspText)}" target="_blank" rel="noopener" class="btn btn-silver" style="flex: 1; justify-content: center;">
                <i class="bi bi-whatsapp me-2"></i> Cotizar este Blueprint por WhatsApp
              </a>
              <button type="button" class="btn btn-outline-silver" id="btnModalSimularCalc" data-sim-calc="${({ 'erp-core': 'erp', 'saas-platform': 'suite', 'app-mobile': 'mobile', 'api-gateway': 'suite', 'web-transaccional': 'pos', 'iot-industrial': 'suite' })[fichaKey] || 'erp'}">
                <i class="bi bi-calculator me-2"></i> Simular en Calculadora
              </button>
              <button type="button" class="btn btn-secondary" id="btnCerrarDevModalInterno">
                <i class="bi bi-x-lg me-1"></i> Cerrar
              </button>
            </div>
          `;

          const btnModalSimularCalc = document.getElementById('btnModalSimularCalc');
          if (btnModalSimularCalc) {
            btnModalSimularCalc.addEventListener('click', () => {
              const targetCalc = btnModalSimularCalc.getAttribute('data-sim-calc') || 'erp';
              closeDevModalFn();
              const typeRadio = document.querySelector(`input[name="techType"][value="${targetCalc}"]`);
              if (typeRadio) {
                typeRadio.checked = true;
                if (typeof calculateArchitecture === 'function') calculateArchitecture();
                const calcSec = document.getElementById('estimador');
                if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
                if (typeof showDevToast === 'function') {
                  showDevToast(`Blueprint "${data.title}" cargado en la Calculadora`);
                }
              } else {
                window.location.href = `index.html?blueprint=${encodeURIComponent(targetCalc)}#estimador`;
              }
            });
          }

          const btnCerrarDevModalInterno = document.getElementById('btnCerrarDevModalInterno');
          if (btnCerrarDevModalInterno) {
            btnCerrarDevModalInterno.addEventListener('click', closeDevModalFn);
          }
        }

        // Show modal
        devCatalogModal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeDevModalFn = () => {
      devCatalogModal.classList.remove('show');
      document.body.style.overflow = '';
    };

    if (closeDevCatalogModal) {
      closeDevCatalogModal.addEventListener('click', closeDevModalFn);
    }

    devCatalogModal.addEventListener('click', (e) => {
      if (e.target === devCatalogModal) {
        closeDevModalFn();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && devCatalogModal.classList.contains('show')) {
        closeDevModalFn();
      }
    });
  }

  // ==========================================================================
  // 13. CONSOLA FLOTANTE DE INGENIERÍA (SPEED-DIAL) & MICRO-INTERACCIONES
  // ==========================================================================
  const devFabTrigger = document.getElementById('devFabTrigger');
  const devTechWidget = document.getElementById('devTechWidget');
  const closeDevTechWidget = document.getElementById('closeDevTechWidget');

  if (devFabTrigger && devTechWidget) {
    devFabTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      devTechWidget.classList.toggle('active');
    });

    if (closeDevTechWidget) {
      closeDevTechWidget.addEventListener('click', () => {
        devTechWidget.classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (
        devTechWidget.classList.contains('active') &&
        !devTechWidget.contains(e.target) &&
        !devFabTrigger.contains(e.target)
      ) {
        devTechWidget.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 14. SIMULADOR INTERACTIVO DE IMPACTO OPERATIVO & ROI (#como-ayuda)
  // ==========================================================================
  const roiEmployees = document.getElementById('roiEmployees');
  const roiHours = document.getElementById('roiHours');
  const roiCostHour = document.getElementById('roiCostHour');
  const roiEmployeesVal = document.getElementById('roiEmployeesVal');
  const roiHoursVal = document.getElementById('roiHoursVal');
  const roiCostHourVal = document.getElementById('roiCostHourVal');
  const roiSavedHours = document.getElementById('roiSavedHours');
  const roiPaybackMonths = document.getElementById('roiPaybackMonths');
  const roiSavedUsd = document.getElementById('roiSavedUsd');
  const roiSavedNio = document.getElementById('roiSavedNio');

  function updateRoiSimulator() {
    if (!roiEmployees || !roiHours || !roiCostHour) return;
    const emp = parseInt(roiEmployees.value, 10) || 8;
    const hrs = parseInt(roiHours.value, 10) || 7;
    const cost = parseInt(roiCostHour.value, 10) || 6;

    if (roiEmployeesVal) roiEmployeesVal.textContent = `${emp} personas`;
    if (roiHoursVal) roiHoursVal.textContent = `${hrs} hrs / sem`;
    if (roiCostHourVal) roiCostHourVal.textContent = `$${cost} USD / hr`;

    // 52 weeks, 75% automation efficiency of manual repetitive work
    const annualRecoveredHours = Math.round(emp * hrs * 52 * 0.75);
    const annualSavedUsd = Math.round(annualRecoveredHours * cost);
    const annualSavedNio = Math.round(annualSavedUsd * 36.62);

    // Reference typical custom system investment ($2,400 - $3,800 base scaled by team size)
    const refProjectCost = 2200 + emp * 65;
    const monthlySavedUsd = Math.max(annualSavedUsd / 12, 1);
    const payback = Math.max(0.8, Math.min(14, refProjectCost / monthlySavedUsd)).toFixed(1);

    if (roiSavedHours) roiSavedHours.textContent = `${annualRecoveredHours.toLocaleString()} hrs`;
    if (roiPaybackMonths) roiPaybackMonths.textContent = `~${payback} meses`;
    if (roiSavedUsd) roiSavedUsd.textContent = `$${annualSavedUsd.toLocaleString()} USD / año`;
    if (roiSavedNio) roiSavedNio.textContent = `Equivalente a ~C$ ${annualSavedNio.toLocaleString()} NIO anuales`;
  }

  if (roiEmployees && roiHours && roiCostHour) {
    [roiEmployees, roiHours, roiCostHour].forEach(input => {
      input.addEventListener('input', updateRoiSimulator);
    });
    updateRoiSimulator();
  }

  // ==========================================================================
  // 15. SELECTOR INTERACTIVO DE INDUSTRIAS (#industrias)
  // ==========================================================================
  const industryData = {
    agro: {
      badge: 'SECTOR 01 // AGROINDUSTRIA & PRODUCCIÓN AGRÍCOLA',
      title: 'Agroindustria, Ingenios, Beneficios & Fincas Productoras',
      desc: 'Especializado para operaciones de caña de azúcar, maní, café, plátano, banano, camarón, palma africana y ganadería en zonas rurales sin cobertura celular. Control total desde el surco y la cuadrilla hasta la báscula industrial y la exportación.',
      pains: [
        'Planillas de campo apuntadas a mano con errores y retrasos de hasta 8 días.',
        'Pérdida de agroquímicos, fertilizantes y diésel sin trazabilidad por lote.',
        'Desconocimiento del costo real de producción por manzana o hectárea hasta fin de zafra.'
      ],
      solutions: [
        'App Móvil Offline-First (como AgroStats) para capturar asistencia, labores, maquinaria y cosecha sin señal.',
        'Control de bodega agrícola por lote de cultivo y orden de aplicación técnica.',
        'Integración con básculas camioneras y tableros web de rendimiento por finca y contratista.'
      ],
      stackTitle: 'Ecosistema Campo + Cloud (.NET 9 + Flutter + SQLite)',
      modules: [
        'App Móvil Offline SQLite',
        'Control de Lotes y Cultivos',
        'Tareo y Planilla de Campo',
        'Control de Maquinaria y Combustible',
        'Cosecha y Tickets de Báscula',
        'API Sincronización Delta'
      ],
      impact: 'Reducción del 70% en tiempo de cierre de planilla agrícola y trazabilidad del 100% de labores por lote.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema de software para Agroindustria / Fincas'
    },
    construccion: {
      badge: 'SECTOR 02 // CONSTRUCCIÓN, INGENIERÍA CIVIL & BIENES RAÍCES',
      title: 'Constructoras, Proyectos Viales, Urbanizadoras & Maquinaria',
      desc: 'Control presupuestario y físico de obras civiles, verticales y viales. Conecta a los ingenieros residentes en el plantel con el departamento de compras, bodega central y gerencia financiera en tiempo real.',
      pains: [
        'Desfase entre el avance físico real de la obra y el presupuesto financiero desembolsado.',
        'Compras de emergencia con sobreprecio y pérdida de cemento, acero o herramientas en plantel.',
        'Falta de control sobre horas-máquina trabajadas, consumo de diésel y avalúos de subcontratistas.'
      ],
      solutions: [
        'Módulo de Presupuesto por Costos Unitarios (APU) y control de curva S (físico vs. financiero).',
        'App para Ingeniero Residente: requisición de materiales, bitácora fotográfica con GPS y planilla de obra.',
        'Control de bodega por proyecto, kardex de herramientas asignadas y liquidación de subcontratos.'
      ],
      stackTitle: 'Plataforma ERP Obras + App Residente (.NET 9 + Next.js + Flutter)',
      modules: [
        'Presupuestos APU & Curva S',
        'Requisiciones desde Obra',
        'Bodega de Materiales y Herramientas',
        'Avalúos y Subcontratistas',
        'Bitácora Móvil Offline',
        'Control de Maquinaria Pesada'
      ],
      impact: 'Ahorro del 12% al 18% en sobrecostos de materiales y visibilidad diaria del margen por proyecto.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema de control de obras y presupuestos para Constructora'
    },
    distribucion: {
      badge: 'SECTOR 03 // DISTRIBUCIÓN MAYORISTA, FERRETERÍAS & CONSUMO MASIVO',
      title: 'Importadoras, Distribuidoras Ruteras, Ferreterías & Mayoristas',
      desc: 'Diseñado para empresas que manejan miles de SKUs, múltiples bodegas, listas de precios escalonadas (mayorista, distribuidor, detalle), preventa en calle y reparto en toda Nicaragua.',
      pains: [
        'Vendedores toman pedidos por WhatsApp que se pierden o llegan tarde a facturación.',
        'Quiebres de inventario en productos de alta rotación y sobrestock en mercadería lenta.',
        'Clientes morosos siguen recibiendo despacho por falta de bloqueo automático de crédito.'
      ],
      solutions: [
        'App de Preventa y Autoventa en Ruta con catálogo offline, stock en vivo y geolocalización de visita.',
        'Motor ERP con Kardex Multi-Bodega PEPS/Promedio, bonificaciones, combos y facturación DGI.',
        'Control estricto de Cuentas por Cobrar, límites de crédito y recibos de cobro en impresora térmica.'
      ],
      stackTitle: 'Core ERP Distribución + App SFA Rutera (.NET 9 + PostgreSQL + Flutter)',
      modules: [
        'App Preventa & Cobro en Ruta',
        'Kardex Multi-Bodega',
        'Listas de Precios y Bonificados',
        'Límites de Crédito Automáticos',
        'Despacho y Liquidación de Camiones',
        'Facturación y Retenciones DGI'
      ],
      impact: 'Incremento del 25% en velocidad de despacho de pedidos y reducción drástica de cartera vencida.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema ERP y App de Preventa para Distribuidora / Ferretería'
    },
    talleres: {
      badge: 'SECTOR 04 // TALLERES AUTOMOTRICES, FLOTAS & REPUESTOS',
      title: 'Talleres Mecánicos, Enderezado y Pintura, Ventas de Repuestos & Flotas',
      desc: 'Digitaliza desde la recepción del vehículo con inspección fotográfica en tablet hasta la orden de trabajo, descarga de repuestos de bodega, comisiones de mecánicos y recordatorio de próximo mantenimiento.',
      pains: [
        'Repuestos y lubricantes que salen de bodega sin cargarse a la orden de trabajo del vehículo.',
        'Reclamos de clientes por daños previos no documentados al recibir el vehículo.',
        'Cotizaciones lentas y desconocimiento de la rentabilidad real por bahía y por mecánico.'
      ],
      solutions: [
        'Recepción digital con checklist visual de carrocería, fotos de evidencia y firma en pantalla.',
        'Expediente clínico automotriz por placa/VIN con historial completo de servicios y kilometraje.',
        'Vínculo directo entre Orden de Trabajo, Bodega de Repuestos, Facturación y alertas por WhatsApp.'
      ],
      stackTitle: 'Suite de Gestión Automotriz & Repuestos (Next.js + Node/NestJS + Postgres)',
      modules: [
        'Recepción Digital con Fotos',
        'Órdenes de Trabajo (OT)',
        'Historial por Placa / Chasis VIN',
        'Kardex de Repuestos y Equivalencias',
        'Productividad de Mecánicos',
        'Alertas de Mantenimiento WhatsApp'
      ],
      impact: 'Eliminación del 95% en fugas de repuestos no facturados y aumento en recurrencia de clientes.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema para Taller Automotriz / Venta de Repuestos'
    },
    salud: {
      badge: 'SECTOR 05 // SALUD, CLÍNICAS MÉDICAS, LABORATORIOS & VETERINARIAS',
      title: 'Clínicas de Especialidades, Hospitales, Laboratorios & Veterinarias',
      desc: 'Plataformas clínicas modernas centradas en la atención ágil del paciente (humano o mascota), control riguroso de medicamentos por lote/caducidad y entrega digital de resultados.',
      pains: [
        'Expedientes en papel difíciles de encontrar y pérdida de historial clínico entre consultas.',
        'Medicamentos y reactivos vencidos en estantería por falta de alertas FEFO (primero en vencer, primero en salir).',
        'Inasistencia de pacientes a citas médicas o esquemas de vacunación por falta de recordatorios.'
      ],
      solutions: [
        'Expediente Clínico Electrónico (ECE) o Ficha Veterinaria con signos vitales, imágenes, recetas y evolución.',
        'Agenda inteligente por médico/consultorio con confirmación y recordatorios automáticos por WhatsApp.',
        'Farmacia e inventario por lote y fecha de vencimiento + órdenes de laboratorio con descarga PDF/QR.'
      ],
      stackTitle: 'Plataforma Clínica HIS / Vet Cloud (React + .NET 9 + PostgreSQL)',
      modules: [
        'Expediente Clínico / Mascotas',
        'Agenda Médica + WhatsApp Bot',
        'Control de Farmacia por Caducidad',
        'Laboratorio y Resultados con QR',
        'Facturación y Honorarios Médicos',
        'Internamiento y Hospitalización'
      ],
      impact: 'Reducción del 40% en ausentismo de citas y control del 100% sobre caducidad de medicamentos.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema para Clínica Médica / Laboratorio / Veterinaria'
    },
    logistica: {
      badge: 'SECTOR 06 // LOGÍSTICA, TRANSPORTE DE CARGA & ADUANAS CA-4',
      title: 'Transporte Pesado, Agencias Aduaneras, Almacenes Fiscales & Courier',
      desc: 'Control operativo y financiero de cada viaje nacional o centroamericano (Corinto, Peñas Blancas, Las Manos, El Espino, Guasaule). Conoce la utilidad exacta de cada cabezal y furgón.',
      pains: [
        'Liquidaciones de viáticos, peajes y combustible tardías o con comprobantes alterados.',
        'Clientes llamando todo el día para preguntar dónde viene su contenedor o carga.',
        'Paros no programados de camiones por falta de alertas de mantenimiento preventivo por kilometraje.'
      ],
      solutions: [
        'Módulo de Orden de Viaje, anticipo de gastos, control de galonaje de diésel y liquidación por ruta.',
        'Portal de Tracking en vivo para clientes con hitos (Puerto, Aduana, En Tránsito, Entregado con POD).',
        'Control de mantenimiento de flota, rotación y desgaste de llantas, documentos y seguros.'
      ],
      stackTitle: 'TMS Logístico & Portal de Tracking (Go / .NET + Next.js + App Chofer)',
      modules: [
        'Órdenes de Viaje y Carta de Porte',
        'Control de Combustible y Viáticos',
        'Mantenimiento y Kardex de Llantas',
        'Portal de Tracking para Clientes',
        'Prueba de Entrega Digital (POD)',
        'Rentabilidad por Cabezal / Placa'
      ],
      impact: 'Control exacto del costo por kilómetro recorrido y reducción del 20% en gastos operativos de ruta.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema TMS de Logística y Control de Flota Pesada'
    },
    manufactura: {
      badge: 'SECTOR 07 // MANUFACTURA, PLANTAS PROCESADORAS & INDUSTRIA',
      title: 'Fábricas, Procesadoras de Alimentos, Lácteos, Panificación & Zonas Francas',
      desc: 'Controla la transformación de materia prima en producto terminado: recetas de producción (BOM), costos reales de tanda, mermas, control de calidad e integración con básculas y sensores.',
      pains: [
        'Diferencias entre la materia prima entregada a planta y las unidades reales producidas (merma oculta).',
        'Cálculo manual de costos de producción que no refleja variaciones en insumos o energía.',
        'Falta de trazabilidad hacia atrás del lote en caso de reclamos de calidad.'
      ],
      solutions: [
        'Órdenes de Producción con explosión automática de materiales (BOM) y descarga de bodega de insumos.',
        'Captura en piso de planta de tiempos, desperdicios, control de calidad y empaque por lote.',
        'Telemetría IoT opcional para monitoreo de cuartos fríos, hornos, calderas y básculas industriales.'
      ],
      stackTitle: 'Sistema MES de Planta + Telemetría IoT (.NET 9 + TimescaleDB + React)',
      modules: [
        'Fórmulas y Recetas Estándar (BOM)',
        'Órdenes de Producción por Lote',
        'Control de Merma y Subproductos',
        'Trazabilidad de Calidad e Inocuidad',
        'Costeo Real de Producción',
        'Monitoreo IoT de Cuartos Fríos'
      ],
      impact: 'Visibilidad exacta del costo unitario por tanda y reducción de mermas de planta hasta en un 35%.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema de Producción y Manufactura para Planta Industrial'
    },
    finanzas: {
      badge: 'SECTOR 08 // MICROFINANCIERAS, COOPERATIVAS & RETAIL OMNICANAL',
      title: 'Cooperativas de Ahorro y Crédito, Financieras, Cadenas Retail & Franquicias',
      desc: 'Arquitecturas transaccionales de grado bancario con cifrado estricto, pistas de auditoría inmutables, originación y cobro de créditos en calle y puntos de venta multi-sucursal.',
      pains: [
        'Evaluación y aprobación de créditos lenta en papel y cobradores en calle con talonarios manuales.',
        'Dificultad para consolidar ventas, arqueos de caja e inventarios de múltiples sucursales al cierre del día.',
        'Sistemas antiguos cerrados que no permiten conectar pagos en línea ni WhatsApp.'
      ],
      solutions: [
        'Core de Cartera de Crédito: tablas de amortización, interés corriente/moratorio, pagarés y reestructuraciones.',
        'App para Oficiales de Crédito y Colectores con impresión Bluetooth de recibos en sitio y geolocalización.',
        'POS Multi-Sucursal y E-Commerce sincronizados al segundo con arqueo ciego y conciliación bancaria.'
      ],
      stackTitle: 'Core Financiero & POS Omnicanal (.NET 9 + PostgreSQL ACID + Flutter)',
      modules: [
        'Originación y Comité de Crédito',
        'Cartera, Mora y Amortizaciones',
        'App de Cobro con Impresora Térmica',
        'POS Multi-Sucursal & Arqueo Ciego',
        'Auditoría Transaccional Inmutable',
        'Portal de Estado de Cuenta'
      ],
      impact: 'Cierre diario consolidado en minutos y reducción del tiempo de desembolso de créditos en un 60%.',
      wspText: 'Hola Dev Studio, quiero cotizar un sistema para Financiera / Cooperativa / Cadena Retail'
    }
  };

  const industryTabBtns = document.querySelectorAll('.industry-tab-btn');
  const industryJumpCards = document.querySelectorAll('[data-industry-jump]');
  const indBadge = document.getElementById('indBadge');
  const indTitle = document.getElementById('indTitle');
  const indDesc = document.getElementById('indDesc');
  const indPainsList = document.getElementById('indPainsList');
  const indSolutionsList = document.getElementById('indSolutionsList');
  const indStackTitle = document.getElementById('indStackTitle');
  const indModulesPills = document.getElementById('indModulesPills');
  const indImpactMetric = document.getElementById('indImpactMetric');
  const indWspBtn = document.getElementById('indWspBtn');

  function selectIndustry(key) {
    const data = industryData[key];
    if (!data) return;

    industryTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.industry === key);
    });

    if (indBadge) indBadge.textContent = data.badge;
    if (indTitle) indTitle.textContent = data.title;
    if (indDesc) indDesc.textContent = data.desc;
    if (indPainsList) {
      indPainsList.innerHTML = data.pains
        .map(p => `<li><i class="bi bi-x-circle text-danger"></i> ${p}</li>`)
        .join('');
    }
    if (indSolutionsList) {
      indSolutionsList.innerHTML = data.solutions
        .map(s => `<li><i class="bi bi-check2 text-green"></i> ${s}</li>`)
        .join('');
    }
    if (indStackTitle) indStackTitle.textContent = data.stackTitle;
    if (indModulesPills) {
      indModulesPills.innerHTML = data.modules
        .map(m => `<span class="sw-module-pill">${m}</span>`)
        .join('');
    }
    if (indImpactMetric) indImpactMetric.textContent = data.impact;
    if (indWspBtn) {
      indWspBtn.href = `https://wa.me/50585574484?text=${encodeURIComponent(data.wspText)}`;
    }

    const spotlightCard = document.getElementById('industrySpotlightCard');
    if (spotlightCard) {
      spotlightCard.classList.remove('panel-fade-enter');
      void spotlightCard.offsetWidth; // trigger reflow for smooth animation replay
      spotlightCard.classList.add('panel-fade-enter');
    }
  }

  industryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectIndustry(btn.dataset.industry);
    });
  });

  industryJumpCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-industry-jump');
      selectIndustry(key);
      const spotlight = document.getElementById('industrySpotlightCard');
      if (spotlight) spotlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // ==========================================================================
  // 16. BARRA DE PROGRESO LASER, FÍSICA 3D TILT & TARJETAS EXPANDIBLES
  // ==========================================================================
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  if (scrollProgressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      scrollProgressBar.style.width = `${pct}%`;
    }, { passive: true });
  }

  // Expandable Technical Flow Drawers inside Software Type Cards
  const expandCardBtns = document.querySelectorAll('[data-expand-card]');
  expandCardBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.sw-type-card');
      if (!card) return;
      const drawer = card.querySelector('.card-expand-drawer');
      const span = btn.querySelector('span');
      if (drawer) {
        const isOpen = drawer.classList.toggle('open');
        if (span) {
          span.textContent = isOpen ? 'Ocultar Flujo Interno' : 'Inspeccionar Flujo Interno';
        }
      }
    });
  });

  // Live Telemetry Pulse in Bento Cards
  const bentoErpClock = document.getElementById('bentoErpClock');
  const bentoSyncBadge = document.getElementById('bentoSyncBadge');
  if (bentoErpClock || bentoSyncBadge) {
    let packetSeq = 148;
    setInterval(() => {
      const latency = (10.4 + Math.random() * 3.8).toFixed(1);
      if (bentoErpClock) bentoErpClock.textContent = `SYNC: ${latency}ms`;
      packetSeq += Math.floor(Math.random() * 4) + 1;
      if (bentoSyncBadge) bentoSyncBadge.textContent = `OUTBOX #${packetSeq}: 100% ACK`;
    }, 2600);
  }

  // Spotlight Radial Glow + 3D Perspective Tilt (Linear / Vercel / Stripe style)
  const spotlightCards = document.querySelectorAll(
    '.bento-live-card, .service-card, .stack-item-card, .dev-catalog-card, .seal-card, .blueprint-card, .impact-pillar-card, .sw-type-card, .industry-mini-card'
  );
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Subtle 3D tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (((y - centerY) / centerY) * -3.5).toFixed(2);
      const rotateY = (((x - centerX) / centerX) * 3.5).toFixed(2);
      card.style.setProperty('--rx', `${rotateX}deg`);
      card.style.setProperty('--ry', `${rotateY}deg`);
      card.classList.add('tilt-card-active');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilt-card-active');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Scroll Reveal Observer for smooth architectural entrances
  const revealElements = document.querySelectorAll(
    '.bento-live-card, .service-card, .stack-item-card, .dev-catalog-card, .blueprint-card, .seal-card, .case-featured, .impact-pillar-card, .sw-type-card, .industry-mini-card, .industry-spotlight-card'
  );
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    revealElements.forEach((el, idx) => {
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = `${(idx % 3) * 65}ms`;
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ==========================================================================
  // 17. EXPERIENCIA DE USUARIO AVANZADA (COMMAND PALETTE CTRL+K, ASESOR GUIADO,
  //     CONVERSOR DE MONEDA USD/NIO, VOLVER ARRIBA & NOTIFICACIONES TOAST)
  // ==========================================================================

  // 17.1 Toast Notification Engine
  let toastEl = document.getElementById('devUxToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'devUxToast';
    toastEl.className = 'dev-ux-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  let toastTimer = null;
  function showDevToast(message) {
    if (!toastEl) return;
    toastEl.innerHTML = `<i class="bi bi-check-circle-fill text-green"></i> <span>${message}</span>`;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // 17.2 Floating Back-to-Top Button
  let backTopBtn = document.getElementById('uxBackTopBtn');
  if (!backTopBtn) {
    backTopBtn = document.createElement('button');
    backTopBtn.id = 'uxBackTopBtn';
    backTopBtn.type = 'button';
    backTopBtn.className = 'ux-back-top-btn no-print';
    backTopBtn.setAttribute('aria-label', 'Volver al inicio de la página');
    backTopBtn.title = 'Volver arriba';
    backTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    document.body.appendChild(backTopBtn);

    backTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      backTopBtn.classList.toggle('visible', y > 450);
    }, { passive: true });
  }

  // 17.3 Asesor Inteligente de Solución en 2 Pasos (#asesor-inteligente)
  const wizardDatabase = {
    erp: {
      title: 'ERP Cloud Core & Facturación Fiscal DGI',
      desc: 'Ideal para centralizar kardex multi-bodega PEPS/Promedio, compras, cuentas por cobrar/pagar, bancos y contabilidad bimoneda NIO/USD con retenciones de ley.',
      pills: ['.NET 9 C# API', 'PostgreSQL 16', 'Módulo DGI Nicaragua', 'Kardex Multi-Bodega'],
      baseUsd: 1850,
      weeks: '3 - 4 Semanas',
      calcType: 'erp'
    },
    campo: {
      title: 'App Móvil Offline-First + API de Sincronización',
      desc: 'Diseñada para fincas agrícolas, proyectos de construcción o inspecciones técnicas donde no hay señal celular. Guarda todo en SQLite local y sincroniza al reconectar.',
      pills: ['Flutter iOS/Android', 'SQLite / Drift Local', 'Delta Sync .NET 9', 'GPS & Fotos Offline'],
      baseUsd: 2450,
      weeks: '4 - 6 Semanas',
      calcType: 'mobile'
    },
    rutas: {
      title: 'CRM Preventa en Ruta (SFA), Flotas & Cobranza Móvil',
      desc: 'Controla vendedores ruteros con geocercas GPS, toma de pedidos con reserva de stock en vivo, validación de límite de crédito e impresión de recibos Bluetooth.',
      pills: ['App Rutera Flutter', 'Recibos ESC/POS Bluetooth', 'Control de Crédito CxC', 'Liquidación de Camiones'],
      baseUsd: 2250,
      weeks: '4 - 5 Semanas',
      calcType: 'rutas'
    },
    clinica: {
      title: 'Plataforma de Gestión Clínica (HIS), Veterinaria o Taller',
      desc: 'Digitaliza expedientes clínicos o automotrices por placa, agenda con recordatorios automáticos por WhatsApp, control de farmacia/repuestos y facturación.',
      pills: ['Expediente Digital', 'Bot Recordatorios WhatsApp', 'Control de Caducidad FEFO', 'Caja y Comisiones'],
      baseUsd: 1650,
      weeks: '3 - 4 Semanas',
      calcType: 'clinica'
    },
    pos: {
      title: 'POS Punto de Venta Multi-Sucursal & E-Commerce Omnicanal',
      desc: 'Facturación ultrarrápida con lector de código de barras, arqueo de caja ciego (NIO/USD/POS) y tienda web conectada al mismo inventario en tiempo real.',
      pills: ['POS Rápido Mostrador', 'Arqueo de Caja Ciego', 'E-Commerce Next.js', 'Pasarela BAC / WhatsApp'],
      baseUsd: 1450,
      weeks: '2 - 4 Semanas',
      calcType: 'pos'
    },
    ia: {
      title: 'Business Intelligence (BI), Telemetría IoT & Copiloto IA',
      desc: 'Consolida bases de datos dispersas, básculas industriales o sensores MQTT en tableros ejecutivos en vivo con consultas en lenguaje natural mediante IA.',
      pills: ['Dashboards Gerenciales', 'Copiloto IA con RAG', 'Telemetría MQTT', 'Alertas en WhatsApp'],
      baseUsd: 2800,
      weeks: '4 - 6 Semanas',
      calcType: 'suite'
    }
  };

  const scaleMultipliers = {
    mvp: { mult: 1.0, label: 'PyME / 1 Sede' },
    growth: { mult: 1.35, label: 'Multi-Sucursal' },
    enterprise: { mult: 1.8, label: 'Escala Corporativa' }
  };

  let currentWizNeed = 'erp';
  let currentWizScale = 'mvp';

  const wizNeedBtns = document.querySelectorAll('[data-wiz-need]');
  const wizScaleBtns = document.querySelectorAll('[data-wiz-scale]');
  const wizTimeTag = document.getElementById('wizTimeTag');
  const wizRecTitle = document.getElementById('wizRecTitle');
  const wizRecDesc = document.getElementById('wizRecDesc');
  const wizRecPills = document.getElementById('wizRecPills');
  const wizRecPrice = document.getElementById('wizRecPrice');
  const btnWizPreloadCalc = document.getElementById('btnWizPreloadCalc');
  const btnWizWsp = document.getElementById('btnWizWsp');
  const wizardResultCard = document.getElementById('wizardResultCard');

  function updateWizardAdvisor() {
    const item = wizardDatabase[currentWizNeed];
    const sc = scaleMultipliers[currentWizScale] || scaleMultipliers.mvp;
    if (!item || !wizRecTitle) return;

    const usd = Math.round((item.baseUsd * sc.mult) / 50) * 50;
    const nio = Math.round(usd * 36.62);

    if (wizTimeTag) wizTimeTag.textContent = `${item.weeks} • ${sc.label}`;
    wizRecTitle.textContent = item.title;
    if (wizRecDesc) wizRecDesc.textContent = item.desc;
    if (wizRecPills) {
      wizRecPills.innerHTML = item.pills.map(p => `<span class="sw-module-pill">${p}</span>`).join('');
    }
    if (wizRecPrice) {
      const prefCurr = localStorage.getItem('devStudioCurrency') || 'USD';
      wizRecPrice.textContent = prefCurr === 'NIO'
        ? `C$ ${nio.toLocaleString()} NIO (~$${usd.toLocaleString()} USD)`
        : `$${usd.toLocaleString()} USD (~C$ ${nio.toLocaleString()} NIO)`;
    }
    if (btnWizWsp) {
      const msg = `Hola Dev Studio, usé el Asesor Inteligente y me interesa: ${item.title} (${sc.label}) - Inversión base aprox. $${usd.toLocaleString()} USD`;
      btnWizWsp.href = `https://wa.me/50585574484?text=${encodeURIComponent(msg)}`;
    }
    if (wizardResultCard) {
      wizardResultCard.classList.remove('panel-fade-enter');
      void wizardResultCard.offsetWidth;
      wizardResultCard.classList.add('panel-fade-enter');
    }
  }

  wizNeedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      wizNeedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWizNeed = btn.getAttribute('data-wiz-need');
      updateWizardAdvisor();
    });
  });

  wizScaleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      wizScaleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWizScale = btn.getAttribute('data-wiz-scale');
      updateWizardAdvisor();
    });
  });

  if (btnWizPreloadCalc) {
    btnWizPreloadCalc.addEventListener('click', () => {
      const item = wizardDatabase[currentWizNeed];
      if (!item) return;
      const typeRadio = document.querySelector(`input[name="techType"][value="${item.calcType}"]`);
      const scaleRadio = document.querySelector(`input[name="techScale"][value="${currentWizScale}"]`);
      if (typeRadio) typeRadio.checked = true;
      if (scaleRadio) scaleRadio.checked = true;
      if (typeof calculateArchitecture === 'function') calculateArchitecture();

      const calcSec = document.getElementById('estimador');
      if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
      showDevToast(`Arquitectura "${item.title}" cargada en la Calculadora`);
    });
  }

  // 17.4 Inyección de Herramientas UX en la Barra Superior (Buscador Ctrl+K + Moneda USD/NIO)
  const subnavInner = document.querySelector('.telemetry-utils-slot') || document.querySelector('.site-subnav-inner');
  if (subnavInner) {
    const uxGroup = document.createElement('div');
    uxGroup.className = 'ux-toolbar-group no-print';
    const savedCurr = localStorage.getItem('devStudioCurrency') || 'USD';

    uxGroup.innerHTML = `
      <div class="currency-toggle-btn" id="globalCurrencyToggle" title="Cambiar moneda principal (USD / Córdobas NIO)">
        <span class="currency-opt ${savedCurr === 'USD' ? 'active' : ''}" data-curr="USD">USD $</span>
        <span class="currency-opt ${savedCurr === 'NIO' ? 'active' : ''}" data-curr="NIO">NIO C$</span>
      </div>
      <button type="button" class="cmd-trigger-btn" id="openCmdPaletteBtn" aria-label="Abrir buscador rápido">
        <i class="bi bi-search text-cyan"></i>
        <span>Buscar</span>
        <span class="cmd-kbd-badge">Ctrl+K</span>
      </button>
    `;
    subnavInner.appendChild(uxGroup);
  }

  // Conversor Global de Moneda (USD ⇄ NIO)
  function applyGlobalCurrency(curr) {
    localStorage.setItem('devStudioCurrency', curr);
    document.querySelectorAll('#globalCurrencyToggle .currency-opt').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-curr') === curr);
    });
    updateWizardAdvisor();
    if (typeof calculateArchitecture === 'function') calculateArchitecture();

    // Update Blueprint cards primary/secondary price display if present
    const catalogPrices = [
      { usd: '$1,850', nio: 'C$ 67,747', period: 'base', subUsd: '~$1,850 USD', subNio: '~C$ 67,747 NIO' },
      { usd: '$3,200', nio: 'C$ 117,184', period: 'base', subUsd: '~$3,200 USD', subNio: '~C$ 117,184 NIO' },
      { usd: '$2,450', nio: 'C$ 89,719', period: 'base', subUsd: '~$2,450 USD', subNio: '~C$ 89,719 NIO' },
      { usd: '$2,100', nio: 'C$ 76,902', period: 'base', subUsd: '~$2,100 USD', subNio: '~C$ 76,902 NIO' },
      { usd: '$980', nio: 'C$ 35,888', period: 'base', subUsd: '~$980 USD', subNio: '~C$ 35,888 NIO' },
      { usd: '$2,800', nio: 'C$ 102,536', period: 'base', subUsd: '~$2,800 USD', subNio: '~C$ 102,536 NIO' }
    ];
    const cards = document.querySelectorAll('#devCatalogGrid .dev-catalog-card');
    cards.forEach((card, idx) => {
      const info = catalogPrices[idx];
      if (!info) return;
      const mainEl = card.querySelector('.dev-price-main');
      const subEl = card.querySelector('.dev-price-sub');
      if (mainEl && subEl) {
        if (curr === 'NIO') {
          mainEl.innerHTML = `${info.nio} <span class="dev-price-period">NIO ${info.period}</span>`;
          subEl.textContent = info.subUsd;
        } else {
          mainEl.innerHTML = `${info.usd} <span class="dev-price-period">USD ${info.period}</span>`;
          subEl.textContent = info.subNio;
        }
      }
    });
  }

  // Botones rápidos "Cotizar en Configurador" + Deep-Link ?blueprint= + Barra Móvil + Tel Desktop
  function preloadCalculator(targetVal, scaleVal = null, toastMsg = null, shouldScroll = true) {
    const radio = document.querySelector(`input[name="techType"][value="${targetVal}"]`);
    if (!radio) return false;
    radio.checked = true;
    if (scaleVal) {
      const sRadio = document.querySelector(`input[name="techScale"][value="${scaleVal}"]`);
      if (sRadio) sRadio.checked = true;
    }
    if (typeof calculateArchitecture === 'function') calculateArchitecture();
    if (shouldScroll) {
      const calcSec = document.getElementById('estimador');
      if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
    }
    if (toastMsg && typeof showDevToast === 'function') showDevToast(toastMsg);
    return true;
  }

  const preloadCalcBtns = document.querySelectorAll('[data-preload-calc]');
  preloadCalcBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetVal = btn.getAttribute('data-preload-calc');
      preloadCalculator(targetVal, null, 'Solución cargada en el Configurador de Proyecto', true);
    });
  });

  // Precarga vía URL (?blueprint=erp|mobile|rutas|pos|clinica|suite)
  const bpParam = new URLSearchParams(window.location.search).get('blueprint');
  if (bpParam) {
    preloadCalculator(bpParam, null, 'Arquitectura preseleccionada en tu configurador', window.location.hash === '#estimador');
  }

  // Barra sticky móvil mientras el usuario configura su proyecto dentro de #estimador
  const estimadorSection = document.getElementById('estimador');
  const calcSpecBox = estimadorSection ? estimadorSection.querySelector('.calc-output-spec') : null;
  if (estimadorSection && calcSpecBox && 'IntersectionObserver' in window) {
    const mobileBar = document.createElement('div');
    mobileBar.className = 'mobile-calc-sticky-bar no-print';
    mobileBar.id = 'devMobileCalcBar';
    mobileBar.innerHTML = `
      <div class="mobile-calc-meta">
        <span class="mobile-calc-kicker">Inversión estimada</span>
        <strong class="mobile-calc-val" id="devMobileCalcValue">Desde $1,850 USD</strong>
      </div>
      <button type="button" class="btn btn-sm btn-silver" id="devMobileCalcJumpBtn">
        Ver Resumen <i class="bi bi-arrow-down-short"></i>
      </button>
    `;
    document.body.appendChild(mobileBar);

    const jumpBtn = document.getElementById('devMobileCalcJumpBtn');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        calcSpecBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    if (typeof calculateArchitecture === 'function') calculateArchitecture();

    let estVisible = false;
    let specVisible = false;
    const syncMobileBar = () => {
      mobileBar.classList.toggle('is-visible', estVisible && !specVisible);
    };

    const estObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target === estimadorSection) estVisible = entry.isIntersecting;
          if (entry.target === calcSpecBox) specVisible = entry.isIntersecting;
        });
        syncMobileBar();
      },
      { threshold: 0.08 }
    );
    estObserver.observe(estimadorSection);
    estObserver.observe(calcSpecBox);
  }

  // Copiar número telefónico al hacer clic en dispositivos de escritorio (sin romper dialer móvil)
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const isDesktopFine = window.innerWidth >= 992 && window.matchMedia('(pointer: fine)').matches;
      if (isDesktopFine && navigator.clipboard && navigator.clipboard.writeText) {
        e.preventDefault();
        const rawPhone = link.getAttribute('href').replace('tel:', '').trim();
        navigator.clipboard.writeText(rawPhone).then(() => {
          if (typeof showDevToast === 'function') {
            showDevToast(`Número copiado (${rawPhone}). También disponible vía WhatsApp.`);
          }
        }).catch(() => {
          window.location.href = link.getAttribute('href');
        });
      }
    });
  });

  // Pestañas Interactivas de AgroStats (#casos: App Móvil vs Panel Web)
  const agroTabBtns = document.querySelectorAll('[data-agro-tab]');
  const agroTabMobile = document.getElementById('agroTabMobile');
  const agroTabWeb = document.getElementById('agroTabWeb');
  agroTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-agro-tab');
      agroTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (agroTabMobile && agroTabWeb) {
        agroTabMobile.classList.toggle('active', mode === 'mobile');
        agroTabWeb.classList.toggle('active', mode === 'web');
      }
    });
  });

  // Scroll-Spy para la Barra Fija de Salto Rápido en Subpáginas (.sticky-subpage-nav)
  const subpageJumpPills = document.querySelectorAll('.sticky-subpage-nav .subpage-jump-pill');
  if (subpageJumpPills.length > 0 && 'IntersectionObserver' in window) {
    const trackedArticles = [];
    subpageJumpPills.forEach(pill => {
      const href = pill.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) trackedArticles.push({ id: href.slice(1), el: targetEl, pill });
      }
    });

    if (trackedArticles.length > 0) {
      const spyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const activeId = entry.target.id;
              subpageJumpPills.forEach(p => {
                p.classList.toggle('active', p.getAttribute('href') === `#${activeId}`);
              });
            }
          });
        },
        { rootMargin: '-22% 0px -65% 0px', threshold: 0 }
      );
      trackedArticles.forEach(item => spyObserver.observe(item.el));
    }
  }

  const globalCurrencyToggle = document.getElementById('globalCurrencyToggle');
  if (globalCurrencyToggle) {
    globalCurrencyToggle.addEventListener('click', (e) => {
      const targetOpt = e.target.closest('.currency-opt');
      const current = localStorage.getItem('devStudioCurrency') || 'USD';
      const next = targetOpt ? targetOpt.getAttribute('data-curr') : (current === 'USD' ? 'NIO' : 'USD');
      applyGlobalCurrency(next);
      showDevToast(next === 'NIO' ? 'Moneda principal: Córdobas (C$ NIO)' : 'Moneda principal: Dólares ($ USD)');
    });
    if ((localStorage.getItem('devStudioCurrency') || 'USD') === 'NIO') {
      applyGlobalCurrency('NIO');
    }
  }

  // 17.5 Command Palette (Ctrl+K) — Buscador Instantáneo de Industrias, Sistemas y Herramientas
  const cmdItems = [
    { title: 'Sistemas ERP & Facturación Fiscal DGI', sub: 'Inventario multi-bodega, compras, CxC y contabilidad NIO/USD', tag: 'Tipo de Software', icon: 'bi-building-gear', url: 'soluciones-software.html#sw-erp' },
    { title: 'CRM Comercial, Preventa en Ruta & Cobranza', sub: 'App para vendedores ruteros con GPS e impresora Bluetooth', tag: 'Tipo de Software', icon: 'bi-people-fill', url: 'soluciones-software.html#sw-crm' },
    { title: 'Apps Móviles Offline-First (Sin Señal)', sub: 'Captura de datos en fincas, obras y rutas con SQLite local', tag: 'Tipo de Software', icon: 'bi-wifi-off', url: 'soluciones-software.html#sw-offline' },
    { title: 'Sistemas WMS de Bodega & Control de Flotas', sub: 'Almacenes por ubicación, diésel, llantas y aduanas CA-4', tag: 'Tipo de Software', icon: 'bi-truck', url: 'soluciones-software.html#sw-wms' },
    { title: 'Sistemas Clínicos (HIS), Laboratorios & Veterinarias', sub: 'Expediente electrónico, citas WhatsApp y farmacia FEFO', tag: 'Tipo de Software', icon: 'bi-heart-pulse-fill', url: 'soluciones-software.html#sw-his' },
    { title: 'POS Punto de Venta Multi-Sucursal & E-Commerce', sub: 'Caja rápida, arqueo ciego y tienda online sincronizada', tag: 'Tipo de Software', icon: 'bi-shop-window', url: 'soluciones-software.html#sw-pos' },
    { title: 'Industria: Agroindustria, Ingenios & Fincas', sub: 'Caña, café, maní, banano, ganadería y caso real AgroStats', tag: 'Industria', icon: 'bi-tree-fill', url: 'industrias.html#sec-agro' },
    { title: 'Industria: Construcción, Ingeniería Civil & Obras', sub: 'Presupuestos APU, curva S, bodega de obra y subcontratos', tag: 'Industria', icon: 'bi-cone-striped', url: 'industrias.html#sec-construccion' },
    { title: 'Industria: Distribución Mayorista & Ferreterías', sub: 'Preventa rutera, listas de precios, bonificados y crédito', tag: 'Industria', icon: 'bi-box-seam-fill', url: 'industrias.html#sec-distribucion' },
    { title: 'Industria: Talleres Automotrices & Repuestos', sub: 'Órdenes de trabajo, inspección por placa/VIN y mecánicos', tag: 'Industria', icon: 'bi-wrench-adjustable-circle-fill', url: 'industrias.html#sec-talleres' },
    { title: 'Simulador de Ahorro Operativo & ROI', sub: 'Calcula cuánto dinero y horas-hombre ahorra tu empresa al año', tag: 'Herramienta', icon: 'bi-graph-up-arrow', url: 'impacto-roi.html#simulador-roi' },
    { title: 'Calculadora Interactiva de Sprints y Costos', sub: 'Cotiza tu sistema de software en tiempo real (USD y NIO)', tag: 'Calculadora', icon: 'bi-calculator-fill', url: 'index.html#estimador' },
    { title: 'Dossier de Blueprints & Matriz SLA (PDF)', sub: 'Especificaciones de arquitectura listas para imprimir en PDF', tag: 'Whitepaper', icon: 'bi-file-earmark-code-fill', url: 'blueprints.html' },
    { title: 'Hablar con un Arquitecto de Software por WhatsApp', sub: 'Respuesta directa en menos de 24h hábiles bajo acuerdo NDA', tag: 'Contacto Directo', icon: 'bi-whatsapp', url: 'https://wa.me/50585574484?text=Hola%20Dev%20Studio,%20deseo%20consultar%20un%20proyecto%20de%20software' }
  ];

  const cmdBackdrop = document.createElement('div');
  cmdBackdrop.className = 'cmd-palette-backdrop no-print';
  cmdBackdrop.id = 'cmdPaletteBackdrop';
  cmdBackdrop.innerHTML = `
    <div class="cmd-palette-modal" role="dialog" aria-modal="true" aria-label="Buscador rápido de soluciones e industrias">
      <div class="cmd-search-header">
        <i class="bi bi-search"></i>
        <input type="text" class="cmd-search-input" id="cmdSearchInput" placeholder="Busca un tipo de software, industria (ej. agro, taller, ERP, DGI, precios)..." autocomplete="off">
        <button type="button" id="closeCmdPaletteBtn" class="cmd-kbd-badge" style="cursor:pointer;">ESC</button>
      </div>
      <div class="cmd-results-list" id="cmdResultsList"></div>
      <div class="cmd-palette-footer">
        <span><i class="bi bi-lightning-charge text-cyan me-1"></i> Navegación Instantánea Dev Studio</span>
        <span>Usa el ratón o Enter para abrir</span>
      </div>
    </div>
  `;
  document.body.appendChild(cmdBackdrop);

  const cmdSearchInput = document.getElementById('cmdSearchInput');
  const cmdResultsList = document.getElementById('cmdResultsList');
  const openCmdPaletteBtn = document.getElementById('openCmdPaletteBtn');
  const closeCmdPaletteBtn = document.getElementById('closeCmdPaletteBtn');

  function renderCmdResults(query = '') {
    if (!cmdResultsList) return;
    const q = query.trim().toLowerCase();
    const filtered = q
      ? cmdItems.filter(item =>
          item.title.toLowerCase().includes(q) ||
          item.sub.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q)
        )
      : cmdItems;

    if (filtered.length === 0) {
      cmdResultsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--silver-mid); font-size: 0.88rem;">
          No encontramos coincidencias exactas para "<strong>${escapeHtml(query)}</strong>".
          <div style="margin-top: 10px;">
            <a href="https://wa.me/50585574484?text=Hola%20Dev%20Studio,%20busco%20informaci%C3%B3n%20sobre:%20${encodeURIComponent(query)}" target="_blank" rel="noopener" class="btn btn-sm btn-silver">
              <i class="bi bi-whatsapp me-1"></i> Consultar "${escapeHtml(query)}" a un Ingeniero
            </a>
          </div>
        </div>
      `;
      return;
    }

    cmdResultsList.innerHTML = filtered.map((item, idx) => `
      <a href="${item.url}" class="cmd-result-item ${idx === 0 ? 'active' : ''}" ${item.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
        <div class="cmd-item-left">
          <div class="cmd-item-icon"><i class="bi ${item.icon}"></i></div>
          <div>
            <span class="cmd-item-title">${item.title}</span>
            <span class="cmd-item-sub">${item.sub}</span>
          </div>
        </div>
        <span class="cmd-item-tag">${item.tag}</span>
      </a>
    `).join('');
  }

  function openCmdPalette() {
    cmdBackdrop.classList.add('open');
    renderCmdResults('');
    if (cmdSearchInput) {
      cmdSearchInput.value = '';
      setTimeout(() => cmdSearchInput.focus(), 40);
    }
  }

  function closeCmdPalette() {
    cmdBackdrop.classList.remove('open');
  }

  if (openCmdPaletteBtn) {
    openCmdPaletteBtn.addEventListener('click', openCmdPalette);
  }
  if (closeCmdPaletteBtn) {
    closeCmdPaletteBtn.addEventListener('click', closeCmdPalette);
  }
  cmdBackdrop.addEventListener('click', (e) => {
    if (e.target === cmdBackdrop) closeCmdPalette();
  });
  if (cmdSearchInput) {
    cmdSearchInput.addEventListener('input', (e) => {
      renderCmdResults(e.target.value);
    });
    cmdSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const firstActive = cmdResultsList.querySelector('.cmd-result-item');
        if (firstActive) {
          closeCmdPalette();
          firstActive.click();
        }
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdBackdrop.classList.contains('open')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    } else if (e.key === 'Escape' && cmdBackdrop.classList.contains('open')) {
      closeCmdPalette();
    }
  });
});
