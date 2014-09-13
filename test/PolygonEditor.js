describe('L.PolygonEditor', function() {
    var mouse, polygon;

    before(function () {
        this.map = map;
    });

    describe('#startNewPolygon()', function() {

        it('should create feature and editor', function() {
            polygon = this.map.editTools.startPolygon();
            assert.ok(polygon);
            assert.ok(polygon.editor);
            assert.notOk(polygon._latlngs[0].length);
        });

        it('should create latlng on click', function () {
            happen.at('mousemove', 100, 150);
            happen.at('click', 100, 150);
            assert.equal(polygon._latlngs[0].length, 1);
            happen.at('mousemove', 200, 350);
            happen.at('click', 200, 350);
            assert.equal(polygon._latlngs[0].length, 2);
            happen.at('mousemove', 300, 250);
            happen.at('click', 300, 250);
            assert.equal(polygon._latlngs[0].length, 3);
            happen.at('mousemove', 300, 150);
            happen.at('click', 300, 150);
            assert.equal(polygon._latlngs[0].length, 4);
        });

        it('should finish shape on last point click', function () {
            happen.at('click', 300, 150);
            assert.equal(polygon._latlngs[0].length, 4);
        });

        it('should finish drawing also on first point', function() {
            var other = this.map.editTools.startPolygon();
            assert.notOk(other._latlngs[0].length);
            happen.at('mousemove', 400, 450);
            happen.at('click', 400, 450);
            assert.equal(other._latlngs[0].length, 1);
            happen.at('mousemove', 450, 500);
            happen.at('click', 450, 500);
            assert.equal(other._latlngs[0].length, 2);
            happen.at('mousemove', 300, 450);
            happen.at('click', 300, 450);
            assert.equal(other._latlngs[0].length, 3);
            happen.at('click', 400, 450);
            assert.equal(other._latlngs[0].length, 3);
            this.map.removeLayer(other);
        });

    });

    describe('#disable()', function () {

        it('should stop editing on disable() call', function () {
            polygon.disableEdit();
            assert.notOk(polygon.editor);
        });

    });

    describe('#enable()', function () {

        it('should start editing on enable() call', function () {
            polygon.enableEdit();
            assert.ok(polygon.editor);
        });

    });

    describe('#dragVertex()', function () {

        it('should update latlng on vertex drag', function (done) {
            var before = polygon._latlngs[0][2].lat,
                self = this;
            happen.drag(300, 250, 310, 260, function () {
                assert.notEqual(before, polygon._latlngs[0][2].lat);
                done();
            });
        });

    });

    describe('#deleteVertex()', function () {

        it('should delete latlng on vertex click', function () {
            happen.at('click', 200, 350);
            assert.equal(polygon._latlngs[0].length, 3);
        });

    });

    describe('#dragMiddleMarker()', function (done) {

        it('should insert new latlng on middle marker click', function (done) {
            var first = polygon._latlngs[0][0],
                second = polygon._latlngs[0][1],
                self = this,
                fromX = (100 + 310) / 2,
                fromY = (150 + 260) / 2;
            happen.drag(fromX, fromY, 150, 300, function () {
                assert.equal(polygon._latlngs[0].length, 4);
                // New should have been inserted between first and second latlng,
                // so second should equal third, and first should not have changed
                assert.equal(first, polygon._latlngs[0][0]);
                assert.equal(second, polygon._latlngs[0][2]);
                done();
            });
        });

    });

    describe('#newHole', function () {

        it('should create new hole on click', function () {
            assert.equal(polygon._latlngs.length, 1);
            polygon.editor.newHole(this.map.layerPointToLatLng([150, 170]));
            assert.equal(polygon._latlngs.length, 2);
            assert.equal(polygon._latlngs[1].length, 1);
            happen.at('mousemove', 200, 250);
            happen.at('click', 200, 250);
            assert.equal(polygon._latlngs[1].length, 2);
            happen.at('mousemove', 250, 250);
            happen.at('click', 250, 250);
            assert.equal(polygon._latlngs[1].length, 3);
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.equal(polygon._latlngs[1].length, 4);
        });

        it('should not create new point when clicking outside', function () {
            happen.at('click', 400, 400);
            assert.equal(polygon._latlngs[1].length, 4);
        });

        it('should finish shape on last point click', function () {
            happen.at('click', 250, 200);
            happen.at('click', 260, 210);
            assert.equal(polygon._latlngs[1].length, 4);
        });

        it('should remove hole latlngs on click', function () {
            happen.at('mousemove', 150, 170);
            happen.at('click', 150, 170);
            assert.equal(polygon._latlngs[1].length, 3);
            happen.at('mousemove', 200, 250);
            happen.at('click', 200, 250);
            assert.equal(polygon._latlngs[1].length, 2);
            happen.at('mousemove', 250, 250);
            happen.at('click', 250, 250);
            assert.equal(polygon._latlngs[1].length, 1);
        });

        it('should remove hole array on last click', function () {
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.notOk(polygon._latlngs[1]);
            polygon.remove();
        });

    });

    describe('Multi', function () {
        var p2ll;

        before(function () {
            this.map = map;
            p2ll = function (x, y) {
                return map.layerPointToLatLng([x, y]);
            };
        });

        describe('#enableEdit', function () {

            it('should create vertex and middle markers for each ring', function () {
                var multi = L.polygon([
                    [
                        [
                          [43.1239, 1.244],
                          [43.123, 1.253],
                          [43.1252, 1.255],
                          [43.1250, 1.251],
                          [43.1239, 1.244]
                        ],
                        [
                          [43.124, 1.246],
                          [43.1236, 1.248],
                          [43.12475, 1.250]
                        ]
                    ],
                    [
                        [
                          [43.1269, 1.246],
                          [43.126, 1.252],
                          [43.1282, 1.255],
                          [43.1280, 1.245],
                        ]
                    ]
                ]).addTo(this.map);
                multi.enableEdit();
                assert.ok(multi._latlngs[0][0][0].__vertex);
                assert.ok(multi._latlngs[0][0][0].__vertex.middleMarker);
                assert.ok(multi._latlngs[0][0][1].__vertex);
                assert.ok(multi._latlngs[0][0][1].__vertex.middleMarker);
                assert.ok(multi._latlngs[0][1][0].__vertex);
                assert.ok(multi._latlngs[0][1][0].__vertex.middleMarker);
                assert.ok(multi._latlngs[1][0][0].__vertex);
                assert.ok(multi._latlngs[1][0][0].__vertex.middleMarker);
                multi.remove();
                this.map.editTools.editLayer.eachLayer(function (layer) {
                    assert.fail(layer, null, "no layer expected but one found");
                });
            });

        });

        describe('#newShape', function () {

            it('should add a new outline on empty polygon', function () {
                var polygon = L.polygon([]).addTo(this.map);
                polygon.enableEdit();
                polygon.editor.newShape();
                happen.at('mousemove', 100, 150);
                happen.at('click', 100, 150);
                assert.equal(polygon._latlngs[0].length, 1);
                happen.at('mousemove', 200, 350);
                happen.at('click', 200, 350);
                assert.equal(polygon._latlngs[0].length, 2);
                happen.at('mousemove', 300, 250);
                happen.at('click', 300, 250);
                assert.equal(polygon._latlngs[0].length, 3);
                happen.at('click', 300, 250);
                polygon.remove();
            });

            it('should add a new outline to existing simple polygon', function () {
                var polygon = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map);
                polygon.enableEdit();
                polygon.editor.newShape();
                assert(L.Util.isArray(polygon._latlngs[0]));
                assert.ok(polygon._latlngs[0].length);
                assert.ok(L.Util.isArray(polygon._latlngs[0][0]));
                assert.ok(polygon._latlngs[0][0].length);
                assert.ok(L.Util.isArray(polygon._latlngs[1]));
                assert.ok(polygon._latlngs[1].length);
                assert.ok(L.Util.isArray(polygon._latlngs[1][0]));
                assert.notOk(polygon._latlngs[1][0].length);
                happen.at('mousemove', 300, 300);
                happen.at('click', 300, 300);
                assert.equal(polygon._latlngs[1][0].length, 1);
                happen.at('mousemove', 350, 350);
                happen.at('click', 350, 350);
                assert.equal(polygon._latlngs[1][0].length, 2);
                happen.at('mousemove', 400, 250);
                happen.at('click', 400, 250);
                assert.equal(polygon._latlngs[1][0].length, 3);
                happen.at('click', 400, 250);
                polygon.remove();
            });

            it('should emit editable:shape:new on newShape call', function () {
                var called = 0,
                    call = function () {called++;};
                this.map.on('editable:shape:new', call);
                var polygon = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map);
                assert.equal(called, 0);
                polygon.enableEdit();
                assert.equal(called, 0);
                polygon.editor.newShape();
                assert.equal(called, 1);
                polygon.remove();
            });

        });

    });

});
