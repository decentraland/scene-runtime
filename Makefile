
build:
	node ./build.js

test: build
	echo 1

.PHONY: build test