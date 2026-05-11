// notifications.js
// Generates stock-based notifications from localStorage and renders a dropdown panel.

(function () {

  // ── Storage helpers ──

  function loadNotifs() {
    var saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  }

  function saveNotifs(notifs) {
    localStorage.setItem('notifications', JSON.stringify(notifs));
  }

  // ── Sync notifications from current product stock ──
  // Rules:
  //   stock > 5      → remove all notifs for this product (reset so future drops generate fresh ones)
  //   stock 1–5      → ensure a 'low' notif exists; upgrade from 'out' if needed
  //   stock === 0    → ensure an 'out' notif exists; upgrade from 'low' if needed

  function syncStockNotifs() {
    var products = JSON.parse(localStorage.getItem('products') || '[]');
    var notifs   = loadNotifs();

    products.forEach(function (p) {
      var hasOut = notifs.find(function (n) { return n.productId === p.id && n.type === 'out'; });
      var hasLow = notifs.find(function (n) { return n.productId === p.id && n.type === 'low'; });

      var thr = (typeof getLowStockThreshold === 'function') ? getLowStockThreshold() : 50;

      if (p.stock > thr) {
        // Product is fine — clear all its notifs so fresh ones appear next time it drops
        notifs = notifs.filter(function (n) { return n.productId !== p.id; });

      } else if (p.stock === 0) {
        if (hasOut) {
          // Already have an 'out' notif (dismissed or not) — update stock value only
          hasOut.stock = p.stock;
        } else {
          // Remove stale 'low' notif and add a fresh 'out' notif
          notifs = notifs.filter(function (n) { return n.productId !== p.id; });
          notifs.unshift({
            id: 'notif_out_' + p.id,
            type: 'out',
            productId: p.id,
            productName: p.name,
            stock: p.stock,
            unit: p.unit || 'pc',
            createdAt: Date.now(),
            dismissed: false
          });
        }

      } else {
        // stock 1–5
        if (hasOut) {
          // Was out, now has some stock — downgrade to 'low'
          notifs = notifs.filter(function (n) { return n.productId !== p.id; });
          notifs.unshift({
            id: 'notif_low_' + p.id,
            type: 'low',
            productId: p.id,
            productName: p.name,
            stock: p.stock,
            unit: p.unit || 'pc',
            createdAt: Date.now(),
            dismissed: false
          });
        } else if (hasLow) {
          // Already have a 'low' notif — update stock value only
          hasLow.stock = p.stock;
        } else {
          // Fresh low stock notif
          notifs.unshift({
            id: 'notif_low_' + p.id,
            type: 'low',
            productId: p.id,
            productName: p.name,
            stock: p.stock,
            unit: p.unit || 'pc',
            createdAt: Date.now(),
            dismissed: false
          });
        }
      }
    });

    saveNotifs(notifs);
    return notifs;
  }

  // ── Badge ──

  function updateBadge() {
    var badge = document.getElementById('notif-badge');
    if (!badge) return;
    var count = loadNotifs().filter(function (n) { return !n.dismissed; }).length;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // ── Panel rendering ──

  function renderPanel(panel) {
    var notifs = loadNotifs();
    var active = notifs.filter(function (n) { return !n.dismissed; });

    var html = '<div class="notif-panel-header">' +
      '<span class="notif-panel-title">Notifications</span>';

    if (active.length > 0) {
      html += '<button class="notif-clear-btn" id="notif-clear-all">Clear all</button>';
    }
    html += '</div>';

    html += '<div class="notif-list" id="notif-list">';

    if (active.length === 0) {
      html += '<div class="notif-empty">' +
        '<i data-lucide="bell-off" class="notif-empty-icon"></i>' +
        '<p>All caught up!</p>' +
        '</div>';
    } else {
      active.forEach(function (n) {
        var icon  = n.type === 'out' ? 'x-circle' : 'alert-triangle';
        var cls   = n.type === 'out' ? 'notif-item--out' : 'notif-item--low';
        var title = n.type === 'out' ? 'Out of Stock' : 'Low Stock';
        var stock = n.stock;
        var unit  = n.unit || 'pc';
        var desc  = n.productName + ' \u2014 ' + stock + ' ' + unit + (stock !== 1 ? 's' : '') + ' left';

        html += '<div class="notif-item ' + cls + '" data-id="' + n.id + '">' +
          '<div class="notif-item-icon"><i data-lucide="' + icon + '"></i></div>' +
          '<div class="notif-item-body">' +
            '<p class="notif-item-title">' + title + '</p>' +
            '<p class="notif-item-desc">' + desc + '</p>' +
          '</div>' +
          '<button class="notif-dismiss-btn" data-id="' + n.id + '" title="Dismiss">' +
            '<i data-lucide="x"></i>' +
          '</button>' +
        '</div>';
      });
    }

    html += '</div>';
    panel.innerHTML = html;
    lucide.createIcons();
    updateBadge();
  }

  // ── Init ──

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('notif-btn');
    if (!btn) return;

    var wrapper = btn.closest('.notif-wrapper');
    if (!wrapper) return;

    // Inject panel element
    var panel = document.createElement('div');
    panel.className = 'notif-panel';
    panel.id = 'notif-panel';
    wrapper.appendChild(panel);

    // Sync and update badge on load
    syncStockNotifs();
    updateBadge();

    // Toggle panel on bell click
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = panel.classList.contains('is-open');
      if (!isOpen) {
        renderPanel(panel);
        panel.classList.add('is-open');
      } else {
        panel.classList.remove('is-open');
      }
    });

    // Dismiss / clear-all inside panel
    panel.addEventListener('click', function (e) {
      var dismissBtn = e.target.closest('.notif-dismiss-btn');
      var clearBtn   = e.target.closest('#notif-clear-all');

      if (dismissBtn) {
        var id = dismissBtn.dataset.id;
        var notifs = loadNotifs();
        notifs.forEach(function (n) { if (n.id === id) n.dismissed = true; });
        saveNotifs(notifs);
        renderPanel(panel);
      } else if (clearBtn) {
        var notifs = loadNotifs();
        notifs.forEach(function (n) { n.dismissed = true; });
        saveNotifs(notifs);
        renderPanel(panel);
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) {
        panel.classList.remove('is-open');
      }
    });
  });

})();
