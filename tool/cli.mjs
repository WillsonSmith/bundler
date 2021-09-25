#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { build as builder, watch as watcher } from './build.mjs';

const argv = yargs(hideBin(process.argv)).argv;
const { source = 'src', target = 'dist', watch, build } = argv;

(() => {
  if (build) {
    console.log('Building...');
    builder(source, target);
    return;
  }
  if (watch) {
    console.log('Watching...');
    watcher(source, target);
    return;
  }
})();
