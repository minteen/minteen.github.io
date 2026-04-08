// Enhanced mobile menu functionality
(function() {
  'use strict';

  class MobileMenu {
    constructor() {
      this.menuButton = null;
      this.menu = null;
      this.isOpen = false;
      this.init();
    }

    init() {
      this.menuButton = document.getElementById('mobile-menu-button');
      this.menu = document.getElementById('mobile-menu');
      
      if (this.menuButton && this.menu) {
        this.setupEventListeners();
      }
    }

    setupEventListeners() {
      // Menu button click
      this.menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.menu.contains(e.target) && !this.menuButton.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
        }
      });

      // Close menu when clicking menu items
      const menuItems = this.menu.querySelectorAll('a');
      menuItems.forEach(item => {
        item.addEventListener('click', () => {
          this.closeMenu();
        });
      });

      // Handle resize
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && this.isOpen) {
          this.closeMenu();
        }
      });
    }

    toggleMenu() {
      if (this.isOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    }

    openMenu() {
      if (this.isOpen) return;
      
      this.menu.classList.remove('hidden');
      this.isOpen = true;
      
      // Update button icon to X
      this.updateButtonIcon(true);
      
      // Add body scroll lock
      document.body.style.overflow = 'hidden';
      
      // Animate menu items
      this.animateMenuItems(true);
    }

    closeMenu() {
      if (!this.isOpen) return;
      
      this.menu.classList.add('hidden');
      this.isOpen = false;
      
      // Update button icon back to hamburger
      this.updateButtonIcon(false);
      
      // Remove body scroll lock
      document.body.style.overflow = '';
      
      // Reset animations
      this.animateMenuItems(false);
    }

    updateButtonIcon(isOpen) {
      const svg = this.menuButton.querySelector('svg');
      if (svg) {
        if (isOpen) {
          // X icon
          svg.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          `;
        } else {
          // Hamburger icon
          svg.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          `;
        }
      }
    }

    animateMenuItems(show) {
      const menuItems = this.menu.querySelectorAll('a, button');
      
      menuItems.forEach((item, index) => {
        if (show) {
          // Stagger animation in
          setTimeout(() => {
            item.style.transform = 'translateX(0)';
            item.style.opacity = '1';
          }, index * 50);
        } else {
          // Reset animation
          item.style.transform = 'translateX(-20px)';
          item.style.opacity = '0.8';
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MobileMenu());
  } else {
    new MobileMenu();
  }

  // Expose to global scope
  window.MobileMenu = MobileMenu;
})();