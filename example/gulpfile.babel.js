'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSyncLib from 'browser-sync';
import pjson from './package.json';
import minimist from 'minimist';
import glob from 'glob';
const exec = require('child_process').exec;

// Load all gulp plugins based on their names
// EX: gulp-copy -> copy
const plugins = gulpLoadPlugins();

const defaultNotification = function(err) {
  return {
    subtitle: err.plugin,
    message: err.message,
    sound: 'Funk',
    onLast: true,
  };
};

let config = Object.assign({}, pjson.config, defaultNotification);

let args = minimist(process.argv.slice(2));
let dirs = config.directories;
let taskTarget = args.production ? dirs.destination : dirs.temporary;

// Create a new browserSync instance
let browserSync = browserSyncLib.create();

// This will grab all js in the `gulp` directory
// in order to load all gulp tasks
glob.sync('./gulp/**/*.js').filter(function(file) {
  return (/\.(js)$/i).test(file);
}).map(function(file) {
  require(file)(gulp, plugins, args, config, taskTarget, browserSync);
});

// Default task
gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

// Build production-ready code
gulp.task('build', [
  'cube',
  'copy',
  'imagemin',
  'sass',
  'browserify'
]);

// Server tasks with watch
gulp.task('serve', [
  'cube',
  'imagemin',
  'copy',
  'sass',
  'browserify',
  'browserSync',
  'watch'
]);

// Testing
gulp.task('test', ['eslint']);

// Pre compute the cube
gulp.task('cube', () => {
  exec('node cube/cubegen.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});
