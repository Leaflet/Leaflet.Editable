describe('L.Editable', () => {
  before(function () {
    this.map = map
  })

  afterEach(function () {
    this.map.editTools.editLayer.eachLayer((layer) => {
      assert.fail(layer, null, 'no layer expected but one found')
    })
  })

  describe('#init', () => {
    it('should be initialized', function () {
      assert.ok(this.map.editTools)
    })
  })

  describe('#drawing on top of other elements', () => {
    xit('should be possible to create latlng on top of previously created vertex', function () {
      const line1 = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      happen.drawingClick(500, 500)
      assert.equal(line1._latlngs.length, 2)
      const line2 = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      assert.equal(line2._latlngs.length, 1)
      assert.equal(line1._latlngs.length, 2)
      happen.drawingClick(500, 500)
      happen.drawingClick(500, 500)
      assert.equal(line2._latlngs.length, 2)
      assert.equal(line1._latlngs.length, 2)
      line1.remove()
      line2.remove()
    })

    it('should be possible to delete other vertex of currently drawn path', function () {
      const line = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      happen.drawingClick(500, 550)
      assert.equal(line._latlngs.length, 3)
      happen.at('click', 500, 500)
      assert.equal(line._latlngs.length, 2)
      happen.drawingClick(500, 550)
      assert.equal(line._latlngs.length, 2)
      this.map.removeLayer(line)
    })
  })
  describe('#commitDrawing', () => {
    it('should commit drawing if drawing is active', function () {
      const layer = this.map.editTools.startPolyline()
      happen.drawingClick(450, 450)
      happen.drawingClick(500, 500)
      assert.equal(layer._latlngs.length, 2)
      this.map.editTools.commitDrawing()
      assert.equal(layer._latlngs.length, 2)
      happen.drawingClick(550, 550)
      assert.equal(layer._latlngs.length, 2)
      layer.remove()
    })

    it('should fail silently if no drawing is active', function () {
      try {
        this.map.editTools.commitDrawing()
      } catch (e) {
        fail('commitDrawing has raised')
      }
    })
  })

  describe('#map options', () => {
    it('should possible to override editTools class with editToolsClass', () => {
      const CustomEditable = L.Editable.extend({
        options: {
          checkme: true,
        },
      })
      const container = document.createElement('DIV')
      document.body.appendChild(container)
      const someMap = L.map(container, {
        editable: true,
        editToolsClass: CustomEditable,
      })
      someMap.setView([0, 0], 0)
      assert.ok(someMap.editTools)
      assert.ok(someMap.editTools.options.checkme)
      assert.ok(someMap.editTools instanceof CustomEditable)
    })
  })

  describe('#drawing', () => {
    it('should return false if nothing happen', function () {
      assert.notOk(this.map.editTools.drawing())
    })

    it('should return false if an editor is active but not drawing', function () {
      const layer = L.polyline([]).addTo(this.map)
      layer.enableEdit()
      assert.notOk(this.map.editTools.drawing())
      layer.remove()
    })

    it('should return true if an editor is active and drawing forward', function () {
      const layer = this.map.editTools.startPolyline()
      assert.ok(this.map.editTools.drawing())
      layer.editor.disable()
    })

    it('should return true if an editor is active and drawing backward', function () {
      const layer = L.polyline([
        [1, 2],
        [3, 4],
      ]).addTo(this.map)
      layer.enableEdit()
      layer.editor.continueBackward()
      assert.ok(this.map.editTools.drawing())
      layer.remove()
    })
  })
})
