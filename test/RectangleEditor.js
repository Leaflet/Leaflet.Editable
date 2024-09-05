describe('L.RectangleEditor', () => {
  let p2ll

  before(function () {
    this.map = map
    p2ll = (x, y) => map.containerPointToLatLng([x, y])
  })

  describe('#startRectangle()', () => {
    it('should create rectangle and editor', function () {
      const layer = this.map.editTools.startRectangle()
      assert.ok(layer)
      assert.ok(layer.editor)
      assert.notOk(map.hasLayer(layer))
      layer.editor.disable()
      layer.remove()
    })

    it('should add rectangle to map at first click', function () {
      const layer = this.map.editTools.startRectangle()
      assert.notOk(map.hasLayer(layer))
      happen.drawingClick(300, 300)
      assert.ok(map.hasLayer(layer))
      layer.remove()
    })

    it('should draw rectangle on click-drag', function (done) {
      const layer = this.map.editTools.startRectangle()
      happen.drag(200, 200, 240, 240, () => {
        expect(layer._latlngs[0][3].lat).not.to.be.eql(layer._latlngs[0][1].lat)
        expect(layer._latlngs[0][1]).to.be.nearLatLng(p2ll(200, 200))
        expect(layer._latlngs[0][3]).to.be.nearLatLng(p2ll(240, 240))
        layer.remove()
        done()
      })
    })

    it('should draw rectangle on click-drag reverse', function (done) {
      const layer = this.map.editTools.startRectangle()
      happen.drag(220, 220, 200, 200, () => {
        expect(layer._latlngs[0][3].lat).not.to.be.eql(layer._latlngs[0][1].lat)
        expect(layer._latlngs[0][1]).to.be.nearLatLng(p2ll(220, 220))
        expect(layer._latlngs[0][3]).to.be.nearLatLng(p2ll(200, 200))
        // if (!window.callPhantom) {
        // }
        layer.remove()
        done()
      })
    })
  })

  describe('#enableEdit()', () => {
    it('should attach editor', function () {
      const layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map)
      layer.enableEdit()
      assert.ok(layer.editor)
      layer.remove()
    })

    it('should update rectangle on south east corner drag', function (done) {
      const layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map)
      const before = layer._latlngs[0][3].lat
      layer.enableEdit()
      happen.drag(220, 220, 240, 240, () => {
        expect(layer._latlngs[0][3].lat).not.to.eql(before)
        if (!window.callPhantom) {
          expect(layer._latlngs[0][1]).to.be.nearLatLng(p2ll(200, 200)) // Untouched
          expect(layer._latlngs[0][3]).to.be.nearLatLng(p2ll(240, 240))
        }
        layer.remove()
        done()
      })
    })

    it('should allow reverting rectangle', function (done) {
      const layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map)
      const before = layer._latlngs[0][3].lat
      layer.enableEdit()
      happen.drag(220, 220, 180, 180, () => {
        expect(layer._latlngs[0][3].lat).not.to.eql(before)
        if (!window.callPhantom) {
          expect(layer._latlngs[0][1]).to.be.nearLatLng(p2ll(200, 200)) // Untouched
          expect(layer._latlngs[0][3]).to.be.nearLatLng(p2ll(180, 180))
        }
        layer.remove()
        done()
      })
    })
  })

  describe('#disableEdit()', () => {
    it('should stop editing on disableEdit', function () {
      const layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map)
      layer.enableEdit()
      assert.ok(layer.editor)
      layer.disableEdit()
      assert.notOk(layer.editor)
      layer.remove()
    })
  })

  describe('#enableDragging()', () => {
    it('should drag a rectangle', function (done) {
      const latlngs = [p2ll(100, 100), p2ll(200, 200)]
      const layer = L.rectangle(latlngs).addTo(this.map)
      const before = layer._latlngs[0][1].lat
      layer.enableEdit()
      assert.equal(before, layer._latlngs[0][1].lat)
      happen.drag(100, 130, 120, 150, () => {
        assert.notEqual(before, layer._latlngs[0][1].lat)
        layer.remove()
        done()
      })
    })

    it('should send editable:dragstart event', function (done) {
      const latlngs = [p2ll(100, 100), p2ll(200, 200)]
      const layer = L.rectangle(latlngs).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:dragstart', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.drag(100, 130, 120, 150, () => {
        assert.equal(called, 1)
        layer.remove()
        done()
      })
    })

    it('should send editable:dragend event', function (done) {
      const latlngs = [p2ll(100, 100), p2ll(200, 200)]
      const layer = L.rectangle(latlngs).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:dragend', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.drag(100, 130, 120, 150, () => {
        assert.equal(called, 1)
        layer.remove()
        done()
      })
    })

    it('should send editable:drag event', function (done) {
      const latlngs = [p2ll(100, 100), p2ll(200, 200)]
      const layer = L.rectangle(latlngs).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:drag', call)
      layer.enableEdit()
      assert.notOk(called)
      happen.drag(100, 130, 120, 150, () => {
        assert.ok(called)
        layer.remove()
        done()
      })
    })
  })

  describe('#events', () => {
    it('should fire editable:drawing:start on startRectangle call', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:start', call)
      const layer = this.map.editTools.startRectangle()
      assert.equal(called, 1)
      this.map.off('editable:drawing:start', call)
      layer.editor.disable()
      assert.notOk(this.map.editTools._drawingEditor)
    })

    it('should fire editable:drawing:end on mouseup', function (done) {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:end', call)
      const layer = this.map.editTools.startRectangle()
      assert.equal(called, 0)
      happen.drag(200, 200, 220, 220, () => {
        assert.equal(called, 1)
        map.off('editable:drawing:end', call)
        layer.remove()
        assert.equal(called, 1)
        done()
      })
    })

    it('should fire editable:drawing:commit on mouseup', function (done) {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:commit', call)
      const layer = this.map.editTools.startRectangle()
      assert.equal(called, 0)
      happen.drag(200, 200, 220, 220, () => {
        assert.equal(called, 1)
        map.off('editable:drawing:commit', call)
        layer.remove()
        assert.equal(called, 1)
        done()
      })
    })

    it('should not fire editable:drawing:commit on mousedown', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:commit', call)
      const layer = this.map.editTools.startRectangle()
      assert.equal(called, 0)
      happen.at('mousedown', 200, 200)
      assert.equal(called, 0)
      happen.at('mouseup', 200, 200)
      assert.equal(called, 1)
      this.map.off('editable:drawing:commit', call)
      layer.remove()
    })

    it('should fire editable:drawing:end on stopDrawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:end', call)
      const layer = this.map.editTools.startRectangle()
      this.map.editTools.stopDrawing()
      assert.equal(called, 1)
      this.map.off('editable:drawing:end', call)
      layer.remove()
      assert.equal(called, 1)
    })

    it('should not fire editable:drawing:commit on stopDrawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:commit', call)
      const layer = this.map.editTools.startRectangle()
      this.map.editTools.stopDrawing()
      assert.equal(called, 0)
      this.map.off('editable:drawing:commit', call)
      layer.remove()
      assert.equal(called, 0)
    })

    it('should fire editable:drawing:move on mousemove while drawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:move', call)
      const layer = this.map.editTools.startRectangle()
      assert.equal(called, 0)
      happen.at('mousemove', 450, 450)
      assert.equal(called, 1)
      happen.drawingClick(450, 450)
      this.map.off('editable:drawing:move', call)
      layer.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:drawing:move on mousemove while moving corner', function (done) {
      let called = 0
      const call = () => {
        called++
      }
      const layer = L.rectangle([p2ll(200, 200), p2ll(220, 220)]).addTo(this.map)
      layer.enableEdit()
      assert.equal(called, 0)
      this.map.on('editable:drawing:move', call)
      happen.drag(200, 200, 220, 220, () => {
        assert.ok(called > 0)
        map.off('editable:drawing:move', call)
        layer.remove()
        done()
      })
    })
  })
})
