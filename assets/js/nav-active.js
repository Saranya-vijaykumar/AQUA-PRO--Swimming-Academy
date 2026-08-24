(() => {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a[href]').forEach(a => {
    const href = a.getAttribute('href').split('#')[0].split('?')[0].toLowerCase();
    if (!href || href.startsWith('http') || href === '#') return;
    if (href === current) {
      a.classList.add('nav-current');
      a.style.color = '#0284c7';
      a.style.fontWeight = '800';
      a.setAttribute('aria-current', 'page');
    }
  });
})();
