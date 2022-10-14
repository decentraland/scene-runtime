#!/usr/bin/env node
const { build, cliopts } = require('estrella')
const path = require('path')

const commonOptions = {
  bundle: true,
  treeShaking: true,
  inject: ['src/worker/web-worker-inject.js']
}

build({
  ...commonOptions,
  minify: false,
  debug: true,
  sourcemap: 'inline',
  sourcesContent: true,
  entry: 'src/worker/index-webworker.ts',
  outfile: 'dist/webworker.dev.js',
  tsconfig: 'tsconfig.json'
})

build({
  ...commonOptions,
  minify: true,
  entry: 'src/worker/index-webworker.ts',
  outfile: 'dist/webworker.js',
  tsconfig: 'tsconfig.json',
})

// Run a local web server with livereload when -watch is set
cliopts.watch