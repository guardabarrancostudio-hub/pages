/* =========================================================
   LUIS ENRIQUE ALBARES SORIANO — CORPORATE PORTFOLIO LOGIC
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const LANG_STORAGE_KEY = 'luisPortfolioLang';
  let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'es';
  const isCvPage = Boolean(document.querySelector('.cv-sheet'));

  /* ---------- 1. Toast Notification ---------- */
  const uxToast = document.getElementById('uxToast');
  let toastTimer = null;

  function showToast(msg, duration = 3000) {
    if (!uxToast) return;
    uxToast.style.display = 'inline-flex';
    uxToast.innerHTML = `<i class="bi bi-check-circle-fill" aria-hidden="true"></i> <span>${msg}</span>`;
    uxToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      uxToast.classList.remove('show');
    }, duration);
  }

  /* ---------- 2. Full Bilingual Engine (ES <-> EN) ---------- */
  const btnToggleLang = document.getElementById('btnToggleLang');
  const langBadgeText = document.getElementById('langBadgeText');

  function applyLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = currentLang;

    if (isCvPage) {
      document.title =
        currentLang === 'en'
          ? 'Executive Resume | Luis Enrique Albares Soriano — Systems Engineer & Data Analyst (DRA)'
          : 'CV Ejecutivo | Luis Enrique Albares Soriano — Ingeniería en Sistemas y Análisis de Datos (DRA)';
    } else {
      document.title =
        currentLang === 'en'
          ? 'Luis Enrique Albares Soriano | Systems Engineer, Data Analysis (DRA) & Consulting'
          : 'Luis Enrique Albares Soriano | Ingeniero en Sistemas, Análisis de Datos (DRA) & Consultoría';
    }

    document.querySelectorAll('[data-es][data-en]').forEach((el) => {
      const value = el.getAttribute(`data-${currentLang}`);
      if (value === null) return;
      if (el.tagName === 'OPTION') {
        el.textContent = value;
      } else {
        el.innerHTML = value;
      }
    });

    document
      .querySelectorAll('[data-placeholder-es][data-placeholder-en]')
      .forEach((el) => {
        const val = el.getAttribute(`data-placeholder-${currentLang}`);
        if (val !== null) el.placeholder = val;
      });

    document.querySelectorAll('[data-aria-es][data-aria-en]').forEach((el) => {
      const val = el.getAttribute(`data-aria-${currentLang}`);
      if (val !== null) el.setAttribute('aria-label', val);
    });

    document
      .querySelectorAll('[data-title-es][data-title-en]')
      .forEach((el) => {
        const val = el.getAttribute(`data-title-${currentLang}`);
        if (val !== null) el.setAttribute('title', val);
      });

    if (langBadgeText) {
      langBadgeText.textContent = currentLang === 'es' ? 'ES ⇄ EN' : 'EN ⇄ ES';
    }

    localStorage.setItem(LANG_STORAGE_KEY, currentLang);

    const cmdBackdropEl = document.getElementById('cmdBackdrop');
    if (cmdBackdropEl && cmdBackdropEl.classList.contains('open')) {
      const cmdIn = document.getElementById('cmdInput');
      renderCmdList(cmdIn ? cmdIn.value : '');
    }
  }

  applyLanguage(currentLang);

  if (btnToggleLang) {
    btnToggleLang.addEventListener('click', () => {
      const next = currentLang === 'es' ? 'en' : 'es';
      applyLanguage(next);
      showToast(
        next === 'en'
          ? 'Language switched to English'
          : 'Idioma cambiado a Español'
      );
    });
  }

  /* ---------- 3. Desktop Click Handler for tel: Links ---------- */
  const isDesktopNoDialer =
    window.matchMedia('(pointer: fine) and (min-width: 992px)').matches &&
    !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  document.querySelectorAll('a[href^="tel:"]').forEach((telLink) => {
    telLink.addEventListener('click', async (e) => {
      if (!isDesktopNoDialer) return;
      e.preventDefault();
      const rawPhone = '+505 7782-1952';
      try {
        await navigator.clipboard.writeText('+50577821952');
      } catch {
        /* Fallback silently to Toast notice */
      }
      showToast(
        currentLang === 'en'
          ? `Phone copied: ${rawPhone} (Tigo) — Dial from your phone or use Direct WhatsApp`
          : `Número copiado: ${rawPhone} (Tigo) — Marca desde tu móvil o usa WhatsApp Directo`,
        4200
      );
    });
  });

  /* ---------- 4. vCard (.vcf) Generator ---------- */
  function downloadVCard() {
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Albares Soriano;Luis Enrique;;;',
      'FN:Luis Enrique Albares Soriano',
      'TITLE:Systems Engineer - Data Analysis (DRA) | Performance Advisor & Team Leadership',
      'TEL;TYPE=CELL,VOICE:+50577821952',
      'EMAIL;TYPE=INTERNET:luisenrriquealvaressori@gmail.com',
      'ADR;TYPE=WORK:;;El Viejo;Chinandega;;Nicaragua',
      'BDAY:2004-06-23',
      'URL:https://www.linkedin.com/in/luis-enrrique-albares-soriano-55396628b',
      'NOTE:GitHub: https://github.com/luisenrriquealvaressori-cmyk | UNAN-Leon | .NET, Kotlin, Flutter, SQL Server, PostgreSQL, Scrum Project Owner',
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcardLines], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Luis_Enrique_Albares_Soriano.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      currentLang === 'en'
        ? 'Contact card (.vcf) downloaded'
        : 'Tarjeta de contacto (.vcf) descargada'
    );
  }

  ['btnDownloadVcfTop', 'btnHeroSaveVcf', 'btnContactSaveVcf'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', downloadVCard);
  });

  /* ---------- 5. Clipboard Copy ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy');
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        showToast(
          currentLang === 'en'
            ? `Copied: ${value}`
            : `Copiado al portapapeles: ${value}`
        );
      } catch {
        showToast(value);
      }
    });
  });

  /* ---------- 6. Scroll Progress, Navbar & Smart Floating Dock ---------- */
  const progressBar = document.getElementById('scrollProgressBar');
  const navbar = document.getElementById('navbar');
  const btnBackTop = document.getElementById('btnBackTop');
  const floatingDock = document.getElementById('floatingDock');
  const contactSection = document.getElementById('contacto');
  let isContactInView = false;

  function updateScrollState() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && docHeight > 0) {
      progressBar.style.width = `${Math.min(100, (scrollTop / docHeight) * 100)}%`;
    }
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollTop > 24);
    }
    if (btnBackTop) {
      btnBackTop.classList.toggle('visible', scrollTop > 380);
    }
    if (floatingDock) {
      const showDock = scrollTop > 380 && !isContactInView;
      floatingDock.classList.toggle('dock-visible', showDock);
    }
  }

  if (contactSection && 'IntersectionObserver' in window) {
    const contactObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isContactInView = entry.isIntersecting;
          updateScrollState();
        });
      },
      { threshold: 0.12 }
    );
    contactObserver.observe(contactSection);
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  if (btnBackTop) {
    btnBackTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 7. Accessible Mobile Navigation Drawer ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  function setMenuOpen(open) {
    if (!navMenu || !menuToggle) return;
    navMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.className = open ? 'bi bi-x-lg' : 'bi bi-list';
    }
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      setMenuOpen(!isOpen);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('open') &&
        navbar &&
        !navbar.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  /* ---------- 8. Navbar ScrollSpy ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const matches = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', matches);
            if (matches) {
              link.setAttribute('aria-current', 'location');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach((sec) => spyObserver.observe(sec));
  }

  /* ---------- 9. Intersection Observer (Calm Reveal) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- 10. Core Skills Category Filter (with aria-pressed) ---------- */
  const skillBtns = document.querySelectorAll('[data-skill-filter]');
  const skillCards = document.querySelectorAll('[data-skill-cat]');

  skillBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-skill-filter');
      skillBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      skillCards.forEach((card) => {
        const cat = card.getAttribute('data-skill-cat');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden-skill');
          card.classList.add('visible');
        } else {
          card.classList.add('hidden-skill');
        }
      });
    });
  });

  /* ---------- 11. Expandable Architecture Drawers (with aria-expanded) ---------- */
  document.querySelectorAll('[data-toggle-drawer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-toggle-drawer');
      const drawer = document.getElementById(targetId);
      if (!drawer) return;
      const isOpen = drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
      }
    });
  });

  /* ---------- 12. Preload Consulting Topic from Service Cards ---------- */
  const consultTopic = document.getElementById('consultTopic');

  document.querySelectorAll('.select-service-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const svcEs = btn.getAttribute('data-service') || '';
      const svcEn = btn.getAttribute('data-service-en') || svcEs;
      if (consultTopic && svcEs) {
        consultTopic.value = svcEs;
      }
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      const nameInput = document.getElementById('clientName');
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 450);
      }
      showToast(
        currentLang === 'en'
          ? `Selected: ${svcEn}`
          : `Servicio pre-seleccionado: ${svcEs}`
      );
    });
  });

  /* ---------- 13. Visual Validation & Bilingual Form Dispatcher ---------- */
  const consultForm = document.getElementById('consultForm');
  const formFeedback = document.getElementById('formFeedback');
  const btnSendEmailForm = document.getElementById('btnSendEmailForm');
  const requiredFields = ['clientName', 'clientPhone', 'consultBrief']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  requiredFields.forEach((field) => {
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.classList.remove('input-error');
        field.removeAttribute('aria-invalid');
      }
    });
  });

  function buildInquiryPayload() {
    let firstInvalid = null;
    requiredFields.forEach((field) => {
      const empty = !field.value.trim();
      field.classList.toggle('input-error', empty);
      if (empty) {
        field.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = field;
      } else {
        field.removeAttribute('aria-invalid');
      }
    });

    if (firstInvalid) {
      if (formFeedback) {
        formFeedback.classList.remove('ok');
        formFeedback.textContent =
          currentLang === 'en'
            ? 'Please complete the highlighted required fields.'
            : 'Por favor completa los campos obligatorios resaltados.';
      }
      firstInvalid.focus();
      return null;
    }

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const brief = document.getElementById('consultBrief').value.trim();
    const selectedOpt = consultTopic?.options[consultTopic.selectedIndex];
    const topicLabel = selectedOpt
      ? selectedOpt.textContent.trim()
      : consultTopic?.value || '';

    const checkedRadio = document.querySelector(
      'input[name="respChannel"]:checked'
    );
    const channel = checkedRadio
      ? checkedRadio.getAttribute(`data-val-${currentLang}`) ||
        checkedRadio.value
      : currentLang === 'en'
      ? 'Phone call back'
      : 'Llamada telefónica';

    const bodyText =
      currentLang === 'en'
        ? [
            `Hello Eng. Luis Enrique Albares Soriano,`,
            ``,
            `*Project / Consulting Inquiry*`,
            `- Client / Company: ${name}`,
            `- Phone / WhatsApp: ${phone}`,
            `- Topic: ${topicLabel}`,
            `- Preferred response: ${channel}`,
            `- Details: ${brief}`
          ].join('\n')
        : [
            `Hola Ing. Luis Enrique Albares Soriano,`,
            ``,
            `*Solicitud de Proyecto / Consulta Profesional*`,
            `- Cliente / Empresa: ${name}`,
            `- Teléfono / WhatsApp: ${phone}`,
            `- Área de interés: ${topicLabel}`,
            `- Canal preferido de respuesta: ${channel}`,
            `- Detalle: ${brief}`
          ].join('\n');

    return { name, topic: topicLabel, bodyText };
  }

  if (consultForm) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = buildInquiryPayload();
      if (!payload) return;

      if (formFeedback) {
        formFeedback.classList.add('ok');
        formFeedback.textContent =
          currentLang === 'en'
            ? 'Opening WhatsApp (+505 7782-1952) with your brief...'
            : 'Abriendo WhatsApp (+505 7782-1952) con tu consulta armada...';
      }

      const waUrl = `https://wa.me/50577821952?text=${encodeURIComponent(
        payload.bodyText
      )}`;
      window.open(waUrl, '_blank', 'noopener');
    });
  }

  if (btnSendEmailForm) {
    btnSendEmailForm.addEventListener('click', () => {
      const payload = buildInquiryPayload();
      if (!payload) return;

      if (formFeedback) {
        formFeedback.classList.add('ok');
        formFeedback.textContent =
          currentLang === 'en'
            ? 'Opening email client to luisenrriquealvaressori@gmail.com...'
            : 'Abriendo tu cliente de correo hacia luisenrriquealvaressori@gmail.com...';
      }

      const subject =
        currentLang === 'en'
          ? `Consulting Inquiry: ${payload.topic} — ${payload.name}`
          : `Consulta Profesional: ${payload.topic} — ${payload.name}`;
      window.location.href = `mailto:luisenrriquealvaressori@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(payload.bodyText)}`;
    });
  }

  /* ---------- 14. Command Palette (Ctrl+K or /) with Full Keyboard & Focus Trap ---------- */
  const cmdBackdrop = document.getElementById('cmdBackdrop');
  const cmdModal = cmdBackdrop ? cmdBackdrop.querySelector('.cmd-modal') : null;
  const cmdInput = document.getElementById('cmdInput');
  const cmdResults = document.getElementById('cmdResults');
  const btnOpenCmd = document.getElementById('btnOpenCmd');
  const btnCloseCmd = document.getElementById('btnCloseCmd');

  let filteredCmdItems = [];
  let activeCmdIndex = 0;
  let lastFocusedElement = null;

  const cmdItems = [
    {
      icon: 'bi-telephone-fill',
      labelEs: 'Llamar ahora a Luis Enrique (+505 7782-1952)',
      labelEn: 'Call Luis Enrique Now (+505 7782-1952)',
      tag: 'TEL',
      action: () => {
        const heroTel = document.querySelector('.hero-cta-group a[href^="tel:"]');
        if (heroTel) heroTel.click();
        else window.location.href = 'tel:+50577821952';
      }
    },
    {
      icon: 'bi-whatsapp',
      labelEs: 'Abrir chat directo por WhatsApp',
      labelEn: 'Open Direct WhatsApp Chat',
      tag: 'WHATSAPP',
      action: () => {
        window.open(
          'https://wa.me/50577821952?text=Hola%20Ing.%20Luis%20Enrique%20Albares%2C%20vi%20su%20portafolio%20y%20deseo%20consultar%20por%20un%20proyecto.',
          '_blank',
          'noopener'
        );
      }
    },
    {
      icon: 'bi-person-vcard',
      labelEs: 'Descargar tarjeta de contacto (.vcf)',
      labelEn: 'Download Phone Contact (.vcf)',
      tag: 'VCARD',
      action: downloadVCard
    },
    {
      icon: 'bi-file-earmark-pdf',
      labelEs: 'Ver / Imprimir CV Ejecutivo PDF',
      labelEn: 'View / Print Executive PDF Resume',
      tag: 'CV PDF',
      action: () => {
        window.location.href = 'cv.html';
      }
    },
    {
      icon: 'bi-briefcase-fill',
      labelEs: 'Servicios de Consultoría: Análisis DRA, .NET, Flutter, Scrum',
      labelEn: 'Consulting Services: DRA, .NET, Flutter, Scrum',
      tag: '#servicios',
      action: () => {
        document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: 'bi-cpu-fill',
      labelEs: 'Habilidades: SQL Server, PostgreSQL, Kotlin, Docker, Linux',
      labelEn: 'Core Skills: SQL Server, PostgreSQL, Kotlin, Docker, Linux',
      tag: '#habilidades',
      action: () => {
        document.getElementById('habilidades')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: 'bi-building-check',
      labelEs: 'Experiencia: Grupo Coen Agronegocios (>80% mejora) y Claro',
      labelEn: 'Experience: Grupo Coen Agribusiness (>80% faster) & Claro',
      tag: '#experiencia',
      action: () => {
        document.getElementById('experiencia')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: 'bi-layers-fill',
      labelEs: 'Proyectos: AgroStats / PorciCore, Inventario, Tablero IA',
      labelEn: 'Projects: AgroStats / PorciCore, Inventory Manager, AI Dashboard',
      tag: '#proyectos',
      action: () => {
        document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: 'bi-award-fill',
      labelEs: 'UNAN-León, 6 Certificaciones, Rally Nacional y Hackathon 2026',
      labelEn: 'UNAN-León, 6 Certifications, Rally Nacional & Hackathon 2026',
      tag: '#credenciales',
      action: () => {
        document.getElementById('credenciales')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: 'bi-grid-fill',
      labelEs: 'Volver al Portal Digital Maestro',
      labelEn: 'Back to Master Digital Portal',
      tag: 'HUB',
      action: () => {
        window.location.href = '../index.html';
      }
    }
  ];

  function updateActiveCmdOption() {
    if (!cmdResults) return;
    const buttons = cmdResults.querySelectorAll('.cmd-item');
    buttons.forEach((b, idx) => {
      const isAct = idx === activeCmdIndex;
      b.classList.toggle('active', isAct);
      b.setAttribute('aria-selected', isAct ? 'true' : 'false');
      if (isAct) b.scrollIntoView({ block: 'nearest' });
    });
  }

  function renderCmdList(query = '') {
    if (!cmdResults) return;
    const q = query.trim().toLowerCase();
    filteredCmdItems = cmdItems.filter((item) => {
      const txt = `${item.labelEs} ${item.labelEn} ${item.tag}`.toLowerCase();
      return !q || txt.includes(q);
    });
    activeCmdIndex = 0;
    cmdResults.innerHTML = '';

    if (filteredCmdItems.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'cmd-empty';
      emptyEl.textContent =
        currentLang === 'en'
          ? 'No matches found — Call directly at +505 7782-1952'
          : 'Sin coincidencias — Llama directo al +505 7782-1952';
      cmdResults.appendChild(emptyEl);
      return;
    }

    filteredCmdItems.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = idx === 0 ? 'cmd-item active' : 'cmd-item';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      const label = currentLang === 'en' ? item.labelEn : item.labelEs;
      btn.innerHTML = `
        <span class="cmd-item-left">
          <i class="bi ${item.icon}" aria-hidden="true"></i>
          <span>${label}</span>
        </span>
        <span class="cmd-item-tag">${item.tag}</span>
      `;
      btn.addEventListener('click', () => {
        closeCmd();
        item.action();
      });
      cmdResults.appendChild(btn);
    });
  }

  function openCmd() {
    if (!cmdBackdrop) return;
    lastFocusedElement = document.activeElement;
    cmdBackdrop.classList.add('open');
    renderCmdList('');
    if (cmdInput) {
      cmdInput.value = '';
      setTimeout(() => cmdInput.focus(), 40);
    }
  }

  function closeCmd() {
    if (!cmdBackdrop) return;
    cmdBackdrop.classList.remove('open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }

  if (btnOpenCmd) btnOpenCmd.addEventListener('click', openCmd);
  if (btnCloseCmd) btnCloseCmd.addEventListener('click', closeCmd);
  if (cmdBackdrop) {
    cmdBackdrop.addEventListener('click', (e) => {
      if (e.target === cmdBackdrop) closeCmd();
    });
  }
  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => renderCmdList(e.target.value));
    cmdInput.addEventListener('keydown', (e) => {
      if (filteredCmdItems.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeCmdIndex = (activeCmdIndex + 1) % filteredCmdItems.length;
        updateActiveCmdOption();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeCmdIndex =
          (activeCmdIndex - 1 + filteredCmdItems.length) %
          filteredCmdItems.length;
        updateActiveCmdOption();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const chosen = filteredCmdItems[activeCmdIndex];
        if (chosen) {
          closeCmd();
          chosen.action();
        }
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    const isOpen = cmdBackdrop?.classList.contains('open');

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isOpen) closeCmd();
      else openCmd();
    } else if (!typing && !isOpen && e.key === '/') {
      e.preventDefault();
      openCmd();
    } else if (isOpen && e.key === 'Escape') {
      e.preventDefault();
      closeCmd();
    } else if (isOpen && e.key === 'Tab' && cmdModal) {
      const focusable = Array.from(
        cmdModal.querySelectorAll('button, input, [href]')
      ).filter((el) => !el.disabled);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
});
