import {Browser, Circle, Class, CircleMarker, DivIcon, DomEvent,
  DomUtil, Evented, Handler, LatLng, LatLngBounds, 
  LayerGroup, LineUtil, Map, Marker, 
  Point, Polygon, Polyline, Rectangle, Util, Draggable } from 'leaflet';


// 🍂miniclass CancelableEvent (Event objects)
// 🍂method cancel()
// Cancel any subsequent action.

// 🍂miniclass VertexEvent (Event objects)
// 🍂property vertex: VertexMarker
// The vertex that fires the event.

// 🍂miniclass ShapeEvent (Event objects)
// 🍂property shape: Array
// The shape (LatLng array) subject of the action.

// 🍂miniclass CancelableVertexEvent (Event objects)
// 🍂inherits VertexEvent
// 🍂inherits CancelableEvent

// 🍂miniclass CancelableShapeEvent (Event objects)
// 🍂inherits ShapeEvent
// 🍂inherits CancelableEvent

// 🍂miniclass LayerEvent (Event objects)
// 🍂property layer: object
// The Layer (Marker, Polyline…) subject of the action.

// 🍂namespace Editable; 🍂class Editable; 🍂aka Editable
// Main edition handler. By default, it is attached to the map
// as `map.editTools` property.
// Leaflet.Editable is made to be fully extendable. You have three ways to customize
// the behaviour: using options, listening to events, or extending.
export class Editable extends Evented {
  statics = {
    FORWARD: 1,
    BACKWARD: -1,
  }

  setupDefaults() {
    // You can pass them when creating a map using the `editOptions` key.
    // 🍂option zIndex: int = 1000
    // The default zIndex of the editing tools.
    this.options.zIndex ??= 1000

    // 🍂option polygonClass: class = Polygon
    // Class to be used when creating a new Polygon.
    this.options.polygonClass ??= Polygon

    // 🍂option polylineClass: class = Polyline
    // Class to be used when creating a new Polyline.
    this.options.polylineClass ??= Polyline

    // 🍂option markerClass: class = Marker
    // Class to be used when creating a new Marker.
    this.options.markerClass ??= Marker

    // 🍂option circleMarkerClass: class = CircleMarker
    // Class to be used when creating a new CircleMarker.
    this.options.circleMarkerClass ??= CircleMarker

    // 🍂option rectangleClass: class = Rectangle
    // Class to be used when creating a new Rectangle.
    this.options.rectangleClass ??= Rectangle

    // 🍂option circleClass: class = Circle
    // Class to be used when creating a new Circle.
    this.options.circleClass ??= Circle

    // 🍂option drawingCSSClass: string = 'leaflet-editable-drawing'
    // CSS class to be added to the map container while drawing.
    this.options.drawingCSSClass ??= 'leaflet-editable-drawing'

    // 🍂option drawingCursor: const = 'crosshair'
    // Cursor mode set to the map while drawing.
    this.options.drawingCursor ??= 'crosshair'

    // 🍂option editLayer: Layer = new LayerGroup()
    // Layer used to store edit tools (vertex, line guide…).
    this.options.editLayer ??= new LayerGroup().addTo(this.map)

    // 🍂option featuresLayer: Layer = new LayerGroup()
    // Default layer used to store drawn features (Marker, Polyline…).
    this.options.featuresLayer ??= new LayerGroup().addTo(this.map)

    // 🍂option polylineEditorClass: class = PolylineEditor
    // Class to be used as Polyline editor.
    this.options.polylineEditorClass ??= PolylineEditor

    // 🍂option polygonEditorClass: class = PolygonEditor
    // Class to be used as Polygon editor.
    this.options.polygonEditorClass ??= PolygonEditor

    // 🍂option markerEditorClass: class = MarkerEditor
    // Class to be used as Marker editor.
    this.options.markerEditorClass ??= MarkerEditor

    // 🍂option circleMarkerEditorClass: class = CircleMarkerEditor
    // Class to be used as CircleMarker editor.
    this.options.circleMarkerEditorClass ??= CircleMarkerEditor

    // 🍂option rectangleEditorClass: class = RectangleEditor
    // Class to be used as Rectangle editor.
    this.options.rectangleEditorClass ??= RectangleEditor

    // 🍂option circleEditorClass: class = CircleEditor
    // Class to be used as Circle editor.
    this.options.circleEditorClass ??= CircleEditor

    // 🍂option lineGuideOptions: hash = {}
    // Options to be passed to the line guides.
    this.options.lineGuideOptions ??= {}

    // 🍂option skipMiddleMarkers: boolean = false
    // Set this to true if you don't want middle markers.
    this.options.skipMiddleMarkers = false
  }

  constructor(map, options) {
    super()
    this.options = options
    this.map = map
    this.setupDefaults()
    // Util.setOptions(this, this.options)
    this._lastZIndex = this.options.zIndex
    this.editLayer = this.options.editLayer
    this.featuresLayer = this.options.featuresLayer
    this.forwardLineGuide = this.createLineGuide()
    this.backwardLineGuide = this.createLineGuide()
  }

  fireAndForward(type, e) {
    e = e || {}
    e.editTools = this
    this.fire(type, e)
    this.map.fire(type, e)
  }

  createLineGuide() {
    const options = Class.mergeOptions(
      { dashArray: '5,10', weight: 1, interactive: false },
      this.options.lineGuideOptions
    )
    return new Polyline([], options)
  }

  moveForwardLineGuide(latlng) {
    if (this.forwardLineGuide._latlngs.length) {
      this.forwardLineGuide._latlngs[1] = latlng
      this.forwardLineGuide._bounds.extend(latlng)
      this.forwardLineGuide.redraw()
    }
  }

  moveBackwardLineGuide(latlng) {
    if (this.backwardLineGuide._latlngs.length) {
      this.backwardLineGuide._latlngs[1] = latlng
      this.backwardLineGuide._bounds.extend(latlng)
      this.backwardLineGuide.redraw()
    }
  }

  anchorForwardLineGuide(latlng) {
    this.forwardLineGuide._latlngs[0] = latlng
    this.forwardLineGuide._bounds.extend(latlng)
    this.forwardLineGuide.redraw()
  }

  anchorBackwardLineGuide(latlng) {
    this.backwardLineGuide._latlngs[0] = latlng
    this.backwardLineGuide._bounds.extend(latlng)
    this.backwardLineGuide.redraw()
  }

  attachForwardLineGuide() {
    this.editLayer.addLayer(this.forwardLineGuide)
  }

  attachBackwardLineGuide() {
    this.editLayer.addLayer(this.backwardLineGuide)
  }

  detachForwardLineGuide() {
    this.forwardLineGuide.setLatLngs([])
    this.editLayer.removeLayer(this.forwardLineGuide)
  }

  detachBackwardLineGuide() {
    this.backwardLineGuide.setLatLngs([])
    this.editLayer.removeLayer(this.backwardLineGuide)
  }

  blockEvents() {
    // Hack: force map not to listen to other layers events while drawing.
    if (!this._oldTargets) {
      this._oldTargets = this.map._targets
      this.map._targets = {}
    }
  }

  unblockEvents() {
    if (this._oldTargets) {
      // Reset, but keep targets created while drawing.
      this.map._targets = Util.extend(this.map._targets, this._oldTargets)
      delete this._oldTargets
    }
  }

  registerForDrawing(editor) {
    if (this._drawingEditor) this.unregisterForDrawing(this._drawingEditor)
    this.blockEvents()
    editor.reset() // Make sure editor tools still receive events.
    this._drawingEditor = editor
    this.map.on('mousemove touchmove', editor.onDrawingMouseMove, editor)
    this.map.on('mousedown', this.onMousedown, this)
    this.map.on('mouseup', this.onMouseup, this)
    DomUtil.addClass(this.map._container, this.options.drawingCSSClass)
    this.defaultMapCursor = this.map._container.style.cursor
    this.map._container.style.cursor = this.options.drawingCursor
  }

  unregisterForDrawing(editor) {
    this.unblockEvents()
    DomUtil.removeClass(this.map._container, this.options.drawingCSSClass)
    this.map._container.style.cursor = this.defaultMapCursor
    editor = editor || this._drawingEditor
    if (!editor) return
    this.map.off('mousemove touchmove', editor.onDrawingMouseMove, editor)
    this.map.off('mousedown', this.onMousedown, this)
    this.map.off('mouseup', this.onMouseup, this)
    if (editor !== this._drawingEditor) return
    delete this._drawingEditor
    if (editor._drawing) editor.cancelDrawing()
  }

