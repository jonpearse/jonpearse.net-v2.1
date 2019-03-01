/*********************************************************************************************************************
 *
 * Main gulpfile
 *
 *********************************************************************************************************************/

// initial load
const gulp  = require( 'gulp' );

// load paths + expose them globally
global.PATHS = require( './paths' );
const PATHS  = global.PATHS;

// load utilities
const { forModules } = require( './utils/tasks.js' );
const { streamToPromise } = require( './utils/utils' );
require( './utils/build' );

/**
 * Init task.
 */
gulp.task( 'init', () => forModules( 'init' ));

/**
 * Watches assets for changes + builds things if anything happens
 */
gulp.task( 'watch', () => forModules( 'watch', oWd => streamToPromise( gulp.watch( oWd.files, gulp.parallel( oWd.tasks )))));

/**
 * Runs any linting tasks defined.
 */
gulp.task( 'lint', () => forModules( 'lint' ));

/**
 * Quickstart task: alias for watch.
 */
gulp.task( 'qs', gulp.series( 'watch' ));

/**
 * Default task: cleans things out, builds everything, and runs the watch task.
 */
gulp.task( 'default', gulp.series( 'clean', 'init', 'watch' ));
