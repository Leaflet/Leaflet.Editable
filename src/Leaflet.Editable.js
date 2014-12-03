L.Editable = L.Evented.extend({

    statics: {
        FORWARD: 1,
        BACKWARD: -1
    },

    options: {
        zIndex: 1000,
        polygonClass: L.Polygon,
        polylineClass: L.Polyline,
        markerClass: L.Marker,
        drawingCSSClass: 'leaflet-editable-drawing'
    },

    initialize: function (map, options) {
        L.setOptions(this, options);
        this._lastZIndex = this.options.zIndex;
        this.map = map;
        this.editLayer = this.createEditLayer();
        this.featuresLayer = this.createFeaturesLayer();
        this.newClickHandler = this.createNewClickHandler();
        this.forwardLineGuide = this.createLineGuide();
        this.backwardLineGuide = this.createLineGuide();
    },

    fireAndForward: function (type, e) {
        e = e || {};
        e.editTools = this;
        this.fire(type, e);
        this.map.fire(type, e);
    },

    createLineGuide: function () {
        var options = L.extend({dashArray: '5,10', weight: 1}, this.options.lineGuideOptions);
        return L.polyline([], options);
    },

    createVertexIcon: function (options) {
        return L.Browser.touch ? new L.Editable.TouchVertexIcon(options) : new L.Editable.VertexIcon(options);
    },

    createNewClickHandler: function () {
        return L.marker(this.map.getCenter(), {
            icon: this.createVertexIcon({className: 'leaflet-div-icon leaflet-drawing-icon'}),
            opacity: 0,
            zIndexOffset: this._lastZIndex
        });
    },

    createEditLayer: function () {
        return this.options.editLayer || new L.LayerGroup().addTo(this.map);
    },

    createFeaturesLayer: function () {
        return this.options.featuresLayer || new L.LayerGroup().addTo(this.map);
    },

    moveForwardLineGuide: function (latlng) {
        if (this.forwardLineGuide._latlngs.length) {
            this.forwardLineGuide._latlngs[1] = latlng;
            this.forwardLineGuide.redraw();
        }
    },

    moveBackwardLineGuide: function (latlng) {
        if (this.backwardLineGuide._latlngs.length) {
            this.backwardLineGuide._latlngs[1] = latlng;
            this.backwardLineGuide.redraw();
        }
    },

    anchorForwardLineGuide: function (latlng) {
        this.forwardLineGuide._latlngs[0] = latlng;
        this.forwardLineGuide._bounds.extend(latlng);
        this.forwardLineGuide.redraw();
    },

    anchorBackwardLineGuide: function (latlng) {
        this.backwardLineGuide._latlngs[0] = latlng;
        this.backwardLineGuide._bounds.extend(latlng);
        this.backwardLineGuide.redraw();
    },

    attachForwardLineGuide: function () {
        this.editLayer.addLayer(this.forwardLineGuide);
    },

    attachBackwardLineGuide: function () {
        this.editLayer.addLayer(this.backwardLineGuide);
    },

    detachForwardLineGuide: function () {
        this.forwardLineGuide._latlngs = [];
        this.editLayer.removeLayer(this.forwardLineGuide);
    },

    detachBackwardLineGuide: function () {
        this.backwardLineGuide._latlngs = [];
        this.editLayer.removeLayer(this.backwardLineGuide);
    },

    updateNewClickHandlerZIndex: function () {
        this._lastZIndex += 2;
        this.newClickHandler.setZIndexOffset(this._lastZIndex);
    },

    registerForDrawing: function (editor) {
        this.map.on('mousemove touchmove', editor.onMouseMove, editor);
        if (this._drawingEditor) this.unregisterForDrawing(this._drawingEditor);
        this._drawingEditor = editor;
        this.editLayer.addLayer(this.newClickHandler);
        this.newClickHandler.on('click', editor.onNewClickHandlerClicked, editor);
        if (L.Browser.touch) this.map.on('click', editor.onTouch, editor);
        L.DomUtil.addClass(this.map._container, this.options.drawingCSSClass);
        this.updateNewClickHandlerZIndex();
    },

    unregisterForDrawing: function (editor) {
        editor = editor || this._drawingEditor;
        this.editLayer.removeLayer(this.newClickHandler);
        if (!editor) return;
        this.map.off('mousemove touchmove', editor.onMouseMove, editor);
        this.newClickHandler.off('click', editor.onNewClickHandlerClicked, editor);
        if (L.Browser.touch) this.map.off('click', editor.onTouch, editor);
        if (editor !== this._drawingEditor) return;
        delete this._drawingEditor;
        if (editor.drawing) editor.cancelDrawing();
        L.DomUtil.removeClass(this.map._container, this.options.drawingCSSClass);
    },

    stopDrawing: function () {
        this.unregisterForDrawing();
    },

    connectCreatedToMap: function (layer) {
        return this.featuresLayer.addLayer(layer);
    },

    startPolyline: function (latlng) {
        var line = this.createPolyline([]);
        this.connectCreatedToMap(line);
        line.enableEdit().newShape(latlng);
        return line;
    },

    startPolygon: function (latlng) {
        var polygon = this.createPolygon([]);
        this.connectCreatedToMap(polygon);
        polygon.enableEdit().newShape(latlng);
        return polygon;
    },

    startMarker: function (latlng) {
        latlng = latlng || this.map.getCenter();
        var marker = this.createMarker(latlng);
        this.connectCreatedToMap(marker);
        var editor = marker.enableEdit();
        editor.startDrawing();
        return marker;
    },

    startHole: function (editor, latlng) {
        editor.newHole(latlng);
    },

    extendMultiPolygon: function (multi) {
        var polygon = this.createPolygon([]);
        multi.addLayer(polygon);
        polygon.multi = multi;
        var editor = polygon.enableEdit();
        editor.startDrawingForward();
        return polygon;
    },

    createPolyline: function (latlngs) {
        var line = new this.options.polylineClass(latlngs, {editOptions: {editTools: this}});
        this.fireAndForward('editable:created', {layer: line});
        return line;
    },

    createPolygon: function (latlngs) {
        var polygon = new this.options.polygonClass(latlngs, {editOptions: {editTools: this}});
        this.fireAndForward('editable:created', {layer: polygon});
        return polygon;
    },

    createMarker: function (latlng) {
        var marker = new this.options.markerClass(latlng, {editOptions: {editTools: this}});
        this.fireAndForward('editable:created', {layer: marker});
        return marker;
    }

});

