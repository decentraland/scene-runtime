ifneq ($(CI), true)
LOCAL_ARG = --local --verbose --diagnostics
endif

test:
	node --enable-source-maps node_modules/.bin/jest --coverage --colors --runInBand $(TESTARGS)

test-watch:
	node --enable-source-maps node_modules/.bin/jest --colors --runInBand --watchAll $(TESTARGS)

build:
	rm -rf dist || true
	node ./build.js
	node_modules/.bin/tsc --project tsconfig.node.json

.PHONY: build test test-watch