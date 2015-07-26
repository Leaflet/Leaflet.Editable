describe('L.MiddleMarker', function () {
    var mouse, polyline;

    before(function () {
        this.map = map;
    });
    after(function () {
    });

    describe('#setVisibility()', function () {
        var line;

        afterEach(function () {
            this.map.removeLayer(line);
        });

        it('should be visible if space is enough', function () {
            line = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            happen.at('click', 500, 500);
            assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5);
        });

        it('should not be visible if space is not enough', function () {
            line = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(450, 460);
            happen.at('click', 450, 460);
            assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0);
        });

        it('should toggle visibilty on zoom', function (done) {
            line = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(500, 500);
            happen.at('click', 500, 500);
            assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5);
            var mustBe05 = function () {
                map.off('zoomend', mustBe05);
                window.setTimeout(function () {
                    assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5);
                    done();
                }, 10);
            };
            var mustBe0 = function () {
                map.off('zoomend', mustBe0);
                window.setTimeout(function () {
                    assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0);
                    map.on('zoomend', mustBe05);
                    map.zoomIn(3);
                }, 10);
            };
            map.on('zoomend', mustBe0);
            map.zoomOut(3);
        });

        it('should show on drag out', function (done) {
            line = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(450, 460);
            happen.at('click', 450, 460);
            assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0);
            happen.drag(450, 460, 450, 480, function () {
                assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5);
                done();
            });
        });

        it('should hide on drag closer', function (done) {
            line = this.map.editTools.startPolyline();
            happen.drawingClick(450, 450);
            happen.drawingClick(450, 480);
            happen.at('click', 450, 480);
            assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5);
            happen.drag(450, 450, 450, 470, function () {
                assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0);
                done();
            });
        });

    });

    describe('#computeLatLng', function () {

        it('compute middlemarker in the middle even in areas close to pole', function () {
            this.map.setView([62.5, 22.7], 5);  // Move to Scandinavia
            var line = this.map.editTools.startPolyline();
            happen.drawingClick(100, 100);
            happen.drawingClick(500, 500);
            happen.at('click', 500, 500);
            assert.equal(this.map.latLngToContainerPoint(line._latlngs[1].__vertex.middleMarker._latlng).x, 300);
            assert.equal(this.map.latLngToContainerPoint(line._latlngs[1].__vertex.middleMarker._latlng).y, 300);
            this.map.removeLayer(line);
        });

    });

});
