'use strict';
describe('L.RectangleEditor', function() {
    var p2ll;

    before(function () {
        this.map = map;
        p2ll = function (x, y) {
            return map.layerPointToLatLng([x, y]);
        };
    });

    describe('#startRectangle()', function() {

        it('should create rectangle and editor', function() {
            var layer = this.map.editTools.startRectangle();
            assert.ok(layer);
            assert.ok(layer.editor);
            assert.notOk(map.hasLayer(layer));
            layer.editor.disable();
        });

        it('should add rectangle to map at first click', function() {
            var layer = this.map.editTools.startRectangle();
            assert.notOk(map.hasLayer(layer));
            happen.drawingClick(300, 300);
            assert.ok(map.hasLayer(layer));
            layer.remove();
        });

        it('should draw rectangle on click-drag', function (done) {
            var layer = this.map.editTools.startRectangle();
            happen.drag(200, 200, 220, 220, function () {
                // L.marker(p2ll(420, 420)).addTo(map);
                // callPhantom({'screenshot': 'failure'});
                expect(layer._latlngs[0][3].lat).not.to.be.eql(layer._latlngs[0][1].lat);
                if (!window.callPhantom) {
                    expect(layer._latlngs[0][1]).to.be.nearLatLng(p2ll(200, 200));
                    expect(layer._latlngs[0][3]).to.be.nearLatLng(p2ll(220, 220));
                }
                layer.remove();
                done();
            });
        });

    });

    describe('#enableEdit()', function() {

        it('should attach editor', function () {
            var layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map);
            layer.enableEdit();
            assert.ok(layer.editor);
            layer.remove();
        });

        it('should update rectangle on south east corner drag', function (done) {
            var layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map);
            var before = layer._latlngs[0][3].lat;
            layer.enableEdit();
            happen.drag(220, 220, 240, 240, function () {
                expect(layer._latlngs[0][3].lat).not.to.eql(before);
                if (!window.callPhantom) {
                    expect(layer._latlngs[0][1]).to.be.nearLatLng(p2ll(200, 200));  // Untouched
                    expect(layer._latlngs[0][3]).to.be.nearLatLng(p2ll(240, 240));
                }
                layer.remove();
                done();
            });
        });

    });

    describe('#disableEdit()', function() {

        it('should stop editing on disableEdit', function () {
            var layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map);
            layer.enableEdit();
            assert.ok(layer.editor);
            layer.disableEdit();
            assert.notOk(layer.editor);
            layer.remove();
        });

    });


    describe('#events', function () {

        it('should fire editable:drawing:start on startRectangle call', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:start', call);
            var layer = this.map.editTools.startRectangle();
            assert.equal(called, 1);
            this.map.off('editable:drawing:start', call);
            layer.editor.disable();
            assert.notOk(this.map.editTools._drawingEditor);
        });

        it('should fire editable:drawing:end on mouseup', function (done) {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var layer = this.map.editTools.startRectangle();
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
            var layer = this.map.editTools.startRectangle();
            assert.equal(called, 0);
            happen.drag(200, 200, 220, 220, function () {
                assert.equal(called, 1);
                map.off('editable:drawing:commit', call);
                layer.remove();
                assert.equal(called, 1);
                done();
            });
        });

        it('should fire editable:drawing:end on stopDrawing', function () {
            var called = 0,
                call = function () {called++;};
            this.map.on('editable:drawing:end', call);
            var layer = this.map.editTools.startRectangle();
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
            var layer = this.map.editTools.startRectangle();
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
            var layer = this.map.editTools.startRectangle();
            assert.equal(called, 0);
            happen.at('mousemove', 450, 450);
            assert.equal(called, 1);
            happen.drawingClick(450, 450);
            this.map.off('editable:drawing:move', call);
            layer.remove();
            assert.equal(called, 1);
        });

        it('should fire editable:drawing:move on mousemove while moving corner', function (done) {
            var called = 0,
                call = function () {called++;};
            var layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map);
            layer.enableEdit();
            assert.equal(called, 0);
            this.map.on('editable:drawing:move', call);
            happen.drag(200, 200, 220, 220, function () {
                assert.ok(called > 0);
                map.off('editable:drawing:move', call);
                layer.remove();
                done();
            });
        });

    });

});
