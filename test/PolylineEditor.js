'use strict';
describe('L.PolylineEditor', function() {
    var p2ll;

    before(function () {
        this.map = map;
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
    });

    describe('#startNewLine()', function() {
        var polyline;

        after(function () {
            polyline.remove();
        })

        it('should create feature and editor', function() {
            polyline = this.map.editTools.startPolyline();
            assert.ok(polyline);
            assert.ok(polyline.editor);
            assert.notOk(polyline._latlngs.length);
        });

        it('should create first latlng on first click', function () {
            happen.drawingClick(100, 150);
            assert.equal(polyline._latlngs.length, 1);
        });

        it('should not finish line on first point click', function () {
            happen.drawingClick(100, 150);
            assert.equal(polyline._latlngs.length, 1);
            assert(polyline.editor.drawing);
        });

        it('should create more latlngs on more click', function () {
            happen.drawingClick(200, 350);
            assert.equal(polyline._latlngs.length, 2);
            happen.drawingClick(300, 250);
            assert.equal(polyline._latlngs.length, 3);
        });

        it('should finish shape on last point click', function () {
            happen.drawingClick(300, 250);
            happen.at('click', 300, 250);
            assert.equal(polyline._latlngs.length, 3);
        });

        it('should apply passed options to the polyline', function(){
            var className = 'my-class';
            var other = this.map.editTools.startPolyline(null, {className: className});
            assert.equal(other.options.className, className);
            other.disableEdit();
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
                happen.drawingClick(300, 250);
                happen.at('click', 300, 250);
                assert.equal(polyline._latlngs.length, 2);
            });

        });

        describe('#continueForward()', function () {

            it('should add new latlng on map click', function () {
                polyline.editor.continueForward();
                happen.drawingClick(400, 400);
                assert.equal(polyline._latlngs.length, 3);
                happen.at('click', 400, 400);  // Finish shape
                happen.at('click', 450, 450);  // Click elsewhere on the map
                assert.equal(polyline._latlngs.length, 3);
            });

        });

        describe('#continueBackward()', function () {

            it('should add new latlng on map click', function () {
                polyline.editor.continueBackward();
                happen.drawingClick(400, 100);
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

    });

    describe('#disableEdit()', function () {

        afterEach(function () {
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, 'no layer expected but one found');
            });
        })

        it('should stop editing on disableEdit() call', function () {
            var layer = this.map.editTools.startPolyline();
            layer.disableEdit();
            assert.notOk(layer.editor);
        });

        it('should be reenabled after remove if active', function () {
            var layer = L.polyline([]).addTo(this.map);
            layer.enableEdit();
            this.map.removeLayer(layer);
            assert.notOk(layer.editEnabled());
            this.map.addLayer(layer);
            assert.ok(layer.editEnabled());
            layer.remove();
        });

        it('should not be reenabled after remove if not active', function () {
            var layer = L.polyline([]).addTo(this.map);
            layer.enableEdit();
            layer.disableEdit();
            this.map.removeLayer(layer);
            assert.notOk(layer.editEnabled());
            this.map.addLayer(layer);
            assert.notOk(layer.editEnabled());
        });

    });

    describe('#enable()', function () {

        afterEach(function () {
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, 'no layer expected but one found');
            });
        })

        it('should start editing on enableEdit() call', function () {
            var layer = L.polyline([]).addTo(this.map);
            layer.enableEdit();
            assert.ok(layer.editEnabled());
            layer.remove();
        });

        it('should not reset editor when calling enableEdit() twice', function () {
            var layer = L.polyline([]).addTo(this.map);
            layer.enableEdit();
            var editor = layer.editor;
            layer.enableEdit();
            assert.equal(editor, layer.editor);
            layer.remove();
        });

    });

    describe('#onRemove', function () {

        it('should remove every edit related layer on remove', function () {
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, 'no layer expected but one found before');
            });
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.remove();
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, 'no layer expected but one found after');
            });
        });

    });


    describe('#drawing', function () {

        it('should return false if no drawing happen', function () {
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            assert.notOk(layer.editor.drawing());
            layer.remove();
        });

        it('should return true if an editor is active and drawing forward', function () {
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueForward();
            assert.ok(layer.editor.drawing());
            layer.remove();
        });

        it('should return true if an editor is active and drawing backward', function () {
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueBackward();
            assert.ok(layer.editor.drawing());
            layer.remove();
        });

    });

    describe('#continue forward', function () {

        it('should attach forward line guide if points were drawn', function () {
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueForward();
            assert.equal(this.map.editTools.editLayer.hasLayer(this.map.editTools.forwardLineGuide), true, 'forward line guide is attached');
            layer.remove();
        });

        it('should not attach forward line guide if no points were drawn', function () {
            var layer = L.polyline([]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueForward();
            assert.equal(this.map.editTools.editLayer.hasLayer(this.map.editTools.forwardLineGuide), false, 'forward line guide is not attached');
            layer.remove();
        });

    });

    describe('#continue backward', function () {

        it('should attach backward line guide if points were drawn', function () {
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueBackward();
            assert.equal(this.map.editTools.editLayer.hasLayer(this.map.editTools.backwardLineGuide), true, 'backward line guide is attached');
            layer.remove();
        });

        it('should not attach backward line guide if no points were drawn', function () {
            var layer = L.polyline([]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueBackward();
            assert.equal(this.map.editTools.editLayer.hasLayer(this.map.editTools.backwardLineGuide), false, 'backward line guide is not attached');
            layer.remove();
        });

    });

    describe('#pop', function () {

        it('should remove last latlng when drawing forward', function () {
            var layer = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
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
            happen.drawingClick(450, 450);
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
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
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

    describe('#endDrawing', function () {

        afterEach(function () {
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, 'no layer expected but one found');
            });
        })

        it('should remove shape if not enough latlngs', function () {
            var layer = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            assert.equal(layer._latlngs.length, 1);
            layer.editor.cancelDrawing();
            assert.equal(layer._latlngs.length, 0);
            layer.remove();
        });

        it('should remove shape if not enough latlngs (multi)', function () {
            var latlngs = [
                    [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                ],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            assert.equal(layer._latlngs.length, 2);
            layer.editor.newShape();
            happen.drawingClick(400, 400);
            assert.equal(layer._latlngs.length, 3);
            layer.editor.cancelDrawing();
            assert.equal(layer._latlngs.length, 2);
            layer.remove();
        });

        it('should not remove shape if enough latlngs (multi)', function () {
            var latlngs = [
                    [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                ],
                layer = L.polyline(latlngs).addTo(this.map);
            layer.enableEdit();
            layer._latlngs[1][2].__vertex.continue();
            happen.drawingClick(400, 400);
            layer.editor.cancelDrawing();
            assert.equal(layer._latlngs[1].length, 4);
            layer.remove();
        });

    });

    describe('#enableDragging()', function () {

        it('should drag a polyline', function (done) {
            var latlngs = [p2ll(100, 100), p2ll(100, 200)],
                layer = L.polyline(latlngs).addTo(this.map),
                before = layer._latlngs[1].lat;
            layer.enableEdit();
            assert.equal(before, layer._latlngs[1].lat);
            happen.drag(100, 130, 120, 150, function () {
                assert.notEqual(before, layer._latlngs[1].lat);
                layer.remove();
                done();
            });
        });

        it('should drag a multipolyline', function (done) {
            var latlngs = [
                    [p2ll(100, 100), p2ll(100, 200)],
                    [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                ],
                layer = L.polyline(latlngs).addTo(this.map),
                before = layer._latlngs[1][2].lat;
            layer.enableEdit();
            assert.equal(before, layer._latlngs[1][2].lat);
            happen.drag(100, 130, 120, 150, function () {
                assert.notEqual(before, layer._latlngs[1][2].lat);
                layer.remove();
                done();
            });
        });

        it('should send editable:dragstart event', function (done) {
            var latlngs = [p2ll(100, 100), p2ll(100, 200)],
                layer = L.polyline(latlngs).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:dragstart', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.drag(100, 130, 120, 150, function () {
                assert.equal(called, 1);
                layer.remove();
                done();
            });
        });

        it('should send editable:dragend event', function (done) {
            var latlngs = [p2ll(100, 100), p2ll(100, 200)],
                layer = L.polyline(latlngs).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:dragend', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.drag(100, 130, 120, 150, function () {
                assert.equal(called, 1);
                layer.remove();
                done();
            });
        });

        it('should send editable:drag event', function (done) {
            var latlngs = [p2ll(100, 100), p2ll(100, 200)],
                layer = L.polyline(latlngs).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:drag', call);
            layer.enableEdit();
            assert.notOk(called);
            happen.drag(100, 130, 120, 150, function () {
                assert.ok(called);
                layer.remove();
                done();
            });
        });

    });

    describe('#events', function () {

        afterEach(function () {
            this.map.editTools.editLayer.eachLayer(function (layer) {
                assert.fail(layer, null, 'no layer expected but one found');
            });
        })

        it('should fire editable:drawing:start on startPolyline call', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:start', call);
            var other = this.map.editTools.startPolyline();
            assert.equal(called, 1);
            this.map.off('editable:drawing:start', call);
            other.editor.disable();  // Not added to the map, just disable ongoing drawing.
            assert.notOk(this.map.editTools._drawingEditor);
        });

        it('should fire editable:drawing:click on click', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:click', call);
            var layer = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.drawingClick(450, 450);
            assert.equal(called, 1);
            happen.drawingClick(500, 500);
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
            happen.drawingClick(450, 450);
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

        it('should fire editable:vertex:new ', function () {
            var newCount = 0,
                gotNew = function (e) {newCount++;};
            this.map.on('editable:vertex:new', gotNew);
            var layer = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(400, 400);
            assert.equal(newCount, 2);
            this.map.off('editable:vertex:new', gotNew);
            layer.remove();
        });

        it('should fire editable:vertex:new on middle marker click', function (done) {
            var newCount = 0,
                gotNew = function (e) {newCount++;};
            var layer = this.map.editTools.startPolyline();
            happen.drawingClick(500, 500);
            happen.drawingClick(400, 400);
            assert.equal(newCount, 0);
            this.map.on('editable:vertex:new', gotNew);
            happen.drag(450, 450, 300, 400, function () {
                assert.equal(newCount, 1);
                map.off('editable:vertex:new', gotNew);
                layer.remove();
                done();
            });
        });

        it('should not trigger editable:vertex:new when enabling edition', function () {
            var newCount = 0,
                gotNew = function (e) {newCount++;};
            this.map.on('editable:vertex:new', gotNew);
            var layer = L.polyline([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueForward();
            happen.drawingClick(400, 400);
            assert.equal(newCount, 1);
            map.off('editable:vertex:new', gotNew);
            layer.remove();
        });

        it('should fire editable:drawing:mouseover after hovering over vertex', function () {
            var layer = L.polyline([p2ll(100, 100), p2ll(150, 150)]).addTo(this.map),
                called = 0,
                call = function () {called++;};
            this.map.on('editable:vertex:mouseover', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.at("mouseover", 100, 100);
            assert.ok(called);
            this.map.off('editable:vertex:mouseover', call);
            layer.remove();
        });

        it('should fire editable:drawing:mouseout after hovering out of a vertex', function () {
            var layer = L.polyline([p2ll(100, 100), p2ll(150, 150)]).addTo(this.map),
                called = 0,
                call = function () {called++;};
            this.map.on('editable:vertex:mouseout', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.at("mouseout", 100, 100);
            assert.ok(called);
            this.map.off('editable:vertex:mouseout', call);
            layer.remove();
        });

        it('should send editable:drawing:click before adding vertex', function () {
            var called = 0,
                line,
                calledWhenEmpty = 0,
                call = function () {
                    called++;
                    if (!line._latlngs.length) calledWhenEmpty = 1;
                };
            this.map.on('editable:drawing:click', call);
            line = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.drawingClick(250, 250);
            assert.equal(called, 1);
            assert.ok(calledWhenEmpty);
            assert.ok(line._latlngs.length);
            this.map.off('editable:drawing:click', call);
            line.remove();
        });

        it('should send editable:drawing:clicked after adding vertex', function () {
            var called = 0, line,
                calledAfterClick = 0,
                call = function () {
                    called++;
                    if (line._latlngs.length) calledAfterClick = 1;
                };
            this.map.on('editable:drawing:clicked', call);
            line = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.drawingClick(250, 250);
            assert.equal(called, 1);
            assert.ok(calledAfterClick);
            assert.ok(line._latlngs.length);
            this.map.off('editable:drawing:clicked', call);
            line.remove();
        });

        it('should be possible to cancel editable:drawing:click actions', function () {
            var called = 0,
                call = function (e) {
                    e.cancel();
                    called++;
                };
            this.map.on('editable:drawing:click', call);
            var layer = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.drawingClick(250, 250);
            assert.equal(called, 1);
            assert.notOk(layer._latlngs.length);
            this.map.off('editable:drawing:click', call);
            layer.editor.disable();
        });

        it('should send editable:drawing:move while drawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:move', call);
            var layer = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.at('mousemove', 250, 250);
            assert.equal(called, 1);
            this.map.off('editable:drawing:move', call);
            layer.editor.disable();
        });

        it('should send editable:drawing:move when dragging vertex', function (done) {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:move', call);
            var layer = L.polyline([p2ll(100, 100), p2ll(150, 150)]).addTo(this.map);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.drag(100, 100, 110, 110, function () {
                assert.ok(called > 0);
                map.off('editable:drawing:move', call);
                layer.remove();
                done();
            });
        });

        it('should send editable:editing after adding vertex', function () {
            var called = 0, line,
                calledAfterClick = 0,
                call = function () {
                    called++;
                    if (line._latlngs[0].__vertex) calledAfterClick = 1;
                };
            this.map.on('editable:editing', call);
            line = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.drawingClick(250, 250);
            assert.equal(called, 1);
            assert.ok(calledAfterClick);
            assert.ok(line._latlngs.length);
            assert.ok(this.map.hasLayer(line));
            this.map.off('editable:editing', call);
            line.remove();
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
                    assert.fail(layer, null, 'no layer expected but one found');
                });
            });

        });

        describe('#formatShape', function () {
            var layer;

            before(function () {
                layer = L.polyline([]).addTo(this.map);
                layer.enableEdit();
            });

            after(function () {
                layer.remove();
            });

            it('should not nest flat shape', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)];
                assert.deepEqual(layer.editor.formatShape(latlngs), latlngs);
            });

            it('should not nest empty shape', function () {
                assert.deepEqual(layer.editor.formatShape([]), []);
            });

            it('should unnest nested shape', function () {
                var latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]];
                assert.deepEqual(layer.editor.formatShape(latlngs), latlngs[0]);
            });

        });

        describe('#insertShape', function () {

            it('should insert flat shape on multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.insertShape(shape, 1);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[1]);
                layer.remove();
            });

            it('should add nested shape on multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.insertShape(shape, 1);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape[0], layer._latlngs[1]);
                layer.remove();
            });

        });

        describe('#appendShape', function () {

            it('should add flat shape on flat line', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                layer.disableEdit();
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape, layer._latlngs[1]);
                layer.remove();
            });

            it('should add nested shape on flat line', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape[0], layer._latlngs[1]);
                layer.remove();
            });

            it('should add flat shape on multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[2]);
                layer.remove();
            });

            it('should add nested shape on multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.appendShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape[0], layer._latlngs[2]);
                layer.remove();
            });

        });

        describe('#prependShape', function () {

            it('should add flat shape on flat line', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape, layer._latlngs[0]);
                layer.remove();
            });

            it('should add nested shape on flat line', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    shape = [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 2);
                assert.deepEqual(shape[0], layer._latlngs[0]);
                layer.remove();
            });

            it('should add flat shape on multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape, layer._latlngs[0]);
                layer.remove();
            });

            it('should add nested shape on multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.prependShape(shape);
                assert.equal(layer._latlngs.length, 3);
                assert.deepEqual(shape[0], layer._latlngs[0]);
                layer.remove();
            });

        });

        describe('#newShape', function () {

            it('should add a new shape on empty polyline', function () {
                var multi = L.polyline([]).addTo(this.map);
                multi.enableEdit();
                multi.editor.newShape();
                happen.drawingClick(100, 150);
                assert.equal(multi._latlngs.length, 1);
                happen.drawingClick(200, 350);
                assert.equal(multi._latlngs.length, 2);
                happen.drawingClick(300, 250);
                assert.equal(multi._latlngs.length, 3);
                happen.drawingClick(300, 250);
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
                happen.drawingClick(300, 300);
                assert.equal(multi._latlngs[1].length, 1);
                happen.drawingClick(350, 350);
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

        describe('#shapeAt', function () {

            it('should return latlngs in case of a flat polyline', function () {
                var latlngs = [p2ll(100, 100), p2ll(100, 200)],
                    layer = L.polyline(latlngs).addTo(this.map),
                    shape = layer.shapeAt(p2ll(100, 150));
                assert.equal(shape.length, 2);
                assert.equal(shape[0], latlngs[0]);
                layer.remove();
            });

            it('should return whole shape in case of a multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 100), p2ll(100, 200)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    layer = L.polyline(latlngs).addTo(this.map),
                    shape = layer.shapeAt(p2ll(100, 150));
                assert.equal(shape.length, 2);
                assert.equal(shape[0], latlngs[0][0]);
                layer.remove();
            });

        });

        describe('#deleteShape', function () {

            it('should emit editable:shape:delete before deleting the shape on flat polyline', function () {
                var layer = L.polyline([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map),
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
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    layer = L.polyline(latlngs).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        assert.equal(layer._latlngs.length, 2);  // Not yet deleted
                        assert.equal(e.shape.length, 3);
                    };
                this.map.on('editable:shape:delete', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(called, 1);
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0], latlngs[1][0]);
                this.map.off('editable:shape:delete', call);
                layer.remove();
            });

            it('editable:shape:delete should be cancellable on flat polyline', function () {
                var layer = L.polyline([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map),
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

            it('editable:shape:delete should be cancellable on multi polyline', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    layer = L.polyline(latlngs).addTo(this.map),
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
                assert.equal(layer._latlngs[0][0], latlngs[0][0]);
                this.map.off('editable:shape:delete', call);
                layer.remove();
            });

            it('should emit editable:shape:deleted after deleting the shape on flat polyline', function () {
                var layer = L.polyline([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(this.map),
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
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    layer = L.polyline(latlngs).addTo(this.map),
                    called = 0,
                    call = function (e) {
                        called++;
                        assert.equal(layer._latlngs.length, 1);  // Already deleted
                        assert.equal(e.shape.length, 3);  // Deleted shape
                    };
                this.map.on('editable:shape:deleted', call);
                layer.enableEdit();
                assert.equal(called, 0);
                layer.editor.deleteShape(layer._latlngs[0]);
                assert.equal(called, 1);
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0], latlngs[1][0]);
                this.map.off('editable:shape:deleted', call);
                layer.remove();
            });

        });

        describe('#deleteShapeAt', function () {

            it('should delete the shape on flat polyline', function () {
                var layer = L.polyline([p2ll(100, 100), p2ll(100, 200)]).addTo(this.map);
                layer.enableEdit();
                layer.editor.deleteShapeAt(p2ll(100, 150));
                assert.equal(layer._latlngs.length, 0);
                layer.remove();
            });

            it('should delete the shape on multi', function () {
                var latlngs = [
                        [p2ll(100, 100), p2ll(100, 200)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit();
                layer.editor.deleteShapeAt(p2ll(100, 150));
                assert.equal(layer._latlngs.length, 1);
                assert.equal(layer._latlngs[0][0], latlngs[1][0]);
                layer.remove();
            });

        });

        describe('#splitShape', function () {

            it('should split flat line at given index', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit().splitShape(layer._latlngs, 1);
                layer.disableEdit();
                assert.deepEqual(layer._latlngs, [[p2ll(100, 150), p2ll(150, 200)], [p2ll(150, 200), p2ll(200, 100)]]);
                assert.notStrictEqual(layer._latlngs[0][1], layer._latlngs[1][0]);  // LatLng has been cloned.
                layer.remove();
            });

            it('should split multi line shape at given index', function () {
                var latlngs = [
                        [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                        [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
                    ],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit().splitShape(layer._latlngs[0], 1);
                layer.disableEdit();
                assert.deepEqual(layer._latlngs, [[p2ll(100, 150), p2ll(150, 200)], [p2ll(150, 200), p2ll(200, 100)], [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]);
                layer.remove();
            });

            it('should not split if index is first', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit().splitShape(layer._latlngs, 0);
                layer.disableEdit();
                assert.deepEqual(layer._latlngs, latlngs);
                layer.remove();
            });

            it('should not split if index is last', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit().splitShape(layer._latlngs, 2);
                layer.disableEdit();
                assert.deepEqual(layer._latlngs, latlngs);
                layer.remove();
            });

            it('should not split if index gt than last', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    layer = L.polyline(latlngs).addTo(this.map);
                layer.enableEdit().splitShape(layer._latlngs, 3);
                layer.disableEdit();
                assert.deepEqual(layer._latlngs, latlngs);
                layer.remove();
            });

            it('should fire editable:editing', function () {
                var latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
                    layer = L.polyline(latlngs).addTo(this.map),
                    called = 0,
                    call = function () {called++;};
                this.map.on('editable:editing', call);
                layer.enableEdit().splitShape(layer._latlngs, 1);
                assert.equal(called, 1);
                layer.disableEdit();
                assert.deepEqual(layer._latlngs, [[p2ll(100, 150), p2ll(150, 200)], [p2ll(150, 200), p2ll(200, 100)]]);
                this.map.off('editable:editing', call);
                layer.remove();
            });

        });

    });

});