  onMousedown(e) {
    if (e.originalEvent.which != 1) return
    this._mouseDown = e
    this._drawingEditor.onDrawingMouseDown(e)
  }

  onMouseup(e) {
    if (this._mouseDown) {
      const editor = this._drawingEditor
      const mouseDown = this._mouseDown
      this._mouseDown = null
      editor.onDrawingMouseUp(e)
      if (this._drawingEditor !== editor) return // onDrawingMouseUp may call unregisterFromDrawing.
      const origin = new Point(
        mouseDown.originalEvent.clientX,
        mouseDown.originalEvent.clientY
      )
      const distance = new Point(
        e.originalEvent.clientX,
        e.originalEvent.clientY
      ).distanceTo(origin)
      if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1))
        this._drawingEditor.onDrawingClick(e)
    }
  }

  // 🍂section Public methods
  // You will generally access them by the `map.editTools`
  // instance:
  //
  // `map.editTools.startPolyline();`

  // 🍂method drawing(): booleanf
  // Return true if any drawing action is ongoing.
  drawing() {
    return this._drawingEditor?.drawing()
  }

  // 🍂method stopDrawing()
  // When you need to stop any ongoing drawing, without needing to know which editor is active.
  stopDrawing() {
    this.unregisterForDrawing()
  }

  // 🍂method commitDrawing()
  // When you need to commit any ongoing drawing, without needing to know which editor is active.
  commitDrawing(e) {
    if (!this._drawingEditor) return
    this._drawingEditor.commitDrawing(e)
  }

  connectCreatedToMap(layer) {
    return this.featuresLayer.addLayer(layer)
  }

  // 🍂method startPolyline(latlng: LatLng, options: hash): Polyline
  // Start drawing a Polyline. If `latlng` is given, a first point will be added. In any case, continuing on user click.
  // If `options` is given, it will be passed to the Polyline class constructor.
  startPolyline(latlng, options) {
    const line = this.createPolyline([], options)
    line.enableEdit(this.map).newShape(latlng)
    return line
  }

  // 🍂method startPolygon(latlng: LatLng, options: hash): Polygon
  // Start drawing a Polygon. If `latlng` is given, a first point will be added. In any case, continuing on user click.
  // If `options` is given, it will be passed to the Polygon class constructor.
  startPolygon(latlng, options) {
    const polygon = this.createPolygon([], options)
    polygon.enableEdit(this.map).newShape(latlng)
    return polygon
  }

  // 🍂method startMarker(latlng: LatLng, options: hash): Marker
  // Start adding a Marker. If `latlng` is given, the Marker will be shown first at this point.
  // In any case, it will follow the user mouse, and will have a final `latlng` on next click (or touch).
  // If `options` is given, it will be passed to the Marker class constructor.
  startMarker(latlng, options) {
    latlng = latlng || this.map.getCenter().clone()
    const marker = this.createMarker(latlng, options)
    marker.enableEdit(this.map).startDrawing()
    return marker
  }

  // 🍂method startCircleMarker(latlng: LatLng, options: hash): CircleMarker
  // Start adding a CircleMarker. If `latlng` is given, the CircleMarker will be shown first at this point.
  // In any case, it will follow the user mouse, and will have a final `latlng` on next click (or touch).
  // If `options` is given, it will be passed to the CircleMarker class constructor.
  startCircleMarker(latlng, options) {
    latlng = latlng || this.map.getCenter().clone()
    const marker = this.createCircleMarker(latlng, options)
    marker.enableEdit(this.map).startDrawing()
    return marker
  }

  // 🍂method startRectangle(latlng: LatLng, options: hash): Rectangle
  // Start drawing a Rectangle. If `latlng` is given, the Rectangle anchor will be added. In any case, continuing on user drag.
  // If `options` is given, it will be passed to the Rectangle class constructor.
  startRectangle(latlng, options) {
    const corner = latlng || new LatLng([0, 0])
    const bounds = new LatLngBounds(corner, corner)
    const rectangle = this.createRectangle(bounds, options)
    rectangle.enableEdit(this.map).startDrawing()
    return rectangle
  }

  // 🍂method startCircle(latlng: LatLng, options: hash): Circle
  // Start drawing a Circle. If `latlng` is given, the Circle anchor will be added. In any case, continuing on user drag.
  // If `options` is given, it will be passed to the Circle class constructor.
  startCircle(latlng, options) {
    latlng = latlng || this.map.getCenter().clone()
    const circle = this.createCircle(latlng, options)
    circle.enableEdit(this.map).startDrawing()
    return circle
  }

  startHole(editor, latlng) {
    editor.newHole(latlng)
  }

  createLayer(klass, latlngs, options) {
    options = Util.extend({ editOptions: { editTools: this } }, options)
    const layer = new klass(latlngs, options)
    // 🍂namespace Editable
    // 🍂event editable:created: LayerEvent
    // Fired when a new feature (Marker, Polyline…) is created.
    this.fireAndForward('editable:created', { layer: layer })
    return layer
  }

  createPolyline(latlngs, options) {
    return this.createLayer(
      options?.polylineClass || this.options.polylineClass,
      latlngs,
      options
    )
  }

  createPolygon(latlngs, options) {
    return this.createLayer(
      options?.polygonClass || this.options.polygonClass,
      latlngs,
      options
    )
  }

  createMarker(latlng, options) {
    return this.createLayer(
      options?.markerClass || this.options.markerClass,
      latlng,
      options
    )
  }

  createCircleMarker(latlng, options) {
    return this.createLayer(
      options?.circleMarkerClass || this.options.circleMarkerClass,
      latlng,
      options
    )
  }

  createRectangle(bounds, options) {
    return this.createLayer(
      options?.rectangleClass || this.options.rectangleClass,
      bounds,
      options
    )
  }

  createCircle(latlng, options) {
    return this.createLayer(
      options?.circleClass || this.options.circleClass,
      latlng,
      options
    )
  }

  makeCancellable(e) {
    e.cancel = () => {
      e._cancelled = true
    }
  }
}
 
// 🍂namespace Map; 🍂class Map
// Leaflet.Editable add options and events to the `Map` object.
// See `Editable` events for the list of events fired on the Map.
// 🍂example
//
// ```js
// var map = new Map('map', {
//  editable: true,
//  editOptions: {
//    …
// }
// });
// ```
// 🍂section Editable Map Options
Map.mergeOptions({
  // 🍂namespace Map
  // 🍂section Map Options
  // 🍂option editToolsClass: class = Editable
  // Class to be used as vertex, for path editing.
  editToolsClass: Editable,

  // 🍂option editable: boolean = false
  // Whether to create a Editable instance at map init.
  editable: false,

  // 🍂option editOptions: hash = {}
  // Options to pass to Editable when instantiating.
  editOptions: {},
})

Map.addInitHook(function () {
  this.whenReady(function () {
    if (this.options.editable) {
      this.editTools = new Editable(this, this.options.editOptions)
    }
  })
})

export class VertexIcon extends DivIcon {
  options = {
    iconSize: new Point(8, 8),
    draggable: true,
  }
  constructor(options) {
    options.iconSize = new Point(8, 8)
    options.draggable = true
    options.html = ''
    super(options)
  }
}

export class TouchVertexIcon extends VertexIcon {
  options = {
    iconSize: new Point(20, 20),
    draggable: true,
  }
  constructor(options) {
    options.iconSize = new Point(20, 20)
    options.draggable = true
    options.html = ''
    super(options)
  }
}

// 🍂namespace Editable; 🍂class VertexMarker; Handler for dragging path vertices.
export class VertexMarker extends Marker {
  // 🍂section Public methods
  // The marker used to handle path vertex. You will usually interact with a `VertexMarker`  // instance when listening for events like `editable:vertex:ctrlclick`.