L.extend(L.Editable, {

    makeCancellable: function (e) {
        e.cancel = function () {
            e._cancelled = true;
        };
    }

});

L.Map.addInitHook(function () {

    this.whenReady(function () {
        if (this.options.editable) {
            this.editTools = new L.Editable(this, this.options.editOptions);
        }
    });

});

L.Editable.VertexIcon = L.DivIcon.extend({

    options: {
        iconSize: new L.Point(8, 8)
    }

});

L.Editable.TouchVertexIcon = L.Editable.VertexIcon.extend({

    options: {
        iconSize: new L.Point(20, 20)
    }

});


L.Editable.VertexMarker = L.Marker.extend({

    options: {
        draggable: true,
        className: 'leaflet-div-icon leaflet-vertex-icon'
    },

    initialize: function (latlng, latlngs, editor, options) {
        this.latlng = latlng;
        this.latlngs = latlngs;
        this.editor = editor;
        L.Marker.prototype.initialize.call(this, latlng, options);
        this.options.icon = this.editor.tools.createVertexIcon({className: this.options.className});
        this.latlng.__vertex = this;
        this.editor.editLayer.addLayer(this);
        this.setZIndexOffset(editor.tools._lastZIndex + 1);
    },

    onAdd: function (map) {
        L.Marker.prototype.onAdd.call(this, map);
        this.on('drag', this.onDrag);
        this.on('dragstart', this.onDragStart);
        this.on('dragend', this.onDragEnd);
        this.on('click', this.onClick);
        this.on('contextmenu', this.onContextMenu);
        this.on('mousedown touchstart', this.onMouseDown);
        this.addMiddleMarkers();
    },

    onRemove: function (map) {
        if (this.middleMarker) this.middleMarker.delete();
        delete this.latlng.__vertex;
        this.off('drag', this.onDrag);
        this.off('dragstart', this.onDragStart);
        this.off('dragend', this.onDragEnd);
        this.off('click', this.onClick);
        this.off('contextmenu', this.onContextMenu);
        this.off('mousedown touchstart', this.onMouseDown);
        L.Marker.prototype.onRemove.call(this, map);
    },

    onDrag: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerDrag(e);
        var iconPos = L.DomUtil.getPosition(this._icon),
            latlng = this._map.layerPointToLatLng(iconPos);
        this.latlng.lat = latlng.lat;
        this.latlng.lng = latlng.lng;
        this.editor.refresh();
        if (this.middleMarker) {
            this.middleMarker.updateLatLng();
        }
        var next = this.getNext();
        if (next && next.middleMarker) {
            next.middleMarker.updateLatLng();
        }
    },

    onDragStart: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerDragStart(e);
    },

    onDragEnd: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerDragEnd(e);
    },

    onClick: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerClick(e);
    },

    onContextMenu: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerContextMenu(e);
    },

    onMouseDown: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerMouseDown(e);
    },

    delete: function () {
        var next = this.getNext();  // Compute before changing latlng
        this.latlngs.splice(this.latlngs.indexOf(this.latlng), 1);
        this.editor.editLayer.removeLayer(this);
        this.editor.onVertexDeleted({latlng: this.latlng, vertex: this});
        if (!this.latlngs.length) this.editor.deleteShape(this.latlngs);
        if (next) next.resetMiddleMarker();
    },

    getIndex: function () {
        return this.latlngs.indexOf(this.latlng);
    },

    getLastIndex: function () {
        return this.latlngs.length - 1;
    },

    getPrevious: function () {
        if (this.latlngs.length < 2) return;
        var index = this.getIndex(),
            previousIndex = index - 1;
        if (index === 0 && this.editor.CLOSED) previousIndex = this.getLastIndex();
        var previous = this.latlngs[previousIndex];
        if (previous) return previous.__vertex;
    },

    getNext: function () {
        if (this.latlngs.length < 2) return;
        var index = this.getIndex(),
            nextIndex = index + 1;
        if (index === this.getLastIndex() && this.editor.CLOSED) nextIndex = 0;
        var next = this.latlngs[nextIndex];
        if (next) return next.__vertex;
    },

    addMiddleMarker: function (previous) {
        previous = previous || this.getPrevious();
        if (previous && !this.middleMarker) this.middleMarker = this.editor.addMiddleMarker(previous, this, this.latlngs, this.editor);
    },

    addMiddleMarkers: function () {
        if (this.editor.tools.options.skipMiddleMarkers) return;
        var previous = this.getPrevious();
        if (previous) {
            this.addMiddleMarker(previous);
        }
        var next = this.getNext();
        if (next) {
            next.resetMiddleMarker();
        }
    },

    resetMiddleMarker: function () {
        if (this.middleMarker) this.middleMarker.delete();
        this.addMiddleMarker();
    },

    _initInteraction: function () {
        L.Marker.prototype._initInteraction.call(this);
        L.DomEvent.on(this._icon, 'touchstart', function (e) {this._fireMouseEvent(e);}, this);
    }

});

