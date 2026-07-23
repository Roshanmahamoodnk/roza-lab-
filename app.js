document.documentElement.classList.add('js');

const root = document.documentElement;
const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

document.querySelectorAll('.topnav a').forEach((link) => {
  const href = (link.getAttribute('href') || '').toLowerCase();
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

const revealTargets = document.querySelectorAll(
  '.hero-copy, .hero-art, .section-head, .card, .menu-card, .quote-panel, .kpi-panel, .panel, .form-panel, .feature-row, .story-line, .atlas-card, .roadmap-item, .chat-bubble, .image-frame, .diagram-shell, .logo-card, .palette-swatch, .process-step, .slot, .summary-card, .technique-card, .data-table'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
);

revealTargets.forEach((el) => observer.observe(el));

window.addEventListener('pointermove', (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  root.style.setProperty('--mx', `${x.toFixed(2)}%`);
  root.style.setProperty('--my', `${y.toFixed(2)}%`);
});

window.addEventListener('pointerleave', () => {
  root.style.setProperty('--mx', '50%');
  root.style.setProperty('--my', '20%');
});

const ticker = document.querySelector('.ticker-track');
if (ticker && ticker.parentElement) {
  ticker.parentElement.appendChild(ticker.cloneNode(true));
}

const escapeHTML = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildBubble = (role, text) => {
  const bubble = document.createElement('article');
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = `<span class="chat-label">${role === 'user' ? 'You' : 'Rozalab studio'}</span><p>${text}</p>`;
  return bubble;
};

const consoleResponses = [
  {
    match: ['pair', 'pairing', 'atlas', 'mango', 'lychee', 'rose'],
    title: 'Pairing system',
    summary:
      'Rozalab should present Carino with four clear pairing lanes: floral, tropical, roasted, and dessert-led. Each lane needs a hero combination, a fallback, and one rejected idea so the client sees real judgment, not a random flavor list.',
    metrics: ['4 lanes', '1 hero SKU', '1 rejected pair', 'sensory logic'],
    bullets: [
      'Keep lychee + rosewater as the quiet premium signal.',
      'Use mango + passionfruit when the brief needs brightness and recall.',
      'Leave black sesame + vanilla out of the core set because the contrast is too flat.'
    ]
  },
  {
    match: ['sku', 'menu', 'flavor', 'recipe', 'yuzu', 'cheesecake'],
    title: 'SKU development',
    summary:
      'The site should make every SKU feel intentional: a name, a sensory idea, a method, and a service format. For Carino, the hero should read premium, the signature line should stay concise, and the launch menu should stay commercially narrow.',
    metrics: ['hero SKU', 'signature line', 'short menu', 'clear method'],
    bullets: [
      'Yuzu Cloud Cheesecake is the strongest hero because it balances brightness with creaminess.',
      'Lychee Rose Signal adds a softer emotional register to the range.',
      'Saffron Pistachio Prime gives the brand a luxury anchor without needing heavy styling.'
    ]
  },
  {
    match: ['sop', 'ccp', 'process', 'make', 'method', 'prep', 'temperature'],
    title: 'Process discipline',
    summary:
      'The production story should be visible from first weigh-in to final hardening: sanitize, blend, pasteurize, age, flavour, churn, harden, and store. That sequence is the proof that the studio is serious.',
    metrics: ['82–85°C', '4°C ageing', 'cold chain', 'CCP log'],
    bullets: [
      'Temperature control is a design choice, not just a food-safety task.',
      'The client should see where the product is protected from drift.',
      'Every handoff needs a small checklist so the quality stays repeatable.'
    ]
  },
  {
    match: ['scale', 'qsr', 'manufacturing', 'factory', 'partner'],
    title: 'Scale path',
    summary:
      'Rozalab needs to show how an idea moves from bench testing to pilot batches, then to a manufacturing partner or a QSR-ready service model. The story should feel strategic, not just operational.',
    metrics: ['4 stages', 'pilot ready', 'partner handoff', 'repeatable'],
    bullets: [
      'Sample development should be shown as a disciplined decision process.',
      'Pilot production needs stable recipes and a visible QC routine.',
      'QSR growth only works if the menu gets tighter, not wider.'
    ]
  },
  {
    match: ['brand', 'vision', 'logo', 'type', 'visual', 'motion'],
    title: 'Visual system',
    summary:
      'The site should feel like a real studio identity: a strong wordmark, a calm layout, premium motion, and imagery that looks art-directed rather than generated. Every page should share the same visual grammar.',
    metrics: ['wordmark', 'type', 'motion', 'system'],
    bullets: [
      'Use one logo language across header, footer, and section labels.',
      'Keep the pages editorial and content-first instead of template-like.',
      'Let the motion support the story, not compete with it.'
    ]
  },
  {
    match: [],
    title: 'Research overview',
    summary:
      'Rozalab is a premium ice cream R&D studio for Carino. The site should prove the work: pairing direction, formulation logic, process discipline, and launch readiness, all presented like a polished research desk.',
    metrics: ['research', 'bench', 'process', 'launch'],
    bullets: [
      'Make the client understand why each recommendation exists.',
      'Keep the content specific enough to feel credible and luxurious.',
      'Treat the website itself as a deliverable from the studio.'
    ]
  }
];

const pickConsoleResponse = (query) => {
  const normalized = query.toLowerCase();
  return consoleResponses.find((item) => item.match.some((term) => normalized.includes(term))) || consoleResponses[consoleResponses.length - 1];
};

const consoleRoot = document.querySelector('[data-lab-console]');
if (consoleRoot) {
  const log = document.querySelector('[data-lab-log]');
  const title = document.querySelector('[data-lab-title]');
  const summary = document.querySelector('[data-lab-summary]');
  const metric1 = document.querySelector('[data-lab-metric-1]');
  const metric2 = document.querySelector('[data-lab-metric-2]');
  const metric3 = document.querySelector('[data-lab-metric-3]');
  const metric4 = document.querySelector('[data-lab-metric-4]');
  const points = document.querySelector('[data-lab-points]');
  const input = document.querySelector('[data-lab-input]');
  const form = document.querySelector('[data-lab-form]');
  const promptButtons = document.querySelectorAll('[data-lab-prompt]');

  const renderResponse = (query) => {
    const response = pickConsoleResponse(query);

    if (log) {
      log.innerHTML = '';
      log.appendChild(buildBubble('user', escapeHTML(query)));

      const assistant = document.createElement('article');
      assistant.className = 'chat-bubble assistant';
      assistant.innerHTML = `
        <span class="chat-label">Rozalab studio</span>
        <p>${escapeHTML(response.summary)}</p>
        <ul class="detail-list" style="margin-top:12px;">
          ${response.bullets.map((bullet) => `<li>${escapeHTML(bullet)}</li>`).join('')}
        </ul>
      `;
      log.appendChild(assistant);
    }

    if (title) title.textContent = response.title;
    if (summary) summary.textContent = response.summary;
    if (metric1) metric1.textContent = response.metrics[0] || '—';
    if (metric2) metric2.textContent = response.metrics[1] || '—';
    if (metric3) metric3.textContent = response.metrics[2] || '—';
    if (metric4) metric4.textContent = response.metrics[3] || '—';
    if (points) {
      points.innerHTML = response.bullets.map((bullet) => `<li>${escapeHTML(bullet)}</li>`).join('');
    }
  };

  promptButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const query = button.getAttribute('data-lab-prompt') || '';
      if (input) input.value = query;
      renderResponse(query);
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input?.value.trim();
    if (!query) return;
    renderResponse(query);
    if (input) input.value = '';
  });

  renderResponse('Show the pairing logic and explain it to Carino in client-friendly language.');
}

