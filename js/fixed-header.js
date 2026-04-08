// Fixed header scroll enhancement
(function() {
  'use strict';

  class FixedHeader {
    constructor() {
      this.header = null;
      this.lastScrollY = 0;
      this.scrollThreshold = 50;
      this.init();
    }

    init() {
      this.header = document.querySelector('header.fixed');
      if (!this.header) return;

      this.setupScrollListener();
      this.handleInitialState();
    }

    setupScrollListener() {
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    handleScroll() {
      const currentScrollY = window.pageYOffset;
      
      // Add scrolled class when scrolled down
      if (currentScrollY > this.scrollThreshold) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }

      this.lastScrollY = currentScrollY;
    }

    handleInitialState() {
      // Check initial scroll position
      const currentScrollY = window.pageYOffset;
      if (currentScrollY > this.scrollThreshold) {
        this.header.classList.add('scrolled');
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FixedHeader());
  } else {
    new FixedHeader();
  }

  // Expose to global scope
  window.FixedHeader = FixedHeader;
})();