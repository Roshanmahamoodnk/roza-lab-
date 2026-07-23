document.documentElement.classList.add('js');

const revealTargets = document.querySelectorAll(
  '.hero-copy, .hero-art, .section-head, .card, .menu-card, .price-card, .quote-panel, .timeline, .kpi-panel, .form-panel, .footer, .feature-row, .story-line, .panel, .lab-step, .diagram-shell, .agent-shell, .atlas-card, .roadmap-item, .chat-bubble, .image-frame'
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

const root = document.documentElement;
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

const buildBubble = (role, text) => {
  const bubble = document.createElement('article');
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = `<span class="chat-label">${role === 'user' ? 'You' : 'Rozalab agent'}</span><p>${text}</p>`;
  return bubble;
};

const cleanText = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const agentResponses = [
  {
    match: ['pair', 'pairing', 'atlas', 'mango', 'lychee', 'rose'],
    title: 'Pairing atlas',
    summary:
      'The best starting point is the pairing map: floral for delicate premium scoops, tropical for bright summer energy, roasted for depth, and dessert pairings for the most commercial fusion ideas.',
    metrics: ['6', '4', '7', '1'],
    bullets: [
      'Lychee + rosewater and mango + passionfruit are the strongest confidence pairs.',
      'Keep black sesame + vanilla out of the core menu because the contrast is too weak.',
      'The atlas should show why each pair feels premium, not just whether it is trendy.'
    ]
  },
  {
    match: ['sku', 'menu', 'flavor', 'recipe', 'yuzu', 'cheesecake'],
    title: 'SKU development',
    summary:
      'I can turn the pairing logic into a sellable SKU: ingredients, prep method, time-to-make, and the premium positioning the client should see on the site.',
    metrics: ['4', '18 min', '1', 'premium'],
    bullets: [
      'Yuzu Cloud Cheesecake works as the hero SKU because it reads clean, bright, and expensive.',
      'Lychee Rose Signal is the emotional / floral option for a softer premium story.',
      'Every SKU card should show method, prep time, and service style so the client sees the development logic.'
    ]
  },
  {
    match: ['sop', 'ccp', 'process', 'make', 'method', 'prep', 'temperature'],
    title: 'Production method',
    summary:
      'The method should be visible from base to service: sanitize, blend, pasteurize, age, flavour, churn, harden, and serve at the correct temperature.',
    metrics: ['5', '82-85°C', '4°C', '-12 to -15°C'],
    bullets: [
      'SOP keeps the product consistent across samples and future manufacturing.',
      'CCPs should track temperature, holding time, sanitation, and batch integrity.',
      'The website should make the method feel rigorous but still easy to understand.'
    ]
  },
  {
    match: ['machine', 'equipment', 'capex', 'invest', 'freezer', 'pasteurizer'],
    title: 'Equipment stack',
    summary:
      'The core stack is compact: pasteurizer, batch freezer, blast freezer, dipping cabinet, scales, thermometers, and QC tools. That is enough to prototype and scale smartly.',
    metrics: ['6', 'core', 'qc', 'capex'],
    bullets: [
      'Separate must-have equipment from nice-to-have expansion items.',
      'The client should see the investment logic, not just a shopping list.',
      'Show how the same stack supports sampling, pilot runs, and repeat production.'
    ]
  },
  {
    match: ['scale', 'qsr', 'manufacturing', 'factory', 'partner'],
    title: 'Scale path',
    summary:
      'The story should move from sample development to pilot production to manufacturing tie-in, then finally to a QSR-ready service model without losing flavor quality.',
    metrics: ['3', 'pilot', 'partner', 'qsr'],
    bullets: [
      'Each stage needs its own quality gate and handoff notes.',
      'Manufacturing partners should receive stable recipes and a clear SOP pack.',
      'QSR growth works only if the menu is deliberately limited and repeatable.'
    ]
  },
  {
    match: [],
    title: 'Research overview',
    summary:
      'Rozalab is a premium ice cream research studio. It should show what is being studied now, what has been approved, and what can be scaled with confidence.',
    metrics: ['now', 'study', 'build', 'scale'],
    bullets: [
      'Show pairing logic, not just the final menu.',
      'Show sample development and the reason each decision was made.',
      'Keep the presentation premium, scientific, and easy to trust.'
    ]
  }
];

const pickAgentResponse = (query) => {
  const normalized = query.toLowerCase();
  return (
    agentResponses.find((item) => item.match.some((term) => normalized.includes(term))) ||
    agentResponses[agentResponses.length - 1]
  );
};

const agentConsole = document.querySelector('[data-agent-console]');
if (agentConsole) {
  const log = document.querySelector('[data-agent-log]');
  const title = document.querySelector('[data-agent-title]');
  const summary = document.querySelector('[data-agent-summary]');
  const metric1 = document.querySelector('[data-agent-metric-1]');
  const metric2 = document.querySelector('[data-agent-metric-2]');
  const metric3 = document.querySelector('[data-agent-metric-3]');
  const metric4 = document.querySelector('[data-agent-metric-4]');
  const points = document.querySelector('[data-agent-points]');
  const input = document.querySelector('[data-agent-input]');
  const form = document.querySelector('[data-agent-form]');
  const promptButtons = document.querySelectorAll('[data-agent-prompt]');

  const renderResponse = (query) => {
    const response = pickAgentResponse(query);

    if (log) {
      log.innerHTML = '';
      log.appendChild(buildBubble('user', cleanText(query)));
      const assistant = document.createElement('article');
      assistant.className = 'chat-bubble assistant';
      assistant.innerHTML = `
        <span class="chat-label">Rozalab agent</span>
        <p>${cleanText(response.summary)}</p>
        <ul class="detail-list" style="margin-top:12px;">
          ${response.bullets.map((bullet) => `<li>${cleanText(bullet)}</li>`).join('')}
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
      points.innerHTML = response.bullets.map((bullet) => `<li>${cleanText(bullet)}</li>`).join('');
    }
  };

  promptButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const query = button.getAttribute('data-agent-prompt') || '';
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

  renderResponse('Show me the pairing map and how Rozalab should explain it to a client.');
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
    const quantity = orderForm.querySelector('[name="quantity"]')?.value || '1';
    summary.innerHTML = `<strong>${cleanText(name)}</strong><p>${quantity} item(s) · ${cleanText(flavor)} · ${cleanText(occasion)}</p>`;
  };
  fields.forEach((field) => field.addEventListener('input', updateSummary));
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateSummary();
  });
  updateSummary();
}
