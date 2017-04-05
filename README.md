[![Build Status](https://travis-ci.org/Leaflet/Leaflet.Editable.svg?branch=master)](https://travis-ci.org/Leaflet/Leaflet.Editable)
# Leaflet.Editable

Make geometries editable in Leaflet.


This is not a plug and play UI, and will not be. This is a minimal, lightweight,
and fully extendable API to control editing of geometries. So you can easily
build your own UI with your own needs and choices.

See the [demo UI](http://Leaflet.github.io/Leaflet.Editable/example/index.html), an more [examples below](#examples).
This is also the drawing engine behind [uMap](http://wiki.openstreetmap.org/wiki/UMap).


Design keys:

- only the core needs
- no UI, instead hooks everywhere needed
- everything programmatically controllable
- MultiPolygon/MultiPolyline support
- Polygons' holes support
- touch support
- tests

## Install

You need Leaflet >= 1.0.0, and then include `src/Leaflet.Editable.js`.

### Path dragging

If you want path dragging, you need to also include [Path.Drag.js](https://github.com/Leaflet/Path.Drag.js).


## Quick start

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

## Examples

- [Basic controls](http://Leaflet.github.io/Leaflet.Editable/example/index.html)
- [Continue line by ctrl/command-clicking on first/last point](http://Leaflet.github.io/Leaflet.Editable/example/continue-line.html)
- [Create hole in a polygon by ctrl-clicking on it](http://Leaflet.github.io/Leaflet.Editable/example/create-hole-on-click.html)
- [Change line colour on editing](http://Leaflet.github.io/Leaflet.Editable/example/change-line-colour-on-editing.html)
- [Display a tooltip near cursor while drawing](http://Leaflet.github.io/Leaflet.Editable/example/tooltip-when-drawing.html)
- [Basic demo of undo/redo](http://Leaflet.github.io/Leaflet.Editable/example/undo-redo.html) (Use ctrl-Z to undo and ctrl-shift-Z to redo)
- [Deleting shapes by ctrl/command clicking on it](http://Leaflet.github.io/Leaflet.Editable/example/delete-shape.html)
- [Multipolygon example](http://Leaflet.github.io/Leaflet.Editable/example/multipolygon.html)
- Example of [Leaflet.Snap](https://github.com/makinacorpus/Leaflet.Snap/) integration [to enable snapping](http://Leaflet.github.io/Leaflet.Editable/example/snapping.html)


## API

[See the reference](http://Leaflet.github.io/Leaflet.Editable/doc/api.html)


## Licence

`Leaflet.Editable` is released under the WTFPL licence.
