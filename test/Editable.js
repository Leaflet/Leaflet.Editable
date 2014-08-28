describe('L.Editable', function () {

    before(function () {
        this.map = map;
    });
    after(function () {
    });

    describe('#init', function () {

        it('should be initialized', function () {
            assert.ok(this.map.editTools);
        });

    });
    describe('#updateNewClickHandlerZIndex', function () {

        it('should be possible to create latlng on top of previously created vertex', function () {
            var line1 = this.map.editTools.startPolyline();
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(line1._latlngs.length, 2);
            var line2 = this.map.editTools.startPolyline();
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            assert.equal(line2._latlngs.length, 1);
            assert.equal(line1._latlngs.length, 2);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(line2._latlngs.length, 2);
            assert.equal(line1._latlngs.length, 2);
            this.map.removeLayer(line1);
            this.map.removeLayer(line2);
        });

        it('should be possible to delete other vertex of currently drawn path', function () {
            var line = this.map.editTools.startPolyline();
            happen.at('mousemove', 450, 450);
            happen.at('click', 450, 450);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            happen.at('mousemove', 500, 550);
            happen.at('click', 500, 550);
            assert.equal(line._latlngs.length, 3);
            happen.at('mousemove', 500, 500);
            happen.at('click', 500, 500);
            assert.equal(line._latlngs.length, 2);
            happen.at('mousemove', 500, 550);
            happen.at('click', 500, 550);
            assert.equal(line._latlngs.length, 2);
            this.map.removeLayer(line);
        });

    });

});