  constructor(latlng, latlngs, editor, options) {
    // We don't use this._latlng, because on drag Leaflet replace it while
    // we want to keep reference.
    super(latlng, options)
    this.latlng = latlng
    this.latlngs = latlngs
    this.editor = editor
  
    this.options.draggable = true
    this.options.className = 'leaflet-div-icon leaflet-vertex-icon'

    this.options.icon = this.createVertexIcon(this.options)
    
    this.options.icon.options.html ??= ''
    this.options.icon.options.className = this.options.className
    this.latlng.__vertex = this
    this.connect()
    this.setZIndexOffset(editor.tools._lastZIndex + 1)
  }
 
  connect() {
    this.editor.editLayer.addLayer(this)
  }

  _animateZoom(opt) {
    if (this._map) {
      super._animateZoom(opt)
    }
  }

  onAdd(map) {
    super.onAdd(map)
    this.on('drag', this.onDrag)
    this.on('dragstart', this.onDragStart)
    this.on('dragend', this.onDragEnd)
    this.on('mouseup', this.onMouseup)
    this.on('click', this.onClick)
    this.on('contextmenu', this.onContextMenu)
    this.on('mousedown touchstart', this.onMouseDown)
    this.on('mouseover', this.onMouseOver)
    this.on('mouseout', this.onMouseOut)
    this.addMiddleMarkers()
  }

  onRemove(map) {
    if (this.middleMarker) this.middleMarker.delete()
    delete this.latlng.__vertex
    this.off('drag', this.onDrag)
    this.off('dragstart', this.onDragStart)
    this.off('dragend', this.onDragEnd)
    this.off('mouseup', this.onMouseup)
    this.off('click', this.onClick)
    this.off('contextmenu', this.onContextMenu)
    this.off('mousedown touchstart', this.onMouseDown)
    this.off('mouseover', this.onMouseOver)
    this.off('mouseout', this.onMouseOut)
    super.onRemove(map)
  }

  onDrag(e) {
    e.vertex = this
    this.editor.onVertexMarkerDrag(e)
    const iconPos = DomUtil.getPosition(this._icon)
    const latlng = this._map.layerPointToLatLng(iconPos)
    this.latlng.update(latlng)
    this._latlng = this.latlng // Push back to Leaflet our reference.
    this.editor.refresh()
    if (this.middleMarker) this.middleMarker.updateLatLng()
    const next = this.getNext()
    if (next?.middleMarker) next.middleMarker.updateLatLng()
  }

  onDragStart(e) {
    e.vertex = this
    this.editor.onVertexMarkerDragStart(e)
  }

  onDragEnd(e) {
    e.vertex = this
    this.editor.onVertexMarkerDragEnd(e)
  }

  onClick(e) {
    e.vertex = this
    this.editor.onVertexMarkerClick(e)
  }

  onMouseup(e) {
    DomEvent.stop(e)
    e.vertex = this
    this.editor.map.fire('mouseup', e)
  }

  onContextMenu(e) {
    e.vertex = this
    this.editor.onVertexMarkerContextMenu(e)
  }

  onMouseDown(e) {
    e.vertex = this
    this.editor.onVertexMarkerMouseDown(e)
  }

  onMouseOver(e) {
    e.vertex = this
    this.editor.onVertexMarkerMouseOver(e)
  }

  onMouseOut(e) {
    e.vertex = this
    this.editor.onVertexMarkerMouseOut(e)
  }

  // 🍂method delete()
  // Delete a vertex and the related LatLng.
  delete() {
    const next = this.getNext() // Compute before changing latlng
    this.latlngs.splice(this.getIndex(), 1)
    this.editor.editLayer.removeLayer(this)
    this.editor.onVertexDeleted({ latlng: this.latlng, vertex: this })
    if (!this.latlngs.length) this.editor.deleteShape(this.latlngs)
    if (next) next.resetMiddleMarker()
    this.editor.refresh()
  }

  // 🍂method getIndex(): int
  // Get the index of the current vertex among others of the same LatLngs group.
  getIndex() {
    const latlng = this.latlngs.find(ll => 
      ll.lat === this.latlng.lat &&
      ll.lng === this.latlng.lng 
    )
    return this.latlngs.indexOf(latlng)
  }

  // 🍂method getLastIndex(): int
  // Get last vertex index of the LatLngs group of the current vertex.
  getLastIndex() {
    return this.latlngs.length - 1
  }

  // 🍂method getPrevious(): VertexMarker
  // Get the previous VertexMarker in the same LatLngs group.
  getPrevious() {
    if (this.latlngs.length < 2) return
    const index = this.getIndex()
    let previousIndex = index - 1
    if (index === 0 && this.editor.CLOSED) previousIndex = this.getLastIndex()
    const previous = this.latlngs[previousIndex]
    if (previous) return previous.__vertex
  }

  // 🍂method getNext(): VertexMarker
  // Get the next VertexMarker in the same LatLngs group.
  getNext() {
    if (this.latlngs.length < 2) return
    const index = this.getIndex()
    let nextIndex = index + 1
    if (index === this.getLastIndex() && this.editor.CLOSED) nextIndex = 0
    const next = this.latlngs[nextIndex]
    if (next) return next.__vertex
  }

  addMiddleMarker(previous) {
    if (!this.editor.hasMiddleMarkers()) return
    previous = previous || this.getPrevious()
    if (previous && !this.middleMarker)
      this.middleMarker = this.editor.addMiddleMarker(
        previous,
        this,
        this.latlngs,
        this.editor
      )
  }

  addMiddleMarkers() {
    if (!this.editor.hasMiddleMarkers()) return
    const previous = this.getPrevious()
    if (previous) this.addMiddleMarker(previous)
    const next = this.getNext()
    if (next) next.resetMiddleMarker()
  }

  resetMiddleMarker() {
    if (this.middleMarker) this.middleMarker.delete()
    this.addMiddleMarker()
  }

  // 🍂method split()
  // Split the vertex LatLngs group at its index, if possible.
  split() {
    if (!this.editor.splitShape) return // Only for PolylineEditor
    this.editor.splitShape(this.latlngs, this.getIndex())
  }

  // 🍂method continue()
  // Continue the vertex LatLngs from this vertex. Only active for first and last vertices of a Polyline.
  continue() {
    if (!this.editor.continueBackward) return // Only for PolylineEditor
    const index = this.getIndex()
    if (index === 0) this.editor.continueBackward(this.latlngs)
    else if (index === this.getLastIndex()) this.editor.continueForward(this.latlngs)
  }

  createVertexIcon(options) {
    return Browser.mobile && Browser.touch
      ? new TouchVertexIcon(options)
      : new VertexIcon(options)
  }
}

Editable.mergeOptions({
  // 🍂namespace Editable
  // 🍂option vertexMarkerClass: class = VertexMarker
  // Class to be used as vertex, for path editing.
  vertexMarkerClass: VertexMarker,
})

export class MiddleMarker extends Marker {
  constructor(left, right, latlngs, editor, options) {
    super(MiddleMarker.computeLatLng(editor, left, right), options)
    this.left = left
    this.right = right
    this.editor = editor
    this.latlngs = latlngs

    this.options.opacity = 0.5
    this._opacity = this.options.opacity
    this.options.draggable = true
    this.options.className = 'leaflet-div-icon leaflet-middle-icon'
    
    this.options.icon = this.createVertexIcon(this.options)

    this.options.icon.options.html ??= ''
    this.options.icon.options.className = this.options.className
    this.editor.editLayer.addLayer(this)
    this.setVisibility()
  }

  _animateZoom(opt) {
    if (this._map) {
      super._animateZoom(opt)
    }
  }

  createVertexIcon(options) {
    return Browser.mobile && Browser.touch
      ? new TouchVertexIcon(options)
      : new VertexIcon(options)
  }

  setVisibility() {
    this._map ??= this.editor.map
    const leftPoint = this._map.latLngToContainerPoint(this.left.latlng)
    const rightPoint = this._map.latLngToContainerPoint(this.right.latlng)
    const size = new Point(this.options.icon.options.iconSize)
    if (leftPoint.distanceTo(rightPoint) < size.x * 3) this.hide()
    else this.show()
  }

  show() {
    this.setOpacity(this._opacity)
  }

  hide() {
    this.setOpacity(0)
  }

  updateLatLng() {
    this.setLatLng(MiddleMarker.computeLatLng(this.editor, this.left, this.right))
    this.setVisibility()
  }

