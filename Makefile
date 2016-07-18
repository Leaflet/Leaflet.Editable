node_modules:
	npm install

test: node_modules
	@./node_modules/phantomjs-prebuilt/bin/phantomjs node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js test/index.html dot '{"viewportSize":{"width": 1024,"height": 768}}'

test-fx:
	firefox test/index.html

builddoc:
	@./node_modules/.bin/leafdoc -t doc/leafdoc/ src/Leaflet.Editable.js -o doc/api.html

.PHONY: test test-fx
