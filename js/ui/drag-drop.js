(function() {
    "use strict";

    var dragState = null;

    Studio.UI.DragDrop = {
        init: function() {
            // Will be called by layer panel to set up drag on layer items
        },

        makeDraggable: function(container, itemSelector, onReorder) {
            container.addEventListener('mousedown', function(e) {
                var handle = e.target.closest('.layer-drag-handle');
                if (!handle) return;

                var item = handle.closest(itemSelector);
                if (!item) return;

                e.preventDefault();
                var items = Array.prototype.slice.call(container.querySelectorAll(itemSelector));
                var startIndex = items.indexOf(item);
                var rect = item.getBoundingClientRect();
                var offsetY = e.clientY - rect.top;

                // Create placeholder
                var placeholder = document.createElement('div');
                placeholder.className = 'layer-item-placeholder';
                placeholder.style.height = rect.height + 'px';

                // Set up drag
                item.classList.add('dragging');
                item.style.position = 'fixed';
                item.style.width = rect.width + 'px';
                item.style.left = rect.left + 'px';
                item.style.top = (e.clientY - offsetY) + 'px';
                item.style.zIndex = '1000';
                item.style.pointerEvents = 'none';

                item.parentNode.insertBefore(placeholder, item.nextSibling);

                dragState = {
                    item: item,
                    placeholder: placeholder,
                    container: container,
                    itemSelector: itemSelector,
                    startIndex: startIndex,
                    currentIndex: startIndex,
                    offsetY: offsetY,
                    onReorder: onReorder
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        }
    };

    function onMouseMove(e) {
        if (!dragState) return;

        dragState.item.style.top = (e.clientY - dragState.offsetY) + 'px';

        // Find new position
        var items = Array.prototype.slice.call(
            dragState.container.querySelectorAll(dragState.itemSelector + ':not(.dragging)')
        );

        for (var i = 0; i < items.length; i++) {
            var r = items[i].getBoundingClientRect();
            var midY = r.top + r.height / 2;
            if (e.clientY < midY) {
                if (dragState.currentIndex !== i) {
                    dragState.container.insertBefore(dragState.placeholder, items[i]);
                    dragState.currentIndex = i;
                }
                return;
            }
        }
        // Past last item
        if (items.length > 0) {
            var last = items[items.length - 1];
            if (dragState.placeholder.nextSibling !== null || dragState.placeholder.parentNode !== dragState.container) {
                dragState.container.appendChild(dragState.placeholder);
            }
            dragState.currentIndex = items.length;
        }
    }

    function onMouseUp(e) {
        if (!dragState) return;

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Restore item
        dragState.item.classList.remove('dragging');
        dragState.item.style.position = '';
        dragState.item.style.width = '';
        dragState.item.style.left = '';
        dragState.item.style.top = '';
        dragState.item.style.zIndex = '';
        dragState.item.style.pointerEvents = '';

        // Insert at new position
        dragState.container.insertBefore(dragState.item, dragState.placeholder);
        if (dragState.placeholder.parentNode) {
            dragState.placeholder.parentNode.removeChild(dragState.placeholder);
        }

        // Callback
        if (dragState.startIndex !== dragState.currentIndex && dragState.onReorder) {
            dragState.onReorder(dragState.startIndex, dragState.currentIndex);
        }

        dragState = null;
    }
})();
