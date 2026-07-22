document.documentElement.classList.add('js');

const revealTargets = document.querySelectorAll('.hero-copy, .hero-art, .section-head, .card, .menu-card, .price-card, .quote-panel, .timeline, .kpi-panel, .footer');
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
  { threshold: 0.16, rootMargin: '0px 0px -10% 0px' }
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

const marquee = document.querySelector('.ticker-track');
if (marquee) {
  const clone = marquee.cloneNode(true);
  marquee.parentElement.appendChild(clone);
}
