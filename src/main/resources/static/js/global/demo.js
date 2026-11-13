// Small shared helpers for API errors, safe rendering and keyboard-accessible dialogs.
window.Demo = {
    async request(url, options = {}) {
        let response;
        try {
            response = await fetch(url, options);
        } catch {
            throw new Error('Kunne ikke kontakte serveren. Prøv igjen.');
        }
        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error('Serveren returnerte et uventet svar. Prøv igjen.');
        }
        if (!response.ok) {
            const error = new Error(data.message || 'Forespørselen kunne ikke fullføres.');
            error.status = response.status;
            error.errors = data.errors || {};
            if (response.status === 401 && options.headers?.Authorization) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            throw error;
        }
        return data;
    },
    element(tag, className = '', text = '') {
        const node = document.createElement(tag);
        node.className = className;
        node.textContent = text;
        return node;
    },
    image(src, alt, className = '') {
        const image = Demo.element('img', className);
        image.src = '/images/all-products.jpg';
        try {
            const url = new URL(src, window.location.origin);
            if (['http:', 'https:'].includes(url.protocol)) image.src = url.href;
        } catch {
            // Invalid catalog URLs use the existing fallback image.
        }
        image.alt = alt;
        return image;
    },
    dialog(modal, backdrop) {
        let previousFocus;
        const close = () => {
            modal.style.display = 'none';
            if (backdrop) backdrop.style.display = 'none';
            previousFocus?.focus();
        };
        modal.addEventListener('click', event => {
            if (event.target === modal || event.target.closest('[data-close-dialog]')) close();
        });
        if (backdrop) backdrop.addEventListener('click', close);
        modal.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            } else if (event.key === 'Tab') {
                const controls = [...modal.querySelectorAll('button, a[href], input, [tabindex="0"]')]
                    .filter(node => !node.disabled && node.getClientRects().length);
                const first = controls[0], last = controls[controls.length - 1];
                if (!first) {
                    event.preventDefault();
                    modal.focus();
                } else if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
        return {
            open(trigger = document.activeElement) {
                previousFocus = trigger;
                modal.style.display = 'block';
                if (backdrop) backdrop.style.display = 'block';
                (modal.querySelector('button, a[href], input') || modal).focus();
            },
            close
        };
    }
};
