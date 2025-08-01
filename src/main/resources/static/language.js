// js/modules/language.js
import { initTypingEffects, restartTypingEffects } from './typing.js';

export function updateLanguage(lang, firstLoad = false) {
    document.querySelectorAll('[data-en]').forEach(el => {
        if (el.id && el.id.startsWith('typing-')) return;

        el.textContent = lang === 'no'
            ? el.getAttribute('data-no')
            : el.getAttribute('data-en');
    });

    const typingEffect = document.getElementById('typing-effect');
    if (typingEffect) {
        typingEffect.textContent = lang === 'no'
            ? typingEffect.getAttribute('data-no')
            : typingEffect.getAttribute('data-en');
    }

    // Update theme mode text explicitly (to handle the dynamic dark/light mode label)
    const themeModeText = document.getElementById('theme-mode-text');
    if (themeModeText) {
        themeModeText.textContent = lang === 'no'
            ? themeModeText.getAttribute('data-no')
            : themeModeText.getAttribute('data-en');
    }

    const resumeText = document.querySelector('.resume-text');
    if (resumeText) {
        resumeText.textContent = lang === 'no' ? 'CV' : 'Resume';
    }

    const resumeLink = document.getElementById('resume-link');
    if (resumeLink) {
        resumeLink.href = lang === 'no'
            ? 'assets/norwegian_cv.pdf'
            : 'assets/english_cv.pdf';
    }

    document.documentElement.lang = lang;

    // Update flag opacities
    const enFlag = document.getElementById('en-flag');
    const noFlag = document.getElementById('no-flag');

    if (enFlag && noFlag) {
        enFlag.style.opacity = lang === 'en' ? '1' : '0.5';
        noFlag.style.opacity = lang === 'no' ? '1' : '0.5';
    }

    if (firstLoad) initTypingEffects();
    else restartTypingEffects();
}

export function initLanguageSwitcher() {
    let lang = localStorage.getItem('language');
    if (!lang) {
        lang = 'no'; // Bare bruk norsk hvis det ikke finnes noe fra før
        localStorage.setItem('language', lang);
    }
    updateLanguage(lang, true);
}