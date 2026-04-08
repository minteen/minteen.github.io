// Theme switcher functionality
(function() {
  'use strict';

  const STORAGE_KEY = 'halunhaku-theme';
  const THEME_ATTR = 'data-theme';
  
  // Theme configurations
  const themes = {
    light: {
      name: '浅色',
      icon: '☀️'
    },
    dark: {
      name: '深色', 
      icon: '🌙'
    },
    auto: {
      name: '跟随系统',
      icon: '🌓'
    }
  };

  class ThemeSwitcher {
    constructor() {
      this.currentTheme = this.getStoredTheme() || 'auto';
      this.init();
    }

    init() {
      // 不再创建浮动按钮，使用头部模板中的按钮
      this.setupMobileThemeSwitcher();
      this.applyTheme(this.currentTheme);
      this.setupMediaQuery();
      this.setupEventListeners();
    }

    getStoredTheme() {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return null;
      }
    }

    setStoredTheme(theme) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        console.warn('无法保存主题设置');
      }
    }

    getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // 不再需要创建浮动按钮，使用头部模板中的按钮

    setupEventListeners() {
      // 桌面端主题切换按钮（导航栏中）
      const desktopButton = document.getElementById('desktop-theme-switcher');
      if (desktopButton) {
        desktopButton.addEventListener('click', () => this.toggleTheme());
      }
      
      // 移动端菜单中的主题切换
      const mobileButton = document.getElementById('mobile-theme-switcher');
      if (mobileButton) {
        mobileButton.addEventListener('click', () => {
          this.toggleTheme();
          // 关闭移动菜单
          this.closeMobileMenu();
        });
      }
      
      // 确保移动搜索按钮也能关闭菜单（如果没有搜索脚本处理）
      const mobileSearchButton = document.getElementById('mobile-search-toggle');
      if (mobileSearchButton && !mobileSearchButton.hasAttribute('data-search-handled')) {
        mobileSearchButton.addEventListener('click', () => {
          this.closeMobileMenu();
        });
        mobileSearchButton.setAttribute('data-search-handled', 'true');
      }
    }

    // 不再需要位置调整，使用导航栏集成按钮

    setupMediaQuery() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme('auto');
        }
      });
    }

    toggleTheme() {
      const themes = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(this.currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      const nextTheme = themes[nextIndex];
      
      this.setTheme(nextTheme);
    }

    setTheme(theme) {
      this.currentTheme = theme;
      this.setStoredTheme(theme);
      this.applyTheme(theme);
      this.updateButton();
    }

    applyTheme(theme) {
      const effectiveTheme = theme === 'auto' ? this.getSystemTheme() : theme;
      
      document.documentElement.setAttribute(THEME_ATTR, effectiveTheme);
      
      // Update CSS custom properties for the effective theme
      this.updateCSSVariables(effectiveTheme);
      
      // Dispatch theme change event
      window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme, effectiveTheme }
      }));
    }

    updateCSSVariables(effectiveTheme) {
      const root = document.documentElement;
      
      if (effectiveTheme === 'dark') {
        root.style.setProperty('--primary-color', '#3b82f6');
        root.style.setProperty('--background-color', '#0f172a');
        root.style.setProperty('--text-primary-color', '#f8fafc');
        root.style.setProperty('--text-secondary-color', '#cbd5e1');
        root.style.setProperty('--border-color', '#334155');
        root.style.setProperty('--secondary-color', '#1e293b');
      } else {
        root.style.setProperty('--primary-color', '#0c7ff2');
        root.style.setProperty('--background-color', '#ffffff');
        root.style.setProperty('--text-primary-color', '#111827');
        root.style.setProperty('--text-secondary-color', '#6b7280');
        root.style.setProperty('--border-color', '#e5e7eb');
        root.style.setProperty('--secondary-color', '#f3f4f6');
      }
    }

    updateButton() {
      // 更新桌面端按钮（导航栏中）
      const desktopButton = document.getElementById('desktop-theme-switcher');
      const desktopIcon = document.getElementById('desktop-theme-icon');
      const desktopText = document.getElementById('desktop-theme-text');
      
      if (desktopIcon) {
        desktopIcon.textContent = themes[this.currentTheme].icon;
      }
      if (desktopText) {
        desktopText.textContent = themes[this.currentTheme].name;
      }
      if (desktopButton) {
        desktopButton.title = `当前主题：${themes[this.currentTheme].name}`;
      }
      
      // 更新移动端按钮
      this.updateMobileButton();
    }

    setupMobileThemeSwitcher() {
      // 初始化移动端按钮状态
      this.updateMobileButton();
    }

    updateMobileButton() {
      const mobileIcon = document.getElementById('mobile-theme-icon');
      const mobileText = document.getElementById('mobile-theme-text');
      
      if (mobileIcon && mobileText) {
        mobileIcon.textContent = themes[this.currentTheme].icon;
        mobileText.textContent = `主题：${themes[this.currentTheme].name}`;
      }
    }

    closeMobileMenu() {
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      
      if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.add('hidden');
        // 恢复汉堡包图标
        const svg = mobileMenuButton.querySelector('svg');
        if (svg) {
          svg.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          `;
        }
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ThemeSwitcher());
  } else {
    new ThemeSwitcher();
  }

  // Expose to global scope for debugging
  window.ThemeSwitcher = ThemeSwitcher;
})();