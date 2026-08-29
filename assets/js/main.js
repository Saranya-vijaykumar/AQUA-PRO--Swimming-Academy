/**
 * AquaPro - Swimming Academy & Aquatic Center Core JavaScript
 * Author: ThemeCraft Studio
 * Version: 1.1.0
 * 100% Fully Functional: Theme, RTL, Filter Engine, Modals, Drawer, Schedule Tables
 */

(function () {
  'use strict';

  // --- 1. Theme Manager (Dark / Light Mode) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('aquapro_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      updateThemeIcons(true);
    } else {
      document.documentElement.classList.remove('dark');
      updateThemeIcons(false);
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('aquapro_theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
    if (window.showToast) {
      window.showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'info');
    }
  }

  function updateThemeIcons(isDark) {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const sunIcon = btn.querySelector('.sun-icon');
      const moonIcon = btn.querySelector('.moon-icon');
      const label = btn.querySelector('.theme-label');
      if (sunIcon && moonIcon) {
        if (isDark) {
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
          if (label) label.textContent = 'Light';
        } else {
          sunIcon.classList.add('hidden');
          moonIcon.classList.remove('hidden');
          if (label) label.textContent = 'Dark';
        }
      }
    });
  }

  document.addEventListener('click', (e) => {
    const themeBtn = e.target.closest('.theme-toggle-btn');
    if (themeBtn) {
      e.preventDefault();
      toggleTheme();
    }
  });

  // --- 2. RTL Engine (Right-To-Left) ---
  function initRTL() {
    const savedRTL = localStorage.getItem('aquapro_direction');
    if (savedRTL === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
      updateRTLBtns(true);
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      updateRTLBtns(false);
    }
  }

  function toggleRTL() {
    const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
    const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', newDir);
    localStorage.setItem('aquapro_direction', newDir);
    updateRTLBtns(newDir === 'rtl');
    if (window.showToast) {
      window.showToast(`Switched Layout to ${newDir.toUpperCase()}`, 'info');
    }
  }

  function updateRTLBtns(isRTL) {
    document.querySelectorAll('.rtl-toggle-btn').forEach(btn => {
      const textSpan = btn.querySelector('.rtl-text');
      if (textSpan) textSpan.textContent = isRTL ? 'LTR' : 'RTL';
    });
  }

  document.addEventListener('click', (e) => {
    const rtlBtn = e.target.closest('.rtl-toggle-btn');
    if (rtlBtn) {
      e.preventDefault();
      toggleRTL();
    }
  });

  // Run theme and RTL initializers immediately
  initTheme();
  initRTL();

  // --- 3. Mobile Navigation Drawer ---
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  function openMobileMenu() {
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      mobileMenuDrawer.classList.remove('translate-x-full', '-translate-x-full');
      mobileMenuDrawer.classList.add('translate-x-0');
      mobileMenuBackdrop.classList.remove('opacity-0', 'pointer-events-none');
      mobileMenuBackdrop.classList.add('opacity-100', 'pointer-events-auto');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      mobileMenuDrawer.classList.remove('translate-x-0');
      mobileMenuDrawer.classList.add(isRTL ? '-translate-x-full' : 'translate-x-full');
      mobileMenuBackdrop.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenuBackdrop.classList.add('opacity-0', 'pointer-events-none');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

  // --- 3b. Responsive hamburger for template pages using the mini navigation ---
  document.querySelectorAll('.mini-nav').forEach((nav) => {
    const shell = nav.querySelector('.shell');
    const links = nav.querySelector('.links');
    if (!shell || !links || nav.querySelector('.mobile-nav-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-nav-toggle';
    button.setAttribute('aria-label', 'Open navigation menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span aria-hidden="true">☰</span>';
    const actions = nav.querySelector('.nav-actions');
    if (actions) actions.appendChild(button); else shell.appendChild(button);
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('mobile-open');
      button.setAttribute('aria-expanded', String(open));
      button.innerHTML = open ? '<span aria-hidden="true">✕</span>' : '<span aria-hidden="true">☰</span>';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('mobile-open')));
  });

  // Close the main mobile drawer after selecting a page
  if (mobileMenuDrawer) mobileMenuDrawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));

  // --- 4. Dynamic Programs Filter Engine ---
  const filterBtns = document.querySelectorAll('[data-program-filter]');
  const programCards = document.querySelectorAll('[data-program-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-program-filter');

      // Update button visual styles
      filterBtns.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      btn.classList.add('bg-sky-500', 'text-white', 'shadow-md');

      // Filter cards smoothly
      programCards.forEach(card => {
        const categories = (card.getAttribute('data-program-category') || '').split(',');
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => card.classList.add('hidden'), 200);
        }
      });
    });
  });

  // --- 5. Batch Timings Schedule Table Filter ---
  const scheduleDayFilter = document.getElementById('schedule-day-filter');
  const scheduleLevelFilter = document.getElementById('schedule-level-filter');
  const scheduleTable = document.getElementById('batch-schedule-table');

  function filterScheduleTable() {
    if (!scheduleTable) return;
    const selectedDay = scheduleDayFilter ? scheduleDayFilter.value.toLowerCase() : 'all';
    const selectedLevel = scheduleLevelFilter ? scheduleLevelFilter.value.toLowerCase() : 'all';
    const rows = scheduleTable.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const rowDay = (row.getAttribute('data-day') || '').toLowerCase();
      const rowLevel = (row.getAttribute('data-level') || '').toLowerCase();

      const matchesDay = selectedDay === 'all' || rowDay.includes(selectedDay);
      const matchesLevel = selectedLevel === 'all' || rowLevel === selectedLevel;

      if (matchesDay && matchesLevel) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (scheduleDayFilter) scheduleDayFilter.addEventListener('change', filterScheduleTable);
  if (scheduleLevelFilter) scheduleLevelFilter.addEventListener('change', filterScheduleTable);

  // --- 6. Accordion Handlers ---
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.accordion-icon');
      const isOpen = content.classList.contains('active');

      if (!isOpen) {
        content.classList.remove('hidden');
        content.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        if (icon) icon.classList.add('rotate-180');
      } else {
        content.classList.remove('active');
        content.style.maxHeight = null;
        content.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
      }
    });
  });

  // --- 7. Sticky Header Shadow ---
  const mainHeader = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (mainHeader) {
      if (window.scrollY > 20) {
        mainHeader.classList.add('shadow-md', 'py-3');
        mainHeader.classList.remove('py-4');
      } else {
        mainHeader.classList.remove('shadow-md', 'py-3');
        mainHeader.classList.add('py-4');
      }
    }
  });

  // --- 11. Interactive Button Click Ripple Animation ---
  function initInteractiveWaterRipples() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-water-ripple, .interactive-ripple');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('interactive-ripple-wave');

      const existingRipple = btn.querySelector('.interactive-ripple-wave');
      if (existingRipple) existingRipple.remove();

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initRTL();
    initBubbles();
    initScrollReveal();
    initCounters();
    initInteractiveWaterRipples();
  });


  // --- 7. Watch Video Modal with 3 AI Swimming Video Playlist ---
  const videoModal = document.getElementById('video-modal');
  const watchVideo = document.getElementById('aquapro-watch-video');
  const videoTitleElem = document.getElementById('aquapro-video-title');
  const videoDescElem = document.getElementById('aquapro-video-desc');
  const openVideoButtons = document.querySelectorAll('[data-open-video]');
  const closeVideoButtons = document.querySelectorAll('[data-close-video]');
  const videoPlaylistItems = document.querySelectorAll('[data-video-item]');

  function playSelectedVideo(src, title, desc, poster) {
    if (!watchVideo) return;
    watchVideo.pause();
    watchVideo.src = src;
    if (poster) watchVideo.poster = poster;
    if (videoTitleElem && title) videoTitleElem.textContent = title;
    if (videoDescElem && desc) videoDescElem.textContent = desc;
    watchVideo.load();
    const playPromise = watchVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  videoPlaylistItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-video-src');
      const title = item.getAttribute('data-video-title');
      const desc = item.getAttribute('data-video-desc');
      const poster = item.getAttribute('data-video-poster');

      // Update active states
      videoPlaylistItems.forEach(i => {
        i.classList.remove('border-sky-500', 'bg-sky-500/10', 'ring-2', 'ring-sky-400');
        i.classList.add('border-slate-800', 'bg-slate-900/60');
      });
      item.classList.remove('border-slate-800', 'bg-slate-900/60');
      item.classList.add('border-sky-500', 'bg-sky-500/10', 'ring-2', 'ring-sky-400');

      playSelectedVideo(src, title, desc, poster);
    });
  });

  function openVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('hidden');
    videoModal.classList.add('flex');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (watchVideo) {
      const firstItem = document.querySelector('[data-video-item]');
      if (firstItem && !watchVideo.src.includes('.mp4')) {
        const src = firstItem.getAttribute('data-video-src');
        const title = firstItem.getAttribute('data-video-title');
        const desc = firstItem.getAttribute('data-video-desc');
        const poster = firstItem.getAttribute('data-video-poster');
        playSelectedVideo(src, title, desc, poster);
      } else {
        const playPromise = watchVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    }
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.add('hidden');
    videoModal.classList.remove('flex');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (watchVideo) {
      watchVideo.pause();
    }
  }

  openVideoButtons.forEach(btn => btn.addEventListener('click', openVideoModal));
  closeVideoButtons.forEach(btn => btn.addEventListener('click', closeVideoModal));

  if (videoModal) {
    videoModal.addEventListener('click', (event) => {
      if (event.target === videoModal) closeVideoModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeVideoModal();
  });

  // --- 8. Background Bubbles Generator ---
  function initBubbles() {
    if (document.querySelector('.bubble-container')) return;
    const container = document.createElement('div');
    container.className = 'bubble-container';
    const bubbleCount = window.innerWidth < 768 ? 6 : 14;
    
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 18 + 8; // 8px to 26px
      const left = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 12 + 10; // 10s to 22s
      const delay = Math.random() * 10; // 0s to 10s
      
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${delay}s`;
      
      container.appendChild(bubble);
    }
    document.body.appendChild(container);
  }

  // --- 9. Scroll Reveal Observer ---
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-fade-up');
    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    revealElements.forEach(el => el.classList.add('js-reveal-ready'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.04,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // --- 10. Animated Counter Engine ---
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter-target]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-counter-target'), 10);
          const prefix = el.getAttribute('data-counter-prefix') || '';
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const duration = 1800; // ms
          const startTime = performance.now();

          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);

            el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
          }

          requestAnimationFrame(updateCount);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => counterObserver.observe(c));
  }

})();

