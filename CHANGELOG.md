# CHANGELOG

# 1.2.0

- add `editable:vertex:mouseover` and `editable:vertex:mouseout` events (#159,
  thanks to [@Git-Lior](https://github.com/Git-Lior))
- restrict large vertex icons to mobile only (cf #171, thanks to
  [@tyrasd](https://github.com/Git-Lior))
- prevent to add a vertex on right click (cf #157)

# 1.1.0

- compatibility with Leaflet 1.2.0
- add `editable:vertex:new` event


# 1.0.0

- BREAKING editorClass are now properly looked in editTools.options instead of map (cf #92)
- removed Leaflet as peerDependency (cf #72)
- fixed error in canvas due to guides being added too early (cf #80)
- added path dragging (when [Path.Drag.js](https://github.com/Leaflet/Path.Drag.js) is loaded)
- allow to draw a rectangle in any direction (cf #87)
- fixed editable:drawing:commit being fired on mousedown instead of mouseup for circle and rectangle (cf #70)
- hide middle markers if there is not enough space
- make possible to add new vertex on top of other paths vertex
- leaflet 1.0 support
- make editable:drawing:click and editable:vertex:click cancellable
- add editable:drawing:clicked and editable:vertex:clicked events
- add L.Editable.commitDrawing, to commit any ongoing drawing
- AMD/UMD compliancy
- fix middleMarker still triggering some events while not being visible
- add map option editToolsClass, that allow to override L.Editable class to be
  used
- added deleteShapeAt method
- added events editable:shape:delete and editable:shape:deleted
- added event editable:vertex:rawclick
- added splitShape method
- added appendShape method
- added Vertex.continue, as a shortcut to continueBackward / continueForward
- removed newClickHandler, now relying only on mousedown/mouseup event (simpler
  touch support)
- added editable:drawing:move
- added drawingCursor option to L.Editable
- added editable:vertex:metakeyclick event
- reenable edit if the layer was active when removed from the map
- only add created feature to the map at first user click (instead of adding it
  at startMarker/startPolygon call)
- added editable:drawing:mousedown and editable:drawing:mouseup events
- added support for L.Rectangle and L.Circle drawing and editing
- do not try to extend Leaflet classes not exposed (cf #83)

## 0.5.0
- added editable:vertex:drag event
- added editable:vertex:dragstart event
- added editable:vertex:dragend event

## 0.4.0
- Marker/Polygon/Polyline.createEditor now pass this.options.editOptions to
  the created editor
- fire editable events on the L.Editable instance also
- added featuresLayer option to L.Editable, and by default add features to
  this layer instead of the map directly
- added lineGuideOptions to L.Editable options
- added skipMiddleMarkers to L.Editable options

## 0.3.0
- added optional latlng param to L.Editable.startPolyline and startPolygon
- move listening of feature remove to editor.enable/disable
- fire editable:drawing:click after the click has been processed
- renamed editable:drawing:finish in editable:drawing:commit
- fixed that editable:drawing:click was fired after editable:drawing:end for MarkerEditor

## 0.2.0
- removed multi primary/secondary management
- added 'editable:middlemarker:onmousedown' event
- forward events to multipolygon/multipolyline
- refactored drawn latlngs validation
- remove hole array when deleting last point
- refactored internal events management
- removed 'position' from event properties
- renamed vertex.getPosition in vertex.getIndex
- renamed vertex.remove in vertex.delete
- added 'editable:drawing:cancel' event
- removed 'editable:edited' in favor of 'editable:drawing:finish'

## 0.1.0
- initial release
