// Enhanced image lazy loading and optimization
(function() {
  'use strict';

  class ImageOptimizer {
    constructor() {
      this.observer = null;
      this.images = new Map();
      this.init();
    }

    init() {
      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver();
      } else {
        this.fallbackLoading();
      }
      
      this.setupImageErrorHandling();
      this.optimizeExistingImages();
    }

    setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      this.observeImages();
    }

    observeImages() {
      const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
      images.forEach(img => {
        if (!img.complete) {
          this.observer.observe(img);
        }
      });
    }

    loadImage(img) {
      const src = img.dataset.src || img.src;
      
      if (img.dataset.src) {
        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
          img.src = src;
          img.classList.add('loaded');
          img.style.opacity = '1';
          
          // Remove data-src after loading
          delete img.dataset.src;
          
          // Dispatch load event
          img.dispatchEvent(new Event('imageLoaded'));
        };
        
        imageLoader.onerror = () => {
          this.handleImageError(img);
        };
        
        imageLoader.src = src;
      } else {
        img.classList.add('loaded');
        img.style.opacity = '1';
      }
    }

    handleImageError(img) {
      img.classList.add('error');
      img.style.opacity = '1';
      
      // Show placeholder or fallback
      const placeholder = this.createPlaceholder(img.alt || '图片加载失败');
      img.parentNode.insertBefore(placeholder, img);
      img.style.display = 'none';
    }

    createPlaceholder(text) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm';
      placeholder.style.cssText = 'min-height: 200px; width: 100%;';
      placeholder.innerHTML = `
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
          </svg>
          <p>${text}</p>
        </div>
      `;
      return placeholder;
    }

    setupImageErrorHandling() {
      document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
          this.handleImageError(e.target);
        }
      }, true);
    }

    optimizeExistingImages() {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        // Add loading animation
        if (!img.complete && !img.classList.contains('loaded')) {
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.3s ease';
        }
        
        // Add responsive classes if not present
        if (!img.className.includes('w-') && !img.style.width) {
          img.classList.add('w-full', 'h-auto');
        }
        
        // Optimize for different screen sizes
        this.addResponsiveAttributes(img);
      });
    }

    addResponsiveAttributes(img) {
      if (!img.hasAttribute('loading') && 'loading' in HTMLImageElement.prototype) {
        img.setAttribute('loading', 'lazy');
      }
      
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    }

    fallbackLoading() {
      // Fallback for browsers without IntersectionObserver
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.dataset.src;
        delete img.dataset.src;
      });
    }

    // Public method to reinitialize for dynamic content
    reinitialize() {
      if (this.observer) {
        this.observeImages();
      }
      this.optimizeExistingImages();
    }
  }

  // Initialize when DOM is ready
  let imageOptimizer;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      imageOptimizer = new ImageOptimizer();
    });
  } else {
    imageOptimizer = new ImageOptimizer();
  }

  // Handle dynamic content updates
  if (typeof MutationObserver !== 'undefined') {
    const contentObserver = new MutationObserver((mutations) => {
      let hasNewImages = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'IMG' || node.querySelector('img')) {
                hasNewImages = true;
              }
            }
          });
        }
      });
      
      if (hasNewImages && imageOptimizer) {
        imageOptimizer.reinitialize();
      }
    });
    
    contentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Expose to global scope
  window.ImageOptimizer = ImageOptimizer;
})();