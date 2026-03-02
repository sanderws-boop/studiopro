(function() {
    "use strict";

    var menuEl = null;

    Studio.UI.ContextMenu = {
        init: function() {
            menuEl = document.createElement('div');
            menuEl.className = 'context-menu';
            menuEl.style.display = 'none';
            document.body.appendChild(menuEl);

            document.addEventListener('click', function() {
                Studio.UI.ContextMenu.hide();
            });
            document.addEventListener('contextmenu', function(e) {
                // Only intercept on specific areas
                if (!e.target.closest('.layer-item') && !e.target.closest('.canvas-area')) return;
                e.preventDefault();

                var items = [];

                if (e.target.closest('.layer-item')) {
                    var layerEl = e.target.closest('.layer-item');
                    var idx = parseInt(layerEl.dataset.index, 10);
                    items = [
                        { label: 'Duplicate Layer', action: function() { Studio.Systems.State.duplicateLayer(idx); } },
                        { label: 'Delete Layer', action: function() { Studio.Systems.State.removeLayer(idx); }, disabled: Studio.Systems.State.layers.length <= 1 },
                        { type: 'separator' },
                        { label: 'Move Up', action: function() { Studio.Systems.State.moveLayer(idx, idx - 1); }, disabled: idx === 0 },
                        { label: 'Move Down', action: function() { Studio.Systems.State.moveLayer(idx, idx + 1); }, disabled: idx >= Studio.Systems.State.layers.length - 1 },
                        { type: 'separator' },
                        { label: 'Toggle Visibility', action: function() {
                            var l = Studio.Systems.State.layers[idx];
                            if (l) { l.visible = !l.visible; Studio.Events.emit('state:layersChanged'); }
                        }}
                    ];
                } else if (e.target.closest('.canvas-area')) {
                    items = [
                        { label: 'Fullscreen', action: function() { Studio.Events.emit('toolbar:fullscreen'); } },
                        { label: 'Export PNG', action: function() { Studio.Events.emit('modal:export'); } },
                        { type: 'separator' },
                        { label: 'Randomize Seed', action: function() {
                            var layer = Studio.Systems.State.getSelectedLayer();
                            if (layer) {
                                Studio.Systems.State.updateLayerParam(Studio.Systems.State.selectedLayerIndex, 'seed', Math.random() * 1000);
                            }
                        }}
                    ];
                }

                if (items.length > 0) {
                    Studio.UI.ContextMenu.show(e.clientX, e.clientY, items);
                }
            });
        },

        show: function(x, y, items) {
            var html = '';
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.type === 'separator') {
                    html += '<div class="context-menu-separator"></div>';
                } else {
                    html += '<button class="context-menu-item' + (item.disabled ? ' disabled' : '') + '" data-index="' + i + '">' + item.label + '</button>';
                }
            }
            menuEl.innerHTML = html;
            menuEl.style.display = 'block';
            menuEl.style.left = x + 'px';
            menuEl.style.top = y + 'px';

            // Keep in viewport
            var rect = menuEl.getBoundingClientRect();
            if (rect.right > window.innerWidth) menuEl.style.left = (x - rect.width) + 'px';
            if (rect.bottom > window.innerHeight) menuEl.style.top = (y - rect.height) + 'px';

            // Bind clicks
            var btns = menuEl.querySelectorAll('.context-menu-item:not(.disabled)');
            for (var j = 0; j < btns.length; j++) {
                (function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var idx = parseInt(btn.dataset.index, 10);
                        if (items[idx] && items[idx].action) items[idx].action();
                        Studio.UI.ContextMenu.hide();
                    });
                })(btns[j]);
            }
        },

        hide: function() {
            if (menuEl) menuEl.style.display = 'none';
        }
    };
})();
