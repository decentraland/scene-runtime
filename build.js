#!/usr/bin/env node
const { build, cliopts } = require('estrella')
const path = require('path')

const commonOptions = {
  bundle: true,
  treeShaking: true,
  inject: ['src/web-worker-inject.js']
}

build({
  ...commonOptions,
  minify: false,
  debug: true,
  sourcemap: 'inline',
  sourcesContent: true,
  entry: 'src/index-webworker.ts',
  outfile: 'dist/webworker.dev.js',
  tsconfig: 'tsconfig.json'
})

build({
  ...commonOptions,
  minify: true,
  entry: 'src/index-webworker.ts',
  outfile: 'dist/webworker.js',
  tsconfig: 'tsconfig.json',
})

// Run a local web server with livereload when -watch is set
cliopts.watch