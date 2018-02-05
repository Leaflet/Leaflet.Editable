'use strict';
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
            assert.notOk(polygon._latlngs[0].length);
        });

        it('should create latlng on click', function () {
            happen.drawingClick(100, 150);
            assert.equal(polygon._latlngs[0].length, 1);
            happen.drawingClick(200, 350);
            assert.equal(polygon._latlngs[0].length, 2);
        });

        it('should not finish shape if not enough vertices', function () {
            happen.drawingClick(200, 350);
            assert.equal(polygon._latlngs[0].length, 2);
            assert.ok(polygon.editor.drawing());
        });

        it('should finish shape on last point click', function () {
            happen.drawingClick(300, 250);
            assert.equal(polygon._latlngs[0].length, 3);
            happen.drawingClick(300, 150);
            assert.equal(polygon._latlngs[0].length, 4);
            happen.drawingClick(300, 150);
            assert.equal(polygon._latlngs[0].length, 4);
        });

        it('should finish drawing also on first point', function() {
            var other = this.map.editTools.startPolygon();
            assert.notOk(other._latlngs[0].length);
            happen.drawingClick(400, 450);
            assert.equal(other._latlngs[0].length, 1);
            happen.drawingClick(450, 500);
            assert.equal(other._latlngs[0].length, 2);
            happen.drawingClick(300, 450);
            assert.equal(other._latlngs[0].length, 3);
            happen.drawingClick(400, 450);
            assert.equal(other._latlngs[0].length, 3);
            other.remove();
        });

        it('should apply passed options to the polygon', function(){
            var className = 'my-class';
            var other = this.map.editTools.startPolygon(null, {className:className});
            assert.equal(other.options.className, className);
            other.editor.disable();
        });
    });

    describe('#disable()', function () {

        it('should stop editing on disable() call', function () {
            polygon.disableEdit();
            assert.notOk(polygon.editor);
        });

        it('should be reenabled after remove if active', function () {
            polygon.enableEdit();
            this.map.removeLayer(polygon);
            assert.notOk(polygon.editEnabled());
            this.map.addLayer(polygon);
            assert.ok(polygon.editEnabled());
        });

        it('should not be reenabled after remove if not active', function () {
            polygon.disableEdit();
            this.map.removeLayer(polygon);
            assert.notOk(polygon.editEnabled());
            this.map.addLayer(polygon);
            assert.notOk(polygon.editEnabled());
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
            var before = polygon._latlngs[0][2].lat;
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

        it('should not delete last latlng on vertex click if only three vertices', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polygon(latlngs).addTo(this.map);
            assert.equal(layer._latlngs[0].length, 3);
            layer.enableEdit();
            happen.at('click', 200, 100);
            assert.equal(layer._latlngs[0].length, 3);
            layer.remove();
        });

        it('should delete multi polygon hole shape at last vertex delete', function () {
            var latlngs = [
                    [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(120, 160), p2ll(150, 170), p2ll(180, 120)]
                    ],
                    [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                ],
                layer = L.polygon(latlngs).addTo(this.map);
            layer.enableEdit();
            assert.equal(layer._latlngs[0][1].length, 3);
            happen.at('click', 120, 160);
            happen.at('click', 150, 170);
            happen.at('click', 180, 120);
            assert.notOk(layer._latlngs[0][1]);
            assert.ok(layer._latlngs[0]);
            assert.ok(layer._latlngs[1]);
            assert.ok(this.map.hasLayer(layer));
            layer.remove();
        });

    });

    describe('#dragMiddleMarker()', function () {

        it('should insert new latlng on middle marker click', function (done) {
            var first = polygon._latlngs[0][0],
                second = polygon._latlngs[0][1],
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
            assert.equal(polygon._latlngs[0].length, 4);
            polygon.editor.newHole(this.map.layerPointToLatLng([150, 170]));
            assert.equal(polygon._latlngs.length, 2);
            assert.equal(polygon._latlngs[0].length, 4);
            assert.equal(polygon._latlngs[1].length, 1);
            happen.drawingClick(200, 250);
            assert.equal(polygon._latlngs[1].length, 2);
            happen.drawingClick(250, 250);
            assert.equal(polygon._latlngs[1].length, 3);
            happen.drawingClick(250, 200);
            assert.equal(polygon._latlngs[1].length, 4);
        });

        xit('should not create new point when clicking outside', function () {
            happen.drawingClick(400, 400);
            assert.equal(polygon._latlngs[1].length, 4);
        });

        it('should finish shape on last point click', function () {
            happen.drawingClick(250, 200);
            happen.at('click', 250, 200);
            happen.drawingClick(260, 210);
            assert.equal(polygon._latlngs[1].length, 4);
        });

        it('should remove hole latlngs on click', function () {
            happen.at('click', 150, 170);
            assert.equal(polygon._latlngs[1].length, 3);
            happen.at('click', 200, 250);
            assert.equal(polygon._latlngs[1].length, 2);
            happen.at('click', 250, 250);
            assert.equal(polygon._latlngs[1].length, 1);
        });

        it('should remove hole array on last click', function () {
            happen.at('click', 250, 200);
            assert.notOk(polygon._latlngs[1]);
            assert.ok(polygon._latlngs[0]);
            assert.ok(polygon._latlngs);
            assert.ok(this.map.hasLayer(polygon));
            polygon.remove();
        });

    });


    describe('#drawing', function () {

        it('should return false if no drawing happen', function () {
            var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map);
            layer.enableEdit();
            assert.notOk(layer.editor.drawing());
            layer.remove();
        });

        it('should return true if an editor is active and drawing forward', function () {
            var layer = this.map.editTools.startPolygon();
            assert.ok(layer.editor.drawing());
            layer.editor.disable();
        });

    });

    describe('#pop', function () {

        it('should remove last latlng when drawing', function () {
            var layer = this.map.editTools.startPolygon();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            assert.equal(layer._latlngs[0].length, 2);
            var last = layer._latlngs[0][1];
            assert.include(layer._latlngs[0], last);
            var latlng = layer.editor.pop();
            assert.equal(latlng.lat, last.lat);
            assert.ok(latlng);
            assert.equal(layer._latlngs[0].length, 1);
            assert.notInclude(layer._latlngs[0], last);
            layer.remove();
        });

    });

    describe('#push', function () {

        it('should add a latlng at the end when drawing forward', function () {
            var layer = this.map.editTools.startPolygon();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            assert.equal(layer._latlngs[0].length, 2);
            var latlng = p2ll(100, 150);
            layer.editor.push(latlng);
            assert.include(layer._latlngs[0], latlng);
            var last = layer._latlngs[0][2];
            assert.equal(latlng.lat, last.lat);
            assert.equal(layer._latlngs[0].length, 3);
            layer.remove();
        });

    });

    describe('#endDrawing', function () {

        it('should remove shape if not enough latlngs', function () {
            var layer = this.map.editTools.startPolygon();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            assert.equal(layer._latlngs[0].length, 2);
            layer.editor.cancelDrawing();
            assert.equal(layer._latlngs[0].length, 0);
            layer.remove();
        });

        it('should remove shape if not enough latlngs (multi)', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polygon(latlngs).addTo(this.map);
            layer.enableEdit();
            assert.equal(layer._latlngs.length, 1);
            layer.editor.newShape();
            happen.drawingClick(400, 400);
            happen.drawingClick(500, 500);
            assert.equal(layer._latlngs.length, 2);
            layer.editor.cancelDrawing();
            assert.equal(layer._latlngs.length, 1);
            layer.remove();
        });

        it('should not remove shape if enough latlngs (multi)', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polygon(latlngs).addTo(this.map);
            layer.enableEdit();
            assert.equal(layer._latlngs.length, 1);
            layer.editor.newShape();
            happen.drawingClick(400, 400);
            happen.drawingClick(500, 400);
            happen.drawingClick(400, 500);
            assert.equal(layer._latlngs.length, 2);
            layer.editor.cancelDrawing();
            assert.equal(layer._latlngs.length, 2);
            layer.remove();
        });

    });

    describe('#parentShape()', function () {

        it('should find parent shape on simple polygon', function () {
            var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                layer = L.polygon(latlngs).addTo(this.map);
            assert.equal(layer.parentShape(layer._latlngs[0]), layer._latlngs);
            layer.remove();
        });

        it('should find parent shape on multi polygon', function () {
            var latlngs = [
                    [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                    [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                ],
                layer = L.polygon(latlngs).addTo(this.map);
            assert.equal(layer.parentShape(layer._latlngs[0][0]), layer._latlngs[0]);
            assert.equal(layer.parentShape(layer._latlngs[1][0]), layer._latlngs[1]);
            layer.remove();
        });

        it('should find parent shape on multi polygon with hole', function () {
            var latlngs = [
                    [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(120, 160), p2ll(150, 170), p2ll(180, 120)]
                    ],
                    [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                ],
                layer = L.polygon(latlngs).addTo(this.map);
            assert.equal(layer.parentShape(layer._latlngs[0][0]), layer._latlngs[0]);
            assert.equal(layer.parentShape(layer._latlngs[0][1]), layer._latlngs[0]);
            assert.equal(layer.parentShape(layer._latlngs[1][0]), layer._latlngs[1]);
            layer.remove();
        });

    });

    describe('#enableDragging()', function () {

        it('should drag a polygon', function (done) {
            var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                layer = L.polygon(latlngs).addTo(this.map),
                before = layer._latlngs[0][2].lat;
            layer.enableEdit();
            assert.equal(before, layer._latlngs[0][2].lat);
            happen.drag(150, 150, 170, 170, function () {
                assert.notEqual(before, layer._latlngs[0][2].lat);
                layer.remove();
                done();
            });
        });

        it('should drag a multipolygon with hole', function (done) {
            var latlngs = [
                    [
                        [p2ll(100, 150), p2ll(150, 300), p2ll(300, 100)],
                        [p2ll(220, 160), p2ll(150, 170), p2ll(180, 220)]
                    ],
                    [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                ],
                layer = L.polygon(latlngs).addTo(this.map),
                before = layer._latlngs[1][0][2].lat;
            layer.enableEdit();
            assert.equal(before, layer._latlngs[1][0][2].lat);
            happen.drag(150, 150, 170, 170, function () {
                assert.notEqual(before, layer._latlngs[1][0][2].lat);
                layer.remove();
                done();
            });
        });

        it('should send editable:dragstart event', function (done) {
            var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                layer = L.polygon(latlngs).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:dragstart', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.drag(150, 150, 170, 170, function () {
                assert.equal(called, 1);
                layer.remove();
                done();
            });
        });

        it('should send editable:dragend event', function (done) {
            var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                layer = L.polygon(latlngs).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:dragend', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.drag(150, 150, 170, 170, function () {
                assert.equal(called, 1);
                layer.remove();
                done();
            });
        });

        it('should send editable:drag event', function (done) {
            var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                layer = L.polygon(latlngs).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:drag', call);
            layer.enableEdit();
            assert.notOk(called);
            happen.drag(150, 150, 170, 170, function () {
                assert.ok(called);
                layer.remove();
                done();
            });
        });

    });

    describe('Events', function () {

        afterEach(function () {
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, 'no layer expected but one found');
            });
        });

        it('should fire editable:drawing:start on startPolygon call', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:start', call);
            var layer = this.map.editTools.startPolygon();
            assert.equal(called, 1);
            this.map.off('editable:drawing:start', call);
            layer.editor.disable();
            assert.notOk(this.map.editTools._drawingEditor);
        });

        it('should fire editable:drawing:end on last click', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var layer = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.drawingClick(100, 150);
            assert.equal(layer._latlngs[0].length, 1);
            assert.equal(called, 0);
            happen.drawingClick(200, 350);
            assert.equal(layer._latlngs[0].length, 2);
            assert.equal(called, 0);
            happen.drawingClick(300, 250);
            assert.equal(layer._latlngs[0].length, 3);
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
            happen.drawingClick(100, 150);
            assert.equal(layer._latlngs[0].length, 1);
            assert.equal(called, 0);
            happen.drawingClick(200, 350);
            assert.equal(layer._latlngs[0].length, 2);
            assert.equal(called, 0);
            happen.drawingClick(300, 250);
            assert.equal(layer._latlngs[0].length, 3);
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
            layer.editor.disable();
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
            layer.editor.disable();
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
            var layer = this.map.editTools.startPolygon();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            happen.drawingClick(400, 400);
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
            var called = 0, layer,
                calledWhenEmpty = 0,
                call = function () {
                    called++;
                    if (!layer._latlngs[0].length) calledWhenEmpty = 1;
                };
            this.map.on('editable:drawing:click', call);
            layer = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.drawingClick(250, 200);
            assert.equal(called, 1);
            assert.ok(calledWhenEmpty);
            assert.ok(layer._latlngs[0].length);
            this.map.off('editable:drawing:click', call);
            layer.remove();
        });

        it('should fire editable:drawing:clicked after adding vertex', function () {
            var called = 0,
                calledAfterClick = 0,
                call = function () {
                    called++;
                    if (polygon._latlngs[0].length) calledAfterClick = 1;
                };
            this.map.on('editable:drawing:clicked', call);
            var polygon = this.map.editTools.startPolygon();
            assert.equal(called, 0);
            happen.drawingClick(250, 200);
            assert.equal(called, 1);
            assert.ok(calledAfterClick);
            assert.ok(polygon._latlngs[0].length);
            this.map.off('editable:drawing:clicked', call);
            polygon.remove();
        });

        it('should fire editable:vertex:new ', function () {
            var newCount = 0,
                gotNew = function (e) {newCount++;};
            this.map.on('editable:vertex:new', gotNew);
            var polygon = this.map.editTools.startPolygon();
            assert.equal(newCount, 0);
            happen.drawingClick(250, 200);
            happen.drawingClick(350, 300);
            assert.equal(newCount, 2);
            this.map.off('editable:vertex:new', gotNew);
            polygon.remove();
        });

        it('should fire editable:vertex:new on middle marker click', function (done) {
            var newCount = 0,
                gotNew = function (e) {newCount++;};
            var polygon = this.map.editTools.startPolygon();
            happen.drawingClick(500, 500);
            happen.drawingClick(400, 400);
            assert.equal(newCount, 0);
            this.map.on('editable:vertex:new', gotNew);
            happen.drag(450, 450, 300, 400, function () {
                assert.equal(newCount, 1);
                map.off('editable:vertex:new', gotNew);
                polygon.remove();
                done();
            });
        });

        it('should not trigger editable:vertex:new when enabling edition', function () {
            var newCount = 0,
                gotNew = function (e) {newCount++;};
            this.map.on('editable:vertex:new', gotNew);
            var layer = L.polygon([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            assert.equal(newCount, 0);
            map.off('editable:vertex:new', gotNew);
            layer.remove();
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
            happen.drawingClick(250, 200);
            assert.equal(called, 1);
            assert.notOk(polygon._latlngs[0].length);
            this.map.off('editable:drawing:click', call);
            polygon.editor.disable();
        });

        it('should be possible to cancel editable:vertex:rawclick', function () {
            var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100), p2ll(100, 100)]).addTo(this.map),
                called = 0,
                call = function (e) {
                    e.cancel();
                    called++;
                };
            assert.equal(layer._latlngs[0].length, 4);
            this.map.on('editable:vertex:rawclick', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.at('click', 100, 100);
            assert.equal(called, 1);
            assert.equal(layer._latlngs[0].length, 4);
            this.map.off('editable:vertex:rawclick', call);
            layer.remove();
        });

        it('should fire editable:drawing:mouseover after hovering over vertex', function () {
            var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100), p2ll(100, 100)]).addTo(this.map),
                called = 0,
                call = function () {called++;};
            this.map.on('editable:vertex:mouseover', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.at("mouseover", 100, 150);
            assert.ok(called);
            this.map.off('editable:vertex:mouseover', call);
            layer.remove();
        });

        it('should fire editable:drawing:mouseout after hovering out of a vertex', function () {
            var layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100), p2ll(100, 100)]).addTo(this.map),
                called = 0,
                call = function () {called++;};
            this.map.on('editable:vertex:mouseout', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.at("mouseout", 100, 150);
            assert.ok(called);
            this.map.off('editable:vertex:mouseout', call);
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
                    assert.fail(layer, null, 'no layer expected but one found');
                });
            });

        });

        describe('#formatShape', function () {
            var layer;

            before(function () {
                layer = L.polygon([]).addTo(this.map);
                layer.enableEdit();
            });

            after(function () {
                layer.remove();
            });

            it('should nest flat shape', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)];
                assert.deepEqual(layer.editor.formatShape(latlngs), [latlngs]);
            });

            it('should nest empty shape', function () {
                assert.deepEqual(layer.editor.formatShape([]), [[]]);
            });

            it('should not renest nested empty shape', function () {
                assert.deepEqual(layer.editor.formatShape([[]]), [[]]);
            });

            it('should not renest nested shape', function () {
                var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]];
                assert.deepEqual(layer.editor.formatShape(latlngs), latlngs);
            });

        });

        describe('#insertShape', function () {

            it('should add flat shape on multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.insertShape(shape, 1);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[1][0]);
                layer.remove();
            });

            it('should add nested shape on multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.insertShape(shape, 1);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[1]);
                layer.remove();
            });

        });

        describe('#appendShape', function () {

            it('should add flat shape on flat polygon', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape, layer._latlngs[1][0]);
                layer.remove();
            });

            it('should add nested shape on flat polygon', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape, layer._latlngs[1]);
                layer.remove();
            });

            it('should add flat shape on multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[2][0]);
                layer.remove();
            });

            it('should add nested shape on multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[2]);
                layer.remove();
            });

        });

        describe('#prependShape', function () {

            it('should add flat shape on flat polygon', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape, layer._latlngs[0][0]);
                layer.remove();
            });

            it('should add nested shape on flat polygon', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape, layer._latlngs[0]);
                layer.remove();
            });

            it('should add flat shape on multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[0][0]);
                layer.remove();
            });

            it('should add nested shape on multi polygon', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[0]);
                layer.remove();
            });

        });

        describe('#newShape', function () {

            it('should add a new outline on empty polygon', function () {
                var polygon = L.polygon([]).addTo(this.map);
                polygon.enableEdit();
                polygon.editor.newShape();
                happen.drawingClick(100, 150);
                assert.equal(polygon._latlngs[0].length, 1);
                happen.drawingClick(200, 350);
                assert.equal(polygon._latlngs[0].length, 2);
                happen.drawingClick(300, 250);
                assert.equal(polygon._latlngs[0].length, 3);
                happen.drawingClick(300, 250);
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
                happen.drawingClick(300, 300);
                assert.equal(polygon._latlngs[1][0].length, 1);
                happen.drawingClick(350, 350);
                assert.equal(polygon._latlngs[1][0].length, 2);
                happen.drawingClick(400, 250);
                assert.equal(polygon._latlngs[1][0].length, 3);
                happen.drawingClick(400, 250);
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

        describe('#shapeAt', function () {

            it('should return latlngs in case of a flat polygon', function () {
                var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                    layer = L.polygon(latlngs).addTo(this.map),
                    shape = layer.shapeAt(p2ll(150, 150));
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
                    shape = layer.shapeAt(p2ll(150, 150));
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
                    shape = layer.shapeAt(p2ll(140, 140));
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
                        assert.equal(layer._latlngs[0].length, 3);  // Not yet deleted
                        assert.equal(e.shape.length, 3);
                    };
                this.map.on('editable:shape:delete', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(layer._latlngs[0].length, 0);
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
                assert.equal(layer._latlngs[0].length, 3);
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
                        assert.equal(layer._latlngs[0].length, 0);  // Already deleted
                        assert.equal(e.shape.length, 3);  // Deleted elements
                    };
                this.map.on('editable:shape:deleted', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(called, 1);
                assert.equal(layer._latlngs[0].length, 0);
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

            it('should return the deleted shape on flat polygon', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(layer._latlngs[0].length, 0);
                assert.deepEqual(deleted, latlngs);
                layer.remove();
            });

            it('should return the deleted shape on multi', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0].length, 1);
                assert.deepEqual(deleted, latlngs[0]);
                layer.remove();
            });

            it('should return the deleted shape on multi with hole', function () {
                var latlngs = [
                        [
                            [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                            [p2ll(120, 150), p2ll(150, 180), p2ll(180, 120)]
                        ],
                        [
                            [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                        ]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShape(layer._latlngs[0]);
                assert.deepEqual(deleted, latlngs[0]);
                layer.remove();
            });

            it('should return the deleted shape on multi with hole 2', function () {
                var latlngs = [
                        [
                            [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                            [p2ll(120, 150), p2ll(150, 180), p2ll(180, 120)]
                        ],
                        [
                            [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                        ]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShape(layer._latlngs[1]);
                assert.deepEqual(deleted, latlngs[1]);
                layer.remove();
            });

        });

        describe('#deleteShapeAt', function () {

            it('should delete the shape on flat polygon', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShapeAt(p2ll(150, 150));
                assert.equal(layer._latlngs[0].length, 0);
                assert.deepEqual([latlngs], deleted);
                layer.remove();
            });

            it('should delete the shape on multi', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShapeAt(p2ll(150, 150));
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0][0], latlngs[1][0][0]);
                assert.deepEqual(latlngs[0], deleted);
                layer.remove();
            });

            it('should delete the shape two on multi', function () {
                var latlngs = [
                        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
                        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShapeAt(p2ll(350, 350));
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0][0], latlngs[0][0][0]);
                assert.deepEqual(latlngs[1], deleted);
                layer.remove();
            });

            it('should delete the shape on multi with nested simple polygon', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    ],
                    layer = L.polygon(latlngs).addTo(this.map);
                layer.enableEdit();
                var deleted = layer.editor.deleteShapeAt(p2ll(150, 150));
                assert.equal(layer._latlngs[0].length, 0);
                assert.deepEqual(latlngs, deleted);
                layer.remove();
            });

        });

    });

});