  static computeLatLng(editor, left, right) {
    const leftPoint = editor.map.latLngToContainerPoint(left.latlng)
    const rightPoint = editor.map.latLngToContainerPoint(right.latlng)
    const y = (leftPoint.y + rightPoint.y) / 2
    const x = (leftPoint.x + rightPoint.x) / 2
    return editor.map.containerPointToLatLng([x, y])
  }

  onAdd(map) {
    super.onAdd(map)
    DomEvent.on(this._icon, 'mousedown touchstart', this.onMouseDown, this)
    map.on('zoomend', this.setVisibility, this)
  }

  onRemove(map) {
    delete this.right.middleMarker
    DomEvent.off(this._icon, 'mousedown touchstart', this.onMouseDown, this)
    map.off('zoomend', this.setVisibility, this)
    super.onRemove(map)
  }

  onMouseDown(e) {
    const iconPos = DomUtil.getPosition(this._icon)
    const latlng = this.editor.map.layerPointToLatLng(iconPos)
    e = {
      originalEvent: e,
      latlng: latlng,
    }
    if (this.options.opacity === 0) return
    this.editor.tools.makeCancellable(e)
    this.editor.onMiddleMarkerMouseDown(e)
    if (e._cancelled) return
    this.latlngs.splice(this.index(), 0, e.latlng)
    this.editor.refresh()
    const icon = this._icon
    const marker = this.editor.addVertexMarker(e.latlng, this.latlngs)
    this.editor.onNewVertex(marker)
    /* Hack to workaround browser not firing touchend when element is no more on DOM */
    const parent = marker._icon.parentNode
    parent.removeChild(marker._icon)
    marker._icon = icon
    parent.appendChild(marker._icon)
    marker._initIcon()
    marker._initInteraction()
    marker.setOpacity(1)
    /* End hack */
    // Transfer ongoing dragging to real marker
    Draggable._dragging = false
    marker.dragging._draggable._onDown(e.originalEvent)
    this.delete()
  }

  delete() {
    this.editor.editLayer.removeLayer(this)
  }

  index() {
    const latlng = this.latlngs.find(ll => 
      ll.lat === this.right.latlng.lat &&
      ll.lng === this.right.latlng.lng 
    )
    return this.latlngs.indexOf(latlng)
  }
}

Editable.mergeOptions({
  // 🍂namespace Editable
  // 🍂option middleMarkerClass: class = VertexMarker
  // Class to be used as middle vertex, pulled by the user to create a new point in the middle of a path.
  middleMarkerClass: MiddleMarker,
})

// 🍂namespace Editable; 🍂class BaseEditor; 🍂aka Editable.BaseEditor
// When editing a feature (Marker, Polyline…), an editor is attached to it. This
// editor basically knows how to handle the edition.
// 🍂option draggable: boolean = false
// Disable dragging of the feature while in edit mode
export class BaseEditor extends Handler {
  constructor(map, feature, options) {
    super(map)
    this.options = options
    this.map = map
    this.feature = feature
    this.feature.editor = this
    this.editLayer = new LayerGroup()
    this.tools = this.options?.editTools || map.editTools
  }

  // 🍂method enable(): this
  // Set up the drawing tools for the feature to be editable.
  addHooks() {
    if (this.isConnected()) this.onFeatureAdd()
    else this.feature.once('add', this.onFeatureAdd, this)
    this.onEnable()
    this.feature.on(this._getEvents(), this)
  }

  // 🍂method disable(): this
  // Remove the drawing tools for the feature.
  removeHooks() {
    this.feature.off(this._getEvents(), this)
    if (this.feature.dragging) this.feature.dragging.disable()
    this.editLayer.clearLayers()
    this.tools.options.editLayer.removeLayer(this.editLayer)
    this.onDisable()
    if (this._drawing) this.cancelDrawing()
  }

  // 🍂method drawing(): boolean
  // Return true if any drawing action is ongoing with this editor.
  drawing() {
    return !!this._drawing
  }

  reset() {}

  onFeatureAdd() {
    this.tools.options.editLayer.addLayer(this.editLayer)
    if (this.feature.dragging && this.options.draggable != false) this.feature.dragging.enable()
  }

  hasMiddleMarkers() {
    return !this.options?.skipMiddleMarkers && !this.tools.options.skipMiddleMarkers
  }

  fireAndForward(type, e) {
    e = e || {}
    e.layer = this.feature
    this.feature.fire(type, e)
    this.tools.fireAndForward(type, e)
  }

  onEnable() {
    // 🍂namespace Editable
    // 🍂event editable:enable: Event
    // Fired when an existing feature is ready to be edited.
    this.fireAndForward('editable:enable')
  }

  onDisable() {
    // 🍂namespace Editable
    // 🍂event editable:disable: Event
    // Fired when an existing feature is not ready anymore to be edited.
    this.fireAndForward('editable:disable')
  }

  onEditing() {
    // 🍂namespace Editable
    // 🍂event editable:editing: Event
    // Fired as soon as any change is made to the feature geometry.
    this.fireAndForward('editable:editing')
  }

  onEdited() {
    // 🍂namespace Editable
    // 🍂event editable:edited: Event
    // Fired after any change is made to the feature geometry.
    this.fireAndForward('editable:edited')
  }

  onStartDrawing() {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:start: Event
    // Fired when a feature is to be drawn.
    this.fireAndForward('editable:drawing:start')
  }

  onEndDrawing() {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:end: Event
    // Fired when a feature is not drawn anymore.
    this.fireAndForward('editable:drawing:end')
  }

  onCancelDrawing() {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:cancel: Event
    // Fired when user cancel drawing while a feature is being drawn.
    this.fireAndForward('editable:drawing:cancel')
  }

  onCommitDrawing(e) {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:commit: Event
    // Fired when user finish drawing a feature.
    this.fireAndForward('editable:drawing:commit', e)
    this.onEdited()
  }

  onDrawingMouseDown(e) {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:mousedown: Event
    // Fired when user `mousedown` while drawing.
    this.fireAndForward('editable:drawing:mousedown', e)
  }

  onDrawingMouseUp(e) {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:mouseup: Event
    // Fired when user `mouseup` while drawing.
    this.fireAndForward('editable:drawing:mouseup', e)
  }

  startDrawing() {
    if (!this._drawing) this._drawing = 1
    this.tools.registerForDrawing(this)
    this.onStartDrawing()
  }

  commitDrawing(e) {
    this.onCommitDrawing(e)
    this.endDrawing()
  }

  cancelDrawing() {
    // If called during a vertex drag, the vertex will be removed before
    // the mouseup fires on it. This is a workaround. Maybe better fix is
    // To have Draggable reset it's status on disable (Leaflet side).
    Draggable._dragging = false
    this.onCancelDrawing()
    this.endDrawing()
  }

  endDrawing() {
    this._drawing = false
    this.tools.unregisterForDrawing(this)
    this.onEndDrawing()
  }

  onDrawingClick(e) {
    if (!this.drawing()) return
    this.tools.makeCancellable(e)
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:click: CancelableEvent
    // Fired when user `click` while drawing, before any internal action is being processed.
    this.fireAndForward('editable:drawing:click', e)
    if (e._cancelled) return
    if (!this.isConnected()) this.connect(e)
    this.processDrawingClick(e)
  }

  isConnected() {
    return this.map.hasLayer(this.feature)
  }

  connect() {
    this.tools.connectCreatedToMap(this.feature)
    this.tools.options.editLayer.addLayer(this.editLayer)
  }

  onMove(e) {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:move: Event
    // Fired when `move` mouse while drawing, while dragging a marker, and while dragging a vertex.
    this.fireAndForward('editable:drawing:move', e)
  }

  onDrawingMouseMove(e) {
    this.onMove(e)
  }

  _getEvents() {
    return {
      dragstart: this.onDragStart,
      drag: this.onDrag,
      dragend: this.onDragEnd,
      remove: this.disable,
    }
  }

  onDragStart(e) {
    this.onEditing()
    // 🍂namespace Editable
    // 🍂event editable:dragstart: Event
    // Fired before a path feature is dragged.
    this.fireAndForward('editable:dragstart', e)
  }

  onDrag(e) {
    this.onMove(e)
    // 🍂namespace Editable
    // 🍂event editable:drag: Event
    // Fired when a path feature is being dragged.
    this.fireAndForward('editable:drag', e)
  }

