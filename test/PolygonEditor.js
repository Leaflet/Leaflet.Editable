describe('L.PolygonEditor', function() {
    var p2ll, polygon;

    before(function () {
        this.map = map;
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
    });

    describe('#startPolygon()', function() {

        it('should create feature and editor', function() {
            polygon = this.map.editTools.startPolygon();
            assert.ok(polygon);
            assert.ok(polygon.editor);
            assert.notOk(polygon._latlngs.length);
        });

        it('should create latlng on click', function () {
            happen.at('mousemove', 100, 150);
            happen.at('click', 100, 150);
            assert.equal(polygon._latlngs.length, 1);
            happen.at('mousemove', 200, 350);
            happen.at('click', 200, 350);
            assert.equal(polygon._latlngs.length, 2);
            happen.at('mousemove', 300, 250);
            happen.at('click', 300, 250);
            assert.equal(polygon._latlngs.length, 3);
            happen.at('mousemove', 300, 150);
            happen.at('click', 300, 150);
            assert.equal(polygon._latlngs.length, 4);
        });

        it('should finish shape on last point click', function () {
            happen.at('click', 300, 150);
            assert.equal(polygon._latlngs.length, 4);
        });

        it('should finish drawing also on first point', function() {
            var other = this.map.editTools.startPolygon();
            assert.notOk(other._latlngs.length);
            happen.at('mousemove', 400, 450);
            happen.at('click', 400, 450);
            assert.equal(other._latlngs.length, 1);
            happen.at('mousemove', 450, 500);
            happen.at('click', 450, 500);
            assert.equal(other._latlngs.length, 2);
            happen.at('mousemove', 300, 450);
            happen.at('click', 300, 450);
            assert.equal(other._latlngs.length, 3);
            happen.at('click', 400, 450);
            assert.equal(other._latlngs.length, 3);
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
            var before = polygon._latlngs[2].lat,
                self = this;
            happen.drag(300, 250, 310, 260, function () {
                assert.notEqual(before, polygon._latlngs[2].lat);
                done();
            });
        });

    });

    describe('#deleteVertex()', function () {

        it('should delete latlng on vertex click', function () {
            happen.at('click', 200, 350);
            assert.equal(polygon._latlngs.length, 3);
        });

    });

    describe('#dragMiddleMarker()', function (done) {

        it('should insert new latlng on middle marker click', function (done) {
            var first = polygon._latlngs[0],
                second = polygon._latlngs[1],
                self = this,
                fromX = (100 + 310) / 2,
                fromY = (150 + 260) / 2;
            happen.drag(fromX, fromY, 150, 300, function () {
                assert.equal(polygon._latlngs.length, 4);
                // New should have been inserted between first and second latlng,
                // so second should equal third, and first should not have changed
                assert.equal(first, polygon._latlngs[0]);
                assert.equal(second, polygon._latlngs[2]);
                done();
            });
        });

    });

    describe('#newHole', function () {

        it('should create new hole on click', function () {
            assert.equal(polygon._latlngs.length, 4);
            L.marker(this.map.layerPointToLatLng([150, 170])).addTo(this.map);
            polygon.editor.newHole(this.map.layerPointToLatLng([150, 170]));
            assert.equal(polygon._latlngs.length, 2);
            assert.equal(polygon._latlngs[0].length, 4);
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

    describe('#pop', function () {

        it('should remove last latlng when drawing', function () {
            var layer = this.map.editTools.startPolygon();
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(layer._latlngs.length, 2);
            var last = layer._latlngs[1];
            assert.include(layer._latlngs, last);
            var latlng = layer.editor.pop();
            assert.equal(latlng.lat, last.lat);
            assert.ok(latlng);
            assert.equal(layer._latlngs.length, 1);
            assert.notInclude(layer._latlngs, last);
            this.map.removeLayer(layer);
        });

    });

    describe('#push', function () {

        it('should add a latlng at the end when drawing forward', function () {
            var layer = this.map.editTools.startPolygon();
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(layer._latlngs.length, 2);
            var latlng = p2ll(100, 150);
            layer.editor.push(latlng);
            assert.include(layer._latlngs, latlng);
            var last = layer._latlngs[2];
            assert.equal(latlng.lat, last.lat);
            assert.equal(layer._latlngs.length, 3);
            this.map.removeLayer(layer);
        });

    });

    describe('Events', function () {

        it('should fire editable:drawing:start on startPolygon call', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:start', call);
            var layer = this.map.editTools.startPolygon();
            assert.equal(called, 1);
            this.map.off('editable:drawing:start', call);
            layer.remove();
            assert.notOk(this.map.editTools._drawingEditor);
        });

        it('should fire editable:drawing:end on last click', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var layer = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.at('mousemove', 100, 150);
            happen.at('click', 100, 150);
            assert.equal(layer._latlngs.length, 1);
            assert.equal(called, 0);
            happen.at('mousemove', 200, 350);
            happen.at('click', 200, 350);
            assert.equal(layer._latlngs.length, 2);
            assert.equal(called, 0);
            happen.at('mousemove', 300, 250);
            happen.at('click', 300, 250);
            assert.equal(layer._latlngs.length, 3);
            assert.equal(called, 0);
            happen.at('click', 300, 250);
            assert.equal(called, 1);
            this.map.off('editable:drawing:end', call);
            layer.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:commit on last click', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:commit', call);
            var layer = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.at('mousemove', 100, 150);
            happen.at('click', 100, 150);
            assert.equal(layer._latlngs.length, 1);
            assert.equal(called, 0);
            happen.at('mousemove', 200, 350);
            happen.at('click', 200, 350);
            assert.equal(layer._latlngs.length, 2);
            assert.equal(called, 0);
            happen.at('mousemove', 300, 250);
            happen.at('click', 300, 250);
            assert.equal(layer._latlngs.length, 3);
            assert.equal(called, 0);
            happen.at('click', 300, 250);
            assert.equal(called, 1);
            this.map.off('editable:drawing:commit', call);
            layer.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:end on stopDrawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var layer = this.map.editTools.startPolygon();
            this.map.editTools.stopDrawing();
            assert.equal(called, 1);
            this.map.off('editable:drawing:end', call);
            layer.remove();
            assert.equal(called, 1);
        });

        it('should not fire editable:drawing:commit on stopDrawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:commit', call);
            var layer = this.map.editTools.startPolygon();
            this.map.editTools.stopDrawing();
            assert.equal(called, 0);
            this.map.off('editable:drawing:commit', call);
            layer.remove();
            assert.equal(called, 0);
        });

        it('should fire editable:vertex:clicked before end/commit on last click', function () {
            var first = null, second = 0, last,
                setFirst = function (e) {if(first === null) first = e.type;},
                setSecond = function () {second++;},
                setLast = function (e) {last = e.type;};
            this.map.on('editable:drawing:end', setFirst);
            this.map.on('editable:drawing:commit', setFirst);
            this.map.on('editable:drawing:end', setLast);
            this.map.on('editable:drawing:commit', setLast);
            this.map.on('editable:drawing:commit', setSecond);
            var layer = this.map.editTools.startPolyline();
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            happen.at('mousemove', 400, 400);
            happen.at('click', 400, 400);
            assert.notOk(first);
            assert.notOk(last);
            this.map.on('editable:vertex:clicked', setFirst);
            this.map.on('editable:vertex:clicked', setLast);
            assert.notOk(first);
            assert.notOk(last);
            assert.notOk(second);
            happen.at('click', 400, 400);
            assert.equal(first, 'editable:vertex:clicked');
            assert.equal(last, 'editable:drawing:end');
            assert.equal(second, 1);  // commit has been called
            this.map.off('editable:drawing:end', setFirst);
            this.map.off('editable:drawing:commit', setFirst);
            this.map.off('editable:drawing:end', setLast);
            this.map.off('editable:drawing:commit', setLast);
            this.map.off('editable:vertex:clicked', setFirst);
            this.map.off('editable:vertex:clicked', setLast);
            layer.remove();
        });


        it('should fire editable:drawing:click before adding vertex', function () {
            var called = 0,
                calledWhenEmpty = 0,
                call = function () {
                    called++;
                    if (!polygon._latlngs.length) calledWhenEmpty = 1;
                };
            this.map.on('editable:drawing:click', call);
            var polygon = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.equal(called, 1);
            assert.ok(calledWhenEmpty);
            assert.ok(polygon._latlngs.length);
            this.map.off('editable:drawing:click', call);
            polygon.remove();
        });

        it('should fire editable:drawing:clicked after adding vertex', function () {
            var called = 0,
                calledAfterClick = 0,
                call = function () {
                    called++;
                    if (polygon._latlngs.length) calledAfterClick = 1;
                };
            this.map.on('editable:drawing:clicked', call);
            var polygon = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.equal(called, 1);
            assert.ok(calledAfterClick);
            assert.ok(polygon._latlngs.length);
            this.map.off('editable:drawing:clicked', call);
            polygon.remove();
        });

        it('should be possible to cancel editable:drawing:click actions', function () {
            var called = 0,
                call = function (e) {
                    e.cancel();
                    called++;
                };
            this.map.on('editable:drawing:click', call);
            var polygon = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.equal(called, 1);
            assert.notOk(polygon._latlngs.length);
            this.map.off('editable:drawing:click', call);
            polygon.remove();
        });

        it('should be possible to cancel editable:vertex:rawclick', function () {
            var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100), p2ll(100, 100)]).addTo(this.map),
                called = 0,
                call = function (e) {
                    e.cancel();
                    called++;
                };
            assert.equal(layer._latlngs.length, 4);
            this.map.on('editable:vertex:rawclick', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.at('mousemove', 100, 100);
            happen.at('click', 100, 100);
            assert.equal(called, 1);
            assert.equal(layer._latlngs.length, 4);
            this.map.off('editable:vertex:rawclick', call);
            layer.remove();
        });

    });

    describe('Multi', function () {

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
                assert.equal(polygon._latlngs.length, 1);
                happen.at('mousemove', 200, 350);
                happen.at('click', 200, 350);
                assert.equal(polygon._latlngs.length, 2);
                happen.at('mousemove', 300, 250);
                happen.at('click', 300, 250);
                assert.equal(polygon._latlngs.length, 3);
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
                this.map.off('editable:shape:new', call);
            });

        });

        describe('#shapeFromLatLng', function () {

            it('should return latlngs in case of a flat polygon', function () {
                var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                    layer = L.polygon(latlngs).addTo(this.map),
                    shape = layer.shapeFromLatLng(p2ll(150, 150));
                assert.equal(shape.length, 1);
                assert.equal(shape[0].length, 3);
                assert.equal(shape[0][0], latlngs[0][0]);
                layer.remove();
            });

            it('should return whole shape in case of a multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map),
                    shape = layer.shapeFromLatLng(p2ll(150, 150));
                assert.equal(shape.length, 1);
                assert.equal(shape[0].length, 3);
                assert.equal(shape[0][0], latlngs[0][0][0]);
                layer.remove();
            });

            it('should return whole shape in case of a multi polygon with hole', function () {
                var latlngs = [
                        [
                            [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                            [p2ll(120, 160), p2ll(150, 170), p2ll(180, 120)]
                        ],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map),
                    shape = layer.shapeFromLatLng(p2ll(140, 140));
                assert.equal(shape.length, 2);
                assert.equal(shape[0].length, 3);
                assert.equal(shape[0][0], latlngs[0][0][0]);
                layer.remove();
            });

        });

        describe('#deleteShape', function () {

            it('should emit editable:shape:delete before deleting the shape on flat polygon', function () {
                var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        assert.equal(layer._latlngs.length, 3);  // Not yet deleted
                        assert.equal(e.shape.length, 3);
                    };
                this.map.on('editable:shape:delete', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs);
                assert.equal(layer._latlngs.length, 0);
                assert.equal(called, 1);
                this.map.off('editable:shape:delete', call);
                layer.remove();
            });

            it('should emit editable:shape:delete before deleting the shape on multi', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        assert.equal(layer._latlngs.length, 2);  // Not yet deleted
                        assert.equal(e.shape.length, 1);
                        assert.equal(e.shape[0].length, 3);
                    };
                this.map.on('editable:shape:delete', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(called, 1);
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0][0], latlngs[1][0][0]);
                this.map.off('editable:shape:delete', call);
                layer.remove();
            });

            it('editable:shape:delete should be cancellable on flat polygon', function () {
                var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        e.cancel();
                    };
                this.map.on('editable:shape:delete', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs);
                assert.equal(called, 1);
                assert.equal(layer._latlngs.length, 3);
                this.map.off('editable:shape:delete', call);
                layer.remove();
            });

            it('editable:shape:delete should be cancellable on multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        e.cancel();
                    };
                this.map.on('editable:shape:delete', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(called, 1);
                assert.equal(layer._latlngs.length, 2);
                assert.equal(layer._latlngs[0][0][0], latlngs[0][0][0]);
                this.map.off('editable:shape:delete', call);
                layer.remove();
            });

            it('should emit editable:shape:deleted after deleting the shape on flat polygon', function () {
                var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        assert.equal(layer._latlngs.length, 0);  // Already deleted
                        assert.equal(e.shape.length, 3);  // Deleted elements
                    };
                this.map.on('editable:shape:deleted', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs);
                assert.equal(called, 1);
                assert.equal(layer._latlngs.length, 0);
                this.map.off('editable:shape:deleted', call);
                layer.remove();
            });

            it('should emit editable:shape:deleted after deleting the shape on multi', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        assert.equal(layer._latlngs.length, 1);  // Already deleted
                        assert.equal(e.shape.length, 1);  // Deleted shape
                        assert.equal(e.shape[0].length, 3);
                    };
                this.map.on('editable:shape:deleted', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(called, 1);
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0][0], latlngs[1][0][0]);
                this.map.off('editable:shape:deleted', call);
                layer.remove();
            });

        });

        describe('#deleteShapeAt', function () {

            it('should delete the shape on flat polygon', function () {
                var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map);
                layer.enableEdit();
                layer.editor.deleteShapeAt(p2ll(150, 150));
                assert.equal(layer._latlngs.length, 0);
                layer.remove();
            });

            it('should delete the shape on multi', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.deleteShapeAt(p2ll(150, 150));
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0][0], latlngs[1][0][0]);
                layer.remove();
            });

            it('should delete the shape on multi with ambiguous polygon', function () {
                // According to GeoJSON spec, this is not a valid polygon, but this is valid
                // for Leaflet, we should then support it.
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.deleteShapeAt(p2ll(150, 150));
                assert.equal(layer._latlngs.length, 0);
                layer.remove();
            });

        });

    });

});
