// Get current theme from localStorage or default to 'light'
function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

// Apply theme
function applyTheme(theme) {
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    updateNavIcons('dark');
    updateCardIcons('dark');
    updateThemeButton('🌙');
  } else {
    html.removeAttribute('data-theme');
    updateNavIcons('light');
    updateCardIcons('light');
    updateThemeButton('☀️');
  }
  
  localStorage.setItem('theme', theme);
}

// Update navigation icons based on theme
function updateNavIcons(theme) {
  const navIcons = document.querySelectorAll('.nav-icon');
  navIcons.forEach(icon => {
    const alt = icon.getAttribute('alt');
    const filename = icon.src.split('/').pop();
    const baseName = filename.replace('-light.svg', '').replace('-dark.svg', '');
    icon.src = `../assets/images/icons-${theme}/${baseName}-${theme}.svg`;
  });

  // Account icon (topbar) — same naming convention, works from pages/ path
  const accountIcon = document.querySelector('.account-icon');
  if (accountIcon) {
    const filename = accountIcon.src.split('/').pop();
    const baseName = filename.replace('-light.svg', '').replace('-dark.svg', '');
    accountIcon.src = `../assets/images/icons-${theme}/${baseName}-${theme}.svg`;
  }
}

// Update dashboard card icons based on theme
function updateCardIcons(theme) {
  const cardIcons = document.querySelectorAll('.card-icon');
  cardIcons.forEach(icon => {
    const filename = icon.src.split('/').pop();
    const baseName = filename.replace('-light.svg', '').replace('-dark.svg', '');
    icon.src = `../assets/images/icons-${theme}/${baseName}-${theme}.svg`;
  });
}

// Update theme button icon
function updateThemeButton(icon) {
  const button = document.getElementById('theme-toggle');
  if (button) {
    button.textContent = icon;
  }
}

// Toggle theme
function toggleTheme() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  const theme = getCurrentTheme();
  applyTheme(theme);
  
  // Attach toggle button listener
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});