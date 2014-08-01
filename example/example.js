L.NewLineControl = L.Control.extend({

    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);

        link.href = '#';
        link.title = 'Create a new line';
        link.innerHTML = '/\\/';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', function () {
                    map.editable.startPolyline();
                  });

        return container;
    }
});

L.NewPolygonControl = L.Control.extend({

    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);

        link.href = '#';
        link.title = 'Create a new polygon';
        link.innerHTML = '▱';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', function () {
                    map.editable.startPolygon();
                  });

        return container;
    }
});

L.NewHoleControl = L.Control.extend({

    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);

        link.href = '#';
        link.title = 'Create a new hole';
        link.innerHTML = '▣';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', function () {
                    map.editable.startHole();
                  });

        var toggle = function (e) {
            if (e && e.editor && e.editor instanceof L.Editable.PolygonEditor) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        };
        toggle();

        map.on('editable:editorchanged', toggle);

        return container;
    }
});

L.NewMarkerControl = L.Control.extend({

    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);

        link.href = '#';
        link.title = 'Add a new marker';
        link.innerHTML = '⚫';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', function () {
                    map.editable.startMarker();
                  });

        return container;
    }
});

L.ExtendMultiControl = L.Control.extend({

    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);

        link.href = '#';
        link.title = 'Add a new polygon to multi';
        link.innerHTML = '⧉';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', function () {
                    map.editable.extendMultiPolygon();
                  });

        var toggle = function (e) {
            if (e && e.editor && e.editor.feature.multi) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        };
        toggle();

        map.on('editable:editorchanged', toggle);

        return container;
    }
});