L.Editable.mergeOptions({
    vertexMarkerClass: L.Editable.VertexMarker
});

L.Editable.MiddleMarker = L.Marker.extend({

    options: {
        opacity: 0.5,
        className: 'leaflet-div-icon leaflet-middle-icon'
    },

    initialize: function (left, right, latlngs, editor, options) {
        this.left = left;
        this.right = right;
        this.editor = editor;
        this.latlngs = latlngs;
        L.Marker.prototype.initialize.call(this, this.computeLatLng(), options);
        this._opacity = this.options.opacity;
        this.options.icon = this.editor.tools.createVertexIcon({className: this.options.className});
        this.editor.editLayer.addLayer(this);
        this.setVisibility();
    },

    setVisibility: function () {
        var leftPoint = this._map.latLngToContainerPoint(this.left.latlng),
            rightPoint = this._map.latLngToContainerPoint(this.right.latlng),
            size = L.point(this.options.icon.options.iconSize);
        if (leftPoint.distanceTo(rightPoint) < size.x * 3) {
            this.hide();
        } else {
            this.show();
        }
    },

    show: function () {
        this.setOpacity(this._opacity);
    },

    hide: function () {
        this.setOpacity(0);
    },

    updateLatLng: function () {
        this.setLatLng(this.computeLatLng());
        this.setVisibility();
    },

    computeLatLng: function () {
        var leftPoint = this.editor.map.latLngToContainerPoint(this.left.latlng),
            rightPoint = this.editor.map.latLngToContainerPoint(this.right.latlng),
            y = (leftPoint.y + rightPoint.y) / 2,
            x = (leftPoint.x + rightPoint.x) / 2;
        return this.editor.map.containerPointToLatLng([x, y]);
    },

    onAdd: function (map) {
        L.Marker.prototype.onAdd.call(this, map);
        this.on('mousedown touchstart', this.onMouseDown);
        map.on('zoomend', this.setVisibility, this);
    },

    onRemove: function (map) {
        delete this.right.middleMarker;
        this.off('mousedown touchstart', this.onMouseDown);
        map.off('zoomend', this.setVisibility, this);
        L.Marker.prototype.onRemove.call(this, map);
    },

    onMouseDown: function (e) {
        L.Editable.makeCancellable(e);
        this.editor.onMiddleMarkerMouseDown(e);
        if (e._cancelled) return;
        this.latlngs.splice(this.index(), 0, e.latlng);
        this.editor.refresh();
        var marker = this.editor.addVertexMarker(e.latlng, this.latlngs);
        marker.dragging._draggable._onDown(e.originalEvent);  // Transfer ongoing dragging to real marker
        this.delete();
    },

    delete: function () {
        this.editor.editLayer.removeLayer(this);
    },

    index: function () {
        return this.latlngs.indexOf(this.right.latlng);
    },

    _initInteraction: function () {
        L.Marker.prototype._initInteraction.call(this);
        L.DomEvent.on(this._icon, 'touchstart', function (e) {this._fireMouseEvent(e);}, this);
    }

});

