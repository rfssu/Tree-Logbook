const ThemeManager = {
    init() {
        // Check local storage or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    toggle() {
        const isDark = document.documentElement.classList.contains('dark');

        // Use View Transitions API if available (Chrome 111+, Edge 111+)
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                this._applyTheme(!isDark);
            });
        } else {
            // Fallback: Use requestAnimationFrame for smoother repaint
            requestAnimationFrame(() => {
                this._applyTheme(!isDark);
            });
        }
    },

    _applyTheme(dark) {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
        // Dispatch event for components that might need to react
        window.dispatchEvent(new Event('theme-changed'));
    },

    isDark() {
        return document.documentElement.classList.contains('dark');
    }
};

// Initialize on load
ThemeManager.init();
