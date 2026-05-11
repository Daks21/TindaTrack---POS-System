checkAuth();

// ── Analytics widget rendering for Dashboard ──

var _dashCharts = {};

function _destroyDashChart(id) {
  if (_dashCharts[id]) { _dashCharts[id].destroy(); delete _dashCharts[id]; }
}

function _isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function _chartColors() {
  return {
    primary: '#5a9e6f',
    primaryFill: 'rgba(90, 158, 111, 0.12)',
    grid: _isDark() ? 'rgba(107,179,128,0.12)' : 'rgba(90,158,111,0.10)',
    text: _isDark() ? '#9ca3af' : '#6b7280',
    tooltipBg: _isDark() ? '#242b26' : '#ffffff',
    tooltipTitle: _isDark() ? '#e2e8e3' : '#2d3a2e',
    tooltipBorder: 'rgba(90,158,111,0.2)'
  };
}

function _dashBaseOptions(extra) {
  var c = _chartColors();
  return Object.assign({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.tooltipBg,
        titleColor: c.tooltipTitle,
        bodyColor: c.text,
        borderColor: c.tooltipBorder,
        borderWidth: 1,
        padding: 8,
        cornerRadius: 8
      }
    },
    scales: {
      x: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.text, font: { family: "'DM Sans',sans-serif", size: 11 } }, border: { display: false } },
      y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.text, font: { family: "'DM Sans',sans-serif", size: 11 } }, border: { display: false } }
    }
  }, extra || {});
}

function _formatPeso(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function _getLast30Sales() {
  var allSales = JSON.parse(localStorage.getItem('sales') || '[]');
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  cutoff.setHours(0, 0, 0, 0);
  return allSales.filter(function (s) { return new Date(s.timestamp) >= cutoff; });
}

function _revenueByDay(sales) {
  var now = new Date();
  var dayMap = {};
  for (var i = 29; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  sales.forEach(function (s) {
    var k = new Date(s.timestamp).toISOString().slice(0, 10);
    if (k in dayMap) dayMap[k] += s.total;
  });
  var keys = Object.keys(dayMap);
  return {
    labels: keys.map(function (k) {
      var d = new Date(k + 'T00:00:00');
      return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    }),
    data: keys.map(function (k) { return dayMap[k]; })
  };
}

function _topByRevenue(sales, n) {
  var map = {};
  sales.forEach(function (s) { s.items.forEach(function (i) { map[i.name] = (map[i.name] || 0) + i.lineTotal; }); });
  var sorted = Object.entries(map).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n || 5);
  return { labels: sorted.map(function (e) { return e[0]; }), data: sorted.map(function (e) { return e[1]; }) };
}

function _topByQty(sales, n) {
  var map = {};
  sales.forEach(function (s) { s.items.forEach(function (i) { map[i.name] = (map[i.name] || 0) + i.quantity; }); });
  var sorted = Object.entries(map).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n || 5);
  return { labels: sorted.map(function (e) { return e[0]; }), data: sorted.map(function (e) { return e[1]; }) };
}

function _byDayOfWeek(sales) {
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var totals = [0, 0, 0, 0, 0, 0, 0];
  sales.forEach(function (s) { totals[new Date(s.timestamp).getDay()] += s.total; });
  return { labels: days, data: totals };
}

var WIDGET_META = {
  'activity-heatmap':     { label: 'Sales Activity',           span: true,  heatmap: true  },
  'revenue-chart':        { label: 'Revenue Over Time',        span: true,  heatmap: false },
  'top-products-revenue': { label: 'Top Products by Revenue',  span: false, heatmap: false },
  'top-products-qty':     { label: 'Top Products by Quantity', span: false, heatmap: false },
  'sales-by-day':         { label: 'Sales by Day of Week',     span: true,  heatmap: false }
};

