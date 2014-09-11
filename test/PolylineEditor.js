describe('L.PolylineEditor', function() {
    var mouse, polyline;

    before(function () {
        this.map = map;
    });
    after(function () {
        this.map.removeLayer(polyline);
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
            var other = this.map.editTools.startPolyline();
            assert.equal(called, 0);
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            assert.equal(called, 1);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(called, 2);
            this.map.off('editable:drawing:click', call);
            this.map.removeLayer(other);
            assert.equal(called, 2);
        });

        it('should fire editable:drawing:click/commit/end on last click', function () {
            var second = 0, first = null, last,
                setFirst = function (e) {if(first === null) first = e.type;},
                setLast = function (e) {last = e.type;},
                setSecond = function () {second++;};
            this.map.on('editable:drawing:end', setFirst);
            this.map.on('editable:drawing:click', setFirst);
            this.map.on('editable:drawing:commit', setFirst);
            this.map.on('editable:drawing:end', setLast);
            this.map.on('editable:drawing:click', setLast);
            this.map.on('editable:drawing:commit', setLast);
            this.map.on('editable:drawing:commit', setSecond);
            var other = this.map.editTools.startPolyline();
            assert.equal(second, 0);
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            assert.equal(second, 0);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(second, 1);  // commit has been called
            assert.equal(first, 'editable:drawing:click');
            assert.equal(last, 'editable:drawing:end');
            this.map.off('editable:drawing:end', setFirst);
            this.map.off('editable:drawing:click', setFirst);
            this.map.off('editable:drawing:commit', setFirst);
            this.map.off('editable:drawing:end', setLast);
            this.map.off('editable:drawing:click', setLast);
            this.map.off('editable:drawing:commit', setLast);
            this.map.off('editable:drawing:commit', setSecond);
            this.map.removeLayer(other);
        });

    });

});
