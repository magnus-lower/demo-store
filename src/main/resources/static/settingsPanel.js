export function initSettingsPanel() {
    const settingsToggle = document.querySelector('.settings-toggle');
    const settingsDropdown = document.getElementById('settings-dropdown');

    if (!settingsToggle || !settingsDropdown) return;

    // Toggle settings dropdown
    settingsToggle.addEventListener('click', () => {
        settingsDropdown.classList.toggle('visible');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsToggle.contains(e.target) && !settingsDropdown.contains(e.target)) {
            settingsDropdown.classList.remove('visible');
        }
    });

    // Language toggle functionality
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('flag-icon')) {
                const lang = target.id.split('-')[0]; // Extract 'en' or 'no' from id
                localStorage.setItem('language', lang);
                // We import updateLanguage lazily to avoid circular deps
                import('./language.js').then(mod => mod.updateLanguage(lang));
            }
        });
    }

    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Initialize dark mode based on stored preference
        const isDarkMode = localStorage.getItem('dark-mode') === 'true';
        darkModeToggle.checked = isDarkMode;
        toggleDarkMode(isDarkMode);

        darkModeToggle.addEventListener('change', (e) => {
            const isDark = e.target.checked;
            toggleDarkMode(isDark);
            localStorage.setItem('dark-mode', isDark.toString());
        });
    }

    function toggleDarkMode(isDark) {
        const html = document.documentElement;
        const body = document.body;
        
        if (isDark) {
            html.classList.add('dark-mode');
            body.classList.add('dark-mode');
        } else {
            html.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
        }
    }

    // Initialize dark mode on page load
    const storedDarkMode = localStorage.getItem('dark-mode');
    if (storedDarkMode === 'true') {
        toggleDarkMode(true);
        if (darkModeToggle) {
            darkModeToggle.checked = true;
        }
    }
}
