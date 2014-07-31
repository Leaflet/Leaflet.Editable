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
            this.map.editable.startNewLine();
            assert.ok(this.map.editable.activeEditor);
            polyline = this.map.editable.activeEditor.feature;
            assert.ok(polyline);
            assert.notOk(this.map.editable.activeEditor.feature._latlngs.length);
        });

        it('should create latlng on click', function () {
            happen.at('mousemove', 100, 150);
            happen.at('click', 100, 150);
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 1);
            happen.at('mousemove', 200, 350);
            happen.at('click', 200, 350);
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 2);
            happen.at('mousemove', 300, 250);
            happen.at('click', 300, 250);
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 3);
        });

        it('should finish shape on last point click', function () {
            happen.at('click', 300, 250);
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 3);
        });

    });

    describe('#disable()', function () {

        it('should stop editing on disable() call', function () {
            polyline.endEdit();
            assert.notOk(this.map.editable.activeEditor);
        });

    });

    describe('#enable()', function () {

        it('should start editing on enable() call', function () {
            polyline.edit();
            assert.ok(this.map.editable.activeEditor);
        });

    });

    describe('#dragVertex()', function () {

        it('should update latlng on vertex drag', function (done) {
            var before = this.map.editable.activeEditor.feature._latlngs[1].lat,
                self = this;
            happen.drag(200, 350, 220, 360, function () {
                assert.notEqual(before, self.map.editable.activeEditor.feature._latlngs[1].lat);
                done();
            });
        });

    });

    describe('#deleteVertex()', function () {

        it('should delete latlng on vertex click', function () {
            happen.at('click', 300, 250);
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 2);
        });

    });

    describe('#continueForward()', function () {

        it('should add new latlng on map click', function () {
            this.map.editable.activeEditor.continueForward();
            happen.at('mousemove', 400, 400);
            happen.at('click', 400, 400);
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 3);
            happen.at('click', 400, 400);  // Finish shape
            happen.at('click', 450, 450);  // Click elsewhere on the map
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 3);
        });

    });

    describe('#continueBackward()', function () {

        it('should add new latlng on map click', function () {
            this.map.editable.activeEditor.continueBackward();
            happen.at('mousemove', 400, 100);
            happen.at('click', 400, 100);
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 4);
            happen.at('click', 400, 100);  // Finish shape
            happen.at('click', 450, 450);  // Click elsewhere on the map
            assert.equal(this.map.editable.activeEditor.feature._latlngs.length, 4);
        });

    });

    describe('#dragMiddleMarker()', function (done) {

        it('should insert new latlng on middle marker click', function (done) {
            var last = this.map.editable.activeEditor.feature._latlngs[3],
                third = this.map.editable.activeEditor.feature._latlngs[2],
                self = this,
                fromX = (400 + 220) / 2,
                fromY = (400 + 360) / 2;
            happen.drag(fromX, fromY, 300, 440, function () {
                assert.equal(self.map.editable.activeEditor.feature._latlngs.length, 5);
                // New should have been inserted between third and last latlng,
                // so third and last should not have changed
                assert.equal(last, self.map.editable.activeEditor.feature._latlngs[4]);
                assert.equal(third, self.map.editable.activeEditor.feature._latlngs[2]);
                done();
            });
        });

    });

});