L.Editable.mergeOptions({
    middleMarkerClass: L.Editable.MiddleMarker
});

L.Editable.BaseEditor = L.Class.extend({

    initialize: function (map, feature, options) {
        L.setOptions(this, options);
        this.map = map;
        this.feature = feature;
        this.feature.editor = this;
        this.editLayer = new L.LayerGroup();
        this.tools = this.options.editTools || map.editTools;
    },

    enable: function () {
        if (this._enabled) return this;
        this.tools.editLayer.addLayer(this.editLayer);
        this.onEnable();
        this._enabled = true;
        this.feature.on('remove', this.disable, this);
        return this;
    },

    disable: function () {
        this.feature.off('remove', this.disable, this);
        this.editLayer.clearLayers();
        this.tools.editLayer.removeLayer(this.editLayer);
        this.onDisable();
        delete this._enabled;
        if (this.drawing) this.cancelDrawing();
        return this;
    },

    fireAndForward: function (type, e) {
        e = e || {};
        e.layer = this.feature;
        this.feature.fire(type, e);
        if (this.feature.multi) this.feature.multi.fire(type, e);
        this.tools.fireAndForward(type, e);
    },

    onEnable: function () {
        this.fireAndForward('editable:enable');
    },

    onDisable: function () {
        this.fireAndForward('editable:disable');
    },

    onEditing: function () {
        this.fireAndForward('editable:editing');
    },

    onStartDrawing: function () {
        this.fireAndForward('editable:drawing:start');
    },

    onEndDrawing: function () {
        this.fireAndForward('editable:drawing:end');
    },

    onCancelDrawing: function () {
        this.fireAndForward('editable:drawing:cancel');
    },

    onCommitDrawing: function () {
        this.fireAndForward('editable:drawing:commit');
    },

    startDrawing: function () {
        if (!this.drawing) this.drawing = L.Editable.FORWARD;
        this.tools.registerForDrawing(this);
        this.onStartDrawing();
    },

    commitDrawing: function () {
        this.onCommitDrawing();
        this.endDrawing();
    },

    cancelDrawing: function () {
        this.onCancelDrawing();
        this.endDrawing();
    },

    endDrawing: function () {
        this.drawing = false;
        this.tools.unregisterForDrawing(this);
        this.onEndDrawing();
    },

    onMouseMove: function (e) {
        if (this.drawing) {
            this.tools.newClickHandler.setLatLng(e.latlng);
        }
    },

    onTouch: function (e) {
        this.onMouseMove(e);
        if (this.drawing) this.tools.newClickHandler._fireMouseEvent(e);
    },

    onNewClickHandlerClicked: function (e) {
        L.Editable.makeCancellable(e);
        this.fireAndForward('editable:drawing:click', e);
        if (e._cancelled) return;
        this.processClickHandlerClicked(e);
    }

});

