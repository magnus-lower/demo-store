document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('back-to-top');

    if (button) {
        let ticking = false;
        const update = () => {
            button.classList.toggle('is-visible', window.scrollY > 240);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, {passive: true});

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
            });
        });

        update();
    }

    window.toggleMobileMenu = function() {
        window.toggleCategories?.();
    };
});
