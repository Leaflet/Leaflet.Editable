var qs = function (selector) {return document.querySelector(selector);};
var qsa = function (selector) {return document.querySelectorAll(selector);};
happen.at = function (what, x, y, props) {
    this.once(document.elementFromPoint(x, y), L.Util.extend({
        type: what,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        which: 1,
        button: 1
    }, props || {}));
};
happen.drag = function (fromX, fromY, toX, toY, then) {
    happen.at('mousemove', fromX, fromY);
    happen.at('mousedown', fromX, fromY, {button: 0});
    var moveX = function () {
        if (fromX <= toX) {
            happen.at('mousemove', fromX++, fromY);
            window.setTimeout(moveX, 5);
        }
    };
    moveX();
    var moveY = function () {
        if (fromY <= toY) {
            happen.at('mousemove', fromX, fromY++);
            window.setTimeout(moveY, 5);
        }
    };
    moveY();
    window.setTimeout(function () {
        happen.at('mouseup', toX, toY, {button: 0});
        if (then) then();
    }, 1000);
};
