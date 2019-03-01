/*********************************************************************************************************************
 *
 * Icon tasks.
 *
 *********************************************************************************************************************/

const gulp     = require( 'gulp' );
const plumber  = require( 'gulp-plumber' );
const rename   = require( 'gulp-rename' );
const svgstore = require( 'gulp-svgstore' );
const svgmin   = require( 'gulp-svgmin' );

const { readdirSync, statSync } = require('fs')
const { join } = require('path')

// core stuff
const PATHS  = global.PATHS.icons;
const OUTPUT = global.PATHS.build;
const { errorHandler, streamToPromise } = require( '../utils/utils' );

/**
 * Actual build task.
 */
gulp.task( 'icons', () =>
{
  // 1. get a list of subdirectories
  return Promise.all( readdirSync( PATHS.base ).filter( sF => statSync( `${PATHS.base}/${sF}` ).isDirectory()).map( sDir =>
  {
      return gulp.src( `${PATHS.base}/${sDir}/**/*.svg` )
                .pipe( plumber({ errorHandler }))
                .pipe( rename({ prefix: 'icon-' }))
                .pipe( svgstore() )
                .pipe( svgmin({
                  plugins: [
                    { removeDoctype: true },
                    { cleanupIDs: false },
                    { removeStyleElement: true },
                    { removeTitle: true },
                    { removeAttrs: { attrs: [ 'style', 'stroke.*', 'class' ]}}
                  ]
                }))
                .pipe( rename( `icons-${sDir}.svg` ))
                .pipe( gulp.dest( OUTPUT ));
  }).map( streamToPromise ));
});

/** Expose things */
module.exports = {
  init: [ '!icons' ],
  watch: {
    files: PATHS.watch,
    tasks: [ 'icons' ]
  },
  build: [ '!icons' ]
}