L.Editable.MarkerEditor = L.Editable.BaseEditor.extend({

    enable: function () {
        if (this._enabled) return this;
        L.Editable.BaseEditor.prototype.enable.call(this);
        this.feature.dragging.enable();
        this.feature.on('dragstart', this.onEditing, this);
        return this;
    },

    disable: function () {
        L.Editable.BaseEditor.prototype.disable.call(this);
        this.feature.dragging.disable();
        this.feature.off('dragstart', this.onEditing, this);
        return this;
    },

    onMouseMove: function (e) {
        if (this.drawing) {
            L.Editable.BaseEditor.prototype.onMouseMove.call(this, e);
            this.feature.setLatLng(e.latlng);
            this.tools.newClickHandler._bringToFront();
        }
    },

    processClickHandlerClicked: function (e) {
        this.fireAndForward('editable:drawing:clicked', e);
        this.commitDrawing();
    }

});

L.Editable.PathEditor = L.Editable.BaseEditor.extend({

    CLOSED: false,
    MIN_VERTEX: 2,

    enable: function () {
        if (this._enabled) return this;
        L.Editable.BaseEditor.prototype.enable.call(this);
        if (this.feature) {
            this.initVertexMarkers();
        }
        return this;
    },

    disable: function () {
        return L.Editable.BaseEditor.prototype.disable.call(this);
    },

    initVertexMarkers: function (latlngs) {
        latlngs = latlngs || this.getLatLngs();
        if (this.feature._flat(latlngs)) {
            this.addVertexMarkers(latlngs);
        } else {
            for (var i = 0; i < latlngs.length; i++) {
                this.initVertexMarkers(latlngs[i]);
            }
        }
    },

    getLatLngs: function () {
        return this.feature.getLatLngs();
    },

    reset: function () {
        this.editLayer.clearLayers();
        this.initVertexMarkers();
    },

    addVertexMarker: function (latlng, latlngs) {
        return new this.tools.options.vertexMarkerClass(latlng, latlngs, this);
    },

    addVertexMarkers: function (latlngs) {
        for (var i = 0; i < latlngs.length; i++) {
            this.addVertexMarker(latlngs[i], latlngs);
        }
    },

    addMiddleMarker: function (left, right, latlngs) {
        return new this.tools.options.middleMarkerClass(left, right, latlngs, this);
    },

    onVertexMarkerClick: function (e) {
        L.Editable.makeCancellable(e);
        this.fireAndForward('editable:vertex:click', e);
        if (e._cancelled) return;
        var index = e.vertex.getIndex(), commit;
        if (e.originalEvent.ctrlKey) {
            this.onVertexMarkerCtrlClick(e);
        } else if (e.originalEvent.altKey) {
            this.onVertexMarkerAltClick(e);
        } else if (e.originalEvent.shiftKey) {
            this.onVertexMarkerShiftClick(e);
        } else if (index >= 1 && index === e.vertex.getLastIndex() && this.drawing === L.Editable.FORWARD) {
            commit = true;
        } else if (index === 0 && this.drawing === L.Editable.BACKWARD && this._drawnLatLngs.length >= this.MIN_VERTEX) {
            commit = true;
        } else if (index === 0 && this.drawing === L.Editable.FORWARD && this._drawnLatLngs.length >= this.MIN_VERTEX && this.CLOSED) {
            commit = true;  // Allow to close on first point also for polygons
        } else {
            this.onVertexRawMarkerClick(e);
        }
        this.fireAndForward('editable:vertex:clicked', e);
        if (commit) this.commitDrawing();
    },

    onVertexRawMarkerClick: function (e) {
        if (!this.vertexCanBeDeleted(e.vertex)) return;
        e.vertex.delete();
        this.refresh();
    },

    vertexCanBeDeleted: function (vertex) {
        return vertex.latlngs.length > this.MIN_VERTEX;
    },

    onVertexDeleted: function (e) {
        this.fireAndForward('editable:vertex:deleted', e);
    },

    onVertexMarkerCtrlClick: function (e) {
        this.fireAndForward('editable:vertex:ctrlclick', e);
    },

    onVertexMarkerShiftClick: function (e) {
        this.fireAndForward('editable:vertex:shiftclick', e);
    },

    onVertexMarkerAltClick: function (e) {
        this.fireAndForward('editable:vertex:altclick', e);
    },

    onVertexMarkerContextMenu: function (e) {
        this.fireAndForward('editable:vertex:contextmenu', e);
    },

    onVertexMarkerMouseDown: function (e) {
        this.fireAndForward('editable:vertex:mousedown', e);
    },

    onMiddleMarkerMouseDown: function (e) {
        this.fireAndForward('editable:middlemarker:mousedown', e);
    },

    onVertexMarkerDrag: function (e) {
        this.fireAndForward('editable:vertex:drag', e);
    },

    onVertexMarkerDragStart: function (e) {
        this.fireAndForward('editable:vertex:dragstart', e);
    },

    onVertexMarkerDragEnd: function (e) {
        this.fireAndForward('editable:vertex:dragend', e);
    },

    setDrawnLatLngs: function (latlngs) {
        this._drawnLatLngs = latlngs || this.getDefaultLatLngs();
    },

    startDrawing: function () {
        if (!this._drawnLatLngs) this.setDrawnLatLngs();
        L.Editable.BaseEditor.prototype.startDrawing.call(this);
    },

    startDrawingForward: function () {
        this.startDrawing();
        this.tools.attachForwardLineGuide();
    },

    endDrawing: function () {
        L.Editable.BaseEditor.prototype.endDrawing.call(this);
        this.tools.detachForwardLineGuide();
        this.tools.detachBackwardLineGuide();
        delete this._drawnLatLngs;
    },

    addLatLng: function (latlng) {
        if (this.drawing === L.Editable.FORWARD) this._drawnLatLngs.push(latlng);
        else this._drawnLatLngs.unshift(latlng);
        this.feature._bounds.extend(latlng);
        this.refresh();
        this.addVertexMarker(latlng, this._drawnLatLngs);
    },

    newPointForward: function (latlng) {
        this.addLatLng(latlng);
        this.tools.anchorForwardLineGuide(latlng);
        if (!this.tools.backwardLineGuide._latlngs[0]) {
            this.tools.anchorBackwardLineGuide(latlng);
        }
    },

    newPointBackward: function (latlng) {
        this.addLatLng(latlng);
        this.tools.anchorBackwardLineGuide(latlng);
    },

    push: function (latlng) {
        if (!latlng) return console.error('L.Editable.PathEditor.push expect a vaild latlng as parameter');
        if (this.drawing === L.Editable.FORWARD) this.newPointForward(latlng);
        else this.newPointBackward(latlng);
    },

    removeLatLng: function (latlng) {
        latlng.__vertex.delete();
        this.refresh();
    },

    pop: function () {
        if (this._drawnLatLngs.length <= 1) return;
        var latlng;
        if (this.drawing === L.Editable.FORWARD) latlng = this._drawnLatLngs[this._drawnLatLngs.length - 1];
        else latlng = this._drawnLatLngs[0];
        this.removeLatLng(latlng);
        if (this.drawing === L.Editable.FORWARD) this.tools.anchorForwardLineGuide(this._drawnLatLngs[this._drawnLatLngs.length - 1]);
        else this.tools.anchorForwardLineGuide(this._drawnLatLngs[0]);
        return latlng;
    },

    processClickHandlerClicked: function (e) {
        if (this.drawing === L.Editable.FORWARD) this.newPointForward(e.latlng);
        else this.newPointBackward(e.latlng);
        this.fireAndForward('editable:drawing:clicked', e);
    },

    onMouseMove: function (e) {
        if (this.drawing) {
            L.Editable.BaseEditor.prototype.onMouseMove.call(this, e);
            this.tools.moveForwardLineGuide(e.latlng);
            this.tools.moveBackwardLineGuide(e.latlng);
        }
    },

    refresh: function () {
        this.feature.redraw();
        this.onEditing();
    },

    newShape: function (latlng) {
        var shape = this.addNewEmptyShape();
        if (!shape) return;
        this.setDrawnLatLngs(shape);
        this.startDrawingForward();
        this.fireAndForward('editable:shape:new', {shape: shape});
        if (latlng) this.newPointForward(latlng);
    },

    deleteShape: function (shape, latlngs) {
        latlngs = latlngs || this.getLatLngs();
        if (this.feature._flat(latlngs) || !latlngs.length) return;
        for (var i = 0; i < latlngs.length; i++) {
            if (latlngs[i] === shape) return latlngs.splice(latlngs.indexOf(shape), 1);
            else this.deleteShape(shape, latlngs[i]);
        }
    }

});

