'use strict';
describe('L.CircleEditor', function() {
    var p2ll;

    before(function () {
        this.map = map;
        map.setZoom(16);  // So we don't need to use enormous radius.
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
    });

    describe('#startCircle()', function() {

        it('should create circle and editor', function() {
            var layer = this.map.editTools.startCircle();
            assert.ok(layer);
            assert.ok(layer.editor);
            assert.notOk(map.hasLayer(layer));
            layer.editor.disable();
        });

        it('should add layer to map at first click', function() {
            var layer = this.map.editTools.startCircle();
            assert.notOk(map.hasLayer(layer));
            happen.drawingClick(300, 300);
            assert.ok(map.hasLayer(layer));
            layer.remove();
        });

        it('should draw circle on click-drag', function (done) {
            var layer = this.map.editTools.startCircle();
            happen.drag(200, 200, 220, 220, function () {
                expect(layer._radius).to.be.gt(0);
                layer.remove();
                done();
            });
        });

    });

    describe('#enableEdit()', function() {

        it('should attach editor', function () {
            var layer = L.circle(p2ll(200, 200)).addTo(this.map);
            layer.enableEdit();
            assert.ok(layer.editor);
            layer.remove();
        });

        it('should update radius on radius handler drag', function (done) {
            var layer = L.circle(p2ll(200, 200), {radius: 20}).addTo(this.map);
            var before = layer._radius;
            layer.enableEdit();
            var startPoint = this.map.latLngToLayerPoint(layer.editor._resizeLatLng),
                x = startPoint.x,
                y = startPoint.y;
            happen.drag(x, y, x + 20, y + 20, function () {
                expect(layer._radius).to.be.gt(before);
                layer.remove();
                done();
            });
        });

    });

    describe('#disableEdit()', function() {

        it('should stop editing on disableEdit', function () {
            var layer = L.circle(p2ll(200, 200)).addTo(this.map);
            layer.enableEdit();
            assert.ok(layer.editor);
            layer.disableEdit();
            assert.notOk(layer.editor);
            layer.remove();
        });

    });


    describe('#enableDragging()', function () {

        it('should drag a circle', function (done) {
            var layer = L.circle(p2ll(200, 200), {radius: 50}).addTo(this.map),
                before = layer._latlng.lat;
            layer.enableEdit();
            assert.equal(before, layer._latlng.lat);
            happen.drag(210, 210, 220, 220, function () {
                assert.notEqual(before, layer._latlng.lat);
                layer.remove();
                done();
            });
        });

        it('should send editable:dragstart event', function (done) {
            var layer = L.circle(p2ll(200, 200), {radius: 50}).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:dragstart', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.drag(210, 210, 220, 220, function () {
                assert.equal(called, 1);
                layer.remove();
                done();
            });
        });

        it('should send editable:dragend event', function (done) {
            var layer = L.circle(p2ll(200, 200), {radius: 50}).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:dragend', call);
            layer.enableEdit();
            assert.equal(called, 0);
            happen.drag(210, 210, 220, 220, function () {
                assert.equal(called, 1);
                layer.remove();
                done();
            });
        });

        it('should send editable:drag event', function (done) {
            var layer = L.circle(p2ll(200, 200), {radius: 50}).addTo(this.map),
                called = 0,
                call = function () {called++;};
            layer.on('editable:drag', call);
            layer.enableEdit();
            assert.notOk(called);
            happen.drag(210, 210, 220, 220, function () {
                assert.ok(called);
                layer.remove();
                done();
            });
        });

    });


    describe('#events', function () {

        it('should fire editable:drawing:start on startCircle call', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:start', call);
            var layer = this.map.editTools.startCircle();
            assert.equal(called, 1);
            this.map.off('editable:drawing:start', call);
            layer.editor.disable();
            assert.notOk(this.map.editTools._drawingEditor);
        });

        it('should fire editable:drawing:end on mouseup', function (done) {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var layer = this.map.editTools.startCircle();
            assert.equal(called, 0);
            happen.drag(200, 200, 220, 220, function () {
                assert.equal(called, 1);
                map.off('editable:drawing:end', call);
                layer.remove();
                assert.equal(called, 1);
                done();
            });
        });

        it('should fire editable:drawing:commit on mouseup', function (done) {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:commit', call);
            var layer = this.map.editTools.startCircle();
            assert.equal(called, 0);
            happen.drag(200, 200, 220, 220, function () {
                assert.equal(called, 1);
                map.off('editable:drawing:commit', call);
                layer.remove();
                assert.equal(called, 1);
                done();
            });
        });

        it('should not fire editable:drawing:commit on mousedown', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:commit', call);
            var layer = this.map.editTools.startCircle();
            assert.equal(called, 0);
            happen.at('mousedown', 200, 200);
            assert.equal(called, 0);
            happen.at('mouseup', 200, 200);
            assert.equal(called, 1);
            this.map.off('editable:drawing:commit', call);
            layer.remove();
        });

        it('should fire editable:drawing:end on stopDrawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var layer = this.map.editTools.startCircle();
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
            var layer = this.map.editTools.startCircle();
            this.map.editTools.stopDrawing();
            assert.equal(called, 0);
            this.map.off('editable:drawing:commit', call);
            layer.remove();
            assert.equal(called, 0);
        });

        it('should fire editable:drawing:move on mousemove while drawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:move', call);
            var layer = this.map.editTools.startCircle();
            assert.equal(called, 0);
            happen.at('mousemove', 450, 450);
            assert.equal(called, 1);
            happen.drawingClick(450, 450);
            this.map.off('editable:drawing:move', call);
            layer.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:move on mousemove while resizing', function (done) {
            var called = 0,
                call = function () {called++;};
            var layer = L.circle(p2ll(200, 200), {radius: 20}).addTo(this.map);
            layer.enableEdit();
            assert.equal(called, 0);
            this.map.on('editable:drawing:move', call);
            var startPoint = this.map.latLngToLayerPoint(layer.editor._resizeLatLng),
                x = startPoint.x,
                y = startPoint.y;
            happen.drag(x, y, x + 20, y + 20, function () {
                assert.ok(called > 0);
                map.off('editable:drawing:move', call);
                layer.remove();
                done();
            });
        });

    });

});