  onDragEnd(e) {
    // 🍂namespace Editable
    // 🍂event editable:dragend: Event
    // Fired after a path feature has been dragged.
    this.fireAndForward('editable:dragend', e)
    this.onEdited()
  }
}

// 🍂namespace Editable; 🍂class MarkerEditor; 🍂aka Editable.MarkerEditor
// 🍂inherits BaseEditor
// Editor for Marker.
export class MarkerEditor extends BaseEditor {
  constructor(map, feature, options) {
    super(map, feature, options)
  }

  onDrawingMouseMove(e) {
    super.onDrawingMouseMove(e)
    if (this._drawing) this.feature.setLatLng(e.latlng)
  }

  processDrawingClick(e) {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:clicked: Event
    // Fired when user `click` while drawing, after all internal actions.
    this.fireAndForward('editable:drawing:clicked', e)
    this.commitDrawing(e)
  }

  connect(e) {
    // On touch, the latlng has not been updated because there is
    // no mousemove.
    if (e) this.feature._latlng = e.latlng
    super.connect(e)
  }
}

// 🍂namespace Editable; 🍂class CircleMarkerEditor; 🍂aka Editable.CircleMarkerEditor
// 🍂inherits BaseEditor
// Editor for CircleMarker.
export class CircleMarkerEditor extends BaseEditor {
  constructor(map, feature, options) {
    super(map, feature, options)
  }

  onDrawingMouseMove(e) {
    super.onDrawingMouseMove(e)
    if (this._drawing) this.feature.setLatLng(e.latlng)
  }

  processDrawingClick(e) {
    // 🍂namespace Editable
    // 🍂section Drawing events
    // 🍂event editable:drawing:clicked: Event
    // Fired when user `click` while drawing, after all internal actions.
    this.fireAndForward('editable:drawing:clicked', e)
    this.commitDrawing(e)
  }

  connect(e) {
    // On touch, the latlng has not been updated because there is
    // no mousemove.
    if (e) this.feature._latlng = e.latlng
    super.connect(e)
  }
}

// 🍂namespace Editable; 🍂class PathEditor; 🍂aka Editable.PathEditor
// 🍂inherits BaseEditor
// Base class for all path editors.
export class PathEditor extends BaseEditor {
  CLOSED = false
  MIN_VERTEX = 2

  constructor(map, feature, options) {
    super(map, feature, options)
  }

  addHooks() {
    super.addHooks()
    if (this.feature) {
      this.initVertexMarkers()
      this.map.on('moveend', this.onMoveEnd, this)
    }
    return this
  }

  removeHooks() {
    super.removeHooks()
    if (this.feature) {
      this.map.off('moveend', this.onMoveEnd, this)
    }
  }

  onMoveEnd() {
    this.initVertexMarkers()
  }

  initVertexMarkers(latlngs) {
    if (!this.enabled()) return
    latlngs = latlngs || this.getLatLngs()
    if (isFlat(latlngs)) {
      this.addVertexMarkers(latlngs)
    } else {
      for (const member of latlngs) {
        this.initVertexMarkers(member)
      }
    }
  }

  getLatLngs() {
    return this.feature.getLatLngs()
  }

  // 🍂method reset()
  // Rebuild edit elements (Vertex, MiddleMarker, etc.).
  reset() {
    this.editLayer.clearLayers()
    this.initVertexMarkers()
  }

  addVertexMarker(latlng, latlngs) {
    if (latlng.__vertex) {
      latlng.__vertex.connect()
      return latlng.__vertex
    }
    return new VertexMarker(latlng, latlngs, this)
  }

