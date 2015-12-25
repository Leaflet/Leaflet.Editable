'use strict';

describe('L.MarkerEditor', function() {
    var p2ll;

    before(function () {
        this.map = map;
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
    });

    describe('#startNewMarker()', function() {
        var marker;

        after(function () {
            marker.remove();
        });

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
            happen.drawingClick(300, 300);
            var before = marker._latlng;
            happen.at('mousemove', 400, 400);
            assert.equal(before, marker._latlng);
        });

        it('should apply passed options to the marker', function(){
            var title = 'My title';
            var other = this.map.editTools.startPolygon(null, {title:title});
            assert.equal(other.options.title, title);
            other.remove();
        });

        it('should update latlng on marker drag', function (done) {
            var before = marker._latlng.lat;
            happen.drag(300, 299, 350, 350, function () {
                assert.notEqual(before, marker._latlng.lat);
                done();
            });
        });

    });

    describe('#enable()', function () {

        it('should start editing on enable() call', function () {
            var marker = L.marker([0, 0]).addTo(this.map);
            marker.enableEdit();
            assert.ok(marker.editor);
        });

    });

    describe('#disable()', function () {

        it('should stop editing on disable() call', function () {
            var marker = L.marker([0, 0]).addTo(this.map);
            marker.enableEdit();
            assert.ok(marker.editEnabled());
            marker.disableEdit();
            assert.notOk(marker.editor);
        });

        it('should be reenabled after remove if active', function () {
            var marker = L.marker([0, 0]).addTo(this.map);
            marker.enableEdit();
            this.map.removeLayer(marker);
            assert.notOk(marker.editEnabled());
            this.map.addLayer(marker);
            assert.ok(marker.editEnabled());
        });

        it('should not be reenabled after remove if not active', function () {
            var marker = L.marker([0, 0]).addTo(this.map);
            marker.enableEdit();
            marker.disableEdit();
            this.map.removeLayer(marker);
            assert.notOk(marker.editEnabled());
            this.map.addLayer(marker);
            assert.notOk(marker.editEnabled());
        });

    });

    describe('#events', function () {

        it('should fire editable:drawing:start on startMarker call', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:start', call);
            var other = this.map.editTools.startMarker();
            assert.equal(called, 1);
            this.map.off('editable:drawing:start', call);
            other.editor.disable();
            assert.notOk(this.map.editTools._drawingEditor);
        });

        it('should fire editable:drawing:end on click', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var other = this.map.editTools.startMarker();
            assert.equal(called, 0);
            happen.drawingClick(450, 450);
            assert.equal(called, 1);
            this.map.off('editable:drawing:end', call);
            other.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:commit on finish', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:commit', call);
            var other = this.map.editTools.startMarker();
            assert.equal(called, 0);
            happen.drawingClick(450, 450);
            assert.equal(called, 1);
            this.map.off('editable:drawing:commit', call);
            other.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:end on stopDrawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var other = this.map.editTools.startMarker();
            this.map.editTools.stopDrawing();
            assert.equal(called, 1);
            this.map.off('editable:drawing:end', call);
            other.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:clicked before end/commit on click', function () {
            var first = null, last,
                setFirst = function (e) {if(first === null) first = e.type;},
                setLast = function (e) {last = e.type;};
            this.map.on('editable:drawing:end', setFirst);
            this.map.on('editable:drawing:clicked', setFirst);
            this.map.on('editable:drawing:commit', setFirst);
            this.map.on('editable:drawing:end', setLast);
            this.map.on('editable:drawing:clicked', setLast);
            this.map.on('editable:drawing:commit', setLast);
            var other = this.map.editTools.startMarker();
            happen.drawingClick(450, 450);
            assert.equal(first, 'editable:drawing:clicked');
            assert.equal(last, 'editable:drawing:end');
            this.map.off('editable:drawing:end', setFirst);
            this.map.off('editable:drawing:clicked', setFirst);
            this.map.off('editable:drawing:commit', setFirst);
            this.map.off('editable:drawing:end', setLast);
            this.map.off('editable:drawing:clicked', setLast);
            this.map.off('editable:drawing:commit', setLast);
            other.remove();
        });

        it('should not fire editable:drawing:commit on stopDrawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:commit', call);
            var other = this.map.editTools.startMarker();
            this.map.editTools.stopDrawing();
            assert.equal(called, 0);
            this.map.off('editable:drawing:commit', call);
            other.remove();
            assert.equal(called, 0);
        });

        it('should fire editable:drawing:move on mousemove while drawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:move', call);
            var other = this.map.editTools.startMarker();
            assert.equal(called, 0);
            happen.at('mousemove', 450, 450);
            assert.equal(called, 1);
            happen.drawingClick(450, 450);
            this.map.off('editable:drawing:move', call);
            other.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:move on mousemove while moving marker', function (done) {
            var called = 0,
                call = function () {called++;};
            var layer = L.marker(p2ll(200, 200)).addTo(this.map);
            layer.enableEdit();
            assert.equal(called, 0);
            this.map.on('editable:drawing:move', call);
            happen.drag(200, 190, 210, 210, function () {
                assert.ok(called > 0);
                map.off('editable:drawing:move', call);
                layer.remove();
                done();
            });
        });

    });

});
