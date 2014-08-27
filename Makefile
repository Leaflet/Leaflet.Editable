node_modules:
	npm install

test: node_modules
	@./node_modules/mocha-phantomjs/bin/mocha-phantomjs --view 1024x768 test/index.html

test-fx:
	firefox test/index.html

.PHONY: test test-fx
