# CHANGELOG

# dev
- hide middle markers if there is not enough space
- make possible to add new vertex on top of other
  paths vertex
- leaflet 1.0 support
- make editable:drawing:click and editable:vertex:click cancellable
- add editable:drawing:clicked and editable:vertex:clicked events
- add L.Editable.commitDrawing, to commit any ongoing drawing
- AMD/UMD compliancy
- fix middleMarker still trigering some events while not being visible
- add map option editToolsClass, that allow to override L.Editable class to be used
- added deleteShapeAt method
- added events editable:shape:delete and editable:shape:deleted
- added event editable:vertex:rawclick
- added splitShape method
- added appendShape method
- added Vertex.continue, as a shortcut to continueBackward / continueForward
- removed newClickHandler, now relying only on mousedown/mouseup event (simpler touch support)
- added editable:drawing:move
- added drawingCursor option to L.Editable
- added editable:vertex:metakeyclick event

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