L.Editable.PolylineEditor = L.Editable.PathEditor.extend({

    startDrawingBackward: function (latlngs) {
        this.drawing = L.Editable.BACKWARD;
        this.startDrawing(latlngs);
        this.tools.attachBackwardLineGuide();
    },

    continueBackward: function (latlngs) {
        latlngs = latlngs || this.getDefaultLatLngs();
        this.setDrawnLatLngs(latlngs);
        this.tools.anchorBackwardLineGuide(latlngs[0]);
        this.startDrawingBackward();
    },

    continueForward: function (latlngs) {
        latlngs = latlngs || this.getDefaultLatLngs();
        this.setDrawnLatLngs(latlngs);
        this.tools.anchorForwardLineGuide(latlngs[latlngs.length - 1]);
        this.startDrawingForward();
    },

    getDefaultLatLngs: function (latlngs) {
        latlngs = latlngs || this.feature._latlngs;
        if (!latlngs.length || latlngs[0] instanceof L.LatLng) return latlngs;
        else return this.getDefaultLatLngs(latlngs[0]);
    },

    ensureMulti: function () {
        if (this.feature._latlngs.length && this.feature._flat(this.feature._latlngs)) {
            this.feature._latlngs = [this.feature._latlngs];
        }
    },

    addNewEmptyShape: function () {
        if (this.feature._latlngs.length) {
            var shape = [];
            this.ensureMulti();
            this.feature._latlngs.push(shape);
            return shape;
        } else {
            return this.feature._latlngs;
        }
    }

});

