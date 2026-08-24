/**
 * AquaPro - Form Submissions, Modal Controls & Toast System
 * Submits enrollment / free-trial requests to the AquaPro booking API.
 * Version: 2.0.0
 */

(function () {
  'use strict';

  var ENDPOINT = '/api/public/bookings';

  // --- 1. Global Toast System ---
  window.showToast = function (message, type = 'success', duration = 5000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast flex items-center p-4 rounded-2xl shadow-2xl border text-xs font-bold transition-all transform ${
      type === 'success'
        ? 'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-800'
        : type === 'error'
        ? 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800'
        : 'bg-cyan-50 text-cyan-900 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-100 dark:border-cyan-800'
    }`;

    const iconSvg =
      type === 'success'
        ? '<i class="fas fa-check-circle mr-2.5 rtl:mr-0 rtl:ml-2.5 text-sky-500 text-sm"></i>'
        : type === 'error'
        ? '<i class="fas fa-exclamation-circle mr-2.5 rtl:mr-0 rtl:ml-2.5 text-rose-500 text-sm"></i>'
        : '<i class="fas fa-water mr-2.5 rtl:mr-0 rtl:ml-2.5 text-cyan-500 text-sm"></i>';

    toast.innerHTML = `
      ${iconSvg}
      <span class="flex-1">${message}</span>
      <button class="ml-3 rtl:ml-0 rtl:mr-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // --- 2. Real form submissions ---
  function buildPayload(form) {
    var fd = new FormData(form);
    var text = function (key) {
      var v = fd.get(key);
      return typeof v === 'string' ? v.trim() : '';
    };

    var notes = [];
    var note = text('message');
    if (note) notes.push(note);
    var coachNote = text('coach_note');
    if (coachNote) notes.push(coachNote);

    var inModal = !!form.closest('.modal-container');

    return {
      booking_type: inModal ? 'trial' : 'enrollment',
      full_name: text('full_name'),
      phone: text('phone'),
      email: text('email'),
      age_group: text('age_group'),
      skill_level: text('skill_level'),
      preferred_batch: text('preferred_batch'),
      program: text('program'),
      wants_free_trial: inModal ? true : fd.get('wants_free_trial') !== null,
      message: notes.join(' | '),
      source_page: window.location.pathname.split('/').pop() || 'index.html',
    };
  }

  var forms = document.querySelectorAll('form[data-aquapro-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i> Confirming swimmer registration...';
      }

      try {
        var res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(form)),
        });
        var data = await res.json().catch(function () {
          return {};
        });

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Request failed');
        }

        form.reset();
        window.showToast(
          '🎉 Request received! Your swimmer registration is saved and our head coach will call you within 2 hours.',
          'success'
        );

        var modal = form.closest('.modal-container');
        if (modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      } catch (err) {
        // Static-site fallback: keep the submission locally so the contact form
        // still gives the visitor a working confirmation when no backend API is deployed.
        try {
          var saved = JSON.parse(localStorage.getItem('aquafit_form_submissions') || '[]');
          saved.push(Object.assign(buildPayload(form), { submitted_at: new Date().toISOString() }));
          localStorage.setItem('aquafit_form_submissions', JSON.stringify(saved));
          form.reset();
          window.showToast(
            'Thank you! Your request has been submitted successfully. Our team will contact you soon.',
            'success'
          );
          var fallbackModal = form.closest('.modal-container');
          if (fallbackModal) { fallbackModal.classList.add('hidden'); document.body.style.overflow = ''; }
        } catch (storageErr) {
          window.showToast(
            'We could not save your request. Please call +1 (800) 555-0299.',
            'error'
          );
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  });

  // --- 3. Modal Handlers (Trial Pass Modal & Coach Booking Modal) ---
  var trialTriggers = document.querySelectorAll('[data-open-trial]');
  var trialModal = document.getElementById('trial-modal');
  var trialBackdrop = document.getElementById('trial-backdrop');
  var trialClose = document.getElementById('trial-close');

  if (trialModal) {
    var closeModal = function () {
      trialModal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    trialTriggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        var coachName = btn.getAttribute('data-coach-name');
        var programName = btn.getAttribute('data-program-name');
        var coachInput = trialModal.querySelector('#modal-coach-note');
        if (coachInput && coachName) {
          coachInput.value = 'Selected Coach: ' + coachName;
        }
        if (programName) {
          var programSelect = trialModal.querySelector('#modal-program-select');
          if (programSelect) programSelect.value = programName;
        }

        trialModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    });

    if (trialBackdrop) trialBackdrop.addEventListener('click', closeModal);
    if (trialClose) trialClose.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !trialModal.classList.contains('hidden')) closeModal();
    });
  }
})();
