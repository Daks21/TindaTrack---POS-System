checkAuth();

// ── Widget pin management ──

function getPinnedWidgets() {
  try {
    var saved = localStorage.getItem('dashboardWidgets');
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
}

function setPinnedWidgets(arr) {
  localStorage.setItem('dashboardWidgets', JSON.stringify(arr));
}

function togglePinnedWidget(id, shouldPin) {
  var pinned = getPinnedWidgets();
  var idx = pinned.indexOf(id);
  if (shouldPin && idx === -1) pinned.push(id);
  if (!shouldPin && idx !== -1) pinned.splice(idx, 1);
  setPinnedWidgets(pinned);
}

function initPinToggles() {
  var pinned = getPinnedWidgets();
  document.querySelectorAll('.widget-pin-checkbox').forEach(function (cb) {
    var widgetId = cb.dataset.widget;
    cb.checked = pinned.indexOf(widgetId) !== -1;
    cb.addEventListener('change', function () {
      togglePinnedWidget(widgetId, cb.checked);
    });
  });
}

// ── Date range ──

var currentRange = 'this-month';
var customFrom = null;
var customTo = null;

function todayEnd() {
  var d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function getDateRange(rangeKey) {
  var now = new Date();
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (rangeKey) {
    case 'today':
      return { from: start, to: todayEnd() };

    case 'this-week': {
      var weekStart = new Date(start);
      weekStart.setDate(start.getDate() - start.getDay());
      return { from: weekStart, to: todayEnd() };
    }

    case 'this-month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: todayEnd() };

    case 'last-30': {
      var l30 = new Date(start);
      l30.setDate(start.getDate() - 29); // today + 29 back = 30 days inclusive
      return { from: l30, to: todayEnd() };
    }

    case 'custom':
      return { from: customFrom, to: customTo };

    default:
      return { from: null, to: null };
  }
}

function filterSalesByRange(sales, from, to) {
  if (!from || !to) return sales;
  return sales.filter(function (s) {
    var d = new Date(s.timestamp);
    return d >= from && d <= to;
  });
}

// ── KPI computation ──

function computeKPIs(sales) {
  var totalRevenue = sales.reduce(function (sum, s) { return sum + s.total; }, 0);
  var totalTransactions = sales.length;
  var avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  var totalUnits = sales.reduce(function (sum, s) {
    return sum + s.items.reduce(function (si, item) { return si + item.quantity; }, 0);
  }, 0);
  return {
    totalRevenue: totalRevenue,
    totalTransactions: totalTransactions,
    avgOrderValue: avgOrderValue,
    totalUnits: totalUnits
  };
}

function updateKPIs(kpis) {
  document.getElementById('kpi-revenue').textContent      = formatPeso(kpis.totalRevenue);
  document.getElementById('kpi-transactions').textContent = kpis.totalTransactions;
  document.getElementById('kpi-avg-order').textContent    = formatPeso(kpis.avgOrderValue);
  document.getElementById('kpi-units').textContent        = kpis.totalUnits;
}

// ── Chart data helpers ──

function getRevenueByDay(sales, from, to) {
  var dayMap = {};

  if (from && to) {
    var cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    var end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    while (cur <= end) {
      dayMap[cur.toISOString().slice(0, 10)] = 0;
      cur.setDate(cur.getDate() + 1);
    }
  }

  sales.forEach(function (s) {
    var key = new Date(s.timestamp).toISOString().slice(0, 10);
    dayMap[key] = (dayMap[key] || 0) + s.total;
  });

  var keys = Object.keys(dayMap).sort();
  return {
    labels: keys.map(function (k) {
      return new Date(k + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    }),
    data: keys.map(function (k) { return dayMap[k]; })
  };
}

function getTopProductsByRevenue(sales, n) {
  n = n || 5;
  var map = {};
  sales.forEach(function (s) {
    s.items.forEach(function (item) {
      map[item.name] = (map[item.name] || 0) + item.lineTotal;
    });
  });
  var sorted = Object.entries(map).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n);
  return { labels: sorted.map(function (e) { return e[0]; }), data: sorted.map(function (e) { return e[1]; }) };
}

function getTopProductsByQty(sales, n) {
  n = n || 5;
  var map = {};
  sales.forEach(function (s) {
    s.items.forEach(function (item) {
      map[item.name] = (map[item.name] || 0) + item.quantity;
    });
  });
  var sorted = Object.entries(map).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n);
  return { labels: sorted.map(function (e) { return e[0]; }), data: sorted.map(function (e) { return e[1]; }) };
}

function getSalesByDayOfWeek(sales) {
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var totals = [0, 0, 0, 0, 0, 0, 0];
  sales.forEach(function (s) {
    totals[new Date(s.timestamp).getDay()] += s.total;
  });
  return { labels: days, data: totals };
}

// ── Chart rendering ──

var chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function chartColors() {
  return {
    primary:      '#5a9e6f',
    primaryFill:  'rgba(90, 158, 111, 0.12)',
    grid:         isDark() ? 'rgba(107,179,128,0.12)' : 'rgba(90,158,111,0.10)',
    text:         isDark() ? '#9ca3af' : '#6b7280',
    tooltip: {
      bg:     isDark() ? '#242b26' : '#ffffff',
      title:  isDark() ? '#e2e8e3' : '#2d3a2e',
      border: 'rgba(90,158,111,0.2)'
    }
  };
}

function baseOptions(extraScales) {
  var c = chartColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.tooltip.bg,
        titleColor:       c.tooltip.title,
        bodyColor:        c.text,
        borderColor:      c.tooltip.border,
        borderWidth:  1,
        padding:      10,
        cornerRadius: 8,
        callbacks: {}
      }
    },
    scales: Object.assign({
      x: {
        grid:   { color: c.grid, drawBorder: false },
        ticks:  { color: c.text, font: { family: "'DM Sans', sans-serif", size: 12 } },
        border: { display: false }
      },
      y: {
        grid:   { color: c.grid, drawBorder: false },
        ticks:  { color: c.text, font: { family: "'DM Sans', sans-serif", size: 12 } },
        border: { display: false }
      }
    }, extraScales || {})
  };
}

