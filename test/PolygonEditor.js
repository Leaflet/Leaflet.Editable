describe('L.PolygonEditor', () => {
  let p2ll
  let polygon

  before(function () {
    this.map = map
    p2ll = (x, y) => map.layerPointToLatLng([x, y])
  })

  describe('#startPolygon()', () => {
    it('should create feature and editor', function () {
      polygon = this.map.editTools.startPolygon()
      assert.ok(polygon)
      assert.ok(polygon.editor)
      assert.notOk(polygon._latlngs[0].length)
    })

    it('should create latlng on click', () => {
      happen.drawingClick(100, 150)
      assert.equal(polygon._latlngs[0].length, 1)
      happen.drawingClick(200, 350)
      assert.equal(polygon._latlngs[0].length, 2)
    })

    it('should not finish shape if not enough vertices', () => {
      happen.drawingClick(200, 350)
      assert.equal(polygon._latlngs[0].length, 2)
      assert.ok(polygon.editor.drawing())
    })

    it('should finish shape on last point click', () => {
      happen.drawingClick(300, 250)
      assert.equal(polygon._latlngs[0].length, 3)
      happen.drawingClick(300, 150)
      assert.equal(polygon._latlngs[0].length, 4)
      happen.drawingClick(300, 150)
      assert.equal(polygon._latlngs[0].length, 4)
    })

    it('should finish drawing also on first point', function () {
      const other = this.map.editTools.startPolygon()
      assert.notOk(other._latlngs[0].length)
      happen.drawingClick(400, 450)
      assert.equal(other._latlngs[0].length, 1)
      happen.drawingClick(450, 500)
      assert.equal(other._latlngs[0].length, 2)
      happen.drawingClick(300, 450)
      assert.equal(other._latlngs[0].length, 3)
      happen.drawingClick(400, 450)
      assert.equal(other._latlngs[0].length, 3)
      other.remove()
    })

    it('should apply passed options to the polygon', function () {
      const className = 'my-class'
      const other = this.map.editTools.startPolygon(null, {
        className: className,
      })
      assert.equal(other.options.className, className)
      other.editor.disable()
    })
  })

  describe('#disable()', () => {
    it('should stop editing on disable() call', () => {
      polygon.disableEdit()
      assert.notOk(polygon.editor)
    })

    it('should be reenabled after remove if active', function () {
      polygon.enableEdit()
      this.map.removeLayer(polygon)
      assert.notOk(polygon.editEnabled())
      this.map.addLayer(polygon)
      assert.ok(polygon.editEnabled())
    })

    it('should not be reenabled after remove if not active', function () {
      polygon.disableEdit()
      this.map.removeLayer(polygon)
      assert.notOk(polygon.editEnabled())
      this.map.addLayer(polygon)
      assert.notOk(polygon.editEnabled())
    })
  })

  describe('#enable()', () => {
    it('should start editing on enable() call', () => {
      polygon.enableEdit()
      assert.ok(polygon.editor)
    })
  })

  describe('#dragVertex()', () => {
    it('should update latlng on vertex drag', (done) => {
      const before = polygon._latlngs[0][2].lat
      happen.drag(300, 250, 310, 260, () => {
        assert.notEqual(before, polygon._latlngs[0][2].lat)
        done()
      })
    })
  })

  describe('#deleteVertex()', () => {
    it('should delete latlng on vertex click', () => {
      happen.at('click', 200, 350)
      assert.equal(polygon._latlngs[0].length, 3)
    })

    it('should not delete last latlng on vertex click if only three vertices', function () {
      const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
      const layer = L.polygon(latlngs).addTo(this.map)
      assert.equal(layer._latlngs[0].length, 3)
      layer.enableEdit()
      happen.at('click', 200, 100)
      assert.equal(layer._latlngs[0].length, 3)
      layer.remove()
    })

    it('should delete multi polygon hole shape at last vertex delete', function () {
      const latlngs = [
        [
          [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
          [p2ll(120, 160), p2ll(150, 170), p2ll(180, 120)],
        ],
        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
      ]
      const layer = L.polygon(latlngs).addTo(this.map)
      layer.enableEdit()
      assert.equal(layer._latlngs[0][1].length, 3)
      happen.at('click', 120, 160)
      happen.at('click', 150, 170)
      happen.at('click', 180, 120)
      assert.notOk(layer._latlngs[0][1])
      assert.ok(layer._latlngs[0])
      assert.ok(layer._latlngs[1])
      assert.ok(this.map.hasLayer(layer))
      layer.remove()
    })
  })

  describe('#dragMiddleMarker()', () => {
    it('should insert new latlng on middle marker click', (done) => {
      const first = polygon._latlngs[0][0]
      const second = polygon._latlngs[0][1]
      const fromX = (100 + 310) / 2
      const fromY = (150 + 260) / 2
      happen.drag(fromX, fromY, 150, 300, () => {
        assert.equal(polygon._latlngs[0].length, 4)
        // New should have been inserted between first and second latlng,
        // so second should equal third, and first should not have changed
        assert.equal(first, polygon._latlngs[0][0])
        assert.equal(second, polygon._latlngs[0][2])
        done()
      })
    })
  })

  describe('#newHole', () => {
    it('should create new hole on click', function () {
      assert.equal(polygon._latlngs[0].length, 4)
      polygon.editor.newHole(this.map.layerPointToLatLng([150, 170]))
      assert.equal(polygon._latlngs.length, 2)
      assert.equal(polygon._latlngs[0].length, 4)
      assert.equal(polygon._latlngs[1].length, 1)
      happen.drawingClick(200, 250)
      assert.equal(polygon._latlngs[1].length, 2)
      happen.drawingClick(250, 250)
      assert.equal(polygon._latlngs[1].length, 3)
      happen.drawingClick(250, 200)
      assert.equal(polygon._latlngs[1].length, 4)
    })

    xit('should not create new point when clicking outside', () => {
      happen.drawingClick(400, 400)
      assert.equal(polygon._latlngs[1].length, 4)
    })

    it('should finish shape on last point click', () => {
      happen.drawingClick(250, 200)
      happen.at('click', 250, 200)
      happen.drawingClick(260, 210)
      assert.equal(polygon._latlngs[1].length, 4)
    })

    it('should remove hole latlngs on click', () => {
      happen.at('click', 150, 170)
      assert.equal(polygon._latlngs[1].length, 3)
      happen.at('click', 200, 250)
      assert.equal(polygon._latlngs[1].length, 2)
      happen.at('click', 250, 250)
      assert.equal(polygon._latlngs[1].length, 1)
    })

    it('should remove hole array on last click', function () {
      happen.at('click', 250, 200)
      assert.notOk(polygon._latlngs[1])
      assert.ok(polygon._latlngs[0])
      assert.ok(polygon._latlngs)
      assert.ok(this.map.hasLayer(polygon))
      polygon.remove()
    })
  })

  describe('#drawing', () => {
    it('should return false if no drawing happen', function () {
      const layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(
        this.map
      )
      layer.enableEdit()
      assert.notOk(layer.editor.drawing())
      layer.remove()
    })

    it('should return true if an editor is active and drawing forward', function () {
      const layer = this.map.editTools.startPolygon()
      assert.ok(layer.editor.drawing())
      layer.editor.disable()
    })
  })

  describe('#pop', () => {
    it('should remove last latlng when drawing', function () {
      const layer = this.map.editTools.startPolygon()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      assert.equal(layer._latlngs[0].length, 2)
      const last = layer._latlngs[0][1]
      assert.include(layer._latlngs[0], last)
      const latlng = layer.editor.pop()
      assert.equal(latlng.lat, last.lat)
      assert.ok(latlng)
      assert.equal(layer._latlngs[0].length, 1)
      assert.notInclude(layer._latlngs[0], last)
      layer.remove()
    })
  })

  describe('#push', () => {
    it('should add a latlng at the end when drawing forward', function () {
      const layer = this.map.editTools.startPolygon()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      assert.equal(layer._latlngs[0].length, 2)
      const latlng = p2ll(100, 150)
      layer.editor.push(latlng)
      assert.include(layer._latlngs[0], latlng)
      const last = layer._latlngs[0][2]
      assert.equal(latlng.lat, last.lat)
      assert.equal(layer._latlngs[0].length, 3)
      layer.remove()
    })
  })

  describe('#endDrawing', () => {
    it('should remove shape if not enough latlngs', function () {
      const layer = this.map.editTools.startPolygon()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      assert.equal(layer._latlngs[0].length, 2)
      layer.editor.cancelDrawing()
      assert.equal(layer._latlngs[0].length, 0)
      layer.remove()
    })

    it('should remove shape if not enough latlngs (multi)', function () {
      const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
      const layer = L.polygon(latlngs).addTo(this.map)
      layer.enableEdit()
      assert.equal(layer._latlngs.length, 1)
      layer.editor.newShape()
      happen.drawingClick(400, 400)
      happen.drawingClick(500, 500)
      assert.equal(layer._latlngs.length, 2)
      layer.editor.cancelDrawing()
      assert.equal(layer._latlngs.length, 1)
      layer.remove()
    })

    it('should not remove shape if enough latlngs (multi)', function () {
      const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
      const layer = L.polygon(latlngs).addTo(this.map)
      layer.enableEdit()
      assert.equal(layer._latlngs.length, 1)
      layer.editor.newShape()
      happen.drawingClick(400, 400)
      happen.drawingClick(500, 400)
      happen.drawingClick(400, 500)
      assert.equal(layer._latlngs.length, 2)
      layer.editor.cancelDrawing()
      assert.equal(layer._latlngs.length, 2)
      layer.remove()
    })
  })

  describe('#parentShape()', () => {
    it('should find parent shape on simple polygon', function () {
      const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
      const layer = L.polygon(latlngs).addTo(this.map)
      assert.equal(layer.parentShape(layer._latlngs[0]), layer._latlngs)
      layer.remove()
    })

    it('should find parent shape on multi polygon', function () {
      const latlngs = [
        [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
      ]
      const layer = L.polygon(latlngs).addTo(this.map)
      assert.equal(layer.parentShape(layer._latlngs[0][0]), layer._latlngs[0])
      assert.equal(layer.parentShape(layer._latlngs[1][0]), layer._latlngs[1])
      layer.remove()
    })

    it('should find parent shape on multi polygon with hole', function () {
      const latlngs = [
        [
          [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
          [p2ll(120, 160), p2ll(150, 170), p2ll(180, 120)],
        ],
        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
      ]
      const layer = L.polygon(latlngs).addTo(this.map)
      assert.equal(layer.parentShape(layer._latlngs[0][0]), layer._latlngs[0])
      assert.equal(layer.parentShape(layer._latlngs[0][1]), layer._latlngs[0])
      assert.equal(layer.parentShape(layer._latlngs[1][0]), layer._latlngs[1])
      layer.remove()
    })
  })

  describe('#enableDragging()', () => {
    it('should drag a polygon', function (done) {
      const latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]]
      const layer = L.polygon(latlngs).addTo(this.map)
      const before = layer._latlngs[0][2].lat
      layer.enableEdit()
      assert.equal(before, layer._latlngs[0][2].lat)
      happen.drag(150, 150, 170, 170, () => {
        assert.notEqual(before, layer._latlngs[0][2].lat)
        layer.remove()
        done()
      })
    })

    it('should drag a multipolygon with hole', function (done) {
      const latlngs = [
        [
          [p2ll(100, 150), p2ll(150, 300), p2ll(300, 100)],
          [p2ll(220, 160), p2ll(150, 170), p2ll(180, 220)],
        ],
        [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
      ]
      const layer = L.polygon(latlngs).addTo(this.map)
      const before = layer._latlngs[1][0][2].lat
      layer.enableEdit()
      assert.equal(before, layer._latlngs[1][0][2].lat)
      happen.drag(150, 150, 170, 170, () => {
        assert.notEqual(before, layer._latlngs[1][0][2].lat)
        layer.remove()
        done()
      })
    })

    it('should send editable:dragstart event', function (done) {
      const latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]]
      const layer = L.polygon(latlngs).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:dragstart', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.drag(150, 150, 170, 170, () => {
        assert.equal(called, 1)
        layer.remove()
        done()
      })
    })

    it('should send editable:dragend event', function (done) {
      const latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]]
      const layer = L.polygon(latlngs).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:dragend', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.drag(150, 150, 170, 170, () => {
        assert.equal(called, 1)
        layer.remove()
        done()
      })
    })

    it('should send editable:drag event', function (done) {
      const latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]]
      const layer = L.polygon(latlngs).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      layer.on('editable:drag', call)
      layer.enableEdit()
      assert.notOk(called)
      happen.drag(150, 150, 170, 170, () => {
        assert.ok(called)
        layer.remove()
        done()
      })
    })
  })

  describe('Events', () => {
    afterEach(function () {
      this.map.editTools.editLayer.eachLayer((layer) => {
        assert.fail(layer, null, 'no layer expected but one found')
      })
    })

    it('should fire editable:drawing:start on startPolygon call', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:start', call)
      const layer = this.map.editTools.startPolygon()
      assert.equal(called, 1)
      this.map.off('editable:drawing:start', call)
      layer.editor.disable()
      assert.notOk(this.map.editTools._drawingEditor)
    })

    it('should fire editable:drawing:end on last click', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:end', call)
      const layer = this.map.editTools.startPolygon()
      assert.equal(called, 0)
      happen.drawingClick(100, 150)
      assert.equal(layer._latlngs[0].length, 1)
      assert.equal(called, 0)
      happen.drawingClick(200, 350)
      assert.equal(layer._latlngs[0].length, 2)
      assert.equal(called, 0)
      happen.drawingClick(300, 250)
      assert.equal(layer._latlngs[0].length, 3)
      assert.equal(called, 0)
      happen.at('click', 300, 250)
      assert.equal(called, 1)
      this.map.off('editable:drawing:end', call)
      layer.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:drawing:commit on last click', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:commit', call)
      const layer = this.map.editTools.startPolygon()
      assert.equal(called, 0)
      happen.drawingClick(100, 150)
      assert.equal(layer._latlngs[0].length, 1)
      assert.equal(called, 0)
      happen.drawingClick(200, 350)
      assert.equal(layer._latlngs[0].length, 2)
      assert.equal(called, 0)
      happen.drawingClick(300, 250)
      assert.equal(layer._latlngs[0].length, 3)
      assert.equal(called, 0)
      happen.at('click', 300, 250)
      assert.equal(called, 1)
      this.map.off('editable:drawing:commit', call)
      layer.remove()
      assert.equal(called, 1)
    })

    it('should fire editable:drawing:end on stopDrawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:end', call)
      const layer = this.map.editTools.startPolygon()
      this.map.editTools.stopDrawing()
      assert.equal(called, 1)
      this.map.off('editable:drawing:end', call)
      layer.editor.disable()
      assert.equal(called, 1)
    })

    it('should not fire editable:drawing:commit on stopDrawing', function () {
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:drawing:commit', call)
      const layer = this.map.editTools.startPolygon()
      this.map.editTools.stopDrawing()
      assert.equal(called, 0)
      this.map.off('editable:drawing:commit', call)
      layer.editor.disable()
      assert.equal(called, 0)
    })

    it('should fire editable:vertex:clicked before end/commit on last click', function () {
      let first = null
      let second = 0
      let last
      const setFirst = (e) => {
        if (first === null) first = e.type
      }
      const setSecond = () => {
        second++
      }
      const setLast = (e) => {
        last = e.type
      }
      this.map.on('editable:drawing:end', setFirst)
      this.map.on('editable:drawing:commit', setFirst)
      this.map.on('editable:drawing:end', setLast)
      this.map.on('editable:drawing:commit', setLast)
      this.map.on('editable:drawing:commit', setSecond)
      const layer = this.map.editTools.startPolygon()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      happen.drawingClick(400, 400)
      assert.notOk(first)
      assert.notOk(last)
      this.map.on('editable:vertex:clicked', setFirst)
      this.map.on('editable:vertex:clicked', setLast)
      assert.notOk(first)
      assert.notOk(last)
      assert.notOk(second)
      happen.at('click', 400, 400)
      assert.equal(first, 'editable:vertex:clicked')
      assert.equal(last, 'editable:drawing:end')
      assert.equal(second, 1) // commit has been called
      this.map.off('editable:drawing:end', setFirst)
      this.map.off('editable:drawing:commit', setFirst)
      this.map.off('editable:drawing:end', setLast)
      this.map.off('editable:drawing:commit', setLast)
      this.map.off('editable:vertex:clicked', setFirst)
      this.map.off('editable:vertex:clicked', setLast)
      layer.remove()
    })

    it('should fire editable:drawing:click before adding vertex', function () {
      let called = 0
      let calledWhenEmpty = 0
      const call = () => {
        called++
        if (!layer._latlngs[0].length) calledWhenEmpty = 1
      }
      this.map.on('editable:drawing:click', call)
      const layer = this.map.editTools.startPolygon()
      assert.equal(called, 0)
      happen.drawingClick(250, 200)
      assert.equal(called, 1)
      assert.ok(calledWhenEmpty)
      assert.ok(layer._latlngs[0].length)
      this.map.off('editable:drawing:click', call)
      layer.remove()
    })

    it('should fire editable:drawing:clicked after adding vertex', function () {
      let called = 0
      let calledAfterClick = 0
      const call = () => {
        called++
        if (polygon._latlngs[0].length) calledAfterClick = 1
      }
      this.map.on('editable:drawing:clicked', call)
      const polygon = this.map.editTools.startPolygon()
      assert.equal(called, 0)
      happen.drawingClick(250, 200)
      assert.equal(called, 1)
      assert.ok(calledAfterClick)
      assert.ok(polygon._latlngs[0].length)
      this.map.off('editable:drawing:clicked', call)
      polygon.remove()
    })

    it('should fire editable:vertex:new ', function () {
      let newCount = 0
      const gotNew = (e) => {
        newCount++
      }
      this.map.on('editable:vertex:new', gotNew)
      const polygon = this.map.editTools.startPolygon()
      assert.equal(newCount, 0)
      happen.drawingClick(250, 200)
      happen.drawingClick(350, 300)
      assert.equal(newCount, 2)
      this.map.off('editable:vertex:new', gotNew)
      polygon.remove()
    })

    it('should fire editable:vertex:new on middle marker click', function (done) {
      let newCount = 0
      const gotNew = (e) => {
        newCount++
      }
      const polygon = this.map.editTools.startPolygon()
      happen.drawingClick(500, 500)
      happen.drawingClick(400, 400)
      assert.equal(newCount, 0)
      this.map.on('editable:vertex:new', gotNew)
      happen.drag(450, 450, 300, 400, () => {
        assert.equal(newCount, 1)
        map.off('editable:vertex:new', gotNew)
        polygon.remove()
        done()
      })
    })

    it('should not trigger editable:vertex:new when enabling edition', function () {
      let newCount = 0
      const gotNew = (e) => {
        newCount++
      }
      this.map.on('editable:vertex:new', gotNew)
      const layer = L.polygon([p2ll(100, 150), p2ll(150, 200)]).addTo(this.map)
      layer.enableEdit()
      assert.equal(newCount, 0)
      map.off('editable:vertex:new', gotNew)
      layer.remove()
    })

    it('should be possible to cancel editable:drawing:click actions', function () {
      let called = 0
      const call = (e) => {
        e.cancel()
        called++
      }
      this.map.on('editable:drawing:click', call)
      const polygon = this.map.editTools.startPolygon()
      assert.equal(called, 0)
      happen.drawingClick(250, 200)
      assert.equal(called, 1)
      assert.notOk(polygon._latlngs[0].length)
      this.map.off('editable:drawing:click', call)
      polygon.editor.disable()
    })

    it('should be possible to cancel editable:vertex:rawclick', function () {
      const layer = L.polygon([
        p2ll(100, 150),
        p2ll(150, 200),
        p2ll(200, 100),
        p2ll(100, 100),
      ]).addTo(this.map)
      let called = 0
      const call = (e) => {
        e.cancel()
        called++
      }
      assert.equal(layer._latlngs[0].length, 4)
      this.map.on('editable:vertex:rawclick', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.at('click', 100, 100)
      assert.equal(called, 1)
      assert.equal(layer._latlngs[0].length, 4)
      this.map.off('editable:vertex:rawclick', call)
      layer.remove()
    })

    it('should fire editable:drawing:mouseover after hovering over vertex', function () {
      const layer = L.polygon([
        p2ll(100, 150),
        p2ll(150, 200),
        p2ll(200, 100),
        p2ll(100, 100),
      ]).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:vertex:mouseover', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.at('mouseover', 100, 150)
      assert.ok(called)
      this.map.off('editable:vertex:mouseover', call)
      layer.remove()
    })

    it('should fire editable:drawing:mouseout after hovering out of a vertex', function () {
      const layer = L.polygon([
        p2ll(100, 150),
        p2ll(150, 200),
        p2ll(200, 100),
        p2ll(100, 100),
      ]).addTo(this.map)
      let called = 0
      const call = () => {
        called++
      }
      this.map.on('editable:vertex:mouseout', call)
      layer.enableEdit()
      assert.equal(called, 0)
      happen.at('mouseout', 100, 150)
      assert.ok(called)
      this.map.off('editable:vertex:mouseout', call)
      layer.remove()
    })
  })

  describe('Multi', () => {
    describe('#enableEdit', () => {
      it('should create vertex and middle markers for each ring', function () {
        const multi = L.polygon([
          [
            [
              [43.1239, 1.244],
              [43.123, 1.253],
              [43.1252, 1.255],
              [43.125, 1.251],
              [43.1239, 1.244],
            ],
            [
              [43.124, 1.246],
              [43.1236, 1.248],
              [43.12475, 1.25],
            ],
          ],
          [
            [
              [43.1269, 1.246],
              [43.126, 1.252],
              [43.1282, 1.255],
              [43.128, 1.245],
            ],
          ],
        ]).addTo(this.map)
        multi.enableEdit()
        assert.ok(multi._latlngs[0][0][0].__vertex)
        assert.ok(multi._latlngs[0][0][0].__vertex.middleMarker)
        assert.ok(multi._latlngs[0][0][1].__vertex)
        assert.ok(multi._latlngs[0][0][1].__vertex.middleMarker)
        assert.ok(multi._latlngs[0][1][0].__vertex)
        assert.ok(multi._latlngs[0][1][0].__vertex.middleMarker)
        assert.ok(multi._latlngs[1][0][0].__vertex)
        assert.ok(multi._latlngs[1][0][0].__vertex.middleMarker)
        multi.remove()
        this.map.editTools.editLayer.eachLayer((layer) => {
          assert.fail(layer, null, 'no layer expected but one found')
        })
      })
    })

    describe('#formatShape', () => {
      let layer

      before(function () {
        layer = L.polygon([]).addTo(this.map)
        layer.enableEdit()
      })

      after(() => {
        layer.remove()
      })

      it('should nest flat shape', () => {
        const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
        assert.deepEqual(layer.editor.formatShape(latlngs), [latlngs])
      })

      it('should nest empty shape', () => {
        assert.deepEqual(layer.editor.formatShape([]), [[]])
      })

      it('should not renest nested empty shape', () => {
        assert.deepEqual(layer.editor.formatShape([[]]), [[]])
      })

      it('should not renest nested shape', () => {
        const latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]]
        assert.deepEqual(layer.editor.formatShape(latlngs), latlngs)
      })
    })

    describe('#insertShape', () => {
      it('should add flat shape on multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.insertShape(shape, 1)
        assert.equal(layer._latlngs.length, 3)
        assert.deepEqual(shape, layer._latlngs[1][0])
        layer.remove()
      })

      it('should add nested shape on multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.insertShape(shape, 1)
        assert.equal(layer._latlngs.length, 3)
        assert.deepEqual(shape, layer._latlngs[1])
        layer.remove()
      })
    })

    describe('#appendShape', () => {
      it('should add flat shape on flat polygon', function () {
        const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
        const shape = [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.appendShape(shape)
        assert.equal(layer._latlngs.length, 2)
        assert.deepEqual(shape, layer._latlngs[1][0])
        layer.remove()
      })

      it('should add nested shape on flat polygon', function () {
        const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
        const shape = [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.appendShape(shape)
        assert.equal(layer._latlngs.length, 2)
        assert.deepEqual(shape, layer._latlngs[1])
        layer.remove()
      })

      it('should add flat shape on multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.appendShape(shape)
        assert.equal(layer._latlngs.length, 3)
        assert.deepEqual(shape, layer._latlngs[2][0])
        layer.remove()
      })

      it('should add nested shape on multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.appendShape(shape)
        assert.equal(layer._latlngs.length, 3)
        assert.deepEqual(shape, layer._latlngs[2])
        layer.remove()
      })
    })

    describe('#prependShape', () => {
      it('should add flat shape on flat polygon', function () {
        const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
        const shape = [p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.prependShape(shape)
        assert.equal(layer._latlngs.length, 2)
        assert.deepEqual(shape, layer._latlngs[0][0])
        layer.remove()
      })

      it('should add nested shape on flat polygon', function () {
        const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
        const shape = [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.prependShape(shape)
        assert.equal(layer._latlngs.length, 2)
        assert.deepEqual(shape, layer._latlngs[0])
        layer.remove()
      })

      it('should add flat shape on multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const shape = [p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.prependShape(shape)
        assert.equal(layer._latlngs.length, 3)
        assert.deepEqual(shape, layer._latlngs[0][0])
        layer.remove()
      })

      it('should add nested shape on multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const shape = [[p2ll(400, 450), p2ll(450, 500), p2ll(500, 400)]]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        layer.editor.prependShape(shape)
        assert.equal(layer._latlngs.length, 3)
        assert.deepEqual(shape, layer._latlngs[0])
        layer.remove()
      })
    })

    describe('#newShape', () => {
      it('should add a new outline on empty polygon', function () {
        const polygon = L.polygon([]).addTo(this.map)
        polygon.enableEdit()
        polygon.editor.newShape()
        happen.drawingClick(100, 150)
        assert.equal(polygon._latlngs[0].length, 1)
        happen.drawingClick(200, 350)
        assert.equal(polygon._latlngs[0].length, 2)
        happen.drawingClick(300, 250)
        assert.equal(polygon._latlngs[0].length, 3)
        happen.drawingClick(300, 250)
        polygon.remove()
      })

      it('should add a new outline to existing simple polygon', function () {
        const polygon = L.polygon([
          p2ll(100, 150),
          p2ll(150, 200),
          p2ll(200, 100),
        ]).addTo(this.map)
        polygon.enableEdit()
        polygon.editor.newShape()
        assert(L.Util.isArray(polygon._latlngs[0]))
        assert.ok(polygon._latlngs[0].length)
        assert.ok(L.Util.isArray(polygon._latlngs[0][0]))
        assert.ok(polygon._latlngs[0][0].length)
        assert.ok(L.Util.isArray(polygon._latlngs[1]))
        assert.ok(polygon._latlngs[1].length)
        assert.ok(L.Util.isArray(polygon._latlngs[1][0]))
        assert.notOk(polygon._latlngs[1][0].length)
        happen.drawingClick(300, 300)
        assert.equal(polygon._latlngs[1][0].length, 1)
        happen.drawingClick(350, 350)
        assert.equal(polygon._latlngs[1][0].length, 2)
        happen.drawingClick(400, 250)
        assert.equal(polygon._latlngs[1][0].length, 3)
        happen.drawingClick(400, 250)
        polygon.remove()
      })

      it('should emit editable:shape:new on newShape call', function () {
        let called = 0
        const call = () => {
          called++
        }
        this.map.on('editable:shape:new', call)
        const polygon = L.polygon([
          p2ll(100, 150),
          p2ll(150, 200),
          p2ll(200, 100),
        ]).addTo(this.map)
        assert.equal(called, 0)
        polygon.enableEdit()
        assert.equal(called, 0)
        polygon.editor.newShape()
        assert.equal(called, 1)
        polygon.remove()
        this.map.off('editable:shape:new', call)
      })
    })

    describe('#shapeAt', () => {
      it('should return latlngs in case of a flat polygon', function () {
        const latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]]
        const layer = L.polygon(latlngs).addTo(this.map)
        const shape = layer.shapeAt(p2ll(150, 150))
        assert.equal(shape.length, 1)
        assert.equal(shape[0].length, 3)
        assert.equal(shape[0][0], latlngs[0][0])
        layer.remove()
      })

      it('should return whole shape in case of a multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        const shape = layer.shapeAt(p2ll(150, 150))
        assert.equal(shape.length, 1)
        assert.equal(shape[0].length, 3)
        assert.equal(shape[0][0], latlngs[0][0][0])
        layer.remove()
      })

      it('should return whole shape in case of a multi polygon with hole', function () {
        const latlngs = [
          [
            [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
            [p2ll(120, 160), p2ll(150, 170), p2ll(180, 120)],
          ],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        const shape = layer.shapeAt(p2ll(140, 140))
        assert.equal(shape.length, 2)
        assert.equal(shape[0].length, 3)
        assert.equal(shape[0][0], latlngs[0][0][0])
        layer.remove()
      })
    })

    describe('#deleteShape', () => {
      it('should emit editable:shape:delete before deleting the shape on flat polygon', function () {
        const layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(
          this.map
        )
        let called = 0
        const call = (e) => {
          called++
          assert.equal(layer._latlngs[0].length, 3) // Not yet deleted
          assert.equal(e.shape.length, 3)
        }
        this.map.on('editable:shape:delete', call)
        layer.enableEdit()
        assert.equal(called, 0)
        layer.editor.deleteShape(layer._latlngs[0])
        assert.equal(layer._latlngs[0].length, 0)
        assert.equal(called, 1)
        this.map.off('editable:shape:delete', call)
        layer.remove()
      })

      it('should emit editable:shape:delete before deleting the shape on multi', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        let called = 0
        const call = (e) => {
          called++
          assert.equal(layer._latlngs.length, 2) // Not yet deleted
          assert.equal(e.shape.length, 1)
          assert.equal(e.shape[0].length, 3)
        }
        this.map.on('editable:shape:delete', call)
        layer.enableEdit()
        assert.equal(called, 0)
        layer.editor.deleteShape(layer._latlngs[0])
        assert.equal(called, 1)
        assert.equal(layer._latlngs.length, 1)
        assert.equal(layer._latlngs[0][0][0], latlngs[1][0][0])
        this.map.off('editable:shape:delete', call)
        layer.remove()
      })

      it('editable:shape:delete should be cancellable on flat polygon', function () {
        const layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(
          this.map
        )
        let called = 0
        const call = (e) => {
          called++
          e.cancel()
        }
        this.map.on('editable:shape:delete', call)
        layer.enableEdit()
        assert.equal(called, 0)
        layer.editor.deleteShape(layer._latlngs)
        assert.equal(called, 1)
        assert.equal(layer._latlngs[0].length, 3)
        this.map.off('editable:shape:delete', call)
        layer.remove()
      })

      it('editable:shape:delete should be cancellable on multi polygon', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        let called = 0
        const call = (e) => {
          called++
          e.cancel()
        }
        this.map.on('editable:shape:delete', call)
        layer.enableEdit()
        assert.equal(called, 0)
        layer.editor.deleteShape(layer._latlngs[0])
        assert.equal(called, 1)
        assert.equal(layer._latlngs.length, 2)
        assert.equal(layer._latlngs[0][0][0], latlngs[0][0][0])
        this.map.off('editable:shape:delete', call)
        layer.remove()
      })

      it('should emit editable:shape:deleted after deleting the shape on flat polygon', function () {
        const layer = L.polygon([p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]).addTo(
          this.map
        )
        let called = 0
        const call = (e) => {
          called++
          assert.equal(layer._latlngs[0].length, 0) // Already deleted
          assert.equal(e.shape.length, 3) // Deleted elements
        }
        this.map.on('editable:shape:deleted', call)
        layer.enableEdit()
        assert.equal(called, 0)
        layer.editor.deleteShape(layer._latlngs[0])
        assert.equal(called, 1)
        assert.equal(layer._latlngs[0].length, 0)
        this.map.off('editable:shape:deleted', call)
        layer.remove()
      })

      it('should emit editable:shape:deleted after deleting the shape on multi', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        let called = 0
        const call = (e) => {
          called++
          assert.equal(layer._latlngs.length, 1) // Already deleted
          assert.equal(e.shape.length, 1) // Deleted shape
          assert.equal(e.shape[0].length, 3)
        }
        this.map.on('editable:shape:deleted', call)
        layer.enableEdit()
        assert.equal(called, 0)
        layer.editor.deleteShape(layer._latlngs[0])
        assert.equal(called, 1)
        assert.equal(layer._latlngs.length, 1)
        assert.equal(layer._latlngs[0][0][0], latlngs[1][0][0])
        this.map.off('editable:shape:deleted', call)
        layer.remove()
      })

      it('should return the deleted shape on flat polygon', function () {
        const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShape(layer._latlngs[0])
        assert.equal(layer._latlngs[0].length, 0)
        assert.deepEqual(deleted, latlngs)
        layer.remove()
      })

      it('should return the deleted shape on multi', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShape(layer._latlngs[0])
        assert.equal(layer._latlngs.length, 1)
        assert.equal(layer._latlngs[0].length, 1)
        assert.deepEqual(deleted, latlngs[0])
        layer.remove()
      })

      it('should return the deleted shape on multi with hole', function () {
        const latlngs = [
          [
            [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
            [p2ll(120, 150), p2ll(150, 180), p2ll(180, 120)],
          ],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShape(layer._latlngs[0])
        assert.deepEqual(deleted, latlngs[0])
        layer.remove()
      })

      it('should return the deleted shape on multi with hole 2', function () {
        const latlngs = [
          [
            [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)],
            [p2ll(120, 150), p2ll(150, 180), p2ll(180, 120)],
          ],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShape(layer._latlngs[1])
        assert.deepEqual(deleted, latlngs[1])
        layer.remove()
      })
    })

    describe('#deleteShapeAt', () => {
      it('should delete the shape on flat polygon', function () {
        const latlngs = [p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShapeAt(p2ll(150, 150))
        assert.equal(layer._latlngs[0].length, 0)
        assert.deepEqual([latlngs], deleted)
        layer.remove()
      })

      it('should delete the shape on multi', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShapeAt(p2ll(150, 150))
        assert.equal(layer._latlngs.length, 1)
        assert.equal(layer._latlngs[0][0][0], latlngs[1][0][0])
        assert.deepEqual(latlngs[0], deleted)
        layer.remove()
      })

      it('should delete the shape two on multi', function () {
        const latlngs = [
          [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]],
          [[p2ll(300, 350), p2ll(350, 400), p2ll(400, 300)]],
        ]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShapeAt(p2ll(350, 350))
        assert.equal(layer._latlngs.length, 1)
        assert.equal(layer._latlngs[0][0][0], latlngs[0][0][0])
        assert.deepEqual(latlngs[1], deleted)
        layer.remove()
      })

      it('should delete the shape on multi with nested simple polygon', function () {
        const latlngs = [[p2ll(100, 150), p2ll(150, 200), p2ll(200, 100)]]
        const layer = L.polygon(latlngs).addTo(this.map)
        layer.enableEdit()
        const deleted = layer.editor.deleteShapeAt(p2ll(150, 150))
        assert.equal(layer._latlngs[0].length, 0)
        assert.deepEqual(latlngs, deleted)
        layer.remove()
      })
    })
  })
})
