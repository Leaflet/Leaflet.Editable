describe('L.MarkerEditor', () => {
  let p2ll

  before(function () {
    this.map = map
    p2ll = (x, y) => map.layerPointToLatLng([x, y])
  })

  describe('#startNewMarker()', () => {
    let marker

    after(() => {
      marker.remove()
    })

    it('should create feature and editor', function () {
      marker = this.map.editTools.startMarker()
      assert.ok(marker)
      assert.ok(marker.editor)
    })

    it('should update marker position on mousemove', () => {
      happen.at('mousemove', 200, 200)
      const before = marker._latlng
      happen.at('mousemove', 300, 300)
      assert.notEqual(before, marker._latlng)
    })

    it('should set latlng on first click', () => {
      happen.drawingClick(300, 300)
      const before = marker._latlng
      happen.at('mousemove', 400, 400)
      assert.equal(before, marker._latlng)
    })

    it('should apply passed options to the marker', function () {
      const title = 'My title'
      const other = this.map.editTools.startPolygon(null, { title: title })
      assert.equal(other.options.title, title)
      other.remove()
    })

    it('should update latlng on marker drag', (done) => {
      const before = marker._latlng.lat
      happen.drag(300, 299, 350, 350, () => {
        assert.notEqual(before, marker._latlng.lat)
        done()
      })
    })
  })

  describe('#enable()', () => {
    it('should start editing on enable() call', function () {
      const marker = L.marker([0, 0]).addTo(this.map)
      marker.enableEdit()
      assert.ok(marker.editor)
    })
  })

  describe('#disable()', () => {
    it('should stop editing on disable() call', function () {
      const marker = L.marker([0, 0]).addTo(this.map)
      marker.enableEdit()
      assert.ok(marker.editEnabled())
      marker.disableEdit()
      assert.notOk(marker.editor)
    })

    it('should be reenabled after remove if active', function () {
      const marker = L.marker([0, 0]).addTo(this.map)
      marker.enableEdit()
      this.map.removeLayer(marker)
      assert.notOk(marker.editEnabled())
      this.map.addLayer(marker)
      assert.ok(marker.editEnabled())
    })

    it('should not be reenabled after remove if not active', function () {
      const marker = L.marker([0, 0]).addTo(this.map)
      marker.enableEdit()
      marker.disableEdit()
      this.map.removeLayer(marker)
      assert.notOk(marker.editEnabled())
      this.map.addLayer(marker)
      assert.notOk(marker.editEnabled())
    })
  })

  describe('#events', () => {
    it('should fire editable:drawing:start on startMarker call', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:start', call)
      const other = this.map.editTools.startMarker()
      assert.equal(called, 1)
      this.map.off('editable:drawing:start', call)
      other.editor.disable()
      assert.notOk(this.map.editTools._drawingEditor)
    })

    it('should fire editable:drawing:end on click', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:end', call)
      const other = this.map.editTools.startMarker()
      assert.equal(called, 0)
      happen.drawingClick(450, 450)
      assert.equal(called, 1)
      this.map.off('editable:drawing:end', call)
      other.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:drawing:commit on finish', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:commit', call)
      const other = this.map.editTools.startMarker()
      assert.equal(called, 0)
      happen.drawingClick(450, 450)
      assert.equal(called, 1)
      this.map.off('editable:drawing:commit', call)
      other.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:edited on finish', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:edited', call)
      const other = this.map.editTools.startMarker()
      assert.equal(called, 0)
      happen.drawingClick(450, 450)
      assert.equal(called, 1)
      this.map.off('editable:edited', call)
      other.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:drawing:end on stopDrawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:end', call)
      const other = this.map.editTools.startMarker()
      this.map.editTools.stopDrawing()
      assert.equal(called, 1)
      this.map.off('editable:drawing:end', call)
      other.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:drawing:clicked before end/commit on click', function () {
      let first = null
      let last
      const setFirst = (e) => {
        if (first === null) first = e.type
      }
      const setLast = (e) => {
        last = e.type
      }
      this.map.on('editable:drawing:end', setFirst)
      this.map.on('editable:drawing:clicked', setFirst)
      this.map.on('editable:drawing:commit', setFirst)
      this.map.on('editable:drawing:end', setLast)
      this.map.on('editable:drawing:clicked', setLast)
      this.map.on('editable:drawing:commit', setLast)
      const other = this.map.editTools.startMarker()
      happen.drawingClick(450, 450)
      assert.equal(first, 'editable:drawing:clicked')
      assert.equal(last, 'editable:drawing:end')
      this.map.off('editable:drawing:end', setFirst)
      this.map.off('editable:drawing:clicked', setFirst)
      this.map.off('editable:drawing:commit', setFirst)
      this.map.off('editable:drawing:end', setLast)
      this.map.off('editable:drawing:clicked', setLast)
      this.map.off('editable:drawing:commit', setLast)
      other.remove()
    })

    it('should not fire editable:drawing:commit on stopDrawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:commit', call)
      const other = this.map.editTools.startMarker()
      this.map.editTools.stopDrawing()
      assert.equal(called, 0)
      this.map.off('editable:drawing:commit', call)
      other.remove()
      assert.equal(called, 0)
    })

    it('should fire editable:drawing:move on mousemove while drawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:move', call)
      const other = this.map.editTools.startMarker()
      assert.equal(called, 0)
      happen.at('mousemove', 450, 450)
      assert.equal(called, 1)
      happen.drawingClick(450, 450)
      this.map.off('editable:drawing:move', call)
      other.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:drawing:move on mousemove while moving marker', function (done) {
      let called = 0
      const call = () => {
        called++
      }
      const layer = L.marker(p2ll(200, 200)).addTo(this.map)
      layer.enableEdit()
      assert.equal(called, 0)
      this.map.on('editable:drawing:move', call)
      happen.drag(200, 190, 210, 210, () => {
        assert.ok(called > 0)
        map.off('editable:drawing:move', call)
        layer.remove()
        done()
      })
    })

    it('should fire editable:edited after moving marker', function (done) {
      let called = 0
      const call = () => {
        called++
      }
      const layer = L.marker(p2ll(200, 200)).addTo(this.map)
      layer.enableEdit()
      assert.equal(called, 0)
      this.map.on('editable:edited', call)
      happen.drag(200, 190, 210, 210, () => {
        assert.ok(called > 0)
        map.off('editable:edited', call)
        layer.remove()
        done()
      })
    })
  })
})
