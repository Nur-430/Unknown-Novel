/**
 * Smooth Page Transitions
 * Adds smooth fade effects when navigating between pages
 */

(function () {
    'use strict';

    // Duration of fade animation (should match CSS)
    const TRANSITION_DURATION = 250; // 250ms

    /**
     * Navigate to a new page with smooth transition
     * @param {string} url - URL to navigate to
     */
    function smoothNavigate(url) {
        // Add transitioning class to trigger fade-out
        document.body.classList.add('page-transitioning-out');

        // Navigate after animation completes
        setTimeout(() => {
            window.location.href = url;
        }, TRANSITION_DURATION);
    }

    /**
     * Initialize page transitions
     */
    function init() {
        // Intercept all internal navigation links
        document.addEventListener('click', function (e) {
            // Find the closest anchor tag
            const link = e.target.closest('a');

            // Check if it's a valid internal link
            if (link &&
                link.href &&
                link.getAttribute('href') &&
                !link.getAttribute('href').startsWith('#') &&
                !link.getAttribute('href').startsWith('javascript:') &&
                !link.target &&
                !link.hasAttribute('download') &&
                link.hostname === window.location.hostname) {

                // Prevent default navigation
                e.preventDefault();

                // Navigate with transition
                smoothNavigate(link.href);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('pageshow', function (event) {
            // Remove transition class if page is shown from cache
            if (event.persisted) {
                document.body.classList.remove('page-transitioning-out');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose smoothNavigate globally for programmatic navigation
    window.smoothNavigate = smoothNavigate;
})();
