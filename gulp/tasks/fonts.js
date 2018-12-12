/*********************************************************************************************************************
 *
 * Font tasks.
 *
 *********************************************************************************************************************/

const gulp     = require( 'gulp' );
const plumber  = require( 'gulp-plumber' );
const rename   = require( 'gulp-rename' );

// core stuff
const PATHS  = global.PATHS.fonts;
const OUTPUT = global.PATHS.build;
const { errorHandler } = require( '../utils/utils' );

/**
 * Actual build task.
 */
gulp.task( 'fonts', () =>
{
  return  gulp.src( PATHS.source )
              .pipe( plumber({ errorHandler }))
              .pipe( rename( oPath =>
              {

                  const sDir  = oPath.dirname.toLowerCase();
                  const sFont = oPath.basename.toLowerCase();

                  // if dir + font are different, prefix things
                  if (sDir !== sFont)
                  {
                    oPath.basename = `${oPath.dirname}-${oPath.basename}`;
                  }

                  // always unset the dirname
                  oPath.dirname = '';

              }))
              .pipe( gulp.dest( OUTPUT ));
});

/** Expose things */
module.exports = {
  init: [ 'fonts' ],
  watch: {
    files: PATHS.watch,
    tasks: [ 'fonts' ]
  },
  build: [ 'fonts' ]
}
