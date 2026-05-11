function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

function applyTheme(theme) {
  const html       = document.documentElement;
  const iconName   = theme === 'dark' ? 'sun' : 'moon';
  const iconIds    = ['theme-icon', 'account-theme-icon'];

  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.removeAttribute('data-theme');
  }

  iconIds.forEach(function (id) {
    const icon = document.getElementById(id);
    if (icon) icon.setAttribute('data-lucide', iconName);
  });

  if (window.lucide) lucide.createIcons();

  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const newTheme = getCurrentTheme() === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

document.addEventListener('DOMContentLoaded', function () {
  applyTheme(getCurrentTheme());

  ['theme-toggle', 'account-theme-toggle'].forEach(function (id) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', toggleTheme);
  });
});
