#! /usr/bin/env node
const { clean } = require('../src/main/index.js');
const R = require('ramda');
const yargs = require('yargs');
yargs
  .command('clean', 'clean', v => {
    const { directory } = v.argv;
    clean({ directory });
  })
  .example('$0 clean', '')
  .help()
  .alias('help', 'h')
  .alias('d', 'directory').argv;
