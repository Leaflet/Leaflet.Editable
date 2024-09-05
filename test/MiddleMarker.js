describe('L.MiddleMarker', () => {
  before(function () {
    this.map = map
  })

  afterEach(function () {
    this.map.editTools.editLayer.eachLayer((layer) => {
      assert.fail(layer, null, 'no layer expected but one found')
    })
  })

  describe('#setVisibility()', () => {
    let line

    afterEach(() => {
      line.remove()
    })

    it('should be visible if space is enough', function () {
      line = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      happen.at('click', 500, 500)
      assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5)
    })

    it('should not be visible if space is not enough', function () {
      line = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(450, 460)
      happen.at('click', 450, 460)
      assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0)
    })

    it('should toggle visibilty on zoom', function (done) {
      line = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      happen.at('click', 500, 500)
      assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5)
      const mustBe05 = () => {
        window.setTimeout(() => {
          assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5)
          done()
        }, 10)
      }
      const mustBe0 = () => {
        window.setTimeout(() => {
          assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0)
          map.once('zoomend', mustBe05)
          map.zoomIn(3)
        }, 10)
      }
      map.once('zoomend', mustBe0)
      map.zoomOut(3)
    })

    it('should show on drag out', function (done) {
      line = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(450, 460)
      happen.at('click', 450, 460)
      assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0)
      happen.drag(450, 460, 450, 480, () => {
        assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5)
        done()
      })
    })

    it('should hide on drag closer', function (done) {
      line = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(450, 480)
      happen.at('click', 450, 480)
      assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0.5)
      happen.drag(450, 450, 450, 470, () => {
        assert.equal(line._latlngs[1].__vertex.middleMarker._icon.style.opacity, 0)
        done()
      })
    })
  })

  describe('#computeLatLng', () => {
    it('compute middlemarker in the middle even in areas close to pole', function () {
      this.map.setView([62.5, 22.7], 5) // Move to Scandinavia
      const line = this.map.editTools.startPolyline()
      happen.drawingClick(100, 100)
      happen.drawingClick(500, 500)
      happen.at('click', 500, 500)
      assert.equal(
        this.map.latLngToContainerPoint(line._latlngs[1].__vertex.middleMarker._latlng)
          .x,
        300
      )
      assert.equal(
        this.map.latLngToContainerPoint(line._latlngs[1].__vertex.middleMarker._latlng)
          .y,
        300
      )
      this.map.removeLayer(line)
      this.map.setView(startPoint, 16) // Move back to avoid rounding issues when projecting.
    })
  })
})
