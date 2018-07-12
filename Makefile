node_modules:
	npm install

test: node_modules
	@./node_modules/phantomjs-prebuilt/bin/phantomjs node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js test/index.html spec '{"viewportSize":{"width": 1024,"height": 768}}'

test-fx:
	firefox test/index.html

doc:
	@./doc/build.js

.PHONY: test test-fx doc
