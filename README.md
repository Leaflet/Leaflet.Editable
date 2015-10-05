[![Build Status](https://travis-ci.org/yohanboniface/Leaflet.Editable.svg)](https://travis-ci.org/yohanboniface/Leaflet.Editable)
# Leaflet.Editable

Make geometries editable in Leaflet.

**WARNING: the `gh-pages` branch needs latest Leaflet master (future 1.0). To use the stable
Leaflet release, please use the `leaflet0.7` branch.**


This is not a plug and play UI, and will not. This is a minimal, lightweight,
and fully extendable API to control editing of geometries. So you can easily
build your own UI with your own needs and choices.

See the [demo UI](http://yohanboniface.github.io/Leaflet.Editable/example/index.html), an more [examples below](#examples).
This is also the drawing engine behind [uMap](http://wiki.openstreetmap.org/wiki/UMap).


Design keys:

- only the core needs
- no UI, instead hooks everywhere needed
- everything programatically controlable
- MultiPolygon/MultiPolyline support
- Polygons' holes support
- touch support
- tests

Note: only [geojson](http://geojson.org/) features are supported for now:
Marker, Polyline, Polygon, and MultiPolygon/MultiPolylines (no Rectangle, Circle…)

## Install

You need Leaflet >= 0.7.3, and then include `src/Leaflet.Editable.js`.


## Quick start

Allow Leaflet.Editable in the map options:

    var map = L.map('map', {editable: true});

Then, to start editing an existing feature, call the `enableEdit` method on it:

    var polyline = L.polyline([[43.1, 1.2], [43.2, 1.3],[43.3, 1.2]]).addTo(map);
    polyline.enableEdit();

If you want to draw a new line:

    map.editTools.startPolyline();  // map.editTools has been created
                                    // by passing editable: true option to the map

If you want to continue an existing line:

    polyline.editor.continueForward();
    // or
    polyline.editor.continueBackward();

## Examples

- [Basic controls](http://yohanboniface.github.io/Leaflet.Editable/example/index.html)
- [Continue line by ctrl-clicking on first/last point](http://yohanboniface.github.io/Leaflet.Editable/example/continue-line.html)
- [Create hole in a polygon by ctrl-clicking on it](http://yohanboniface.github.io/Leaflet.Editable/example/create-hole-on-click.html)
- [Change line colour on editing](http://yohanboniface.github.io/Leaflet.Editable/example/change-line-colour-on-editing.html)
- [Display a tooltip near cursor while drawing](http://yohanboniface.github.io/Leaflet.Editable/example/tooltip-when-drawing.html)
- [Basic demo of undo/redo](http://yohanboniface.github.io/Leaflet.Editable/example/undo-redo.html) (Use ctrl-Z to undo and ctrl-shift-Z to redo)
- [Multipolygon example](http://yohanboniface.github.io/Leaflet.Editable/example/multipolygon.html)
- Example of [Leaflet.Snap](https://github.com/makinacorpus/Leaflet.Snap/) integration [to enable snapping](http://yohanboniface.github.io/Leaflet.Editable/example/snapping.html)


## API

Leaflet.Editable is made to be fully extendable. You have three ways to customize
the behaviour: using options, listening to events, or extending.

### L.Map

Leaflet.Editable add options and events to the `L.Map` object.

#### Options

|    option name      |  default   |                      usage                                    |
|---------------------|------------|---------------------------------------------------------------|
| editable            | false      |  Whether to create a L.Editable instance at map init or not.  |
| editOptions         | {}         |  Options to pass to L.Editable when instanciating.            |
| editToolsClass      | L.Editable |  Editable class to instanciate.                               |


#### Events
| event name | properties | cancellable* | usage |
|------------|------------|-------------|-------|
| editable:created    | layer | false | Fired when a new feature (Marker, Polyline…) has been created. |
| editable:enable     | layer | false | Fired when an existing feature is ready to be edited |
| editable:disable    | layer | false | Fired when an existing feature is not ready anymore to be edited |
| editable:editing    | layer | false | Fired as soon as any change is made to the feature geometry |
| editable:drawing:start | layer | false | Fired when a feature is to be drawn |
| editable:drawing:end | layer | false | Fired when a feature is not drawn anymore |
| editable:drawing:cancel | layer | false | Fired when user cancel drawing while a feature is being drawn |
| editable:drawing:commit | layer | false | Fired when user finish drawing a feature |
| editable:drawing:click | layer | true | Fired when user click while drawing, before any internal action is being processed |
| editable:drawing:clicked | layer | false | Fired when user click while drawing, after all internal actions |
| editable:drawing:move | layer | false | Fired when move mouse while drawing, while dragging a marker, and while dragging a vertex |
| editable:vertex:click | originalEvent, latlng, vertex, layer | true | Fired when a click is issued on a vertex, before any internal action is being processed |
| editable:vertex:clicked | originalEvent, latlng, vertex, layer | false | Fired when a click is issued on a vertex, after all internal actions |
| editable:vertex:ctrlclick | originalEvent, latlng, vertex, layer | false | Fired when a click having ctrlKey is issued on a vertex |
| editable:vertex:shiftclick | originalEvent, latlng, vertex, layer | false | Fired when a click having shiftKey is issued on a vertex |
| editable:vertex:altclick | originalEvent, latlng, vertex, layer | false | Fired when a click having altKey is issued on a vertex |
| editable:vertex:metakeyclick | originalEvent, latlng, vertex, layer | false | Fired when a click with metaKey pressed is issued on a vertex |
| editable:vertex:rawclick | originalEvent, latlng, vertex, layer | true | Fired when a click is issued on a vertex without any special key and without being in drawing mode |
| editable:vertex:contextmenu | originalEvent, latlng, vertex, layer | false | Fired when a contextmenu is issued on a vertex |
| editable:vertex:deleted | originalEvent, latlng, vertex, layer | false | Fired after a vertex has been deleted by user |
| editable:vertex:mousedown | originalEvent, latlng, vertex, layer | false | Fired when user mousedown a vertex |
| editable:vertex:drag | originalEvent, latlng, vertex, layer | false | Fired when a vertex is dragged by user |
| editable:vertex:dragstart | originalEvent, latlng, vertex, layer | false | Fired before a vertex is dragged by user |
| editable:vertex:dragend | originalEvent, latlng, vertex, layer | false | Fired after a vertex is dragged by user |
| editable:middlemarker:mousedown | originalEvent, latlng, vertex, layer | true | Fired when user mousedown a middle marker |
| editable:shape:new | originalEvent, latlng, shape, layer | false | Fired when a new shape is created in a multi (polygon or polyline) |
| editable:shape:delete | originalEvent, latlng, shape, layer | true | Fired before a new shape is deleted in a multi (polygon or polyline) |
| editable:shape:deleted | originalEvent, latlng, shape, layer | false | Fired after a new shape is deleted in a multi (polygon or polyline) |

Note on *cancellable* events: those event have attached a `cancel` method,
calling this method (eg. `e.cancel()`) will cancel any subsequent action.

### L.Editable

You will usually have only one instance of L.Editable, and generally the one
created automatically at map init: `map.editTools`. It's the toolbox you will
use to create new features, and also the object you will configure with options.
Let's see them.

#### Options

*Note: you can pass them when creating a map using the `editOptions` key.*

|    option name      |  default  |                      usage               |
|---------------------|-----------|------------------------------------------|
| polylineClass       | L.Polyline |  Class to be used when creating a new Polyline  |
| polygonClass        | L.Polygon |  Class to be used when creating a new Polygon  |
| markerClass         | L.Marker |  Class to be used when creating a new Marker  |
| drawingCSSClass     | leaflet-editable-drawing |  CSS class to be added to the map container while drawing  |
| drawingCursor       | crosshair |  cursor mode set to the map while drawing  |
| editLayer     | new L.LayerGroup() |  Layer used to store edit tools (vertex, line guide…)  |
| featuresLayer     | new L.LayerGroup() | Default layer used to store drawn features (marker, polyline…)  |
| vertexMarkerClass | L.Editable.VertexMarker | Class to be used as vertex, for path editing  |
| middleMarkerClass | L.Editable.MiddleMarker | Class to be used as middle vertex, pulled by the user to create a new point in the middle of a path  |
| polylineEditorClass | L.Editable.PolylineEditor | Class to be used as Polyline editor  |
| polygonEditorClass | L.Editable.PolygonEditor | Class to be used as Polygon editor  |
| markerEditorClass | L.Editable.MarkerEditor | Class to be used as Marker editor  |
| lineGuideOptions | {} | Options to be passed to the line guides  |
| skipMiddleMarkers | null | Set this to true if you don't want middle markers |

#### Methods

Those are the public methods. You will generally access them by the `map.editTools`
instance:

    map.editTools.startPolyline();

|  method name   |  params | return |                      usage               |
|----------------|---------|--------|---------------------------------|
| startPolyline  | latlng\*, options  | created L.Polyline instance | Start drawing a polyline. If latlng is given, a first point will be added. In any case, continuing on user click. If options is given, it will be passed to the polyline class constructor. |
| startPolygon  | latlng\*, options  | created L.Polygon instance | Start drawing a polygon. If latlng is given, a first point will be added. In any case, continuing on user click. If options is given, it will be passed to the polygon class constructor. |
| startMarker  | latlng\*, options  | created L.Marker instance | Start adding a marker. If latlng is given, the marker will be shown first at this point. In any case, it will follow the user mouse, and will have a final latlng on next click (or touch). If options is given, it will be passed to the marker class constructor.|
| stopDrawing  | — | — | When you need to stop any ongoing drawing, without needing to know which editor is active. |
| commitDrawing  | — | — | When you need to commit any ongoing drawing, without needing to know which editor is active. |
| drawing | — | boolean | Return true if an editor is active and in drawing mode. |

#### Events

Same as L.Map.


### L.Editable.VertexMarker

The marker used to handle path vertex. You will usually interact with a `VertexMarker`
instance when listening for events like `editable:vertex:ctrlclick`.

Those are its public methods.

|  method name   |  params | return |                      usage               |
|----------------|---------|--------|---------------------------------|
| delete  | —  | — | Delete a vertex and the related latlng. |
| getIndex  | —  | int | Get the index of the current vertex among others of the same LatLngs group. |
| getLastIndex  | —  | int | Get last vertex index of the LatLngs group of the current vertex. |
| getPrevious  | —  | VertexMarker instance | Get the previous VertexMarker in the same LatLngs group. |
| getNext  | —  | VertexMarker instance | Get the next VertexMarker in the same LatLngs group. |
| split  | —  | — | Split the vertex LatLngs group at its index, if possible. |
| continue  | —  | — | Continue the vertex LatLngs from this vertex. Only active for first and last vertices of a Polyline. |


### L.Editable.BaseEditor

When editing a feature (marker, polyline…), an editor is attached to it. This
editor basically knows how to handle the edition.

It has some public methods:

|  method name   |  params | return |                      usage               |
|----------------|---------|--------|---------------------------------|
| enable  | —  | this | Set up the drawing tools for the feature to be editable. |
| disable  | —  | this | Remove editing tools. |


### L.Editable.MarkerEditor

Inherit from `L.Editable.BaseEditor`.

### L.Editable.PathEditor

Inherit from `L.Editable.BaseEditor`.

Inherited by `L.Editable.PolylineEditor` and `L.Editable.PolygonEditor`.

Interesting new method:

|  method name   |  params | return |                      usage               |
|----------------|---------|--------|---------------------------------|
| reset  | —  | — | Rebuild edit elements (vertex, middlemarker, etc.) |
| newShape  | latlng | — | Add a new shape (polyline, polygon) in a multi, and setup up drawing tools to draw it; if optional `latlng` is given, start a path at this point |
| push  | latlng  | — | Programmatically add a point while drawing |
| pop  | —  | latlng | Programatically remove last point (if any) while drawing |
| shapeAt  | latlng  | shape or undefined | Return the shape at the given latlng if any |
| deleteShapeAt  | latlng  | shape | Remove a path shape at the given latlng |
| appendShape  | shape  | — | Append a new shape to the polygon or polyline |
| prependShape  | shape  | — | Prepend a new shape to the polygon or polyline |
| insertShape  | shape, index  | — | Insert a new shape to the polygon or polyline at given index (default is to append) |
| drawing  | — | bookean | Return true if editor is drawing |


### L.Editable.PolylineEditor

Inherit from `L.Editable.PathEditor`.

Useful specific methods:

|  method name   |  params | return |              usage              |
|----------------|---------|--------|---------------------------------|
| continueForward  | latlngs  | — | Set up drawing tools to continue the line forward |
| continueBackward  | latlngs  | — | Set up drawing tools to continue the line backward |
| splitShape  | latlngs, index  | — | Split the given latlngs shape at index `index` and integrate new shape in instance latlngs |

### L.Editable.PolygonEditor

Inherit from `L.Editable.PathEditor`.

|  method name   |  params | return |              usage              |
|----------------|---------|--------|---------------------------------|
| newHole  | latlng\*  | — | Set up drawing tools for creating a new hole on the polygon. If the latlng param is given, a first point is created. |


### EditableMixin

`EditableMixin` is included to `L.Polyline`, `L.Polygon` and `L.Marker`. It
adds the following methods to them.

*When editing is enabled, the editor is accessible on the instance with the
`editor` property.*

#### Methods

|  method name   |  params | return |                      usage               |
|----------------|---------|--------|---------------------------------|
| enableEdit  | —  | related editor instance | Enable editing, by creating an editor if not existing, and then calling `enable` on it |
| disableEdit  | —  | — | Disable editing, also remove the editor property reference. |
| toggleEdit  | —  | — | Enable or disable editing, according to current status. |
| editEnabled  | —  | boolean | Return true if current instance has an editor attached, and this editor is enabled. |

#### Events

Some events are also fired on the feature itself.

|    event name      |  properties  |                      usage               |
|---------------------|-----------|------------------------------------------|
| editable:drawing:start | layer   |  Fired when a feature is to be drawn  |
| editable:drawing:end | layer    |  Fired when a feature is not drawn anymore  |
| editable:drawing:cancel | layer    |  Fired when user cancel drawing while a feature is being drawn  |
| editable:drawing:commit | layer    |  Fired when user finish drawing a feature  |
| editable:drawing:click | layer    |  Fired when user click while drawing  |
| editable:vertex:ctrlclick | originalEvent, latlng, vertex, layer    |  Fired when a click having ctrlKey is issued on a vertex  |
| editable:vertex:shiftclick | originalEvent, latlng, vertex, layer    |  Fired when a click having shiftKey is issued on a vertex  |
| editable:vertex:altclick | originalEvent, latlng, vertex, layer    |  Fired when a click having altKey is issued on a vertex  |
| editable:vertex:contextmenu | originalEvent, latlng, vertex, layer    |  Fired when a contextmenu is issued on a vertex  |
| editable:vertex:deleted | originalEvent, latlng, vertex, layer    |  Fired after a vertex has been deleted by user |


## Licence

`Leaflet.Editable` is released under the WTFPL licence.
