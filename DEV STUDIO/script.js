/**
 * DEV STUDIO - JAVASCRIPT PRINCIPAL
 * Terminal Interactivo, Calculadora de Arquitectura, Filtros y Telemetría
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
        <div class="terminal-line"><span class="t-cmd">catalog</span>      - Explore our production-ready software blueprints</div>
        <div class="terminal-line"><span class="t-cmd">stack</span>        - Inspect our enterprise technology matrix</div>
        <div class="terminal-line"><span class="t-cmd">status</span>       - Check system latency, cluster health and SLA</div>
        <div class="terminal-line"><span class="t-cmd">security</span>     - View SOC2, encryption & zero-debt protocols</div>
        <div class="terminal-line"><span class="t-cmd">services</span>     - List core software engineering capabilities</div>
        <div class="terminal-line"><span class="t-cmd">cases</span>        - Display featured client architectures</div>
        <div class="terminal-line"><span class="t-cmd">hub</span>          - Connect to the 5 business websites in the ecosystem</div>
        <div class="terminal-line"><span class="t-cmd">quote</span>        - Jump to the interactive sprint & architecture estimator</div>
        <div class="terminal-line"><span class="t-cmd">contact</span>      - Get direct developer line & PGP key</div>
        <div class="terminal-line"><span class="t-cmd">clear</span>        - Clear terminal output screen
      `,
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
        <div class="terminal-line t-success">[SECURITY & COMPLIANCE] Verification Matrix:</div>
        <div class="terminal-line">&bull; SOC 2 Type II: Continuous compliance audit pipeline</div>
        <div class="terminal-line">&bull; OWASP Top 10: Zero injection flaws, sanitized inputs & CSRF tokens</div>
        <div class="terminal-line">&bull; Data Encryption: AES-256 GCM at Rest / Strict TLS 1.3 in Transit</div>
        <div class="terminal-line">&bull; CI/CD Pipeline: Automated SAST (SonarQube) & Dependency Vulnerability Scans</div>
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
        <div class="terminal-line t-success">[CLUSTER OK] Production Health Telemetry:</div>
        <div class="terminal-line">&bull; Ping: 12.4ms (US-Central Edge)</div>
        <div class="terminal-line">&bull; API Availability: 99.998% Uptime</div>
        <div class="terminal-line">&bull; Memory Heap: 284MB / 2048MB (Healthy)</div>
        <div class="terminal-line">&bull; Active Security Scan: 0 Critical, 0 High Vulnerabilities</div>
        <div class="terminal-line">&bull; Encryption: TLS 1.3 Strict / AES-256 GCM at Rest</div>
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
        <div class="terminal-line t-info">[CASE STUDIES] High-Scale Deployments:</div>
        <div class="terminal-line">&bull; FinEdge Core: 50,000 req/sec FinTech transaction engine</div>
        <div class="terminal-line">&bull; LogiTrack Cloud: 18ms real-time satellite telemetry for 850 trucks</div>
        <div class="terminal-line">&bull; HealthSync EMR: HIPAA-compliant hospital electronic medical records</div>
        <div class="terminal-line">&bull; AgroStream AI: +94% harvest accuracy with satellite vision</div>
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
        <div class="terminal-line">&bull; Email: engineering@devstudio.com</div>
        <div class="terminal-line">&bull; Location: Central America / Global Remote Engineering</div>
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
  const specDurationText = document.getElementById('specDurationText');
  const specInvestmentText = document.getElementById('specInvestmentText');
  const btnExportSpecWsp = document.getElementById('btnExportSpecWsp');

  const stackPresets = {
    web: 'Next.js 15 + TypeScript + PostgreSQL',
    mobile: 'Flutter + .NET 9 API + Redis Cache',
    api: '.NET 9 / Go + RabbitMQ + Docker K8s',
    suite: '.NET 9 + Next.js + Flutter + AWS Cloud'
  };

  function calculateArchitecture() {
    let baseWeeks = 4;
    let basePrice = 2800;
    let platformName = 'Plataforma Web SaaS';
    let platformKey = 'web';

    techTypeRadios.forEach(radio => {
      if (radio.checked) {
        baseWeeks = parseInt(radio.dataset.weeks, 10);
        basePrice = parseFloat(radio.dataset.price);
        platformName = radio.dataset.name;
        platformKey = radio.value;
      }
    });

    let scaleMultiplier = 1.0;
    let scaleName = 'Fase Inicial (MVP)';
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

    const priceMin = Math.round((basePrice * scaleMultiplier) + extraPrice);
    const priceMax = Math.round(priceMin * 1.25);

    // Update UI elements
    if (specPlatformName) specPlatformName.textContent = platformName;
    if (specScaleName) specScaleName.textContent = scaleName;
    if (specStack) specStack.textContent = stackPresets[platformKey] || '.NET 9 + TypeScript';

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

    if (specInvestmentText) {
      specInvestmentText.textContent = `Inversión: $${priceMin.toLocaleString()} - $${priceMax.toLocaleString()} USD`;
    }

    // Dynamic WhatsApp Action
    if (btnExportSpecWsp) {
      const specPayload = `*SOLICITUD DE ESPECIFICACIÓN TÉCNICA - DEV STUDIO*\n\n` +
        `💻 *Plataforma:* ${platformName}\n` +
        `📈 *Escala:* ${scaleName}\n` +
        `⚙️ *Stack Base:* ${stackPresets[platformKey]}\n` +
        (modulesList.length > 0 ? `🧩 *Módulos Críticos:* ${modulesList.join(', ')}\n` : '') +
        `⏱ *Tiempo Proyectado:* ${totalWeeksMin}-${totalWeeksMax} semanas (${totalSprints} sprints ágiles)\n` +
        `💼 *Inversión Orientativa:* $${priceMin.toLocaleString()} - $${priceMax.toLocaleString()} USD\n\n` +
        `Deseo agendar una llamada de descubrimiento con el Solution Architect.`;

      btnExportSpecWsp.onclick = () => {
        window.open(`https://wa.me/50585574484?text=${encodeURIComponent(specPayload)}`, '_blank');
      };
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

  // 7. Request for Proposal (RFP) Form Submission
  const rfpForm = document.getElementById('rfpForm');
  const rfpFeedback = document.getElementById('rfpFeedback');

  if (rfpForm) {
    rfpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('rfpNombre').value.trim();
      const email = document.getElementById('rfpEmail').value.trim();
      const tel = document.getElementById('rfpTel').value.trim();
      const tipoSelect = document.getElementById('rfpTipo');
      const tipoText = tipoSelect.options[tipoSelect.selectedIndex].text;
      const descripcion = document.getElementById('rfpDescripcion').value.trim();

      if (!nombre || !email || !tel) {
        alert('Por favor completa todos los campos requeridos (*).');
        return;
      }

      if (rfpFeedback) {
        rfpFeedback.classList.add('show');
        rfpFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const rfpMessage = `*NUEVA SOLICITUD DE RFP - DEV STUDIO*\n\n` +
        `👤 *Contacto:* ${nombre}\n` +
        `📧 *Email Corporativo:* ${email}\n` +
        `📱 *Teléfono:* ${tel}\n` +
        `📦 *Tipo de Sistema:* ${tipoText}\n` +
        `📝 *Requerimiento:* ${descripcion || 'Evaluación de arquitectura inicial'}`;

      setTimeout(() => {
        const confirmWsp = confirm('¿Deseas enviar este requerimiento técnico directamente al Solution Architect por WhatsApp?');
        if (confirmWsp) {
          window.open(`https://wa.me/50585574484?text=${encodeURIComponent(rfpMessage)}`, '_blank');
        }
        rfpForm.reset();
      }, 700);
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
        'Módulos incluidos: Facturación electrónica, Compras, Inventario multi-sucursal, Cuentas por Cobrar/Pagar y Bancos.',
        'Módulo de exportación directa a Excel y PDF con formatos tributarios de Nicaragua.',
        'Documentación técnica Swagger / OpenAPI y manual de usuario para el personal administrativo.',
        'Entorno de Staging (pruebas) y Producción configurados con respaldos automatizados diarios.'
      ],
      garantia: '6 meses de garantía técnica ante defectos de software y soporte prioritario en horario laboral.',
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
      sla: '99.99% de disponibilidad',
      stack: ['NestJS / TypeScript', 'Next.js 14 App Router', 'PostgreSQL (Multi-Schema)', 'Stripe / PixelPay', 'AWS ECS Fargate'],
      resumen: 'Blueprint cloud-native diseñado para fundadores y empresas que buscan lanzar un producto digital por suscripción mensual o anual. Resuelve desde el día uno el aislamiento de datos entre clientes y la facturación recurrente.',
      arquitectura: [
        'Aislamiento de datos tipo Schema-per-Tenant para máxima privacidad, rendimiento y facilidad de auditoría.',
        'Next.js 14 con Server Actions y Server-Side Rendering para un rendimiento de carga sub-segundo.',
        'Colas de procesamiento asíncrono con BullMQ y Redis para envío masivo de correos y generación de PDFs.',
        'Despliegue serverless o en contenedores elásticos con autoescalado automático según tráfico.'
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
      stack: ['Flutter 3.x / Dart', 'SQLite / Drift ORM', 'Node.js / Express API', 'Firebase Cloud Messaging', 'OpenStreetMap / Google Maps'],
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
      garantia: 'Aprobación garantizada en las tiendas oficiales de apps y 6 meses de soporte técnico continuo.',
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
        'Checkout seguro integrado a bancos de Nicaragua cumpliendo normativas PCI-DSS.',
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
                <i class="bi bi-shield-check text-green me-1"></i> SLA: ${data.sla}
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
              <button type="button" class="btn btn-secondary" id="btnCerrarDevModalInterno">
                <i class="bi bi-x-lg me-1"></i> Cerrar
              </button>
            </div>
          `;

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

  // Dossier Whitepaper Link Handler (Natural navigation to blueprints.html)
  // Cleanly opens blueprints.html without intrusive alert
});
