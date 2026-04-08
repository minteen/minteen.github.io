// Enhanced search functionality
(function() {
  'use strict';

  class SearchEngine {
    constructor() {
      this.searchData = [];
      this.searchIndex = null;
      this.isInitialized = false;
      this.searchContainer = null;
      this.init();
    }

    async init() {
      await this.loadSearchData();
      this.createSearchInterface();
      this.setupEventListeners();
      this.setupKeyboardShortcuts();
    }

    async loadSearchData() {
      try {
        const response = await fetch('/search.json');
        this.searchData = await response.json();
        this.buildSearchIndex();
        this.isInitialized = true;
      } catch (error) {
        console.warn('搜索数据加载失败:', error);
      }
    }

    buildSearchIndex() {
      // Simple search index for better performance
      this.searchIndex = this.searchData.map(item => ({
        ...item,
        searchText: (item.title + ' ' + item.content + ' ' + (item.tags || []).join(' ') + ' ' + (item.categories || []).join(' ')).toLowerCase()
      }));
    }

    createSearchInterface() {
      // 不再自动创建按钮，使用头部模板中的按钮
      // 直接创建搜索模态框
      this.createSearchModal();
    }

    createSearchModal() {
      const modal = document.createElement('div');
      modal.id = 'search-modal';
      modal.className = 'fixed inset-0 z-50 hidden bg-black/50 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="relative">
                <input
                  type="text"
                  id="search-input"
                  placeholder="搜索文章..."
                  class="w-full px-4 py-3 pr-12 text-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autocomplete="off"
                  spellcheck="false"
                >
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <kbd class="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">ESC</kbd>
                </div>
              </div>
            </div>
            <div class="flex-1 overflow-hidden">
              <div id="search-results" class="max-h-96 overflow-y-auto p-6">
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                  开始输入以搜索文章...
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.searchContainer = modal;
    }

    setupEventListeners() {
      const searchButton = document.getElementById('search-toggle');
      const mobileSearchButton = document.getElementById('mobile-search-toggle');
      const searchModal = document.getElementById('search-modal');
      const searchInput = document.getElementById('search-input');

      // 桌面端搜索按钮
      if (searchButton) {
        searchButton.addEventListener('click', () => this.openSearch());
      }
      
      // 移动端搜索按钮
      if (mobileSearchButton) {
        mobileSearchButton.addEventListener('click', () => {
          this.openSearch();
          this.closeMobileMenu();
        });
      }

      if (searchModal) {
        searchModal.addEventListener('click', (e) => {
          if (e.target === searchModal) {
            this.closeSearch();
          }
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.performSearch(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.closeSearch();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateResults('down');
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateResults('up');
          } else if (e.key === 'Enter') {
            e.preventDefault();
            this.selectResult();
          }
        });
      }
    }

    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.openSearch();
        } else if (e.key === 'Escape') {
          this.closeSearch();
        }
      });
    }

    openSearch() {
      const modal = document.getElementById('search-modal');
      const input = document.getElementById('search-input');
      
      if (modal && input) {
        modal.classList.remove('hidden');
        setTimeout(() => input.focus(), 100);
      }
    }

    closeSearch() {
      const modal = document.getElementById('search-modal');
      const input = document.getElementById('search-input');
      
      if (modal) {
        modal.classList.add('hidden');
      }
      
      if (input) {
        input.value = '';
        this.clearResults();
      }
    }

    performSearch(query) {
      if (!this.isInitialized || !query.trim()) {
        this.clearResults();
        return;
      }

      const results = this.search(query.toLowerCase());
      this.displayResults(results, query);
    }

    search(query) {
      const results = [];
      const terms = query.split(/\s+/).filter(term => term.length > 0);

      this.searchIndex.forEach(item => {
        let score = 0;
        
        terms.forEach(term => {
          if (item.title.toLowerCase().includes(term)) {
            score += 3; // Title matches are weighted higher
          }
          if (item.searchText.includes(term)) {
            score += 1;
          }
        });

        if (score > 0) {
          results.push({ ...item, score });
        }
      });

      return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    displayResults(results, query) {
      const container = document.getElementById('search-results');
      
      if (!container) return;

      if (results.length === 0) {
        container.innerHTML = `
          <div class="text-center text-gray-500 dark:text-gray-400 py-8">
            没有找到关于 "${query}" 的结果
          </div>
        `;
        return;
      }

      const resultItems = results.map((result, index) => `
        <a href="${result.url}" 
           class="search-result-item block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}"
           data-index="${index}">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
            ${this.highlightText(result.title, query)}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            ${this.highlightText(this.truncateText(result.content, 120), query)}
          </p>
          <div class="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <time>${this.formatDate(result.date)}</time>
            ${result.categories ? `<span>·</span><span>${result.categories[0]}</span>` : ''}
          </div>
        </a>
      `).join('');

      container.innerHTML = resultItems;
    }

    highlightText(text, query) {
      const terms = query.split(/\s+/).filter(term => term.length > 0);
      let highlighted = text;
      
      terms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>');
      });
      
      return highlighted;
    }

    truncateText(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text;
    }

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }

    navigateResults(direction) {
      const results = document.querySelectorAll('.search-result-item');
      const current = document.querySelector('.search-result-item.bg-gray-50, .search-result-item.dark\\:bg-gray-700');
      
      if (results.length === 0) return;

      let currentIndex = current ? parseInt(current.dataset.index) : -1;
      let nextIndex;

      if (direction === 'down') {
        nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
      }

      // Remove current selection
      results.forEach(item => {
        item.classList.remove('bg-gray-50', 'dark:bg-gray-700');
      });

      // Add new selection
      results[nextIndex].classList.add('bg-gray-50', 'dark:bg-gray-700');
      results[nextIndex].scrollIntoView({ block: 'nearest' });
    }

    selectResult() {
      const selected = document.querySelector('.search-result-item.bg-gray-50, .search-result-item.dark\\:bg-gray-700');
      if (selected) {
        window.location.href = selected.href;
      }
    }

    clearResults() {
      const container = document.getElementById('search-results');
      if (container) {
        container.innerHTML = `
          <div class="text-center text-gray-500 dark:text-gray-400 py-8">
            开始输入以搜索文章...
          </div>
        `;
      }
    }
    
    closeMobileMenu() {
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      
      if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.add('hidden');
        // 恢复汉包包图标
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        `;
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SearchEngine());
  } else {
    new SearchEngine();
  }
})();