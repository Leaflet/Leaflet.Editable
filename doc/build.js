#!/usr/bin/env node
var Leafdoc = require('leafdoc'),
    fs = require('fs'),
    path = require('path');

var doc = new Leafdoc({
    templateDir: './doc/leafdoc/',
    showInheritancesWhenEmpty: true
});
doc.addFile('./doc/index.leafdoc', false);
doc.addFile('./src/Leaflet.Editable.js', true);
fs.writeFileSync('./doc/api.html', doc.outputStr());