const atlasToolbar = document.querySelector('[data-atlas-toolbar]');
if (atlasToolbar) {
  const buttons = atlasToolbar.querySelectorAll('[data-atlas-filter]');
  const cards = document.querySelectorAll('[data-cluster]');

  const applyFilter = (filter) => {
    cards.forEach((card) => {
      const match = filter === 'all' || card.getAttribute('data-cluster') === filter;
      card.classList.toggle('is-hidden', !match);
    });
    buttons.forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-atlas-filter') === filter);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.getAttribute('data-atlas-filter') || 'all');
    });
  });

  applyFilter('all');
}

const orderForm = document.querySelector('[data-order-form]');
if (orderForm) {
  const summary = document.querySelector('[data-order-summary]');
  const fields = orderForm.querySelectorAll('input, select, textarea');

  const updateSummary = () => {
    if (!summary) return;
    const name = orderForm.querySelector('[name="name"]')?.value?.trim() || 'Guest';
    const flavor = orderForm.querySelector('[name="flavor"]')?.value || 'Choose a flavor';
    const occasion = orderForm.querySelector('[name="occasion"]')?.value || 'No occasion selected';
    const pickup = orderForm.querySelector('[name="time"]')?.value || 'Pickup time pending';
    const quantity = orderForm.querySelector('[name="quantity"]')?.value || '1';

    summary.innerHTML = `
      <strong>${escapeHTML(name)}</strong>
      <p>${escapeHTML(quantity)} item(s) · ${escapeHTML(flavor)} · ${escapeHTML(occasion)} · ${escapeHTML(pickup)}</p>
    `;
  };

  fields.forEach((field) => field.addEventListener('input', updateSummary));
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateSummary();
  });
  updateSummary();
}
