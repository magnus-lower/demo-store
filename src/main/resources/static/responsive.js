document.addEventListener('DOMContentLoaded', () => {
    // Back to top functionality
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile menu toggle
    window.toggleMobileMenu = function() {
        const categoryList = document.getElementById('category-list');
        categoryList.classList.toggle('active');
    };

    // Remove these event handlers from here since they're already in script.js
    // and having both can cause conflicts
});