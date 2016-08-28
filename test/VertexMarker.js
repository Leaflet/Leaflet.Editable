'use strict';
describe('L.Editable.VertexMarker', function() {
    var polyline, p2ll;

    before(function () {
        this.map = map;
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
    });

    afterEach(function () {
        this.map.editTools.editLayer.eachLayer(function (layer) {
            assert.fail(layer, null, 'no layer expected but one found');
        });
    });

    describe('#split', function () {

        it('should split line at its index', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[1].__vertex.split();
            layer.disableEdit();
            assert.deepEqual(layer._latlngs, [[p2ll(100, 150), p2ll(150, 200)], [p2ll(150, 200), p2ll(200, 100)]]);
            layer.remove();
        });

    });

    describe('#continue', function () {

        it('should continue backward on first index', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[0].__vertex.continue();
            happen.drawingClick(200, 200);
            assert.equal(layer._latlngs.length, 4);
            happen.at('click', 200, 200);  // Finish shape
            happen.at('click', 250, 250);  // Click elsewhere on the map
            assert.equal(layer._latlngs.length, 4);
            layer.disableEdit();
            layer.remove();
        });

        it('should continue backward on first index of multi', function () {
            var latlngs = [
                    [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                ],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[0][0].__vertex.continue();
            happen.drawingClick(200, 200);
            assert.equal(layer._latlngs[0].length, 4);
            happen.at('click', 200, 200);  // Finish shape
            happen.drawingClick(250, 250);  // Drawing click elsewhere on the map
            assert.equal(layer._latlngs[0].length, 4);
            layer._latlngs[1][0].__vertex.continue();
            happen.drawingClick(400, 400);
            assert.equal(layer._latlngs[1].length, 4);
            happen.at('click', 400, 400);  // Finish shape
            happen.drawingClick(450, 450);  // Drawing click elsewhere on the map
            assert.equal(layer._latlngs[1].length, 4);
            layer.remove();
        });

        it('should continue forward on last index', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[2].__vertex.continue();
            happen.drawingClick(200, 200);
            assert.equal(layer._latlngs.length, 4);
            happen.at('click', 200, 200);  // Finish shape
            happen.at('click', 250, 250);  // Click elsewhere on the map
            assert.equal(layer._latlngs.length, 4);
            layer.disableEdit();
            layer.remove();
        });

        it('should continue forward on first index of multi', function () {
            var latlngs = [
                    [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                ],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[0][2].__vertex.continue();
            happen.drawingClick(200, 200);
            assert.equal(layer._latlngs[0].length, 4);
            happen.at('click', 200, 200);  // Finish shape
            happen.drawingClick(250, 250);  // Drawing click elsewhere on the map
            assert.equal(layer._latlngs[0].length, 4);
            layer._latlngs[1][2].__vertex.continue();
            happen.drawingClick(400, 400);
            assert.equal(layer._latlngs[1].length, 4);
            happen.at('click', 400, 400);  // Finish shape
            happen.drawingClick(450, 450);  // Drawing click elsewhere on the map
            assert.equal(layer._latlngs[1].length, 4);
            layer.remove();
        });

        it('should do nothing if not first and not last index', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[1].__vertex.continue();
            happen.at('mousemove', 200, 200);
            happen.at('click', 200, 200);
            assert.equal(layer._latlngs.length, 3);
            layer.disableEdit();
            layer.remove();
        });

        it('should allow committing on clicked vertex', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[0].__vertex.continue();
            happen.at('click', 100, 150);
            assert.equal(layer._latlngs.length, 3);
            assert.equal(layer.editor.drawing(), false);
            layer.disableEdit();
            layer.remove();
        });

    });

});