// Dashboard cell constants (compact — smaller than analytics 13px)
var DASH_CELL = 10, DASH_GAP = 2;
var DASH_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderDashboardWidgets() {
  var container = document.getElementById('dashboard-analytics-widgets');
  var emptyState = document.getElementById('dashboard-analytics-empty');
  if (!container) return;

  var pinned = [];
  try { pinned = JSON.parse(localStorage.getItem('dashboardWidgets') || '[]'); } catch (e) { pinned = []; }

  // Clear existing charts
  Object.keys(_dashCharts).forEach(function (id) { _destroyDashChart(id); });
  container.innerHTML = '';

  if (pinned.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  var sales = _getLast30Sales();
  var grid = document.createElement('div');
  grid.className = 'dashboard-charts-grid';
  container.appendChild(grid);

  pinned.forEach(function (widgetId) {
    var meta = WIDGET_META[widgetId];
    if (!meta) return;

    var card = document.createElement('div');
    card.className = 'dashboard-chart-card' + (meta.span ? ' span-2' : '');

    if (meta.heatmap) {
      // ── Heatmap widget — mirrors Analytics Sales Activity ──
      card.innerHTML =
        '<p class="dashboard-chart-title">' + meta.label + '</p>' +
        '<div class="dash-hm-outer">' +
          '<div class="dash-hm-main">' +
            '<div class="dash-hm-day-labels">' +
              '<span></span>' +
              '<span>Mon</span>' +
              '<span></span>' +
              '<span>Wed</span>' +
              '<span></span>' +
              '<span>Fri</span>' +
              '<span></span>' +
            '</div>' +
            '<div class="dash-hm-scroll-area">' +
              '<div class="dash-hm-months" id="dash-hm-months"></div>' +
              '<div class="dash-heatmap-cells" id="dash-heatmap-cells"></div>' +
            '</div>' +
          '</div>' +
          '<div class="dash-heatmap-legend">' +
            '<span class="heatmap-legend-label">Less</span>' +
            '<span class="dash-heatmap-cell" data-level="0"></span>' +
            '<span class="dash-heatmap-cell" data-level="1"></span>' +
            '<span class="dash-heatmap-cell" data-level="2"></span>' +
            '<span class="dash-heatmap-cell" data-level="3"></span>' +
            '<span class="dash-heatmap-cell" data-level="4"></span>' +
            '<span class="heatmap-legend-label">More</span>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);

      setTimeout(function () {
        var cellsEl  = document.getElementById('dash-heatmap-cells');
        var monthsEl = document.getElementById('dash-hm-months');
        var tooltip  = document.getElementById('heatmap-tooltip');
        if (!cellsEl) return;

        var allSales = JSON.parse(localStorage.getItem('sales') || '[]');
        var dayRevenue = {};
        allSales.forEach(function (s) {
          var key = new Date(s.timestamp).toISOString().slice(0, 10);
          dayRevenue[key] = (dayRevenue[key] || 0) + s.total;
        });

        var nonZero = Object.values(dayRevenue).filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
        var q1 = nonZero[Math.floor(nonZero.length * 0.25)] || 1;
        var q2 = nonZero[Math.floor(nonZero.length * 0.50)] || 2;
        var q3 = nonZero[Math.floor(nonZero.length * 0.75)] || 3;

        function hlevel(v) {
          if (!v) return 0;
          if (v <= q1) return 1;
          if (v <= q2) return 2;
          if (v <= q3) return 3;
          return 4;
        }

        var today    = new Date();
        var todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        var startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        startDate.setDate(startDate.getDate() - (52 * 7) - today.getDay());

        var weeks       = [];
        var monthLabels = [];
        var cur         = new Date(startDate);
        var lastMonth   = -1;

        while (cur <= todayEnd) {
          var week = [];
          for (var d = 0; d < 7; d++) {
            if (cur > todayEnd) {
              week.push({ date: null, key: null, revenue: 0, level: -1 });
              cur.setDate(cur.getDate() + 1);
              continue;
            }
            var key = cur.toISOString().slice(0, 10);
            var m   = cur.getMonth();
            if (d === 0 && m !== lastMonth) {
              monthLabels.push({ label: DASH_MONTHS[m], weekIndex: weeks.length });
              lastMonth = m;
            }
            var rev = dayRevenue[key] || 0;
            week.push({ date: new Date(cur), key: key, revenue: rev, level: hlevel(rev) });
            cur.setDate(cur.getDate() + 1);
          }
          weeks.push(week);
        }

        // Month labels
        if (monthsEl) {
          monthsEl.innerHTML = '';
          monthLabels.forEach(function (ml, i) {
            var nextIdx = i + 1 < monthLabels.length ? monthLabels[i + 1].weekIndex : weeks.length;
            var width   = (nextIdx - ml.weekIndex) * (DASH_CELL + DASH_GAP);
            var span    = document.createElement('span');
            span.textContent  = ml.label;
            span.style.cssText =
              'display:inline-block;min-width:' + width + 'px;' +
              'font-size:10px;color:var(--color-text-muted);overflow:hidden;flex-shrink:0;';
            monthsEl.appendChild(span);
          });
        }

        // Cells
        cellsEl.innerHTML = '';
        weeks.forEach(function (week) {
          var weekEl = document.createElement('div');
          weekEl.className = 'dash-heatmap-week';
          week.forEach(function (day) {
            var cell = document.createElement('div');
            cell.className = 'dash-heatmap-cell';
            cell.setAttribute('data-level', day.level === -1 ? 'empty' : day.level);
            if (day.date && day.level !== -1) {
              cell.dataset.date    = day.key;
              cell.dataset.revenue = day.revenue;
              var dStr   = new Date(day.key + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
              var revStr = day.revenue > 0 ? _formatPeso(day.revenue) + ' in sales' : 'No sales';
              cell.setAttribute('aria-label', dStr + ': ' + revStr);
              cell.setAttribute('role', 'gridcell');
              cell.setAttribute('tabindex', '0');
            }
            weekEl.appendChild(cell);
          });
          cellsEl.appendChild(weekEl);
        });

        // Tooltip — same mechanism as analytics page
        if (tooltip) {
          cellsEl.addEventListener('mousemove', function (e) {
            var cell = e.target.closest('.dash-heatmap-cell');
            if (!cell || !cell.dataset.date) { tooltip.style.display = 'none'; return; }
            var d2      = new Date(cell.dataset.date + 'T00:00:00');
            var dateStr = d2.toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            var rev     = parseFloat(cell.dataset.revenue) || 0;
            tooltip.querySelector('.heatmap-tooltip-date').textContent  = dateStr;
            tooltip.querySelector('.heatmap-tooltip-value').textContent =
              rev > 0 ? _formatPeso(rev) + ' in sales' : 'No sales';
            tooltip.style.display = 'block';
            var tw = tooltip.offsetWidth  || 170;
            var th = tooltip.offsetHeight || 50;
            var tx = e.clientX + 14;
            var ty = e.clientY - th - 10;
            if (tx + tw > window.innerWidth)  tx = e.clientX - tw - 10;
            if (tx < 8)                       tx = 8;
            if (ty < 8)                       ty = e.clientY + 14;
            if (ty + th > window.innerHeight) ty = e.clientY - th - 10;
            tooltip.style.left = tx + 'px';
            tooltip.style.top  = ty + 'px';
          });
          cellsEl.addEventListener('mouseleave', function () {
            tooltip.style.display = 'none';
          });
        }

        // Scroll to the latest (rightmost) week
        var scrollArea = cellsEl.closest('.dash-hm-scroll-area');
        if (scrollArea) scrollArea.scrollLeft = scrollArea.scrollWidth;
      }, 0);

    } else {
      // ── Chart.js widget ──
      var canvasId = 'dash-chart-' + widgetId;
      var emptyId  = 'dash-empty-' + widgetId;
      card.innerHTML =
        '<p class="dashboard-chart-title">' + meta.label + '</p>' +
        '<div class="dashboard-chart-canvas-wrapper">' +
          '<canvas id="' + canvasId + '"></canvas>' +
          '<div class="chart-empty-state" id="' + emptyId + '">' +
            '<p>No sales data for this period</p>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);

      setTimeout(function () {
        var ctx     = document.getElementById(canvasId);
        var emptyEl = document.getElementById(emptyId);
        if (!ctx) return;
        var c = _chartColors();

        function showOrHide(hasData) {
          ctx.style.display = hasData ? 'block' : 'none';
          if (emptyEl) emptyEl.style.display = hasData ? 'none' : 'flex';
        }

        if (widgetId === 'revenue-chart') {
          var d = _revenueByDay(sales);
          var hasData = d.data.some(function (v) { return v > 0; });
          showOrHide(hasData);
          if (!hasData) return;
          var opts = _dashBaseOptions();
          opts.plugins.tooltip.callbacks = { label: function (ct) { return ' ' + _formatPeso(ct.parsed.y); } };
          opts.scales.y.ticks.callback = function (v) { return v >= 1000 ? '₱' + (v/1000).toFixed(1)+'k' : '₱'+v; };
          _dashCharts[widgetId] = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: { labels: d.labels, datasets: [{ data: d.data, borderColor: c.primary, backgroundColor: c.primaryFill, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, fill: true, tension: 0.4 }] },
            options: opts
          });

        } else if (widgetId === 'top-products-revenue') {
          var d = _topByRevenue(sales);
          var hasData = d.data.length > 0;
          showOrHide(hasData);
          if (!hasData) return;
          var opts = _dashBaseOptions();
          opts.indexAxis = 'y';
          opts.plugins.tooltip.callbacks = { label: function (ct) { return ' ' + _formatPeso(ct.parsed.x); } };
          opts.scales.x.ticks.callback = function (v) { return v >= 1000 ? '₱'+(v/1000).toFixed(1)+'k' : '₱'+v; };
          var bColors = d.data.map(function (_, i) { return 'rgba(90,158,111,' + Math.max(0.28, 1 - i * 0.14) + ')'; });
          _dashCharts[widgetId] = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: { labels: d.labels, datasets: [{ data: d.data, backgroundColor: bColors, borderRadius: 6, borderSkipped: false }] },
            options: opts
          });

        } else if (widgetId === 'top-products-qty') {
          var d = _topByQty(sales);
          var hasData = d.data.length > 0;
          showOrHide(hasData);
          if (!hasData) return;
          var opts = _dashBaseOptions();
          opts.indexAxis = 'y';
          opts.plugins.tooltip.callbacks = { label: function (ct) { return ' ' + ct.parsed.x + ' units'; } };
          opts.scales.x.ticks.callback = function (v) { return v + ' units'; };
          var bColors = d.data.map(function (_, i) { return 'rgba(90,158,111,' + Math.max(0.28, 1 - i * 0.14) + ')'; });
          _dashCharts[widgetId] = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: { labels: d.labels, datasets: [{ data: d.data, backgroundColor: bColors, borderRadius: 6, borderSkipped: false }] },
            options: opts
          });

        } else if (widgetId === 'sales-by-day') {
          var d = _byDayOfWeek(sales);
          var hasData = d.data.some(function (v) { return v > 0; });
          showOrHide(hasData);
          if (!hasData) return;
          var max  = Math.max.apply(null, d.data);
          var opts = _dashBaseOptions();
          opts.plugins.tooltip.callbacks = { label: function (ct) { return ' ' + _formatPeso(ct.parsed.y); } };
          opts.scales.y.ticks.callback = function (v) { return v >= 1000 ? '₱'+(v/1000).toFixed(1)+'k' : '₱'+v; };
          _dashCharts[widgetId] = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: { labels: d.labels, datasets: [{ data: d.data, backgroundColor: d.data.map(function (v) { return v === max ? c.primary : 'rgba(90,158,111,0.45)'; }), borderRadius: 6, borderSkipped: false }] },
            options: opts
          });
        }
      }, 0);
    }
  });
}