L.Editable.PolygonEditor = L.Editable.PathEditor.extend({

    CLOSED: true,
    MIN_VERTEX: 3,

    startDrawingForward: function () {
        L.Editable.PathEditor.prototype.startDrawingForward.call(this);
        this.tools.attachBackwardLineGuide();
    },

    addNewEmptyHole: function (latlng) {
        this.ensureNotFlat();
        var latlngs = this.feature.polygonFromLatLng(latlng);
        if (!latlngs) return;
        var holes = [];
        latlngs.push(holes);
        return holes;
    },

    newHole: function (latlng) {
        var holes = this.addNewEmptyHole(latlng);
        if (!holes) return;
        this.setDrawnLatLngs(holes);
        this.startDrawingForward();
        if (latlng) this.newPointForward(latlng);
    },

    addNewEmptyShape: function () {
        if (this.feature._latlngs.length) {
            var shape = [];
            this.ensureMulti();
            this.feature._latlngs.push([shape]);
            return shape;
        } else {
            return this.feature._latlngs;
        }
    },

    ensureMulti: function () {
        if (this.feature._latlngs.length && this.feature._flat(this.feature._latlngs[0])) {
            this.feature._latlngs = [[this.feature._latlngs]];
        }
    },

    ensureNotFlat: function () {
        if (this.feature._latlngs.length && this.feature._flat(this.feature._latlngs)) {
            this.feature._latlngs = [this.feature._latlngs];
        }
    },

    vertexCanBeDeleted: function (vertex) {
        if (vertex.latlngs === this.getLatLngs()) return L.Editable.PathEditor.prototype.vertexCanBeDeleted.call(this, vertex);
        else return true;  // Holes can be totally deleted without removing the layer itself
    },

    getDefaultLatLngs: function () {
        if (!this.feature._latlngs.length) this.feature._latlngs.push([]);
        return this.feature._latlngs[0];
    }

});


