describe('L.MarkerEditor', function() {
    var mouse, marker;

    before(function () {
        this.map = map;
    });
    after(function () {
        marker.endEdit();
        this.map.removeLayer(marker);
    });

    describe('#startNewPolygon()', function() {

        it('should create feature and editor', function() {
            marker = this.map.editable.startMarker();
            assert.ok(this.map.editable.activeEditor);
            assert.ok(marker);
        });

        it('should update marker position on mousemove', function () {
            happen.at('mousemove', 200, 200);
            var before = marker._latlng;
            happen.at('mousemove', 300, 300);
            assert.notEqual(before, marker._latlng);
        });

        it('should set latlng on first click', function () {
            happen.at('click', 300, 300);
            var before = marker._latlng;
            happen.at('mousemove', 400, 400);
            assert.equal(before, marker._latlng);
        });

    });

    describe('#disable()', function () {

        it('should stop editing on disable() call', function () {
            marker.endEdit();
            assert.notOk(this.map.editable.activeEditor);
        });

    });

    describe('#enable()', function () {

        it('should start editing on enable() call', function () {
            marker.edit();
            assert.ok(this.map.editable.activeEditor);
        });

    });

    describe('#drag()', function () {

        it('should update latlng on marker drag', function (done) {
            var before = marker._latlng.lat,
                self = this;
            happen.drag(300, 299, 350, 350, function () {
                assert.notEqual(before, marker._latlng.lat);
                done();
            });
        });

    });

});