function showChartOrEmpty(canvasId, emptyId, hasData) {
  var canvas = document.getElementById(canvasId);
  var empty  = document.getElementById(emptyId);
  if (canvas) canvas.style.display = hasData ? 'block' : 'none';
  if (empty)  empty.style.display  = hasData ? 'none'  : 'flex';
}

function barColors(count) {
  return Array.from({ length: count }, function (_, i) {
    return 'rgba(90, 158, 111, ' + Math.max(0.28, 1 - i * 0.14) + ')';
  });
}

function renderRevenueChart(sales, from, to) {
  destroyChart('revenue');
  var d = getRevenueByDay(sales, from, to);
  var hasData = d.data.some(function (v) { return v > 0; });
  showChartOrEmpty('chart-revenue', 'empty-revenue', hasData);
  if (!hasData) return;

  var c = chartColors();
  var opts = baseOptions();
  opts.plugins.tooltip.callbacks.label = function (ctx) { return ' ' + formatPeso(ctx.parsed.y); };
  opts.scales.y.ticks.callback = function (v) { return v >= 1000 ? '₱' + (v / 1000).toFixed(1) + 'k' : '₱' + v; };

  chartInstances['revenue'] = new Chart(
    document.getElementById('chart-revenue').getContext('2d'), {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [{
          data: d.data,
          borderColor: c.primary,
          backgroundColor: c.primaryFill,
          borderWidth: 2,
          pointBackgroundColor: c.primary,
          pointRadius: d.labels.length > 20 ? 2 : 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: opts
    }
  );
}

function renderTopRevenueChart(sales) {
  destroyChart('top-revenue');
  var d = getTopProductsByRevenue(sales);
  var hasData = d.data.length > 0;
  showChartOrEmpty('chart-top-revenue', 'empty-top-revenue', hasData);
  if (!hasData) return;

  var c = chartColors();
  var opts = baseOptions();
  opts.indexAxis = 'y';
  opts.plugins.tooltip.callbacks.label = function (ctx) { return ' ' + formatPeso(ctx.parsed.x); };
  opts.scales.x.ticks.callback = function (v) { return v >= 1000 ? '₱' + (v / 1000).toFixed(1) + 'k' : '₱' + v; };

  chartInstances['top-revenue'] = new Chart(
    document.getElementById('chart-top-revenue').getContext('2d'), {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [{ data: d.data, backgroundColor: barColors(d.data.length), borderRadius: 6, borderSkipped: false }]
      },
      options: opts
    }
  );
}

function renderTopQtyChart(sales) {
  destroyChart('top-qty');
  var d = getTopProductsByQty(sales);
  var hasData = d.data.length > 0;
  showChartOrEmpty('chart-top-qty', 'empty-top-qty', hasData);
  if (!hasData) return;

  var opts = baseOptions();
  opts.indexAxis = 'y';
  opts.plugins.tooltip.callbacks.label = function (ctx) { return ' ' + ctx.parsed.x + ' units'; };
  opts.scales.x.ticks.callback = function (v) { return v + ' units'; };

  chartInstances['top-qty'] = new Chart(
    document.getElementById('chart-top-qty').getContext('2d'), {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [{ data: d.data, backgroundColor: barColors(d.data.length), borderRadius: 6, borderSkipped: false }]
      },
      options: opts
    }
  );
}

