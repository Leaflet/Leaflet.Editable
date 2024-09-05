describe('L.CircleMarkerEditor', () => {
  let p2ll

  before(function () {
    this.map = map
    map.setZoom(16) // So we don't need to use enormous radius.
    p2ll = (x, y) => map.layerPointToLatLng([x, y])
  })

  describe('#startCircleMarker()', () => {
    it('should create circleMarker and editor', function () {
      const layer = this.map.editTools.startCircleMarker()
      assert.ok(layer)
      assert.ok(layer.editor)
      assert.notOk(map.hasLayer(layer))
      layer.editor.disable()
    })

    it('should add layer to map at first click', function () {
      const layer = this.map.editTools.startCircleMarker()
      assert.notOk(map.hasLayer(layer))
      happen.drawingClick(300, 300)
      assert.ok(map.hasLayer(layer))
      layer.remove()
    })
  })

  describe('#enableEdit()', () => {
    it('should attach editor', function () {
      const layer = L.circleMarker(p2ll(200, 200)).addTo(this.map)
      layer.enableEdit()
      assert.ok(layer.editor)
      layer.remove()
    })
  })

  describe('#disableEdit()', () => {
    it('should stop editing on disableEdit', function () {
      const layer = L.circleMarker(p2ll(200, 200)).addTo(this.map)
      layer.enableEdit()
      assert.ok(layer.editor)
      layer.disableEdit()
      assert.notOk(layer.editor)
      layer.remove()
    })
  })

  describe('#enableDragging()', () => {
    it('should drag a circleMarker', function (done) {
      const layer = L.circleMarker(p2ll(200, 200), { radius: 20 }).addTo(this.map)
      const before = layer._latlng.lat
      layer.enableEdit()
      assert.equal(before, layer._latlng.lat)
      happen.drag(210, 210, 220, 220, () => {
        assert.notEqual(before, layer._latlng.lat)
        layer.remove()
        done()
      })
    })

    it('should send editable:dragstart event', function (done) {
      const layer = L.circleMarker(p2ll(200, 200), { radius: 20 }).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:dragstart', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.drag(210, 210, 220, 220, () => {
        assert.equal(called, 1)
        layer.remove()
        done()
      })
    })

    it('should send editable:dragend event', function (done) {
      const layer = L.circleMarker(p2ll(200, 200), { radius: 20 }).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:dragend', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.drag(210, 210, 220, 220, () => {
        assert.equal(called, 1)
        layer.remove()
        done()
      })
    })

    it('should send editable:drag event', function (done) {
      const layer = L.circleMarker(p2ll(200, 200), { radius: 20 }).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:drag', call)
      layer.enableEdit()
      assert.notOk(called)
      happen.drag(210, 210, 220, 220, () => {
        assert.ok(called)
        layer.remove()
        done()
      })
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
  })
})