var _themeTimerDash;
var _themeObserverDash = new MutationObserver(function () {
  clearTimeout(_themeTimerDash);
  _themeTimerDash = setTimeout(renderDashboardWidgets, 200);
});
_themeObserverDash.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const totalSalesTodayEl   = document.getElementById("total-sales-today");
const totalProductsEl     = document.getElementById("total-products");
const lowStockItemsEl     = document.getElementById("low-stock-items");
const transactionsTodayEl = document.getElementById("transactions-today");
const userName            = document.getElementById("user-name");
const stockAlertList      = document.getElementById("stock-alert-list");

if (currentUser && userName) {
  userName.textContent = currentUser.fullName;
}

// ── Load products and compute summary ──
var products = JSON.parse(localStorage.getItem('products') || '[]');
var thr = getLowStockThreshold();
var lowCount  = products.filter(function (p) { return p.stock > 0 && p.stock <= thr; }).length;
var outCount  = products.filter(function (p) { return p.stock === 0; }).length;
var alertCount = lowCount + outCount;

// ── Today's sales summary ──
var allSalesData    = JSON.parse(localStorage.getItem('sales') || '[]');
var todayStr        = new Date().toISOString().slice(0, 10);
var todaysSales     = allSalesData.filter(function (s) {
  return new Date(s.timestamp).toISOString().slice(0, 10) === todayStr;
});
var todayRevenue    = todaysSales.reduce(function (sum, s) { return sum + s.total; }, 0);
var todayFormatted  = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(todayRevenue);