  onNewVertex(vertex) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:new: VertexEvent
    // Fired when a new vertex is created.
    this.fireAndForward('editable:vertex:new', {
      latlng: vertex.latlng,
      vertex: vertex,
    })
  }

  addVertexMarkers(latlngs) {
    const bounds = this.map.getBounds()
    for (const latlng of latlngs) {
      if (!bounds.contains(latlng)) continue
      this.addVertexMarker(latlng, latlngs)
    }
  }

  refreshVertexMarkers(latlngs) {
    latlngs = latlngs || this.getDefaultLatLngs()
    for (const latlng of latlngs) {
      latlng.__vertex.update()
    }
  }

  addMiddleMarker(left, right, latlngs) {
    return new MiddleMarker(left, right, latlngs, this)
  }

  onVertexMarkerClick(e) {
    this.tools.makeCancellable(e)
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:click: CancelableVertexEvent
    // Fired when a `click` is issued on a vertex, before any internal action is being processed.
    this.fireAndForward('editable:vertex:click', e)
    if (e._cancelled) return
    if (this.tools.drawing() && this.tools._drawingEditor !== this) return
    const index = e.vertex.getIndex()
    let commit
    if (e.originalEvent.ctrlKey) {
      this.onVertexMarkerCtrlClick(e)
    } else if (e.originalEvent.altKey) {
      this.onVertexMarkerAltClick(e)
    } else if (e.originalEvent.shiftKey) {
      this.onVertexMarkerShiftClick(e)
    } else if (e.originalEvent.metaKey) {
      this.onVertexMarkerMetaKeyClick(e)
    } else if (
      index === e.vertex.getLastIndex() &&
      this._drawing === 1
    ) {
      if (index >= this.MIN_VERTEX - 1) commit = true
    } else if (
      index === 0 &&
      this._drawing === -1 &&
      this._drawnLatLngs.length >= this.MIN_VERTEX
    ) {
      commit = true
    } else if (
      index === 0 &&
      this._drawing === 1 &&
      this._drawnLatLngs.length >= this.MIN_VERTEX &&
      this.CLOSED
    ) {
      commit = true // Allow to close on first point also for polygons
    } else {
      this.onVertexRawMarkerClick(e)
    }
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:clicked: VertexEvent
    // Fired when a `click` is issued on a vertex, after all internal actions.
    this.fireAndForward('editable:vertex:clicked', e)
    if (commit) this.commitDrawing(e)
  }

  onVertexRawMarkerClick(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:rawclick: CancelableVertexEvent
    // Fired when a `click` is issued on a vertex without any special key and without being in drawing mode.
    this.fireAndForward('editable:vertex:rawclick', e)
    if (e._cancelled) return
    if (!this.vertexCanBeDeleted(e.vertex)) return
    e.vertex.delete()
  }

  vertexCanBeDeleted(vertex) {
    return vertex.latlngs.length > this.MIN_VERTEX
  }

  onVertexDeleted(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:deleted: VertexEvent
    // Fired after a vertex has been deleted by user.
    this.fireAndForward('editable:vertex:deleted', e)
    this.onEdited()
  }

  onVertexMarkerCtrlClick(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:ctrlclick: VertexEvent
    // Fired when a `click` with `ctrlKey` is issued on a vertex.
    this.fireAndForward('editable:vertex:ctrlclick', e)
  }

  onVertexMarkerShiftClick(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:shiftclick: VertexEvent
    // Fired when a `click` with `shiftKey` is issued on a vertex.
    this.fireAndForward('editable:vertex:shiftclick', e)
  }

  onVertexMarkerMetaKeyClick(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:metakeyclick: VertexEvent
    // Fired when a `click` with `metaKey` is issued on a vertex.
    this.fireAndForward('editable:vertex:metakeyclick', e)
  }

  onVertexMarkerAltClick(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:altclick: VertexEvent
    // Fired when a `click` with `altKey` is issued on a vertex.
    this.fireAndForward('editable:vertex:altclick', e)
  }

  onVertexMarkerContextMenu(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:contextmenu: VertexEvent
    // Fired when a `contextmenu` is issued on a vertex.
    this.fireAndForward('editable:vertex:contextmenu', e)
  }

  onVertexMarkerMouseDown(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:mousedown: VertexEvent
    // Fired when user `mousedown` a vertex.
    this.fireAndForward('editable:vertex:mousedown', e)
  }

  onVertexMarkerMouseOver(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:mouseover: VertexEvent
    // Fired when a user's mouse enters the vertex
    this.fireAndForward('editable:vertex:mouseover', e)
  }

  onVertexMarkerMouseOut(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:mouseout: VertexEvent
    // Fired when a user's mouse leaves the vertex
    this.fireAndForward('editable:vertex:mouseout', e)
  }

  onMiddleMarkerMouseDown(e) {
    // 🍂namespace Editable
    // 🍂section MiddleMarker events
    // 🍂event editable:middlemarker:mousedown: VertexEvent
    // Fired when user `mousedown` a middle marker.
    this.fireAndForward('editable:middlemarker:mousedown', e)
  }

  onVertexMarkerDrag(e) {
    this.onMove(e)
    if (this.feature._bounds) this.extendBounds(e)
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:drag: VertexEvent
    // Fired when a vertex is dragged by user.
    this.fireAndForward('editable:vertex:drag', e)
  }

  onVertexMarkerDragStart(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:dragstart: VertexEvent
    // Fired before a vertex is dragged by user.
    this.fireAndForward('editable:vertex:dragstart', e)
  }

  onVertexMarkerDragEnd(e) {
    // 🍂namespace Editable
    // 🍂section Vertex events
    // 🍂event editable:vertex:dragend: VertexEvent
    // Fired after a vertex is dragged by user.
    this.fireAndForward('editable:vertex:dragend', e)
    this.onEdited()
  }

  setDrawnLatLngs(latlngs) {
    this._drawnLatLngs = latlngs || this.getDefaultLatLngs()
  }

  startDrawing() {
    if (!this._drawnLatLngs) this.setDrawnLatLngs()
    super.startDrawing()
  }

  startDrawingForward() {
    this.startDrawing()
  }

  endDrawing() {
    this.tools.detachForwardLineGuide()
    this.tools.detachBackwardLineGuide()
    if (this._drawnLatLngs && this._drawnLatLngs.length < this.MIN_VERTEX)
      this.deleteShape(this._drawnLatLngs)
    super.endDrawing()
    delete this._drawnLatLngs
  }

  addLatLng(latlng) {
    if (this._drawing === 1) this._drawnLatLngs.push(latlng)
    else this._drawnLatLngs.unshift(latlng)
    this.feature._bounds.extend(latlng)
    const vertex = this.addVertexMarker(latlng, this._drawnLatLngs)
    this.onNewVertex(vertex)
    this.refresh()
  }

  newPointForward(latlng) {
    this.addLatLng(latlng)
    this.tools.attachForwardLineGuide()
    this.tools.anchorForwardLineGuide(latlng)
  }

  newPointBackward(latlng) {
    this.addLatLng(latlng)
    this.tools.anchorBackwardLineGuide(latlng)
  }

  // 🍂namespace PathEditor
  // 🍂method push()
  // Programmatically add a point while drawing.
  push(latlng) {
    if (!latlng)
      return console.error(
        'Editable.PathEditor.push expect a valid latlng as parameter'
      )
    if (this._drawing === 1) this.newPointForward(latlng)
    else this.newPointBackward(latlng)
  }

  removeLatLng(latlng) {
    latlng.__vertex.delete()
    this.refresh()
  }

  // 🍂method pop(): LatLng or null
  // Programmatically remove last point (if any) while drawing.
  pop() {
    if (this._drawnLatLngs.length <= 1) return
    let latlng
    if (this._drawing === 1) {
      latlng = this._drawnLatLngs[this._drawnLatLngs.length - 1]
    } else {
      latlng = this._drawnLatLngs[0]
    }
    this.removeLatLng(latlng)
    if (this._drawing === 1) {
      this.tools.anchorForwardLineGuide(
        this._drawnLatLngs[this._drawnLatLngs.length - 1]
      )
    } else {
      this.tools.anchorForwardLineGuide(this._drawnLatLngs[0])
    }
    return latlng
  }

  processDrawingClick(e) {
    if (e.vertex && e.vertex.editor === this) return
    if (this._drawing === 1) this.newPointForward(e.latlng)
    else this.newPointBackward(e.latlng)
    this.fireAndForward('editable:drawing:clicked', e)
  }

  onDrawingMouseMove(e) {
    super.onDrawingMouseMove(e)
    if (this._drawing) {
      this.tools.moveForwardLineGuide(e.latlng)
      this.tools.moveBackwardLineGuide(e.latlng)
    }
  }

  refresh() {
    this.feature.redraw()
    this.onEditing()
  }

  // 🍂namespace PathEditor
  // 🍂method newShape(latlng?: LatLng)
  // Add a new shape (Polyline, Polygon) in a multi, and setup up drawing tools to draw it;
  // if optional `latlng` is given, start a path at this point.
  newShape(latlng) {
    const shape = this.addNewEmptyShape()
    if (!shape) return
    this.setDrawnLatLngs(shape[0] || shape) // Polygon or polyline
    this.startDrawingForward()
    // 🍂namespace Editable
    // 🍂section Shape events
    // 🍂event editable:shape:new: ShapeEvent
    // Fired when a new shape is created in a multi (Polygon or Polyline).
    this.fireAndForward('editable:shape:new', { shape: shape })
    if (latlng) this.newPointForward(latlng)
  }

  deleteShape(shape, latlngs) {
    const e = { shape: shape }
    this.tools.makeCancellable(e)

    // 🍂namespace Editable
    // 🍂section Shape events
    // 🍂event editable:shape:delete: CancelableShapeEvent
    // Fired before a new shape is deleted in a multi (Polygon or Polyline).
    this.fireAndForward('editable:shape:delete', e)
    if (e._cancelled) return
    shape = this._deleteShape(shape, latlngs)
    if (this.ensureNotFlat) this.ensureNotFlat() // Polygon.
    this.feature.setLatLngs(this.getLatLngs()) // Force bounds reset.
    this.refresh()
    this.reset()
    // 🍂namespace Editable
    // 🍂section Shape events
    // 🍂event editable:shape:deleted: ShapeEvent
    // Fired after a new shape is deleted in a multi (Polygon or Polyline).
    this.fireAndForward('editable:shape:deleted', { shape: shape })
    this.onEdited()
    return shape
  }

  _deleteShape(shape, latlngs) {
    latlngs = latlngs || this.getLatLngs()
    if (!latlngs.length) return
    const inplaceDelete = (latlngs, shape) => {
      // Called when deleting a flat latlngs
      return latlngs.splice(0, Number.MAX_VALUE)
    }
    const spliceDelete = (latlngs, shape) => {
      // Called when removing a latlngs inside an array
      latlngs.splice(latlngs.indexOf(shape), 1)
      if (!latlngs.length) this._deleteShape(latlngs)
      return shape
    }
    if (latlngs === shape) return inplaceDelete(latlngs, shape)
    for (const member of latlngs) {
      if (member === shape) return spliceDelete(latlngs, shape)
      if (member.indexOf(shape)) return spliceDelete(member, shape)
    }
  }

  // 🍂namespace PathEditor
  // 🍂method deleteShapeAt(latlng: LatLng): Array
  // Remove a path shape at the given `latlng`.
  deleteShapeAt(latlng) {
    const shape = this.feature.shapeAt(latlng)
    if (shape) return this.deleteShape(shape)
  }

  // 🍂method appendShape(shape: Array)
  // Append a new shape to the Polygon or Polyline.
  appendShape(shape) {
    this.insertShape(shape)
  }

  // 🍂method prependShape(shape: Array)
  // Prepend a new shape to the Polygon or Polyline.
  prependShape(shape) {
    this.insertShape(shape, 0)
  }

  // 🍂method insertShape(shape: Array, index: int)
  // Insert a new shape to the Polygon or Polyline at given index (default is to append).
  insertShape(shape, index) {
    this.ensureMulti()
    shape = this.formatShape(shape)
    if (index === undefined) index = this.feature._latlngs.length
    this.feature._latlngs.splice(index, 0, shape)
    this.feature.redraw()
    if (this._enabled) this.reset()
  }

  extendBounds(e) {
    this.feature._bounds.extend(e.vertex.latlng)
  }

  onDragStart(e) {
    this.editLayer.clearLayers()
    super.onDragStart(e)
  }

  onDragEnd(e) {
    this.initVertexMarkers()
    super.onDragEnd(e)
  }
}

// 🍂namespace Editable; 🍂class PolylineEditor; 🍂aka Editable.PolylineEditor
// 🍂inherits PathEditor
export class PolylineEditor extends PathEditor {
  constructor(map, feature, options) {
    super(map, feature, options)
  }

  startDrawingBackward() {
    this._drawing = -1
    this.startDrawing()
  }

