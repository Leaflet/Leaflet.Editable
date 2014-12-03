describe('L.PolylineEditor', function() {
    var polyline, p2ll;

    before(function () {
        this.map = map;
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
    });

    describe('#startNewLine()', function() {

        it('should create feature and editor', function() {
            polyline = this.map.editTools.startPolyline();
            assert.ok(polyline);
            assert.ok(polyline.editor);
            assert.notOk(polyline._latlngs.length);
        });

        it('should create first latlng on first click', function () {
            happen.at('mousemove', 100, 150);
            happen.at('click', 100, 150);
            assert.equal(polyline._latlngs.length, 1);
        });

        it('should not finish line on first point click', function () {
            happen.at('click', 100, 150);
            assert.equal(polyline._latlngs.length, 1);
            assert(polyline.editor.drawing);
        });

        it('should create more latlngs on more click', function () {
            happen.at('mousemove', 200, 350);
            happen.at('click', 200, 350);
            assert.equal(polyline._latlngs.length, 2);
            happen.at('mousemove', 300, 250);
            happen.at('click', 300, 250);
            assert.equal(polyline._latlngs.length, 3);
        });

        it('should finish shape on last point click', function () {
            happen.at('click', 300, 250);
            assert.equal(polyline._latlngs.length, 3);
        });

    });

    describe('#disable()', function () {

        it('should stop editing on disable() call', function () {
            polyline.disableEdit();
            assert.notOk(polyline.editor);
        });

    });

    describe('#enable()', function () {

        it('should start editing on enableEdit() call', function () {
            polyline.enableEdit();
            assert.ok(polyline.editor._enabled);
        });

        it('should not reset editor when calling enableEdit() twice', function () {
            var editor = polyline.editor;
            polyline.enableEdit();
            assert.equal(editor, polyline.editor);
        });

    });

    describe('#dragVertex()', function () {

        it('should update latlng on vertex drag', function (done) {
            var before = polyline._latlngs[1].lat,
                self = this;
            happen.drag(200, 350, 220, 360, function () {
                assert.notEqual(before, polyline._latlngs[1].lat);
                done();
            });
        });

    });

    describe('#deleteVertex()', function () {

        it('should delete latlng on vertex click', function () {
            happen.at('click', 300, 250);
            assert.equal(polyline._latlngs.length, 2);
        });

    });

    describe('#continueForward()', function () {

        it('should add new latlng on map click', function () {
            polyline.editor.continueForward();
            happen.at('mousemove', 400, 400);
            happen.at('click', 400, 400);
            assert.equal(polyline._latlngs.length, 3);
            happen.at('click', 400, 400);  // Finish shape
            happen.at('click', 450, 450);  // Click elsewhere on the map
            assert.equal(polyline._latlngs.length, 3);
        });

    });

    describe('#continueBackward()', function () {

        it('should add new latlng on map click', function () {
            polyline.editor.continueBackward();
            happen.at('mousemove', 400, 100);
            happen.at('click', 400, 100);
            assert.equal(polyline._latlngs.length, 4);
            happen.at('click', 400, 100);  // Finish shape
            happen.at('click', 450, 450);  // Click elsewhere on the map
            assert.equal(polyline._latlngs.length, 4);
        });

    });

    describe('#dragMiddleMarker()', function () {

        it('should insert new latlng on middle marker click', function (done) {
            var last = polyline._latlngs[3],
                third = polyline._latlngs[2],
                self = this,
                fromX = (400 + 220) / 2,
                fromY = (400 + 360) / 2;
            happen.drag(fromX, fromY, 300, 440, function () {
                assert.equal(polyline._latlngs.length, 5);
                // New should have been inserted between third and last latlng,
                // so third and last should not have changed
                assert.equal(last, polyline._latlngs[4]);
                assert.equal(third, polyline._latlngs[2]);
                done();
            });
        });

    });


    describe('#removeVertex', function () {

        it('should remove vertex on click', function () {
            happen.at('click', 400, 400);
            assert.equal(polyline._latlngs.length, 4);
            happen.at('click', 100, 150);
            assert.equal(polyline._latlngs.length, 3);
            happen.at('click', 400, 100);
            assert.equal(polyline._latlngs.length, 2);
        });

        it('should not remove last two vertex', function () {
            happen.at('click', 220, 360);
            assert.equal(polyline._latlngs.length, 2);
            happen.at('click', 300, 440);
            assert.equal(polyline._latlngs.length, 2);
        });

    });


    describe('#onRemove', function () {
        it('should remove every edit related layer on remove', function () {
            polyline.remove();
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, "no layer expected but one found");
            });
        });

    });

    describe('#pop', function () {

        it('should remove last latlng when drawing forward', function () {
            var layer = this.map.editTools.startPolyline();
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

        it('should remove first latlng when drawing backward', function () {
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueBackward();
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            assert.equal(layer._latlngs.length, 3);
            var first = layer._latlngs[0];
            assert.include(layer._latlngs, first);
            var latlng = layer.editor.pop();
            assert.equal(latlng.lat, first.lat);
            assert.ok(latlng);
            assert.equal(layer._latlngs.length, 2);
            assert.notInclude(layer._latlngs, first);
            this.map.removeLayer(layer);
        });

    });

    describe('#push', function () {

        it('should add a latlng at the end when drawing forward', function () {
            var layer = this.map.editTools.startPolyline();
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

        it('should add latlng on the beginning when drawing backward', function () {
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueBackward();
            var latlng = p2ll(150, 100);
            layer.editor.push(latlng);
            assert.equal(layer._latlngs.length, 3);
            var first = layer._latlngs[0];
            assert.include(layer._latlngs, latlng);
            assert.equal(latlng.lat, first.lat);
            this.map.removeLayer(layer);
        });

    });

    describe('#events', function () {

        it('should fire editable:drawing:start on startPolyline call', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:start', call);
            var other = this.map.editTools.startPolyline();
            assert.equal(called, 1);
            this.map.off('editable:drawing:start', call);
            this.map.removeLayer(other);
            assert.notOk(this.map.editTools._drawingEditor);
        });

        it('should fire editable:drawing:click on click', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:click', call);
            var layer = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            assert.equal(called, 1);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(called, 2);
            this.map.off('editable:drawing:click', call);
            layer.remove();
            assert.equal(called, 2);
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

        it('should send editable:drawing:click before adding vertex', function () {
            var called = 0,
                calledWhenEmpty = 0,
                call = function () {
                    called++;
                    if (!polyline._latlngs.length) calledWhenEmpty = 1;
                };
            this.map.on('editable:drawing:click', call);
            var polyline = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.equal(called, 1);
            assert.ok(calledWhenEmpty);
            assert.ok(polyline._latlngs.length);
            this.map.off('editable:drawing:click', call);
            polyline.remove();
        });

        it('should send editable:drawing:clicked after adding vertex', function () {
            var called = 0,
                calledAfterClick = 0,
                call = function () {
                    called++;
                    if (polyline._latlngs.length) calledAfterClick = 1;
                };
            this.map.on('editable:drawing:clicked', call);
            var polyline = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.equal(called, 1);
            assert.ok(calledAfterClick);
            assert.ok(polyline._latlngs.length);
            this.map.off('editable:drawing:clicked', call);
            polyline.remove();
        });

        it('should be possible to cancel editable:drawing:click actions', function () {
            var called = 0,
                call = function (e) {
                    e.cancel();
                    called++;
                };
            this.map.on('editable:drawing:click', call);
            var polyline = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.at('mousemove', 250, 200);
            happen.at('click', 250, 200);
            assert.equal(called, 1);
            assert.notOk(polyline._latlngs.length);
            this.map.off('editable:drawing:click', call);
            polyline.remove();
        });

    });

    describe('Multi', function () {

        describe('#enableEdit', function () {

            it('should create vertex and middle markers for each line', function () {
                var multi = L.polyline([
                    [
                      [43.1239, 1.244],
                      [43.123, 1.253]
                    ],
                    [
                      [43.1269, 1.246],
                      [43.126, 1.252],
                      [43.1282, 1.255]
                    ]
                ]).addTo(this.map);
                multi.enableEdit();
                assert.ok(multi._latlngs[0][0].__vertex);
                assert.ok(multi._latlngs[0][1].__vertex);
                assert.ok(multi._latlngs[0][1].__vertex.middleMarker);
                assert.ok(multi._latlngs[1][0].__vertex);
                assert.ok(multi._latlngs[1][1].__vertex);
                assert.ok(multi._latlngs[1][1].__vertex.middleMarker);
                multi.remove();
                this.map.editTools.editLayer.eachLayer(function (layer) {
                    assert.fail(layer, null, "no layer expected but one found");
                });
            });

        });

        describe('#newShape', function () {

            it('should add a new shape on empty polyline', function () {
                var multi = L.polyline([]).addTo(this.map);
                multi.enableEdit();
                multi.editor.newShape();
                happen.at('mousemove', 100, 150);
                happen.at('click', 100, 150);
                assert.equal(multi._latlngs.length, 1);
                happen.at('mousemove', 200, 350);
                happen.at('click', 200, 350);
                assert.equal(multi._latlngs.length, 2);
                happen.at('mousemove', 300, 250);
                happen.at('click', 300, 250);
                assert.equal(multi._latlngs.length, 3);
                happen.at('click', 300, 250);
                multi.remove();
            });

            it('should add a new outline to existing simple polyline', function () {
                var multi = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
                multi.enableEdit();
                multi.editor.newShape();
                assert(L.Util.isArray(multi._latlngs[0]));
                assert.ok(multi._latlngs[0].length);
                assert.ok(L.Util.isArray(multi._latlngs[1]));
                assert.notOk(multi._latlngs[1].length);
                happen.at('mousemove', 300, 300);
                happen.at('click', 300, 300);
                assert.equal(multi._latlngs[1].length, 1);
                happen.at('mousemove', 350, 350);
                happen.at('click', 350, 350);
                assert.equal(multi._latlngs[1].length, 2);
                happen.at('click', 350, 350);
                multi.remove();
            });

            it('should emit editable:shape:new on newShape call', function () {
                var called = 0,
                    call = function () {called++;};
                this.map.on('editable:shape:new', call);
                var line = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
                assert.equal(called, 0);
                line.enableEdit();
                assert.equal(called, 0);
                line.editor.newShape();
                assert.equal(called, 1);
                line.remove();
            });

        });

    });

});
