# Leaflet.Editable

Make geometries editable in Leaflet.

This is not a plug and play UI, and will not. This is a minimal, lightweight,
and fully extendable API to control editing of geometries. So you can easily
build your own UI with your own needs and choices.

See the [demo UI](http://yohanboniface.github.io/Leaflet.Editable/example/index.html).
This is also the drawing engine behind [uMap](http://wiki.openstreetmap.org/wiki/UMap).
See also [the examples below](#examples)

Design keys:

- only the core needs
- no UI, instead hooks everywhere needed
- everything programatically controlable
- MultiPolygon/MultiPolyline support
- Polygons' holes support
- touch support
- tests

Note: only geojson features are supported for now: Marker, Polyline, Polygon,
and MultiPolygon/MultiPolylines (no Rectangle, Circle…)


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

    polyline.continueForward();
    // or
    polyline.continueBackward();

## Examples

- [Basic controls](http://yohanboniface.github.io/Leaflet.Editable/example/index.html)
- [Continue line by ctrl-clicking on first/last point](http://yohanboniface.github.io/Leaflet.Editable/example/continue-line.html)
- [Create hole in a polygon by ctrl-clicking on it](http://yohanboniface.github.io/Leaflet.Editable/example/create-hole-on-click.html)
- [Change line colour on editing](http://yohanboniface.github.io/Leaflet.Editable/example/change-line-colour-on-editing.html)


## API

Leaflet.Editable is made to be extendable, and you have three ways to customize
the behaviour: using options, listening to events, or extending.

### L.Map

Leaflet.Editable add options and events to the `L.Map` object.

#### Options

|    option name      |  default  |                      usage               |
|---------------------|-----------|------------------------------------------|
| editable            | false     |  Whether to create a L.Editable instance at map init or not.  |
| editOptions         | {}        |  Options to pass to L.Editable when instanciating.  |


#### Events
|    event name      |  properties  |                      usage               |
|---------------------|-----------|------------------------------------------|
| editable:created    | layer     |  Fired when a new feature (Marker, Polyline…) has been created.  |
| editable:enable     | layer     |  Fired when an existing feature is ready to be edited  |
| editable:disable    | layer     |  Fired when an existing feature is not ready anymore to be edited  |
| editable:editing    | layer     |  Fired as soon as any change is made to the feature geometry  |
| editable:drawing:start | layer   |  Fired when a feature is to be drawn  |
| editable:drawing:end | layer    |  Fired when a feature is not drawn anymore  |
| editable:drawing:cancel | layer    |  Fired when user cancel drawing while a feature is being drawn  |
| editable:drawing:finish | layer    |  Fired when user finish drawing a feature  |
| editable:vertex:ctrlclick | originalEvent, latlng, vertex, layer    |  Fired when a click having ctrlKey is issued on a vertex  |
| editable:vertex:shiftclick | originalEvent, latlng, vertex, layer    |  Fired when a click having shiftKey is issued on a vertex  |
| editable:vertex:altclick | originalEvent, latlng, vertex, layer    |  Fired when a click having altKey is issued on a vertex  |
| editable:vertex:contextmenu | originalEvent, latlng, vertex, layer    |  Fired when a contextmenu is issued on a vertex  |
| editable:vertex:deleted | originalEvent, latlng, vertex, layer    |  Fired after a vertex has been deleted by user |


### L.Editable

You will usually have only one instance of L.Editable, and generally the one
created automatically at map init: `map.editTools`. It's the toolbox you will
use to create new feature, and also the object you will configure with options.
Let's see them.
*Note: you can pass them when creating a map using the `editOptions` key.*

|    option name      |  default  |                      usage               |
|---------------------|-----------|------------------------------------------|
| polylineClass       | L.Polyline |  Class to be used when creating a new Polyline  |
| polygonClass        | L.Polygon |  Class to be used when creating a new Polygon  |
| markerClass         | L.Marker |  Class to be used when creating a new Marker  |
| drawingCSSClass     | leaflet-editable-drawing |  CSS class to be added to the map container while drawing  |
| editLayer     | new L.LayerGroup() |  Layer used to store edit tools (vertex, line guide…)  |
| vertexMarkerClass | L.Editable.VertexMarker | Class to be used as vertex, for path editing  |
| middleMarkerClass | L.Editable.MiddleMarker | Class to be used as middle vertex, pulled by the user to create a new point in the middle of a path  |
| polylineEditorClass | L.Editable.PolylineEditor | Class to be used as Polyline editor  |
| polygonEditorClass | L.Editable.PolygonEditor | Class to be used as Polygon editor  |
| markerEditorClass | L.Editable.MarkerEditor | Class to be used as Marker editor  |


*TO BE CONTINUED…*
