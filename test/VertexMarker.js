describe('L.Editable.VertexMarker', function() {
    var polyline, p2ll;

    before(function () {
        this.map = map;
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
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

});
