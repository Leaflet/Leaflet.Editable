describe('L.PolylineEditor', function() {
    var mouse, polyline;

    before(function () {
        this.map = map;
    });
    after(function () {
        polyline.editor.disable();
        this.map.removeLayer(polyline);
    });

    describe('#startNewLine()', function() {

        it('should create feature and editor', function() {
            polyline = this.map.editTools.startPolyline();
            assert.ok(polyline);
            assert.ok(polyline.editor);
            assert.notOk(polyline._latlngs.length);
        });

        it('should create latlng on click', function () {
            happen.at('mousemove', 100, 150);
            happen.at('click', 100, 150);
            assert.equal(polyline._latlngs.length, 1);
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
            polyline.endEdit();
            assert.notOk(polyline.editor);
        });

    });

    describe('#enable()', function () {

        it('should start editing on enable() call', function () {
            polyline.edit();
            assert.ok(polyline.editor);
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

    describe('#dragMiddleMarker()', function (done) {

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

});
