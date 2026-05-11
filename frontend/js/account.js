// Account dropdown and settings page functionality

document.addEventListener('DOMContentLoaded', function() {
  const dropdownButton = document.getElementById('account-menu-button');
  const dropdownMenu = document.getElementById('account-dropdown');
  const logoutButton = document.getElementById('account-logout');
  const dropdownWrapper = document.querySelector('.account-dropdown-wrapper');

  if (!dropdownButton || !dropdownMenu) {
    return; // Dropdown elements don't exist on this page
  }

  let dropdownOpenTimeout;
  let isDropdownOpen = false;

  // Open dropdown
  function openDropdown() {
    dropdownMenu.classList.add('is-open');
    isDropdownOpen = true;
    dropdownButton.focus();
  }

  // Close dropdown
  function closeDropdown() {
    dropdownMenu.classList.remove('is-open');
    isDropdownOpen = false;
  }

  // Desktop: hover to open, with delay to close
  if (dropdownWrapper) {
    dropdownWrapper.addEventListener('mouseenter', function() {
      clearTimeout(dropdownOpenTimeout);
      openDropdown();
    });

    dropdownWrapper.addEventListener('mouseleave', function() {
      dropdownOpenTimeout = setTimeout(closeDropdown, 150);
    });
  }

  // Mobile: tap to toggle
  dropdownButton.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Click outside to close
  document.addEventListener('click', function(e) {
    if (dropdownWrapper && !dropdownWrapper.contains(e.target)) {
      closeDropdown();
    }
  });

  // Esc key to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isDropdownOpen) {
      closeDropdown();
      dropdownButton.focus();
    }
  });

  // Arrow keys for navigation
  document.addEventListener('keydown', function(e) {
    if (!isDropdownOpen) return;

    const menuItems = Array.from(dropdownMenu.querySelectorAll('.account-menu-item'));
    const activeElement = document.activeElement;
    const currentIndex = menuItems.indexOf(activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % menuItems.length;
      menuItems[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
      menuItems[prevIndex].focus();
    }
  });

  // Click on menu item to close
  const menuItems = dropdownMenu.querySelectorAll('.account-menu-item');
  menuItems.forEach(item => {
    if (item.id !== 'account-logout') {
      item.addEventListener('click', closeDropdown);
    }
  });

  // Logout handler
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      localStorage.removeItem('currentUser');
      window.location.href = '../index.html';
    });
  }
});

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