  // 🍂method continueBackward(latlngs?: Array)
  // Set up drawing tools to continue the line backward.
  continueBackward(latlngs) {
    if (this.drawing()) return
    latlngs = latlngs || this.getDefaultLatLngs()
    this.setDrawnLatLngs(latlngs)
    if (latlngs.length > 0) {
      this.tools.attachBackwardLineGuide()
      this.tools.anchorBackwardLineGuide(latlngs[0])
    }
    this.startDrawingBackward()
  }

  // 🍂method continueForward(latlngs?: Array)
  // Set up drawing tools to continue the line forward.
  continueForward(latlngs) {
    if (this.drawing()) return
    latlngs = latlngs || this.getDefaultLatLngs()
    this.setDrawnLatLngs(latlngs)
    if (latlngs.length > 0) {
      this.tools.attachForwardLineGuide()
      this.tools.anchorForwardLineGuide(latlngs[latlngs.length - 1])
    }
    this.startDrawingForward()
  }

  getDefaultLatLngs(latlngs) {
    latlngs = latlngs || this.feature._latlngs
    if (!latlngs.length || latlngs[0] instanceof LatLng) return latlngs
    return this.getDefaultLatLngs(latlngs[0])
  }

  ensureMulti() {
    if (this.feature._latlngs.length && isFlat(this.feature._latlngs)) {
      this.feature._latlngs = [this.feature._latlngs]
    }
  }

  addNewEmptyShape() {
    if (this.feature._latlngs.length) {
      const shape = []
      this.appendShape(shape)
      return shape
    }
    return this.feature._latlngs
  }

  formatShape(shape) {
    if (isFlat(shape)) return shape
    if (shape[0]) return this.formatShape(shape[0])
  }

  // 🍂method splitShape(latlngs?: Array, index: int)
  // Split the given `latlngs` shape at index `index` and integrate new shape in instance `latlngs`.
  splitShape(shape, index) {
    if (!index || index >= shape.length - 1) return
    this.ensureMulti()
    const shapeIndex = this.feature._latlngs.indexOf(shape)
    if (shapeIndex === -1) return
    const first = shape.slice(0, index + 1)
    const second = shape.slice(index)
    // We deal with reference, we don't want twice the same latlng around.
    second[0] = new LatLng(second[0].lat, second[0].lng, second[0].alt)
    this.feature._latlngs.splice(shapeIndex, 1, first, second)
    this.refresh()
    this.reset()
    this.onEdited()
  }
}

// 🍂namespace Editable; 🍂class PolygonEditor; 🍂aka Editable.PolygonEditor
// 🍂inherits PathEditor
export class PolygonEditor extends PathEditor {
  CLOSED = true
  MIN_VERTEX = 3

  constructor(map, feature, options) {
    super(map, feature, options)
  }

  newPointForward(latlng) {
    super.newPointForward(latlng)
    if (!this.tools.backwardLineGuide._latlngs.length)
      this.tools.anchorBackwardLineGuide(latlng)
    if (this._drawnLatLngs.length === 2) this.tools.attachBackwardLineGuide()
  }

  addNewEmptyHole(latlng) {
    this.ensureNotFlat()
    const latlngs = this.feature.shapeAt(latlng)
    if (!latlngs) return
    const holes = []
    latlngs.push(holes)
    return holes
  }

  // 🍂method newHole(latlng?: LatLng, index: int)
  // Set up drawing tools for creating a new hole on the Polygon. If the `latlng` param is given, a first point is created.
  newHole(latlng) {
    const holes = this.addNewEmptyHole(latlng)
    if (!holes) return
    this.setDrawnLatLngs(holes)
    this.startDrawingForward()
    if (latlng) this.newPointForward(latlng)
  }

  addNewEmptyShape() {
    if (this.feature._latlngs.length && this.feature._latlngs[0].length) {
      const shape = []
      this.appendShape(shape)
      return shape
    }
    return this.feature._latlngs
  }

  ensureMulti() {
    if (this.feature._latlngs.length && isFlat(this.feature._latlngs[0])) {
      this.feature._latlngs = [this.feature._latlngs]
    }
  }

  ensureNotFlat() {
    if (!this.feature._latlngs.length || isFlat(this.feature._latlngs))
      this.feature._latlngs = [this.feature._latlngs]
  }

  vertexCanBeDeleted(vertex) {
    const parent = this.feature.parentShape(vertex.latlngs)
    const idx = parent?.includes(vertex) ?? 0
    if (idx > 0) return true // Holes can be totally deleted without removing the layer itself.
    return super.vertexCanBeDeleted(vertex)
  }

  getDefaultLatLngs() {
    if (!this.feature._latlngs.length) this.feature._latlngs.push([])
    return this.feature._latlngs[0]
  }

  formatShape(shape) {
    // [[1, 2], [3, 4]] => must be nested
    // [] => must be nested
    // [[]] => is already nested
    if (isFlat(shape) && (!shape[0] || shape[0].length !== 0)) return [shape]
    return shape
  }
}

// 🍂namespace Editable; 🍂class RectangleEditor; 🍂aka Editable.RectangleEditor
// 🍂inherits PathEditor
export class RectangleEditor extends PathEditor {
  CLOSED = true
  MIN_VERTEX = 4

  constructor(map, feature, options) {
    super(map, feature, options)
    options.skipMiddleMarkers = true
  }

  extendBounds(e) {
    const index = e.vertex.getIndex()
    const next = e.vertex.getNext()
    const previous = e.vertex.getPrevious()
    const oppositeIndex = (index + 2) % 4
    const opposite = e.vertex.latlngs[oppositeIndex]
    const bounds = new LatLngBounds(e.latlng, opposite)
    // Update latlngs by hand to preserve order.
    previous.latlng.update([e.latlng.lat, opposite.lng])
    next.latlng.update([opposite.lat, e.latlng.lng])
    this.updateBounds(bounds)
    this.refreshVertexMarkers()
  }

  onDrawingMouseDown(e) {
    super.onDrawingMouseDown(e)
    this.connect()
    const latlngs = this.getDefaultLatLngs()
    // Polygon._convertLatLngs removes last latlng if it equals first point,
    // which is the case here as all latlngs are [0, 0]
    if (latlngs.length === 3) latlngs.push(e.latlng)
    const bounds = new LatLngBounds(e.latlng, e.latlng)
    this.updateBounds(bounds)
    this.updateLatLngs(bounds)
    this.refresh()
    this.reset()
    // Stop dragging map.
    // Draggable has two workflows:
    // - mousedown => mousemove => mouseup
    // - touchstart => touchmove => touchend
    // Problem: Map.Tap does not allow us to listen to touchstart, so we only
    // can deal with mousedown, but then when in a touch device, we are dealing with
    // simulated events (actually simulated by Map.Tap), which are no more taken
    // into account by Draggable.
    // Ref.: https://github.com/Leaflet/Leaflet.Editable/issues/103
    e.originalEvent._simulated = false
    this.map.dragging._draggable._onUp(e.originalEvent)
    // Now transfer ongoing drag action to the bottom right corner.
    // Should we refine which corner will handle the drag according to
    // drag direction?
    latlngs[3].__vertex.dragging._draggable._onDown(e.originalEvent)
  }

  onDrawingMouseUp(e) {
    this.commitDrawing(e)
    e.originalEvent._simulated = false
    super.onDrawingMouseUp(e)
  }

  onDrawingMouseMove(e) {
    e.originalEvent._simulated = false
    super.onDrawingMouseMove(e)
  }

  getDefaultLatLngs(latlngs) {
    return latlngs || this.feature._latlngs[0]
  }

  updateBounds(bounds) {
    this.feature._bounds = bounds
  }

  updateLatLngs(bounds) {
    const latlngs = this.getDefaultLatLngs()
    const newLatlngs = this.feature._boundsToLatLngs(bounds)
    // Keep references.
    for (let i = 0; i < latlngs.length; i++) {
      latlngs[i].update(newLatlngs[i])
    }
  }
}

// 🍂namespace Editable; 🍂class CircleEditor; 🍂aka Editable.CircleEditor
// 🍂inherits PathEditor
export class CircleEditor extends PathEditor {
  MIN_VERTEX = 2

  constructor(map, feature, options) {
    super(map, feature, options)
    options.skipMiddleMarkers = true
    this._resizeLatLng = this.computeResizeLatLng()
  }

