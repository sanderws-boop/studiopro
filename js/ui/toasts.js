(function() {
    "use strict";

    var container = null;

    Studio.UI.Toasts = {
        init: function() {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        },

        show: function(message, type, duration) {
            if (!container) this.init();
            type = type || 'info';
            duration = duration || 3000;

            var toast = document.createElement('div');
            toast.className = 'toast toast-' + type;

            var icons = {
                success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
                error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
                info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
                warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            };

            toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
                '<span class="toast-message">' + message + '</span>';

            container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(function() {
                toast.classList.add('toast-visible');
            });

            setTimeout(function() {
                toast.classList.remove('toast-visible');
                toast.classList.add('toast-hiding');
                setTimeout(function() {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 300);
            }, duration);
        }
    };
})();
