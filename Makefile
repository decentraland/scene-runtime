ifneq ($(CI), true)
LOCAL_ARG = --local --verbose --diagnostics
endif

test:
	node node_modules/.bin/jest --colors --runInBand $(TESTARGS)

test-watch:
	node_modules/.bin/jest --colors --runInBand --watch $(TESTARGS)

build:
	rm -rf dist || true
	node ./build.js
	node_modules/.bin/tsc --project tsconfig.node.json

.PHONY: build test test-watch