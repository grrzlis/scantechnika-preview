/* ==========================================================================
   UAB „Scan Technika“ — Interactive Search, Mobile Menu, Catalog & Inquiry
   ========================================================================== */

(function () {
  'use strict';

  const normalizeLt = (str) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Elements
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const catalogBtn = document.getElementById('catalog-dropdown-btn');
  const catalogDropdown = document.getElementById('catalog-dropdown');
  const searchInput = document.getElementById('catalog-search');
  const searchClear = document.getElementById('search-clear-btn');
  const searchStatus = document.getElementById('search-status');
  const emptyState = document.getElementById('catalog-empty');
  const resetSearchBtn = document.getElementById('reset-search-btn');
  const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
  const categoryCards = Array.from(document.querySelectorAll('.category-card'));

  const inquiryForm = document.getElementById('inquiry-form');
  const inquiryTopic = document.getElementById('inquiry-topic');
  const inquiryMessage = document.getElementById('inquiry-message');
  const inquiryFeedback = document.getElementById('inquiry-feedback');

  let activeGroup = 'all';

  // 1. Mobile Navigation Drawer
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Command Bar Catalog Dropdown
  if (catalogBtn && catalogDropdown) {
    catalogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = catalogDropdown.classList.toggle('is-open');
      catalogBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!catalogDropdown.contains(e.target) && !catalogBtn.contains(e.target)) {
        catalogDropdown.classList.remove('is-open');
        catalogBtn.setAttribute('aria-expanded', 'false');
      }
    });

    catalogDropdown.querySelectorAll('[data-jump-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-jump-cat') || '';
        catalogDropdown.classList.remove('is-open');
        catalogBtn.setAttribute('aria-expanded', 'false');
        activeGroup = 'all';
        updateChipState();
        if (searchInput) {
          searchInput.value = query;
          applyFilter();
        }
        const catalogSection = document.getElementById('produktai');
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // 3. Live Search & Category Filter
  function updateChipState() {
    filterChips.forEach((chip) => {
      chip.classList.toggle('is-active', chip.getAttribute('data-group') === activeGroup);
    });
  }

  function applyFilter() {
    const rawQuery = searchInput ? searchInput.value.trim() : '';
    const q = normalizeLt(rawQuery);
    let visibleCount = 0;

    if (searchClear) {
      searchClear.classList.toggle('is-visible', rawQuery.length > 0);
    }

    categoryCards.forEach((card) => {
      const group = card.getAttribute('data-group') || '';
      const haystack = normalizeLt(
        (card.getAttribute('data-keywords') || '') + ' ' + card.textContent
      );

      const matchesGroup = activeGroup === 'all' || group === activeGroup;
      const matchesQuery = !q || haystack.includes(q);
      const show = matchesGroup && matchesQuery;

      card.classList.toggle('is-hidden', !show);
      if (show) visibleCount++;
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }

    if (searchStatus) {
      if (rawQuery) {
        searchStatus.innerHTML =
          'Paieška „<strong>' +
          escapeHtml(rawQuery) +
          '</strong>“: rasta kategorijų – <strong>' +
          visibleCount +
          '</strong> iš ' +
          categoryCards.length;
      } else {
        searchStatus.innerHTML =
          'Rodoma kategorijų: <strong>' +
          visibleCount +
          '</strong> iš ' +
          categoryCards.length;
      }
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilter();
    });

    searchInput.closest('form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      applyFilter();
      const catalogSection = document.getElementById('produktai');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      applyFilter();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      activeGroup = 'all';
      updateChipState();
      applyFilter();
    });
  }

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeGroup = chip.getAttribute('data-group') || 'all';
      updateChipState();
      applyFilter();
    });
  });

  // 4. Prefill Inquiry from Category / Price buttons
  document.querySelectorAll('[data-inquire]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.getAttribute('data-inquire') || '';
      if (inquiryTopic) {
        inquiryTopic.value = item;
      }
      if (inquiryMessage && !inquiryMessage.value.trim()) {
        inquiryMessage.value =
          'Domina „' + item + '“. Prašome pateikti kainos ir pristatymo terminų pasiūlymą.';
      }
      const contactSection = document.getElementById('kontaktai');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => inquiryMessage?.focus(), 450);
    });
  });

  // 5. Inquiry Form Submission Demo
  if (inquiryForm && inquiryFeedback) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = document.getElementById('inquiry-name')?.value.trim() || 'Kliente';
      inquiryFeedback.textContent =
        'Ačiū, ' +
        nameVal +
        '! Jūsų užklausa priimta. Susisieksime su Jumis darbo metu (I–V 08:00–17:00) arba skambinkite +370 676 40057.';
      inquiryFeedback.classList.add('is-visible');
      inquiryForm.reset();
    });
  }

  // Initial status render
  applyFilter();
})();
