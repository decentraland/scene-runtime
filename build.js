#!/usr/bin/env node
const { build, cliopts } = require('estrella')
const path = require('path')

const commonOptions = {
  bundle: true,
  minify: !cliopts.watch,
  sourcemap: cliopts.watch ? 'both' : undefined,
  sourcesContent: !!cliopts.watch,
  treeShaking: true,
  plugins: []
}

function createWorker(entry, outfile) {
  return build({
    ...commonOptions,
    entry,
    outfile,
    tsconfig: 'tsconfig.json',
  })
}

createWorker('src/index-webworker.ts', 'dist/webworker.js')

// Run a local web server with livereload when -watch is set
cliopts.watch && require('./scripts/runTestServer')