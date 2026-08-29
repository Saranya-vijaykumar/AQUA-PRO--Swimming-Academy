/**
 * Aquarium Pro Swimming Academy - Batch Timings & Slot Booking System
 * Fully interactive timetable filtering, live search, quick pills, and slot reservation.
 */

(function () {
  'use strict';
  window.__batchScheduleCustomActive = true;

  function initBatchSchedule() {
    const dayFilter = document.getElementById('schedule-day-filter');
    const levelFilter = document.getElementById('schedule-level-filter');
    const searchInput = document.getElementById('schedule-search-input');
    const resetBtn = document.getElementById('schedule-reset-btn');
    const emptyResetBtn = document.getElementById('empty-reset-btn');
    const counterElem = document.getElementById('schedule-counter');
    const table = document.getElementById('batch-schedule-table');
    const noBatchesRow = document.getElementById('no-batches-row');
    const pillButtons = document.querySelectorAll('.schedule-pill');

    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tbody tr:not(#no-batches-row)'));
    const totalBatches = rows.length;

    // Load any previously saved reservations from localStorage
    function loadSavedReservations() {
      try {
        const saved = JSON.parse(localStorage.getItem('aquapro_batch_reservations') || '[]');
        saved.forEach(function (res) {
          rows.forEach(function (row) {
            const btn = row.querySelector('button[data-open-trial]');
            if (btn && btn.getAttribute('data-batch-name') === res.batchName) {
              markRowAsReserved(row, btn, res.refId);
            }
          });
        });
      } catch (e) {
        console.warn('Could not read saved reservations', e);
      }
    }

    function markRowAsReserved(row, btn, refId) {
      if (!btn) return;
      const parent = btn.parentElement;
      if (parent) {
        parent.innerHTML = `
          <div class="inline-flex flex-col items-end rtl:items-start">
            <span class="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
              <i class="fas fa-check-circle text-emerald-500"></i> Slot Reserved
            </span>
            <span class="text-[10px] text-slate-400 font-mono mt-0.5">${refId || 'Confirmed'}</span>
          </div>
        `;
      }
      // Update slots counter in row
      const slotsCell = row.querySelector('td:nth-child(6)');
      if (slotsCell && !slotsCell.classList.contains('slot-updated')) {
        slotsCell.classList.add('slot-updated');
        slotsCell.innerHTML = '<span class="text-sky-600 dark:text-sky-400 font-bold"><i class="fas fa-user-check text-[10px] mr-1"></i> You are Booked</span>';
      }
    }

    // Filter logic
    function applyFilter() {
      const selectedDay = dayFilter ? dayFilter.value.toLowerCase() : 'all';
      const selectedLevel = levelFilter ? levelFilter.value.toLowerCase() : 'all';
      const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

      let visibleCount = 0;

      rows.forEach(function (row) {
        const rowDay = (row.getAttribute('data-day') || '').toLowerCase();
        const rowLevel = (row.getAttribute('data-level') || '').toLowerCase();
        const rowText = row.textContent.toLowerCase();

        const matchesDay = selectedDay === 'all' || rowDay.includes(selectedDay);
        const matchesLevel = selectedLevel === 'all' || rowLevel === selectedLevel;
        const matchesSearch = !searchQuery || rowText.includes(searchQuery);

        if (matchesDay && matchesLevel && matchesSearch) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      // Update counter
      if (counterElem) {
        if (visibleCount === totalBatches) {
          counterElem.textContent = `Showing all ${totalBatches} available batches`;
        } else {
          counterElem.textContent = `Showing ${visibleCount} of ${totalBatches} batches`;
        }
      }

      // Show / hide empty state
      if (noBatchesRow) {
        if (visibleCount === 0) {
          noBatchesRow.classList.remove('hidden');
          noBatchesRow.style.display = '';
        } else {
          noBatchesRow.classList.add('hidden');
          noBatchesRow.style.display = 'none';
        }
      }

      updatePillHighlights(selectedDay, selectedLevel);
    }

    // Pill highlights
    function updatePillHighlights(currentDay, currentLevel) {
      pillButtons.forEach(function (pill) {
        const pillDay = pill.getAttribute('data-quick-filter');
        const pillLevel = pill.getAttribute('data-quick-level');

        let isActive = false;
        if (pillDay && pillDay === currentDay) {
          isActive = true;
        } else if (pillLevel && pillLevel === currentLevel) {
          isActive = true;
        } else if (pillDay === 'all' && currentDay === 'all' && currentLevel === 'all') {
          isActive = true;
        }

        if (isActive) {
          pill.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
          pill.classList.add('bg-sky-500', 'text-white', 'shadow-sm');
        } else {
          pill.classList.remove('bg-sky-500', 'text-white', 'shadow-sm');
          pill.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
        }
      });
    }

    // Reset filters
    function resetAllFilters() {
      if (dayFilter) dayFilter.value = 'all';
      if (levelFilter) levelFilter.value = 'all';
      if (searchInput) searchInput.value = '';
      applyFilter();
    }

    // Listeners
    if (dayFilter) dayFilter.addEventListener('change', applyFilter);
    if (levelFilter) levelFilter.addEventListener('change', applyFilter);
    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);

    // Pill clicks
    pillButtons.forEach(function (pill) {
      pill.addEventListener('click', function () {
        const pillDay = pill.getAttribute('data-quick-filter');
        const pillLevel = pill.getAttribute('data-quick-level');

        if (pillDay) {
          if (dayFilter) dayFilter.value = pillDay;
          if (levelFilter && pillDay === 'all') levelFilter.value = 'all';
        }
        if (pillLevel) {
          if (levelFilter) levelFilter.value = pillLevel;
        }
        applyFilter();
      });
    });

    // Check URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('day') && dayFilter) {
      dayFilter.value = urlParams.get('day');
    }
    if (urlParams.has('level') && levelFilter) {
      levelFilter.value = urlParams.get('level');
    }
    if (urlParams.has('q') && searchInput) {
      searchInput.value = urlParams.get('q');
    }

    applyFilter();
    loadSavedReservations();

    // Listen for custom reservation success event dispatched by forms.js
    window.addEventListener('aquapro:batch-reserved', function (e) {
      const detail = e.detail || {};
      if (detail.batchName) {
        rows.forEach(function (row) {
          const btn = row.querySelector('button[data-open-trial]');
          if (btn && btn.getAttribute('data-batch-name') === detail.batchName) {
            markRowAsReserved(row, btn, detail.refId);
          }
        });
      }
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBatchSchedule);
  } else {
    initBatchSchedule();
  }
})();