if (totalProductsEl)     totalProductsEl.textContent     = products.length;
if (lowStockItemsEl)     lowStockItemsEl.textContent      = alertCount;
if (totalSalesTodayEl)   totalSalesTodayEl.textContent    = todayFormatted;
if (transactionsTodayEl) transactionsTodayEl.textContent  = todaysSales.length;

// ── Render Low Stock Alerts ──
if (stockAlertList) {
  var alertProducts = products
    .filter(function (p) { return p.stock <= thr; })
    .sort(function (a, b) { return a.stock - b.stock; });

  if (alertProducts.length === 0) {
    stockAlertList.innerHTML =
      '<p style="text-align:center;padding:24px;color:var(--color-text-muted);font-size:14px;">No stock alerts. All products are well stocked.</p>';
  } else {
    var html = '';
    alertProducts.forEach(function (p) {
      var isOut   = p.stock === 0;
      var dotCls  = isOut ? 'status-critical' : 'status-low';
      var lblCls  = isOut ? 'critical-label'  : 'low-label';
      var lblText = isOut ? 'Out of Stock'     : 'Low Stock';
      var stock   = p.stock + ' ' + (p.unit || 'pc') + (p.stock !== 1 ? 's' : '');

      html +=
        '<div class="stock-alert-item">' +
          '<div class="stock-info">' +
            '<span class="status-dot ' + dotCls + '"></span>' +
            '<div>' +
              '<h3>' + p.name + '</h3>' +
              '<p>Current stock: ' + stock + '</p>' +
            '</div>' +
          '</div>' +
          '<span class="stock-label ' + lblCls + '">' + lblText + '</span>' +
        '</div>';
    });
    stockAlertList.innerHTML = html;
  }
}

