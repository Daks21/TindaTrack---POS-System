// Account page data loader
document.addEventListener('DOMContentLoaded', function() {
  const accountPageRoot = document.getElementById('account-page-root');

  if (!accountPageRoot) {
    return; // Not on account page
  }

  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) {
    window.location.href = '../index.html';
    return;
  }

  try {
    const currentUser = JSON.parse(currentUserStr);

    // Populate account info
    const fullNameEl = document.getElementById('account-fullname');
    const emailEl = document.getElementById('account-email');
    const emailDisplayEl = document.getElementById('account-email-display');
    const statusEl = document.getElementById('account-status');
    const memberSinceEl = document.getElementById('account-member-since');
    const avatarEl = document.getElementById('account-avatar');

    const fullName = currentUser.fullName || 'User';
    const email = currentUser.email || 'No email';

    if (fullNameEl) {
      fullNameEl.textContent = fullName;
    }

    if (emailEl) {
      emailEl.textContent = email;
    }

    if (emailDisplayEl) {
      emailDisplayEl.textContent = email;
    }

    if (statusEl) {
      statusEl.textContent = 'Active';
    }

    if (memberSinceEl) {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      memberSinceEl.textContent = formattedDate;
    }

    // ── Shared: flash "Saved!" on a save button ──
    function flashSaved(btn) {
      btn.textContent = 'Saved!';
      btn.classList.add('is-saved');
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = 'Save';
        btn.classList.remove('is-saved');
        btn.disabled = false;
      }, 1500);
    }

    // ── Stock Status ──
    const colorOkInput  = document.getElementById('stock-color-ok');
    const colorLowInput = document.getElementById('stock-color-low');
    const colorOutInput = document.getElementById('stock-color-out');
    const swatchOk  = document.getElementById('swatch-ok');
    const swatchLow = document.getElementById('swatch-low');
    const swatchOut = document.getElementById('swatch-out');
    const resetColorsBtn   = document.getElementById('reset-stock-colors');
    const saveStockBtn     = document.getElementById('save-stock-status');
    const thresholdInput   = document.getElementById('low-stock-threshold');

    if (colorOkInput && colorLowInput && colorOutInput) {

      function loadColorsIntoUI() {
        var colors = getStockColors();
        colorOkInput.value  = colors.ok;
        colorLowInput.value = colors.low;
        colorOutInput.value = colors.out;
        if (swatchOk)  swatchOk.style.backgroundColor  = colors.ok;
        if (swatchLow) swatchLow.style.backgroundColor = colors.low;
        if (swatchOut) swatchOut.style.backgroundColor = colors.out;
        // Apply CSS vars for live preview even before saving
        var root = document.documentElement;
        root.style.setProperty('--stock-color-ok',  colors.ok);
        root.style.setProperty('--stock-color-low', colors.low);
        root.style.setProperty('--stock-color-out', colors.out);
      }

      // Live preview on drag — updates swatches + CSS vars, does NOT save yet
      colorOkInput.addEventListener('input', function () {
        if (swatchOk) swatchOk.style.backgroundColor = colorOkInput.value;
        document.documentElement.style.setProperty('--stock-color-ok', colorOkInput.value);
      });
      colorLowInput.addEventListener('input', function () {
        if (swatchLow) swatchLow.style.backgroundColor = colorLowInput.value;
        document.documentElement.style.setProperty('--stock-color-low', colorLowInput.value);
      });
      colorOutInput.addEventListener('input', function () {
        if (swatchOut) swatchOut.style.backgroundColor = colorOutInput.value;
        document.documentElement.style.setProperty('--stock-color-out', colorOutInput.value);
      });

      // Reset: revert UI to defaults without saving
      if (resetColorsBtn) {
        resetColorsBtn.addEventListener('click', function () {
          localStorage.removeItem('stockColors');
          loadColorsIntoUI();
        });
      }

      // Save button: persist colors + threshold
      if (saveStockBtn) {
        saveStockBtn.addEventListener('click', function () {
          localStorage.setItem('stockColors', JSON.stringify({
            ok:  colorOkInput.value,
            low: colorLowInput.value,
            out: colorOutInput.value
          }));
          applyStockColors();

          if (thresholdInput) {
            var val = parseInt(thresholdInput.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 9999) val = 9999;
            thresholdInput.value = val;
            localStorage.setItem('lowStockThreshold', String(val));
          }

          flashSaved(saveStockBtn);
        });
      }

      if (thresholdInput) {
        thresholdInput.value = getLowStockThreshold();
      }

      loadColorsIntoUI();
    }

    // ── Preferences ──
    const taxToggle     = document.getElementById('tax-feature-toggle');
    const taxDefaultToggle = document.getElementById('tax-default-toggle');
    const savePrefsBtn  = document.getElementById('save-preferences');

    // Load current saved state into toggles (visual only)
    if (taxToggle) {
      if (localStorage.getItem('taxEnabled') === 'true') {
        taxToggle.classList.add('is-on');
        taxToggle.setAttribute('aria-pressed', 'true');
      }
      taxToggle.addEventListener('click', function () {
        const isOn = taxToggle.classList.toggle('is-on');
        taxToggle.setAttribute('aria-pressed', String(isOn));
        // Visual only — persisted on Save
      });
    }

    if (taxDefaultToggle) {
      if (localStorage.getItem('taxDefaultOn') === 'true') {
        taxDefaultToggle.classList.add('is-on');
        taxDefaultToggle.setAttribute('aria-pressed', 'true');
      }
      taxDefaultToggle.addEventListener('click', function () {
        const isOn = taxDefaultToggle.classList.toggle('is-on');
        taxDefaultToggle.setAttribute('aria-pressed', String(isOn));
        // Visual only — persisted on Save
      });
    }

    // Tax rate cards — visual selection only, persisted on Save
    const taxRateCards = document.querySelectorAll('.tax-rate-card');
    if (taxRateCards.length) {
      const savedRate = localStorage.getItem('taxRate') || '0.03';
      taxRateCards.forEach(function (card) {
        if (card.dataset.rate === savedRate) card.classList.add('is-selected');
        card.addEventListener('click', function () {
          taxRateCards.forEach(function (c) { c.classList.remove('is-selected'); });
          card.classList.add('is-selected');
          // Visual only — persisted on Save
        });
      });
    }

    if (savePrefsBtn) {
      savePrefsBtn.addEventListener('click', function () {
        if (taxToggle) {
          localStorage.setItem('taxEnabled', taxToggle.classList.contains('is-on') ? 'true' : 'false');
        }
        if (taxDefaultToggle) {
          localStorage.setItem('taxDefaultOn', taxDefaultToggle.classList.contains('is-on') ? 'true' : 'false');
        }
        const selectedRate = document.querySelector('.tax-rate-card.is-selected');
        if (selectedRate) {
          localStorage.setItem('taxRate', selectedRate.dataset.rate);
        }
        flashSaved(savePrefsBtn);
      });
    }

    // Calculate and display avatar initials
    if (avatarEl) {
      const names = fullName.split(' ');
      let initials = '';

      if (names.length >= 2) {
        initials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
      } else {
        initials = fullName.substring(0, 2).toUpperCase();
      }

      avatarEl.textContent = initials;
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
    window.location.href = '../index.html';
  }
});
