# CHANGELOG

## dev
- added optional latlng param to L.Editable.startPolyline and startPolygon
- move listening of feature remove to editor.enable/disable

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
