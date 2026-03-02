(function() {
    "use strict";
    var stack = [];
    var pointer = -1;
    var MAX = 50;

    Studio.Systems.History = {
        init: function() {
            stack = [];
            pointer = -1;
        },
        push: function() {
            var snapshot = Studio.Systems.State.toJSON();
            stack = stack.slice(0, pointer + 1);
            stack.push(JSON.stringify(snapshot));
            if (stack.length > MAX) stack.shift();
            pointer = stack.length - 1;
            Studio.Events.emit('state:historyChanged');
        },
        undo: function() {
            if (pointer <= 0) return;
            pointer--;
            Studio.Systems.State.fromJSON(JSON.parse(stack[pointer]));
            Studio.Events.emit('state:historyChanged');
            Studio.Events.emit('history:undo');
        },
        redo: function() {
            if (pointer >= stack.length - 1) return;
            pointer++;
            Studio.Systems.State.fromJSON(JSON.parse(stack[pointer]));
            Studio.Events.emit('state:historyChanged');
            Studio.Events.emit('history:redo');
        },
        canUndo: function() { return pointer > 0; },
        canRedo: function() { return pointer < stack.length - 1; },
        clear: function() { stack = []; pointer = -1; }
    };
})();
