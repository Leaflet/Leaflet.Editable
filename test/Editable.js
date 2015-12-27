'use strict';
describe('L.Editable', function () {

    before(function () {
        this.map = map;
    });

    afterEach(function () {
        this.map.editTools.editLayer.eachLayer(function (layer) {
            assert.fail(layer, null, 'no layer expected but one found');
        });
    });

    describe('#init', function () {

        it('should be initialized', function () {
            assert.ok(this.map.editTools);
        });

    });

    describe('#drawing on top of other elements', function () {

        xit('should be possible to create latlng on top of previously created vertex', function () {
            var line1 = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            happen.drawingClick(500, 500);
            assert.equal(line1._latlngs.length, 2);
            var line2 = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            assert.equal(line2._latlngs.length, 1);
            assert.equal(line1._latlngs.length, 2);
            happen.drawingClick(500, 500);
            happen.drawingClick(500, 500);
            assert.equal(line2._latlngs.length, 2);
            assert.equal(line1._latlngs.length, 2);
            line1.remove();
            line2.remove();
        });

        it('should be possible to delete other vertex of currently drawn path', function () {
            var line = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            happen.drawingClick(500, 550);
            assert.equal(line._latlngs.length, 3);
            happen.at('click', 500, 500);
            assert.equal(line._latlngs.length, 2);
            happen.drawingClick(500, 550);
            assert.equal(line._latlngs.length, 2);
            this.map.removeLayer(line);
        });

    });
    describe('#commitDrawing', function () {

        it('should commit drawing if drawing is active', function () {
            var layer = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            assert.equal(layer._latlngs.length, 2);
            this.map.editTools.commitDrawing();
            assert.equal(layer._latlngs.length, 2);
            happen.drawingClick(550, 550);
            assert.equal(layer._latlngs.length, 2);
            layer.remove();
        });

        it('should fail silently if no drawing is active', function () {
            try {
                this.map.editTools.commitDrawing();
            } catch (e) {
                fail('commitDrawing has raised');
            }
        });

    });

    describe('#map options', function () {

        it('should possible to override editTools class with editToolsClass', function () {

            var CustomEditable = L.Editable.extend({
                options: {
                    checkme: true
                }
            });
            var container = document.createElement('DIV');
            document.body.appendChild(container);
            var someMap = L.map(container, {editable: true, editToolsClass: CustomEditable});
            someMap.setView([0, 0], 0);
            assert.ok(someMap.editTools);
            assert.ok(someMap.editTools.options.checkme);
            assert.ok(someMap.editTools instanceof CustomEditable);

        });

    });


    describe('#drawing', function () {

        it('should return false if nothing happen', function () {
            assert.notOk(this.map.editTools.drawing());
        });

        it('should return false if an editor is active but not drawing', function () {
            var layer = L.polyline([]).addTo(this.map);
            layer.enableEdit();
            assert.notOk(this.map.editTools.drawing());
            layer.remove()
        });

        it('should return true if an editor is active and drawing forward', function () {
            var layer = this.map.editTools.startPolyline();
            assert.ok(this.map.editTools.drawing());
            layer.editor.disable();
        });

        it('should return true if an editor is active and drawing backward', function () {
            var layer = L.polyline([[1, 2], [3, 4]]).addTo(this.map);
            layer.enableEdit();
            layer.editor.continueBackward();
            assert.ok(this.map.editTools.drawing());
            layer.remove()
        });

    });

});