var EditableMixin = {

    createEditor: function (map) {
        map = map || this._map;
        var Klass = this.options.editorClass || this.getEditorClass(map);
        return new Klass(map, this, this.options.editOptions);
    },

    enableEdit: function () {
        if (!this.editor) this.createEditor();
        if (this.multi) this.multi.onEditEnabled();
        return this.editor.enable();
    },

    editEnabled: function () {
        return this.editor && this.editor._enabled;
    },

    disableEdit: function () {
        if (this.editor) {
            if (this.multi) this.multi.onEditDisabled();
            this.editor.disable();
            delete this.editor;
        }
    },

    toggleEdit: function () {
      if (this.editEnabled()) {
        this.disableEdit();
      } else {
        this.enableEdit();
      }
    }

};

L.Polyline.include(EditableMixin);
L.Polygon.include(EditableMixin);
L.Marker.include(EditableMixin);

L.Polyline.include({

    getEditorClass: function (map) {
        return (map && map.options.polylineEditorClass) ? map.options.polylineEditorClass : L.Editable.PolylineEditor;
    }

});

L.Polygon.include({

    getEditorClass: function (map) {
        return (map && map.options.polygonEditorClass) ? map.options.polygonEditorClass : L.Editable.PolygonEditor;
    },

    polygonFromLatLng: function (latlng, latlngs) {
        // So we can have those cases:
        // - latlngs are just a flat array of latlngs, use this
        // - latlngs is an array of arrays of latlngs, this is a simple polygon (maybe with holes), use the first
        // - latlngs is an array of arrays of arrays, this is a multi, loop over
        var polygon = null;
        latlngs = latlngs || this._latlngs;
        if (!latlngs.length) return polygon;
        else if (this._flat(latlngs) && L.Polygon.isInLatLngs(latlng, latlngs)) polygon = latlngs;
        else if (this._flat(latlngs[0]) && L.Polygon.isInLatLngs(latlng, latlngs[0])) polygon = latlngs;
        else for (var i = 0; i < latlngs.length; i++) if (L.Polygon.isInLatLngs(latlng, latlngs[i][0])) return latlngs[i];
        return polygon;
    }

});

L.Marker.include({

    getEditorClass: function (map) {
        return (map && map.options.markerEditorClass) ? map.options.markerEditorClass : L.Editable.MarkerEditor;
    }

});

L.extend(L.Polygon, {

    isInLatLngs: function (l, latlngs) {
        var inside = false, l1, l2, j, k, len2;

        for (j = 0, len2 = latlngs.length, k = len2 - 1; j < len2; k = j++) {
            l1 = latlngs[j];
            l2 = latlngs[k];

            if (((l1.lat > l.lat) !== (l2.lat > l.lat)) &&
                    (l.lng < (l2.lng - l1.lng) * (l.lat - l1.lat) / (l2.lat - l1.lat) + l1.lng)) {
                inside = !inside;
            }
        }

        return inside;
    }

});