  computeResizeLatLng() {
    // While circle is not added to the map, _radius is not set.
    const delta =
      (this.feature._radius || this.feature._mRadius) * Math.cos(Math.PI / 4)
    const point = this.map.project(this.feature._latlng)
    return this.map.unproject([point.x + delta, point.y - delta])
  }

  updateResizeLatLng() {
    this._resizeLatLng.update(this.computeResizeLatLng())
    this._resizeLatLng.__vertex.update()
  }

  getLatLngs() {
    return [this.feature._latlng, this._resizeLatLng]
  }

  getDefaultLatLngs() {
    return this.getLatLngs()
  }

  onVertexMarkerDrag(e) {
    if (e.vertex.getIndex() === 1) this.resize(e)
    else this.updateResizeLatLng(e)
    super.onVertexMarkerDrag(e)
  }

  resize(e) {
    let radius
    if (this.map.options.crs) {
      radius = this.map.options.crs.distance(this.feature._latlng, e.latlng)
    } else {
      radius = this.feature._latlng.distanceTo(e.latlng)
    }
    this.feature.setRadius(radius)
  }

  onDrawingMouseDown(e) {
    super.onDrawingMouseDown(e)
    this._resizeLatLng.update(e.latlng)
    this.feature._latlng.update(e.latlng)
    this.connect()
    // Stop dragging map.
    e.originalEvent._simulated = false
    this.map.dragging._draggable._onUp(e.originalEvent)
    // Now transfer ongoing drag action to the radius handler.
    this._resizeLatLng.__vertex.dragging._draggable._onDown(e.originalEvent)
  }

  onDrawingMouseUp(e) {
    this.commitDrawing(e)
    e.originalEvent._simulated = false
    super.onDrawingMouseUp(e)
  }

  onDrawingMouseMove(e) {
    e.originalEvent._simulated = false
    super.onDrawingMouseMove(e)
  }

  onDrag(e) {
    super.onDrag(e)
    this.feature.dragging.updateLatLng(this._resizeLatLng)
  }
}

// 🍂namespace Editable; 🍂class EditableMixin
// `EditableMixin` is included to `Polyline`, `Polygon`, `Rectangle`, `Circle`
// and `Marker`. It adds some methods to them.
// *When editing is enabled, the editor is accessible on the instance with the
// `editor` property.*
const EditableMixin = {
  createEditor: function (map) {
    map = map || this._map
    const tools = this.options?.editOptions?.editTools || map.editTools
    if (!tools) throw Error('Unable to detect Editable instance.')
    const Klass = this.options?.editorClass || this.getEditorClass(tools)
    return new Klass(map, this, this.options?.editOptions)
  },

  // 🍂method enableEdit(map?: Map): this.editor
  // Enable editing, by creating an editor if not existing, and then calling `enable` on it.
  enableEdit: function (map) {
    if (!this.editor) this.createEditor(map)
    this.editor.enable()
    return this.editor
  },

  // 🍂method editEnabled(): boolean
  // Return true if current instance has an editor attached, and this editor is enabled.
  editEnabled: function () {
    return this.editor?.enabled()
  },

  // 🍂method disableEdit()
  // Disable editing, also remove the editor property reference.
  disableEdit: function () {
    if (this.editor) {
      this.editor.disable()
      delete this.editor
    }
  },

  // 🍂method toggleEdit()
  // Enable or disable editing, according to current status.
  toggleEdit: function () {
    if (this.editEnabled()) this.disableEdit()
    else this.enableEdit()
  },

  _onEditableAdd: function () {
    if (this.editor) this.enableEdit()
  },
}

const PolylineMixin = {
  getEditorClass: (tools) => {
    return tools?.options?.polylineEditorClass || Polyline
  },

  shapeAt: function (latlng, latlngs) {
    // We can have those cases:
    // - latlngs are just a flat array of latlngs, use this
    // - latlngs is an array of arrays of latlngs, loop over
    let shape = null
    latlngs = latlngs || this._latlngs
    if (!latlngs.length) return shape
    if (isFlat(latlngs) && this.isInLatLngs(latlng, latlngs)) shape = latlngs
    else {
      for (const member of latlngs) {
        if (this.isInLatLngs(latlng, member)) return member
      }
    }
    return shape
  },

  isInLatLngs: function (l, latlngs) {
    if (!latlngs) return false
    let i
    let k
    let len
    let part = []
    let p
    const w = this._clickTolerance()
    this._projectLatlngs(latlngs, part, this._pxBounds)
    part = part[0]
    p = this._map.latLngToLayerPoint(l)

    if (!this._pxBounds.contains(p)) {
      return false
    }
    for (i = 1, len = part.length, k = 0; i < len; k = i++) {
      if (LineUtil.pointToSegmentDistance(p, part[k], part[i]) <= w) {
        return true
      }
    }
    return false
  },
}

const PolygonMixin = {
  getEditorClass: (tools) => {
    return tools?.options?.polygonEditorClass || PolygonEditor
  },

  shapeAt: function (latlng, latlngs) {
    // We can have those cases:
    // - latlngs are just a flat array of latlngs, use this
    // - latlngs is an array of arrays of latlngs, this is a simple polygon (maybe with holes), use the first
    // - latlngs is an array of arrays of arrays, this is a multi, loop over
    let shape = null
    latlngs = latlngs || this._latlngs
    if (!latlngs.length) return shape
    if (isFlat(latlngs) && this.isInLatLngs(latlng, latlngs)) shape = latlngs
    if (isFlat(latlngs[0]) && this.isInLatLngs(latlng, latlngs[0])) {
      shape = latlngs
    } else {
      for (const member of latlngs) {
        if (this.isInLatLngs(latlng, member[0])) return member
      }
    }
    return shape
  },

  isInLatLngs: (l, latlngs) => {
    let inside = false
    let l1
    let l2
    let j
    let k
    let len2

    for (j = 0, len2 = latlngs.length, k = len2 - 1; j < len2; k = j++) {
      l1 = latlngs[j]
      l2 = latlngs[k]

      if (
        l1.lat > l.lat !== l2.lat > l.lat &&
        l.lng < ((l2.lng - l1.lng) * (l.lat - l1.lat)) / (l2.lat - l1.lat) + l1.lng
      ) {
        inside = !inside
      }
    }

    return inside
  },

  parentShape: function (shape, latlngs) {
    latlngs = latlngs || this._latlngs
    if (!latlngs) return
    let idx = shape.indexOf(latlngs)
    if (idx !== -1) return latlngs
    for (const member of latlngs) {
      idx = shape.indexOf(member)
      if (idx !== -1) return member
    }
  },
}

const MarkerMixin = {
  getEditorClass: (tools) => {
    return tools?.options?.markerEditorClass || MarkerEditor
  },
}

const CircleMarkerMixin = {
  getEditorClass: (tools) => {
    return tools?.options?.circleMarkerEditorClass || CircleMarkerEditor
  },
}

const RectangleMixin = {
  getEditorClass: (tools) => {
    return tools?.options?.rectangleEditorClass || RectangleEditor
  },
}

const CircleMixin = {
  getEditorClass: (tools) => {
    return tools?.options?.circleEditorClass || CircleEditor
  },
}

const keepEditable = function () {
  // Make sure you can remove/readd an editable layer.
  this.on('add', this._onEditableAdd)
}

const isFlat = LineUtil.isFlat || LineUtil._flat || Polyline._flat // <=> 1.1 compat.

if (Polyline) {
  Polyline.include(EditableMixin)
  Polyline.include(PolylineMixin)
  Polyline.addInitHook(keepEditable)
}
if (Polygon) {
  Polygon.include(EditableMixin)
  Polygon.include(PolygonMixin)
}
if (Marker) {
  Marker.include(EditableMixin)
  Marker.include(MarkerMixin)
  Marker.addInitHook(keepEditable)
}
if (CircleMarker) {
  CircleMarker.include(EditableMixin)
  CircleMarker.include(CircleMarkerMixin)
  CircleMarker.addInitHook(keepEditable)
}
if (Rectangle) {
  Rectangle.include(EditableMixin)
  Rectangle.include(RectangleMixin)
}
if (Circle) {
  Circle.include(EditableMixin)
  Circle.include(CircleMixin)
}

LatLng.prototype.update = function (latlng) {
  latlng = new LatLng(latlng)
  this.lat = latlng.lat
  this.lng = latlng.lng
}