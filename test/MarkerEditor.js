describe('L.MarkerEditor', function() {
    var mouse, marker;

    before(function () {
        this.map = map;
    });
    after(function () {
        marker.disableEdit();
        this.map.removeLayer(marker);
    });

    describe('#startNewPolygon()', function() {

        it('should create feature and editor', function() {
            marker = this.map.editTools.startMarker();
            assert.ok(marker);
            assert.ok(marker.editor);
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
            marker.disableEdit();
            assert.notOk(marker.editor);
        });

    });

    describe('#enable()', function () {

        it('should start editing on enable() call', function () {
            marker.enableEdit();
            assert.ok(marker.editor);
        });

    });

    describe('#drag()', function () {

        it('should update latlng on marker drag', function (done) {
            var before = marker._latlng.lat;
            happen.drag(300, 299, 350, 350, function () {
                assert.notEqual(before, marker._latlng.lat);
                done();
            });
        });

    });

});
