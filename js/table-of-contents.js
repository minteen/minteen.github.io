// Table of Contents (TOC) functionality
(function() {
  'use strict';

  class TableOfContents {
    constructor() {
      this.toc = null;
      this.headings = [];
      this.tocContainer = null;
      this.isVisible = false;
      this.activeId = null;
      this.init();
    }

    init() {
      this.collectHeadings();
      
      if (this.headings.length > 1) {
        this.createTOC();
        this.setupScrollSpy();
        this.setupEventListeners();
      }
    }

    collectHeadings() {
      const content = document.querySelector('.content-wrapper, .prose, .prose-lg, main article');
      if (!content) return;

      const headingSelectors = 'h1, h2, h3, h4, h5, h6';
      const headingElements = content.querySelectorAll(headingSelectors);

      this.headings = Array.from(headingElements).map((heading, index) => {
        // Create ID if doesn't exist
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        return {
          id: heading.id,
          text: heading.textContent.trim(),
          level: parseInt(heading.tagName.charAt(1)),
          element: heading
        };
      });
    }

    createTOC() {
      // Create TOC container
      this.tocContainer = document.createElement('div');
      this.tocContainer.id = 'toc-container';
      this.tocContainer.className = 'fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block';

      // Create TOC button
      const tocButton = document.createElement('button');
      tocButton.id = 'toc-toggle';
      tocButton.className = 'p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 mb-4';
      tocButton.innerHTML = `
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
        </svg>
      `;
      tocButton.title = '目录';

      // Create TOC panel
      const tocPanel = document.createElement('div');
      tocPanel.id = 'toc-panel';
      tocPanel.className = 'w-80 max-h-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden transform scale-0 origin-top-right transition-all duration-300';

      // Create TOC header
      const tocHeader = document.createElement('div');
      tocHeader.className = 'px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between';
      tocHeader.innerHTML = `
        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">目录</h3>
        <button id="toc-close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      `;

      // Create TOC content
      const tocContent = document.createElement('div');
      tocContent.className = 'max-h-80 overflow-y-auto p-2';
      tocContent.innerHTML = this.generateTOCHTML();

      // Assemble TOC
      tocPanel.appendChild(tocHeader);
      tocPanel.appendChild(tocContent);
      this.tocContainer.appendChild(tocButton);
      this.tocContainer.appendChild(tocPanel);

      // Add to page
      document.body.appendChild(this.tocContainer);

      // Store references
      this.toc = tocPanel;
    }

    generateTOCHTML() {
      let html = '';
      let currentLevel = 0;
      let openLevels = [];

      this.headings.forEach((heading, index) => {
        const level = heading.level;
        const indent = Math.max(0, (level - 2) * 1); // h2 = 0, h3 = 1, h4 = 2, etc.

        // Handle nesting
        if (level > currentLevel) {
          // Opening new level
          while (currentLevel < level) {
            currentLevel++;
            openLevels.push(currentLevel);
          }
        } else if (level < currentLevel) {
          // Closing levels
          while (currentLevel > level) {
            openLevels.pop();
            currentLevel--;
          }
        }

        html += `
          <a href="#${heading.id}" 
             class="toc-link block py-2 px-3 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ${index === 0 ? 'active' : ''}"
             style="margin-left: ${indent * 0.75}rem; border-left: ${indent > 0 ? '2px solid rgba(156, 163, 175, 0.3)' : 'none'}; ${indent > 0 ? 'padding-left: 0.75rem' : ''}"
             data-heading-id="${heading.id}">
            ${heading.text}
          </a>
        `;
      });

      return html;
    }

    setupEventListeners() {
      const tocButton = document.getElementById('toc-toggle');
      const tocPanel = document.getElementById('toc-panel');
      const tocClose = document.getElementById('toc-close');
      const tocLinks = document.querySelectorAll('.toc-link');

      // Toggle TOC
      tocButton?.addEventListener('click', () => this.toggleTOC());
      tocClose?.addEventListener('click', () => this.hideTOC());

      // TOC link clicks
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          this.scrollToHeading(targetId);
          this.hideTOC();
        });
      });

      // Close TOC when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isVisible && 
            !this.tocContainer.contains(e.target) && 
            !e.target.closest('#toc-container')) {
          this.hideTOC();
        }
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) {
          this.hideTOC();
        } else if ((e.ctrlKey || e.metaKey) && e.key === '.') {
          e.preventDefault();
          this.toggleTOC();
        }
      });
    }

    setupScrollSpy() {
      const options = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setActiveHeading(entry.target.id);
          }
        });
      }, options);

      this.headings.forEach(heading => {
        observer.observe(heading.element);
      });

      // Also update on scroll for better responsiveness
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateActiveHeadingOnScroll();
            ticking = false;
          });
          ticking = true;
        }
      });
    }

    updateActiveHeadingOnScroll() {
      const scrollPosition = window.pageYOffset + window.innerHeight * 0.3;
      let activeHeading = null;

      for (let i = this.headings.length - 1; i >= 0; i--) {
        const heading = this.headings[i];
        if (heading.element.offsetTop <= scrollPosition) {
          activeHeading = heading.id;
          break;
        }
      }

      if (activeHeading && activeHeading !== this.activeId) {
        this.setActiveHeading(activeHeading);
      }
    }

    setActiveHeading(headingId) {
      this.activeId = headingId;

      // Update TOC links
      const tocLinks = document.querySelectorAll('.toc-link');
      tocLinks.forEach(link => {
        const isActive = link.getAttribute('data-heading-id') === headingId;
        link.classList.toggle('active', isActive);
        
        if (isActive) {
          link.classList.add('text-blue-600', 'dark:text-blue-400', 'bg-blue-50', 'dark:bg-blue-900/30', 'font-medium');
          link.classList.remove('text-gray-600', 'dark:text-gray-300');
          
          // Scroll link into view if TOC is visible
          if (this.isVisible) {
            link.scrollIntoView({ 
              block: 'nearest', 
              behavior: 'smooth' 
            });
          }
        } else {
          link.classList.remove('text-blue-600', 'dark:text-blue-400', 'bg-blue-50', 'dark:bg-blue-900/30', 'font-medium');
          link.classList.add('text-gray-600', 'dark:text-gray-300');
        }
      });
    }

    toggleTOC() {
      if (this.isVisible) {
        this.hideTOC();
      } else {
        this.showTOC();
      }
    }

    showTOC() {
      if (!this.toc) return;
      
      this.toc.classList.remove('scale-0');
      this.toc.classList.add('scale-100');
      this.isVisible = true;
    }

    hideTOC() {
      if (!this.toc) return;
      
      this.toc.classList.remove('scale-100');
      this.toc.classList.add('scale-0');
      this.isVisible = false;
    }

    scrollToHeading(headingId) {
      const heading = document.getElementById(headingId);
      if (heading) {
        const offset = 80; // Account for fixed header
        const elementPosition = heading.offsetTop;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TableOfContents());
  } else {
    new TableOfContents();
  }

  // Expose to global scope
  window.TableOfContents = TableOfContents;
})();