// ── Recent Transactions table ──
var recentTxBody = document.getElementById('recent-transactions-body');
if (recentTxBody) {
  var recentSales = allSalesData
    .slice()
    .sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); })
    .slice(0, 10);

  if (recentSales.length === 0) {
    recentTxBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--color-text-muted);">No transactions recorded yet.</td></tr>';
  } else {
    var txHtml = '';
    recentSales.forEach(function (sale) {
      var d          = new Date(sale.timestamp);
      var dateStr    = d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
      var timeStr    = d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
      var itemCount  = sale.items.reduce(function (s, i) { return s + i.quantity; }, 0);
      var totalFmt   = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(sale.total);

      txHtml +=
        '<tr>' +
          '<td>RCPT-' + sale.id + '</td>' +
          '<td>' + dateStr + ' - ' + timeStr + '</td>' +
          '<td>' + itemCount + ' item' + (itemCount !== 1 ? 's' : '') + '</td>' +
          '<td>' + totalFmt + '</td>' +
          '<td><span class="status-badge status-completed">Completed</span></td>' +
        '</tr>';
    });
    recentTxBody.innerHTML = txHtml;
  }
}

// ── Render analytics widgets after DOM is ready ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderDashboardWidgets);
} else {
  renderDashboardWidgets();
}

