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
        button: 0
    }, props || {}));
};
happen.drag = function (fromX, fromY, toX, toY, then, delay) {
    happen.at('mousemove', fromX, fromY);
    happen.at('mousedown', fromX, fromY);
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
        happen.at('mouseup', toX, toY);
        happen.at('click', toX, toY);
        if (then) { then(); }
    }, delay || 600);
};
happen.drawingClick = function (x, y) {
    this.at('mousedown', x, y);
    this.at('mouseup', x, y);
};
chai.Assertion.addMethod('nearLatLng', function (expected, delta) {
    delta = delta || 1e-4;
    expect(this._obj.lat).to.be.within(expected.lat - delta, expected.lat + delta);
    expect(this._obj.lng).to.be.within(expected.lng - delta, expected.lng + delta);
    return this;
});
var initMap = function (preferCanvas) {
    var startPoint = [43.1249, 1.254],
        map = L.map('map', {editable: true, preferCanvas: preferCanvas}).setView(startPoint, 16),
        tilelayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: 'OSM'}).addTo(map);
    return map;
}
var resetMap = function () {
    var el = qs('#map');
    el.innerHTML = 'Done';
    delete el._leaflet;
};
