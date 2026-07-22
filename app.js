document.documentElement.classList.add('js');

const revealTargets = document.querySelectorAll('.hero-copy, .hero-art, .section-head, .card, .menu-card, .price-card, .quote-panel, .timeline, .kpi-panel, .form-panel, .footer, .feature-row, .story-line');
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
    summary.innerHTML = `<strong>${name}</strong><p>${quantity} item(s) · ${flavor} · ${occasion}</p>`;
  };
  fields.forEach((field) => field.addEventListener('input', updateSummary));
  updateSummary();
}
