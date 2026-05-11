// Get user initials from full name
function getUserInitials(fullName) {
  if (!fullName) return '--';
  return fullName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Set active nav link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// Populate user info from localStorage
function populateUserInfo() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const avatarEl = document.getElementById('user-avatar');
  const nameEl   = document.getElementById('user-name');

  if (avatarEl) avatarEl.textContent = getUserInitials(currentUser.fullName);
  if (nameEl)   nameEl.textContent   = currentUser.fullName;
}

// User popup toggle
function initUserPopup() {
  const trigger = document.getElementById('user-menu-trigger');
  const popup   = document.getElementById('user-popup');

  if (!trigger || !popup) return;

  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    popup.classList.toggle('is-open');
  });

  document.addEventListener('click', function () {
    popup.classList.remove('is-open');
  });

  popup.addEventListener('click', function (e) {
    e.stopPropagation();
  });
}

// Logout
function initLogout() {
  const logoutBtn = document.getElementById('logout-button');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
  });
}

// Inject FAB on all pages except the New Order page
function initFab() {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'order.html') return;

  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.title = 'New Sale';
  fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>';
  fab.addEventListener('click', function () {
    window.location.href = 'order.html';
  });
  document.body.appendChild(fab);
}

// Close any open modal on Escape
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal-overlay').forEach(function (modal) {
    if (modal.style.display === 'flex') modal.style.display = 'none';
  });
});

document.addEventListener('DOMContentLoaded', function () {
  setActiveNavLink();
  populateUserInfo();
  initUserPopup();
  initLogout();
  initFab();
});
