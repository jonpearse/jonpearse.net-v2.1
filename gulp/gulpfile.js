/*********************************************************************************************************************
 *
 * Main gulpfile
 *
 *********************************************************************************************************************/

// initial load
const gulp  = require( 'gulp' );
const notify = require( 'gulp-notify' );

// load paths + expose them globally
global.PATHS = require( './paths' );
const PATHS  = global.PATHS;

// load utilities
const utils = require( './utils' );
require( './build' );

/**
 * Define a global error handler.
 */
global.errorHandler = function( err )
{
  notify.onError({
    title: 'Error!',
    message: "<%= err.message %> - <%= err.fileName %>:<% err.lineNumber %>"
  });
  
  this.emit( 'end' );
}

/**
 * Init task.
 */
gulp.task( 'init', () => utils.forModules( 'init', utils.runTasks ));

/**
 * Watches assets for changes + builds things if anything happens
 */
gulp.task( 'watch', () => utils.forModules( 'watch', oWd => gulp.watch( oWd.files, gulp.parallel( oWd.tasks ))));

/**
 * Runs any linting tasks defined.
 */
gulp.task( 'lint', () => utils.forModules( 'lint', utils.runTasks ));

/**
 * Quickstart task: alias for watch.
 */
gulp.task( 'qs', gulp.series( 'watch' ));

/**
 * Default task: cleans things out, builds everything, and runs the watch task.
 */
gulp.task( 'default', gulp.series( 'clean', 'init', 'watch' ));