#!/usr/bin/env node
const { build, cliopts } = require('estrella')
const path = require('path')

const commonOptions = {
  bundle: true,
  treeShaking: true,
  inject: ['src/common/web-worker-inject.js']
}

build({
  ...commonOptions,
  minify: false,
  debug: true,
  sourcemap: 'inline',
  sourcesContent: true,
  entry: 'src/worker-sdk6/index.ts',
  outfile: 'dist/sdk6-webworker.dev.js',
  tsconfig: 'tsconfig.json'
})

build({
  ...commonOptions,
  minify: true,
  entry: 'src/worker-sdk6/index.ts',
  outfile: 'dist/sdk6-webworker.js',
  tsconfig: 'tsconfig.json',
})


build({
  ...commonOptions,
  minify: false,
  debug: true,
  sourcemap: 'inline',
  sourcesContent: true,
  entry: 'src/worker-sdk7/index.ts',
  outfile: 'dist/sdk7-webworker.dev.js',
  tsconfig: 'tsconfig.json'
})

build({
  ...commonOptions,
  minify: true,
  entry: 'src/worker-sdk7/index.ts',
  outfile: 'dist/sdk7-webworker.js',
  tsconfig: 'tsconfig.json',
})

// Run a local web server with livereload when -watch is set
cliopts.watch