function renderDayOfWeekChart(sales) {
  destroyChart('by-day');
  var d = getSalesByDayOfWeek(sales);
  var hasData = d.data.some(function (v) { return v > 0; });
  showChartOrEmpty('chart-by-day', 'empty-by-day', hasData);
  if (!hasData) return;

  var c = chartColors();
  var max = Math.max.apply(null, d.data);
  var opts = baseOptions();
  opts.plugins.tooltip.callbacks.label = function (ctx) { return ' ' + formatPeso(ctx.parsed.y); };
  opts.scales.y.ticks.callback = function (v) { return v >= 1000 ? '₱' + (v / 1000).toFixed(1) + 'k' : '₱' + v; };

  chartInstances['by-day'] = new Chart(
    document.getElementById('chart-by-day').getContext('2d'), {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [{
          data: d.data,
          backgroundColor: d.data.map(function (v) { return v === max ? c.primary : 'rgba(90, 158, 111, 0.40)'; }),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: opts
    }
  );
}

// ── Heatmap ──

var HEATMAP_CELL   = 13;
var HEATMAP_GAP    = 3;
var HEATMAP_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Named handlers so we can cleanly remove them before re-adding
var _heatmapMouseMove  = null;
var _heatmapMouseLeave = null;

function renderHeatmap() {
  var cellsEl  = document.getElementById('heatmap-cells');
  var monthsEl = document.getElementById('heatmap-months');
  var tooltip  = document.getElementById('heatmap-tooltip');
  if (!cellsEl) return;

  // Remove stale listeners before re-rendering
  if (_heatmapMouseMove)  cellsEl.removeEventListener('mousemove',  _heatmapMouseMove);
  if (_heatmapMouseLeave) cellsEl.removeEventListener('mouseleave', _heatmapMouseLeave);

  // Build daily revenue map (always full history — heatmap is independent of date picker)
  var allSales = JSON.parse(localStorage.getItem('sales') || '[]');
  var dayRevenue = {};
  allSales.forEach(function (s) {
    var key = new Date(s.timestamp).toISOString().slice(0, 10);
    dayRevenue[key] = (dayRevenue[key] || 0) + s.total;
  });

  // Quartile thresholds for 5-level color scale
  var nonZero = Object.values(dayRevenue)
    .filter(function (v) { return v > 0; })
    .sort(function (a, b) { return a - b; });
  var q1 = nonZero[Math.floor(nonZero.length * 0.25)] || 1;
  var q2 = nonZero[Math.floor(nonZero.length * 0.50)] || 2;
  var q3 = nonZero[Math.floor(nonZero.length * 0.75)] || 3;

  function level(v) {
    if (!v) return 0;
    if (v <= q1) return 1;
    if (v <= q2) return 2;
    if (v <= q3) return 3;
    return 4;
  }

  // 52 weeks back, aligned to Sunday
  var today     = new Date();
  var todayEnd  = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
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
        monthLabels.push({ label: HEATMAP_MONTHS[m], weekIndex: weeks.length });
        lastMonth = m;
      }
      var rev = dayRevenue[key] || 0;
      week.push({ date: new Date(cur), key: key, revenue: rev, level: level(rev) });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  // ── Month labels ──
  if (monthsEl) {
    monthsEl.innerHTML = '';
    monthLabels.forEach(function (ml, i) {
      var nextIdx = i + 1 < monthLabels.length ? monthLabels[i + 1].weekIndex : weeks.length;
      var width   = (nextIdx - ml.weekIndex) * (HEATMAP_CELL + HEATMAP_GAP);
      var span    = document.createElement('span');
      span.textContent  = ml.label;
      span.style.cssText =
        'display:inline-block;min-width:' + width + 'px;' +
        'font-size:11px;color:var(--color-text-muted);overflow:hidden;flex-shrink:0;';
      monthsEl.appendChild(span);
    });
  }

  // ── Cells ──
  cellsEl.innerHTML = '';
  weeks.forEach(function (week) {
    var weekEl = document.createElement('div');
    weekEl.className = 'heatmap-week';
    week.forEach(function (day) {
      var cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.setAttribute('data-level', day.level === -1 ? 'empty' : day.level);
      if (day.date && day.level !== -1) {
        cell.dataset.date    = day.key;
        cell.dataset.revenue = day.revenue;
        // Accessible label
        var d2      = new Date(day.key + 'T00:00:00');
        var dStr    = d2.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
        var revStr  = day.revenue > 0 ? formatPeso(day.revenue) + ' in sales' : 'No sales';
        cell.setAttribute('aria-label', dStr + ': ' + revStr);
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('tabindex', '0');
      }
      weekEl.appendChild(cell);
    });
    cellsEl.appendChild(weekEl);
  });

  // ── Tooltip (named handlers to prevent duplicate listeners) ──
  if (tooltip) {
    _heatmapMouseMove = function (e) {
      var cell = e.target.closest('.heatmap-cell');
      if (!cell || !cell.dataset.date) {
        tooltip.style.display = 'none';
        return;
      }
      var d2     = new Date(cell.dataset.date + 'T00:00:00');
      var dateStr = d2.toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      var rev    = parseFloat(cell.dataset.revenue) || 0;

      tooltip.querySelector('.heatmap-tooltip-date').textContent  = dateStr;
      tooltip.querySelector('.heatmap-tooltip-value').textContent =
        rev > 0 ? formatPeso(rev) + ' in sales' : 'No sales';
      tooltip.style.display = 'block';

      // Bounds-safe positioning
      var tw  = tooltip.offsetWidth  || 170;
      var th  = tooltip.offsetHeight || 50;
      var tx  = e.clientX + 14;
      var ty  = e.clientY - th - 10;

      if (tx + tw > window.innerWidth)  tx = e.clientX - tw - 10;
      if (tx < 8)                       tx = 8;
      if (ty < 8)                       ty = e.clientY + 14;
      if (ty + th > window.innerHeight) ty = e.clientY - th - 10;

      tooltip.style.left = tx + 'px';
      tooltip.style.top  = ty + 'px';
    };

    _heatmapMouseLeave = function () {
      tooltip.style.display = 'none';
    };

    cellsEl.addEventListener('mousemove',  _heatmapMouseMove);
    cellsEl.addEventListener('mouseleave', _heatmapMouseLeave);
  }

  // Scroll to the latest (rightmost) week
  var scrollArea = cellsEl.closest('.heatmap-scroll-area');
  if (scrollArea) scrollArea.scrollLeft = scrollArea.scrollWidth;
}

// ── Main render ──

function renderAll() {
  var range    = getDateRange(currentRange);
  var allSales = JSON.parse(localStorage.getItem('sales') || '[]');
  var sales    = filterSalesByRange(allSales, range.from, range.to);

  updateKPIs(computeKPIs(sales));
  renderHeatmap();
  renderRevenueChart(sales, range.from, range.to);
  renderTopRevenueChart(sales);
  renderTopQtyChart(sales);
  renderDayOfWeekChart(sales);

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Date preset buttons ──

function attachDatePresetEvents() {
  document.querySelectorAll('.date-preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.date-preset-btn').forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');

      var range     = btn.dataset.range;
      currentRange  = range;
      var customRow = document.getElementById('custom-date-row');
      if (customRow) customRow.style.display = range === 'custom' ? 'flex' : 'none';
      if (range !== 'custom') renderAll();
    });
  });

  var applyBtn = document.getElementById('apply-custom-range');
  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      var fromVal  = document.getElementById('analytics-from').value;
      var toVal    = document.getElementById('analytics-to').value;
      var errorEl  = document.getElementById('custom-date-error');

      if (!fromVal || !toVal) {
        if (errorEl) errorEl.textContent = 'Please select both a start and end date.';
        return;
      }
      if (fromVal > toVal) {
        if (errorEl) errorEl.textContent = 'Start date must be before or equal to end date.';
        return;
      }
      if (errorEl) errorEl.textContent = '';

      customFrom   = new Date(fromVal + 'T00:00:00');
      customTo     = new Date(toVal   + 'T23:59:59');
      currentRange = 'custom';

      // Mark custom button active
      document.querySelectorAll('.date-preset-btn').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.range === 'custom');
      });

      renderAll();
    });
  }
}

// ── Window resize: keep charts fluid ──

var _resizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(function () {
    Object.keys(chartInstances).forEach(function (id) {
      if (chartInstances[id]) chartInstances[id].resize();
    });
  }, 200);
});

// ── Theme change: debounced re-render ──

var _themeTimer;
var themeObserver = new MutationObserver(function () {
  clearTimeout(_themeTimer);
  _themeTimer = setTimeout(renderAll, 200);
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// ── Init ──

document.addEventListener('DOMContentLoaded', function () {
  initPinToggles();
  renderAll();
  attachDatePresetEvents();
});
